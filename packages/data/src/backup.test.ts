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
    expect(backup.schemaVersion).toBe(2);

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
});
