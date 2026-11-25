'use client';

import { formatMinor, type AccountType, type MovementType } from '@akari/domain';
import { useId, type CSSProperties, type ReactNode } from 'react';
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
  style,
}: {
  label: string;
  value: ReactNode;
  foot?: ReactNode;
  tone?: 'default' | 'positive' | 'negative';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
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
      style={style}
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
  icon,
  iconTone = 'type',
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
  /** Distintivo opcional (por ejemplo, el banco de la cuenta origen). `null` lo oculta. */
  icon?: ReactNode | null;
  /** `plain` deja solo el distintivo, sin el color que indica gasto o ingreso. */
  iconTone?: 'type' | 'plain';
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
          iconTone === 'type' &&
            (type === 'income'
              ? 'bg-status-positive-soft text-status-positive-text'
              : 'bg-surface-sunken text-text-secondary'),
        )}
      >
        {icon === undefined ? <IconArrows size={compact ? 16 : 20} /> : icon}
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

/** Microserie de gasto con línea y área, en estilo cotización bursátil. */
export function ChartArea({
  values,
  labels,
  ariaLabel,
  description,
  height = 'lg',
  showLabels = true,
  tooltip,
}: {
  values: number[];
  labels: string[];
  ariaLabel: string;
  description?: string;
  height?: 'md' | 'lg';
  showLabels?: boolean;
  tooltip?: { label: string; value: string; detail?: string };
}) {
  const id = useId().replace(/:/g, '');
  const gradientId = `chart-area-${id}`;
  const descriptionId = `chart-area-desc-${id}`;
  const rawMax = values.length ? Math.max(...values) : 0;
  const rawMin = values.length ? Math.min(...values) : 0;
  const flat = rawMax === rawMin;
  const span = rawMax - rawMin || 1;
  const points = values.map((value, index) => ({
    x: values.length === 1 ? 100 : (index / (values.length - 1)) * 100,
    y: flat ? 18 : 34 - ((value - rawMin) / span) * 28,
  }));
  const line = points.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const area = first && last
    ? `${line} L ${last.x} 38 L ${first.x} 38 Z`
    : '';
  const lastTop = last ? (last.y / 40) * 100 : 0;
  const tooltipAbove = lastTop > 55;
  return (
    <div
      className="flex flex-col gap-2"
      role="img"
      aria-label={ariaLabel}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className={cn('relative w-full', height === 'lg' ? 'h-40' : 'h-32')}>
        <div className="absolute inset-y-0 left-2 right-2">
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent-default)" stopOpacity="0.24" />
                <stop offset="100%" stopColor="var(--color-accent-default)" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            {area ? <path d={area} fill={`url(#${gradientId})`} stroke="none" /> : null}
            {line ? (
              <path
                d={line}
                fill="none"
                stroke="var(--color-text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
          {last ? (
            <>
              <span
                aria-hidden="true"
                data-chart-point="halo"
                className="pointer-events-none absolute block h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-default/20"
                style={{ left: `${last.x}%`, top: `${lastTop}%` }}
              />
              <span
                aria-hidden="true"
                data-chart-point="core"
                className="pointer-events-none absolute block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-strong ring-2 ring-surface-default"
                style={{ left: `${last.x}%`, top: `${lastTop}%` }}
              />
            </>
          ) : null}
        </div>
        {tooltip && last ? (
          <div
            className="pointer-events-none absolute right-2 z-10 max-w-[calc(100%_-_1rem)] rounded-lg bg-surface-inverse px-2.5 py-1.5 shadow-elevation-2"
            style={
              tooltipAbove
                ? { bottom: `calc(${100 - lastTop}% + 12px)` }
                : { top: `calc(${lastTop}% + 12px)` }
            }
          >
            <span
              aria-hidden="true"
              className={cn(
                'absolute -right-1 h-2 w-2 rotate-45 rounded-[1px] bg-surface-inverse',
                tooltipAbove ? '-bottom-1' : '-top-1',
              )}
            />
            <p className="text-ui-9 uppercase tracking-wide text-text-inverse">{tooltip.label}</p>
            <p className="whitespace-nowrap text-ui-12-strong text-text-inverse">{tooltip.value}</p>
            {tooltip.detail ? (
              <p className="whitespace-nowrap text-ui-9 text-text-inverse">{tooltip.detail}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      {showLabels ? (
        <div className={cn('flex text-ui-9 text-text-secondary', values.length === 1 && 'justify-end')}>
          {labels.map((label, index) => (
            <span key={`${label}-${index}`} className="flex-1 text-center first:text-left last:text-right">
              {label}
            </span>
          ))}
        </div>
      ) : null}
      {description ? (
        <p id={descriptionId} className="sr-only">
          {description}
        </p>
      ) : null}
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
