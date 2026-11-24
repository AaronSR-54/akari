import { Badge } from '@akari/ui';

export function GroupStatusBadge({
  status,
  className,
}: {
  status: 'pending' | 'settled';
  className?: string;
}) {
  return (
    <Badge tone={status === 'settled' ? 'positive' : 'warning'} className={className}>
      {status === 'settled' ? 'Saldado' : 'Pendiente'}
    </Badge>
  );
}
