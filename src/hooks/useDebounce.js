import { useEffect, useState } from 'react';

/**
 * Returns `value` after it has stopped changing for `delay` milliseconds.
 *
 * Used to stop the search box firing a request on every keystroke: typing
 * "interstellar" would otherwise issue eleven requests, eleven of which are
 * wasted, and the results would visibly flicker as they arrive out of order.
 *
 * @template T
 * @param {T} value
 * @param {number} delay - milliseconds of quiet before the value is released
 * @returns {T}
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // A clearing edit is released on the next tick rather than after the full
    // delay, so emptying the search box feels instant. Using a zero timeout
    // keeps a single code path — and keeps every state update inside a timer
    // callback rather than synchronously in the effect body, which would
    // trigger an extra render pass on each keystroke.
    const effectiveDelay = value === '' ? 0 : delay;
    const timer = setTimeout(() => setDebouncedValue(value), effectiveDelay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
