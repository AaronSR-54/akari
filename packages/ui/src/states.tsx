'use client';

import type { ReactNode } from 'react';
import { cn } from './cn.js';
import { IconInsights, IconSearch, IconWallet } from './icons.js';

export type SkeletonType = 'text' | 'list' | 'card';

export function Skeleton({
  type = 'text',
  className,
  label = 'Cargando contenido',
}: {
  type?: SkeletonType;
  className?: string;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className={cn('animate-pulse', className)}>
      {type === 'text' ? (
        <div className="flex flex-col gap-2">
          <div className="h-3 w-2/3 rounded-full bg-surface-sunken" />
          <div className="h-3 w-full rounded-full bg-surface-sunken" />
          <div className="h-3 w-1/2 rounded-full bg-surface-sunken" />
        </div>
      ) : null}
      {type === 'list' ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg bg-surface-sunken p-3">
              <div className="h-9 w-9 rounded-full bg-surface-default" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 rounded-full bg-surface-default" />
                <div className="h-2 w-1/3 rounded-full bg-surface-default" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {type === 'card' ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface-default p-5">
          <div className="h-3 w-1/3 rounded-full bg-surface-sunken" />
          <div className="h-9 w-2/3 rounded-full bg-surface-sunken" />
          <div className="h-14 w-full rounded-lg bg-surface-sunken" />
        </div>
      ) : null}
    </div>
  );
}

export type StateType = 'empty' | 'error' | 'offline' | 'insufficient' | 'success';

const stateTone: Record<StateType, string> = {
  empty: 'bg-accent-soft text-accent-strong',
  error: 'bg-status-danger-soft text-status-danger-text',
  offline: 'bg-status-warning-soft text-status-warning-text',
  insufficient: 'bg-status-info-soft text-status-info-text',
  success: 'bg-status-positive-soft text-status-positive-text',
};

export function StatePage({
  type,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: {
  type: StateType;
  title: string;
  description: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}) {
  const IconComponent =
    type === 'empty' ? IconWallet : type === 'insufficient' ? IconInsights : IconSearch;
  return (
    <div
      className={cn(
        'mx-auto flex max-w-state flex-col items-center gap-4 rounded-xl border border-border-subtle bg-surface-default px-6 py-10 text-center',
        className,
      )}
    >
      <span className={cn('inline-flex h-14 w-14 items-center justify-center rounded-full', stateTone[type])}>
        <IconComponent size={24} />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-ui-18-bold text-text-primary">{title}</h2>
        <p className="text-ui-12 text-text-secondary">{description}</p>
      </div>
      {primaryAction || secondaryAction ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
