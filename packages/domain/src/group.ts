import type { Group, GroupExpense, GroupShare, Member, Transfer } from './types.js';
import { ValidationError } from './errors.js';

export type PercentageShare = { memberId: string; percentage: number };

export function splitEqual(totalMinor: number, memberIds: string[]): GroupShare[] {
  if (memberIds.length === 0) throw new ValidationError('El gasto necesita al menos un participante');
  const base = Math.floor(totalMinor / memberIds.length);
  let remainder = totalMinor - base * memberIds.length;
  return memberIds.map((memberId) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return { memberId, amountMinor: base + extra };
  });
}

export function splitByPercentage(totalMinor: number, shares: PercentageShare[]): GroupShare[] {
  const totalPercentage = shares.reduce((sum, share) => sum + share.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.001) {
    throw new ValidationError('Los porcentajes deben sumar 100 %');
  }

  const raw = shares.map((share) => ({
    memberId: share.memberId,
    exact: (totalMinor * share.percentage) / 100,
  }));
  const result = raw.map((entry) => ({
    memberId: entry.memberId,
    amountMinor: Math.floor(entry.exact),
  }));
  let remainder =
    totalMinor - result.reduce((sum, entry) => sum + entry.amountMinor, 0);
  const order = raw
    .map((entry, index) => ({ index, fraction: entry.exact - Math.floor(entry.exact) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (const entry of order) {
    if (remainder <= 0) break;
    result[entry.index]!.amountMinor += 1;
    remainder -= 1;
  }
  return result;
}

export function splitByFixed(totalMinor: number, amounts: GroupShare[]): GroupShare[] {
  const sum = amounts.reduce((total, share) => total + share.amountMinor, 0);
  if (sum !== totalMinor) {
    throw new ValidationError(
      `Las cantidades suman ${sum} y el gasto es ${totalMinor}; revisa el reparto`,
    );
  }
  return amounts.map((share) => ({ ...share }));
}

export function convertMinor(amountMinor: number, rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new ValidationError('El tipo de cambio debe ser mayor que cero');
  }
  return Math.round(amountMinor * rate);
}

export function expenseShareTotal(expense: GroupExpense): number {
  return expense.shares.reduce((sum, share) => sum + share.amountMinor, 0);
}

export function netBalances(
  group: Group,
  expenses: GroupExpense[],
  settledTransfers: Transfer[],
): Map<string, number> {
  const net = new Map<string, number>();
  for (const member of group.members) net.set(member.id, 0);

  for (const expense of expenses) {
    const payer = net.get(expense.payerMemberId);
    if (payer === undefined) continue;
    net.set(expense.payerMemberId, payer + expense.amountMinor);
    for (const share of expense.shares) {
      const current = net.get(share.memberId);
      if (current === undefined) continue;
      net.set(share.memberId, current - share.amountMinor);
    }
  }

  for (const transfer of settledTransfers) {
    if (transfer.status !== 'settled') continue;
    const from = net.get(transfer.fromMemberId);
    const to = net.get(transfer.toMemberId);
    if (from === undefined || to === undefined) continue;
    net.set(transfer.fromMemberId, from + transfer.amountMinor);
    net.set(transfer.toMemberId, to - transfer.amountMinor);
  }

  return net;
}

export type SettlementTransfer = {
  fromMemberId: string;
  toMemberId: string;
  amountMinor: number;
};

export function minimizeTransfers(net: Map<string, number>): SettlementTransfer[] {
  const debtors = [...net.entries()]
    .filter(([, amount]) => amount < 0)
    .map(([memberId, amount]) => ({ memberId, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = [...net.entries()]
    .filter(([, amount]) => amount > 0)
    .map(([memberId, amount]) => ({ memberId, amount }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: SettlementTransfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]!;
    const creditor = creditors[creditorIndex]!;
    const amount = Math.min(debtor.amount, creditor.amount);
    if (amount > 0) {
      transfers.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amountMinor: amount,
      });
    }
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount === 0) debtorIndex += 1;
    if (creditor.amount === 0) creditorIndex += 1;
  }

  return transfers;
}

export function computeSettlement(
  group: Group,
  expenses: GroupExpense[],
  transfers: Transfer[],
): SettlementTransfer[] {
  return minimizeTransfers(netBalances(group, expenses, transfers));
}

export function totalPendingForGroup(
  group: Group,
  expenses: GroupExpense[],
  transfers: Transfer[],
): number {
  return computeSettlement(group, expenses, transfers)
    .reduce((sum, transfer) => sum + transfer.amountMinor, 0);
}

export function memberName(group: Group, memberId: string): string {
  return group.members.find((member) => member.id === memberId)?.name ?? 'Miembro';
}

export function roleAllowsRoleChange(member: Member | undefined): boolean {
  return member?.role === 'admin';
}

export function groupMemberBalances(
  group: Group,
  expenses: GroupExpense[],
  transfers: Transfer[],
): Map<string, number> {
  return netBalances(group, expenses, transfers);
}
