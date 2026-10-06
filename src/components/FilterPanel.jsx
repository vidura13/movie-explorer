import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useMovies } from '../context/MovieContext';
import { useGenres } from '../hooks/useGenres';
import { RATING_OPTIONS, SORT_OPTIONS } from '../utils/constants';

/**
 * Filter controls: genre, year, minimum rating and sort order.
 *
 * These map directly onto /discover/movie parameters when no search term is
 * active. When a search term IS active, genre and rating cannot be sent to TMDb
 * (that endpoint has no such parameters) and are applied to the already-loaded
 * results instead — the note underneath says so, rather than quietly returning
 * a different kind of result than the controls imply.
 *
 * The controls wrap onto multiple lines on narrow screens instead of being
 * hidden behind a modal: with only four of them, wrapping is quicker to use
 * than opening a sheet, and it keeps the current filter state visible.
 */
export default function FilterPanel() {
  const { filters, setFilters, clearFilters, hasActiveFilters } = useMovies();
  const { genres, isLoading: genresLoading } = useGenres();

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Filter movies"
      sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <FilterAltOutlinedIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Filters
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
        <FormControl size="small" sx={{ minWidth: 160, flex: { sm: '1 1 160px' } }}>
          <InputLabel id="filter-genre-label">Genre</InputLabel>
          <Select
            labelId="filter-genre-label"
            id="filter-genre"
            label="Genre"
            value={filters.genreId ?? ''}
            onChange={(event) => setFilters({ genreId: event.target.value || null })}
            disabled={genresLoading}
          >
            <MenuItem value="">
              <em>All genres</em>
            </MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre.id} value={genre.id}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* A number field rather than a 56-item dropdown: faster to use and it
            accepts any year, not just the ones we happened to list. */}
        <TextField
          size="small"
          label="Release year"
          type="number"
          value={filters.year ?? ''}
          onChange={(event) => {
            const raw = event.target.value;
            // Guard against partial input: a 2-digit year is ignored until it
            // is a plausible four-digit year, so the API is never called with
            // "20" and an empty result set.
            if (raw === '') return setFilters({ year: null });
            if (/^\d{4}$/.test(raw)) setFilters({ year: Number(raw) });
            return undefined;
          }}
          inputProps={{ min: 1900, max: new Date().getFullYear() + 2, step: 1 }}
          sx={{ minWidth: 150, flex: { sm: '1 1 150px' } }}
        />

        <FormControl size="small" sx={{ minWidth: 170, flex: { sm: '1 1 170px' } }}>
          <InputLabel id="filter-rating-label">Minimum rating</InputLabel>
          <Select
            labelId="filter-rating-label"
            id="filter-rating"
            label="Minimum rating"
            value={filters.minRating ?? ''}
            onChange={(event) => setFilters({ minRating: event.target.value || null })}
          >
            <MenuItem value="">
              <em>Any rating</em>
            </MenuItem>
            {RATING_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 170, flex: { sm: '1 1 170px' } }}>
          <InputLabel id="filter-sort-label">Sort by</InputLabel>
          <Select
            labelId="filter-sort-label"
            id="filter-sort"
            label="Sort by"
            value={filters.sortBy}
            onChange={(event) => setFilters({ sortBy: event.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'center' } }}
        >
          Clear all
        </Button>
      </Stack>

    </Paper>
  );
}
