import { Box } from '@mui/material';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

/**
 * Responsive poster grid with all of its data states handled in one place.
 *
 * The layout uses CSS Grid with `auto-fill` rather than MUI's Grid component:
 * one rule produces 2 columns on a phone and 5 on a desktop, with no breakpoint
 * bookkeeping, and the cards keep a consistent width because the track size is
 * driven by a minimum (150px) and a maximum (1fr).
 *
 * Every state a data-driven view can be in is covered here — loading, error,
 * empty, success — so no page has to remember to handle them individually.
 * Missing states are the most common source of blank screens in a data app.
 */
export default function MovieGrid({
  movies = [],
  status = 'success',
  error = null,
  onRetry,
  skeletonCount = 12,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  emptyVariant = 'search',
}) {
  const gridSx = {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(auto-fill, minmax(150px, 1fr))',
      md: 'repeat(auto-fill, minmax(165px, 1fr))',
    },
    gap: { xs: 1.5, sm: 2, md: 2.5 },
  };

  if (status === 'loading') {
    return (
      <Box sx={gridSx} aria-busy="true" aria-label="Loading movies">
        {/* Index keys are safe here: the list is a fixed-length set of
            placeholders, never reordered, filtered or re-rendered with state. */}
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <MovieCardSkeleton key={`skeleton-${index}`} />
        ))}
      </Box>
    );
  }

  if (status === 'error') {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!movies.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        variant={emptyVariant}
      />
    );
  }

  return (
    <Box sx={gridSx}>
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} priority={index < 6} />
      ))}
    </Box>
  );
}
