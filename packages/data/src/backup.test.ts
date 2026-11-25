import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AkariDB } from './db.js';
import { backupToJson, exportBackup, importBackup, validateBackup } from './backup.js';
import { createRepositories } from './repositories.js';
import { seedDemoData } from './seed.js';

let db: AkariDB;

beforeEach(() => {
  db = new AkariDB(`backup-${Math.random().toString(36).slice(2)}`);
});

afterEach(async () => {
  await db.delete();
});

describe('backup', () => {
  it('exporta e importa una copia completa', async () => {
    const repositories = createRepositories(db);
    await seedDemoData(repositories, new Date('2026-11-15T12:00:00.000Z'));
    const before = await db.accounts.count();
    const backup = await exportBackup(db);
    expect(backup.warning.encrypted).toBe(false);
    expect(backup.warning.message).toMatch(/NO está cifrada/);
    expect(backup.schemaVersion).toBe(3);

    await db.accounts.clear();
    const result = await importBackup(db, JSON.parse(backupToJson(backup)));
    expect(result.imported).toBeGreaterThan(0);
    expect(await db.accounts.count()).toBe(before);
  });

  it('rechaza versiones y secciones inválidas sin tocar los datos', async () => {
    const repositories = createRepositories(db);
    await seedDemoData(repositories, new Date('2026-11-15T12:00:00.000Z'));
    const before = await db.accounts.count();

    await expect(importBackup(db, { app: 'otra', schemaVersion: 1, data: {} })).rejects.toThrow(
      /akari/,
    );
    await expect(
      importBackup(db, { app: 'akari', schemaVersion: 99, data: {} }),
    ).rejects.toThrow(/esquema/);
    expect(await db.accounts.count()).toBe(before);
  });

  it('valida que todas las secciones existan', () => {
    expect(() =>
      validateBackup({
        app: 'akari',
        schemaVersion: 2,
        data: { accounts: [] },
      }),
    ).toThrow(/movements/);
  });

  it('normaliza a other un bankId desconocido al importar una copia', async () => {
    const backup = {
      app: 'akari' as const,
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      warning: { encrypted: false as const, message: 'copia sin cifrar' },
      data: {
        accounts: [
          {
            id: 'acc-vieja',
            name: 'Cuenta vieja',
            type: 'personal',
            currency: 'EUR',
            initialBalanceMinor: 100,
            includeInTotal: true,
            bankId: 'banco-inventado',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        movements: [],
        recurrences: [],
        installments: [],
        groups: [],
        groupExpenses: [],
        transfers: [],
        settings: [],
      },
    };

    const validated = validateBackup(backup);
    expect((validated.data.accounts[0] as { bankId: string }).bankId).toBe('other');
    expect((await importBackup(db, backup)).imported).toBe(1);
    expect((await db.accounts.get('acc-vieja'))?.bankId).toBe('other');
  });
});
