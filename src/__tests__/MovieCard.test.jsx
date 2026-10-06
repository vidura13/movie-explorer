import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import MovieCard from '../components/MovieCard';
import { FavoritesProvider } from '../context/FavoritesContext';
import { STORAGE_KEYS } from '../utils/constants';
import getTheme from '../theme';

/**
 * MovieCard tests.
 *
 * Covers the two things most likely to break in a poster grid: the fallback when
 * TMDb has no artwork, and the favourite toggle behaving as a button rather than
 * accidentally navigating to the detail page.
 */

const movie = {
  id: 27205,
  title: 'Inception',
  release_date: '2010-07-15',
  vote_average: 8.4,
  poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
};

function renderCard(overrides = {}) {
  return render(
    <MuiThemeProvider theme={getTheme('light')}>
      <MemoryRouter>
        <FavoritesProvider>
          <MovieCard movie={{ ...movie, ...overrides }} />
        </FavoritesProvider>
      </MemoryRouter>
    </MuiThemeProvider>,
  );
}

describe('MovieCard', () => {
  it('shows the title, release year and rating', () => {
    renderCard();
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('8.4')).toBeInTheDocument();
  });

  it('links to the movie detail page with a descriptive accessible name', () => {
    renderCard();
    const link = screen.getByRole('link', { name: /Inception \(2010\).*view details/i });
    expect(link).toHaveAttribute('href', '/movie/27205');
  });

  it('renders real poster artwork when TMDb provides a path', () => {
    renderCard();
    const image = screen.getByAltText('Inception poster');
    expect(image.getAttribute('src')).toContain('/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg');
  });

  it('falls back to placeholder artwork when there is no poster', () => {
    // Roughly one in twelve TMDb entries has no poster; a broken image icon
    // here would look like a bug rather than missing data.
    renderCard({ poster_path: null });

    expect(screen.queryByAltText('Inception poster')).not.toBeInTheDocument();
    expect(screen.getByText(/no artwork available/i)).toBeInTheDocument();
    // The title appears twice by design — once on the placeholder panel and
    // once in the card body — so the assertion allows for both.
    expect(screen.getAllByText('Inception').length).toBeGreaterThan(0);
  });

  it('shows N/A rather than 0.0 for a title with no votes', () => {
    renderCard({ vote_average: 0 });
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('shows TBA for a movie without a release date', () => {
    renderCard({ release_date: '' });
    expect(screen.getByText('TBA')).toBeInTheDocument();
  });

  it('toggles the favourite without navigating away', async () => {
    const user = userEvent.setup();
    renderCard();

    const heart = screen.getByRole('button', { name: /save inception to favourites/i });
    expect(heart).toHaveAttribute('aria-pressed', 'false');

    await user.click(heart);

    const savedHeart = screen.getByRole('button', { name: /remove inception from favourites/i });
    expect(savedHeart).toHaveAttribute('aria-pressed', 'true');

    // The favourite is persisted, which is the whole point of the feature.
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ id: 27205, title: 'Inception' });
  });
});
