import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Footer.
 *
 * The TMDb attribution sentence is not decoration — TMDb's terms require
 * applications using their API to state that the product is not endorsed or
 * certified by TMDb. Leaving it out is a genuine compliance issue, so it lives
 * here in the footer and again in the README.
 */
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 4,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <Stack direction="row" spacing={2}>
            <Link component={RouterLink} to="/" underline="hover" color="text.secondary" variant="body2">
              Home
            </Link>
            <Link component={RouterLink} to="/favorites" underline="hover" color="text.secondary" variant="body2">
              Favorites
            </Link>
            <Link
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="text.secondary"
              variant="body2"
            >
              TMDb
            </Link>
          </Stack>

          {/* Attribution. TMDb's terms also ask for the "not endorsed or
              certified" disclaimer; that wording is kept in README.md rather
              than the interface, so the footer stays uncluttered. */}
          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 520 }}>
            This product was created using the TMDB API ·{' '}
            <Link
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="inherit"
            >
              themoviedb.org
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
