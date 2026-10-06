import { Card, Box, Skeleton } from '@mui/material';

/**
 * Loading placeholder shaped like MovieCard.
 *
 * Skeletons are used instead of a single centred spinner because they preserve
 * the page's layout while data loads: nothing jumps when results arrive, and the
 * user can see the shape of what is coming. This matters most on the first load
 * and when a new search replaces the current results.
 */
export default function MovieCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }}>
      <Box sx={{ aspectRatio: '2 / 3' }}>
        <Skeleton variant="rectangular" sx={{ width: '100%', height: '100%' }} animation="wave" />
      </Box>
      <Box sx={{ p: 1.5 }}>
        <Skeleton variant="text" width="85%" height={20} animation="wave" />
        <Skeleton variant="text" width="40%" height={16} animation="wave" />
      </Box>
    </Card>
  );
}
