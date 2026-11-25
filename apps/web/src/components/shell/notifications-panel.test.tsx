'use client';

import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';
import type { AppNotification } from '@akari/domain';
import { NotificationsPanel } from './notifications-panel';

const notifications: AppNotification[] = [
  {
    id: 'payment:installment:plan-laptop:2026-11-20',
    kind: 'payment',
    tone: 'danger',
    title: 'Cuota vencida: Portátil · cuota',
    detail: 'Cuenta diaria · Saldo 500,00 € · faltan 1.000,00 €',
    status: 'Vencida',
    amountMinor: 15000,
    currency: 'EUR',
    date: '2026-11-20',
    href: null,
    seen: false,
    action: { type: 'pay-installment', planId: 'plan-laptop' },
  },
  {
    id: 'payment:recurrence:rec-video:2026-12-04',
    kind: 'payment',
    tone: 'info',
    title: 'Pago próximo: Suscripción vídeo',
    detail: 'Cuenta diaria · Saldo 1.500,00 €',
    status: 'Próxima',
    amountMinor: 1299,
    currency: 'EUR',
    date: '2026-12-04',
    href: null,
    seen: false,
    action: { type: 'pay-recurrence', recurrenceId: 'rec-video' },
  },
  {
    id: 'joint-activity:mov-1',
    kind: 'joint-activity',
    tone: 'positive',
    title: 'Ana añadió dinero',
    detail: 'Aportación · Cuenta conjunta',
    status: 'Cuenta conjunta',
    amountMinor: 5000,
    currency: 'EUR',
    date: '2026-11-28',
    href: '/cuentas/acc-joint',
    seen: false,
    action: { type: 'open-account', accountId: 'acc-joint' },
  },
  {
    id: 'settlement-pending:grp:ana:marta:3000',
    kind: 'settlement',
    tone: 'warning',
    title: 'Debes 30,00 € a Ana',
    detail: 'Piso compartido · liquidación pendiente',
    status: 'Pendiente',
    amountMinor: 3000,
    currency: 'EUR',
    date: '2026-11-29',
    href: '/grupos/grp',
    seen: false,
    action: { type: 'open-group', groupId: 'grp' },
  },
];

function renderPanel(overrides: Partial<Parameters<typeof NotificationsPanel>[0]> = {}) {
  const onPay = vi.fn();
  const onClose = vi.fn();
  const view = render(
    <NotificationsPanel
      notifications={notifications}
      busyId={null}
      onPay={onPay}
      onClose={onClose}
      {...overrides}
    />,
  );
  return { onPay, onClose, view };
}

describe('NotificationsPanel', () => {
  it('muestra los avisos en una lista única y sin botón Pagar', () => {
    renderPanel();

    expect(screen.getByRole('dialog', { name: 'Avisos' })).not.toBeNull();
    expect(screen.queryByRole('heading', { name: /Pagos próximos/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: /Cuentas compartidas/ })).toBeNull();
    expect(screen.queryByRole('heading', { name: /Liquidaciones/ })).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText(/faltan 1.000,00/)).not.toBeNull();
    expect(screen.getByText(/Saldo 1.500,00/)).not.toBeNull();
    expect(screen.getByText('Ana añadió dinero')).not.toBeNull();
    expect(screen.getByText('Debes 30,00 € a Ana')).not.toBeNull();
    expect(screen.queryByText('Pagar')).toBeNull();
  });

  it('marca las cuotas en rojo y los próximos pagos en azul', () => {
    renderPanel();
    const installment = screen.getByRole('button', { name: /Cuota vencida/ });
    expect(installment.getAttribute('data-tone')).toBe('danger');
    expect(installment.className).toContain('bg-status-danger-soft');
    expect(installment.className).toContain('border-status-danger/30');

    const recurring = screen.getByRole('button', { name: /Suscripción vídeo/ });
    expect(recurring.getAttribute('data-tone')).toBe('info');
    expect(recurring.className).toContain('bg-status-info-soft');
    expect(recurring.className).toContain('border-status-info/30');
  });

  it('paga un aviso al pulsar toda la fila', () => {
    const { onPay } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /Cuota vencida/ }));
    expect(onPay).toHaveBeenCalledWith(notifications[0]);
  });

  it('navega y cierra al pulsar un aviso de cuenta o liquidación', () => {
    const { onClose } = renderPanel();
    const link = screen.getByRole('link', { name: /Ana añadió dinero/ });
    expect(link.getAttribute('href')).toBe('/cuentas/acc-joint');
    fireEvent.click(link);
    expect(onClose).toHaveBeenCalled();
  });

  it('bloquea el pago mientras hay una operación en curso', () => {
    renderPanel({ busyId: notifications[0]!.id });
    expect(screen.getByRole('button', { name: /Cuota vencida/ })).toHaveProperty('disabled', true);
  });

  it('muestra un mensaje de carga mientras no hay datos', () => {
    renderPanel({ notifications: undefined });
    expect(screen.getByRole('status').textContent).toContain('Cargando avisos');
    expect(screen.queryByText('No hay avisos')).toBeNull();
  });

  it('muestra el estado vacío cuando no hay avisos', () => {
    renderPanel({ notifications: [] });
    expect(screen.getByText('No hay avisos')).not.toBeNull();
    expect(screen.getByText(/pagos próximos, la actividad de tus cuentas compartidas/)).not.toBeNull();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('cierra con Escape, con la ✕ y al pulsar fuera', () => {
    const { onClose } = renderPanel();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.pointerDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('no tiene violaciones de accesibilidad graves', async () => {
    const { view } = renderPanel();
    const results = await axe(view.container);
    expect(results.violations).toEqual([]);
  });
});
