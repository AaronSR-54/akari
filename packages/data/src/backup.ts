import { defaultSettings } from '@akari/domain';
import type { AkariDB } from './db.js';
import { SCHEMA_VERSION } from './db.js';

export type BackupWarning = {
  encrypted: false;
  message: string;
};

export type AkariBackup = {
  app: 'akari';
  schemaVersion: number;
  exportedAt: string;
  warning: BackupWarning;
  data: {
    accounts: unknown[];
    movements: unknown[];
    recurrences: unknown[];
    installments: unknown[];
    groups: unknown[];
    groupExpenses: unknown[];
    transfers: unknown[];
    settings: unknown[];
  };
};

const TABLE_NAMES = [
  'accounts',
  'movements',
  'recurrences',
  'installments',
  'groups',
  'groupExpenses',
  'transfers',
  'settings',
] as const;

type TableName = (typeof TABLE_NAMES)[number];

const WARNING: BackupWarning = {
  encrypted: false,
  message:
    'Esta copia NO está cifrada. Cualquier persona con acceso al archivo puede leer tus datos. El cifrado de la base local llegará en una fase posterior.',
};

export async function exportBackup(db: AkariDB): Promise<AkariBackup> {
  const data = {} as AkariBackup['data'];
  for (const name of TABLE_NAMES) {
    data[name] = await db.table(name).toArray();
  }
  return {
    app: 'akari',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    warning: WARNING,
    data,
  };
}

export function backupToJson(backup: AkariBackup): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}

export function validateBackup(input: unknown): AkariBackup {
  if (!input || typeof input !== 'object') {
    throw new Error('La copia no contiene un objeto de datos válido');
  }
  const candidate = input as Partial<AkariBackup>;
  if (candidate.app !== 'akari') {
    throw new Error('El archivo no pertenece a akari');
  }
  if (
    typeof candidate.schemaVersion !== 'number' ||
    candidate.schemaVersion < 1 ||
    candidate.schemaVersion > SCHEMA_VERSION
  ) {
    throw new Error(
      `La versión del esquema (${String(candidate.schemaVersion)}) no es compatible con esta app (${SCHEMA_VERSION})`,
    );
  }
  if (!candidate.data || typeof candidate.data !== 'object') {
    throw new Error('La copia no contiene datos');
  }
  for (const name of TABLE_NAMES) {
    if (!Array.isArray((candidate.data as Record<string, unknown>)[name])) {
      throw new Error(`La sección "${name}" de la copia no es válida`);
    }
  }
  return candidate as AkariBackup;
}

export async function importBackup(db: AkariDB, input: unknown): Promise<{ imported: number }> {
  const backup = validateBackup(input);
  let imported = 0;
  await db.transaction('rw', db.tables, async () => {
    for (const name of TABLE_NAMES) {
      const table = db.table(name);
      await table.clear();
      const rows = (backup.data as Record<string, unknown[]>)[name] ?? [];
      if (rows.length > 0) {
        await table.bulkPut(rows);
        imported += rows.length;
      }
    }
  });
  const settings = await db.settings.get('app');
  if (!settings) {
    await db.settings.put(defaultSettings);
  }
  return { imported };
}

export async function clearDatabase(db: AkariDB): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const name of TABLE_NAMES) {
      await db.table(name).clear();
    }
  });
}

export const backupTables = TABLE_NAMES;
export type { TableName };
