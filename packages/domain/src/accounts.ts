import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { add, money, subtract, zero, type Money } from './money.js';
import type { Account, InstallmentPlan, Movement, Recurrence } from './types.js';
import { nextInstallment } from './recurrence.js';

export function movementsForAccount(movements: Movement[], accountId: string): Movement[] {
  return movements.filter((movement) => movement.accountId === accountId);
}

export function calculateAccountBalance(
  account: Account,
  movements: Movement[],
  upTo?: string,
): Money {
  const relevant = movements.filter(
    (movement) => movement.accountId === account.id && (!upTo || movement.date <= upTo),
  );
  let total = money(account.initialBalanceMinor, account.currency);
  for (const movement of relevant) {
    const amount = money(movement.amountMinor, account.currency);
    total = movement.type === 'income' ? add(total, amount) : subtract(total, amount);
  }
  return total;
}

export function aggregateBalances(accounts: Account[], movements: Movement[]): Money[] {
  const totals = new Map<string, Money>();
  for (const account of accounts) {
    if (account.archivedAt || !account.includeInTotal) continue;
    const balance = calculateAccountBalance(account, movements);
    const current = totals.get(account.currency) ?? zero(account.currency);
    totals.set(account.currency, add(current, balance));
  }
  return [...totals.values()].sort((a, b) => b.minor - a.minor);
}

export function monthExpenses(movements: Movement[], date: Date): Money[] {
  const start = format(startOfMonth(date), 'yyyy-MM-dd');
  const end = format(endOfMonth(date), 'yyyy-MM-dd');
  const totals = new Map<string, Money>();
  for (const movement of movements) {
    if (movement.type !== 'expense') continue;
    if (movement.date < start || movement.date > end) continue;
    const current = totals.get(movement.currency) ?? zero(movement.currency);
    totals.set(movement.currency, add(current, money(movement.amountMinor, movement.currency)));
  }
  return [...totals.values()];
}

export function monthOverMonthExpenses(
  movements: Movement[],
  date: Date,
  currency: string,
): { current: number; previous: number; changePct: number | null } {
  const sum = (d: Date) =>
    monthExpenses(movements, d)
      .filter((entry) => entry.currency === currency)
      .reduce((total, entry) => total + entry.minor, 0);
  const current = sum(date);
  const previous = sum(subMonths(date, 1));
  const changePct = previous === 0 ? null : Math.round(((current - previous) / previous) * 100);
  return { current, previous, changePct };
}

export function projectMonthEnd(
  account: Account,
  movements: Movement[],
  recurrences: Recurrence[],
  plans: InstallmentPlan[],
  today = new Date(),
): Money {
  let projected = calculateAccountBalance(account, movements);
  const start = startOfDay(today);
  const end = endOfMonth(today);

  for (const recurrence of recurrences) {
    if (recurrence.accountId !== account.id) continue;
    const next = parseISO(recurrence.nextDate);
    if (!isWithinInterval(next, { start, end })) continue;
    const amount = money(recurrence.amountMinor, account.currency);
    projected =
      recurrence.type === 'income' ? add(projected, amount) : subtract(projected, amount);
  }

  for (const plan of plans) {
    if (plan.accountId !== account.id) continue;
    const next = nextInstallment(plan);
    if (!next) continue;
    const due = parseISO(next.dueDate);
    if (!isWithinInterval(due, { start, end })) continue;
    projected = subtract(projected, money(next.amountMinor, account.currency));
  }

  if (account.type === 'deposit' && account.taeBps) {
    const interest = Math.round((projected.minor * account.taeBps) / 10000 / 12);
    projected = add(projected, money(interest, account.currency));
  }

  return projected;
}

export type UpcomingPayment = {
  id: string;
  label: string;
  amountMinor: number;
  currency: string;
  date: string;
  accountId: string;
  kind: 'recurrence' | 'installment';
  overdue: boolean;
};

export function upcomingPayments(
  recurrences: Recurrence[],
  plans: InstallmentPlan[],
  accounts: Account[],
  today = new Date(),
  days = 14,
): UpcomingPayment[] {
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  const entries: UpcomingPayment[] = [];

  for (const recurrence of recurrences) {
    if (recurrence.type !== 'expense') continue;
    const date = parseISO(recurrence.nextDate);
    if (date < startOfDay(today) || date > limit) continue;
    const account = accounts.find((candidate) => candidate.id === recurrence.accountId);
    if (!account) continue;
    entries.push({
      id: recurrence.id,
      label: recurrence.concept,
      amountMinor: recurrence.amountMinor,
      currency: recurrence.currency,
      date: recurrence.nextDate,
      accountId: recurrence.accountId,
      kind: 'recurrence',
      overdue: false,
    });
  }

  for (const plan of plans) {
    const next = nextInstallment(plan);
    if (!next) continue;
    const date = parseISO(next.dueDate);
    if (date > limit) continue;
    entries.push({
      id: plan.id,
      label: `${plan.concept} · cuota`,
      amountMinor: next.amountMinor,
      currency: plan.currency,
      date: next.dueDate,
      accountId: plan.accountId,
      kind: 'installment',
      overdue: date < startOfDay(today),
    });
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export function accountMonthlyEvolution(movements: Movement[], accountId: string, days = 7): number[] {
  const result: number[] = [];
  const today = startOfDay(new Date());
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    const key = format(date, 'yyyy-MM-dd');
    const total = movements
      .filter(
        (movement) =>
          movement.accountId === accountId &&
          movement.date === key &&
          movement.type === 'expense',
      )
      .reduce((sum, movement) => sum + movement.amountMinor, 0);
    result.push(total);
  }
  return result;
}

export function dailyTotals(
  movements: Movement[],
  currency: string,
  days = 7,
  today = new Date(),
): Array<{ date: string; totalMinor: number }> {
  const base = startOfDay(today);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(base);
    date.setDate(date.getDate() - (days - 1 - index));
    const key = format(date, 'yyyy-MM-dd');
    const totalMinor = movements
      .filter(
        (movement) =>
          movement.type === 'expense' && movement.currency === currency && movement.date === key,
      )
      .reduce((sum, movement) => sum + movement.amountMinor, 0);
    return { date: key, totalMinor };
  });
}

export function weeklyTotals(
  movements: Movement[],
  currency: string,
  weeks = 7,
  today = new Date(),
): Array<{ start: string; end: string; totalMinor: number }> {
  const currentWeek = startOfWeek(today, { weekStartsOn: 1 });
  return Array.from({ length: weeks }, (_, index) => {
    const start = subWeeks(currentWeek, weeks - 1 - index);
    const end = endOfWeek(start, { weekStartsOn: 1 });
    const startKey = format(start, 'yyyy-MM-dd');
    const endKey = format(end, 'yyyy-MM-dd');
    const totalMinor = movements
      .filter(
        (movement) =>
          movement.type === 'expense' &&
          movement.currency === currency &&
          movement.date >= startKey &&
          movement.date <= endKey,
      )
      .reduce((sum, movement) => sum + movement.amountMinor, 0);
    return { start: startKey, end: endKey, totalMinor };
  });
}

export function monthlyTotals(movements: Movement[], months: number, today = new Date()) {
  return Array.from({ length: months }, (_, index) => {
    const date = subMonths(today, months - 1 - index);
    const total = monthExpenses(movements, date).reduce((sum, entry) => sum + entry.minor, 0);
    return { month: format(date, 'yyyy-MM'), totalMinor: total };
  });
}

export { addMonths };
