import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('Movie Explorer — end to end', () => {
  it('sends an unauthenticated visitor to the login screen rather than the app', async () => {
    render(<App />);

    expect(await screen.findByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.queryByText(/trending this week/i)).not.toBeInTheDocument();
  });

  it('signs in with the demo account and loads trending movies', async () => {
    const user = userEvent.setup();
    render(<App />);

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
    render(<App />);

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

    render(<App />);

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

    render(<App />);
    await screen.findByText(/trending this week/i, {}, { timeout: 5000 });

    // The first search box in the DOM is the one in the page header area.
    const searchBox = screen.getAllByRole('searchbox')[0];
    await user.type(searchBox, 'incept');

    // The query is debounced by 400ms before it reaches the data layer.
    expect(await screen.findByText(/results for .incept./i, {}, { timeout: 5000 })).toBeInTheDocument();

    const heading = screen.getByRole('heading', { name: /results for/i });
    expect(heading).toBeInTheDocument();

    // Only the matching title is shown.
    expect(await screen.findByRole('link', { name: /Inception \(2010\)/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /The Dark Knight \(2008\)/i })).not.toBeInTheDocument();
  });

  it('shows an empty state with a way out when a search matches nothing', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEYS.auth,
      JSON.stringify({ id: 'user-demo', username: 'demo', displayName: 'Demo', signedInAt: new Date().toISOString() }),
    );

    render(<App />);
    await screen.findByText(/trending this week/i, {}, { timeout: 5000 });

    await user.type(screen.getAllByRole('searchbox')[0], 'zzzzz-no-film');

    expect(await screen.findByText(/no results for/i, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(/check the spelling/i)).toBeInTheDocument();
  });
});
