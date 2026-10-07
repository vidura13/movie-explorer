import { Chip, Stack, Typography } from '@mui/material';
import { useMovies } from '../context/MovieContext';
import { useGenres } from '../hooks/useGenres';
import { INITIAL_FILTERS, RATING_OPTIONS, SORT_OPTIONS } from '../utils/constants';

/**
 * Compact summary of the filters currently applied, each removable in one click.
 *
 * Once the filter panel scrolls out of view (or is collapsed on a small screen),
 * this row is what stops the user wondering why the results look wrong — a
 * filtered grid with no visible explanation reads as a bug.
 */
export default function ActiveFilterChips() {
  const { filters, setFilters } = useMovies();
  const { genres } = useGenres();

  const genreName = genres.find((genre) => genre.id === filters.genreId)?.name;
  const ratingLabel = RATING_OPTIONS.find((option) => option.value === filters.minRating)?.label;

  const chips = [
    genreName && { key: 'genre', label: `Genre: ${genreName}`, clear: () => setFilters({ genreId: null }) },
    filters.year && { key: 'year', label: `Year: ${filters.year}`, clear: () => setFilters({ year: null }) },
    ratingLabel && { key: 'rating', label: ratingLabel, clear: () => setFilters({ minRating: null }) },
    filters.sortBy !== INITIAL_FILTERS.sortBy && {
      key: 'sort',
      // Show which sort is active rather than a generic "Custom sort" — the
      // whole point of this row is explaining why the results look the way
      // they do.
      label: `Sorted: ${SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label ?? 'Custom'}`,
      clear: () => setFilters({ sortBy: INITIAL_FILTERS.sortBy }),
    },
  ].filter(Boolean);

  if (!chips.length) return null;

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        Active:
      </Typography>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          size="small"
          onDelete={chip.clear}
          color="primary"
          variant="outlined"
        />
      ))}
    </Stack>
  );
}
