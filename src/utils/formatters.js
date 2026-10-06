/**
 * Small presentation helpers.
 *
 * Keeping formatting out of components means the rules can be unit-tested
 * directly (see src/__tests__/formatters.test.js) and stay consistent across
 * the grid, the detail page and the favourites list.
 */

/**
 * TMDb returns dates as "YYYY-MM-DD" strings, and returns an empty string for
 * titles whose release date is unknown.
 *
 * @param {string|undefined} dateString
 * @returns {string} four-digit year, or "TBA" when unknown
 */
export function formatYear(dateString) {
  if (!dateString || typeof dateString !== 'string') return 'TBA';
  const year = dateString.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : 'TBA';
}

/** Rating as one decimal place; "N/A" when a title has no votes yet. */
export function formatRating(rating) {
  if (typeof rating !== 'number' || Number.isNaN(rating) || rating <= 0) return 'N/A';
  return rating.toFixed(1);
}

/** 139 -> "2h 19m" */
export function formatRuntime(minutes) {
  if (!minutes || typeof minutes !== 'number') return '—';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder}m`;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

/** Compact vote counts: 35000000 -> "35M", 12000 -> "12K". */
export function formatCount(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return String(value);
}

/** "$165,000,000"; TMDb reports 0 for unknown budgets. */
export function formatMoney(amount) {
  if (!amount || typeof amount !== 'number') return '—';
  return `$${amount.toLocaleString('en-US')}`;
}

/** "1 movie" / "12 movies" */
export function pluralise(count, singular, plural = `${singular}s`) {
  return `${count.toLocaleString('en-US')} ${count === 1 ? singular : plural}`;
}

/** Truncate at a word boundary so text does not cut mid-word. */
export function truncate(text, maxLength = 160) {
  if (!text || text.length <= maxLength) return text || '';
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`;
}
