import { useEffect } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * YouTube trailer in a modal.
 *
 * The iframe is only rendered while the dialog is open — `open ? <iframe/> :
 * null` rather than always-mounted-and-hidden. An unconditional iframe would
 * load YouTube's player (hundreds of kilobytes plus tracking) on every movie
 * page, even for the majority of visitors who never press play.
 *
 * TMDb's `videos` payload supplies the `key`; the app never fabricates one.
 */
export default function TrailerModal({ open, onClose, trailer }) {
  // Escape closes the dialog: MUI handles the key event, this just needs to be
  // wired to the same handler the close button uses.
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="trailer-dialog-title"
      slotProps={{ paper: { sx: { bgcolor: '#000', backgroundImage: 'none' } } }}
    >
      <DialogTitle
        id="trailer-dialog-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', pr: 1 }}
      >
        <Typography variant="subtitle1" component="span" sx={{ fontWeight: 700 }}>
          {trailer?.name || 'Official trailer'}
        </Typography>
        <IconButton onClick={onClose} aria-label="Close trailer" sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            bgcolor: '#000',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {open && trailer?.key && (
            <Box
              component="iframe"
              title={trailer.name || 'Movie trailer'}
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            />
          )}
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'rgba(255,255,255,0.6)' }}>
          Trailer provided by YouTube. Some videos may be region-restricted.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
