import axiosClient from './axiosClient';
import { endpoints } from './endpoints';
import { USE_MOCK_DATA } from '../utils/constants';
import * as mockApi from '../mocks/mockApi';

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
 * Tiny in-memory response cache.
 *
 * Trending and the genre list are requested on every visit to Home but change
 * at most once a day, so caching them removes two network round-trips per
 * navigation within a session. Paginated and query-based calls are deliberately
 * NOT cached: their keys would grow without bound and they change constantly.
 */
const cache = new Map();

async function cachedRequest(key, request) {
  if (cache.has(key)) return cache.get(key);
  const promise = request();
  cache.set(key, promise);
  // Do not cache failures — a transient error should not poison the session.
  promise.catch(() => cache.delete(key));
  return promise;
}

/** Discard cached responses (used by the "Try again" action after an error). */
export function clearResponseCache() {
  cache.clear();
}

/** GET /trending/movie/week */
export function getTrendingMovies({ page = 1, window = 'week', signal } = {}) {
  if (USE_MOCK_DATA) return mockApi.getTrending({ page, signal });

  return cachedRequest(`trending:${window}:${page}`, () =>
    axiosClient
      .get(endpoints.trending(window), { params: { page }, signal })
      .then((response) => response.data),
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

  return axiosClient
    .get(endpoints.discoverMovies(), {
      params: {
        page,
        sort_by: sortBy,
        include_adult: false,
        ...(genreId ? { with_genres: genreId } : {}),
        ...(year ? { primary_release_year: year } : {}),
        ...(minRating ? { 'vote_average.gte': minRating, 'vote_count.gte': 100 } : {}),
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

/** GET /genre/movie/list — cached for the session, it rarely changes. */
export function getGenres({ signal } = {}) {
  // Both branches must return the same thing: an array of genre objects.
  // The mock mirrors TMDb's raw envelope ({ genres: [...] }), so the unwrapping
  // happens here, in the service layer, for live and sample data alike —
  // otherwise the two branches return different shapes and every caller has to
  // guess which source it is talking to.
  if (USE_MOCK_DATA) return mockApi.getGenres({ signal }).then((data) => data.genres);

  return cachedRequest('genres', () =>
    axiosClient.get(endpoints.genres(), { params: { language: 'en-US' }, signal }).then((response) => response.data.genres),
  );
}
