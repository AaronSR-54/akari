export const SYNC_TABLES = [
  'accounts',
  'movements',
  'recurrences',
  'installments',
  'groups',
  'groupExpenses',
  'transfers',
] as const;

export type SyncTable = (typeof SYNC_TABLES)[number];

/** Nombre de la tabla en PostgreSQL. */
export const REMOTE_TABLE: Record<SyncTable, string> = {
  accounts: 'accounts',
  movements: 'movements',
  recurrences: 'recurrences',
  installments: 'installment_plans',
  groups: 'groups',
  groupExpenses: 'group_expenses',
  transfers: 'transfers',
};

/** Marca local de una entidad respecto a la nube. */
export type SyncStateRow = {
  key: string;
  table: SyncTable;
  entityId: string;
  updatedAt: string;
  deletedAt?: string | null;
  dirty: 0 | 1;
};

export type SyncMetaRow = {
  key: string;
  value: string;
};

export type CloudRow = {
  id: string;
  updated_at?: string;
  deleted_at?: string | null;
  user_id?: string;
} & Record<string, unknown>;

export type CloudGateway = {
  fetchAll(table: SyncTable): Promise<CloudRow[]>;
  upsert(table: SyncTable, row: Record<string, unknown>): Promise<CloudRow>;
  softDelete(table: SyncTable, id: string): Promise<CloudRow | null>;
};

export type SyncResult = {
  pushed: number;
  pulled: number;
  removed: number;
  pending: number;
};
