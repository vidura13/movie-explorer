import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS, USE_MOCK_DATA } from '../utils/constants';
import { validateCredentials } from '../utils/validators';

/**
 * Login screen.
 *
 * There is no backend in this project, so authentication is simulated — see
 * src/services/authService.js for what that does and does not claim to be.
 * Because it is simulated, the demo credentials are shown on the card: a
 * reviewer opening the deployed link must be able to get in without being told
 * a password out of band.
 *
 * Validation is deliberately split in two: field-level checks happen on submit
 * (empty fields, minimum length), and credential checking happens in the auth
 * service. The form shows whichever comes back first.
 */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Where to go after signing in. ProtectedRoute passes the attempted path in
  // router state, so a shared /movie/27205 link opened while signed out still
  // lands on the right page after login.
  const redirectTo = location.state?.from?.pathname || '/';

  // Already signed in? The login page has nothing to offer.
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    // Clear the field's error as soon as the user edits it, rather than making
    // them submit again to find out whether the fix worked.
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    const errors = validateCredentials(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillDemoCredentials() {
    setForm({ username: DEMO_CREDENTIALS.username, password: DEMO_CREDENTIALS.password });
    setFieldErrors({});
    setSubmitError('');
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 6,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(1100px 500px at 50% -10%, rgba(129,140,248,0.18), transparent), #0b0f14'
            : 'radial-gradient(1100px 500px at 50% -10%, rgba(79,70,229,0.14), transparent), #f5f6fa',
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <MovieOutlinedIcon color="primary" sx={{ fontSize: 44 }} />
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800 }}>
            Movie Explorer
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Sign in to search films, view details and keep your favourites.
          </Typography>
        </Stack>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <form onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                <TextField
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={(event) => updateField('username', event.target.value)}
                  error={Boolean(fieldErrors.username)}
                  helperText={fieldErrors.username}
                  autoComplete="username"
                  autoFocus
                  fullWidth
                  required
                />

                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password}
                  autoComplete="current-password"
                  fullWidth
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((visible) => !visible)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {submitError && (
                  <Alert severity="error" role="alert">
                    {submitError}
                  </Alert>
                )}

                <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                DEMO ACCOUNT
              </Typography>
            </Divider>

            {/* Credentials are shown, not hidden, and one click fills them in —
                a reviewer should not have to guess or ask. The note below keeps
                the limitation honest rather than implying real security. */}
            <Stack spacing={1.5} alignItems="center">
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Username <strong>{DEMO_CREDENTIALS.username}</strong> · Password{' '}
                <strong>{DEMO_CREDENTIALS.password}</strong>
              </Typography>
              <Button size="small" onClick={fillDemoCredentials} variant="outlined">
                Use demo account
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ maxWidth: 320 }}>
                Signing in is simulated in the browser. No real credentials are involved.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={1} alignItems="center" sx={{ mt: 3 }}>
          {USE_MOCK_DATA && (
            // role="status" rather than MUI's default role="alert": this banner
            // is static information that is present from first paint, so it
            // must not be announced as an assertive live update (which is what
            // role="alert" tells a screen reader to interrupt and read out).
            <Alert severity="info" role="status" sx={{ width: '100%' }}>
              Demo data mode is on: the app is showing bundled sample movies instead of the live TMDb API.
            </Alert>
          )}
          <Typography variant="caption" color="text.secondary" textAlign="center">
            This product uses the TMDB API but is not endorsed or certified by TMDB. ·{' '}
            <Link href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" underline="hover">
              themoviedb.org
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
