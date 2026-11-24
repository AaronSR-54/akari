export type AccountType = 'personal' | 'joint' | 'deposit';
export type MovementType = 'expense' | 'income';
export type Frequency = 'weekly' | 'monthly' | 'yearly';
export type MemberRole = 'admin' | 'editor' | 'viewer';
export type SplitMode = 'equal' | 'percentage' | 'fixed';
export type TransferStatus = 'pending' | 'settled';
export type ThemePreference = 'light' | 'dark' | 'system';
export type ShellMode = 'sidebar' | 'header';

export type Member = {
  id: string;
  name: string;
  role: MemberRole;
};

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalanceMinor: number;
  taeBps?: number | null;
  includeInTotal: boolean;
  members?: Member[];
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Movement = {
  id: string;
  accountId: string;
  type: MovementType;
  /** Siempre positivo; el tipo determina el signo. */
  amountMinor: number;
  currency: string;
  date: string;
  concept: string;
  category: string;
  note?: string;
  recurrenceId?: string;
  installmentPlanId?: string;
  groupExpenseId?: string;
  createdAt: string;
};

export type Recurrence = {
  id: string;
  accountId: string;
  type: MovementType;
  amountMinor: number;
  currency: string;
  concept: string;
  category: string;
  frequency: Frequency;
  nextDate: string;
  endDate?: string | null;
  createdAt: string;
};

export type InstallmentStatus = 'on-track' | 'overdue' | 'completed';

export type InstallmentPlan = {
  id: string;
  accountId: string;
  concept: string;
  /** Importe total del plan, en unidad menor. */
  totalMinor: number;
  currency: string;
  installments: number;
  paidInstallments: number;
  firstDueDate: string;
  frequency: Frequency;
  createdAt: string;
};

export type Group = {
  id: string;
  name: string;
  currency: string;
  members: Member[];
  settlementAccountId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GroupShare = {
  memberId: string;
  /** Parte en la divisa del grupo, en unidad menor. */
  amountMinor: number;
};

export type GroupExpense = {
  id: string;
  groupId: string;
  payerMemberId: string;
  /** Importe en la divisa del grupo, en unidad menor. */
  amountMinor: number;
  currency: string;
  originalAmountMinor?: number;
  originalCurrency?: string;
  /** Tipo de cambio aplicado en el momento de crear el gasto. */
  exchangeRate?: number | null;
  accountId?: string | null;
  splitMode: SplitMode;
  shares: GroupShare[];
  date: string;
  concept: string;
  category?: string;
  createdAt: string;
};

export type Transfer = {
  id: string;
  groupId: string;
  fromMemberId: string;
  toMemberId: string;
  amountMinor: number;
  currency: string;
  status: TransferStatus;
  settledAt?: string | null;
  createdAt: string;
};

export type Settings = {
  id: 'app';
  theme: ThemePreference;
  shellMode: ShellMode;
  onboardingCompleted: boolean;
  demoLoaded: boolean;
};

export const defaultSettings: Settings = {
  id: 'app',
  theme: 'system',
  shellMode: 'sidebar',
  onboardingCompleted: false,
  demoLoaded: false,
};

export type AccountInput = {
  name: string;
  type: AccountType;
  currency: string;
  initialBalanceMinor: number;
  taeBps?: number | null;
  includeInTotal?: boolean;
  members?: Member[];
};

export type MovementInput = {
  accountId: string;
  type: MovementType;
  amountMinor: number;
  date: string;
  concept: string;
  category: string;
  note?: string;
  repeat?: {
    frequency: Frequency;
    endDate?: string | null;
  } | null;
};

export type GroupExpenseInput = {
  groupId: string;
  payerMemberId: string;
  amountMinor: number;
  originalAmountMinor?: number;
  originalCurrency?: string;
  exchangeRate?: number | null;
  accountId?: string | null;
  splitMode: SplitMode;
  shares: GroupShare[];
  date: string;
  concept: string;
  category?: string;
};
