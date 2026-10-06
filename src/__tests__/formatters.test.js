import { describe, expect, it } from 'vitest';
import { formatCount, formatMoney, formatRating, formatRuntime, formatYear, pluralise, truncate } from '../utils/formatters';

/**
 * Formatter tests.
 *
 * These are worth testing because TMDb's data is messier than the type
 * definitions suggest: release dates are sometimes empty strings, budget is 0
 * when unknown, and a title with no votes reports a rating of 0 — which must
 * read "N/A" rather than "0.0".
 */
describe('formatYear', () => {
  it('extracts the year from a TMDb date string', () => {
    expect(formatYear('2010-07-15')).toBe('2010');
  });

  it('returns TBA for missing or malformed dates', () => {
    expect(formatYear('')).toBe('TBA');
    expect(formatYear(undefined)).toBe('TBA');
    expect(formatYear(null)).toBe('TBA');
    expect(formatYear('not-a-date')).toBe('TBA');
  });
});

describe('formatRating', () => {
  it('formats to one decimal place', () => {
    expect(formatRating(8.439)).toBe('8.4');
    expect(formatRating(7)).toBe('7.0');
  });

  it('treats zero and missing ratings as N/A rather than 0.0', () => {
    expect(formatRating(0)).toBe('N/A');
    expect(formatRating(undefined)).toBe('N/A');
    expect(formatRating(NaN)).toBe('N/A');
  });
});

describe('formatRuntime', () => {
  it('formats hours and minutes', () => {
    expect(formatRuntime(148)).toBe('2h 28m');
    expect(formatRuntime(120)).toBe('2h');
    expect(formatRuntime(45)).toBe('45m');
  });

  it('returns a placeholder when runtime is unknown', () => {
    expect(formatRuntime(0)).toBe('—');
    expect(formatRuntime(undefined)).toBe('—');
  });
});

describe('formatCount', () => {
  it('abbreviates large numbers', () => {
    expect(formatCount(1200)).toBe('1.2K');
    expect(formatCount(12000)).toBe('12K');
    expect(formatCount(3500000)).toBe('3.5M');
  });

  it('leaves small numbers alone', () => {
    expect(formatCount(42)).toBe('42');
  });
});

describe('formatMoney', () => {
  it('formats with thousands separators', () => {
    expect(formatMoney(165000000)).toBe('$165,000,000');
  });

  it('treats zero as unknown, which is how TMDb reports missing budgets', () => {
    expect(formatMoney(0)).toBe('—');
  });
});

describe('pluralise', () => {
  it('uses the singular for exactly one', () => {
    expect(pluralise(1, 'movie')).toBe('1 movie');
  });

  it('uses the plural otherwise', () => {
    expect(pluralise(0, 'movie')).toBe('0 movies');
    expect(pluralise(20, 'movie')).toBe('20 movies');
  });
});

describe('truncate', () => {
  it('leaves short text untouched', () => {
    expect(truncate('short', 20)).toBe('short');
  });

  it('breaks on a word boundary rather than mid-word', () => {
    const result = truncate('The quick brown fox jumps over the lazy dog', 20);
    expect(result.endsWith('…')).toBe(true);
    expect(result).not.toMatch(/\s…$/); // no trailing space before the ellipsis
    expect('The quick brown fox jumps over the lazy dog'.startsWith(result.slice(0, -1).trim())).toBe(true);
  });
});
