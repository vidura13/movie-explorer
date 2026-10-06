import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

/**
 * Gate for authenticated areas.
 *
 * Two details worth noting:
 *
 *  - While the stored session is being read, this renders a spinner instead of
 *    redirecting. Without the `isRestoring` check, a refresh would bounce a
 *    signed-in user to /login for one frame before their session was loaded.
 *
 *  - The attempted path is passed along in router state, so Login can send the
 *    user back to the page they were actually trying to open — for example a
 *    shared /movie/27205 link opened while signed out.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress aria-label="Restoring your session" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
