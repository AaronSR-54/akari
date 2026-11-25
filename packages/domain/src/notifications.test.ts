import { describe, expect, it } from 'vitest';
import { buildNotifications } from './notifications.js';
import type {
  Account,
  Group,
  GroupExpense,
  InstallmentPlan,
  Movement,
  Recurrence,
  Transfer,
} from './types.js';

const today = new Date('2026-11-29T12:00:00');
const stamp = '2026-11-01T00:00:00.000Z';

const personal: Account = {
  id: 'acc-day',
  name: 'Cuenta diaria',
  type: 'personal',
  currency: 'EUR',
  initialBalanceMinor: 5000,
  includeInTotal: true,
  createdAt: stamp,
  updatedAt: stamp,
};

const joint: Account = {
  id: 'acc-joint',
  name: 'Cuenta conjunta',
  type: 'joint',
  currency: 'EUR',
  initialBalanceMinor: 80000,
  includeInTotal: true,
  members: [
    { id: 'mem-ana', name: 'Ana', role: 'admin' },
    { id: 'mem-luis', name: 'Luis', role: 'editor' },
    { id: 'mem-marta', name: 'Marta', role: 'editor' },
  ],
  createdAt: stamp,
  updatedAt: stamp,
};

const recurrence: Recurrence = {
  id: 'rec-video',
  accountId: 'acc-day',
  type: 'expense',
  amountMinor: 1299,
  currency: 'EUR',
  concept: 'Suscripción vídeo',
  category: 'Suscripciones',
  frequency: 'monthly',
  nextDate: '2026-12-04',
  createdAt: stamp,
};

const installment: InstallmentPlan = {
  id: 'plan-laptop',
  accountId: 'acc-day',
  concept: 'Portátil',
  totalMinor: 6000,
  currency: 'EUR',
  installments: 6,
  paidInstallments: 2,
  firstDueDate: '2026-08-29',
  frequency: 'monthly',
  createdAt: stamp,
};

function movement(partial: Partial<Movement> & Pick<Movement, 'id' | 'accountId' | 'type'>): Movement {
  return {
    amountMinor: 1000,
    currency: 'EUR',
    date: '2026-11-28',
    concept: 'Movimiento',
    category: 'Ocio',
    createdAt: stamp,
    ...partial,
  };
}

const activity: Movement[] = [
  movement({
    id: 'mov-ana-income',
    accountId: 'acc-joint',
    type: 'income',
    amountMinor: 5000,
    concept: 'Aportación',
    memberId: 'mem-ana',
    date: '2026-11-28',
  }),
  movement({
    id: 'mov-luis-expense',
    accountId: 'acc-joint',
    type: 'expense',
    amountMinor: 2000,
    concept: 'Compra del piso',
    memberId: 'mem-luis',
    date: '2026-11-27',
  }),
  movement({
    id: 'mov-marta-expense',
    accountId: 'acc-joint',
    type: 'expense',
    amountMinor: 1000,
    concept: 'Propia',
    memberId: 'mem-marta',
    date: '2026-11-28',
  }),
  movement({
    id: 'mov-personal',
    accountId: 'acc-day',
    type: 'expense',
    amountMinor: 1000,
    concept: 'Personal',
    date: '2026-11-28',
  }),
  movement({
    id: 'mov-old',
    accountId: 'acc-joint',
    type: 'expense',
    amountMinor: 1000,
    concept: 'Antiguo',
    memberId: 'mem-ana',
    date: '2026-11-10',
  }),
];

const members = [
  { id: 'mem-ana', name: 'Ana', role: 'admin' as const },
  { id: 'mem-marta', name: 'Marta', role: 'editor' as const },
];
const membersNoMarta = [
  { id: 'mem-ana', name: 'Ana', role: 'admin' as const },
  { id: 'mem-luis', name: 'Luis', role: 'editor' as const },
];

function group(id: string, members: Group['members']): Group {
  return {
    id,
    name: id,
    currency: 'EUR',
    members,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

function expense(id: string, groupId: string, payer: string, amountMinor: number): GroupExpense {
  const share = Math.floor(amountMinor / 2);
  return {
    id,
    groupId,
    payerMemberId: payer,
    amountMinor,
    currency: 'EUR',
    splitMode: 'equal',
    shares: [
      { memberId: 'mem-ana', amountMinor: share },
      { memberId: 'mem-marta', amountMinor: amountMinor - share },
    ],
    date: '2026-11-27',
    concept: 'Cena',
    createdAt: stamp,
  };
}

const groupOut = group('out', members);
const groupIn = group('in', members);
const groupSettled = group('settled', members);
const groupOther = group('other', membersNoMarta);

const groups = [groupOut, groupIn, groupSettled, groupOther];
const groupExpenses = [
  expense('exp-out', groupOut.id, 'mem-ana', 2000),
  expense('exp-in', groupIn.id, 'mem-marta', 1000),
];
const transfers: Transfer[] = [
  {
    id: 'trf-received',
    groupId: groupSettled.id,
    fromMemberId: 'mem-ana',
    toMemberId: 'mem-marta',
    amountMinor: 300,
    currency: 'EUR',
    status: 'settled',
    settledAt: '2026-11-28T10:00:00.000Z',
    createdAt: '2026-11-28T09:00:00.000Z',
  },
];

function build(overrides: Partial<Parameters<typeof buildNotifications>[0]> = {}) {
  return buildNotifications({
    accounts: [personal, joint],
    movements: activity,
    recurrences: [recurrence],
    installments: [installment],
    groups,
    groupExpenses,
    transfers,
    today,
    currentMemberName: 'Marta',
    ...overrides,
  });
}

describe('buildNotifications', () => {
  it('lista pagos con saldo', () => {
    const payments = build().filter((item) => item.kind === 'payment');
    expect(payments).toHaveLength(2);
    expect(payments[0]?.status).toBe('Vencida');
    expect(payments[0]?.detail).toContain('Saldo');
    expect(payments[0]?.detail).not.toContain('cubre');
    expect(payments[0]?.tone).toBe('danger');
    expect(payments[1]?.title).toContain('Pago próximo');
    expect(payments[1]?.action).toEqual({ type: 'pay-recurrence', recurrenceId: 'rec-video' });
    expect(payments[1]?.tone).toBe('info');
    expect(payments[0]?.action).toEqual({ type: 'pay-installment', planId: 'plan-laptop' });
  });

  it('avisa cuando el saldo no cubre el pago', () => {
    const payments = build({
      accounts: [{ ...personal, initialBalanceMinor: 500 }, joint],
    }).filter((item) => item.kind === 'payment');
    expect(payments.every((item) => /faltan/.test(item.detail))).toBe(true);
  });

  it('excluye pagos fuera del plazo', () => {
    const payments = build({
      recurrences: [{ ...recurrence, nextDate: '2026-12-20' }],
    }).filter((item) => item.kind === 'payment');
    expect(payments).toHaveLength(1);
    expect(payments[0]?.id).toContain('plan-laptop');
  });

  it('atribuye la actividad conjunta a su autor y excluye la propia', () => {
    const jointActivity = build().filter((item) => item.kind === 'joint-activity');
    expect(jointActivity.map((item) => item.title)).toEqual([
      'Luis gastó dinero',
      'Ana añadió dinero',
    ]);
    expect(jointActivity.some((item) => item.title.includes('Propia'))).toBe(false);
    expect(jointActivity.some((item) => item.title.includes('Personal'))).toBe(false);
    expect(jointActivity.some((item) => item.title.includes('Antiguo'))).toBe(false);
    expect(jointActivity[0]?.href).toBe('/cuentas/acc-joint');
  });

  it('genera liquidaciones pendientes en ambos sentidos y recibidas', () => {
    const settlements = build().filter((item) => item.kind === 'settlement');
    expect(settlements.some((item) => /^Debes .* a Ana$/.test(item.title))).toBe(true);
    expect(settlements.some((item) => /^Ana te debe /.test(item.title))).toBe(true);
    expect(settlements.some((item) => /^Has recibido .* de Ana$/.test(item.title))).toBe(true);
    expect(settlements.some((item) => item.detail.includes('other'))).toBe(false);
    expect(settlements.every((item) => item.href?.startsWith('/grupos/'))).toBe(true);
  });

  it('ordena todos los avisos por fecha ascendente', () => {
    const dates = build().map((item) => item.date);
    expect(dates).toEqual([...dates].sort((a, b) => a.localeCompare(b)));
    expect(dates[0]).toBe('2026-10-29');
  });

  it('marca como vistas las notificaciones incluidas en seenIds', () => {
    const all = build();
    const seenIds = all.slice(0, 2).map((item) => item.id);
    const withSeen = build({ seenIds });
    expect(withSeen.slice(0, 2).every((item) => item.seen)).toBe(true);
    expect(withSeen.slice(2).some((item) => item.seen)).toBe(false);
  });
});
