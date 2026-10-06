import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  AppBar,
  Avatar,
  Badge,
  Box,
  Collapse,
  Container,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import CloseIcon from '@mui/icons-material/Close';

import SearchBar from '../SearchBar';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useThemeMode } from '../../context/ThemeContext';
import { USE_MOCK_DATA } from '../../utils/constants';

/**
 * Top navigation.
 *
 * The search field sits inline on tablet and up, and collapses behind an icon
 * button on phones so the header does not wrap to two rows on a small screen.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { count } = useFavorites();
  const { isDark, toggleTheme } = useThemeMode();

  const [searchOpen, setSearchOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const isOnHome = location.pathname === '/';

  function handleLogout() {
    setMenuAnchor(null);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <AppBar position="sticky">
      {/* Visible reminder whenever the app is running on bundled sample data
          instead of the live TMDb API — no silent fake data. */}
      {USE_MOCK_DATA && (
        <Alert
          severity="info"
          icon={false}
          // Static banner, not a live update — see the note in Login.jsx.
          role="status"
          sx={{ borderRadius: 0, justifyContent: 'center', py: 0.25, fontSize: 13 }}
        >
          Demo data mode — showing bundled sample movies. Add <code>VITE_TMDB_TOKEN</code> to load live data
          from TMDb.
        </Alert>
      )}

      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ gap: 1.5 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'text.primary',
              flexShrink: 0,
            }}
          >
            <MovieOutlinedIcon color="primary" />
            <Typography variant="h4" sx={{ fontSize: { xs: '1rem', sm: '1.15rem' }, fontWeight: 800 }}>
              Movie<span style={{ color: '#4f46e5' }}>Explorer</span>
            </Typography>
          </Box>

          {/* Inline search from md up. */}
          <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' }, maxWidth: 520, mx: 'auto' }}>
            <SearchBar />
          </Box>

          <Box sx={{ flex: 1, display: { xs: 'block', md: 'none' } }} />

          {/* Search toggle for small screens. */}
          <IconButton
            sx={{ display: { md: 'none' } }}
            onClick={() => setSearchOpen((open) => !open)}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
          >
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
          </IconButton>

          <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleTheme} aria-label="Toggle colour theme">
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Your favourites">
            <IconButton
              component={RouterLink}
              to="/favorites"
              aria-label={`Favourites, ${count} saved`}
              color={location.pathname === '/favorites' ? 'primary' : 'default'}
            >
              <Badge badgeContent={count} color="secondary" max={99}>
                <FavoriteIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton onClick={(event) => setMenuAnchor(event.currentTarget)} aria-label="Account menu" size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled sx={{ opacity: '1 !important' }}>
              <Typography variant="body2" color="text.secondary">
                Signed in as <strong>{user?.username}</strong>
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>

        {/* Collapsible search row for phones. Hidden while on the home page,
            where the main search field is already visible in the page body. */}
        <Collapse in={searchOpen && !isOnHome} unmountOnExit>
          <Box sx={{ pb: 1.5, display: { md: 'none' } }}>
            <SearchBar />
          </Box>
        </Collapse>
      </Container>
    </AppBar>
  );
}
