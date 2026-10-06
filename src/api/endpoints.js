/**
 * TMDb endpoint paths.
 *
 * Centralised so that a path change (or a v3 -> v4 migration) is a single edit
 * rather than a search across the codebase. Each entry is a function so callers
 * never build paths with string concatenation by hand.
 */
export const endpoints = {
  /** @param {'day'|'week'} window */
  trending: (window = 'week') => `/trending/movie/${window}`,

  /** Text search. Supports query, page, year, primary_release_year, include_adult. */
  searchMovies: () => '/search/movie',

  /**
   * Filter-based browsing. Supports with_genres, primary_release_year,
   * vote_average.gte, vote_count.gte and sort_by — but NOT a text query.
   * This asymmetry is why search and filter modes are handled differently;
   * see MovieContext for the full explanation.
   */
  discoverMovies: () => '/discover/movie',

  /**
   * Full detail for one title. `append_to_response` folds credits, videos and
   * recommendations into this single response, saving three extra round-trips.
   */
  movieDetails: (id) => `/movie/${id}`,

  genres: () => '/genre/movie/list',
};
