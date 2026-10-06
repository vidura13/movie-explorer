import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MAX_TMDB_PAGE } from '../utils/constants';

/**
 * Explicit "Load more" pagination.
 *
 * This is the project's chosen pagination model. TMDb's own constraint shapes
 * the behaviour: `total_pages` is capped at 500 regardless of how many results
 * match, so once the cap is reached the button is replaced by an end-of-results
 * message. A button that silently does nothing when clicked is worse than no
 * button.
 *
 * The alternative — an IntersectionObserver that loads the next page as the
 * sentinel scrolls into view — is a drop-in replacement for this component;
 * see the pagination note in the README for the trade-off.
 */
export default function LoadMoreButton({ onLoadMore, isAppending, hasMore, page, totalPages, shownCount, totalResults }) {
  // Nothing to say on a short first page that is already complete.
  const reachedCap = page >= MAX_TMDB_PAGE && hasMore;
  const isComplete = !hasMore;

  if (isComplete && shownCount === 0) return null;

  if (isComplete) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          {reachedCap
            ? `Showing the first ${shownCount} results — TMDb does not allow paging past ${MAX_TMDB_PAGE} pages.`
            : `That’s all ${totalResults > shownCount ? 'available ' : ''}results${totalResults ? ` (${shownCount} of ${totalResults.toLocaleString('en-US')})` : ''}.`}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
      <Button
        variant="outlined"
        size="large"
        onClick={onLoadMore}
        disabled={isAppending}
        startIcon={isAppending ? <CircularProgress size={18} /> : <ExpandMoreIcon />}
        aria-label={isAppending ? 'Loading more movies' : 'Load more movies'}
      >
        {isAppending ? 'Loading…' : 'Load more'}
      </Button>
      <Typography variant="caption" color="text.secondary">
        Page {page} of {totalPages}
      </Typography>
    </Stack>
  );
}
