import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Regression tests for the response cache.
 *
 * These tests exist because of a real bug. The cache originally stored the
 * *promise* returned by axios, and that promise was created with whichever
 * AbortSignal the first caller passed in. React StrictMode mounts, unmounts and
 * remounts every effect on purpose, so on a cold page load the sequence was:
 *
 *   1. effect runs       -> request starts, bound to signal A
 *   2. cleanup runs      -> signal A aborts; the promise rejects
 *   3. effect runs again -> cache hit; the cached promise is the aborted one
 *
 * The grid stayed empty until the user changed a filter (because filter requests
 * go to a different, uncached endpoint), and the genre dropdown showed nothing
 * but "All genres" for the same reason.
 *
 * The fix: cache resolved data rather than the promise, and never let one
 * caller's signal cancel a request that may be shared. These tests pin both
 * halves of that down.
 *
 * The transport and constants modules are mocked so the live code path (and
 * therefore the cache) is exercised without touching the network.
 */

vi.mock('../api/axiosClient', () => {
  class ApiError extends Error {
    constructor({ kind, detail = '', status = 0 }) {
      super(detail || kind);
      this.name = 'ApiError';
      this.kind = kind;
      this.status = status;
    }
  }
  return { default: { get: vi.fn() }, ApiError };
});

// Force the live branch: USE_MOCK_DATA false. The cache only exists there.
vi.mock('../utils/constants', () => ({
  USE_MOCK_DATA: false,
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_TOKEN: 'test-token',
  REQUEST_TIMEOUT_MS: 10_000,
  MAX_TMDB_PAGE: 500,
}));

const axiosClient = (await import('../api/axiosClient')).default;
const { clearResponseCache, getGenres, getTrendingMovies, searchMovies } = await import('../api/tmdb');

const trendingPayload = {
  page: 1,
  results: [{ id: 27205, title: 'Inception' }],
  total_pages: 5,
  total_results: 100,
};

const genresPayload = { genres: [{ id: 28, name: 'Action' }] };

beforeEach(() => {
  clearResponseCache();
  vi.clearAllMocks();
  axiosClient.get.mockResolvedValue({ data: trendingPayload });
});

describe('shared request cancellation', () => {
  it('still resolves for a later caller when an earlier caller aborted', async () => {
    // Simulates StrictMode: the first mount starts the request, then aborts it.
    const controller = new AbortController();
    const firstCall = getTrendingMovies({ page: 1, signal: controller.signal });
    controller.abort();

    // The shared request must not be cancelled by one participant...
    await expect(firstCall).resolves.toEqual(trendingPayload);

    // ...and the remounted caller must get real data, not a poisoned cache.
    await expect(getTrendingMovies({ page: 1 })).resolves.toEqual(trendingPayload);
    expect(axiosClient.get).toHaveBeenCalledTimes(1);
  });

  it('does not forward a caller signal into the shared request', async () => {
    const controller = new AbortController();
    getTrendingMovies({ page: 1, signal: controller.signal });

    const [, options] = axiosClient.get.mock.calls[0];
    expect(options.signal).toBeUndefined();
  });

  it('resolves the genre list for a later caller after an earlier abort', async () => {
    axiosClient.get.mockResolvedValue({ data: genresPayload });

    const controller = new AbortController();
    const firstCall = getGenres({ signal: controller.signal });
    controller.abort();

    await expect(firstCall).resolves.toEqual(genresPayload.genres);
    await expect(getGenres({})).resolves.toEqual(genresPayload.genres);
    expect(axiosClient.get).toHaveBeenCalledTimes(1);
  });
});

describe('caching behaviour', () => {
  it('serves a repeated request from the cache', async () => {
    await getTrendingMovies({ page: 1 });
    await getTrendingMovies({ page: 1 });
    expect(axiosClient.get).toHaveBeenCalledTimes(1);
  });

  it('shares one request between simultaneous callers', async () => {
    const [a, b] = await Promise.all([getTrendingMovies({ page: 1 }), getTrendingMovies({ page: 1 })]);
    expect(axiosClient.get).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
  });

  it('never caches a failure, so a retry gets a fresh attempt', async () => {
    axiosClient.get.mockRejectedValueOnce(new Error('network down'));
    await expect(getTrendingMovies({ page: 1 })).rejects.toThrow('network down');

    axiosClient.get.mockResolvedValueOnce({ data: trendingPayload });
    await expect(getTrendingMovies({ page: 1 })).resolves.toEqual(trendingPayload);
  });

  it('does not cache search results, which change with every query', async () => {
    axiosClient.get.mockResolvedValue({ data: trendingPayload });
    await searchMovies({ query: 'inception' });
    await searchMovies({ query: 'inception' });
    expect(axiosClient.get).toHaveBeenCalledTimes(2);
  });

  it('clears both the cache and in-flight requests on demand', async () => {
    await getTrendingMovies({ page: 1 });
    clearResponseCache();
    await getTrendingMovies({ page: 1 });
    expect(axiosClient.get).toHaveBeenCalledTimes(2);
  });
});

describe('genre service shape', () => {
  it('unwraps the TMDb envelope into a plain array', async () => {
    axiosClient.get.mockResolvedValue({ data: genresPayload });
    await expect(getGenres({})).resolves.toEqual(genresPayload.genres);
  });
});
