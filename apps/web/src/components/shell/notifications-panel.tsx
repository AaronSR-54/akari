'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import {
  Amount,
  Badge,
  Button,
  Icon,
  IconChevronLeft,
  acquireScrollLock,
  cn,
  type BadgeTone,
  type IconName,
} from '@akari/ui';
import type { AppNotification, NotificationKind } from '@akari/domain';
import { formatShortDate } from '../../lib/format';
import { appTodayKey } from '../../lib/clock';

const kindIcon: Record<NotificationKind, IconName> = {
  payment: 'wallet',
  'joint-activity': 'users',
  settlement: 'arrows',
};

const badgeTone: Record<AppNotification['tone'], BadgeTone> = {
  danger: 'negative',
  warning: 'warning',
  info: 'info',
  positive: 'positive',
  neutral: 'neutral',
};

function dateLabel(date: string): string {
  return date === appTodayKey() ? 'Hoy' : formatShortDate(date);
}

function NotificationRow({
  notification,
  busy,
  onPay,
  onClose,
}: {
  notification: AppNotification;
  busy: boolean;
  onPay: (notification: AppNotification) => void;
  onClose: () => void;
}) {
  const isInstallment = notification.action.type === 'pay-installment';
  const isRecurrence = notification.action.type === 'pay-recurrence';
  const icon = isInstallment
    ? 'warning'
    : isRecurrence
      ? 'clock'
      : kindIcon[notification.kind];
  const className = cn(
    'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
    isInstallment
      ? 'border-status-danger/30 bg-status-danger-soft hover:bg-status-danger-soft'
      : isRecurrence
        ? 'border-status-info/30 bg-status-info-soft hover:bg-status-info-soft'
        : 'border-border-subtle bg-surface-default hover:bg-surface-sunken',
    busy && 'opacity-60',
  );
  const content = (
    <>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full bg-surface-default text-text-secondary">
        <Icon name={icon} size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-ui-13-strong text-text-primary">{notification.title}</span>
          <Badge tone={badgeTone[notification.tone]}>{notification.status}</Badge>
        </span>
        <span className="mt-0.5 block text-ui-11 text-text-secondary">{notification.detail}</span>
        <span className="mt-1 block text-ui-10 text-text-tertiary">{dateLabel(notification.date)}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-2">
        <Amount
          minor={notification.amountMinor}
          currency={notification.currency}
          className="text-ui-13-strong text-text-primary"
        />
        <IconChevronLeft size={16} className="rotate-180 text-text-tertiary" />
      </span>
    </>
  );

  if (notification.href) {
    return (
      <li>
        <Link
          href={notification.href}
          onClick={onClose}
          className={className}
          data-notification-kind={notification.kind}
          data-tone={notification.tone}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => onPay(notification)}
        disabled={busy}
        className={className}
        aria-busy={busy}
        data-notification-kind={notification.kind}
        data-tone={notification.tone}
      >
        {content}
      </button>
    </li>
  );
}

export function NotificationsPanel({
  notifications,
  busyId,
  onPay,
  onClose,
}: {
  notifications: AppNotification[] | undefined;
  busyId: string | null;
  onPay: (notification: AppNotification) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const releaseScroll = acquireScrollLock();
    return releaseScroll;
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    panel?.focus();
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const trigger = panel?.parentElement?.querySelector<HTMLButtonElement>(
        'button[aria-haspopup="dialog"]',
      );
      if (panel?.contains(target) || trigger?.contains(target)) return;
      onCloseRef.current();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      panel?.parentElement
        ?.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')
        ?.focus();
      onCloseRef.current();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <div
        data-notifications-backdrop
        aria-hidden="true"
        className="fixed inset-0 z-40 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Avisos"
        tabIndex={-1}
        className="absolute right-0 top-[calc(100%+8px)] z-50 flex max-h-[calc(100vh-6rem)] w-[min(28rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface-raised/90 p-3 backdrop-blur-sm elevation-3 outline-none"
      >
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h2 className="text-ui-13-strong text-text-primary">Avisos</h2>
        <Button variant="tertiary" size="sm" onClick={onClose} aria-label="Cerrar">
          ✕
        </Button>
      </div>
      <div className="-mr-2 overflow-y-auto pr-2">
        {notifications === undefined ? (
          <p role="status" className="px-1 text-ui-12 text-text-secondary">
            Cargando avisos…
          </p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col gap-1 rounded-lg border border-border-subtle bg-surface-default p-4">
            <p className="text-ui-13-strong text-text-primary">No hay avisos</p>
            <p className="text-ui-12 text-text-secondary">
              Aquí aparecerán los pagos próximos, la actividad de tus cuentas compartidas y las
              liquidaciones.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                busy={busyId === notification.id}
                onPay={onPay}
                onClose={onClose}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
    </>
  );
}
