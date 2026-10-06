/**
 * Turns an ApiError (see src/api/axiosClient.js) into copy a real person can
 * act on. Keeping the strings here — rather than inline in components — means
 * every failure is worded once and consistently.
 */

const MESSAGES = {
  network: {
    title: 'Connection problem',
    description: 'We could not reach the movie database. Check your internet connection and try again.',
  },
  timeout: {
    title: 'That took too long',
    description: 'The movie database did not respond in time. Please try again.',
  },
  unauthorised: {
    title: 'Movie service unavailable',
    description:
      'The app could not authenticate with TMDb. If you are running this locally, check that VITE_TMDB_TOKEN is set correctly.',
  },
  notFound: {
    title: 'Not found',
    description: 'We could not find what you were looking for. It may have been removed from TMDb.',
  },
  rateLimited: {
    title: 'Too many requests',
    description: 'The app has been asking for data too quickly. Please wait a moment and try again.',
  },
  server: {
    title: 'The movie database is having trouble',
    description: 'This is a problem on TMDb’s side, not yours. Please try again in a moment.',
  },
  unknown: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred while loading movies. Please try again.',
  },
};

const FALLBACK = MESSAGES.unknown;

/**
 * @param {unknown} error
 * @returns {{ title: string, description: string, kind: string, retryable: boolean }}
 */
export function describeError(error) {
  const kind = error?.kind || 'unknown';
  const message = MESSAGES[kind] || FALLBACK;

  return {
    ...message,
    kind,
    // Nothing the user can retry their way out of on a cancelled request, and
    // a missing title will still be missing next time.
    retryable: kind !== 'cancelled' && kind !== 'notFound',
  };
}

/** True when a rejection is an intentional cancellation and should be ignored. */
export function isCancellation(error) {
  return error?.kind === 'cancelled';
}
