import { describe, expect, it } from 'vitest';
import type {
  Account,
  Group,
  GroupExpense,
  InstallmentPlan,
  Movement,
  Recurrence,
  Transfer,
} from '@akari/domain';
import { fromRemoteRow, toRemoteRow } from './mapping.js';
import type { CloudRow } from './types.js';

const now = '2026-11-26T10:00:00.000Z';

const account: Account = {
  id: 'acc_1',
  name: 'Diaria',
  type: 'personal',
  currency: 'EUR',
  initialBalanceMinor: 123456,
  taeBps: 250,
  bankId: 'santander',
  includeInTotal: true,
  members: [{ id: 'mem_1', name: 'Ana', role: 'admin' }],
  archivedAt: null,
  createdAt: now,
  updatedAt: now,
};

const movement: Movement = {
  id: 'mov_1',
  accountId: 'acc_1',
  type: 'expense',
  amountMinor: 2599,
  currency: 'EUR',
  date: '2026-11-20',
  concept: 'Cena',
  category: 'Ocio',
  note: 'Con Ana',
  memberId: 'mem_1',
  createdAt: now,
};

const recurrence: Recurrence = {
  id: 'rec_1',
  accountId: 'acc_1',
  type: 'expense',
  amountMinor: 999,
  currency: 'EUR',
  concept: 'Streaming',
  category: 'Suscripciones',
  frequency: 'monthly',
  nextDate: '2026-12-01',
  endDate: null,
  createdAt: now,
};

const plan: InstallmentPlan = {
  id: 'ins_1',
  accountId: 'acc_1',
  concept: 'Portátil',
  totalMinor: 120000,
  currency: 'EUR',
  installments: 12,
  paidInstallments: 3,
  firstDueDate: '2026-01-15',
  frequency: 'monthly',
  createdAt: now,
};

const group: Group = {
  id: 'grp_1',
  name: 'Piso',
  currency: 'EUR',
  members: [{ id: 'mem_1', name: 'Ana', role: 'admin' }],
  settlementAccountId: 'acc_1',
  createdAt: now,
  updatedAt: now,
};

const groupExpense: GroupExpense = {
  id: 'gex_1',
  groupId: 'grp_1',
  payerMemberId: 'mem_1',
  amountMinor: 4500,
  currency: 'EUR',
  originalAmountMinor: 4500,
  originalCurrency: 'EUR',
  exchangeRate: null,
  accountId: 'acc_1',
  splitMode: 'equal',
  shares: [{ memberId: 'mem_1', amountMinor: 2250 }],
  date: '2026-11-21',
  concept: 'Cena',
  category: 'Ocio',
  createdAt: now,
};

const transfer: Transfer = {
  id: 'trf_1',
  groupId: 'grp_1',
  fromMemberId: 'mem_1',
  toMemberId: 'mem_2',
  amountMinor: 2250,
  currency: 'EUR',
  status: 'pending',
  settledAt: null,
  createdAt: now,
};

function remote(entity: Record<string, unknown>): CloudRow {
  return { ...entity, user_id: 'user-1', updated_at: now, deleted_at: null } as CloudRow;
}

describe('mapeo de sincronización', () => {
  it('conserva todos los campos de una cuenta', () => {
    const row = remote(toRemoteRow('accounts', account));
    expect(row.initial_balance_minor).toBe(123456);
    expect(row.bank_id).toBe('santander');
    expect(fromRemoteRow('accounts', row)).toEqual(
      expect.objectContaining({
        id: 'acc_1',
        initialBalanceMinor: 123456,
        taeBps: 250,
        bankId: 'santander',
        includeInTotal: true,
      }),
    );
  });

  it('conserva movimientos, recurrencias y planes', () => {
    expect(fromRemoteRow('movements', remote(toRemoteRow('movements', movement)))).toEqual(
      movement,
    );
    expect(fromRemoteRow('recurrences', remote(toRemoteRow('recurrences', recurrence)))).toEqual(
      recurrence,
    );
    expect(fromRemoteRow('installments', remote(toRemoteRow('installments', plan)))).toEqual(plan);
  });

  it('conserva grupos, gastos y transferencias con sus repartos', () => {
    expect(fromRemoteRow('groups', remote(toRemoteRow('groups', group)))).toEqual(group);
    expect(
      fromRemoteRow('groupExpenses', remote(toRemoteRow('groupExpenses', groupExpense))),
    ).toEqual(groupExpense);
    expect(fromRemoteRow('transfers', remote(toRemoteRow('transfers', transfer)))).toEqual(
      transfer,
    );
  });

  it('normaliza valores nulos de la nube', () => {
    const row = remote(toRemoteRow('accounts', { ...account, taeBps: null, bankId: null }));
    const parsed = fromRemoteRow('accounts', row) as Account;
    expect(parsed.taeBps).toBeNull();
    expect(parsed.bankId).toBeNull();
  });
});
