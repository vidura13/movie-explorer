import { useCallback, useEffect, useState } from 'react';

/**
 * useState, but persisted to localStorage.
 *
 * Used for the session, theme preference, favourites and the last search query.
 * The brief only asks for persistence; the extra work here is about not
 * crashing: localStorage throws in private-browsing modes, can be disabled
 * entirely, and can contain hand-edited or half-written JSON from an older
 * version of the app. All three cases fall back to the default value.
 *
 * @template T
 * @param {string} key - storage key (namespaced, see utils/constants.js)
 * @param {T} defaultValue - used when nothing is stored, or when reading fails
 * @returns {[T, (value: T | ((previous: T) => T)) => void]}
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => readStoredValue(key, defaultValue));

  // Keep multiple tabs of the same app in sync. Without this, signing out in
  // one tab would leave the other looking signed in until it was reloaded.
  useEffect(() => {
    function handleStorageEvent(event) {
      if (event.key !== key) return;
      setValue(event.newValue === null ? defaultValue : safeParse(event.newValue, defaultValue));
    }

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
    // defaultValue is intentionally excluded: callers pass object literals, and
    // re-subscribing on every render would be worse than a stale default.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next) => {
      setValue((previous) => {
        // Support the functional-update form, matching useState's API.
        const resolved = typeof next === 'function' ? next(previous) : next;

        try {
          if (resolved === null || resolved === undefined) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, JSON.stringify(resolved));
          }
        } catch {
          // Storage full or unavailable: keep the in-memory value so the
          // current session still works.
        }

        return resolved;
      });
    },
    [key],
  );

  return [value, update];
}

/** Parse JSON defensively — never throw on malformed input. */
function safeParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function readStoredValue(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? defaultValue : safeParse(raw, defaultValue);
  } catch {
    return defaultValue;
  }
}

export default useLocalStorage;
