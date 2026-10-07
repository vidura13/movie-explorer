# 🎬 Movie Explorer

A React application for discovering films — search thousands of titles, browse trending movies, filter by genre, year and rating, watch trailers, and save favourites.

**Live demo:** _pending deploy_

**Demo login:** `demo` / `demo1234` — shown on the login card.

---

## Features

### User interface

| Requirement | Status | Notes |
| --- | --- | --- |
| Login interface with username and password | ✅ | Field validation, inline errors, show/hide password, session persists across refreshes |
| Search bar for movie names | ✅ | Debounced 400 ms; stale requests are aborted |
| Grid of posters with title, release year, rating | ✅ | Responsive 2–5 columns; designed fallback when TMDb has no artwork |
| Detail view (overview, genre, cast, trailer) | ✅ | Backdrop hero, cast rail with photos, director, runtime, tagline, trailer modal |
| Trending movies section | ✅ | `/trending/movie/week` |
| Light / dark mode | ✅ | Persisted; follows the OS preference on first visit |
| **Filter by genre, year or rating** _(bonus)_ | ✅ | Plus sort order and removable filter chips |
| **YouTube trailers** _(bonus)_ | ✅ | Embedded player plus a direct YouTube link |
| **"Load more" pagination** _(bonus)_ | ✅ | See [Pagination](#pagination) below |

### API integration

- **Trending** — `GET /trending/movie/week`
- **Search** — `GET /search/movie`
- **Details** — `GET /movie/{id}?append_to_response=credits,videos,recommendations` (one request instead of four)
- **Filters** — `GET /discover/movie`
- **Genres** — `GET /genre/movie/list`
- Every failure mode maps to human-readable copy with a retry action.

---

## Tech stack

| Layer | Choice | Version |
| --- | --- | --- |
| UI | React | 19 |
| Build | Vite | 8 |
| Routing | React Router | 7 |
| Styling | Material UI + Emotion | 9 |
| HTTP | axios | 1.20 |
| State | React Context + `useReducer` | — |
| Tests | Vitest + React Testing Library | 5 |
| Deploy | Netlify | — |

### A note on Create React App

Because the React team **[officially deprecated CRA](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)** in February 2025, **Vite** was used instead.

---

## Getting started

Requires **Node 20 or newer** — the same version the production build runs on.

```bash
git clone https://github.com/vidura13/movie-explorer.git
cd movie-explorer
npm ci                   # or: npm install
cp .env.example .env     # Windows cmd: copy .env.example .env
npm run dev
```

Open http://localhost:5173 and sign in with `demo` / `demo1234`.

The API token is optional: with no `.env` at all, the app starts in sample-data mode and is fully usable.

### Environment variables

Create a `.env` file in the project root:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_TMDB_TOKEN` | No | TMDb **API Read Access Token** from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api). Leave blank to run on bundled sample data. |
| `VITE_USE_MOCK` | No | Set to `true` to force sample data even when a token is present. |

```env
VITE_TMDB_TOKEN=your_read_access_token_here
```

### Sample data mode

If `VITE_TMDB_TOKEN` is empty, the app runs on a bundled dataset of 29 films with real poster artwork and
real trailer IDs. Sample data mode exists so the project can be cloned and demonstrated without an API key,
and it is announced in a banner in the header.

Switching between sample and live data requires **no code changes**: both sources return identical response
shapes, so the difference is invisible to every component.

---

## Project structure

```
src/
├── api/          axios instance, endpoint paths, the TMDb service layer
├── components/   reusable UI (MovieCard, SearchBar, MovieGrid, FilterPanel, …)
│   └── layout/   AppLayout, Navbar, Footer
├── context/      Auth, Theme, Movie and Favorites providers
├── hooks/        useDebounce, useLocalStorage, useMovieDetails, useGenres
├── mocks/        sample dataset + a mock API that mirrors TMDb's responses
├── pages/        Login, Home, MovieDetailsPage, Favorites, NotFound
├── routes/       ProtectedRoute
├── services/     authService (simulated authentication)
├── test/         test environment setup
└── utils/        constants, formatters, image URLs, validation, error messages
```

---

## API usage

All requests go through one configured axios instance (`src/api/axiosClient.js`):

- Authenticated with the **API Read Access Token** sent as an `Authorization: Bearer` header — TMDb's
  current recommended method. Unlike the legacy `?api_key=` query parameter, the credential never appears
  in URLs, browser history or server logs.
- A 10-second timeout, so a dead connection cannot hang the interface.
- A response interceptor that converts every failure — HTTP errors, timeouts, offline, cancellations — into
  a single predictable shape. No component ever inspects a raw axios error.
- In-flight requests are cancelled with `AbortController` when a newer one starts, so results from an earlier
  keystroke can never overwrite a later search.
- Trending and the genre list are cached in memory for the session and share one in-flight request, so
  returning to the home page costs no extra round-trips. Failures are never cached, and one caller
  cancelling a request cannot cancel work that another caller is waiting on.

### Images

Posters and backdrops are served from TMDb's image CDN at the smallest sufficient size, with `srcset` for
high-density screens and lazy loading below the fold.

---

## Pagination

Pagination uses an explicit **"Load more"** button.

TMDb caps paginated results at page 500 regardless of how many titles match, so when that limit is reached,
the button is replaced by an end-of-results message rather than remaining as a control that does nothing.

---

## Known limitations and future improvements

- **Authentication is simulated.** There is no backend in this project, so sign-in is verified in the browser
  and the session is a `localStorage` entry. It satisfies the login requirement honestly — the login card
  says as much — but it is not security. A real implementation would call an auth endpoint and store a token.
- **Favourites are per-browser.** They live in `localStorage`, so they do not follow the user across devices.
  Syncing would mean TMDb's v4 account endpoints, which require user-level OAuth approval.
- **Filters cannot be combined with search** — TMDb's search endpoint accepts a text query but not genre or
  rating parameters.
- **No server-side rendering**, so there is no SEO for individual titles. Next.js or React Router's framework
  mode would be the natural next step.
- **Accessibility** has been considered throughout — semantic landmarks, keyboard navigation, focus rings,
  `aria-live` result counts, reduced-motion support — but has not been verified with a screen reader.

---

## Attribution

**This product uses the TMDB API but is not endorsed or certified by TMDB.**

Movie data, images and videos are provided by [The Movie Database (TMDb)](https://www.themoviedb.org/).
Trailers are hosted by YouTube and may be region-restricted.

## Licence

MIT — see [LICENSE](LICENSE).
