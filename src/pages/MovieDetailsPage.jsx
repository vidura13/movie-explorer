import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StarIcon from '@mui/icons-material/Star';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import PosterImage from '../components/PosterImage';
import RatingBadge from '../components/RatingBadge';
import FavoriteButton from '../components/FavoriteButton';
import CastList from '../components/CastList';
import TrailerModal from '../components/TrailerModal';
import MovieGrid from '../components/MovieGrid';
import SectionHeading from '../components/SectionHeading';
import ErrorState from '../components/ErrorState';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { buildImageUrl } from '../utils/imageUrl';
import { formatCount, formatRating, formatRuntime, formatYear, pluralise } from '../utils/formatters';
import { IMAGE_SIZES } from '../utils/constants';

/**
 * Full detail view for one title.
 *
 * Data arrives in a single request (append_to_response=credits,videos,
 * recommendations) rather than three, so there is no situation where the cast
 * renders but the trailer does not.
 */

/**
 * Choose which video to feature.
 *
 * TMDb returns a mixed bag per title: official trailers, teasers, clips,
 * featurettes, behind-the-scenes pieces — often in several languages. Preference
 * order is official YouTube trailer, then any YouTube trailer, then a teaser, so
 * the button plays something recognisable instead of an interview clip.
 */
function selectBestTrailer(videos) {
  const youtube = (videos || []).filter((video) => video.site === 'YouTube' && video.key);
  if (!youtube.length) return null;

  return (
    youtube.find((video) => video.type === 'Trailer' && video.official) ||
    youtube.find((video) => video.type === 'Trailer') ||
    youtube.find((video) => video.type === 'Teaser') ||
    null
  );
}

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movie, status, error, retry } = useMovieDetails(id);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const trailer = useMemo(() => selectBestTrailer(movie?.videos?.results), [movie]);

  const director = useMemo(
    () => movie?.credits?.crew?.find((person) => person.job === 'Director')?.name,
    [movie],
  );

  const backdrop = buildImageUrl(movie?.backdrop_path, IMAGE_SIZES.backdrop.lg);
  const heroImage = backdrop || buildImageUrl(movie?.poster_path, IMAGE_SIZES.poster.lg);

  if (status === 'loading') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={120} height={32} />
        <Skeleton variant="rectangular" sx={{ width: '100%', height: { xs: 200, md: 380 }, borderRadius: 3, my: 2 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Skeleton variant="rectangular" sx={{ width: { xs: '60%', sm: 220 }, aspectRatio: '2 / 3', borderRadius: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={44} />
            <Skeleton variant="text" width="35%" />
            <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 2 }} />
          </Box>
        </Stack>
      </Container>
    );
  }

  if (status === 'error') {
    return (
      <Container maxWidth="lg">
        <ErrorState error={error} onRetry={retry} />
        <Box sx={{ textAlign: 'center', pb: 6 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Go back
          </Button>
        </Box>
      </Container>
    );
  }

  if (!movie) return null;

  const releaseYear = formatYear(movie.release_date);
  const spokenLanguages = (movie.spoken_languages || []).map((language) => language.english_name).filter(Boolean);

  return (
    <>
      <Box sx={{ position: 'relative', bgcolor: 'background.paper' }}>
        {/* Backdrop. Rendered as a decorative layer with a gradient scrim so the
            title stays legible over bright artwork. */}
        <Box
          sx={{
            position: 'relative',
            height: { xs: 220, sm: 320, md: 420 },
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(to top, #0b0f14 8%, rgba(11,15,20,0.55) 55%, rgba(11,15,20,0.75) 100%)'
                  : 'linear-gradient(to top, #ffffff 6%, rgba(245,246,250,0.55) 55%, rgba(17,24,39,0.35) 100%)',
            },
          }}
        >
          {heroImage && (
            <Box
              component="img"
              src={heroImage}
              alt=""
              aria-hidden="true"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </Box>

        <Container maxWidth="lg" sx={{ mt: { xs: -10, sm: -14, md: -18 }, position: 'relative', zIndex: 1 }}>
          <IconButton
            onClick={() => navigate(-1)}
            aria-label="Go back"
            sx={{ mb: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2.5, sm: 3.5 }} alignItems="flex-start">
            <Box sx={{ width: { xs: 150, sm: 230 }, flexShrink: 0 }}>
              <PosterImage
                movie={movie}
                sizeKey="lg"
                priority
                sizes="(max-width: 600px) 150px, 230px"
                sx={{ borderRadius: 2, boxShadow: 6, border: 0 }}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, pt: { xs: 0, sm: 4 } }}>
              <Typography variant="h1" component="h1" sx={{ mb: 0.5 }}>
                {movie.title}
              </Typography>

              {movie.tagline && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1.5 }}>
                  {movie.tagline}
                </Typography>
              )}

              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <StarIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatRating(movie.vote_average)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({formatCount(movie.vote_count)} votes)
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 17, color: 'text.secondary' }} />
                  <Typography variant="body2">{releaseYear}</Typography>
                </Stack>

                {movie.runtime > 0 && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <ScheduleOutlinedIcon sx={{ fontSize: 17, color: 'text.secondary' }} />
                    <Typography variant="body2">{formatRuntime(movie.runtime)}</Typography>
                  </Stack>
                )}
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                {(movie.genres || []).map((genre) => (
                  <Chip key={genre.id} label={genre.name} size="small" variant="outlined" />
                ))}
              </Stack>

              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <Tooltip title={trailer ? '' : 'No trailer is available for this title'}>
                  {/* The tooltip needs a wrapper that still receives events when
                      the button itself is disabled. */}
                  <Box component="span">
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrowIcon />}
                      disabled={!trailer}
                      onClick={() => setTrailerOpen(true)}
                    >
                      Watch trailer
                    </Button>
                  </Box>
                </Tooltip>

                {trailer && (
                  <Button
                    variant="text"
                    size="large"
                    endIcon={<OpenInNewIcon />}
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open on YouTube
                  </Button>
                )}

                <FavoriteButton movie={movie} size="large" />
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: { xs: 3, md: 5 }, mt: 4 }}>
          <Box>
            <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>
              Overview
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.75, color: movie.overview ? 'text.primary' : 'text.secondary' }}>
              {movie.overview || 'No overview is available for this title yet.'}
            </Typography>

            {(movie.credits?.cast?.length || 0) > 0 && (
              <>
                <Typography variant="h3" component="h2" sx={{ mt: 4, mb: 1.5 }}>
                  Top cast
                </Typography>
                <CastList cast={movie.credits.cast} />
              </>
            )}
          </Box>

          {/* Facts rail. Hidden on phones, where it would push the content down
              without adding much. */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: 'fit-content', display: { xs: 'none', md: 'block' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Details
            </Typography>
            <Stack divider={<Divider flexItem />} spacing={1.5}>
              <DetailRow label="Director" value={director || '—'} />
              <DetailRow label="Release date" value={movie.release_date || 'Unknown'} />
              <DetailRow label="Status" value={movie.status || '—'} />
              <DetailRow label="Runtime" value={formatRuntime(movie.runtime)} />
              <DetailRow label="Languages" value={spokenLanguages.length ? spokenLanguages.join(', ') : '—'} />
              <DetailRow
                label="Genres"
                value={(movie.genres || []).map((genre) => genre.name).join(', ') || '—'}
              />
            </Stack>
          </Paper>
        </Box>

        {(movie.recommendations?.results?.length || 0) > 0 && (
          <>
            <SectionHeading
              title="More like this"
              subtitle={pluralise(movie.recommendations.results.length, 'suggestion')}
            />
            <MovieGrid movies={movie.recommendations.results.slice(0, 10)} status="success" skeletonCount={5} />
          </>
        )}

        {/* Regional availability is a real limitation worth stating rather than
            letting a user conclude the trailer is broken. */}
        {trailer && (
          <Alert severity="info" variant="outlined" sx={{ mt: 4 }}>
            Trailers are hosted on YouTube and may be unavailable in some regions.
          </Alert>
        )}
      </Container>

      <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} trailer={trailer} />
    </>
  );
}

/** One label/value pair in the details rail. */
function DetailRow({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}
