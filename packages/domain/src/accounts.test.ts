import { describe, expect, it } from 'vitest';
import {
  aggregateBalances,
  calculateAccountBalance,
  currentMonthMovements,
  monthExpenseEstimate,
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

  it('desglosa los movimientos del mes, su saldo y los días transcurridos', () => {
    const movements = [
      movement({
        id: 'd1',
        date: '2026-11-02',
        amountMinor: 1000,
        createdAt: '2026-11-02T08:00:00.000Z',
      }),
      movement({
        id: 'income',
        type: 'income',
        date: '2026-11-02',
        amountMinor: 5000,
        createdAt: '2026-11-02T09:00:00.000Z',
      }),
      movement({
        id: 'd2',
        date: '2026-11-02',
        amountMinor: 500,
        createdAt: '2026-11-02T10:00:00.000Z',
      }),
      movement({ id: 'other-currency', currency: 'USD', date: '2026-11-03', amountMinor: 3000 }),
      movement({ id: 'next-month', date: '2026-12-01', amountMinor: 9999 }),
      movement({ id: 'future', date: '2026-11-30', amountMinor: 700 }),
    ];
    const month = currentMonthMovements(
      movements,
      'EUR',
      new Date('2026-11-29T12:00:00.000Z'),
      10000,
    );
    expect(month.daysInMonth).toBe(30);
    expect(month.elapsedDays).toBe(29);
    expect(month.openingDate).toBe('2026-10-31');
    expect(month.openingBalanceMinor).toBe(10000);
    expect(month.days).toHaveLength(30);
    expect(month.days[0]).toMatchObject({
      date: '2026-11-01',
      day: 1,
      expenseMinor: 0,
      incomeMinor: 0,
      netMinor: 0,
      balanceMinor: 10000,
      count: 0,
      elapsed: true,
    });
    expect(month.days[1]).toMatchObject({
      date: '2026-11-02',
      expenseMinor: 1500,
      incomeMinor: 5000,
      netMinor: 3500,
      balanceMinor: 13500,
      count: 3,
      elapsed: true,
    });
    expect(month.days[1]?.movements.map((entry) => entry.id)).toEqual(['d1', 'income', 'd2']);
    expect(month.days[29]).toMatchObject({
      date: '2026-11-30',
      expenseMinor: 700,
      balanceMinor: 12800,
      elapsed: false,
    });
    expect(month.days[28]).toMatchObject({
      date: '2026-11-29',
      balanceMinor: 13500,
      elapsed: true,
    });
    expect(month.expenseMinor).toBe(1500);
    expect(month.incomeMinor).toBe(5000);
    expect(month.netMinor).toBe(3500);
    expect(month.count).toBe(3);
  });

  it('no adelanta al saldo real una nómina fechada a fin de mes', () => {
    const rent = movement({ id: 'rent', date: '2026-11-02', amountMinor: 85000 });
    const salary = movement({
      id: 'salary',
      type: 'income',
      date: '2026-11-30',
      amountMinor: 240000,
    });
    const today = new Date('2026-11-29T12:00:00.000Z');

    const month = currentMonthMovements([rent, salary], 'EUR', today, 100000);
    expect(month.elapsedDays).toBe(29);
    expect(month.incomeMinor).toBe(0);
    expect(month.netMinor).toBe(-85000);
    expect(month.days[28]).toMatchObject({
      date: '2026-11-29',
      balanceMinor: 15000,
      elapsed: true,
    });
    expect(month.days[29]).toMatchObject({
      date: '2026-11-30',
      incomeMinor: 240000,
      balanceMinor: 255000,
      elapsed: false,
    });

    expect(aggregateBalances([account()], [rent, salary], '2026-11-29')).toEqual([
      { minor: 15000, currency: 'EUR' },
    ]);
    expect(projectMonthEnd(account(), [rent, salary], [], [], today).minor).toBe(255000);
  });

  it('proyecta la nómina recurrente de fin de mes sin sumarla antes de tiempo', () => {
    const rent = movement({ id: 'rent', date: '2026-11-02', amountMinor: 85000 });
    const salary: Recurrence = {
      id: 'salary-rec',
      accountId: 'a1',
      type: 'income',
      amountMinor: 240000,
      currency: 'EUR',
      concept: 'Nómina',
      category: 'Ingresos',
      frequency: 'monthly',
      nextDate: '2026-11-30',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const today = new Date('2026-11-29T12:00:00.000Z');

    const month = currentMonthMovements([rent], 'EUR', today, 100000);
    expect(month.incomeMinor).toBe(0);
    expect(month.netMinor).toBe(-85000);
    expect(aggregateBalances([account()], [rent], '2026-11-29')).toEqual([
      { minor: 15000, currency: 'EUR' },
    ]);
    expect(projectMonthEnd(account(), [rent], [salary], [], today).minor).toBe(255000);
  });

  it('estima el cierre del mes con la media diaria de meses anteriores', () => {
    const movements = [
      movement({ id: 'current', date: '2026-11-10', amountMinor: 30000 }),
      movement({ id: 'prev-1', date: '2026-10-01', amountMinor: 31000 }),
      movement({ id: 'prev-2', date: '2026-09-01', amountMinor: 30000 }),
    ];
    const estimate = monthExpenseEstimate(
      movements,
      'EUR',
      new Date('2026-11-29T12:00:00.000Z'),
      3,
    );
    expect(estimate.monthsWithData).toBe(2);
    expect(estimate.dailyAverageMinor).toBe(1000);
    expect(estimate.remainingDays).toBe(1);
    expect(estimate.estimateMinor).toBe(31000);
  });

  it('no estima sin meses anteriores con gasto', () => {
    const estimate = monthExpenseEstimate(
      [movement({ date: '2026-11-10', amountMinor: 3000 })],
      'EUR',
      new Date('2026-11-29T12:00:00.000Z'),
    );
    expect(estimate.estimateMinor).toBeNull();
    expect(estimate.monthsWithData).toBe(0);
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
