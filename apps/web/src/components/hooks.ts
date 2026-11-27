'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';
import {
  buildNotifications,
  getGroupSummary,
  getOverview,
  getQuickAnswers,
  projectMonthEnd,
  type Account,
  type Group,
  type GroupExpense,
  type InstallmentPlan,
  type Movement,
  type Recurrence,
  type Settings,
  type Transfer,
  type AppNotification,
} from '@akari/domain';
import { useData } from './providers';
import { parseDateOnly } from '../lib/format';
import { appTodayKey } from '../lib/clock';
import { CURRENT_USER } from '../lib/current-user';

export function useSettings(): Settings | undefined {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return repositories.settings.get();
  }, [repositories, ready]);
}

export function useAccounts(): Account[] | undefined {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return repositories.accounts.list();
  }, [repositories, ready]);
}

export function useAccount(id: string): Account | undefined | null {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    if (!id) return null;
    return (await repositories.accounts.get(id)) ?? null;
  }, [repositories, ready, id]);
}

export function useGroup(id: string): Group | undefined | null {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    if (!id) return null;
    return (await repositories.groups.get(id)) ?? null;
  }, [repositories, ready, id]);
}

export function useMovements(accountId?: string): Movement[] | undefined {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return accountId ? repositories.movements.listByAccount(accountId) : repositories.movements.list();
  }, [repositories, ready, accountId]);
}

export function useMovement(id: string): Movement | undefined | null {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    if (!id) return null;
    return (await repositories.movements.get(id)) ?? null;
  }, [repositories, ready, id]);
}

export function useGroupExpense(id: string): GroupExpense | undefined | null {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    if (!id) return null;
    return (await repositories.groupExpenses.get(id)) ?? null;
  }, [repositories, ready, id]);
}

export function useRecurrences(accountId?: string): Recurrence[] | undefined {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    const recurrences = await repositories.recurrences.list();
    return accountId
      ? recurrences.filter((recurrence) => recurrence.accountId === accountId)
      : recurrences;
  }, [repositories, ready, accountId]);
}

export function useInstallments(accountId?: string): InstallmentPlan[] | undefined {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return accountId
      ? repositories.installments.listByAccount(accountId)
      : repositories.installments.list();
  }, [repositories, ready, accountId]);
}

export function useInstallmentDetail(id: string) {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    if (!id) return null;
    const plan = await repositories.installments.get(id);
    if (!plan) return null;
    const account = await repositories.accounts.get(plan.accountId);
    return { plan, account };
  }, [repositories, ready, id]);
}

export function useTransfers(groupId?: string): Transfer[] | undefined {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return groupId ? repositories.transfers.listByGroup(groupId) : repositories.transfers.list();
  }, [repositories, ready, groupId]);
}

export function useGroups(): Group[] | undefined {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return repositories.groups.list();
  }, [repositories, ready]);
}

export function useGroupSummary(groupId: string) {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return getGroupSummary(repositories, groupId);
  }, [repositories, ready, groupId]);
}

export function useGroupExpenses(groupId: string) {
  const { repositories, ready } = useData();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return repositories.groupExpenses.listByGroup(groupId);
  }, [repositories, ready, groupId]);
}

export function useOverview() {
  const { repositories, ready } = useData();
  const key = appTodayKey();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return getOverview(repositories, parseDateOnly(key));
  }, [repositories, ready, key]);
}

export function useNotifications(): AppNotification[] | undefined {
  const { repositories, ready } = useData();
  const key = appTodayKey();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    const [accounts, movements, recurrences, installments, groups, groupExpenses, transfers, settings] =
      await Promise.all([
        repositories.accounts.list(),
        repositories.movements.list(),
        repositories.recurrences.list(),
        repositories.installments.list(),
        repositories.groups.list(),
        repositories.groupExpenses.list(),
        repositories.transfers.list(),
        repositories.settings.get(),
      ]);
    return buildNotifications({
      accounts,
      movements,
      recurrences,
      installments,
      groups,
      groupExpenses,
      transfers,
      today: parseDateOnly(key),
      currentMemberName: CURRENT_USER.name,
      seenIds: settings.seenNotificationIds,
    });
  }, [repositories, ready, key]);
}

export function useMarkNotificationsSeen() {
  const { repositories } = useData();
  return useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      const settings = await repositories.settings.get();
      const merged = [...new Set([...(settings.seenNotificationIds ?? []), ...ids])].slice(-100);
      await repositories.settings.update({ seenNotificationIds: merged });
    },
    [repositories],
  );
}

export function useQuickAnswers() {
  const { repositories, ready } = useData();
  const key = appTodayKey();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return getQuickAnswers(repositories, parseDateOnly(key));
  }, [repositories, ready, key]);
}

export function useAccountSummary(accountId: string) {
  const { repositories, ready } = useData();
  const key = appTodayKey();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    const [account, movements, recurrences, plans] = await Promise.all([
      repositories.accounts.get(accountId),
      repositories.movements.listByAccount(accountId),
      repositories.recurrences.list(),
      repositories.installments.listByAccount(accountId),
    ]);
    if (!account) return null;
    return {
      account,
      movements,
      recurrences: recurrences.filter((recurrence) => recurrence.accountId === accountId),
      plans,
      projected: projectMonthEnd(
        account,
        movements,
        recurrences,
        plans,
        parseDateOnly(key),
      ),
    };
  }, [repositories, ready, accountId, key]);
}
