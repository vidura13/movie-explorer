/**
 * Sorting shared by the client-side and sample-data code paths.
 *
 * `/discover/movie` accepts a `sort_by` parameter, so browsing is sorted by the
 * server. `/search/movie` has no such parameter, so search results have to be
 * sorted locally — and having two implementations of the same ordering is how
 * they drift apart. Both callers use this.
 */

/** TMDb's sort_by values, mapped to comparators. */
const COMPARATORS = {
  'popularity.desc': (a, b) => (b.popularity || 0) - (a.popularity || 0),
  'vote_average.desc': (a, b) => (b.vote_average || 0) - (a.vote_average || 0),
  'primary_release_date.desc': (a, b) => (b.release_date || '').localeCompare(a.release_date || ''),
  'primary_release_date.asc': (a, b) => (a.release_date || '').localeCompare(b.release_date || ''),
};

/**
 * Sort a list of movies without mutating the input.
 *
 * Unknown sort values fall back to popularity, matching TMDb's own default, and
 * missing fields are treated as zero rather than throwing — some TMDb records
 * genuinely have no release date.
 *
 * @param {Array<object>} movies
 * @param {string} sortBy - a TMDb `sort_by` value
 * @returns {Array<object>} a new sorted array
 */
export function applySort(movies, sortBy) {
  const comparator = COMPARATORS[sortBy] || COMPARATORS['popularity.desc'];
  return [...movies].sort(comparator);
}

/**
 * Whether a given sort order needs a minimum vote count to be meaningful.
 *
 * Sorting by rating with no floor surfaces films with a single 10/10 vote above
 * The Godfather. TMDb's own front-end applies a similar floor. Sorting by
 * anything else does not need one.
 */
export function voteFloorFor(sortBy) {
  return sortBy === 'vote_average.desc' ? 200 : 0;
}

export default applySort;
