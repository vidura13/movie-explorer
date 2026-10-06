import { Alert, AlertTitle, Button, Box, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { describeError } from '../utils/errorMessages';

/**
 * The single place an API failure is presented to the user.
 *
 * `describeError` maps the normalised ApiError kinds onto plain language, so
 * this component never has to know what a 429 is. The raw error object is shown
 * only in development, where it is useful; in production a user should never see
 * "TypeError: Failed to fetch".
 */
export default function ErrorState({ error, onRetry, compact = false }) {
  const { title, description, retryable } = describeError(error);

  if (compact) {
    return (
      <Alert
        severity="error"
        action={
          retryable && onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : null
        }
      >
        <AlertTitle sx={{ mb: 0.25 }}>{title}</AlertTitle>
        {description}
      </Alert>
    );
  }

  return (
    <Box sx={{ py: { xs: 5, md: 8 }, px: 2, display: 'flex', justifyContent: 'center' }}>
      <Stack spacing={1.5} alignItems="center" sx={{ maxWidth: 460, textAlign: 'center' }}>
        <Typography variant="h3" component="p">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>

        {retryable && onRetry && (
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={onRetry} sx={{ mt: 0.5 }}>
            Try again
          </Button>
        )}

        {import.meta.env.DEV && error?.detail && (
          <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace', mt: 2 }}>
            {error.kind}: {error.detail}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
