import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { AkariDB } from './db.js';

class LegacyDB extends Dexie {
  constructor(name: string) {
    super(name);
    this.version(1).stores({
      accounts: 'id, type, includeInTotal, archivedAt',
      movements: 'id, accountId, date, type, category, recurrenceId, installmentPlanId',
      recurrences: 'id, accountId, nextDate',
      installments: 'id, accountId',
      groups: 'id',
      groupExpenses: 'id, groupId, date',
      transfers: 'id, groupId, status',
      settings: 'id',
    });
  }
}

let current: AkariDB | LegacyDB | null = null;

afterEach(async () => {
  if (current) {
    await current.delete();
    current = null;
  }
});

describe('migrations', () => {
  it('migra de v1 a v2 conservando los registros', async () => {
    const name = `migration-${Math.random().toString(36).slice(2)}`;
    const legacy = new LegacyDB(name);
    current = legacy;
    await legacy.table('accounts').put({
      id: 'acc-1',
      name: 'Antigua',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 100,
      includeInTotal: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    await legacy.table('settings').put({
      id: 'app',
      theme: 'unknown',
      shellMode: 'legacy',
      onboardingCompleted: true,
      demoLoaded: false,
    });
    legacy.close();

    const migrated = new AkariDB(name);
    current = migrated;
    const accounts = await migrated.accounts.toArray();
    expect(accounts).toHaveLength(1);
    expect(accounts[0]?.name).toBe('Antigua');
    const settings = await migrated.settings.get('app');
    expect(settings?.theme).toBe('system');
    expect(settings?.shellMode).toBe('sidebar');
    expect(migrated.verno).toBe(2);
  });
});
