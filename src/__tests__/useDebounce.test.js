import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useDebounce from '../hooks/useDebounce';

/**
 * Debounce tests.
 *
 * The behaviour that matters: rapid typing produces one settled value, not one
 * per keystroke, and clearing the field is released immediately so emptying the
 * search box feels instant.
 */
describe('useDebounce', () => {
  it('returns the initial value straight away', () => {
    const { result } = renderHook(() => useDebounce('inception', 400));
    expect(result.current).toBe('inception');
  });

  it('does not release a new value before the delay elapses', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'in' },
    });

    rerender({ value: 'inception' });
    expect(result.current).toBe('in'); // still the old value

    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(result.current).toBe('in');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('inception');

    vi.useRealTimers();
  });

  it('collapses a burst of keystrokes into a single settled value', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'i' },
    });

    for (const value of ['in', 'inc', 'ince', 'incep', 'incept']) {
      rerender({ value });
      act(() => {
        vi.advanceTimersByTime(50); // typing faster than the debounce window
      });
    }

    expect(result.current).toBe('i'); // nothing has settled yet

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('incept');

    vi.useRealTimers();
  });

  it('releases an empty value immediately, so clearing feels instant', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'inception' },
    });

    rerender({ value: '' });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('');
    vi.useRealTimers();
  });
});
