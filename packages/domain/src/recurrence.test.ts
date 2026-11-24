import { describe, expect, it } from 'vitest';
import {
  addFrequency,
  installmentAmounts,
  installmentProgress,
  installmentStatus,
  nextInstallment,
} from './recurrence.js';
import type { InstallmentPlan } from './types.js';

const plan = (overrides: Partial<InstallmentPlan> = {}): InstallmentPlan => ({
  id: 'p1',
  accountId: 'a1',
  concept: 'Portátil',
  totalMinor: 10000,
  currency: 'EUR',
  installments: 3,
  paidInstallments: 0,
  firstDueDate: '2026-11-20',
  frequency: 'monthly',
  createdAt: '2026-11-01T00:00:00.000Z',
  ...overrides,
});

describe('recurrence and installments', () => {
  it('avanza según la frecuencia', () => {
    expect(addFrequency('2026-11-20', 'monthly')).toBe('2026-12-20');
    expect(addFrequency('2026-11-20', 'weekly')).toBe('2026-11-27');
    expect(addFrequency('2026-11-20', 'yearly')).toBe('2027-11-20');
  });

  it('reparte el total en cuotas enteras', () => {
    expect(installmentAmounts(plan())).toEqual([3334, 3333, 3333]);
    expect(installmentAmounts(plan()).reduce((sum, value) => sum + value, 0)).toBe(10000);
  });

  it('calcula la siguiente cuota y el progreso', () => {
    const next = nextInstallment(plan({ paidInstallments: 1 }));
    expect(next?.amountMinor).toBe(3333);
    expect(next?.dueDate).toBe('2026-12-20');
    expect(installmentProgress(plan({ paidInstallments: 1 })).label).toBe('1 de 3');
    expect(installmentProgress(plan({ paidInstallments: 1 })).remainingAmountMinor).toBe(6666);
  });

  it('marca atrasado, al día y completado', () => {
    expect(installmentStatus(plan(), new Date('2026-11-25'))).toBe('overdue');
    expect(installmentStatus(plan(), new Date('2026-11-10'))).toBe('on-track');
    expect(installmentStatus(plan({ paidInstallments: 3 }))).toBe('completed');
    expect(nextInstallment(plan({ paidInstallments: 3 }))).toBeNull();
  });
});
