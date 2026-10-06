import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * ESLint flat config (ESLint 9+).
 *
 * Two rules here are the ones that actually catch bugs in a project like this,
 * rather than merely enforcing style:
 *
 *   react-hooks/exhaustive-deps  — catches effects that read state they did not
 *     declare, the single most common source of stale-data bugs in React.
 *   react-refresh/only-export-components — keeps every file exporting either
 *     components or helpers, which is what makes hot reload work reliably.
 */
export default [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs['recommended-latest'].rules,
      /**
       * Context files deliberately co-locate a provider with the hook that
       * reads it (and, for favourites, the snapshot helper it needs). Splitting
       * each of those into its own file would add five files and buy nothing at
       * runtime — this rule exists for hot-reload ergonomics, and Fast Refresh
       * handles these files by doing a full reload. Listing the intended
       * exceptions keeps the rule active everywhere else, where it has real
       * value.
       */
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          allowExportNames: ['useThemeMode', 'useAuth', 'useFavorites', 'useMovies', 'toFavoriteSnapshot'],
        },
      ],

      // Unused variables are an error, but an ignored leading underscore is the
      // conventional way to say "intentionally unused".
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],

      // The app never renders raw user HTML, so this is a guard rail rather
      // than a live concern — but it costs nothing to keep switched on.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
    },
  },

  // Test files run in Node with the vitest globals injected via setup.
  {
    files: ['**/*.{test,spec}.{js,jsx}', 'src/test/**/*.js'],
    languageOptions: {
      globals: { ...globals.node, vi: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly' },
    },
  },
];
