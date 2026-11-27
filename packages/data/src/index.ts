export { AkariDB, openDatabase, SCHEMA_VERSION } from './db.js';
export {
  createRepositories,
  runStorage,
  wrapRepository,
  type AkariRepositories,
} from './repositories.js';
export {
  backupToJson,
  backupTables,
  clearDatabase,
  exportBackup,
  importBackup,
  validateBackup,
  type AkariBackup,
  type BackupWarning,
} from './backup.js';
export {
  DEMO_SEED_VERSION,
  demoAccounts,
  demoGroupExpenses,
  demoGroups,
  demoInstallments,
  demoMovements,
  demoRecurrences,
  demoTransfers,
  seedDemoData,
} from './seed.js';
export {
  getStorageStatus,
  loadDemoDatabase,
  resetDatabase,
  storageErrorMessage,
  type StorageStatus,
} from './lifecycle.js';
export {
  createSyncEngine,
  type SyncEngine,
  type SyncEngineOptions,
} from './sync/engine.js';
export { createSupabaseGateway } from './sync/supabase-gateway.js';
export { fromRemoteRow, toRemoteRow, type SyncEntity } from './sync/mapping.js';
export {
  bootstrapLocalState,
  clearSyncedData,
  clearSyncState,
  countPendingChanges,
  getLastSyncedAt,
  getSyncOwner,
  hasLocalData,
  setLastSyncedAt,
  setSyncOwner,
  syncKey,
} from './sync/state.js';
export { createTrackedRepositories, type LocalChangeListener } from './sync/tracked.js';
export {
  REMOTE_TABLE,
  SYNC_TABLES,
  type CloudGateway,
  type CloudRow,
  type SyncMetaRow,
  type SyncResult,
  type SyncStateRow,
  type SyncTable,
} from './sync/types.js';
