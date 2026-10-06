import { Button, Container } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid';
import SectionHeading from '../components/SectionHeading';
import { useFavorites } from '../context/FavoritesContext';
import { pluralise } from '../utils/formatters';

/**
 * Saved movies.
 *
 * Reads straight from localStorage via FavoritesContext, so this page renders
 * instantly and works offline. It performs no network requests at all — which is
 * exactly why favourites are stored as denormalised snapshots rather than as
 * ids to be re-fetched (see FavoritesContext for the full rationale).
 */
export default function Favorites() {
  const { favorites, clearFavorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      <SectionHeading
        title="Your favourites"
        subtitle={favorites.length ? pluralise(favorites.length, 'saved movie') : undefined}
        liveMessage={favorites.length ? `${pluralise(favorites.length, 'favourite')} loaded` : ''}
        action={
          favorites.length > 0 ? (
            <Button onClick={clearFavorites} color="inherit" size="small">
              Clear all
            </Button>
          ) : null
        }
      />

      <MovieGrid
        movies={favorites}
        status="success"
        emptyTitle="No favourites yet"
        emptyDescription="Tap the heart on any poster to save it here. Your list is stored in this browser, so it is waiting for you next time."
        emptyActionLabel="Browse trending movies"
        onEmptyAction={() => {
          // Cleared through the router rather than window.location, so the SPA
          // is not reloaded and MovieContext keeps its state.
          navigate('/');
        }}
        emptyVariant="favorites"
      />
    </Container>
  );
}
