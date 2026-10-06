import { Box, Stack, Typography } from '@mui/material';

/**
 * Page and section headings, with an optional right-hand action and a live
 * region for result counts.
 *
 * The count is announced politely so screen-reader users learn that a search
 * finished and how much it found, without the announcement interrupting what
 * they are currently reading.
 */
export default function SectionHeading({ title, subtitle, action, liveMessage }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
      spacing={1.5}
      sx={{ mb: 2.5, mt: { xs: 3, md: 4 } }}
    >
      <Box>
        <Typography variant="h2" component="h2">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {action}

      {/* Visually hidden, but announced by assistive technology. */}
      <Box aria-live="polite" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {liveMessage}
      </Box>
    </Stack>
  );
}
