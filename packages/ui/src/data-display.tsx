'use client';

import { formatMinor, type AccountType, type MovementType } from '@akari/domain';
import type { ReactNode } from 'react';
import { cn } from './cn.js';
import { IconArrows } from './icons.js';

export function Amount({
  minor,
  currency,
  type,
  signed = false,
  className,
}: {
  minor: number;
  currency: string;
  type?: MovementType;
  signed?: boolean;
  className?: string;
}) {
  const value = type === 'expense' ? -Math.abs(minor) : minor;
  return (
    <span
      className={cn('font-tabular', type === 'income' && 'text-status-positive-text', className)}
      data-amount
    >
      {formatMinor(value, currency, { signed: signed || type === 'income' })}
    </span>
  );
}

export type BadgeTone = 'positive' | 'negative' | 'warning' | 'neutral' | 'info';

const badgeTone: Record<BadgeTone, string> = {
  positive: 'bg-status-positive-soft text-status-positive-text',
  negative: 'bg-status-danger-soft text-status-danger-text',
  warning: 'bg-status-warning-soft text-status-warning-text',
  neutral: 'bg-surface-sunken text-text-secondary',
  info: 'bg-status-info-soft text-status-info-text',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 text-ui-11-strong',
        badgeTone[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  foot,
  tone = 'default',
  size = 'lg',
  className,
}: {
  label: string;
  value: ReactNode;
  foot?: ReactNode;
  tone?: 'default' | 'positive' | 'negative';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const valueSize = {
    sm: 'text-ui-24-bold',
    md: 'text-ui-26-bold',
    lg: 'text-ui-28-bold',
  }[size];
  const footTone = {
    default: 'text-text-secondary',
    positive: 'text-status-positive-text',
    negative: 'text-status-danger-text',
  }[tone];
  return (
    <div
      className={cn(
        'flex h-full flex-col gap-1 rounded-xl border border-border-subtle bg-surface-default p-5',
        className,
      )}
    >
      <p className="text-ui-11 text-text-secondary">{label}</p>
      <p className={cn('font-tabular text-text-primary', valueSize)}>{value}</p>
      {foot ? <p className={cn('text-ui-10', footTone)}>{foot}</p> : null}
    </div>
  );
}

const accountTypeLabel: Record<AccountType, string> = {
  personal: 'Personal',
  joint: 'Conjunta',
  deposit: 'Depósito',
};

export function AccountCard({
  name,
  type,
  currency,
  balanceMinor,
  badge,
  meta,
  footerLabel = 'Saldo disponible',
  className,
}: {
  name: string;
  type: AccountType;
  currency: string;
  balanceMinor: number;
  badge?: ReactNode;
  meta?: string;
  footerLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-full flex-col gap-2.5 rounded-xl border border-border-subtle bg-surface-default p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-ui-13-strong text-text-primary">{name}</p>
        {badge}
      </div>
      <Amount minor={balanceMinor} currency={currency} className="text-ui-32-bold" />
      <p className="text-ui-11 text-text-secondary">{footerLabel}</p>
      <div className="mt-auto flex items-center justify-between gap-2 text-ui-10 text-text-secondary">
        <span className="truncate">{meta ?? 'Actualizada hace un momento'}</span>
        <span className="shrink-0">{accountTypeLabel[type]}</span>
      </div>
    </div>
  );
}

export function MovementRow({
  concept,
  category,
  dateLabel,
  amountMinor,
  currency,
  type,
  accountName,
  compact = false,
  onClick,
  action,
}: {
  concept: string;
  category: string;
  dateLabel: string;
  amountMinor: number;
  currency: string;
  type: MovementType;
  accountName?: string;
  compact?: boolean;
  onClick?: () => void;
  action?: ReactNode;
}) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full',
          compact ? 'h-7 w-7' : 'h-9 w-9',
          type === 'income'
            ? 'bg-status-positive-soft text-status-positive-text'
            : 'bg-surface-sunken text-text-secondary',
        )}
      >
        <IconArrows size={compact ? 16 : 20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-ui-13-strong text-text-primary">{concept}</span>
        <span className="block truncate text-ui-11 text-text-secondary">
          {dateLabel} · {category}
          {accountName ? ` · ${accountName}` : ''}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <Amount
          minor={amountMinor}
          currency={currency}
          type={type}
          signed
          className={cn('whitespace-nowrap text-right', compact ? 'text-ui-13' : 'text-ui-14-strong')}
        />
        {action}
      </span>
    </>
  );

  const classes = cn(
    'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left',
    compact ? 'min-h-13' : 'min-h-14',
    onClick && 'transition-colors duration-fast hover:bg-surface-sunken',
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }
  return <div className={classes}>{content}</div>;
}

export function BalanceSummary({
  totals,
  label = 'Saldo total',
  footer,
  variant = 'normal',
  className,
}: {
  totals: Array<{ minor: number; currency: string }>;
  label?: string;
  footer?: ReactNode;
  variant?: 'normal' | 'alert';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-default p-5',
        className,
      )}
    >
      <p className="text-ui-11 text-text-secondary">{label}</p>
      {totals.length === 0 ? (
        <p className="text-ui-24-bold text-text-tertiary">—</p>
      ) : (
        <div className="flex flex-col gap-1">
          {totals.map((total) => (
            <Amount
              key={total.currency}
              minor={total.minor}
              currency={total.currency}
              className={cn(
                'text-ui-28-bold',
                variant === 'alert' ? 'text-status-danger-text' : 'text-text-primary',
              )}
            />
          ))}
        </div>
      )}
      {footer ? (
        <div className={cn('text-ui-10', variant === 'alert' ? 'text-status-danger-text' : 'text-text-secondary')}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function ProgressInstallments({
  paid,
  total,
  label = 'Plazos',
  status,
  percent,
  remainingLabel,
  showStatus = false,
}: {
  paid: number;
  total: number;
  label?: string;
  status: 'on-track' | 'overdue' | 'completed';
  percent: number;
  remainingLabel?: string;
  showStatus?: boolean;
}) {
  const tone =
    status === 'overdue'
      ? 'bg-status-danger'
      : status === 'completed'
        ? 'bg-status-positive'
        : 'bg-accent-default';
  const statusLabel =
    status === 'overdue' ? 'Atrasado' : status === 'completed' ? 'Completado' : 'Al día';
  const foot =
    remainingLabel ??
    (status === 'completed' ? 'Completado' : `Quedan ${Math.max(0, total - paid)} cuotas`);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-ui-12-strong text-text-primary">{label}</p>
        <p className="text-ui-12-strong text-text-secondary">
          {paid} de {total}
        </p>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={paid}
        aria-label={`${label}: ${paid} de ${total}`}
      >
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-ui-11 text-text-secondary">{foot}</p>
        {showStatus ? (
          <Badge tone={status === 'overdue' ? 'negative' : status === 'completed' ? 'positive' : 'neutral'}>
            {statusLabel}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export function ChartBars({
  values,
  labels,
  ariaLabel,
  title,
  total,
  compact = false,
  formatValue,
}: {
  values: number[];
  labels: string[];
  ariaLabel: string;
  title?: string;
  total?: string;
  compact?: boolean;
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex flex-col gap-2.5" role="img" aria-label={ariaLabel}>
      {title || total ? (
        <div className="flex items-center justify-between gap-3">
          {title ? <p className="text-ui-12-strong text-text-primary">{title}</p> : null}
          {total ? <p className="text-ui-12-strong text-text-secondary">{total}</p> : null}
        </div>
      ) : null}
      <div className={cn('flex items-end gap-2.5', compact ? 'h-12' : 'h-24')}>
        {values.map((value, index) => (
          <div key={`${labels[index]}-${index}`} className="flex h-full flex-1 items-end justify-center">
            <div
              className={cn(
                'w-5 rounded-t-sm',
                index === values.length - 1 ? 'bg-accent-default' : 'bg-text-primary',
              )}
              style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
              title={formatValue?.(value)}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2.5">
        {labels.map((label, index) => (
          <span key={`${label}-${index}`} className="flex-1 text-center text-ui-9 text-text-secondary">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ChartSparkline({
  values,
  ariaLabel,
}: {
  values: number[];
  ariaLabel: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-8 items-end gap-1" role="img" aria-label={ariaLabel}>
      {values.map((value, index) => (
        <span
          key={index}
          className={cn(
            'w-1 rounded-full',
            index === values.length - 1 ? 'bg-accent-default' : 'bg-text-tertiary',
          )}
          style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
