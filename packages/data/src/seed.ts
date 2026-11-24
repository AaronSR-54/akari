import {
  addDays,
  addMonths,
  format,
  setDate,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import type { Account, Group, GroupExpense, InstallmentPlan, Movement, Recurrence, Transfer } from '@akari/domain';
import type { AkariRepositories } from './repositories.js';

const iso = (date: Date) => format(date, 'yyyy-MM-dd');
const isoAt = (date: Date) => date.toISOString();

function dayInMonth(today: Date, day: number) {
  return setDate(startOfMonth(today), day);
}

export function demoAccounts(today = new Date()): Account[] {
  const createdAt = isoAt(subMonths(today, 6));
  return [
    {
      id: 'demo-acc-day',
      name: 'Cuenta diaria',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 120000,
      includeInTotal: true,
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'demo-acc-joint',
      name: 'Cuenta conjunta',
      type: 'joint',
      currency: 'EUR',
      initialBalanceMinor: 80000,
      includeInTotal: true,
      members: [
        { id: 'demo-mem-ana', name: 'Ana', role: 'admin' },
        { id: 'demo-mem-luis', name: 'Luis', role: 'editor' },
      ],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'demo-acc-deposit',
      name: 'Depósito a plazo',
      type: 'deposit',
      currency: 'EUR',
      initialBalanceMinor: 1000000,
      taeBps: 250,
      includeInTotal: true,
      createdAt,
      updatedAt: createdAt,
    },
  ];
}

export function demoMovements(today = new Date()): Movement[] {
  const current = (day: number) => iso(dayInMonth(today, day));
  const previous = (day: number) => iso(dayInMonth(subMonths(today, 1), day));
  const base = isoAt(today);

  return [
    {
      id: 'demo-mov-salary',
      accountId: 'demo-acc-day',
      type: 'income',
      amountMinor: 240000,
      currency: 'EUR',
      date: current(1),
      concept: 'Nómina',
      category: 'Ingresos',
      createdAt: base,
    },
    {
      id: 'demo-mov-rent',
      accountId: 'demo-acc-day',
      type: 'expense',
      amountMinor: 85000,
      currency: 'EUR',
      date: current(2),
      concept: 'Alquiler',
      category: 'Vivienda',
      createdAt: base,
    },
    {
      id: 'demo-mov-groceries',
      accountId: 'demo-acc-day',
      type: 'expense',
      amountMinor: 12000,
      currency: 'EUR',
      date: iso(subDays(today, 6)),
      concept: 'Compra semanal',
      category: 'Alimentación',
      createdAt: base,
    },
    {
      id: 'demo-mov-dinner',
      accountId: 'demo-acc-day',
      type: 'expense',
      amountMinor: 4500,
      currency: 'EUR',
      date: iso(subDays(today, 3)),
      concept: 'Cena con amigos',
      category: 'Ocio',
      createdAt: base,
    },
    {
      id: 'demo-mov-shopping',
      accountId: 'demo-acc-day',
      type: 'expense',
      amountMinor: 6000,
      currency: 'EUR',
      date: iso(subDays(today, 2)),
      concept: 'Zapatillas',
      category: 'Compras',
      createdAt: base,
    },
    {
      id: 'demo-mov-streaming',
      accountId: 'demo-acc-day',
      type: 'expense',
      amountMinor: 1299,
      currency: 'EUR',
      date: iso(subDays(today, 1)),
      concept: 'Suscripción vídeo',
      category: 'Suscripciones',
      createdAt: base,
    },
    {
      id: 'demo-mov-prev-rent',
      accountId: 'demo-acc-day',
      type: 'expense',
      amountMinor: 85000,
      currency: 'EUR',
      date: previous(2),
      concept: 'Alquiler',
      category: 'Vivienda',
      createdAt: base,
    },
    {
      id: 'demo-mov-prev-groceries',
      accountId: 'demo-acc-day',
      type: 'expense',
      amountMinor: 15000,
      currency: 'EUR',
      date: previous(8),
      concept: 'Compra semanal',
      category: 'Alimentación',
      createdAt: base,
    },
    {
      id: 'demo-mov-prev-dinner',
      accountId: 'demo-acc-day',
      type: 'expense',
      amountMinor: 3000,
      currency: 'EUR',
      date: previous(12),
      concept: 'Cena',
      category: 'Ocio',
      createdAt: base,
    },
    {
      id: 'demo-mov-joint-groceries',
      accountId: 'demo-acc-joint',
      type: 'expense',
      amountMinor: 6000,
      currency: 'EUR',
      date: iso(subDays(today, 4)),
      concept: 'Compra del piso',
      category: 'Alimentación',
      createdAt: base,
    },
    {
      id: 'demo-mov-joint-contribution',
      accountId: 'demo-acc-joint',
      type: 'income',
      amountMinor: 50000,
      currency: 'EUR',
      date: current(1),
      concept: 'Aportación mensual',
      category: 'Ingresos',
      createdAt: base,
    },
  ];
}

export function demoRecurrences(today = new Date()): Recurrence[] {
  const createdAt = isoAt(subMonths(today, 3));
  return [
    {
      id: 'demo-rec-netflix',
      accountId: 'demo-acc-day',
      type: 'expense',
      amountMinor: 1299,
      currency: 'EUR',
      concept: 'Suscripción vídeo',
      category: 'Suscripciones',
      frequency: 'monthly',
      nextDate: iso(addDays(today, 5)),
      createdAt,
    },
    {
      id: 'demo-rec-rent',
      accountId: 'demo-acc-day',
      type: 'expense',
      amountMinor: 85000,
      currency: 'EUR',
      concept: 'Alquiler',
      category: 'Vivienda',
      frequency: 'monthly',
      nextDate: iso(dayInMonth(addMonths(today, 1), 2)),
      createdAt,
    },
    {
      id: 'demo-rec-salary',
      accountId: 'demo-acc-day',
      type: 'income',
      amountMinor: 240000,
      currency: 'EUR',
      concept: 'Nómina',
      category: 'Ingresos',
      frequency: 'monthly',
      nextDate: iso(dayInMonth(addMonths(today, 1), 1)),
      createdAt,
    },
  ];
}

export function demoInstallments(today = new Date()): InstallmentPlan[] {
  return [
    {
      id: 'demo-plan-laptop',
      accountId: 'demo-acc-day',
      concept: 'Portátil',
      totalMinor: 90000,
      currency: 'EUR',
      installments: 6,
      paidInstallments: 2,
      firstDueDate: iso(subMonths(today, 3)),
      frequency: 'monthly',
      createdAt: isoAt(subMonths(today, 4)),
    },
  ];
}

export function demoGroups(today = new Date()): Group[] {
  const createdAt = isoAt(subMonths(today, 2));
  return [
    {
      id: 'demo-grp-flat',
      name: 'Piso compartido',
      currency: 'EUR',
      members: [
        { id: 'demo-mem-ana', name: 'Ana', role: 'admin' },
        { id: 'demo-mem-luis', name: 'Luis', role: 'editor' },
        { id: 'demo-mem-marta', name: 'Marta', role: 'editor' },
      ],
      settlementAccountId: 'demo-acc-joint',
      createdAt,
      updatedAt: createdAt,
    },
  ];
}

export function demoGroupExpenses(today = new Date()): GroupExpense[] {
  const createdAt = isoAt(today);
  return [
    {
      id: 'demo-gexp-dinner',
      groupId: 'demo-grp-flat',
      payerMemberId: 'demo-mem-ana',
      amountMinor: 9000,
      currency: 'EUR',
      splitMode: 'equal',
      shares: [
        { memberId: 'demo-mem-ana', amountMinor: 3000 },
        { memberId: 'demo-mem-luis', amountMinor: 3000 },
        { memberId: 'demo-mem-marta', amountMinor: 3000 },
      ],
      date: iso(subDays(today, 5)),
      concept: 'Cena del piso',
      category: 'Ocio',
      createdAt,
    },
    {
      id: 'demo-gexp-market',
      groupId: 'demo-grp-flat',
      payerMemberId: 'demo-mem-luis',
      amountMinor: 6000,
      currency: 'EUR',
      splitMode: 'equal',
      shares: [
        { memberId: 'demo-mem-ana', amountMinor: 2000 },
        { memberId: 'demo-mem-luis', amountMinor: 2000 },
        { memberId: 'demo-mem-marta', amountMinor: 2000 },
      ],
      date: iso(subDays(today, 3)),
      concept: 'Supermercado',
      category: 'Alimentación',
      createdAt,
    },
  ];
}

export function demoTransfers(today = new Date()): Transfer[] {
  return [
    {
      id: 'demo-trf-settled',
      groupId: 'demo-grp-flat',
      fromMemberId: 'demo-mem-luis',
      toMemberId: 'demo-mem-ana',
      amountMinor: 1000,
      currency: 'EUR',
      status: 'settled',
      settledAt: isoAt(subDays(today, 1)),
      createdAt: isoAt(subDays(today, 2)),
    },
  ];
}

export async function seedDemoData(
  repositories: AkariRepositories,
  today = new Date(),
): Promise<void> {
  const accounts = demoAccounts(today);
  const movements = demoMovements(today);
  const recurrences = demoRecurrences(today);
  const installments = demoInstallments(today);
  const groups = demoGroups(today);
  const expenses = demoGroupExpenses(today);
  const transfers = demoTransfers(today);

  await Promise.all([
    ...accounts.map((account) => repositories.accounts.put(account)),
    ...movements.map((movement) => repositories.movements.put(movement)),
    ...recurrences.map((recurrence) => repositories.recurrences.put(recurrence)),
    ...installments.map((plan) => repositories.installments.put(plan)),
    ...groups.map((group) => repositories.groups.put(group)),
    ...expenses.map((expense) => repositories.groupExpenses.put(expense)),
    ...transfers.map((transfer) => repositories.transfers.put(transfer)),
  ]);
}

export function demoDateToday(today = new Date()): string {
  return format(startOfDay(today), 'yyyy-MM-dd');
}
