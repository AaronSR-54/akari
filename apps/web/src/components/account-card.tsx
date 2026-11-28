'use client';

import Link from 'next/link';
import type { Account, AccountType } from '@akari/domain';
import { Amount, Badge, cn } from '@akari/ui';
import { formatUpdated } from '../lib/format';
import { BankIcon } from './bank-icon';

export const accountTypeLabel: Record<AccountType, string> = {
  personal: 'Personal',
  joint: 'Conjunta',
  deposit: 'Depósito',
};

export function AccountCard({
  account,
  balanceMinor,
  href,
  onSelect,
  current = false,
  compact = false,
  reduced = false,
  asOption = false,
  className,
}: {
  account: Account;
  balanceMinor: number;
  href?: string;
  onSelect?: (accountId: string) => void;
  current?: boolean;
  compact?: boolean;
  reduced?: boolean;
  asOption?: boolean;
  className?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <BankIcon bankId={account.bankId} size={20} />
          <p className="min-w-0 truncate text-ui-13-strong text-text-primary">{account.name}</p>
        </span>
        {reduced ? (
          <span className="shrink-0 text-ui-10 text-text-secondary">
            {accountTypeLabel[account.type]}
          </span>
        ) : (
          <Badge tone={account.includeInTotal ? 'positive' : 'neutral'}>
            {account.includeInTotal ? 'Al día' : 'Excluida'}
          </Badge>
        )}
      </div>
      <Amount minor={balanceMinor} currency={account.currency} className="text-ui-28-bold" />
      {reduced ? null : (
        <>
          <p className="text-ui-11 text-text-secondary">Saldo disponible</p>
          <div className="mt-auto flex items-center justify-between gap-2 text-ui-10 text-text-secondary">
            <span className="truncate">{formatUpdated(account.updatedAt)}</span>
            <span className="shrink-0">{accountTypeLabel[account.type]}</span>
          </div>
        </>
      )}
    </>
  );

  const classes = cn(
    'flex h-full min-w-0 flex-col gap-2.5 rounded-xl bg-surface-sunken text-left transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
    compact ? 'p-4' : 'p-5',
    current && 'ring-2 ring-inset ring-accent-default',
    className,
  );

  if (onSelect) {
    return (
      <button
        type="button"
        role={asOption ? 'option' : undefined}
        aria-selected={asOption ? current : undefined}
        onClick={() => onSelect(account.id)}
        className={cn(classes, 'hover:bg-surface-default')}
        data-account={account.id}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href ?? `/cuentas/${account.id}`}
      className={cn(classes, 'hover:bg-surface-default')}
      data-account={account.id}
    >
      {content}
    </Link>
  );
}
