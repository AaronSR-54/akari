import type { AkariDB } from '../db.js';
import { SYNC_TABLES, type SyncStateRow } from './types.js';

export const SYNC_OWNER_KEY = 'ownerId';
export const SYNC_LAST_SYNC_KEY = 'lastSyncedAt';

export async function getSyncOwner(db: AkariDB): Promise<string | null> {
  const row = await db.syncMeta.get(SYNC_OWNER_KEY);
  return row?.value ?? null;
}

export async function setSyncOwner(db: AkariDB, ownerId: string): Promise<void> {
  await db.syncMeta.put({ key: SYNC_OWNER_KEY, value: ownerId });
}

export async function getLastSyncedAt(db: AkariDB): Promise<string | null> {
  const row = await db.syncMeta.get(SYNC_LAST_SYNC_KEY);
  return row?.value ?? null;
}

export async function setLastSyncedAt(db: AkariDB, value: string): Promise<void> {
  await db.syncMeta.put({ key: SYNC_LAST_SYNC_KEY, value });
}

export function syncKey(table: string, entityId: string): string {
  return `${table}:${entityId}`;
}

export async function clearSyncState(db: AkariDB): Promise<void> {
  await db.syncState.clear();
}

export async function countPendingChanges(db: AkariDB): Promise<number> {
  return db.syncState.where('dirty').equals(1).count();
}

export async function hasLocalData(db: AkariDB): Promise<boolean> {
  for (const table of SYNC_TABLES) {
    if ((await db.table(table).count()) > 0) return true;
  }
  return false;
}

/**
 * Vacía las entidades sincronizables sin tocar ajustes locales, propietario
 * ni preferencias del dispositivo. Se usa al descargar una cuenta existente.
 */
export async function clearSyncedData(db: AkariDB): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const table of SYNC_TABLES) {
      await db.table(table).clear();
    }
    await db.syncState.clear();
  });
  await db.syncMeta.delete(SYNC_LAST_SYNC_KEY);
}

/**
 * Marca todas las filas locales existentes como pendientes de subir.
 * Se usa la primera vez que un espacio local se vincula a una cuenta.
 */
export async function bootstrapLocalState(db: AkariDB): Promise<number> {
  await db.syncState.clear();
  const now = new Date().toISOString();
  const rows: SyncStateRow[] = [];
  for (const table of SYNC_TABLES) {
    const entities = (await db.table(table).toArray()) as Array<{ id: string }>;
    for (const entity of entities) {
      rows.push({
        key: syncKey(table, entity.id),
        table,
        entityId: entity.id,
        updatedAt: now,
        deletedAt: null,
        dirty: 1,
      });
    }
  }
  if (rows.length > 0) await db.syncState.bulkPut(rows);
  return rows.length;
}
