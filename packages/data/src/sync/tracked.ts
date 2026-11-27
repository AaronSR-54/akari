import type { AkariDB } from '../db.js';
import type { AkariRepositories } from '../repositories.js';
import { syncKey } from './state.js';
import type { SyncStateRow, SyncTable } from './types.js';

export type LocalChangeListener = (table: SyncTable) => void;

type TrackableRepository<T extends { id: string }> = {
  put(value: T): Promise<void>;
  delete(id: string): Promise<void>;
};

function wrapRepository<T extends { id: string }, R extends TrackableRepository<T>>(
  db: AkariDB,
  table: SyncTable,
  repository: R,
  onChange?: LocalChangeListener,
): R {
  return {
    ...repository,
    put: async (entity: T) => {
      await db.transaction('rw', db.table(table), db.syncState, async () => {
        await repository.put(entity);
        const now = new Date().toISOString();
        const row: SyncStateRow = {
          key: syncKey(table, entity.id),
          table,
          entityId: entity.id,
          updatedAt: now,
          deletedAt: null,
          dirty: 1,
        };
        await db.syncState.put(row);
      });
      onChange?.(table);
    },
    delete: async (id: string) => {
      await db.transaction('rw', db.table(table), db.syncState, async () => {
        const key = syncKey(table, id);
        const existing = await db.syncState.get(key);
        await repository.delete(id);
        if (existing) {
          const now = new Date().toISOString();
          await db.syncState.put({
            ...existing,
            updatedAt: now,
            deletedAt: now,
            dirty: 1,
          });
        }
      });
      onChange?.(table);
    },
  } as R;
}

/**
 * Envuelve los repositorios para registrar qué entidades han cambiado desde
 * la última sincronización. El dominio y los casos de uso no cambian.
 */
export function createTrackedRepositories(
  repositories: AkariRepositories,
  db: AkariDB,
  onChange?: LocalChangeListener,
): AkariRepositories {
  return {
    ...repositories,
    accounts: wrapRepository(db, 'accounts', repositories.accounts, onChange),
    movements: wrapRepository(db, 'movements', repositories.movements, onChange),
    recurrences: wrapRepository(db, 'recurrences', repositories.recurrences, onChange),
    installments: wrapRepository(db, 'installments', repositories.installments, onChange),
    groups: wrapRepository(db, 'groups', repositories.groups, onChange),
    groupExpenses: wrapRepository(db, 'groupExpenses', repositories.groupExpenses, onChange),
    transfers: wrapRepository(db, 'transfers', repositories.transfers, onChange),
  };
}
