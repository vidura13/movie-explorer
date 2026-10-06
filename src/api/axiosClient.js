import axios from 'axios';
import { TMDB_BASE_URL, TMDB_TOKEN, REQUEST_TIMEOUT_MS } from '../utils/constants';

/**
 * A single, predictable error shape for the whole application.
 *
 * axios throws several unrelated error shapes (HTTP failures, timeouts, DNS
 * failures, aborted requests). Components should not have to know about
 * `error.response.data.status_message` versus `error.code === 'ECONNABORTED'`,
 * so the interceptor below converts everything into an ApiError and the UI
 * only ever branches on `kind`.
 */
export class ApiError extends Error {
  /**
   * @param {object} options
   * @param {string} options.kind - 'network' | 'timeout' | 'unauthorised' | 'notFound'
   *                                | 'rateLimited' | 'server' | 'cancelled' | 'unknown'
   * @param {string} [options.detail] - developer-facing detail from TMDb
   * @param {number} [options.status] - HTTP status when there was a response
   */
  constructor({ kind, detail = '', status = 0 }) {
    super(detail || kind);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.detail = detail;
  }
}

const axiosClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    // TMDb's current recommendation is the v4 Read Access Token sent as a
    // Bearer header, rather than the legacy ?api_key= query parameter. The
    // credential therefore never appears in URLs, logs or browser history.
    ...(TMDB_TOKEN ? { Authorization: `Bearer ${TMDB_TOKEN}` } : {}),
  },
});

// Request interceptor: pin the language and adult-content flags centrally.
axiosClient.interceptors.request.use((config) => {
  config.params = { language: 'en-US', ...config.params };
  return config;
});

// Response interceptor: normalise every failure into an ApiError.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Requests cancelled by AbortController are expected during fast typing.
    // They are tagged and re-thrown so callers can ignore them silently.
    if (axios.isCancel?.(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(new ApiError({ kind: 'cancelled', detail: 'Request cancelled' }));
    }

    // No response at all: offline, DNS failure, CORS, or our own timeout.
    if (!error.response) {
      const timedOut = error.code === 'ECONNABORTED';
      return Promise.reject(
        new ApiError({
          kind: timedOut ? 'timeout' : 'network',
          detail: timedOut ? 'The request timed out' : 'No response from the server',
        }),
      );
    }

    const { status, data } = error.response;
    const detail = data?.status_message || '';

    const kindByStatus = {
      401: 'unauthorised',
      403: 'unauthorised',
      404: 'notFound',
      429: 'rateLimited',
    };
    const kind = kindByStatus[status] || (status >= 500 ? 'server' : 'unknown');

    return Promise.reject(new ApiError({ kind, detail, status }));
  },
);

export default axiosClient;
