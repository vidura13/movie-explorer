import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Light/dark mode.
 *
 * On the first visit there is no stored preference, so the operating system's
 * setting decides the starting mode. Once the user toggles, that explicit
 * choice is stored and always wins — an app that keeps overriding a deliberate
 * choice with the OS setting is a common and irritating bug.
 */

const ThemeContext = createContext(null);

/** Read the OS preference, guarding against older browsers. */
function systemPrefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useLocalStorage(STORAGE_KEYS.theme, systemPrefersDark() ? 'dark' : 'light');

  const toggleTheme = useCallback(() => {
    setMode((current) => (current === 'dark' ? 'light' : 'dark'));
  }, [setMode]);

  const value = useMemo(() => ({ mode, isDark: mode === 'dark', toggleTheme, setMode }), [mode, toggleTheme, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used inside a ThemeProvider');
  return context;
}

export default ThemeContext;
