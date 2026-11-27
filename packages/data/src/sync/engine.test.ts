import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAccount, deleteAccount } from '@akari/domain';
import { AkariDB } from '../db.js';
import { createRepositories } from '../repositories.js';
import { createSyncEngine, type SyncEngine } from './engine.js';
import {
  bootstrapLocalState,
  countPendingChanges,
  getSyncOwner,
  setSyncOwner,
} from './state.js';
import { createTrackedRepositories } from './tracked.js';
import type { CloudGateway, CloudRow, SyncTable } from './types.js';

class MemoryGateway implements CloudGateway {
  private rows = new Map<SyncTable, Map<string, CloudRow>>();

  constructor(private readonly clock: () => string) {}

  seed(table: SyncTable, row: CloudRow): void {
    this.table(table).set(row.id, { ...row, updated_at: row.updated_at ?? this.clock() });
  }

  get(table: SyncTable, id: string): CloudRow | undefined {
    return this.table(table).get(id);
  }

  count(table: SyncTable): number {
    return this.table(table).size;
  }

  async fetchAll(table: SyncTable): Promise<CloudRow[]> {
    return [...this.table(table).values()].map((row) => ({ ...row }));
  }

  async upsert(table: SyncTable, row: Record<string, unknown>): Promise<CloudRow> {
    const saved: CloudRow = {
      ...row,
      id: String(row.id),
      updated_at: this.clock(),
      deleted_at: null,
    };
    this.table(table).set(saved.id, saved);
    return saved;
  }

  async softDelete(table: SyncTable, id: string): Promise<CloudRow | null> {
    const existing = this.table(table).get(id);
    if (!existing) return null;
    const saved: CloudRow = { ...existing, deleted_at: this.clock(), updated_at: this.clock() };
    this.table(table).set(id, saved);
    return saved;
  }

  private table(name: SyncTable): Map<string, CloudRow> {
    let rows = this.rows.get(name);
    if (!rows) {
      rows = new Map();
      this.rows.set(name, rows);
    }
    return rows;
  }
}

let db: AkariDB;
let repositories: ReturnType<typeof createTrackedRepositories>;
let gateway: MemoryGateway;
let engine: SyncEngine;
let tick: number;

const clock = () => new Date(Date.UTC(2026, 0, 1) + tick++ * 1000).toISOString();

beforeEach(() => {
  tick = 0;
  db = new AkariDB(`sync-test-${Math.random().toString(36).slice(2)}`);
  repositories = createTrackedRepositories(createRepositories(db), db);
  gateway = new MemoryGateway(clock);
  engine = createSyncEngine({ db, gateway, now: clock });
});

afterEach(async () => {
  await db.delete();
});

async function newAccount(name = 'Diaria') {
  return createAccount(repositories, {
    name,
    type: 'personal',
    currency: 'EUR',
    initialBalanceMinor: 100000,
  });
}

describe('motor de sincronización', () => {
  it('sube los datos locales y los deja limpios', async () => {
    const account = await newAccount();
    expect(await countPendingChanges(db)).toBe(1);

    const result = await engine.sync();

    expect(result.pushed).toBe(1);
    expect(result.pending).toBe(0);
    expect(gateway.count('accounts')).toBe(1);
    expect(gateway.get('accounts', account.id)?.name).toBe('Diaria');
  });

  it('descarga filas remotas que no existen en local', async () => {
    gateway.seed('accounts', {
      id: 'acc_remote',
      name: 'Nube',
      type: 'personal',
      currency: 'EUR',
      initial_balance_minor: 5000,
      include_in_total: true,
      members: null,
      archived_at: null,
      created_at: clock(),
      updated_at: clock(),
      deleted_at: null,
    });

    const result = await engine.sync();

    expect(result.pulled).toBe(1);
    const account = await db.accounts.get('acc_remote');
    expect(account?.name).toBe('Nube');
    expect(account?.initialBalanceMinor).toBe(5000);
  });

  it('propaga un borrado local como borrado lógico remoto', async () => {
    const account = await newAccount();
    await bootstrapLocalState(db);
    await engine.sync();

    await deleteAccount(repositories, account.id);
    const result = await engine.sync();

    expect(result.pushed).toBe(1);
    expect(await db.accounts.get(account.id)).toBeUndefined();
    expect(gateway.get('accounts', account.id)?.deleted_at).toBeTruthy();
  });

  it('elimina en local las filas borradas en la nube', async () => {
    const account = await newAccount();
    await bootstrapLocalState(db);
    await engine.sync();

    await gateway.softDelete('accounts', account.id);
    const result = await engine.sync();

    expect(result.removed).toBe(1);
    expect(await db.accounts.get(account.id)).toBeUndefined();
  });

  it('prioriza un cambio local pendiente sobre el remoto', async () => {
    const account = await newAccount('Local');
    gateway.seed('accounts', {
      id: account.id,
      name: 'Remoto',
      type: 'personal',
      currency: 'EUR',
      initial_balance_minor: 100000,
      include_in_total: true,
      members: null,
      archived_at: null,
      created_at: clock(),
      updated_at: clock(),
      deleted_at: null,
    });

    await engine.sync();

    expect(gateway.get('accounts', account.id)?.name).toBe('Local');
    expect((await db.accounts.get(account.id))?.name).toBe('Local');
    expect(await countPendingChanges(db)).toBe(0);
  });

  it('bootstrap marca todas las filas existentes y descarta estados antiguos', async () => {
    const first = await newAccount('Primera');
    const second = await newAccount('Segunda');
    await db.syncState.put({
      key: 'accounts:fantasma',
      table: 'accounts',
      entityId: 'fantasma',
      updatedAt: clock(),
      deletedAt: null,
      dirty: 1,
    });

    const marked = await bootstrapLocalState(db);

    expect(marked).toBe(2);
    expect(await db.syncState.get('accounts:fantasma')).toBeUndefined();
    expect(await countPendingChanges(db)).toBe(2);
    expect(await db.syncState.get(`accounts:${first.id}`)).toBeTruthy();
    expect(await db.syncState.get(`accounts:${second.id}`)).toBeTruthy();
  });

  it('guarda el propietario del espacio local', async () => {
    expect(await getSyncOwner(db)).toBeNull();
    await setSyncOwner(db, 'user-1');
    expect(await getSyncOwner(db)).toBe('user-1');
  });
});
