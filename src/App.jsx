import { useMemo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import getTheme from './theme';
import { ThemeProvider, useThemeMode } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import MovieDetailsPage from './pages/MovieDetailsPage';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';

/**
 * Root component: providers on the outside, routes on the inside.
 *
 * Provider order matters and is deliberate:
 *   ThemeProvider   — outermost, because everything below renders inside a theme
 *   AuthProvider    — determines whether protected routes render at all
 *   FavoritesProvider — available to the header and every grid; cheap and global
 *   MovieProvider   — scoped to AppLayout, so the app does not fetch trending
 *                     data while the user is still sitting on the login screen
 */
function ThemedApplication() {
  const { mode } = useThemeMode();
  // Rebuilding the theme object on every render would defeat MUI's internal
  // memoisation, so it is derived from `mode` only.
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Everything below requires a session. */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/movie/:id" element={<MovieDetailsPage />} />
                  <Route path="/favorites" element={<Favorites />} />
                </Route>
              </Route>

              {/* Unknown paths land on a friendly 404 rather than a blank screen. */}
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </MuiThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApplication />
    </ThemeProvider>
  );
}
