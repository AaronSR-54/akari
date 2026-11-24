import {
  addMonths,
  addWeeks,
  addYears,
  format,
  isAfter,
  parseISO,
  startOfDay,
} from 'date-fns';
import type { Frequency, InstallmentPlan, Recurrence } from './types.js';

export function addFrequency(date: string, frequency: Frequency): string {
  const parsed = parseISO(date);
  const next =
    frequency === 'weekly'
      ? addWeeks(parsed, 1)
      : frequency === 'yearly'
        ? addYears(parsed, 1)
        : addMonths(parsed, 1);
  return format(next, 'yyyy-MM-dd');
}

export function nextOccurrenceAfter(date: string, frequency: Frequency, after: Date): string {
  let candidate = date;
  let guard = 0;
  while (!isAfter(parseISO(candidate), after) && guard < 500) {
    candidate = addFrequency(candidate, frequency);
    guard += 1;
  }
  return candidate;
}

export function recurrenceAppliesOn(recurrence: Recurrence, date: Date): boolean {
  const next = parseISO(recurrence.nextDate);
  if (isAfter(next, date)) return false;
  if (recurrence.endDate && format(date, 'yyyy-MM-dd') > recurrence.endDate) return false;
  return true;
}

export function upcomingRecurrences(
  recurrences: Recurrence[],
  from: Date,
  until: Date,
): Recurrence[] {
  return recurrences.filter((recurrence) => {
    const next = parseISO(recurrence.nextDate);
    return next >= startOfDay(from) && next <= until;
  });
}

export function installmentAmounts(plan: InstallmentPlan): number[] {
  const count = Math.max(1, plan.installments);
  const base = Math.floor(plan.totalMinor / count);
  let remainder = plan.totalMinor - base * count;
  return Array.from({ length: count }, () => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return base + extra;
  });
}

export function installmentDueDate(plan: InstallmentPlan, index: number): string {
  const first = parseISO(plan.firstDueDate);
  const date =
    plan.frequency === 'weekly'
      ? addWeeks(first, index)
      : plan.frequency === 'yearly'
        ? addYears(first, index)
        : addMonths(first, index);
  return format(date, 'yyyy-MM-dd');
}

export function nextInstallment(
  plan: InstallmentPlan,
): { dueDate: string; amountMinor: number; number: number } | null {
  if (plan.paidInstallments >= plan.installments) return null;
  const amounts = installmentAmounts(plan);
  const amountMinor = amounts[plan.paidInstallments] ?? 0;
  return {
    dueDate: installmentDueDate(plan, plan.paidInstallments),
    amountMinor,
    number: plan.paidInstallments + 1,
  };
}

export function installmentStatus(
  plan: InstallmentPlan,
  today = new Date(),
): 'on-track' | 'overdue' | 'completed' {
  if (plan.paidInstallments >= plan.installments) return 'completed';
  const next = nextInstallment(plan);
  if (!next) return 'completed';
  return parseISO(next.dueDate) < startOfDay(today) ? 'overdue' : 'on-track';
}

export function installmentProgress(plan: InstallmentPlan) {
  const amounts = installmentAmounts(plan);
  const paidAmount = amounts.slice(0, plan.paidInstallments).reduce((sum, value) => sum + value, 0);
  const remainingAmount = plan.totalMinor - paidAmount;
  return {
    paid: plan.paidInstallments,
    total: plan.installments,
    paidAmountMinor: paidAmount,
    remainingAmountMinor: remainingAmount,
    percent:
      plan.installments === 0 ? 0 : Math.round((plan.paidInstallments / plan.installments) * 100),
    label: `${plan.paidInstallments} de ${plan.installments}`,
  };
}

export function installmentsOverdue(plan: InstallmentPlan, today = new Date()): number {
  if (plan.paidInstallments >= plan.installments) return 0;
  let count = 0;
  for (let index = 0; index < plan.installments; index += 1) {
    if (parseISO(installmentDueDate(plan, index)) < startOfDay(today)) count += 1;
  }
  return Math.max(0, count - plan.paidInstallments);
}
