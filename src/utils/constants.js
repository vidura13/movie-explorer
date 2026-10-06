/**
 * Application-wide configuration values.
 *
 * Everything that could reasonably change between environments lives here so
 * that no component or service has to read `import.meta.env` directly.
 */

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/** Read Access Token (JWT). Empty string when the developer has not set one. */
export const TMDB_TOKEN = (import.meta.env.VITE_TMDB_TOKEN || '').trim();

/**
 * Sample-data mode.
 *
 * Enabled deliberately via VITE_USE_MOCK, and enabled automatically when no
 * token is configured — a clone of this repository should render something
 * useful on first run instead of a wall of 401 errors. The banner in the
 * header tells the user which mode is active, so this is never silent.
 */
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true' || !TMDB_TOKEN;

/** Requests are aborted after this long so a dead connection cannot hang the UI. */
export const REQUEST_TIMEOUT_MS = 10_000;

/** Typing delay before a search request is issued. */
export const SEARCH_DEBOUNCE_MS = 400;

/** TMDb silently caps paginated results at page 500 regardless of total_pages. */
export const MAX_TMDB_PAGE = 500;

/**
 * localStorage keys are namespaced with a `me_` prefix so they cannot collide
 * with anything else the user's browser has stored for this origin.
 */
export const STORAGE_KEYS = {
  theme: 'me_theme',
  auth: 'me_auth',
  favorites: 'me_favorites',
  lastSearch: 'me_last_search',
};

/** Image widths offered by TMDb's CDN. */
export const IMAGE_SIZES = {
  poster: { sm: 'w185', md: 'w342', lg: 'w500' },
  backdrop: { md: 'w780', lg: 'w1280' },
  profile: 'w185',
};

/**
 * Demo login. There is no backend in this project, so the "authentication"
 * is a client-side simulation — see src/services/authService.js for the
 * boundary and how a real API call would slot in.
 */
export const DEMO_CREDENTIALS = {
  username: 'demo',
  password: 'demo1234',
};

/** Options exposed by the filter panel (bonus feature). */
export const YEAR_OPTIONS = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1970; year -= 1) years.push(year);
  return years;
})();

export const RATING_OPTIONS = [
  { value: 9, label: '9+ Exceptional' },
  { value: 8, label: '8+ Great' },
  { value: 7, label: '7+ Good' },
  { value: 6, label: '6+ Decent' },
];

/**
 * The default filter state.
 *
 * Lives in constants rather than in MovieContext so that the reducer, the filter
 * panel and the active-filter chips all import it from one place without
 * creating a circular dependency between a component and the context.
 */
export const INITIAL_FILTERS = {
  genreId: null,
  year: null,
  minRating: null,
  sortBy: 'popularity.desc',
};

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Highest rated' },
  { value: 'primary_release_date.desc', label: 'Newest first' },
  { value: 'primary_release_date.asc', label: 'Oldest first' },
];
