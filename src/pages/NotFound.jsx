import { Box, Button, Container, Stack, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { Link as RouterLink } from 'react-router-dom';

/**
 * 404 page.
 *
 * Reachable from a mistyped URL or a stale link. Because the app is a SPA with a
 * catch-all Netlify redirect, this is what users see instead of a server error
 * page — so it offers a way back rather than just stating the problem.
 */
export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 800, color: 'primary.main' }}>
            404
          </Typography>
          <Typography variant="h3" component="p">
            We couldn’t find that page
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
            The link may be broken, or the page may have been moved. Let’s get you back to the movies.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained" startIcon={<HomeIcon />} sx={{ mt: 1 }}>
            Back to home
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
