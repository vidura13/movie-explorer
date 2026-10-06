/**
 * Form validation for the login screen.
 *
 * Kept as a pure function so it can be unit-tested without rendering anything,
 * and so the rules are stated in exactly one place. Returning a map of field
 * name to message (rather than throwing or returning a boolean) lets the form
 * attach each message to the input that caused it.
 */

export const USERNAME_MIN_LENGTH = 3;
export const PASSWORD_MIN_LENGTH = 6;

/**
 * @param {{username?: string, password?: string}} credentials
 * @returns {Record<string, string>} empty object when the input is valid
 */
export function validateCredentials({ username = '', password = '' } = {}) {
  const errors = {};

  const trimmedUsername = username.trim();

  if (!trimmedUsername) {
    errors.username = 'Please enter your username.';
  } else if (trimmedUsername.length < USERNAME_MIN_LENGTH) {
    errors.username = `Username must be at least ${USERNAME_MIN_LENGTH} characters.`;
  }

  if (!password) {
    errors.password = 'Please enter your password.';
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  return errors;
}

/** Convenience predicate used by the submit button's disabled state. */
export function isCredentialsValid(credentials) {
  return Object.keys(validateCredentials(credentials)).length === 0;
}
