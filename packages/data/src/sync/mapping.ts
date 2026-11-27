import type {
  Account,
  Group,
  GroupExpense,
  InstallmentPlan,
  Member,
  Movement,
  Recurrence,
  Transfer,
} from '@akari/domain';
import type { CloudRow, SyncTable } from './types.js';

export type SyncEntity =
  | Account
  | Movement
  | Recurrence
  | InstallmentPlan
  | Group
  | GroupExpense
  | Transfer;

function str(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function nullableStr(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function num(value: unknown): number {
  return typeof value === 'number' ? value : Number(value);
}

export function toRemoteRow(
  table: SyncTable,
  entity: SyncEntity,
): Record<string, unknown> {
  switch (table) {
    case 'accounts': {
      const account = entity as Account;
      return {
        id: account.id,
        name: account.name,
        type: account.type,
        currency: account.currency,
        initial_balance_minor: account.initialBalanceMinor,
        tae_bps: account.taeBps ?? null,
        bank_id: account.bankId ?? null,
        include_in_total: account.includeInTotal,
        members: account.members ?? null,
        archived_at: account.archivedAt ?? null,
        created_at: account.createdAt,
      };
    }
    case 'movements': {
      const movement = entity as Movement;
      return {
        id: movement.id,
        account_id: movement.accountId,
        type: movement.type,
        amount_minor: movement.amountMinor,
        currency: movement.currency,
        date: movement.date,
        concept: movement.concept,
        category: movement.category,
        note: movement.note ?? null,
        member_id: movement.memberId ?? null,
        recurrence_id: movement.recurrenceId ?? null,
        installment_plan_id: movement.installmentPlanId ?? null,
        group_expense_id: movement.groupExpenseId ?? null,
        created_at: movement.createdAt,
      };
    }
    case 'recurrences': {
      const recurrence = entity as Recurrence;
      return {
        id: recurrence.id,
        account_id: recurrence.accountId,
        type: recurrence.type,
        amount_minor: recurrence.amountMinor,
        currency: recurrence.currency,
        concept: recurrence.concept,
        category: recurrence.category,
        frequency: recurrence.frequency,
        next_date: recurrence.nextDate,
        end_date: recurrence.endDate ?? null,
        created_at: recurrence.createdAt,
      };
    }
    case 'installments': {
      const plan = entity as InstallmentPlan;
      return {
        id: plan.id,
        account_id: plan.accountId,
        concept: plan.concept,
        total_minor: plan.totalMinor,
        currency: plan.currency,
        installments: plan.installments,
        paid_installments: plan.paidInstallments,
        first_due_date: plan.firstDueDate,
        frequency: plan.frequency,
        created_at: plan.createdAt,
      };
    }
    case 'groups': {
      const group = entity as Group;
      return {
        id: group.id,
        name: group.name,
        currency: group.currency,
        members: group.members,
        settlement_account_id: group.settlementAccountId ?? null,
        created_at: group.createdAt,
      };
    }
    case 'groupExpenses': {
      const expense = entity as GroupExpense;
      return {
        id: expense.id,
        group_id: expense.groupId,
        payer_member_id: expense.payerMemberId,
        amount_minor: expense.amountMinor,
        currency: expense.currency,
        original_amount_minor: expense.originalAmountMinor ?? null,
        original_currency: expense.originalCurrency ?? null,
        exchange_rate: expense.exchangeRate ?? null,
        account_id: expense.accountId ?? null,
        split_mode: expense.splitMode,
        shares: expense.shares,
        date: expense.date,
        concept: expense.concept,
        category: expense.category ?? null,
        created_at: expense.createdAt,
      };
    }
    case 'transfers': {
      const transfer = entity as Transfer;
      return {
        id: transfer.id,
        group_id: transfer.groupId,
        from_member_id: transfer.fromMemberId,
        to_member_id: transfer.toMemberId,
        amount_minor: transfer.amountMinor,
        currency: transfer.currency,
        status: transfer.status,
        settled_at: transfer.settledAt ?? null,
        created_at: transfer.createdAt,
      };
    }
    default:
      throw new Error(`Tabla de sincronización desconocida: ${String(table)}`);
  }
}

export function fromRemoteRow(table: SyncTable, row: CloudRow): SyncEntity {
  switch (table) {
    case 'accounts':
      return {
        id: str(row.id),
        name: str(row.name),
        type: str(row.type) as Account['type'],
        currency: str(row.currency),
        initialBalanceMinor: num(row.initial_balance_minor),
        taeBps: row.tae_bps === null || row.tae_bps === undefined ? null : num(row.tae_bps),
        bankId: nullableStr(row.bank_id) as Account['bankId'],
        includeInTotal: Boolean(row.include_in_total),
        members: (row.members as Member[] | null | undefined) ?? undefined,
        archivedAt: nullableStr(row.archived_at),
        createdAt: str(row.created_at),
        updatedAt: str(row.updated_at ?? row.created_at),
      }
    case 'movements':
      return {
        id: str(row.id),
        accountId: str(row.account_id),
        type: str(row.type) as Movement['type'],
        amountMinor: num(row.amount_minor),
        currency: str(row.currency),
        date: str(row.date),
        concept: str(row.concept),
        category: str(row.category),
        note: row.note === null || row.note === undefined ? undefined : str(row.note),
        memberId: nullableStr(row.member_id),
        recurrenceId:
          row.recurrence_id === null || row.recurrence_id === undefined
            ? undefined
            : str(row.recurrence_id),
        installmentPlanId:
          row.installment_plan_id === null || row.installment_plan_id === undefined
            ? undefined
            : str(row.installment_plan_id),
        groupExpenseId:
          row.group_expense_id === null || row.group_expense_id === undefined
            ? undefined
            : str(row.group_expense_id),
        createdAt: str(row.created_at),
      }
    case 'recurrences':
      return {
        id: str(row.id),
        accountId: str(row.account_id),
        type: str(row.type) as Recurrence['type'],
        amountMinor: num(row.amount_minor),
        currency: str(row.currency),
        concept: str(row.concept),
        category: str(row.category),
        frequency: str(row.frequency) as Recurrence['frequency'],
        nextDate: str(row.next_date),
        endDate: nullableStr(row.end_date),
        createdAt: str(row.created_at),
      }
    case 'installments':
      return {
        id: str(row.id),
        accountId: str(row.account_id),
        concept: str(row.concept),
        totalMinor: num(row.total_minor),
        currency: str(row.currency),
        installments: num(row.installments),
        paidInstallments: num(row.paid_installments),
        firstDueDate: str(row.first_due_date),
        frequency: str(row.frequency) as InstallmentPlan['frequency'],
        createdAt: str(row.created_at),
      }
    case 'groups':
      return {
        id: str(row.id),
        name: str(row.name),
        currency: str(row.currency),
        members: (row.members as Member[] | null | undefined) ?? [],
        settlementAccountId: nullableStr(row.settlement_account_id),
        createdAt: str(row.created_at),
        updatedAt: str(row.updated_at ?? row.created_at),
      }
    case 'groupExpenses':
      return {
        id: str(row.id),
        groupId: str(row.group_id),
        payerMemberId: str(row.payer_member_id),
        amountMinor: num(row.amount_minor),
        currency: str(row.currency),
        originalAmountMinor:
          row.original_amount_minor === null || row.original_amount_minor === undefined
            ? undefined
            : num(row.original_amount_minor),
        originalCurrency:
          row.original_currency === null || row.original_currency === undefined
            ? undefined
            : str(row.original_currency),
        exchangeRate:
          row.exchange_rate === null || row.exchange_rate === undefined
            ? null
            : num(row.exchange_rate),
        accountId: nullableStr(row.account_id),
        splitMode: str(row.split_mode) as GroupExpense['splitMode'],
        shares: (row.shares as GroupExpense['shares'] | null | undefined) ?? [],
        date: str(row.date),
        concept: str(row.concept),
        category:
          row.category === null || row.category === undefined ? undefined : str(row.category),
        createdAt: str(row.created_at),
      }
    case 'transfers':
      return {
        id: str(row.id),
        groupId: str(row.group_id),
        fromMemberId: str(row.from_member_id),
        toMemberId: str(row.to_member_id),
        amountMinor: num(row.amount_minor),
        currency: str(row.currency),
        status: str(row.status) as Transfer['status'],
        settledAt: nullableStr(row.settled_at),
        createdAt: str(row.created_at),
      }
    default:
      throw new Error(`Tabla de sincronización desconocida: ${String(table)}`);
  }
}
