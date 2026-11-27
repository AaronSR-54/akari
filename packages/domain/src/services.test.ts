import { describe, expect, it } from 'vitest';
import {
  createAccount,
  createGroup,
  addGroupExpense,
  getGroupSummary,
  getOverview,
  getQuickAnswers,
  installmentProgress,
  nextInstallment,
  payRecurrence,
  recordMovement,
  settleTransfer,
  updateAccount,
  updateGroupRole,
  updateProfileName,
  updateProfilePreferences,
  ValidationError,
  type BankId,
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

  it('guarda el banco del catálogo, rechaza uno desconocido y permite omitirlo', async () => {
    const repositories = memoryRepositories();
    const withBank = await createAccount(repositories, {
      name: 'Nómina',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 1000,
      bankId: 'bbva',
    });
    expect(withBank.bankId).toBe('bbva');

    const withoutBank = await createAccount(repositories, {
      name: 'Ahorros',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 1000,
    });
    expect(withoutBank.bankId).toBeNull();

    await expect(
      createAccount(repositories, {
        name: 'Inventada',
        type: 'personal',
        currency: 'EUR',
        initialBalanceMinor: 1000,
        bankId: 'inexistente' as BankId,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('cambia y limpia el banco al editar una cuenta', async () => {
    const repositories = memoryRepositories();
    const account = await createAccount(repositories, {
      name: 'Nómina',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 1000,
      bankId: 'santander',
    });
    expect((await updateAccount(repositories, account.id, { bankId: 'cash' })).bankId).toBe('cash');
    expect((await updateAccount(repositories, account.id, { bankId: null })).bankId).toBeNull();
    expect((await updateAccount(repositories, account.id, { name: 'Renombrada' })).bankId).toBeNull();
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

  it('guarda el autor del movimiento en cuentas conjuntas', async () => {
    const repositories = memoryRepositories();
    const joint = await createAccount(repositories, {
      name: 'Cuenta conjunta',
      type: 'joint',
      currency: 'EUR',
      initialBalanceMinor: 1000,
      members: [{ id: 'm-ana', name: 'Ana', role: 'admin' }],
    });
    const movement = await recordMovement(repositories, {
      accountId: joint.id,
      type: 'expense',
      amountMinor: 1000,
      date: '2026-11-07',
      concept: 'Compra',
      category: 'Alimentación',
      memberId: 'm-ana',
    });
    expect(movement.memberId).toBe('m-ana');

    await expect(
      recordMovement(repositories, {
        accountId: joint.id,
        type: 'expense',
        amountMinor: 1000,
        date: '2026-11-07',
        concept: 'Compra',
        category: 'Alimentación',
        memberId: 'm-otra',
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    const personal = await createAccount(repositories, {
      name: 'Personal',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 1000,
    });
    const plain = await recordMovement(repositories, {
      accountId: personal.id,
      type: 'income',
      amountMinor: 1000,
      date: '2026-11-07',
      concept: 'Ingreso',
      category: 'Ingresos',
    });
    expect(plain.memberId).toBeNull();
  });

  it('paga una recurrencia y avanza su próxima fecha', async () => {
    const repositories = memoryRepositories();
    const account = await createAccount(repositories, {
      name: 'Cuenta',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 1000,
    });
    await repositories.recurrences.put({
      id: 'rec-1',
      accountId: account.id,
      type: 'expense',
      amountMinor: 1299,
      currency: 'EUR',
      concept: 'Vídeo',
      category: 'Suscripciones',
      frequency: 'monthly',
      nextDate: '2026-11-20',
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    const movement = await payRecurrence(repositories, 'rec-1', { date: '2026-11-29' });
    expect(movement.concept).toBe('Vídeo');
    expect(movement.recurrenceId).toBe('rec-1');
    const recurrence = await repositories.recurrences.get('rec-1');
    expect(recurrence?.nextDate).toBe('2026-12-20');
  });

  it('elimina la recurrencia cuando el pago supera su fecha de fin', async () => {
    const repositories = memoryRepositories();
    const account = await createAccount(repositories, {
      name: 'Cuenta',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 1000,
    });
    await repositories.recurrences.put({
      id: 'rec-end',
      accountId: account.id,
      type: 'expense',
      amountMinor: 1000,
      currency: 'EUR',
      concept: 'Temporal',
      category: 'Ocio',
      frequency: 'monthly',
      nextDate: '2026-11-29',
      endDate: '2026-11-30',
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    await payRecurrence(repositories, 'rec-end', { date: '2026-11-29' });
    expect(await repositories.recurrences.get('rec-end')).toBeUndefined();
  });

  it('expone la evolución del saldo del mes en el resumen con la divisa de referencia', async () => {
    const repositories = memoryRepositories();
    const eur = await createAccount(repositories, {
      name: 'Cuenta',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 100000,
    });
    const usd = await createAccount(repositories, {
      name: 'Cuenta USD',
      type: 'personal',
      currency: 'USD',
      initialBalanceMinor: 100000,
    });
    await repositories.movements.put({
      id: 'eur-week',
      accountId: eur.id,
      type: 'expense',
      amountMinor: 1250,
      currency: 'EUR',
      date: '2026-11-24',
      concept: 'Café',
      category: 'Ocio',
      createdAt: '2026-11-24T08:00:00.000Z',
    });
    await repositories.movements.put({
      id: 'eur-income',
      accountId: eur.id,
      type: 'income',
      amountMinor: 5000,
      currency: 'EUR',
      date: '2026-11-24',
      concept: 'Nómina',
      category: 'Ingresos',
      createdAt: '2026-11-24T09:00:00.000Z',
    });
    await repositories.movements.put({
      id: 'usd-week',
      accountId: usd.id,
      type: 'expense',
      amountMinor: 9999,
      currency: 'USD',
      date: '2026-11-24',
      concept: 'Café USD',
      category: 'Ocio',
      createdAt: '2026-11-24T08:00:00.000Z',
    });

    const overview = await getOverview(repositories, new Date('2026-11-24T12:00:00.000Z'));
    expect(overview.month.currency).toBe('EUR');
    expect(overview.month.expenseMinor).toBe(1250);
    expect(overview.month.incomeMinor).toBe(5000);
    expect(overview.month.netMinor).toBe(3750);
    expect(overview.month.count).toBe(2);
    expect(overview.month.daysInMonth).toBe(30);
    expect(overview.month.elapsedDays).toBe(24);
    expect(overview.month.openingDate).toBe('2026-10-31');
    expect(overview.month.openingBalanceMinor).toBe(100000);
    expect(overview.month.days[23]).toMatchObject({
      expenseMinor: 1250,
      incomeMinor: 5000,
      balanceMinor: 103750,
    });
    expect(overview.month.days[23]?.movements[0]?.concept).toBe('Café');
    expect(overview.month.estimate.estimateMinor).toBeNull();
  });

  it('expone los planes activos del resumen con vencidos primero', async () => {
    const repositories = memoryRepositories();
    const account = await createAccount(repositories, {
      name: 'Cuenta',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 100000,
    });
    const basePlan = {
      accountId: account.id,
      currency: 'EUR',
      frequency: 'monthly' as const,
      createdAt: '2026-08-01T09:00:00.000Z',
    };
    await repositories.installments.put({
      ...basePlan,
      id: 'future-plan',
      concept: 'Futuro',
      totalMinor: 40000,
      installments: 4,
      paidInstallments: 1,
      firstDueDate: '2026-11-01',
    });
    await repositories.installments.put({
      ...basePlan,
      id: 'overdue-plan',
      concept: 'Vencido',
      totalMinor: 60000,
      installments: 6,
      paidInstallments: 2,
      firstDueDate: '2026-09-10',
    });
    await repositories.installments.put({
      ...basePlan,
      id: 'completed-plan',
      concept: 'Completado',
      totalMinor: 30000,
      installments: 3,
      paidInstallments: 3,
      firstDueDate: '2026-08-01',
    });

    const overview = await getOverview(repositories, new Date('2026-11-24T12:00:00.000Z'));
    expect(overview.installments.map((plan) => plan.id)).toEqual(['overdue-plan', 'future-plan']);
    expect(nextInstallment(overview.installments[0]!)).toMatchObject({
      dueDate: '2026-11-10',
      number: 3,
    });
    expect(installmentProgress(overview.installments[1]!)).toMatchObject({
      paid: 1,
      total: 4,
      percent: 25,
    });
  });

  it('lleva una nómina de fin de mes a la previsión sin adelantarla al saldo real', async () => {
    const repositories = memoryRepositories();
    const eur = await createAccount(repositories, {
      name: 'Cuenta',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 100000,
    });
    await repositories.movements.put({
      id: 'rent',
      accountId: eur.id,
      type: 'expense',
      amountMinor: 85000,
      currency: 'EUR',
      date: '2026-11-02',
      concept: 'Alquiler',
      category: 'Vivienda',
      createdAt: '2026-11-02T08:00:00.000Z',
    });
    await repositories.movements.put({
      id: 'salary',
      accountId: eur.id,
      type: 'income',
      amountMinor: 240000,
      currency: 'EUR',
      date: '2026-11-30',
      concept: 'Nómina',
      category: 'Ingresos',
      createdAt: '2026-11-01T08:00:00.000Z',
    });

    const overview = await getOverview(repositories, new Date('2026-11-29T12:00:00.000Z'));
    expect(overview.totalBalances).toEqual([{ minor: 15000, currency: 'EUR' }]);
    expect(overview.balancesByAccount[eur.id]?.minor).toBe(15000);
    expect(overview.month.incomeMinor).toBe(0);
    expect(overview.month.netMinor).toBe(-85000);
    expect(overview.month.days[28]?.balanceMinor).toBe(15000);
    expect(overview.projections).toEqual([{ minor: 255000, currency: 'EUR' }]);
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

describe('nombre del perfil', () => {
  it('guarda el nombre recortado y lo conserva al leer los ajustes', async () => {
    const repositories = memoryRepositories();
    const updated = await updateProfileName(repositories, '  Ana Ruiz  ');
    expect(updated.displayName).toBe('Ana Ruiz');
    expect((await repositories.settings.get()).displayName).toBe('Ana Ruiz');
  });

  it('rechaza un nombre vacío sin alterar el guardado', async () => {
    const repositories = memoryRepositories();
    await updateProfileName(repositories, 'Ana');
    await expect(updateProfileName(repositories, '   ')).rejects.toThrow(ValidationError);
    expect((await repositories.settings.get()).displayName).toBe('Ana');
  });

  it('rechaza un nombre demasiado largo', async () => {
    const repositories = memoryRepositories();
    await expect(updateProfileName(repositories, 'A'.repeat(41))).rejects.toThrow(/40 caracteres/);
    expect((await repositories.settings.get()).displayName).toBeUndefined();
  });

  it('guarda la divisa principal y el día de ingreso', async () => {
    const repositories = memoryRepositories();
    const updated = await updateProfilePreferences(repositories, {
      primaryCurrency: 'usd',
      primaryIncomeDay: 25,
    });
    expect(updated.primaryCurrency).toBe('USD');
    expect(updated.primaryIncomeDay).toBe(25);

    const cleared = await updateProfilePreferences(repositories, { primaryIncomeDay: null });
    expect(cleared.primaryIncomeDay).toBeNull();
  });

  it('rechaza una divisa o un día de ingreso inválidos', async () => {
    const repositories = memoryRepositories();
    await expect(
      updateProfilePreferences(repositories, { primaryCurrency: 'euros' }),
    ).rejects.toThrow(ValidationError);
    await expect(
      updateProfilePreferences(repositories, { primaryIncomeDay: 32 }),
    ).rejects.toThrow(/entre 1 y 31/);
    const settings = await repositories.settings.get();
    expect(settings.primaryCurrency).toBeUndefined();
    expect(settings.primaryIncomeDay).toBeUndefined();
  });
});
