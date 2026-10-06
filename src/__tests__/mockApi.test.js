import { describe, expect, it } from 'vitest';
import { discoverMovies, getGenres, getMovieDetails, getTrending, searchMovies } from '../mocks/mockApi';
import { MOCK_MOVIES } from '../mocks/mockData';

/**
 * Tests for the sample-data service.
 *
 * This service stands in for the live API during development and in tests, so
 * its behaviour has to match TMDb's in the ways the UI depends on: pagination
 * envelopes, the shape of a detail response, and the fact that a genre filter
 * only returns matching titles.
 */
describe('getTrending', () => {
  it('returns a TMDb-shaped pagination envelope', async () => {
    const response = await getTrending({ page: 1 });

    expect(response.page).toBe(1);
    expect(response.results).toHaveLength(20); // TMDb page size
    expect(response.total_results).toBe(MOCK_MOVIES.length);
    expect(response.total_pages).toBe(Math.ceil(MOCK_MOVIES.length / 20));
  });

  it('orders by popularity and keeps list items to TMDb list fields', async () => {
    const { results } = await getTrending({ page: 1 });

    expect(results[0].title).toBe('Inception'); // highest popularity in the fixture
    // Detail-only fields must not leak into list responses, or the UI would
    // depend on data the live API never sends here.
    expect(results[0].runtime).toBeUndefined();
    expect(results[0].tagline).toBeUndefined();
    expect(results[0].credits).toBeUndefined();
  });

  it('returns the next page without repeating the previous one', async () => {
    const first = await getTrending({ page: 1 });
    const second = await getTrending({ page: 2 });

    const firstIds = first.results.map((movie) => movie.id);
    const secondIds = second.results.map((movie) => movie.id);

    expect(secondIds).not.toEqual(firstIds);
    expect(firstIds.filter((id) => secondIds.includes(id))).toHaveLength(0);
  });
});

describe('searchMovies', () => {
  it('matches on a case-insensitive substring of the title', async () => {
    const response = await searchMovies({ query: 'incept' });
    expect(response.results.map((movie) => movie.title)).toContain('Inception');
  });

  it('returns an empty envelope for a blank query instead of every movie', async () => {
    const response = await searchMovies({ query: '   ' });
    expect(response.results).toHaveLength(0);
    expect(response.total_results).toBe(0);
  });

  it('returns no results rather than throwing when nothing matches', async () => {
    const response = await searchMovies({ query: 'zzzzzz-no-such-film' });
    expect(response.results).toHaveLength(0);
    expect(response.total_results).toBe(0);
  });

  it('filters by release year', async () => {
    const response = await searchMovies({ query: 'the', year: 1999 });
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results.every((movie) => movie.release_date.startsWith('1999'))).toBe(true);
  });
});

describe('discoverMovies', () => {
  it('filters by genre', async () => {
    const response = await discoverMovies({ genreId: 16, minRating: 8 }); // Animation
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results.every((movie) => movie.genre_ids.includes(16))).toBe(true);
    expect(response.results.every((movie) => movie.vote_average >= 8)).toBe(true);
  });

  it('filters by minimum rating', async () => {
    const response = await discoverMovies({ minRating: 8.5 });
    expect(response.results.every((movie) => movie.vote_average >= 8.5)).toBe(true);
  });

  it('honours the sort order', async () => {
    const response = await discoverMovies({ sortBy: 'primary_release_date.asc' });
    const dates = response.results.map((movie) => movie.release_date);
    expect([...dates].sort()).toEqual(dates);
  });

  it('filters by year', async () => {
    const response = await discoverMovies({ year: 2014 });
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results.every((movie) => movie.release_date.startsWith('2014'))).toBe(true);
  });
});

describe('getMovieDetails', () => {
  it('returns genres, credits, videos and recommendations in one response', async () => {
    const movie = await getMovieDetails({ id: 27205 });

    expect(movie.title).toBe('Inception');
    expect(movie.genres.map((genre) => genre.name)).toContain('Science Fiction');
    expect(movie.credits.cast[0]).toMatchObject({ name: 'Leonardo DiCaprio' });
    expect(movie.credits.crew.some((person) => person.job === 'Director')).toBe(true);
    expect(movie.videos.results[0]).toMatchObject({ site: 'YouTube', type: 'Trailer' });
    expect(movie.recommendations.results.length).toBeGreaterThan(0);
  });

  it('accepts a string id, because route params are always strings', async () => {
    const movie = await getMovieDetails({ id: '27205' });
    expect(movie.id).toBe(27205);
  });

  it('rejects with a notFound error for an unknown id', async () => {
    await expect(getMovieDetails({ id: 999999 })).rejects.toMatchObject({
      kind: 'notFound',
      status: 404,
    });
  });

  it('returns no videos for a title without a trailer', async () => {
    // The fixture deliberately omits one, so the "no trailer" UI path is
    // exercised rather than assumed.
    const movie = await getMovieDetails({ id: 862 }); // Toy Story
    expect(movie.videos.results).toHaveLength(0);
  });

  it('keeps the posterless fixture posterless, to exercise the fallback', async () => {
    const movie = await getMovieDetails({ id: 129 }); // Spirited Away
    expect(movie.poster_path).toBeNull();
  });

  it('rejects with a cancelled error when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(getMovieDetails({ id: 27205, signal: controller.signal })).rejects.toMatchObject({
      kind: 'cancelled',
    });
  });
});

describe('getGenres', () => {
  it('returns the genre catalogue', async () => {
    const genres = await getGenres({});
    expect(genres.genres.length).toBeGreaterThan(10);
    expect(genres.genres).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Comedy' })]));
  });
});

/**
 * Regression test for a shape mismatch between the two data sources.
 *
 * The live client unwraps TMDb's `{ genres: [...] }` envelope and returns an
 * array; the mock originally returned the raw object instead, so the two
 * branches of the same function returned different shapes and every caller had
 * to guess which source it was talking to. That is precisely the kind of leak
 * that breaks silently when a data source is swapped.
 *
 * The service layer now normalises both, and this test holds that contract.
 */
describe('genre service shape', () => {
  it('returns an array from the service layer, matching the live client', async () => {
    const { getGenres: getGenresService } = await import('../api/tmdb');
    const result = await getGenresService({});
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toEqual(expect.objectContaining({ id: expect.any(Number), name: expect.any(String) }));
  });
});
