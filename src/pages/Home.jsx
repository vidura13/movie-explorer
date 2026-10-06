import { Box, Container, Stack, Typography } from '@mui/material';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ActiveFilterChips from '../components/ActiveFilterChips';
import MovieGrid from '../components/MovieGrid';
import LoadMoreButton from '../components/LoadMoreButton';
import SectionHeading from '../components/SectionHeading';
import { useMovies } from '../context/MovieContext';
import { pluralise } from '../utils/formatters';

/**
 * Home page: trending, search and filtered browsing in one view.
 *
 * The brief asks for a trending section and a search bar as separate features.
 * They are combined here rather than split across routes because they share the
 * same grid and the same state: typing a query replaces trending with results,
 * and clearing it brings trending back. Duplicating the grid on a second route
 * would mean duplicating its loading, empty and error handling too.
 */
export default function Home() {
  const {
    visibleItems,
    status,
    error,
    retry,
    query,
    source,
    hasMore,
    page,
    totalPages,
    totalResults,
    isAppending,
    isSearching,
    isClientFiltered,
    hasActiveFilters,
    clearFilters,
    loadMore,
    setQuery,
  } = useMovies();

  const isTrendingView = source === 'trending';

  const heading = isSearching ? `Results for “${query.trim()}”` : 'Trending this week';

  const subtitle = (() => {
    if (status === 'loading') return 'Loading…';
    if (status === 'error') return null;
    if (!visibleItems.length) return null;
    if (isClientFiltered) {
      // Be explicit that the count reflects loaded items, not the full match set.
      return `${pluralise(visibleItems.length, 'movie')} after filtering the ${pluralise(totalResults, 'loaded result')}`;
    }
    return pluralise(totalResults, 'movie');
  })();

  return (
    <Container maxWidth="lg" sx={{ pb: 4 }}>
      {/* Search hero, only prominent on first arrival. */}
      <Box sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 2, md: 3 } }}>
        <Stack spacing={1} sx={{ mb: { xs: 2, md: 3 }, textAlign: { xs: 'left', md: 'center' } }}>
          <Typography variant="h1" component="h1">
            Find something worth watching
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search thousands of films, check the ratings, and save the ones you want to remember.
          </Typography>
        </Stack>

        <Box sx={{ maxWidth: 640, mx: 'auto' }}>
          <SearchBar />
        </Box>
      </Box>

      <FilterPanel />
      <ActiveFilterChips />

      <SectionHeading
        title={heading}
        subtitle={subtitle}
        liveMessage={
          status === 'success' ? `${pluralise(visibleItems.length, 'movie')} shown for ${heading}` : ''
        }
        action={
          isTrendingView && !hasActiveFilters && !isSearching ? (
            <Typography variant="caption" color="text.secondary">
              Updated weekly by TMDb
            </Typography>
          ) : null
        }
      />

      <MovieGrid
        movies={visibleItems}
        status={status}
        error={error}
        onRetry={retry}
        emptyTitle={isSearching ? `No results for “${query.trim()}”` : 'No movies match those filters'}
        emptyDescription={
          isSearching
            ? 'Check the spelling, or try a shorter version of the title.'
            : 'Try widening the year range, choosing a different genre, or lowering the minimum rating.'
        }
        emptyActionLabel={hasActiveFilters && !isSearching ? 'Clear filters' : undefined}
        onEmptyAction={hasActiveFilters && !isSearching ? clearFilters : undefined}
      />

      {status === 'success' && visibleItems.length > 0 && (
        <LoadMoreButton
          onLoadMore={loadMore}
          isAppending={isAppending}
          hasMore={hasMore}
          page={page}
          totalPages={totalPages}
          shownCount={visibleItems.length}
          totalResults={totalResults}
        />
      )}

      {/* A failed "load more" leaves the existing grid intact and reports the
          problem inline, rather than replacing everything with an error page. */}
      {status === 'success' && error && (
        <Box sx={{ textAlign: 'center', pb: 3 }}>
          <Typography variant="body2" color="error">
            Could not load more results. Please check your connection and try again.
          </Typography>
        </Box>
      )}

      {/* Convenience escape hatch once the user has scrolled a long way. */}
      {visibleItems.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              setQuery('');
              clearFilters();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                setQuery('');
                clearFilters();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            Back to top
          </Typography>
        </Box>
      )}
    </Container>
  );
}
