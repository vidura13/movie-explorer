import { Box, Typography } from '@mui/material';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import { buildImageSrcSet, buildImageUrl } from '../utils/imageUrl';
import { IMAGE_SIZES } from '../utils/constants';

/**
 * Poster artwork with a designed fallback.
 *
 * A meaningful share of TMDb entries have no poster (and new releases often
 * appear before artwork is uploaded). Rendering a broken image, or an empty
 * grey rectangle, looks like a bug — so the fallback is a deliberate
 * film-strip panel carrying the title, which reads as intentional design.
 */
export default function PosterImage({ movie, sizeKey = 'md', sizes, priority = false, sx }) {
  const src = buildImageUrl(movie?.poster_path, IMAGE_SIZES.poster[sizeKey]);

  // 2:3 is the standard movie-poster ratio; fixing it prevents the grid from
  // reflowing as images load, which is the main cause of layout shift here.
  const frameSx = { position: 'relative', aspectRatio: '2 / 3', overflow: 'hidden', ...sx };

  if (!src) {
    return (
      <Box
        sx={{
          ...frameSx,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          p: 2,
          textAlign: 'center',
          bgcolor: 'action.hover',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <MovieOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {movie?.title}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
          No artwork available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={frameSx}>
      <Box
        component="img"
        src={src}
        srcSet={buildImageSrcSet(movie.poster_path, [
          { size: IMAGE_SIZES.poster.sm, width: 185 },
          { size: IMAGE_SIZES.poster.md, width: 342 },
          { size: IMAGE_SIZES.poster.lg, width: 500 },
        ])}
        // Tell the browser how wide the image will actually be painted so it
        // picks the smallest sufficient file from the srcset.
        sizes={sizes || '(max-width: 600px) 45vw, (max-width: 900px) 30vw, 200px'}
        alt={`${movie?.title} poster`}
        // Cards above the fold are loaded eagerly; everything else is lazy so a
        // 20-item page does not request 20 posters at once.
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          bgcolor: 'action.hover',
        }}
      />
    </Box>
  );
}
