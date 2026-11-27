import type { AkariDB } from '../db.js';
import { fromRemoteRow, toRemoteRow, type SyncEntity } from './mapping.js';
import {
  countPendingChanges,
  setLastSyncedAt,
  syncKey,
} from './state.js';
import {
  SYNC_TABLES,
  type CloudGateway,
  type CloudRow,
  type SyncResult,
  type SyncStateRow,
  type SyncTable,
} from './types.js';

export type SyncEngineOptions = {
  db: AkariDB;
  gateway: CloudGateway;
  /** Inyectable para pruebas deterministas. */
  now?: () => string;
};

export type SyncEngine = {
  sync(): Promise<SyncResult>;
  push(): Promise<number>;
  pull(): Promise<{ pulled: number; removed: number }>;
  pending(): Promise<number>;
};

const PUSH_BATCH = 200;

function cleanState(
  state: SyncStateRow,
  row: CloudRow,
  now: () => string,
): SyncStateRow {
  return {
    ...state,
    updatedAt: row.updated_at ?? now(),
    deletedAt: row.deleted_at ?? null,
    dirty: 0,
  };
}

export function createSyncEngine({ db, gateway, now = () => new Date().toISOString() }: SyncEngineOptions): SyncEngine {
  let running: Promise<SyncResult> | null = null;

  const pushTable = async (table: SyncTable): Promise<number> => {
    let pushed = 0;

    for (;;) {
      const batch = await db.syncState
        .where('table')
        .equals(table)
        .and((row) => row.dirty === 1)
        .limit(PUSH_BATCH)
        .toArray();

      if (batch.length === 0) break;

      for (const state of batch) {
        if (state.deletedAt) {
          const removed = await gateway.softDelete(table, state.entityId);
          if (removed) {
            await db.syncState.put(cleanState(state, removed, now));
          } else {
            // Nunca llegó a la nube: no hay nada que borrar allí.
            await db.syncState.delete(state.key);
          }
          pushed += 1;
          continue;
        }

        const entity = (await db.table(table).get(state.entityId)) as
          | SyncEntity
          | undefined;

        if (!entity) {
          const removed = await gateway.softDelete(table, state.entityId);
          if (removed) {
            await db.syncState.put(cleanState(state, removed, now));
          } else {
            await db.syncState.delete(state.key);
          }
          pushed += 1;
          continue;
        }

        const saved = await gateway.upsert(table, toRemoteRow(table, entity));
        if (!saved?.updated_at) {
          throw new Error(`Supabase no devolvió updated_at al guardar en ${table}`);
        }
        await db.syncState.put(cleanState(state, saved, now));
        pushed += 1;
      }

      if (batch.length < PUSH_BATCH) break;
    }

    return pushed;
  };

  const pullTable = async (table: SyncTable): Promise<{ pulled: number; removed: number }> => {
    const rows = await gateway.fetchAll(table);
    let pulled = 0;
    let removed = 0;

    for (const row of rows) {
      const id = row.id === null || row.id === undefined ? '' : String(row.id);
      if (!id) continue;

      const key = syncKey(table, id);
      const state = await db.syncState.get(key);

      // Un cambio local pendiente gana y se empujará en el siguiente ciclo.
      if (state?.dirty === 1) continue;

      if (row.deleted_at) {
        await db.table(table).delete(id);
        await db.syncState.delete(key);
        removed += 1;
        continue;
      }

      // El usuario pudo editar mientras llegaba la respuesta de red.
      const fresh = await db.syncState.get(key);
      if (fresh?.dirty === 1) continue;

      const entity = fromRemoteRow(table, row);
      await db.table(table).put(entity);
      await db.syncState.put({
        key,
        table,
        entityId: id,
        updatedAt: String(row.updated_at ?? now()),
        deletedAt: null,
        dirty: 0,
      });
      pulled += 1;
    }

    return { pulled, removed };
  };

  const push = async (): Promise<number> => {
    let pushed = 0;
    for (const table of SYNC_TABLES) {
      pushed += await pushTable(table);
    }
    return pushed;
  };

  const pull = async (): Promise<{ pulled: number; removed: number }> => {
    let pulled = 0;
    let removed = 0;
    for (const table of SYNC_TABLES) {
      const result = await pullTable(table);
      pulled += result.pulled;
      removed += result.removed;
    }
    return { pulled, removed };
  };

  const sync = (): Promise<SyncResult> => {
    if (running) return running;
    running = (async () => {
      const pushed = await push();
      const { pulled, removed } = await pull();
      const pending = await countPendingChanges(db);
      await setLastSyncedAt(db, now());
      return { pushed, pulled, removed, pending };
    })().finally(() => {
      running = null;
    });
    return running;
  };

  return { sync, push, pull, pending: () => countPendingChanges(db) };
}
