import Dexie, { type Table } from 'dexie';
import type {
  Account,
  Group,
  GroupExpense,
  InstallmentPlan,
  Movement,
  Recurrence,
  Settings,
  Transfer,
} from '@akari/domain';

export const SCHEMA_VERSION = 2;

export class AkariDB extends Dexie {
  accounts!: Table<Account, string>;
  movements!: Table<Movement, string>;
  recurrences!: Table<Recurrence, string>;
  installments!: Table<InstallmentPlan, string>;
  groups!: Table<Group, string>;
  groupExpenses!: Table<GroupExpense, string>;
  transfers!: Table<Transfer, string>;
  settings!: Table<Settings, string>;

  constructor(name = 'akari') {
    super(name);

    this.version(1).stores({
      accounts: 'id, type, includeInTotal, archivedAt',
      movements: 'id, accountId, date, type, category, recurrenceId, installmentPlanId',
      recurrences: 'id, accountId, nextDate',
      installments: 'id, accountId',
      groups: 'id',
      groupExpenses: 'id, groupId, date',
      transfers: 'id, groupId, status',
      settings: 'id',
    });

    this.version(2)
      .stores({
        accounts: 'id, type, includeInTotal, archivedAt',
        movements: 'id, accountId, date, type, category, recurrenceId, installmentPlanId, [accountId+date]',
        recurrences: 'id, accountId, nextDate',
        installments: 'id, accountId',
        groups: 'id',
        groupExpenses: 'id, groupId, date, [groupId+date]',
        transfers: 'id, groupId, status',
        settings: 'id',
      })
      .upgrade(async (transaction) => {
        // v2 normaliza la configuración y añade índices compuestos; no borra datos.
        const settings = await transaction.table<Settings>('settings').get('app');
        if (!settings) return;
        const normalized: Settings = {
          ...settings,
          theme: settings.theme === 'dark' || settings.theme === 'light' ? settings.theme : 'system',
          shellMode: settings.shellMode === 'header' ? 'header' : 'sidebar',
        };
        await transaction.table<Settings>('settings').put(normalized);
      });
  }
}

export function openDatabase(name = 'akari'): AkariDB {
  return new AkariDB(name);
}
