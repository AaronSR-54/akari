'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Account } from '@akari/domain';
import { Button, BottomSheet, cn } from '@akari/ui';
import { AccountCard } from './account-card';

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function AccountMenu({
  accounts,
  balances,
  currentId,
  onCreateAccount,
}: {
  accounts: Account[];
  balances: Record<string, { minor: number } | undefined>;
  currentId: string;
  onCreateAccount: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (accountId: string) => {
    setOpen(false);
    setMobileOpen(false);
    if (accountId !== currentId) router.push(`/cuentas/${accountId}`);
  };

  const toggle = () => {
    if (window.matchMedia('(min-width: 768px)').matches) setOpen((value) => !value);
    else setMobileOpen(true);
  };

  return (
    <>
      <span ref={rootRef} className="relative inline-flex">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Cambiar de cuenta"
          onClick={toggle}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors duration-fast hover:bg-surface-sunken hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
            open && 'bg-surface-sunken text-text-primary',
          )}
        >
          <ChevronDown
            className={cn('transition-transform duration-fast', open && 'rotate-180')}
          />
        </button>
        {open ? (
          <div className="absolute left-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-3rem))] rounded-xl border border-border-subtle bg-surface-raised p-3 elevation-3">
            <p className="px-1 pb-2 text-ui-10 text-text-secondary">Cambiar de cuenta</p>
            <div
              role="listbox"
              aria-label="Cuentas"
              className="flex max-h-[min(28rem,70vh)] flex-col gap-2 overflow-y-auto overscroll-contain"
            >
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  balanceMinor={balances[account.id]?.minor ?? 0}
                  current={account.id === currentId}
                  asOption
                  compact
                  reduced
                  onSelect={choose}
                />
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                setOpen(false);
                onCreateAccount();
              }}
            >
              Nueva cuenta
            </Button>
          </div>
        ) : null}
      </span>

      <BottomSheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Cambiar de cuenta"
        footer={
          <Button variant="secondary" onClick={() => setMobileOpen(false)}>
            Cerrar
          </Button>
        }
      >
        <div className="flex flex-col gap-2">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              balanceMinor={balances[account.id]?.minor ?? 0}
              current={account.id === currentId}
              compact
              reduced
              onSelect={choose}
            />
          ))}
          <Button
            className="mt-2"
            onClick={() => {
              setMobileOpen(false);
              onCreateAccount();
            }}
          >
            Nueva cuenta
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}
