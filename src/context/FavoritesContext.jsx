import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Saved favourites, persisted in localStorage.
 *
 * Favourites are stored as denormalised snapshots — id, title, poster, year and
 * rating — rather than as a list of ids to be re-fetched. Two reasons:
 *
 *   1. The favourites page renders instantly with zero network requests, which
 *      matters on a slow connection and is the whole point of a local list.
 *   2. If TMDb later removes or renames a title, the saved item still displays
 *      instead of silently disappearing from the user's collection.
 *
 * The trade-off is that a rating saved today will not follow a future change
 * upstream. For a local favourites list that is the right side of the trade.
 */

const FavoritesContext = createContext(null);

/** Keep only the fields the favourites list needs, so storage stays small. */
export function toFavoriteSnapshot(movie) {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path ?? null,
    release_date: movie.release_date ?? '',
    vote_average: movie.vote_average ?? 0,
    savedAt: new Date().toISOString(),
  };
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.favorites, []);

  const isFavorite = useCallback(
    (movieId) => favorites.some((favorite) => String(favorite.id) === String(movieId)),
    [favorites],
  );

  /** Add if absent, remove if present — the heart button's single action. */
  const toggleFavorite = useCallback(
    (movie) => {
      setFavorites((current) => {
        const exists = current.some((favorite) => String(favorite.id) === String(movie.id));
        if (exists) return current.filter((favorite) => String(favorite.id) !== String(movie.id));
        // Newest first, so recently saved titles appear at the top.
        return [toFavoriteSnapshot(movie), ...current];
      });
    },
    [setFavorites],
  );

  const removeFavorite = useCallback(
    (movieId) => setFavorites((current) => current.filter((favorite) => String(favorite.id) !== String(movieId))),
    [setFavorites],
  );

  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);

  const value = useMemo(
    () => ({
      favorites,
      count: favorites.length,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used inside a FavoritesProvider');
  return context;
}

export default FavoritesContext;
