import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Stack, Typography } from '@mui/material';
import PosterImage from './PosterImage';
import RatingBadge from './RatingBadge';
import FavoriteButton from './FavoriteButton';
import { formatYear } from '../utils/formatters';

/**
 * A single movie in a grid: poster, title, release year and rating.
 *
 * Memoised because a page of 20 cards re-renders on every parent state change
 * (a keystroke in the search box, a filter toggle). With `memo`, a card only
 * re-renders when its own movie object or the favourites list changes.
 *
 * Accessibility note: the poster link and the favourite button are siblings,
 * not nested. A <button> inside an <a> is invalid HTML and leaves screen-reader
 * and keyboard users with ambiguous behaviour — a common mistake in exactly
 * this card pattern.
 */
function MovieCard({ movie, priority = false }) {
  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          '& .movie-card-poster': { filter: 'brightness(1.06)' },
        },
        // Focus-within mirrors hover, so keyboard users get the same affordance
        // as mouse users when they tab to the link.
        '&:focus-within': { transform: 'translateY(-4px)', boxShadow: 6 },
      }}
    >
      <Box
        component={RouterLink}
        to={`/movie/${movie.id}`}
        aria-label={`${movie.title} (${formatYear(movie.release_date)}) — view details`}
        sx={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
      >
        <Box className="movie-card-poster" sx={{ transition: 'filter 160ms ease' }}>
          <PosterImage
            movie={movie}
            sizeKey="md"
            // The first row of results is above the fold; eager-loading those
            // improves the largest-contentful-paint measurement.
            priority={priority}
          />
        </Box>
      </Box>

      <FavoriteButton
        movie={movie}
        size="small"
        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
      />

      <RatingBadge rating={movie.vote_average} sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }} />

      <Box
        component={RouterLink}
        to={`/movie/${movie.id}`}
        tabIndex={-1}
        aria-hidden="true"
        sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit' }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6em', // reserve two lines so titles align across a row
          }}
        >
          {movie.title}
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {formatYear(movie.release_date)}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}

export default memo(MovieCard);
