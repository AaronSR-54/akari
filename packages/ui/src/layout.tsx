'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn.js';

export function PageContainer({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mx-auto w-full max-w-content px-5 md:px-8', className)} {...props}>
      {children}
    </div>
  );
}

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'raised' | 'sunken';
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const paddingClass = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' } as const;
const variantClass = {
  default: 'bg-surface-default border border-border-subtle',
  raised: 'bg-surface-raised border border-border-subtle elevation-2',
  sunken: 'bg-surface-sunken border border-border-subtle',
} as const;

export function Card({ className, variant = 'default', padding = 'md', children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl', variantClass[variant], paddingClass[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}

const gapClass = {
  1: 'gap-1',
  2: 'gap-2',
  2.5: 'gap-2.5',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  5.5: 'gap-5.5',
  6: 'gap-6',
  8: 'gap-8',
} as const;

export type Gap = keyof typeof gapClass;

export function Stack({
  className,
  gap = 4,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { gap?: Gap }) {
  return (
    <div className={cn('flex flex-col', gapClass[gap], className)} {...props}>
      {children}
    </div>
  );
}

export function Inline({
  className,
  gap = 2,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { gap?: Gap }) {
  return (
    <div className={cn('flex flex-wrap items-center', gapClass[gap], className)} {...props}>
      {children}
    </div>
  );
}

export function Grid({
  className,
  columns = 3,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { columns?: 1 | 2 | 3 | 4 }) {
  const map = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  } as const;
  return (
    <div className={cn('grid gap-4', map[columns], className)} {...props}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  meta,
  actions,
  breadcrumbs,
  hideTitleAtLg = false,
}: {
  title: string;
  description?: string;
  meta?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  hideTitleAtLg?: boolean;
}) {
  return (
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 flex-col gap-2.5">
        {breadcrumbs ? <div className="text-ui-10 text-text-secondary">{breadcrumbs}</div> : null}
        <div className="flex flex-col gap-0.5">
          <h1 className={cn('text-ui-28-bold text-text-primary', hideTitleAtLg && 'lg:hidden')}>{title}</h1>
          {meta || description ? (
            <p
              className={cn(
                'max-w-xl text-ui-11 text-text-secondary',
                hideTitleAtLg && 'lg:hidden',
              )}
            >
              {meta ?? description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </header>
  );
}

export function SectionHeader({
  title,
  id,
  action,
  className,
}: {
  title: string;
  id?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex min-h-6 items-center justify-between gap-3', className)}>
      <h2 id={id} className="text-ui-13-strong text-text-primary">
        {title}
      </h2>
      {action}
    </div>
  );
}

export function InfoRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3 py-1', className)}>
      <span className="text-ui-10 text-text-secondary">{label}</span>
      <span className="text-ui-10-strong text-text-primary">{value}</span>
    </div>
  );
}

export function SettingRow({
  title,
  description,
  action,
  danger = false,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[72px] items-center gap-3 border-b border-border-subtle last:border-0',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className={cn('text-ui-12-strong', danger ? 'text-status-danger-text' : 'text-text-primary')}>
          {title}
        </p>
        {description ? <p className="text-ui-10 text-text-secondary">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
