import { createTheme } from '@mui/material/styles';

/**
 * Material UI theme factory.
 *
 * Both palettes are defined in one place so that light and dark mode stay in
 * sync: adding a colour means adding it twice, in the same order, rather than
 * hunting through components for hard-coded hex values.
 *
 * The same object is also used to give MUI's components a consistent look
 * (flat cards, sentence-case buttons, tighter buttons) so individual components
 * do not need their own overrides.
 */

const SHARED = {
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 700 },
    h4: { fontSize: '1.05rem', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  shape: { borderRadius: 12 },
};

/** @param {'light'|'dark'} mode */
export function getTheme(mode) {
  const isDark = mode === 'dark';

  return createTheme({
    ...SHARED,
    palette: {
      mode,
      primary: {
        main: isDark ? '#818cf8' : '#4f46e5',
        contrastText: '#ffffff',
      },
      // Amber is reserved for rating stars, so it reads as "score" at a glance.
      secondary: {
        main: isDark ? '#fbbf24' : '#f59e0b',
        contrastText: '#1f2937',
      },
      background: {
        default: isDark ? '#0b0f14' : '#f5f6fa',
        paper: isDark ? '#131a22' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e8edf4' : '#111827',
        secondary: isDark ? '#9aa7b8' : '#5b6473',
      },
      divider: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(17,24,39,0.10)',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Keyboard users get a visible focus ring; mouse users do not.
          '*:focus-visible': { outline: '2px solid', outlineColor: isDark ? '#818cf8' : '#4f46e5', outlineOffset: 2 },
          body: { scrollbarGutter: 'stable' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10, paddingInline: 18 } },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(17,24,39,0.08)'}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'transparent' },
        styleOverrides: {
          root: {
            backdropFilter: 'blur(10px)',
            backgroundColor: isDark ? 'rgba(11,15,20,0.82)' : 'rgba(255,255,255,0.82)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(17,24,39,0.08)'}`,
          },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
      },
    },
  });
}

export default getTheme;
