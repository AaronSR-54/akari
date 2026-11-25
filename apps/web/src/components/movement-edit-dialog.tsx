'use client';

import type { Movement } from '@akari/domain';
import { useAccounts } from './hooks';
import { MovementDialog } from './movement-dialog';

export function MovementEditDialog({
  movement,
  open,
  onClose,
}: {
  movement: Movement | null;
  open: boolean;
  onClose: () => void;
}) {
  const accounts = useAccounts();

  if (!accounts) return null;

  return (
    <MovementDialog
      accounts={accounts}
      movement={movement}
      open={open}
      onClose={onClose}
    />
  );
}
