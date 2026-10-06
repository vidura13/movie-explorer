import { useCallback, useEffect, useState } from 'react';
import { getMovieDetails } from '../api/tmdb';
import { isCancellation } from '../utils/errorMessages';

/**
 * Loads full details for a single movie.
 *
 * Kept separate from MovieContext on purpose: the detail page has its own
 * request lifecycle (it loads when you open a title and is thrown away when you
 * leave), and folding it into the shared grid state would let a slow detail
 * request interfere with the results list behind it.
 *
 * ---------------------------------------------------------------------------
 * Why the state is keyed
 * ---------------------------------------------------------------------------
 * The naive version of this hook calls setState('loading') at the top of its
 * effect when the movie id changes. That is a wasted render, and it is the
 * pattern React's own documentation warns about ("you might not need an
 * effect"). Instead, each result is stored together with the key of the request
 * that produced it — `${movieId}:${reloadToken}` — and "still loading" is
 * *derived* by comparing that key with the current one at render time:
 *
 *   - navigating to another movie changes the key, so the hook reports
 *     "loading" with no state update at all;
 *   - when the matching response arrives, the keys line up and the data shows;
 *   - a stale response from a previous movie (possible if a request resolves
 *     after the user has already clicked away) stores an old key, so it can
 *     never be mistaken for the current movie's data.
 */
export function useMovieDetails(movieId) {
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${movieId}:${reloadToken}`;

  const [result, setResult] = useState({ key: null, movie: null, error: null });

  /** True while no response has arrived for the current request. */
  const isPending = result.key !== requestKey;

  useEffect(() => {
    if (!movieId) return undefined;

    const controller = new AbortController();

    getMovieDetails({ id: movieId, signal: controller.signal })
      .then((data) => setResult({ key: requestKey, movie: data, error: null }))
      .catch((error) => {
        // Navigating away mid-request is expected, not a failure.
        if (isCancellation(error)) return;
        setResult({ key: requestKey, movie: null, error });
      });

    return () => controller.abort();
  }, [movieId, requestKey]);

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  // Start a new title at the top of the page; arriving from a scrolled grid
  // would otherwise open the new movie halfway down.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [movieId]);

  return {
    movie: isPending ? null : result.movie,
    error: isPending ? null : result.error,
    status: isPending ? 'loading' : result.error ? 'error' : 'success',
    retry,
  };
}

export default useMovieDetails;
