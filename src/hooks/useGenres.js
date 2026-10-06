import { useEffect, useState } from 'react';
import { getGenres } from '../api/tmdb';
import { isCancellation } from '../utils/errorMessages';

/**
 * Loads the TMDb genre list once per session.
 *
 * The genre list is a fixed, tiny catalogue (19 entries) and the underlying
 * request is cached in the API layer, so this hook does not need its own cache —
 * it just needs to not crash the filter panel if the request fails. On failure
 * the panel simply renders without the genre dropdown rather than blocking the
 * whole page on a non-essential request.
 */
export function useGenres() {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    getGenres({ signal: controller.signal })
      .then((result) => {
        // The mock service returns the array directly; the live client returns
        // `response.data.genres`. Normalise both here.
        const list = Array.isArray(result) ? result : result?.genres || [];
        setGenres(list);
      })
      .catch((error) => {
        if (!isCancellation(error)) setGenres([]);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  return { genres, isLoading };
}

export default useGenres;
