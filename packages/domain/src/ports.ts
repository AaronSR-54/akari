import type {
  Account,
  Group,
  GroupExpense,
  InstallmentPlan,
  Movement,
  Recurrence,
  Settings,
  Transfer,
} from './types.js';

export interface AccountRepository {
  list(): Promise<Account[]>;
  get(id: string): Promise<Account | undefined>;
  put(account: Account): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface MovementRepository {
  list(): Promise<Movement[]>;
  listByAccount(accountId: string): Promise<Movement[]>;
  get(id: string): Promise<Movement | undefined>;
  put(movement: Movement): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface RecurrenceRepository {
  list(): Promise<Recurrence[]>;
  get(id: string): Promise<Recurrence | undefined>;
  put(recurrence: Recurrence): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface InstallmentRepository {
  list(): Promise<InstallmentPlan[]>;
  listByAccount(accountId: string): Promise<InstallmentPlan[]>;
  get(id: string): Promise<InstallmentPlan | undefined>;
  put(plan: InstallmentPlan): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface GroupRepository {
  list(): Promise<Group[]>;
  get(id: string): Promise<Group | undefined>;
  put(group: Group): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface GroupExpenseRepository {
  list(): Promise<GroupExpense[]>;
  listByGroup(groupId: string): Promise<GroupExpense[]>;
  get(id: string): Promise<GroupExpense | undefined>;
  put(expense: GroupExpense): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface TransferRepository {
  list(): Promise<Transfer[]>;
  listByGroup(groupId: string): Promise<Transfer[]>;
  put(transfer: Transfer): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface SettingsRepository {
  get(): Promise<Settings>;
  update(patch: Partial<Settings>): Promise<Settings>;
}

export type Repositories = {
  accounts: AccountRepository;
  movements: MovementRepository;
  recurrences: RecurrenceRepository;
  installments: InstallmentRepository;
  groups: GroupRepository;
  groupExpenses: GroupExpenseRepository;
  transfers: TransferRepository;
  settings: SettingsRepository;
  /** Opcional: ejecuta varias escrituras de forma atómica. */
  transaction?: <T>(work: () => Promise<T>) => Promise<T>;
};
