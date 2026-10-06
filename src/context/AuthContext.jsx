import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as authService from '../services/authService';

/**
 * Authentication state.
 *
 * Wraps the simulated auth service so components never touch localStorage or
 * the service directly. Components ask two questions: "is somebody signed in?"
 * and "sign this person in/out".
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // The stored session is read lazily, during the first render, rather than in
  // a mount effect. localStorage is synchronous, so there is nothing to wait
  // for — and reading it here means the app never renders a signed-out frame
  // for a signed-in user, which is what causes the login-page flash on refresh.
  const [user, setUser] = useState(() => authService.getStoredSession());
  const isRestoring = false;

  const login = useCallback(async (credentials) => {
    const signedInUser = await authService.signIn(credentials);
    setUser(signedInUser);
    return signedInUser;
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isRestoring,
      login,
      logout,
    }),
    [user, isRestoring, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}

export default AuthContext;
