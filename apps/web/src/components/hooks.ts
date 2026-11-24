'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import {
  getGroupSummary,
  getOverview,
  getQuickAnswers,
  projectMonthEnd,
  type Account,
  type Group,
  type InstallmentPlan,
  type Movement,
  type Recurrence,
  type Settings,
  type Transfer,
} from '@akari/domain';
import { useData } from './providers';
import { format } from 'date-fns';
import { parseDateOnly } from '../lib/format';

const todayKey = () => format(new Date(), 'yyyy-MM-dd');

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
  const key = todayKey();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return getOverview(repositories, parseDateOnly(key));
  }, [repositories, ready, key]);
}

export function useQuickAnswers() {
  const { repositories, ready } = useData();
  const key = todayKey();
  return useLiveQuery(async () => {
    if (!ready) return undefined;
    return getQuickAnswers(repositories, parseDateOnly(key));
  }, [repositories, ready, key]);
}

export function useAccountSummary(accountId: string) {
  const { repositories, ready } = useData();
  const key = todayKey();
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
