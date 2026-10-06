import { IconButton, Tooltip, useTheme } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavorites } from '../context/FavoritesContext';

/**
 * Heart toggle used on cards and on the detail page.
 *
 * The button stops propagation and prevents the default action, because on the
 * Home grid it sits inside a card that is itself a link to the detail page —
 * clicking the heart must save the movie, not navigate away from the grid.
 */
export default function FavoriteButton({ movie, size = 'medium', sx }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const theme = useTheme();

  const saved = isFavorite(movie.id);

  return (
    <Tooltip title={saved ? 'Remove from favourites' : 'Save to favourites'}>
      <IconButton
        size={size}
        aria-label={saved ? `Remove ${movie.title} from favourites` : `Save ${movie.title} to favourites`}
        aria-pressed={saved}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleFavorite(movie);
        }}
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(4px)',
          '&:hover': {
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.75)' : '#fff',
          },
          ...sx,
        }}
      >
        {saved ? <FavoriteIcon fontSize="small" color="error" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
