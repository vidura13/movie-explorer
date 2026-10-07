import { useState } from 'react';
import {
  Button,
  FormControl,
  FormHelperText,
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
 * active. When a search term IS active, genre, rating and sort cannot be sent to
 * TMDb (that endpoint has no such parameters) and are applied to the
 * already-loaded results instead — the note underneath says so, rather than
 * quietly returning something different from what the controls imply.
 *
 * The controls wrap onto multiple lines on narrow screens instead of being
 * hidden behind a modal: with only four of them, wrapping is quicker to use than
 * opening a sheet, and it keeps the current filter state visible.
 */
export default function FilterPanel() {
  const { filters, setFilters, clearFilters, hasActiveFilters } = useMovies();
  const { genres, isLoading: genresLoading, error: genresError, retry: retryGenres } = useGenres();

  /**
   * The year field needs its own draft text, because the filter value is only
   * valid once it is a complete four-digit year.
   *
   * The first version bound the input straight to `filters.year` and discarded
   * anything that was not four digits — so typing "2" updated nothing, the
   * input re-rendered from the old value, and the character never appeared. The
   * field was impossible to type into. Keeping the raw text in local state means
   * the user can type freely, while the filter only commits to a valid year.
   */
  const [yearDraft, setYearDraft] = useState(filters.year ? String(filters.year) : '');

  /**
   * Stay in sync when the year changes from outside this field — "Clear all", a
   * restored search from a previous session, or the chip's remove button.
   *
   * This is React's documented "adjust state when a prop changes" pattern:
   * compare during render and update immediately, which React handles by
   * re-rendering before committing rather than by painting a stale frame. An
   * effect would work too, but it renders twice and, more importantly, would
   * briefly show the old year on screen.
   */
  const [lastSyncedYear, setLastSyncedYear] = useState(filters.year);
  if (filters.year !== lastSyncedYear) {
    setLastSyncedYear(filters.year);
    setYearDraft(filters.year ? String(filters.year) : '');
  }

  function handleYearChange(event) {
    // Digits only, capped at four characters. This also removes the need for a
    // numeric input type, which on desktop renders a stepper ("roller") that is
    // awkward for years, and on mobile opens a keyboard that will not accept
    // four digits at once.
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    setYearDraft(digits);

    if (digits.length === 4) setFilters({ year: Number(digits) });
    else if (digits === '') setFilters({ year: null });
    // A 1–3 digit partial value is left in the box without touching the filter.
  }

  /** Revert an incomplete year when focus leaves, so the box never lies. */
  function handleYearBlur() {
    if (yearDraft.length > 0 && yearDraft.length < 4) {
      setYearDraft(filters.year ? String(filters.year) : '');
    }
  }

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
        <FormControl size="small" sx={{ minWidth: 160, flex: { sm: '1 1 160px' } }} error={Boolean(genresError)}>
          <InputLabel id="filter-genre-label">Genre</InputLabel>
          <Select
            labelId="filter-genre-label"
            id="filter-genre"
            label="Genre"
            value={filters.genreId ?? ''}
            onChange={(event) => setFilters({ genreId: event.target.value || null })}
            disabled={genresLoading || Boolean(genresError)}
          >
            <MenuItem value="">
              <em>{genresLoading ? 'Loading genres…' : 'All genres'}</em>
            </MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre.id} value={genre.id}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
          {/* If the genre list failed, say so and offer a way out rather than
              rendering a dropdown that silently contains nothing. */}
          {genresError && (
            <FormHelperText>
              Couldn’t load genres.{' '}
              <Button size="small" onClick={retryGenres} sx={{ minWidth: 0, p: 0, fontSize: 'inherit' }}>
                Retry
              </Button>
            </FormHelperText>
          )}
        </FormControl>

        <TextField
          size="small"
          label="Release year"
          value={yearDraft}
          onChange={handleYearChange}
          onBlur={handleYearBlur}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleYearBlur();
          }}
          placeholder="e.g. 2010"
          // `text` with a numeric keyboard rather than type="number": no
          // spinner/stepper to fight with, and no silent rejection of partial
          // input. Sanitising happens in handleYearChange.
          inputProps={{ inputMode: 'numeric', maxLength: 4 }}
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
