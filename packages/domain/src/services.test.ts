import { describe, expect, it } from 'vitest';
import {
  createAccount,
  createGroup,
  addGroupExpense,
  getGroupSummary,
  getQuickAnswers,
  recordMovement,
  settleTransfer,
  updateGroupRole,
  ValidationError,
  type Group,
  type InstallmentPlan,
  type Movement,
  type Recurrence,
  type Repositories,
  type Settings,
  type Transfer,
  type Account,
  type GroupExpense,
} from './index.js';

function memoryRepositories() {
  const accounts = new Map<string, Account>();
  const movements = new Map<string, Movement>();
  const recurrences = new Map<string, Recurrence>();
  const installments = new Map<string, InstallmentPlan>();
  const groups = new Map<string, Group>();
  const groupExpenses = new Map<string, GroupExpense>();
  const transfers = new Map<string, Transfer>();
  let settings: Settings = {
    id: 'app',
    theme: 'system',
    shellMode: 'sidebar',
    onboardingCompleted: false,
    demoLoaded: false,
  };

  const repositories: Repositories = {
    accounts: {
      list: async () => [...accounts.values()],
      get: async (id) => accounts.get(id),
      put: async (account) => void accounts.set(account.id, account),
      delete: async (id) => void accounts.delete(id),
    },
    movements: {
      list: async () => [...movements.values()],
      listByAccount: async (accountId) =>
        [...movements.values()].filter((movement) => movement.accountId === accountId),
      get: async (id) => movements.get(id),
      put: async (movement) => void movements.set(movement.id, movement),
      delete: async (id) => void movements.delete(id),
    },
    recurrences: {
      list: async () => [...recurrences.values()],
      get: async (id) => recurrences.get(id),
      put: async (recurrence) => void recurrences.set(recurrence.id, recurrence),
      delete: async (id) => void recurrences.delete(id),
    },
    installments: {
      list: async () => [...installments.values()],
      listByAccount: async (accountId) =>
        [...installments.values()].filter((plan) => plan.accountId === accountId),
      get: async (id) => installments.get(id),
      put: async (plan) => void installments.set(plan.id, plan),
      delete: async (id) => void installments.delete(id),
    },
    groups: {
      list: async () => [...groups.values()],
      get: async (id) => groups.get(id),
      put: async (group) => void groups.set(group.id, group),
      delete: async (id) => void groups.delete(id),
    },
    groupExpenses: {
      list: async () => [...groupExpenses.values()],
      listByGroup: async (groupId) =>
        [...groupExpenses.values()].filter((expense) => expense.groupId === groupId),
      get: async (id) => groupExpenses.get(id),
      put: async (expense) => void groupExpenses.set(expense.id, expense),
      delete: async (id) => void groupExpenses.delete(id),
    },
    transfers: {
      list: async () => [...transfers.values()],
      listByGroup: async (groupId) =>
        [...transfers.values()].filter((transfer) => transfer.groupId === groupId),
      put: async (transfer) => void transfers.set(transfer.id, transfer),
      delete: async (id) => void transfers.delete(id),
    },
    settings: {
      get: async () => settings,
      update: async (patch) => {
        settings = { ...settings, ...patch, id: 'app' };
        return settings;
      },
    },
  };

  return repositories;
}

describe('services', () => {
  it('valida el alta de cuenta y el saldo inicial', async () => {
    const repositories = memoryRepositories();
    await expect(
      createAccount(repositories, {
        name: ' ',
        type: 'personal',
        currency: 'EUR',
        initialBalanceMinor: 1000,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      createAccount(repositories, {
        name: 'Cuenta',
        type: 'personal',
        currency: 'EUR',
        initialBalanceMinor: 0,
      }),
    ).rejects.toThrow(/saldo inicial/);
    const account = await createAccount(repositories, {
      name: 'Cuenta',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 1000,
    });
    expect(account.currency).toBe('EUR');
  });

  it('registra movimientos y crea la recurrencia cuando se repite', async () => {
    const repositories = memoryRepositories();
    const account = await createAccount(repositories, {
      name: 'Cuenta',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 1000,
    });
    const movement = await recordMovement(repositories, {
      accountId: account.id,
      type: 'expense',
      amountMinor: 1299,
      date: '2026-11-07',
      concept: 'Vídeo',
      category: 'Suscripciones',
      repeat: { frequency: 'monthly' },
    });
    expect(movement.recurrenceId).toBeTruthy();
    const recurrences = await repositories.recurrences.list();
    expect(recurrences).toHaveLength(1);
    expect(recurrences[0]?.nextDate).toBe('2026-12-07');
  });

  it('calcula la liquidación y conserva el historial al saldar', async () => {
    const repositories = memoryRepositories();
    const group = await createGroup(repositories, {
      name: 'Piso',
      currency: 'EUR',
      members: [{ name: 'Ana' }, { name: 'Luis' }, { name: 'Marta' }],
    });
    const [ana, luis, marta] = group.members;
    await addGroupExpense(repositories, {
      groupId: group.id,
      payerMemberId: ana!.id,
      amountMinor: 9000,
      splitMode: 'equal',
      shares: [ana!, luis!, marta!].map((member) => ({
        memberId: member.id,
        amountMinor: 3000,
      })),
      date: '2026-11-10',
      concept: 'Cena',
    });
    const before = await getGroupSummary(repositories, group.id);
    expect(before?.pendingTotalMinor).toBe(6000);
    expect(before?.settlement).toHaveLength(2);
    await settleTransfer(repositories, {
      groupId: group.id,
      fromMemberId: luis!.id,
      toMemberId: ana!.id,
      amountMinor: 3000,
    });
    const after = await getGroupSummary(repositories, group.id);
    expect(after?.pendingTotalMinor).toBe(3000);
    expect(after?.transfers).toHaveLength(1);
  });

  it('solo permite cambiar roles a administración', async () => {
    const repositories = memoryRepositories();
    const group = await createGroup(repositories, {
      name: 'Piso',
      currency: 'EUR',
      members: [{ name: 'Ana' }, { name: 'Luis' }],
    });
    const [ana, luis] = group.members;
    await expect(updateGroupRole(repositories, group.id, luis!.id, 'admin', luis!.id)).rejects.toThrow(
      /administradora/,
    );
    const updated = await updateGroupRole(repositories, group.id, luis!.id, 'admin', ana!.id);
    expect(updated.members.find((member) => member.id === luis!.id)?.role).toBe('admin');
  });

  it('responde preguntas rápidas y marca datos insuficientes', async () => {
    const repositories = memoryRepositories();
    const empty = await getQuickAnswers(repositories, new Date('2026-11-15T12:00:00.000Z'));
    expect(empty.biggestExpense.hasData).toBe(false);

    const account = await createAccount(repositories, {
      name: 'Cuenta',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 1000,
    });
    await recordMovement(repositories, {
      accountId: account.id,
      type: 'expense',
      amountMinor: 4500,
      date: '2026-11-10',
      concept: 'Cena',
      category: 'Ocio',
    });
    const answers = await getQuickAnswers(repositories, new Date('2026-11-15T12:00:00.000Z'));
    expect(answers.biggestExpense.hasData).toBe(true);
    expect(answers.biggestExpense.amountMinor).toBe(4500);
    expect(answers.avoidable.amountMinor).toBe(4500);
  });
});
