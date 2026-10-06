import { InputAdornment, IconButton, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useMovies } from '../context/MovieContext';

/**
 * The main search input.
 *
 * Two things make this feel responsive despite the network being involved:
 *
 *  1. The input's value is bound to `query` in MovieContext, which updates on
 *     every keystroke — so typing is never blocked by a pending request.
 *  2. Debouncing happens inside MovieContext. The request only fires once the
 *     user has paused for 400ms, and any in-flight request is aborted when a
 *     newer one starts, so results can never arrive out of order.
 */
export default function SearchBar({ autoFocus = false, placeholder = 'Search for a movie…' }) {
  const { query, setQuery } = useMovies();

  return (
    <TextField
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      fullWidth
      size="small"
      type="search"
      inputProps={{ 'aria-label': 'Search movies by title' }}
      InputProps={{
        sx: { borderRadius: 999, bgcolor: 'background.paper' },
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" color="action" />
          </InputAdornment>
        ),
        endAdornment: query ? (
          <InputAdornment position="end">
            <IconButton size="small" aria-label="Clear search" onClick={() => setQuery('')} edge="end">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}
