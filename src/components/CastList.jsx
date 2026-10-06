import { Avatar, Box, Card, Stack, Typography } from '@mui/material';
import { buildImageUrl } from '../utils/imageUrl';
import { IMAGE_SIZES } from '../utils/constants';

/**
 * Horizontal cast strip.
 *
 * A single scrollable row rather than a wrapping grid: cast lists are long and
 * low-priority, and a horizontal rail keeps the page from growing by hundreds of
 * pixels on a phone while still exposing everyone.
 */
export default function CastList({ cast = [], limit = 10 }) {
  const people = cast.slice(0, limit);
  if (!people.length) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        pb: 1.5,
        // Snap the rail so swipes land on a whole card.
        scrollSnapType: 'x mandatory',
        '&::-webkit-scrollbar': { height: 8 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 4 },
      }}
      role="list"
      aria-label="Top cast"
    >
      {people.map((person) => {
        const profile = buildImageUrl(person.profile_path, IMAGE_SIZES.profile);
        return (
          <Card
            key={`${person.id}-${person.name}`}
            role="listitem"
            sx={{ minWidth: 116, maxWidth: 116, p: 1.5, textAlign: 'center', scrollSnapAlign: 'start' }}
          >
            <Stack spacing={1} alignItems="center">
              <Avatar
                src={profile || undefined}
                alt={person.name}
                sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontWeight: 700 }}
              >
                {/* Fallback is the actor's initials rather than a generic icon —
                    it keeps the rail scannable when TMDb has no headshot. */}
                {person.name
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')}
              </Avatar>
              <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                {person.name}
              </Typography>
              {person.character && (
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, lineHeight: 1.2 }}>
                  {person.character}
                </Typography>
              )}
            </Stack>
          </Card>
        );
      })}
    </Box>
  );
}
