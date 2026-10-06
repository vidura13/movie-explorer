import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import * as tmdb from '../api/tmdb';
import { clearResponseCache } from '../api/tmdb';
import useDebounce from '../hooks/useDebounce';
import useLocalStorage from '../hooks/useLocalStorage';
import { INITIAL_FILTERS, SEARCH_DEBOUNCE_MS, STORAGE_KEYS } from '../utils/constants';
import { isCancellation } from '../utils/errorMessages';

/**
 * Movie data: trending, search, filters and pagination.
 *
 * ---------------------------------------------------------------
 * Why one context instead of Redux, or one context per concern
 * ---------------------------------------------------------------
 * Every one of these concerns feeds the same screen and the same grid, and they
 * change each other's meaning: typing a query switches from trending to search,
 * changing a filter switches from search to discover, clearing the query goes
 * back to trending. Splitting them across stores would mean coordinating three
 * sources of truth on every keystroke. One reducer keeps those transitions
 * explicit — each one is a named action in the switch below.
 *
 * ---------------------------------------------------------------
 * How search and filters combine (the interesting part)
 * ---------------------------------------------------------------
 * TMDb splits these capabilities across two endpoints:
 *
 *   /search/movie   supports a text query + year, but NOT genres or rating.
 *   /discover/movie supports genres, rating, year and sorting, but NOT a query.
 *
 * So a request cannot filter by genre and search by title at the same time. The
 * behaviour here is therefore mode-dependent, and the UI says so out loud:
 *
 *   Browse mode (no query)  — filters go to /discover/movie and are applied
 *                             server-side. Accurate totals, fully paginated.
 *   Search mode (query set) — the query and year go to /search/movie; genre and
 *                             rating are applied client-side to the results
 *                             already loaded. The result count reflects loaded
 *                             items, and the UI labels it that way.
 *
 * The alternative — silently dropping the genre filter whenever someone types —
 * is easier to build and much worse to use.
 */

const MovieContext = createContext(null);

const initialState = {
  /** What the user has typed (updates immediately, drives the input). */
  query: '',
  filters: INITIAL_FILTERS,
  /** Which endpoint produced the current items. Drives the heading. */
  source: 'trending',
  items: [],
  page: 1,
  totalPages: 1,
  totalResults: 0,
  status: 'loading', // 'loading' | 'success' | 'error'
  error: null,
  /** true while a *subsequent* page is loading, so the grid stays visible. */
  isAppending: false,
};

function movieReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      // A fresh query or filter change replaces the grid, so the previous
      // results are cleared and skeletons take their place.
      return { ...state, status: 'loading', error: null, items: [], page: 1, isAppending: false };

    case 'APPEND_START':
      return { ...state, isAppending: true, error: null };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        status: 'success',
        error: null,
        isAppending: false,
        items: action.payload.results,
        page: action.payload.page,
        totalPages: action.payload.totalPages,
        totalResults: action.payload.totalResults,
        source: action.payload.source,
      };

    case 'APPEND_SUCCESS':
      return {
        ...state,
        status: 'success',
        error: null,
        isAppending: false,
        // Guard against duplicates: TMDb occasionally repeats a title across
        // page boundaries when a result changes rank mid-pagination.
        items: [
          ...state.items,
          ...action.payload.results.filter(
            (incoming) => !state.items.some((existing) => existing.id === incoming.id),
          ),
        ],
        page: action.payload.page,
        totalPages: action.payload.totalPages,
        totalResults: action.payload.totalResults,
      };

    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.payload, isAppending: false, items: [] };

    case 'APPEND_ERROR':
      // A failed extra page must not wipe the results already on screen.
      return { ...state, isAppending: false, error: action.payload };

    case 'SET_QUERY':
      return { ...state, query: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'CLEAR_FILTERS':
      return { ...state, filters: INITIAL_FILTERS };

    default:
      return state;
  }
}

/** Snapshot of the query + filters worth restoring on the next visit. */
function readStoredSearch() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.lastSearch);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      query: typeof parsed?.query === 'string' ? parsed.query : '',
      filters: { ...INITIAL_FILTERS, ...(parsed?.filters || {}) },
    };
  } catch {
    return null;
  }
}

function buildInitialState() {
  const stored = readStoredSearch();
  return {
    ...initialState,
    query: stored?.query ?? '',
    filters: stored?.filters ?? INITIAL_FILTERS,
  };
}

export function MovieProvider({ children }) {
  const [state, dispatch] = useReducer(movieReducer, undefined, buildInitialState);
  const [, setStoredSearch] = useLocalStorage(STORAGE_KEYS.lastSearch, null);

  // 400ms of quiet before the query reaches the network.
  const debouncedQuery = useDebounce(state.query, SEARCH_DEBOUNCE_MS);
  const trimmedQuery = debouncedQuery.trim();

  const { genreId, year, minRating, sortBy } = state.filters;

  // Holds the in-flight request's controller so it can be cancelled when a
  // newer one starts (see the effect below).
  const abortRef = useRef(null);

  /**
   * Decide which endpoint to call and in what shape.
   * Kept as a value so the fetch effect and loadMore() cannot drift apart.
   */
  const requestPlan = useMemo(() => {
    if (trimmedQuery) {
      return {
        source: 'search',
        run: (page, signal) =>
          tmdb.searchMovies({ query: trimmedQuery, page, year: year || undefined, signal }),
      };
    }

    const hasServerFilters = Boolean(genreId || year || minRating);
    if (hasServerFilters) {
      return {
        source: 'discover',
        run: (page, signal) => tmdb.discoverMovies({ page, genreId, year, minRating, sortBy, signal }),
      };
    }

    return {
      source: 'trending',
      run: (page, signal) => tmdb.getTrendingMovies({ page, signal }),
    };
  }, [trimmedQuery, genreId, year, minRating, sortBy]);

  // Fetch page 1 whenever the plan changes (query settled, filter toggled, mode switched).
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort(); // cancel whatever the previous plan was fetching
    abortRef.current = controller;

    dispatch({ type: 'FETCH_START' });

    requestPlan
      .run(1, controller.signal)
      .then((data) => {
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            results: data.results || [],
            page: data.page ?? 1,
            // TMDb reports 0 total_pages for an empty result set; treat it as 1
            // so "page 1 of 0" never reaches the UI.
            totalPages: data.total_pages || 1,
            totalResults: data.total_results ?? (data.results || []).length,
            source: requestPlan.source,
          },
        });
      })
      .catch((error) => {
        if (isCancellation(error)) return; // superseded by a newer request
        dispatch({ type: 'FETCH_ERROR', payload: error });
      });

    return () => controller.abort();
  }, [requestPlan]);

  // Persist the search state once it has settled, so the next visit can restore it.
  useEffect(() => {
    if (state.status === 'loading') return;
    setStoredSearch({ query: state.query.trim(), filters: state.filters });
    // setStoredSearch is stable; only re-run when the value itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.query, state.filters, state.status]);

  /** Fetch the next page and append it. */
  const loadMore = useCallback(() => {
    const nextPage = state.page + 1;
    // Stop at TMDb's hard cap (page 500) so the button never becomes a no-op.
    if (state.isAppending || state.status === 'loading' || nextPage > state.totalPages) return;

    const controller = new AbortController();
    dispatch({ type: 'APPEND_START' });

    requestPlan
      .run(nextPage, controller.signal)
      .then((data) => {
        dispatch({
          type: 'APPEND_SUCCESS',
          payload: {
            results: data.results || [],
            page: data.page ?? nextPage,
            totalPages: data.total_pages || state.totalPages,
            totalResults: data.total_results ?? state.totalResults,
          },
        });
      })
      .catch((error) => {
        if (isCancellation(error)) return;
        dispatch({ type: 'APPEND_ERROR', payload: error });
      });
  }, [state.page, state.totalPages, state.totalResults, state.isAppending, state.status, requestPlan]);

  /** Re-run the current request — the action behind every "Try again" button. */
  const retry = useCallback(() => {
    clearResponseCache(); // a failure may have been cached before it resolved
    dispatch({ type: 'FETCH_START' });
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    requestPlan
      .run(1, controller.signal)
      .then((data) => {
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            results: data.results || [],
            page: data.page ?? 1,
            totalPages: data.total_pages || 1,
            totalResults: data.total_results ?? 0,
            source: requestPlan.source,
          },
        });
      })
      .catch((error) => {
        if (isCancellation(error)) return;
        dispatch({ type: 'FETCH_ERROR', payload: error });
      });
  }, [requestPlan]);

  const setQuery = useCallback((query) => dispatch({ type: 'SET_QUERY', payload: query }), []);
  const setFilters = useCallback((patch) => dispatch({ type: 'SET_FILTERS', payload: patch }), []);
  const clearFilters = useCallback(() => dispatch({ type: 'CLEAR_FILTERS' }), []);

  /**
   * Client-side filtering, applied only in search mode.
   *
   * In browse mode the server has already applied these filters, so re-applying
   * them here would be a no-op at best; in search mode it is the only way to
   * honour them, because /search/movie has no such parameters.
   */
  const visibleItems = useMemo(() => {
    if (state.source !== 'search') return state.items;
    if (!genreId && !minRating) return state.items;

    return state.items.filter((movie) => {
      if (genreId && !(movie.genre_ids || []).includes(Number(genreId))) return false;
      if (minRating && (movie.vote_average || 0) < Number(minRating)) return false;
      return true;
    });
  }, [state.items, state.source, genreId, minRating]);

  /** True when search mode is narrowing the loaded set — the UI warns about it. */
  const isClientFiltered =
    state.source === 'search' && state.items.length !== visibleItems.length && Boolean(genreId || minRating);

  const hasActiveFilters = Boolean(genreId || year || minRating || sortBy !== INITIAL_FILTERS.sortBy);
  const hasMore = state.page < state.totalPages;

  const value = useMemo(
    () => ({
      // state
      query: state.query,
      filters: state.filters,
      items: state.items,
      visibleItems,
      status: state.status,
      error: state.error,
      source: state.source,
      page: state.page,
      totalPages: state.totalPages,
      totalResults: state.totalResults,
      isAppending: state.isAppending,
      isClientFiltered,
      hasActiveFilters,
      hasMore,
      isSearching: Boolean(trimmedQuery),
      // actions
      setQuery,
      setFilters,
      clearFilters,
      loadMore,
      retry,
    }),
    [
      state,
      visibleItems,
      isClientFiltered,
      hasActiveFilters,
      hasMore,
      trimmedQuery,
      setQuery,
      setFilters,
      clearFilters,
      loadMore,
      retry,
    ],
  );

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
}

export function useMovies() {
  const context = useContext(MovieContext);
  if (!context) throw new Error('useMovies must be used inside a MovieProvider');
  return context;
}

export default MovieContext;
