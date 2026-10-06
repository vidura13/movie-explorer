import { describe, expect, it } from 'vitest';
import { ApiError } from '../api/axiosClient';
import { describeError, isCancellation } from '../utils/errorMessages';

/**
 * Error-mapping tests.
 *
 * The point of these is that no failure mode ever reaches the user as a raw
 * exception or an empty screen — every kind maps to readable copy, and only
 * the kind that can actually succeed on a retry offers a retry button.
 */
describe('describeError', () => {
  it('maps a network failure to actionable copy', () => {
    const result = describeError(new ApiError({ kind: 'network' }));
    expect(result.title).toBe('Connection problem');
    expect(result.retryable).toBe(true);
  });

  it('maps an auth failure and points at the real cause', () => {
    const result = describeError(new ApiError({ kind: 'unauthorised', status: 401 }));
    expect(result.title).toBe('Movie service unavailable');
    expect(result.description).toMatch(/VITE_TMDB_TOKEN/);
  });

  it('maps rate limiting', () => {
    expect(describeError(new ApiError({ kind: 'rateLimited', status: 429 })).title).toBe('Too many requests');
  });

  it('does not offer a retry for a missing title', () => {
    expect(describeError(new ApiError({ kind: 'notFound', status: 404 })).retryable).toBe(false);
  });

  it('does not offer a retry for a request the user superseded', () => {
    expect(describeError(new ApiError({ kind: 'cancelled' })).retryable).toBe(false);
  });

  it('falls back gracefully for an unrecognised error', () => {
    const result = describeError(new Error('boom'));
    expect(result.title).toBe('Something went wrong');
    expect(result.description).toBeTruthy();
  });

  it('handles undefined without throwing', () => {
    expect(() => describeError(undefined)).not.toThrow();
  });
});

describe('isCancellation', () => {
  it('identifies superseded requests so they can be ignored', () => {
    expect(isCancellation(new ApiError({ kind: 'cancelled' }))).toBe(true);
    expect(isCancellation(new ApiError({ kind: 'network' }))).toBe(false);
    expect(isCancellation(undefined)).toBe(false);
  });
});
