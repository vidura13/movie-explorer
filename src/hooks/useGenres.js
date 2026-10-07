import { useCallback, useEffect, useState } from 'react';
import { getGenres } from '../api/tmdb';
import { isCancellation } from '../utils/errorMessages';

/**
 * Loads the TMDb genre list once per session, for the filter dropdown.
 *
 * The list is a fixed, tiny catalogue (19 entries) and the underlying request is
 * cached in the API layer, so this hook needs no cache of its own.
 *
 * A failure here is reported rather than swallowed. The first version quietly
 * fell back to an empty array, which left the filter dropdown showing nothing
 * but "All genres" with no explanation — indistinguishable from a bug in the
 * dropdown itself. Now the caller can say what happened and offer a retry.
 *
 * State is keyed to the request that produced it (the same pattern used in
 * useMovieDetails), which means "still loading" is *derived* by comparing keys
 * at render time instead of being set from inside an effect. That avoids an
 * extra render pass on mount and on every retry.
 */
export function useGenres() {
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `genres:${reloadToken}`;

  const [result, setResult] = useState({ key: null, genres: [], error: null });

  const isLoading = result.key !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    getGenres({ signal: controller.signal })
      .then((list) => {
        // The service layer guarantees an array from both data sources.
        setResult({ key: requestKey, genres: Array.isArray(list) ? list : [], error: null });
      })
      .catch((error) => {
        // A superseded request is expected: React StrictMode remounts effects
        // on purpose, and that first request is cancelled by its own cleanup.
        if (isCancellation(error)) return;
        setResult({ key: requestKey, genres: [], error });
      });

    return () => controller.abort();
  }, [requestKey]);

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    genres: isLoading ? [] : result.genres,
    isLoading,
    error: isLoading ? null : result.error,
    retry,
  };
}

export default useGenres;
