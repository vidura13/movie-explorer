import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { MovieProvider } from '../../context/MovieContext';

/**
 * Shared chrome for every signed-in page: header, content area, footer.
 *
 * MovieProvider lives here rather than in App so that movie data is only
 * fetched once the user is past the login screen. Because the layout stays
 * mounted while child routes change, the loaded search results and filters
 * survive navigating into a title and back — which is what makes the "back"
 * button feel right.
 */
export default function AppLayout() {
  return (
    <MovieProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        {/* Skip link: the first thing a keyboard user reaches, moving focus
            past the header navigation straight to the results. */}
        <Box
          component="a"
          href="#main-content"
          sx={{
            position: 'absolute',
            left: -9999,
            '&:focus': {
              position: 'static',
              display: 'block',
              p: 1,
              textAlign: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            },
          }}
        >
          Skip to content
        </Box>

        <Box component="main" id="main-content" sx={{ flex: 1, width: '100%' }}>
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </MovieProvider>
  );
}
