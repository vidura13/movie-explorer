import { TMDB_IMAGE_BASE_URL, IMAGE_SIZES } from './constants';

/**
 * Build a full URL for a TMDb image path.
 *
 * TMDb returns bare paths such as "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" and leaves
 * the choice of resolution to the client.
 *
 * @param {string|null|undefined} path - value from the API (`poster_path`, `backdrop_path`, …)
 * @param {string} size - a key from IMAGE_SIZES.poster/backdrop, or a raw TMDb size
 * @returns {string|null} absolute URL, or null when the movie has no such image
 */
export function buildImageUrl(path, size = 'w342') {
  // Every image field on TMDb is nullable — roughly 8% of results have no
  // poster at all. Callers render a placeholder when this returns null.
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Build a `srcset` string so high-DPI screens fetch a sharper image and
 * small screens do not waste bandwidth.
 *
 * @param {string|null} path
 * @param {Array<{size: string, width: number}>} variants
 * @returns {string|undefined} undefined when there is no image to describe
 */
export function buildImageSrcSet(path, variants) {
  if (!path) return undefined;
  return variants.map(({ size, width }) => `${buildImageUrl(path, size)} ${width}w`).join(', ');
}

/** Convenience wrapper for the poster images used in cards and detail views. */
export function getPosterUrl(movie, sizeKey = 'md') {
  return buildImageUrl(movie?.poster_path, IMAGE_SIZES.poster[sizeKey]);
}

/** Detail hero images: falls back to the poster when no backdrop exists. */
export function getBackdropUrl(movie, sizeKey = 'lg') {
  const path = movie?.backdrop_path || movie?.poster_path;
  return buildImageUrl(path, movie?.backdrop_path ? IMAGE_SIZES.backdrop[sizeKey] : IMAGE_SIZES.poster[sizeKey]);
}
