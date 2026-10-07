import { StrictMode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * End-to-end tests through the real component tree.
 *
 * These render the whole application — providers, router, contexts, the sample
 * data service — and drive it the way a person would. They are the tests that
 * would catch a broken wiring change that every unit test still passes through,
 * for example a provider mounted in the wrong order or a route guard that never
 * releases.
 *
 * The app runs in sample-data mode here, because no VITE_TMDB_TOKEN is set in
 * the test environment. That is the same code path a fresh clone takes.
 */

// Each test starts signed out, as a first-time visitor would be.
beforeEach(() => {
  localStorage.clear();
});

/**
 * Render the app inside StrictMode, exactly as src/main.jsx does.
 *
 * This matters. StrictMode intentionally mounts, unmounts and remounts every
 * effect in development, and rendering without it hid a genuine bug: the
 * response cache stored a promise bound to the first caller's AbortSignal, so
 * the remount received an already-aborted promise and the grid stayed empty on
 * first load. No test caught it because no test double-invoked effects.
 *
 * Effects must be written to survive this. Testing without StrictMode tests a
 * different application from the one that ships.
 */
/** Seed a signed-in session, the way a returning visitor's browser would. */
function seedSession() {
  localStorage.setItem(
    STORAGE_KEYS.auth,
    JSON.stringify({ id: 'user-demo', username: 'demo', displayName: 'Demo', signedInAt: new Date().toISOString() }),
  );
}

function renderApp() {
  return render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

describe('Movie Explorer — end to end', () => {
  it('sends an unauthenticated visitor to the login screen rather than the app', async () => {
    renderApp();

    expect(await screen.findByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.queryByText(/trending this week/i)).not.toBeInTheDocument();
  });

  it('signs in with the demo account and loads trending movies', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole('button', { name: /use demo account/i }));
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    // Trending grid
    expect(await screen.findByText(/trending this week/i, {}, { timeout: 5000 })).toBeInTheDocument();

    // The fixture's most popular title is rendered as a card linking to its page.
    const inception = await screen.findByRole(
      'link',
      { name: /Inception \(2010\).*view details/i },
      { timeout: 5000 },
    );
    expect(inception).toHaveAttribute('href', '/movie/27205');

    // A session was persisted, which is what survives a refresh.
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.auth))).toMatchObject({ username: 'demo' });
  });

  it('rejects an incorrect password without signing the user in', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(await screen.findByRole('button', { name: /use demo account/i }));
    // MUI renders the required marker inside the label ("Password *"), and the
    // show/hide icon button is also labelled "Show password" — so target the
    // input element itself rather than matching on label text alone.
    const password = screen.getByLabelText(/password/i, { selector: 'input' });
    await user.clear(password);
    await user.type(password, 'wrong-password');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent(/incorrect username or password/i);
    expect(localStorage.getItem(STORAGE_KEYS.auth)).toBeNull();
  });

  it('restores a stored session instead of asking the user to sign in again', async () => {
    localStorage.setItem(
      STORAGE_KEYS.auth,
      JSON.stringify({ id: 'user-demo', username: 'demo', displayName: 'Demo', signedInAt: new Date().toISOString() }),
    );

    renderApp();

    expect(await screen.findByText(/trending this week/i, {}, { timeout: 5000 })).toBeInTheDocument();
    // No flash of the login screen for an already-signed-in user.
    expect(screen.queryByRole('button', { name: /^sign in$/i })).not.toBeInTheDocument();
  });

  it('searches for a title and reports the result count', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEYS.auth,
      JSON.stringify({ id: 'user-demo', username: 'demo', displayName: 'Demo', signedInAt: new Date().toISOString() }),
    );

    renderApp();
    await screen.findByText(/trending this week/i, {}, { timeout: 5000 });

    // The first search box in the DOM is the one in the page header area.
    const searchBox = screen.getAllByRole('searchbox')[0];
    await user.type(searchBox, 'incept');

    // The query is debounced by 400ms before it reaches the data layer, and the
    // heading follows the settled query, so it appears once the app has actually
    // switched over to search results.
    expect(await screen.findByText(/results for .incept./i, {}, { timeout: 5000 })).toBeInTheDocument();

    const heading = screen.getByRole('heading', { name: /results for/i });
    expect(heading).toBeInTheDocument();

    // The live region reports the settled count for this query.
    expect(await screen.findByText(/1 movie shown for .incept./i)).toBeInTheDocument();

    // Only the matching title is shown.
    //
    // Queried inside waitFor so that every poll re-reads the document. A single
    // findByRole() hands back one node, and the grid re-renders when results
    // land, so a node captured a moment earlier can be detached by the time it
    // is asserted on — which fails with "element could not be found in the
    // document" even though the movie is on screen.
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Inception \(2010\)/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /The Dark Knight \(2008\)/i })).not.toBeInTheDocument();
  });

  it('shows an empty state with a way out when a search matches nothing', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEYS.auth,
      JSON.stringify({ id: 'user-demo', username: 'demo', displayName: 'Demo', signedInAt: new Date().toISOString() }),
    );

    renderApp();
    await screen.findByText(/trending this week/i, {}, { timeout: 5000 });

    await user.type(screen.getAllByRole('searchbox')[0], 'zzzzz-no-film');

    expect(await screen.findByText(/no results for/i, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(/check the spelling/i)).toBeInTheDocument();
  });

  it('loads the genre list into the filter dropdown', async () => {
    // Regression: the genre request went through the same broken cache as
    // trending, so on a cold load the dropdown contained nothing but
    // "All genres" and there was no way to filter by genre at all.
    const user = userEvent.setup();
    seedSession();
    renderApp();
    await screen.findByText(/trending this week/i, {}, { timeout: 5000 });

    const genreSelect = screen.getByRole('combobox', { name: /genre/i });

    // The select is disabled until the genre list arrives, and clicking a
    // disabled control does nothing — so wait for it to become interactive
    // rather than racing the request.
    await waitFor(() => expect(genreSelect).not.toHaveAttribute('aria-disabled', 'true'));

    await user.click(genreSelect);

    expect(await screen.findByRole('option', { name: 'Animation' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Science Fiction' })).toBeInTheDocument();
  });

  it('accepts a release year typed one digit at a time', async () => {
    // Regression: the year field was bound directly to the filter value and
    // discarded anything that was not four digits, so intermediate keystrokes
    // were rejected and the field could not be typed into at all.
    const user = userEvent.setup();
    seedSession();
    renderApp();
    await screen.findByText(/trending this week/i, {}, { timeout: 5000 });

    const yearInput = screen.getByLabelText(/release year/i, { selector: 'input' });

    await user.type(yearInput, '2');
    expect(yearInput).toHaveValue('2');

    await user.type(yearInput, '010');
    expect(yearInput).toHaveValue('2010');
  });

  it('applies a sort order by switching to the sortable catalogue', async () => {
    // Regression: sortBy was missing from the condition that chose the data
    // source, so with no query and no other filter the app stayed on
    // /trending/movie/week — a fixed order with no sort_by parameter — and
    // every sort option produced identical results.
    const user = userEvent.setup();
    seedSession();
    renderApp();
    await screen.findByText(/trending this week/i, {}, { timeout: 5000 });

    await user.click(screen.getByRole('combobox', { name: /sort by/i }));
    await user.click(await screen.findByRole('option', { name: /highest rated/i }));

    // The heading must stop claiming to be the trending feed. Queried by role
    // rather than text: the screen-reader live region also contains the heading.
    expect(await screen.findByRole('heading', { name: /browse movies/i }, { timeout: 5000 })).toBeInTheDocument();
    // And the active filter row must say which sort is in force.
    expect(await screen.findByText(/sorted: highest rated/i)).toBeInTheDocument();
  });
});
