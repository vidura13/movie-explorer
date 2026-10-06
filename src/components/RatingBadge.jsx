import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { formatRating } from '../utils/formatters';

/**
 * Rating pill shown over the poster.
 *
 * Amber is used for scores throughout the app (see theme.js), and a title with
 * no votes yet reads "N/A" rather than "0.0" — the two mean different things,
 * and a new release is not a badly reviewed one.
 */
export default function RatingBadge({ rating, sx }) {
  const hasRating = typeof rating === 'number' && rating > 0;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.4,
        borderRadius: 999,
        // Near-opaque regardless of theme, because the pill always sits on top
        // of poster artwork rather than on the page background.
        bgcolor: 'rgba(0, 0, 0, 0.72)',
        color: '#fff',
        backdropFilter: 'blur(4px)',
        ...sx,
      }}
    >
      <StarIcon sx={{ fontSize: 14, color: hasRating ? 'secondary.main' : 'rgba(255,255,255,0.5)' }} />
      <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1 }}>
        {formatRating(rating)}
      </Typography>
    </Box>
  );
}
