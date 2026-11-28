'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { useAccounts } from './hooks';
import { MovementDialog } from './movement-dialog';

type OpenOptions = { accountId?: string };
type MovementComposer = (options?: OpenOptions) => void;

const MovementComposerContext = createContext<MovementComposer | null>(null);

type ComposerState = { open: boolean; accountId?: string };

export function MovementComposerProvider({ children }: { children: ReactNode }) {
  const accounts = useAccounts();
  const pathname = usePathname();
  const [state, setState] = useState<ComposerState>({ open: false });

  const open = useCallback<MovementComposer>((options) => {
    setState({ open: true, accountId: options?.accountId });
  }, []);

  const close = useCallback(() => {
    setState({ open: false });
  }, []);

  useEffect(() => {
    setState((current) => (current.open ? { open: false } : current));
  }, [pathname]);

  const value = useMemo(() => open, [open]);

  return (
    <MovementComposerContext.Provider value={value}>
      {children}
      <MovementDialog
        accounts={accounts ?? []}
        defaultAccountId={state.accountId}
        open={state.open}
        onClose={close}
      />
    </MovementComposerContext.Provider>
  );
}

export function useMovementComposer(): MovementComposer {
  const open = useContext(MovementComposerContext);
  if (!open) throw new Error('useMovementComposer debe usarse dentro de MovementComposerProvider');
  return open;
}
