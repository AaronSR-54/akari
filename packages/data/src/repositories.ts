import {
  defaultSettings,
  toStorageError,
  type Account,
  type Settings,
} from '@akari/domain';
import { SCHEMA_VERSION, type AkariDB } from './db.js';

export async function runStorage<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (process.env.AKARI_DEBUG_STORAGE) console.error('[storage]', error);
    throw toStorageError(error);
  }
}

export function wrapRepository<T extends object>(target: T): T {
  const wrapped = {} as Record<string, unknown>;
  for (const key of Object.keys(target) as Array<keyof T & string>) {
    const value = target[key];
    wrapped[key] =
      typeof value === 'function'
        ? (...args: unknown[]) =>
            runStorage(() => Promise.resolve((value as (...a: unknown[]) => unknown)(...args)))
        : value;
  }
  return wrapped as T;
}

export function createRepositories(db: AkariDB) {
  const accounts = {
    list: async (): Promise<Account[]> =>
      (await db.accounts.toArray()).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    get: async (id: string) => db.accounts.get(id),
    put: async (account: Account) => {
      await db.accounts.put(account);
    },
    delete: async (id: string) => {
      await db.accounts.delete(id);
    },
  };

  const movements = {
    list: async () => db.movements.orderBy('date').reverse().toArray(),
    listByAccount: async (accountId: string) =>
      db.movements.where('accountId').equals(accountId).reverse().sortBy('date'),
    get: async (id: string) => db.movements.get(id),
    put: async (movement: Parameters<typeof db.movements.put>[0]) => {
      await db.movements.put(movement);
    },
    delete: async (id: string) => {
      await db.movements.delete(id);
    },
  };

  const recurrences = {
    list: async () => db.recurrences.toArray(),
    get: async (id: string) => db.recurrences.get(id),
    put: async (recurrence: Parameters<typeof db.recurrences.put>[0]) => {
      await db.recurrences.put(recurrence);
    },
    delete: async (id: string) => {
      await db.recurrences.delete(id);
    },
  };

  const installments = {
    list: async () => db.installments.toArray(),
    listByAccount: async (accountId: string) =>
      db.installments.where('accountId').equals(accountId).toArray(),
    get: async (id: string) => db.installments.get(id),
    put: async (plan: Parameters<typeof db.installments.put>[0]) => {
      await db.installments.put(plan);
    },
    delete: async (id: string) => {
      await db.installments.delete(id);
    },
  };

  const groups = {
    list: async () =>
      (await db.groups.toArray()).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    get: async (id: string) => db.groups.get(id),
    put: async (group: Parameters<typeof db.groups.put>[0]) => {
      await db.groups.put(group);
    },
    delete: async (id: string) => {
      await db.groups.delete(id);
    },
  };

  const groupExpenses = {
    list: async () => db.groupExpenses.orderBy('date').reverse().toArray(),
    listByGroup: async (groupId: string) =>
      db.groupExpenses.where('groupId').equals(groupId).reverse().sortBy('date'),
    get: async (id: string) => db.groupExpenses.get(id),
    put: async (expense: Parameters<typeof db.groupExpenses.put>[0]) => {
      await db.groupExpenses.put(expense);
    },
    delete: async (id: string) => {
      await db.groupExpenses.delete(id);
    },
  };

  const transfers = {
    list: async () => db.transfers.toArray(),
    listByGroup: async (groupId: string) =>
      db.transfers.where('groupId').equals(groupId).toArray(),
    put: async (transfer: Parameters<typeof db.transfers.put>[0]) => {
      await db.transfers.put(transfer);
    },
    delete: async (id: string) => {
      await db.transfers.delete(id);
    },
  };

  const settings = {
    get: async (): Promise<Settings> => {
      const stored = await db.settings.get('app');
      return { ...defaultSettings, ...stored, id: 'app' };
    },
    update: async (patch: Partial<Settings>): Promise<Settings> => {
      const current = await settings.get();
      const next: Settings = { ...current, ...patch, id: 'app' };
      await db.settings.put(next);
      return next;
    },
  };

  return {
    accounts: wrapRepository(accounts),
    movements: wrapRepository(movements),
    recurrences: wrapRepository(recurrences),
    installments: wrapRepository(installments),
    groups: wrapRepository(groups),
    groupExpenses: wrapRepository(groupExpenses),
    transfers: wrapRepository(transfers),
    settings: wrapRepository(settings),
    transaction: <T>(work: () => Promise<T>) => db.transaction('rw', db.tables, work),
  };
}

export type AkariRepositories = ReturnType<typeof createRepositories>;

export { SCHEMA_VERSION };
