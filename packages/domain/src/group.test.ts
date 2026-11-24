import { describe, expect, it } from 'vitest';
import {
  computeSettlement,
  convertMinor,
  minimizeTransfers,
  splitByFixed,
  splitByPercentage,
  splitEqual,
} from './group.js';
import type { Group, GroupExpense, Transfer } from './types.js';

const group: Group = {
  id: 'g1',
  name: 'Piso',
  currency: 'EUR',
  members: [
    { id: 'ana', name: 'Ana', role: 'admin' },
    { id: 'luis', name: 'Luis', role: 'editor' },
    { id: 'marta', name: 'Marta', role: 'editor' },
  ],
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

const expense = (overrides: Partial<GroupExpense> = {}): GroupExpense => ({
  id: 'e1',
  groupId: 'g1',
  payerMemberId: 'ana',
  amountMinor: 9000,
  currency: 'EUR',
  splitMode: 'equal',
  shares: [
    { memberId: 'ana', amountMinor: 3000 },
    { memberId: 'luis', amountMinor: 3000 },
    { memberId: 'marta', amountMinor: 3000 },
  ],
  date: '2026-11-10',
  concept: 'Cena',
  createdAt: '2026-11-10T00:00:00.000Z',
  ...overrides,
});

describe('group splitting', () => {
  it('reparte igual y asigna el resto', () => {
    const shares = splitEqual(1000, ['a', 'b', 'c']);
    expect(shares.map((share) => share.amountMinor)).toEqual([334, 333, 333]);
    expect(shares.reduce((sum, share) => sum + share.amountMinor, 0)).toBe(1000);
  });

  it('exige porcentajes que suman 100', () => {
    expect(() =>
      splitByPercentage(1000, [
        { memberId: 'a', percentage: 50 },
        { memberId: 'b', percentage: 40 },
      ]),
    ).toThrow(/100/);
    const shares = splitByPercentage(1000, [
      { memberId: 'a', percentage: 33.3 },
      { memberId: 'b', percentage: 66.7 },
    ]);
    expect(shares.reduce((sum, share) => sum + share.amountMinor, 0)).toBe(1000);
  });

  it('valida cantidades fijas contra el total', () => {
    expect(() =>
      splitByFixed(1000, [
        { memberId: 'a', amountMinor: 400 },
        { memberId: 'b', amountMinor: 500 },
      ]),
    ).toThrow(/reparto/);
    expect(
      splitByFixed(1000, [
        { memberId: 'a', amountMinor: 600 },
        { memberId: 'b', amountMinor: 400 },
      ]),
    ).toEqual([
      { memberId: 'a', amountMinor: 600 },
      { memberId: 'b', amountMinor: 400 },
    ]);
  });
});

describe('settlement', () => {
  it('calcula quién paga a quién y salda todas las deudas', () => {
    const transfers = computeSettlement(group, [expense()], []);
    expect(transfers).toHaveLength(2);
    const byFrom = Object.fromEntries(transfers.map((transfer) => [transfer.fromMemberId, transfer]));
    expect(byFrom.luis?.amountMinor).toBe(3000);
    expect(byFrom.marta?.amountMinor).toBe(3000);
  });

  it('resta las transferencias ya saldadas', () => {
    const settled: Transfer = {
      id: 't1',
      groupId: 'g1',
      fromMemberId: 'luis',
      toMemberId: 'ana',
      amountMinor: 3000,
      currency: 'EUR',
      status: 'settled',
      createdAt: '2026-11-11T00:00:00.000Z',
    };
    const transfers = computeSettlement(group, [expense()], [settled]);
    expect(transfers).toEqual([{ fromMemberId: 'marta', toMemberId: 'ana', amountMinor: 3000 }]);
  });

  it('minimiza transferencias cruzadas', () => {
    const transfers = minimizeTransfers(
      new Map([
        ['a', 500],
        ['b', -300],
        ['c', -200],
      ]),
    );
    expect(transfers.reduce((sum, entry) => sum + entry.amountMinor, 0)).toBe(500);
  });

  it('convierte divisas con redondeo entero', () => {
    expect(convertMinor(10000, 1.08)).toBe(10800);
    expect(() => convertMinor(10000, 0)).toThrow();
  });
});
