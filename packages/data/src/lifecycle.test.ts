import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StorageError, aggregateBalances, getGroupSummary } from '@akari/domain';
import { AkariDB } from './db.js';
import { createRepositories as buildRepositories } from './repositories.js';
import {
  getStorageStatus,
  loadDemoDatabase,
  resetDatabase,
  storageErrorMessage,
} from './lifecycle.js';
import { wrapRepository } from './repositories.js';
import { DEMO_SEED_VERSION } from './seed.js';

let db: AkariDB;

beforeEach(() => {
  db = new AkariDB(`lifecycle-${Math.random().toString(36).slice(2)}`);
});

afterEach(async () => {
  await db.delete();
});

describe('lifecycle', () => {
  it('carga datos de ejemplo coherentes y permite reiniciar', async () => {
    await loadDemoDatabase(db, new Date('2026-11-15T12:00:00.000Z'));
    const repositories = buildRepositories(db);
    expect(await repositories.accounts.list()).toHaveLength(3);
    const settings = await repositories.settings.get();
    expect(settings.onboardingCompleted).toBe(true);
    expect(settings.demoSeedVersion).toBe(DEMO_SEED_VERSION);
    const accounts = await repositories.accounts.list();
    const movements = await repositories.movements.list();
    const totals = aggregateBalances(accounts, movements);
    expect(totals.find((entry) => entry.currency === 'EUR')?.minor).toBe(1587801);
    expect(movements.every((movement) => /^\d{4}-\d{2}-\d{2}$/.test(movement.date))).toBe(true);
    const demoWeek = new Set(
      movements
        .filter((movement) => movement.date >= '2026-11-09' && movement.date <= '2026-11-15')
        .map((movement) => movement.date),
    );
    expect(demoWeek.size).toBe(7);
    const summary = await getGroupSummary(repositories, 'demo-grp-flat');
    expect(summary?.pendingTotalMinor).toBeGreaterThan(0);

    await resetDatabase(db);
    expect(await repositories.accounts.list()).toHaveLength(0);
    expect((await repositories.settings.get()).onboardingCompleted).toBe(false);
    expect(await db.movements.count()).toBe(0);
    expect(await db.groupExpenses.count()).toBe(0);
  });

  it('informa del estado del almacenamiento', async () => {
    const status = await getStorageStatus();
    expect(typeof status.available).toBe('boolean');
    expect(status.message.length).toBeGreaterThan(10);
  });

  it('convierte errores de cuota en StorageError accionable', async () => {
    const wrapped = wrapRepository({
      save: async () => {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      },
    });
    await expect(wrapped.save()).rejects.toBeInstanceOf(StorageError);
    await expect(wrapped.save()).rejects.toMatchObject({ reason: 'quota' });
    expect(storageErrorMessage(new DOMException('blocked', 'SecurityError'))).toMatch(/privada/);
  });
});
