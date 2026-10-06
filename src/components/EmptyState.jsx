import { Box, Button, Stack, Typography } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';

/**
 * Shown when a request succeeded but matched nothing.
 *
 * An empty result is not an error, and it deserves a real message rather than
 * a blank area. When the emptiness is caused by a search term or filters, the
 * copy says which one and offers the action that fixes it.
 */
export default function EmptyState({
  title = 'No movies found',
  description = 'Try a different spelling, or search for another title.',
  actionLabel,
  onAction,
  variant = 'search',
}) {
  const Icon = variant === 'favorites' ? MovieOutlinedIcon : SearchOffIcon;

  return (
    <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 }, px: 2 }}>
      <Stack spacing={1.5} alignItems="center">
        <Icon sx={{ fontSize: 56, color: 'text.disabled' }} />
        <Typography variant="h3" component="p">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
        {actionLabel && onAction && (
          <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
