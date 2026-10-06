import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

/**
 * Test environment setup.
 *
 * jsdom implements neither matchMedia nor IntersectionObserver, and both are
 * used by the application (the theme reads the OS colour-scheme preference).
 * Stubbing them here means tests exercise real component code rather than a
 * version with the calls removed.
 */

afterEach(() => {
  cleanup();
});

// jsdom has no matchMedia at all; MUI's useMediaQuery and ThemeContext need one.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, // default to light mode in tests
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Not exercised today, but stubbed so a future infinite-scroll component does
// not fail for an unrelated reason.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

// jsdom does not implement scrollTo.
window.scrollTo = vi.fn();
