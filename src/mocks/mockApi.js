import { ApiError } from '../api/axiosClient';
import { GENRES, MOCK_MOVIES, genreName } from './mockData';
import { MAX_TMDB_PAGE } from '../utils/constants';
import { applySort, voteFloorFor } from '../utils/sorting';

/**
 * An in-memory stand-in for the TMDb API.
 *
 * Why this exists: the project must run before a TMDb token is available, and
 * it must run offline in tests. Rather than scattering `if (mock)` checks
 * through the UI, this module implements the same async surface as
 * src/api/tmdb.js and returns responses shaped exactly like TMDb's. Switching
 * between the two is a single line in tmdb.js, and everything downstream —
 * components, contexts, error handling — behaves identically.
 *
 * It is intentionally more than a static array: pagination, sorting, genre /
 * year / rating filtering and text search all work, so the real UI flows
 * (Load More, filters, search) can be developed and demonstrated end to end.
 */

/** Simulated round-trip latency, so loading states are actually visible. */
const LATENCY_MS = 320;

/** Page size used by TMDb for these endpoints. */
const PAGE_SIZE = 20;

/**
 * Resolve after a short delay, honouring an AbortSignal.
 *
 * This mirrors what axios does with a real request: when the caller aborts
 * (a new keystroke supersedes the in-flight search), the promise rejects with
 * a `cancelled` ApiError, which the UI already knows how to ignore.
 *
 * @param {AbortSignal} [signal]
 */
function delay(signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ApiError({ kind: 'cancelled', detail: 'Request cancelled' }));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, LATENCY_MS);

    function onAbort() {
      clearTimeout(timer);
      reject(new ApiError({ kind: 'cancelled', detail: 'Request cancelled' }));
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Project the internal fixture record onto TMDb's list-item shape.
 * TMDb omits runtime, tagline, cast and videos from list responses, so the
 * mock does too — otherwise the UI would accidentally depend on fields that
 * never arrive in production.
 */
function toListItem(movie) {
  return {
    id: movie.id,
    title: movie.title,
    original_title: movie.title,
    overview: movie.overview,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    popularity: movie.popularity,
    poster_path: movie.poster_path,
    backdrop_path: null,
    genre_ids: movie.genre_ids,
    adult: false,
    video: false,
    original_language: 'en',
  };
}

/** Wrap a result set in TMDb's pagination envelope. */
function paginate(items, page) {
  const safePage = Math.max(1, Number(page) || 1);
  const start = (safePage - 1) * PAGE_SIZE;
  const totalPages = Math.min(Math.ceil(items.length / PAGE_SIZE) || 1, MAX_TMDB_PAGE);

  return {
    page: safePage,
    results: items.slice(start, start + PAGE_SIZE).map(toListItem),
    total_pages: totalPages,
    total_results: items.length,
  };
}

/**
 * Apply a sort_by value.
 *
 * Delegates to the shared comparator in utils/sorting.js so the sample data
 * orders results exactly the way the live client and the client-side search
 * sorting do — three implementations of the same rule is three chances for them
 * to diverge.
 */
function sortMovies(movies, sortBy = 'popularity.desc') {
  return applySort(movies, sortBy);
}

/** GET /trending/movie/{window} */
export async function getTrending({ page = 1, signal } = {}) {
  await delay(signal);
  // Trending is popularity-weighted rather than purely alphabetical, matching
  // the feel of TMDb's own trending feed.
  return paginate(sortMovies(MOCK_MOVIES, 'popularity.desc'), page);
}

/** GET /search/movie */
export async function searchMovies({ query, page = 1, year, signal } = {}) {
  await delay(signal);

  if (!query || !query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  const needle = query.trim().toLowerCase();
  const matches = MOCK_MOVIES.filter((movie) => movie.title.toLowerCase().includes(needle)).filter(
    (movie) => !year || movie.release_date.startsWith(String(year)),
  );

  return paginate(sortMovies(matches, 'popularity.desc'), page);
}

/** GET /discover/movie */
export async function discoverMovies({
  page = 1,
  genreId = null,
  year = null,
  minRating = null,
  sortBy = 'popularity.desc',
  signal,
} = {}) {
  await delay(signal);

  // Mirrors the vote-count floor the live client applies when sorting by
  // rating, so sample data and live data behave the same way.
  const voteFloor = Math.max(minRating ? 100 : 0, voteFloorFor(sortBy));

  const filtered = MOCK_MOVIES.filter((movie) => {
    if (genreId && !movie.genre_ids.includes(Number(genreId))) return false;
    if (year && !movie.release_date.startsWith(String(year))) return false;
    if (minRating && movie.vote_average < Number(minRating)) return false;
    if (voteFloor && movie.vote_count < voteFloor) return false;
    return true;
  });

  return paginate(sortMovies(filtered, sortBy), page);
}

/** GET /genre/movie/list */
export async function getGenres({ signal } = {}) {
  await delay(signal);
  return { genres: GENRES };
}

/**
 * GET /movie/{id}?append_to_response=credits,videos,recommendations
 *
 * Builds the same nested structure TMDb returns, including the `videos.results`
 * array the trailer modal reads and the `credits.cast` array the detail page
 * renders.
 */
export async function getMovieDetails({ id, signal } = {}) {
  await delay(signal);

  const movie = MOCK_MOVIES.find((entry) => String(entry.id) === String(id));
  if (!movie) {
    throw new ApiError({
      kind: 'notFound',
      status: 404,
      detail: `The resource you requested could not be found (movie ${id}).`,
    });
  }

  const videos = movie.trailerKey
    ? [
        {
          id: `mock-${movie.id}-1`,
          key: movie.trailerKey,
          name: `${movie.title} — Official Trailer`,
          site: 'YouTube',
          type: 'Trailer',
          official: true,
          published_at: `${movie.release_date}T00:00:00.000Z`,
        },
      ]
    : [];

  // Recommendations are computed from shared genres so that the "More like
  // this" row is populated and responds to the fixture data.
  const recommendations = MOCK_MOVIES.filter((entry) => entry.id !== movie.id)
    .map((entry) => ({
      entry,
      shared: entry.genre_ids.filter((genreId) => movie.genre_ids.includes(genreId)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || b.entry.popularity - a.entry.popularity)
    .slice(0, 12)
    .map(({ entry }) => toListItem(entry));

  return {
    ...toListItem(movie),
    runtime: movie.runtime,
    tagline: movie.tagline,
    status: 'Released',
    budget: 0,
    revenue: 0,
    homepage: '',
    production_companies: [],
    spoken_languages: [{ english_name: 'English', iso_639_1: 'en', name: 'English' }],
    genres: movie.genre_ids.map((genreId) => ({ id: genreId, name: genreName(genreId) })),
    credits: {
      cast: movie.cast.map((person, index) => ({
        id: movie.id * 1000 + index,
        name: person.name,
        character: person.character,
        profile_path: null,
        order: index,
      })),
      crew: [{ id: movie.id * 100 + 1, name: movie.director, job: 'Director', department: 'Directing' }],
    },
    videos: { results: videos },
    recommendations: { page: 1, results: recommendations, total_pages: 1, total_results: recommendations.length },
  };
}
