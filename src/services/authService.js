import { DEMO_CREDENTIALS, STORAGE_KEYS } from '../utils/constants';

/**
 * Simulated authentication.
 *
 * The brief asks for a username/password login but specifies no backend, no
 * user model and no auth endpoint. This module provides a self-contained
 * stand-in so the login screen is a real, functional gate rather than decoration.
 *
 * IMPORTANT — what this is and is not:
 *   - It is a client-side simulation. Credentials are compared in the browser,
 *     and the "session" is a localStorage entry. Anyone with devtools can bypass
 *     it. It exists to satisfy the UI requirement honestly, not to secure data.
 *   - Nothing here is a secret: the demo account is shown on the login card by
 *     design, so a reviewer can sign in without being told the password.
 *
 * To wire this to a real backend later, replace the body of `signIn` with a
 * POST to your auth endpoint and store the returned token instead of the user
 * object. Nothing outside this file needs to change — AuthContext only depends
 * on the resolved shape { id, username, displayName, signedInAt }.
 */

/** Simulated network latency so the submit button's loading state is visible. */
const AUTH_LATENCY_MS = 480;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Read the persisted session.
 * @returns {{id: string, username: string, displayName: string, signedInAt: string}|null}
 */
export function getStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.auth);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Guard against a hand-edited or partially-written localStorage entry.
    return parsed && typeof parsed.username === 'string' ? parsed : null;
  } catch {
    // Corrupt JSON must never take the app down; treat it as "signed out".
    return null;
  }
}

/** Persist a session. */
export function storeSession(user) {
  try {
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(user));
  } catch {
    // Storage can be unavailable (private mode, quota). The session then lives
    // in memory only for this tab, which is an acceptable degradation.
  }
}

/** Remove the persisted session. */
export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.auth);
  } catch {
    /* nothing to clean up */
  }
}

/**
 * Attempt to sign in.
 *
 * Resolves with the user object on success and rejects with a plain Error whose
 * message is safe to render directly in the form's error alert.
 *
 * @param {{username: string, password: string}} credentials
 */
export async function signIn({ username, password }) {
  await wait(AUTH_LATENCY_MS);

  const normalised = (username || '').trim();

  const matches =
    normalised.toLowerCase() === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password;

  if (!matches) {
    // Deliberately vague: never reveal which of the two fields was wrong.
    throw new Error('Incorrect username or password. Try the demo account shown on this card.');
  }

  const user = {
    id: `user-${normalised.toLowerCase()}`,
    username: normalised,
    displayName: normalised.charAt(0).toUpperCase() + normalised.slice(1),
    signedInAt: new Date().toISOString(),
  };

  storeSession(user);
  return user;
}
