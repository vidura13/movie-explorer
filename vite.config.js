import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Single config file for both the dev/build pipeline and the test runner.
// Importing defineConfig from 'vitest/config' (rather than 'vite') lets the
// `test` block below be understood by both tools without a second config file.
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: true, // listen on 0.0.0.0, not just loopback
    /**
     * Hosted dev environments — cloud IDEs, containers and preview proxies —
     * serve the app from a generated hostname instead of localhost, and Vite
     * rejects unrecognised Host headers to prevent DNS-rebinding attacks.
     * A leading dot permits the domain and all of its subdomains. This affects
     * `npm run dev` only; the production build is unaffected.
     */
    allowedHosts: ['.e2b.app'],
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        /**
         * Split the heaviest vendors out of the main bundle so the first paint
         * does not wait on all of Material UI.
         *
         * This must be a function rather than the object form
         * (`{ mui: ['@mui/material'] }`): Vite 8 builds with Rolldown, which
         * only accepts the callback form and fails the build outright
         * otherwise. The callback form is also supported by Rollup, so it keeps
         * working if the bundler ever changes back.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) {
            return 'react';
          }
          return undefined;
        },
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],

    /**
     * The end-to-end tests walk through several sequential steps — sign in, wait
     * for trending, open a dropdown, wait for a filtered request — and the
     * sample-data service deliberately simulates ~320ms of network latency per
     * request so that loading states are real. The 5s default is too tight for
     * a multi-step journey and produced timeouts that looked like product
     * failures. Unit tests still finish in milliseconds.
     */
    testTimeout: 15_000,

    /**
     * Force sample data for the whole test run.
     *
     * Without this, a developer who has a .env with a real token gets an
     * integration suite that calls the live TMDb API: it needs a working
     * network, it depends on whichever films happen to be trending this week,
     * and it fails for reasons that have nothing to do with the code.
     *
     * Tests must be deterministic and offline. The live API is verified
     * manually (see the README), not on every `npm test`.
     */
    env: {
      VITE_USE_MOCK: 'true',
    },
  },
});
