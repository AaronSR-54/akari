import { format, startOfDay } from 'date-fns';
import { calculateAccountBalance, upcomingPayments } from './accounts.js';
import { computeSettlement, memberName } from './group.js';
import { formatMinor } from './money.js';
import type {
  Account,
  Group,
  GroupExpense,
  InstallmentPlan,
  Movement,
  Recurrence,
  Transfer,
} from './types.js';

export type NotificationKind = 'payment' | 'joint-activity' | 'settlement';
export type NotificationTone = 'danger' | 'warning' | 'info' | 'positive' | 'neutral';

export type NotificationAction =
  | { type: 'pay-recurrence'; recurrenceId: string }
  | { type: 'pay-installment'; planId: string }
  | { type: 'open-account'; accountId: string }
  | { type: 'open-group'; groupId: string };

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  tone: NotificationTone;
  title: string;
  detail: string;
  status: string;
  amountMinor: number;
  currency: string;
  date: string;
  href: string | null;
  seen: boolean;
  action: NotificationAction;
};

export type BuildNotificationsInput = {
  accounts: Account[];
  movements: Movement[];
  recurrences: Recurrence[];
  installments: InstallmentPlan[];
  groups: Group[];
  groupExpenses: GroupExpense[];
  transfers: Transfer[];
  today: Date;
  currentMemberName: string;
  seenIds?: string[];
  /** Días de antelación para pagos y actividad. */
  days?: number;
  /** Días hacia atrás para actividad conjunta y liquidaciones recibidas. */
  activityDays?: number;
};

const DAY_MS = 86_400_000;

function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function daysAgo(today: Date, days: number): string {
  return dayKey(new Date(startOfDay(today).getTime() - days * DAY_MS));
}

export function buildNotifications(input: BuildNotificationsInput): AppNotification[] {
  const {
    accounts,
    movements,
    recurrences,
    installments,
    groups,
    groupExpenses,
    transfers,
    today,
    currentMemberName,
    seenIds = [],
    days = 14,
    activityDays = 7,
  } = input;
  const seen = new Set(seenIds);
  const todayKey = dayKey(today);
  const sinceKey = daysAgo(today, activityDays);
  const activeAccounts = accounts.filter((account) => !account.archivedAt);
  const notifications: AppNotification[] = [];

  for (const payment of upcomingPayments(
    recurrences,
    installments,
    activeAccounts,
    today,
    days,
  )) {
    const account = activeAccounts.find((candidate) => candidate.id === payment.accountId);
    if (!account) continue;
    const balance = calculateAccountBalance(account, movements, todayKey).minor;
    const covered = balance >= payment.amountMinor;
    const shortfall = payment.amountMinor - balance;
    const isInstallment = payment.kind === 'installment';
    const id = isInstallment
      ? `payment:installment:${payment.id}:${payment.date}`
      : `payment:recurrence:${payment.id}:${payment.date}`;
    notifications.push({
      id,
      kind: 'payment',
      tone: isInstallment ? 'danger' : 'info',
      title: payment.overdue
        ? `Cuota vencida: ${payment.label}`
        : `Pago próximo: ${payment.label}`,
      detail: covered
        ? `${account.name} · Saldo ${formatMinor(balance, payment.currency)}`
        : `${account.name} · Saldo ${formatMinor(balance, payment.currency)} · faltan ${formatMinor(shortfall, payment.currency)}`,
      status: payment.overdue ? 'Vencida' : 'Próxima',
      amountMinor: payment.amountMinor,
      currency: payment.currency,
      date: payment.date,
      href: null,
      seen: seen.has(id),
      action: isInstallment
        ? { type: 'pay-installment', planId: payment.id }
        : { type: 'pay-recurrence', recurrenceId: payment.id },
    });
  }

  const jointActivity = movements
    .filter((movement) => {
      const account = activeAccounts.find((candidate) => candidate.id === movement.accountId);
      if (!account || account.type !== 'joint') return false;
      if (movement.date < sinceKey || movement.date > todayKey) return false;
      const author = account.members?.find((member) => member.id === movement.memberId);
      return author?.name !== currentMemberName;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const movement of jointActivity) {
    const account = activeAccounts.find((candidate) => candidate.id === movement.accountId)!;
    const author = account.members?.find((member) => member.id === movement.memberId);
    const added = movement.type === 'income';
    const id = `joint-activity:${movement.id}`;
    notifications.push({
      id,
      kind: 'joint-activity',
      tone: added ? 'positive' : 'neutral',
      title: author
        ? `${author.name} ${added ? 'añadió dinero' : 'gastó dinero'}`
        : `Actividad en ${account.name}`,
      detail: `${movement.concept} · ${account.name}`,
      status: 'Cuenta conjunta',
      amountMinor: movement.amountMinor,
      currency: movement.currency,
      date: movement.date,
      href: `/cuentas/${account.id}`,
      seen: seen.has(id),
      action: { type: 'open-account', accountId: account.id },
    });
  }

  for (const group of groups) {
    const current = group.members.find((member) => member.name === currentMemberName);
    if (!current) continue;
    const expenseList = groupExpenses.filter((expense) => expense.groupId === group.id);
    const transferList = transfers.filter((transfer) => transfer.groupId === group.id);

    for (const transfer of computeSettlement(group, expenseList, transferList)) {
      const incoming = transfer.toMemberId === current.id;
      const outgoing = transfer.fromMemberId === current.id;
      if (!incoming && !outgoing) continue;
      const counterpartId = incoming ? transfer.fromMemberId : transfer.toMemberId;
      const counterpart = memberName(group, counterpartId);
      const amount = formatMinor(transfer.amountMinor, group.currency);
      const id = `settlement-pending:${group.id}:${transfer.fromMemberId}:${transfer.toMemberId}:${transfer.amountMinor}`;
      notifications.push({
        id,
        kind: 'settlement',
        tone: incoming ? 'info' : 'warning',
        title: incoming ? `${counterpart} te debe ${amount}` : `Debes ${amount} a ${counterpart}`,
        detail: incoming
          ? `${group.name} · liquidación pendiente a tu favor`
          : `${group.name} · liquidación pendiente`,
        status: 'Pendiente',
        amountMinor: transfer.amountMinor,
        currency: group.currency,
        date: todayKey,
        href: `/grupos/${group.id}`,
        seen: seen.has(id),
        action: { type: 'open-group', groupId: group.id },
      });
    }

    for (const transfer of transferList) {
      if (transfer.status !== 'settled' || transfer.toMemberId !== current.id) continue;
      const settledKey = transfer.settledAt?.slice(0, 10) ?? dayKey(new Date(transfer.createdAt));
      if (settledKey < sinceKey) continue;
      const counterpart = memberName(group, transfer.fromMemberId);
      const amount = formatMinor(transfer.amountMinor, group.currency);
      const id = `settlement-received:${transfer.id}`;
      notifications.push({
        id,
        kind: 'settlement',
        tone: 'positive',
        title: `Has recibido ${amount} de ${counterpart}`,
        detail: `${group.name} · liquidación recibida`,
        status: 'Recibida',
        amountMinor: transfer.amountMinor,
        currency: group.currency,
        date: settledKey,
        href: `/grupos/${group.id}`,
        seen: seen.has(id),
        action: { type: 'open-group', groupId: group.id },
      });
    }
  }

  return notifications.sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, 'es'),
  );
}
