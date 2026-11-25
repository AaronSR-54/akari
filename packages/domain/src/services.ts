import {
  endOfMonth,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  aggregateBalances,
  calculateAccountBalance,
  currentMonthMovements,
  dailyTotals,
  monthExpenseEstimate,
  projectMonthEnd,
  upcomingPayments,
} from './accounts.js';
import { isBankId, normalizeBankId } from './banks.js';
import { NotFoundError, ValidationError } from './errors.js';
import { addFrequency, nextInstallment } from './recurrence.js';
import {
  computeSettlement,
  convertMinor,
  memberName,
  splitByFixed,
  splitByPercentage,
  splitEqual,
  totalPendingForGroup,
} from './group.js';
import type { Repositories } from './ports.js';
import type {
  Account,
  AccountInput,
  Frequency,
  Group,
  GroupExpense,
  GroupExpenseInput,
  Member,
  MemberRole,
  Movement,
  MovementInput,
  Settings,
  Transfer,
} from './types.js';

export function createId(prefix = 'id'): string {
  const cryptoObject = globalThis.crypto;
  if (cryptoObject && typeof cryptoObject.randomUUID === 'function') {
    return `${prefix}_${cryptoObject.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function updateProfileName(
  repositories: Repositories,
  value: string,
): Promise<Settings> {
  const displayName = value.trim();
  if (!displayName) {
    throw new ValidationError('El nombre del perfil es obligatorio', 'displayName');
  }
  if (displayName.length > 40) {
    throw new ValidationError('El nombre del perfil no puede superar 40 caracteres', 'displayName');
  }
  return repositories.settings.update({ displayName });
}

function validateDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parseISO(value).getTime())) {
    throw new ValidationError('La fecha no es válida', 'date');
  }
}

function validateCurrency(currency: string): void {
  if (!/^[A-Z]{3}$/.test(currency.toUpperCase())) {
    throw new ValidationError('La divisa debe ser un código ISO de tres letras', 'currency');
  }
}

function validateAccountInput(input: AccountInput): void {
  if (!input.name.trim()) throw new ValidationError('El nombre de la cuenta es obligatorio', 'name');
  validateCurrency(input.currency);
  if (!Number.isInteger(input.initialBalanceMinor) || input.initialBalanceMinor <= 0) {
    throw new ValidationError('El saldo inicial debe ser mayor que cero', 'initialBalanceMinor');
  }
  if (input.taeBps != null && (input.taeBps < 0 || input.taeBps > 10000)) {
    throw new ValidationError('La TAE debe estar entre 0 y 100 %', 'taeBps');
  }
  if (input.bankId != null && !isBankId(input.bankId)) {
    throw new ValidationError('El banco seleccionado no está en el catálogo', 'bankId');
  }
}

export async function createAccount(
  repositories: Repositories,
  input: AccountInput,
): Promise<Account> {
  validateAccountInput(input);
  const timestamp = nowIso();
  const account: Account = {
    id: createId('acc'),
    name: input.name.trim(),
    type: input.type,
    currency: input.currency.toUpperCase(),
    initialBalanceMinor: input.initialBalanceMinor,
    taeBps: input.type === 'deposit' ? (input.taeBps ?? null) : null,
    bankId: input.bankId ?? null,
    includeInTotal: input.includeInTotal ?? true,
    members: input.members,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await repositories.accounts.put(account);
  return account;
}

export async function updateAccount(
  repositories: Repositories,
  accountId: string,
  input: Partial<AccountInput>,
): Promise<Account> {
  const existing = await repositories.accounts.get(accountId);
  if (!existing) throw new NotFoundError('La cuenta no existe');
  const merged: AccountInput = {
    name: input.name ?? existing.name,
    type: input.type ?? existing.type,
    currency: input.currency ?? existing.currency,
    initialBalanceMinor: input.initialBalanceMinor ?? existing.initialBalanceMinor,
    taeBps: input.taeBps !== undefined ? input.taeBps : existing.taeBps,
    bankId:
      input.bankId !== undefined
        ? input.bankId
        : existing.bankId
          ? normalizeBankId(existing.bankId)
          : null,
    includeInTotal: input.includeInTotal ?? existing.includeInTotal,
    members: input.members ?? existing.members,
  };
  validateAccountInput(merged);
  const account: Account = {
    ...existing,
    ...merged,
    name: merged.name.trim(),
    currency: merged.currency.toUpperCase(),
    taeBps: merged.type === 'deposit' ? (merged.taeBps ?? null) : null,
    updatedAt: nowIso(),
  };
  await repositories.accounts.put(account);
  return account;
}

export async function deleteAccount(
  repositories: Repositories,
  accountId: string,
): Promise<void> {
  const account = await repositories.accounts.get(accountId);
  if (!account) throw new NotFoundError('La cuenta no existe');
  const movements = await repositories.movements.listByAccount(accountId);
  if (movements.length > 0) {
    throw new ValidationError(
      'Esta cuenta tiene movimientos. Elimínalos o archívala antes de borrarla.',
    );
  }
  await repositories.accounts.delete(accountId);
}

export async function recordMovement(
  repositories: Repositories,
  input: MovementInput,
): Promise<Movement> {
  const work = async (): Promise<Movement> => {
    const account = await repositories.accounts.get(input.accountId);
    if (!account) throw new ValidationError('La cuenta seleccionada no existe', 'accountId');
    if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
      throw new ValidationError('El importe debe ser mayor que cero', 'amountMinor');
    }
    if (!input.concept.trim()) throw new ValidationError('El concepto es obligatorio', 'concept');
    validateDate(input.date);
    if (input.memberId && !account.members?.some((member) => member.id === input.memberId)) {
      throw new ValidationError('El miembro no pertenece a la cuenta', 'memberId');
    }

    let recurrenceId: string | undefined;
    if (input.repeat) {
      const recurrence = {
        id: createId('rec'),
        accountId: account.id,
        type: input.type,
        amountMinor: input.amountMinor,
        currency: account.currency,
        concept: input.concept.trim(),
        category: input.category,
        frequency: input.repeat.frequency,
        nextDate: addFrequency(input.date, input.repeat.frequency),
        endDate: input.repeat.endDate ?? null,
        createdAt: nowIso(),
      };
      await repositories.recurrences.put(recurrence);
      recurrenceId = recurrence.id;
    }

    const movement: Movement = {
      id: createId('mov'),
      accountId: account.id,
      type: input.type,
      amountMinor: input.amountMinor,
      currency: account.currency,
      date: input.date,
      concept: input.concept.trim(),
      category: input.category,
      note: input.note,
      memberId: input.memberId ?? null,
      recurrenceId,
      createdAt: nowIso(),
    };
    await repositories.movements.put(movement);
    return movement;
  };

  return repositories.transaction ? repositories.transaction(work) : work();
}

export async function updateMovement(
  repositories: Repositories,
  movementId: string,
  input: Partial<MovementInput>,
): Promise<Movement> {
  const existing = await repositories.movements.get(movementId);
  if (!existing) throw new NotFoundError('El movimiento no existe');
  const accountId = input.accountId ?? existing.accountId;
  const account = await repositories.accounts.get(accountId);
  if (!account) throw new ValidationError('La cuenta seleccionada no existe', 'accountId');
  const amount = input.amountMinor ?? existing.amountMinor;
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ValidationError('El importe debe ser mayor que cero', 'amountMinor');
  }
  const date = input.date ?? existing.date;
  validateDate(date);
  const concept = (input.concept ?? existing.concept).trim();
  if (!concept) throw new ValidationError('El concepto es obligatorio', 'concept');
  const memberId = input.memberId !== undefined ? input.memberId : existing.memberId;
  if (memberId && !account.members?.some((member) => member.id === memberId)) {
    throw new ValidationError('El miembro no pertenece a la cuenta', 'memberId');
  }

  const movement: Movement = {
    ...existing,
    accountId,
    type: input.type ?? existing.type,
    amountMinor: amount,
    currency: account.currency,
    date,
    concept,
    category: input.category ?? existing.category,
    note: input.note ?? existing.note,
    memberId: memberId ?? null,
  };
  await repositories.movements.put(movement);
  return movement;
}

export async function deleteMovement(
  repositories: Repositories,
  movementId: string,
): Promise<void> {
  await repositories.movements.delete(movementId);
}

export async function registerInstallment(
  repositories: Repositories,
  planId: string,
): Promise<Movement> {
  const work = async (): Promise<Movement> => {
    const plan = await repositories.installments.get(planId);
    if (!plan) throw new NotFoundError('El plan de plazos no existe');
    const next = nextInstallment(plan);
    if (!next) throw new ValidationError('El plan de plazos ya está completado');
    const movement: Movement = {
      id: createId('mov'),
      accountId: plan.accountId,
      type: 'expense',
      amountMinor: next.amountMinor,
      currency: plan.currency,
      date: next.dueDate,
      concept: `${plan.concept} · cuota ${next.number}/${plan.installments}`,
      category: 'Plazos',
      installmentPlanId: plan.id,
      createdAt: nowIso(),
    };
    await repositories.movements.put(movement);
    await repositories.installments.put({
      ...plan,
      paidInstallments: plan.paidInstallments + 1,
    });
    return movement;
  };
  return repositories.transaction ? repositories.transaction(work) : work();
}

export async function payRecurrence(
  repositories: Repositories,
  recurrenceId: string,
  input: { date: string; memberId?: string | null; currentMemberName?: string },
): Promise<Movement> {
  const work = async (): Promise<Movement> => {
    const recurrence = await repositories.recurrences.get(recurrenceId);
    if (!recurrence) throw new NotFoundError('La recurrencia no existe');
    const account = await repositories.accounts.get(recurrence.accountId);
    if (!account) throw new ValidationError('La cuenta de la recurrencia no existe', 'accountId');
    validateDate(input.date);
    const memberId =
      input.memberId ??
      account.members?.find((member) => member.name === input.currentMemberName)?.id ??
      null;
    if (memberId && !account.members?.some((member) => member.id === memberId)) {
      throw new ValidationError('El miembro no pertenece a la cuenta', 'memberId');
    }
    const movement: Movement = {
      id: createId('mov'),
      accountId: account.id,
      type: recurrence.type,
      amountMinor: recurrence.amountMinor,
      currency: recurrence.currency,
      date: input.date,
      concept: recurrence.concept,
      category: recurrence.category,
      memberId,
      recurrenceId: recurrence.id,
      createdAt: nowIso(),
    };
    await repositories.movements.put(movement);
    const nextDate = addFrequency(recurrence.nextDate, recurrence.frequency);
    if (recurrence.endDate && nextDate > recurrence.endDate) {
      await repositories.recurrences.delete(recurrence.id);
    } else {
      await repositories.recurrences.put({ ...recurrence, nextDate });
    }
    return movement;
  };
  return repositories.transaction ? repositories.transaction(work) : work();
}

export async function createGroup(
  repositories: Repositories,
  input: {
    name: string;
    currency: string;
    members: Array<Pick<Member, 'name'> & { id?: string; role?: MemberRole }>;
    settlementAccountId?: string | null;
  },
): Promise<Group> {
  if (!input.name.trim()) throw new ValidationError('El nombre del grupo es obligatorio', 'name');
  validateCurrency(input.currency);
  const members: Member[] = input.members
    .filter((member) => member.name.trim())
    .map((member) => ({
      id: member.id ?? createId('mem'),
      name: member.name.trim(),
      role: member.role ?? 'editor',
    }));
  if (members.length < 2) {
    throw new ValidationError('Un grupo necesita al menos dos miembros', 'members');
  }
  if (!members.some((member) => member.role === 'admin')) {
    members[0]!.role = 'admin';
  }
  const timestamp = nowIso();
  const group: Group = {
    id: createId('grp'),
    name: input.name.trim(),
    currency: input.currency.toUpperCase(),
    members,
    settlementAccountId: input.settlementAccountId ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await repositories.groups.put(group);
  return group;
}

export async function updateGroupRole(
  repositories: Repositories,
  groupId: string,
  memberId: string,
  role: MemberRole,
  actorId?: string,
): Promise<Group> {
  const group = await repositories.groups.get(groupId);
  if (!group) throw new NotFoundError('El grupo no existe');
  const actors = actorId
    ? [group.members.find((member) => member.id === actorId)]
    : group.members.filter((member) => member.role === 'admin').slice(0, 1);
  if (!actors.some((actor) => actor?.role === 'admin')) {
    throw new ValidationError('Solo una persona administradora puede cambiar roles');
  }
  if (!group.members.some((member) => member.id === memberId)) {
    throw new NotFoundError('El miembro no existe');
  }
  if (
    role !== 'admin' &&
    group.members.filter((member) => member.role === 'admin').length === 1 &&
    group.members.find((member) => member.id === memberId)?.role === 'admin'
  ) {
    throw new ValidationError('El grupo necesita al menos una persona administradora');
  }
  const updated: Group = {
    ...group,
    members: group.members.map((member) => (member.id === memberId ? { ...member, role } : member)),
    updatedAt: nowIso(),
  };
  await repositories.groups.put(updated);
  return updated;
}

export async function updateGroup(
  repositories: Repositories,
  groupId: string,
  patch: { name?: string; currency?: string; settlementAccountId?: string | null },
): Promise<Group> {
  const group = await repositories.groups.get(groupId);
  if (!group) throw new NotFoundError('El grupo no existe');
  const name = patch.name?.trim() ?? group.name;
  if (!name) throw new ValidationError('El nombre del grupo es obligatorio', 'name');
  const currency = (patch.currency ?? group.currency).toUpperCase();
  validateCurrency(currency);
  if (patch.settlementAccountId) {
    const account = await repositories.accounts.get(patch.settlementAccountId);
    if (!account) throw new ValidationError('La cuenta de cobro no existe', 'settlementAccountId');
  }
  const updated: Group = {
    ...group,
    name,
    currency,
    settlementAccountId:
      patch.settlementAccountId !== undefined ? patch.settlementAccountId : group.settlementAccountId,
    updatedAt: nowIso(),
  };
  await repositories.groups.put(updated);
  return updated;
}

export async function addGroupExpense(
  repositories: Repositories,
  input: GroupExpenseInput,
): Promise<GroupExpense> {
  const group = await repositories.groups.get(input.groupId);
  if (!group) throw new NotFoundError('El grupo no existe');
  if (!group.members.some((member) => member.id === input.payerMemberId)) {
    throw new ValidationError('Quien paga debe pertenecer al grupo', 'payerMemberId');
  }
  if (input.shares.length === 0) {
    throw new ValidationError('El gasto necesita participantes');
  }
  if (input.shares.some((share) => !group.members.some((member) => member.id === share.memberId))) {
    throw new ValidationError('Todos los participantes deben pertenecer al grupo');
  }
  const shareTotal = input.shares.reduce((sum, share) => sum + share.amountMinor, 0);
  if (shareTotal !== input.amountMinor || input.amountMinor <= 0) {
    throw new ValidationError('El reparto no cuadra con el importe total');
  }
  if (input.accountId) {
    const account = await repositories.accounts.get(input.accountId);
    if (!account) throw new ValidationError('La cuenta de origen no existe', 'accountId');
  }
  if (input.originalCurrency && input.originalCurrency !== group.currency) {
    if (!input.exchangeRate || input.exchangeRate <= 0) {
      throw new ValidationError('Indica el tipo de cambio aplicado');
    }
  }

  const expense: GroupExpense = {
    id: createId('gexp'),
    groupId: input.groupId,
    payerMemberId: input.payerMemberId,
    amountMinor: input.amountMinor,
    currency: group.currency,
    originalAmountMinor: input.originalAmountMinor,
    originalCurrency: input.originalCurrency,
    exchangeRate: input.exchangeRate ?? null,
    accountId: input.accountId ?? null,
    splitMode: input.splitMode,
    shares: input.shares,
    date: input.date,
    concept: input.concept.trim(),
    category: input.category,
    createdAt: nowIso(),
  };
  if (!expense.concept) throw new ValidationError('El concepto es obligatorio', 'concept');
  await repositories.groupExpenses.put(expense);
  return expense;
}

export async function settleTransfer(
  repositories: Repositories,
  input: { groupId: string; fromMemberId: string; toMemberId: string; amountMinor: number },
): Promise<Transfer> {
  const group = await repositories.groups.get(input.groupId);
  if (!group) throw new NotFoundError('El grupo no existe');
  if (input.amountMinor <= 0) throw new ValidationError('La transferencia debe ser positiva');
  const transfer: Transfer = {
    id: createId('trf'),
    groupId: input.groupId,
    fromMemberId: input.fromMemberId,
    toMemberId: input.toMemberId,
    amountMinor: input.amountMinor,
    currency: group.currency,
    status: 'settled',
    settledAt: nowIso(),
    createdAt: nowIso(),
  };
  await repositories.transfers.put(transfer);
  return transfer;
}

export type GroupSummary = {
  group: Group;
  expenses: GroupExpense[];
  transfers: Transfer[];
  settlement: ReturnType<typeof computeSettlement>;
  pendingTotalMinor: number;
  memberNames: Record<string, string>;
  status: 'pending' | 'settled';
  settlementAccountName: string | null;
};

export async function getGroupSummary(
  repositories: Repositories,
  groupId: string,
): Promise<GroupSummary | null> {
  const group = await repositories.groups.get(groupId);
  if (!group) return null;
  const [expenses, transfers, accounts] = await Promise.all([
    repositories.groupExpenses.listByGroup(groupId),
    repositories.transfers.listByGroup(groupId),
    repositories.accounts.list(),
  ]);
  const settlement = computeSettlement(group, expenses, transfers);
  const pendingTotalMinor = totalPendingForGroup(group, expenses, transfers);
  const memberNames = Object.fromEntries(group.members.map((member) => [member.id, member.name]));
  const settlementAccountName =
    accounts.find((account) => account.id === group.settlementAccountId)?.name ?? null;
  return {
    group,
    expenses: expenses.sort((a, b) => b.date.localeCompare(a.date)),
    transfers,
    settlement,
    pendingTotalMinor,
    memberNames,
    status: pendingTotalMinor > 0 ? 'pending' : 'settled',
    settlementAccountName,
  };
}

export function buildGroupExpenseFromForm(input: {
  group: Group;
  payerMemberId: string;
  amountMinor: number;
  currency: string;
  exchangeRate?: number | null;
  splitMode: GroupExpense['splitMode'];
  memberIds: string[];
  percentages?: Record<string, number>;
  fixedAmounts?: Record<string, number>;
  date: string;
  concept: string;
  accountId?: string | null;
  category?: string;
}): GroupExpenseInput {
  const total =
    input.currency === input.group.currency
      ? input.amountMinor
      : convertMinor(input.amountMinor, input.exchangeRate ?? 0);

  let shares = splitEqual(total, input.memberIds);
  if (input.splitMode === 'percentage') {
    shares = splitByPercentage(
      total,
      input.memberIds.map((memberId) => ({
        memberId,
        percentage: input.percentages?.[memberId] ?? 0,
      })),
    );
  } else if (input.splitMode === 'fixed') {
    shares = splitByFixed(
      total,
      input.memberIds.map((memberId) => ({
        memberId,
        amountMinor: input.fixedAmounts?.[memberId] ?? 0,
      })),
    );
  }

  return {
    groupId: input.group.id,
    payerMemberId: input.payerMemberId,
    amountMinor: total,
    originalAmountMinor:
      input.currency === input.group.currency ? undefined : input.amountMinor,
    originalCurrency: input.currency === input.group.currency ? undefined : input.currency,
    exchangeRate: input.currency === input.group.currency ? null : (input.exchangeRate ?? null),
    accountId: input.accountId ?? null,
    splitMode: input.splitMode,
    shares,
    date: input.date,
    concept: input.concept,
    category: input.category,
  };
}

export type Overview = {
  accounts: Account[];
  totalBalances: ReturnType<typeof aggregateBalances>;
  projections: ReturnType<typeof aggregateBalances>;
  month: ReturnType<typeof currentMonthMovements> & {
    estimate: ReturnType<typeof monthExpenseEstimate>;
  };
  upcoming: ReturnType<typeof upcomingPayments>;
  recentMovements: Movement[];
  dailyExpenses: ReturnType<typeof dailyTotals>;
  balancesByAccount: Record<string, ReturnType<typeof calculateAccountBalance>>;
};

export async function getOverview(
  repositories: Repositories,
  today = new Date(),
): Promise<Overview> {
  const [accounts, movements, recurrences, installments] = await Promise.all([
    repositories.accounts.list(),
    repositories.movements.list(),
    repositories.recurrences.list(),
    repositories.installments.list(),
  ]);
  const activeAccounts = accounts.filter((account) => !account.archivedAt);
  const currency = activeAccounts[0]?.currency ?? 'EUR';
  const projections = activeAccounts
    .filter((account) => account.includeInTotal)
    .map((account) => projectMonthEnd(account, movements, recurrences, installments, today));
  const projectedTotals = new Map<string, { minor: number; currency: string }>();
  for (const projection of projections) {
    const current = projectedTotals.get(projection.currency) ?? {
      minor: 0,
      currency: projection.currency,
    };
    projectedTotals.set(projection.currency, {
      minor: current.minor + projection.minor,
      currency: projection.currency,
    });
  }

  const todayKey = format(today, 'yyyy-MM-dd');
  const totalBalances = aggregateBalances(activeAccounts, movements, todayKey);
  const balanceAccounts = activeAccounts.filter(
    (account) => account.includeInTotal && account.currency === currency,
  );
  const balanceAccountIds = new Set(balanceAccounts.map((account) => account.id));
  const balanceMovements = movements.filter((movement) =>
    balanceAccountIds.has(movement.accountId),
  );
  const previousMonthEnd = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd');
  const openingBalanceMinor = balanceAccounts.reduce(
    (sum, account) =>
      sum + calculateAccountBalance(account, movements, previousMonthEnd).minor,
    0,
  );

  return {
    accounts: activeAccounts,
    totalBalances,
    projections: [...projectedTotals.values()],
    month: {
      ...currentMonthMovements(balanceMovements, currency, today, openingBalanceMinor),
      estimate: monthExpenseEstimate(movements, currency, today),
    },
    upcoming: upcomingPayments(recurrences, installments, activeAccounts, today),
    recentMovements: movements
      .filter((movement) => activeAccounts.some((account) => account.id === movement.accountId))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4),
    dailyExpenses: dailyTotals(movements, currency, 7, today),
    balancesByAccount: Object.fromEntries(
      activeAccounts.map((account) => [
        account.id,
        calculateAccountBalance(account, movements, todayKey),
      ]),
    ),
  };
}

export type QuickAnswers = {
  currency: string;
  biggestExpense: {
    hasData: boolean;
    concept?: string;
    amountMinor?: number;
    category?: string;
    date?: string;
    period: string;
  };
  avoidable: {
    hasData: boolean;
    amountMinor: number;
    items: Array<{ concept: string; amountMinor: number; reason: string }>;
    period: string;
  };
  topCategory: {
    hasData: boolean;
    category?: string;
    amountMinor?: number;
    period: string;
  };
  weekExpense: { hasData: boolean; amountMinor: number; period: string };
  daily: ReturnType<typeof dailyTotals>;
  summary: {
    monthExpenseMinor: number;
    monthIncomeMinor: number;
    savingsMinor: number;
    savingsPercent: number | null;
  };
};

export async function getQuickAnswers(
  repositories: Repositories,
  today = new Date(),
): Promise<QuickAnswers> {
  const [accounts, movements, recurrences] = await Promise.all([
    repositories.accounts.list(),
    repositories.movements.list(),
    repositories.recurrences.list(),
  ]);
  const currency = accounts.find((account) => !account.archivedAt)?.currency ?? 'EUR';
  const monthStart = startOfMonth(today);
  const relevant = movements.filter(
    (movement) =>
      movement.currency === currency &&
      movement.type === 'expense' &&
      !isBefore(parseISO(movement.date), monthStart) &&
      !isAfter(parseISO(movement.date), today),
  );

  const biggest = [...relevant].sort((a, b) => b.amountMinor - a.amountMinor)[0];
  const byCategory = new Map<string, number>();
  for (const movement of relevant) {
    byCategory.set(movement.category, (byCategory.get(movement.category) ?? 0) + movement.amountMinor);
  }
  const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

  const avoidableItems: Array<{ concept: string; amountMinor: number; reason: string }> = [];
  for (const recurrence of recurrences) {
    if (recurrence.type !== 'expense' || recurrence.currency !== currency) continue;
    if (recurrence.category !== 'Suscripciones') continue;
    avoidableItems.push({
      concept: recurrence.concept,
      amountMinor: recurrence.amountMinor,
      reason: 'Suscripción activa',
    });
  }
  for (const movement of relevant) {
    if (movement.category !== 'Ocio' && movement.category !== 'Compras') continue;
    avoidableItems.push({
      concept: movement.concept,
      amountMinor: movement.amountMinor,
      reason: `Categoría ${movement.category}`,
    });
  }

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekExpense = movements
    .filter(
      (movement) =>
        movement.currency === currency &&
        movement.type === 'expense' &&
        !isBefore(parseISO(movement.date), weekStart) &&
        !isAfter(parseISO(movement.date), today),
    )
    .reduce((sum, movement) => sum + movement.amountMinor, 0);

  const monthIncome = movements
    .filter(
      (movement) =>
        movement.currency === currency &&
        movement.type === 'income' &&
        !isBefore(parseISO(movement.date), monthStart) &&
        !isAfter(parseISO(movement.date), today),
    )
    .reduce((sum, movement) => sum + movement.amountMinor, 0);
  const monthExpenseTotal = relevant.reduce((sum, movement) => sum + movement.amountMinor, 0);

  const period = format(monthStart, "LLLL 'de' yyyy", { locale: es });

  return {
    currency,
    biggestExpense: biggest
      ? {
          hasData: true,
          concept: biggest.concept,
          amountMinor: biggest.amountMinor,
          category: biggest.category,
          date: biggest.date,
          period,
        }
      : { hasData: false, period },
    avoidable: {
      hasData: avoidableItems.length > 0,
      amountMinor: avoidableItems.reduce((sum, item) => sum + item.amountMinor, 0),
      items: avoidableItems,
      period,
    },
    topCategory: topCategory
      ? { hasData: true, category: topCategory[0], amountMinor: topCategory[1], period }
      : { hasData: false, period },
    weekExpense: {
      hasData: weekExpense > 0,
      amountMinor: weekExpense,
      period: `Semana del ${format(weekStart, 'd MMM', { locale: es })}`,
    },
    daily: dailyTotals(movements, currency, 7, today),
    summary: {
      monthExpenseMinor: monthExpenseTotal,
      monthIncomeMinor: monthIncome,
      savingsMinor: monthIncome - monthExpenseTotal,
      savingsPercent:
        monthIncome === 0 ? null : Math.round(((monthIncome - monthExpenseTotal) / monthIncome) * 100),
    },
  };
}

export function frequencyLabel(frequency: Frequency): string {
  return frequency === 'weekly' ? 'Semanal' : frequency === 'yearly' ? 'Anual' : 'Mensual';
}

export function payableToLabel(
  group: Group,
  transfer: { fromMemberId: string; toMemberId: string; amountMinor: number },
  currency: string,
) {
  return `${memberName(group, transfer.fromMemberId)} paga a ${memberName(
    group,
    transfer.toMemberId,
  )} ${(transfer.amountMinor / 100).toFixed(2)} ${currency}`;
}
