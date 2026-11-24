import { Skeleton, Stack } from '@akari/ui';

export function PageSkeleton({ variant = 'list' }: { variant?: 'list' | 'cards' | 'single' }) {
  if (variant === 'single') {
    return <Skeleton type="card" />;
  }
  return (
    <Stack gap={5}>
      <Skeleton type="card" />
      {variant === 'cards' ? <Skeleton type="card" /> : <Skeleton type="list" />}
    </Stack>
  );
}
