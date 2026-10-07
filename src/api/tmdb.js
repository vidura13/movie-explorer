import axiosClient from './axiosClient';
import { endpoints } from './endpoints';
import { USE_MOCK_DATA } from '../utils/constants';
import * as mockApi from '../mocks/mockApi';
import { voteFloorFor } from '../utils/sorting';

/**
 * The single entry point the rest of the app uses to talk to TMDb.
 *
 * Every function here returns a promise resolving to TMDb's own response shape.
 * When no token is configured (or VITE_USE_MOCK is explicitly true) the calls
 * are served by src/mocks/mockApi.js instead, which returns the same shapes —
 * so no component ever needs to know which source is active.
 *
 * @see utils/constants.js  USE_MOCK_DATA
 */

/**
 * In-memory response cache.
 *
 * Trending and the genre list are requested on every visit to Home but change at
 * most once a day, so caching them removes two network round-trips per
 * navigation within a session. Paginated and query-based calls are deliberately
 * NOT cached: their keys would grow without bound and they change constantly.
 *
 * Two maps, and the distinction between them matters:
 *
 *   responseCache — completed responses, keyed by endpoint + params.
 *   inFlight      — requests in progress, so simultaneous callers share one.
 *
 * ---------------------------------------------------------------------------
 * Why resolved data is cached rather than the promise
 * ---------------------------------------------------------------------------
 * The first version of this file cached the *promise* returned by axios. That
 * promise was created with whichever AbortSignal the first caller passed in,
 * which caused a bug that is worth recording:
 *
 *   React StrictMode intentionally mounts, unmounts and remounts every effect in
 *   development. On mount that looks like:
 *
 *     1. effect runs      -> request starts, bound to signal A
 *     2. cleanup runs     -> signal A aborts, so the promise rejects
 *     3. effect runs again -> cache hit, and the cached promise is the one that
 *                             was just aborted. It can never resolve.
 *
 *   The result was a grid that stayed empty on first load and only populated
 *   once the user changed a filter (because filter requests go to
 *   /discover/movie, which is not cached). The genre list had the same defect,
 *   which is why its dropdown listed nothing but "All genres".
 *
 * The fix is twofold, and both halves are required:
 *
 *   - Cache the resolved value, not the promise, so a later caller gets data
 *     rather than another caller's cancellation.
 *   - Never pass a caller's signal into a request that may be shared. A shared
 *     request that any one participant can cancel is shared state with a race
 *     condition built in.
 *
 * Callers keep their AbortController — it still governs whether *their* render
 * consumes the result (see the `signal.aborted` guards in MovieContext and
 * useGenres) — it just no longer cancels work that other callers are waiting on.
 */
const responseCache = new Map();
const inFlight = new Map();

function cachedRequest(key, makeRequest) {
  if (responseCache.has(key)) return Promise.resolve(responseCache.get(key));
  if (inFlight.has(key)) return inFlight.get(key);

  const promise = makeRequest()
    .then((data) => {
      responseCache.set(key, data);
      inFlight.delete(key);
      return data;
    })
    .catch((error) => {
      // Failures are never cached: a transient error must not poison the
      // session, and the next caller should get a fresh attempt.
      inFlight.delete(key);
      throw error;
    });

  inFlight.set(key, promise);
  return promise;
}

/** Discard cached responses (used by the "Try again" action after an error). */
export function clearResponseCache() {
  responseCache.clear();
  inFlight.clear();
}

/**
 * GET /trending/movie/week
 *
 * Note: `signal` is accepted for API symmetry but deliberately not forwarded.
 * See the cache notes above — this response is shared, so one caller's
 * cancellation must not reject it for everyone. The caller decides whether to
 * use the result.
 */
export function getTrendingMovies({ page = 1, window = 'week', signal } = {}) {
  if (USE_MOCK_DATA) return mockApi.getTrending({ page, signal });

  return cachedRequest(`trending:${window}:${page}`, () =>
    axiosClient.get(endpoints.trending(window), { params: { page } }).then((response) => response.data),
  );
}

/**
 * GET /search/movie
 *
 * @param {object} params
 * @param {string} params.query - free text
 * @param {number} [params.page]
 * @param {number|string} [params.year] - mapped to primary_release_year
 */
export function searchMovies({ query, page = 1, year, signal } = {}) {
  if (USE_MOCK_DATA) return mockApi.searchMovies({ query, page, year, signal });

  return axiosClient
    .get(endpoints.searchMovies(), {
      params: {
        query,
        page,
        // Explicitly excluded rather than left to the server default, so the
        // result set is predictable.
        include_adult: false,
        ...(year ? { primary_release_year: year } : {}),
      },
      signal,
    })
    .then((response) => response.data);
}

/**
 * GET /discover/movie — filter-based browsing.
 *
 * `vote_count.gte` is pinned so that sorting by rating returns titles people
 * have actually voted on; without it, a film with a single 10/10 vote would
 * outrank The Godfather.
 */
export function discoverMovies({
  page = 1,
  genreId = null,
  year = null,
  minRating = null,
  sortBy = 'popularity.desc',
  signal,
} = {}) {
  if (USE_MOCK_DATA) return mockApi.discoverMovies({ page, genreId, year, minRating, sortBy, signal });

  // Sorting by rating needs a minimum vote count or the results are dominated
  // by titles with a single 10/10 vote. See utils/sorting.js.
  const voteCountFloor = Math.max(minRating ? 100 : 0, voteFloorFor(sortBy));

  return axiosClient
    .get(endpoints.discoverMovies(), {
      params: {
        page,
        sort_by: sortBy,
        include_adult: false,
        ...(genreId ? { with_genres: genreId } : {}),
        ...(year ? { primary_release_year: year } : {}),
        ...(minRating ? { 'vote_average.gte': minRating } : {}),
        ...(voteCountFloor ? { 'vote_count.gte': voteCountFloor } : {}),
      },
      signal,
    })
    .then((response) => response.data);
}

/**
 * GET /movie/{id}
 *
 * `append_to_response` folds credits, videos and recommendations into this one
 * request. Three separate calls would work, but they triple the latency and the
 * chance of a partial failure on the detail page.
 */
export function getMovieDetails({ id, signal } = {}) {
  if (USE_MOCK_DATA) return mockApi.getMovieDetails({ id, signal });

  return axiosClient
    .get(endpoints.movieDetails(id), {
      params: { append_to_response: 'credits,videos,recommendations' },
      signal,
    })
    .then((response) => response.data);
}

/**
 * GET /genre/movie/list — cached for the session, it rarely changes.
 *
 * Returns a plain array. Both branches normalise to the same shape: the mock
 * mirrors TMDb's raw `{ genres: [...] }` envelope, so the unwrapping happens
 * here in the service layer rather than in every caller.
 *
 * `signal` is deliberately not forwarded — see the cache notes above.
 */
export function getGenres({ signal } = {}) {
  if (USE_MOCK_DATA) return mockApi.getGenres({ signal }).then((data) => data.genres);

  return cachedRequest('genres', () =>
    axiosClient.get(endpoints.genres(), { params: { language: 'en-US' } }).then((response) => response.data.genres),
  );
}
