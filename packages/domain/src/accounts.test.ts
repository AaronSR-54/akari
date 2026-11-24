import { describe, expect, it } from 'vitest';
import {
  aggregateBalances,
  calculateAccountBalance,
  monthOverMonthExpenses,
  projectMonthEnd,
  upcomingPayments,
} from './accounts.js';
import type { Account, InstallmentPlan, Movement, Recurrence } from './types.js';

const account = (overrides: Partial<Account> = {}): Account => ({
  id: 'a1',
  name: 'Nómina',
  type: 'personal',
  currency: 'EUR',
  initialBalanceMinor: 100000,
  includeInTotal: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const movement = (overrides: Partial<Movement> = {}): Movement => ({
  id: 'm1',
  accountId: 'a1',
  type: 'expense',
  amountMinor: 1000,
  currency: 'EUR',
  date: '2026-11-10',
  concept: 'Cena',
  category: 'Ocio',
  createdAt: '2026-11-10T00:00:00.000Z',
  ...overrides,
});

describe('accounts', () => {
  it('calcula el saldo con ingresos y gastos', () => {
    const balance = calculateAccountBalance(account(), [
      movement({ amountMinor: 5000 }),
      movement({ type: 'income', amountMinor: 20000, id: 'm2' }),
    ]);
    expect(balance.minor).toBe(115000);
  });

  it('agrega solo cuentas incluidas y agrupa por divisa', () => {
    const eur = account({ id: 'a1' });
    const usd = account({ id: 'a2', currency: 'USD', initialBalanceMinor: 5000 });
    const excluded = account({ id: 'a3', includeInTotal: false });
    const totals = aggregateBalances([eur, usd, excluded], [movement()]);
    expect(totals).toHaveLength(2);
    expect(totals.find((entry) => entry.currency === 'EUR')?.minor).toBe(99000);
    expect(totals.find((entry) => entry.currency === 'USD')?.minor).toBe(5000);
  });

  it('proyecta fin de mes con recurrencias y cuotas', () => {
    const recurrence: Recurrence = {
      id: 'r1',
      accountId: 'a1',
      type: 'expense',
      amountMinor: 1500,
      currency: 'EUR',
      concept: 'Suscripción',
      category: 'Suscripciones',
      frequency: 'monthly',
      nextDate: '2026-11-28',
      createdAt: '2026-11-01T00:00:00.000Z',
    };
    const plan: InstallmentPlan = {
      id: 'p1',
      accountId: 'a1',
      concept: 'Portátil',
      totalMinor: 30000,
      currency: 'EUR',
      installments: 3,
      paidInstallments: 0,
      firstDueDate: '2026-11-20',
      frequency: 'monthly',
      createdAt: '2026-11-01T00:00:00.000Z',
    };
    const projected = projectMonthEnd(
      account(),
      [movement()],
      [recurrence],
      [plan],
      new Date('2026-11-15T12:00:00.000Z'),
    );
    expect(projected.minor).toBe(100000 - 1000 - 1500 - 10000);
  });

  it('no proyecta cuotas de meses posteriores', () => {
    const plan: InstallmentPlan = {
      id: 'p1',
      accountId: 'a1',
      concept: 'Portátil',
      totalMinor: 30000,
      currency: 'EUR',
      installments: 3,
      paidInstallments: 0,
      firstDueDate: '2027-01-20',
      frequency: 'monthly',
      createdAt: '2026-11-01T00:00:00.000Z',
    };
    const projected = projectMonthEnd(account(), [], [], [plan], new Date('2026-11-15T12:00:00.000Z'));
    expect(projected.minor).toBe(100000);
  });

  it('compara el gasto con el mes anterior', () => {
    const movements = [
      movement({ id: 'current', date: '2026-11-10', amountMinor: 1200 }),
      movement({ id: 'previous', date: '2026-10-10', amountMinor: 1000 }),
    ];
    const comparison = monthOverMonthExpenses(movements, new Date('2026-11-15T12:00:00.000Z'), 'EUR');
    expect(comparison.current).toBe(1200);
    expect(comparison.previous).toBe(1000);
    expect(comparison.changePct).toBe(20);
  });

  it('lista próximos pagos de recurrencias y cuotas', () => {
    const recurrence: Recurrence = {
      id: 'r1',
      accountId: 'a1',
      type: 'expense',
      amountMinor: 1500,
      currency: 'EUR',
      concept: 'Suscripción',
      category: 'Suscripciones',
      frequency: 'monthly',
      nextDate: '2026-11-28',
      createdAt: '2026-11-01T00:00:00.000Z',
    };
    const plan: InstallmentPlan = {
      id: 'p1',
      accountId: 'a1',
      concept: 'Portátil',
      totalMinor: 30000,
      currency: 'EUR',
      installments: 3,
      paidInstallments: 0,
      firstDueDate: '2026-11-20',
      frequency: 'monthly',
      createdAt: '2026-11-01T00:00:00.000Z',
    };
    const upcoming = upcomingPayments(
      [recurrence],
      [plan],
      [account()],
      new Date('2026-11-15T12:00:00.000Z'),
    );
    expect(upcoming.map((entry) => entry.kind)).toEqual(['installment', 'recurrence']);
    expect(upcoming[0]?.amountMinor).toBe(10000);
  });
});
