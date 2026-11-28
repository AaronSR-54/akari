'use client';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Account, Movement } from '@akari/domain';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));
vi.mock('../providers', () => ({
  useData: () => ({ repositories: {} }),
}));
vi.mock('@akari/ui', async () => {
  const actual = await vi.importActual<typeof import('@akari/ui')>('@akari/ui');
  return { ...actual, useToast: () => ({ toast: vi.fn() }) };
});

import { MovementForm } from './movement-form';

const base = {
  currency: 'EUR',
  initialBalanceMinor: 1000,
  includeInTotal: true,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

const joint: Account = {
  ...base,
  id: 'acc-joint',
  name: 'Cuenta conjunta',
  type: 'joint',
  members: [
    { id: 'mem-ana', name: 'Ana', role: 'admin' },
    { id: 'mem-luis', name: 'Luis', role: 'editor' },
  ],
};

const personal: Account = {
  ...base,
  id: 'acc-personal',
  name: 'Cuenta personal',
  type: 'personal',
};

const movement: Movement = {
  id: 'mov-1',
  accountId: 'acc-personal',
  type: 'expense',
  amountMinor: 4250,
  currency: 'EUR',
  date: '2026-11-15',
  concept: 'Cena',
  category: 'Ocio',
  createdAt: '2026-11-15T20:00:00.000Z',
};

describe('MovementForm', () => {
  it('pide el autor y usa el primer miembro cuando el perfil no pertenece a la cuenta', () => {
    render(<MovementForm accounts={[joint]} />);
    expect(screen.getByText('Registrado por')).not.toBeNull();
    expect(screen.getByText('Ana')).not.toBeNull();
  });

  it('no pide autor en cuentas sin miembros', () => {
    render(<MovementForm accounts={[personal]} />);
    expect(screen.queryByText('Registrado por')).toBeNull();
  });

  it('bloquea los campos en modo lectura', () => {
    render(
      <MovementForm
        accounts={[personal]}
        movement={movement}
        readOnly
        showActions={false}
        formId="detail-form"
      />,
    );
    expect(screen.getByRole('textbox', { name: /Importe/ })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: /Cuenta/ })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Concepto/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Fecha/ })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: /Categoría/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Gasto' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).toBeNull();
  });
});
