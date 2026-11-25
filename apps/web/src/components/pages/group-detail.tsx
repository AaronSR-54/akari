'use client';

import { useState } from 'react';
import {
  formatMinor,
  settleTransfer,
  updateGroup,
  updateGroupRole,
  type MemberRole,
} from '@akari/domain';
import {
  Badge,
  Banner,
  Button,
  Card,
  Inline,
  SectionHeader,
  SelectField,
  SelectPill,
  Stack,
  StatePage,
  useToast,
} from '@akari/ui';
import { GroupExpenseForm } from '../../components/forms/group-expense-form';
import { useAccounts, useGroupSummary } from '../../components/hooks';
import { PageTitle } from '../../components/page-title';
import { PageHeaderResponsive } from '../../components/page-header-responsive';
import { HeadingMeta } from '../../components/heading-meta';
import { useData } from '../../components/providers';
import { ActionLink } from '../../components/action-link';
import { GroupStatusBadge } from '../../components/group-status-badge';
import { PageSkeleton } from '../../components/page-skeleton';
import { errorMessage, formatLongDate, formatShortDate } from '../../lib/format';
import { memberRoleOptions } from '../../lib/options';

export function GroupDetailScreen({ groupId }: { groupId: string }) {
  const summary = useGroupSummary(groupId);
  const accounts = useAccounts();
  const { repositories } = useData();
  const { toast } = useToast();
  const [savingAccount, setSavingAccount] = useState(false);

  if (summary === undefined || !accounts) {
    return <PageSkeleton />;
  }

  if (summary === null) {
    return (
      <StatePage
        type="empty"
        title="El grupo no existe"
        description="Puede que se haya eliminado o que el enlace ya no sea válido."
        primaryAction={<ActionLink href="/grupos">Volver a grupos</ActionLink>}
      />
    );
  }

  const { group, expenses, settlement, pendingTotalMinor, transfers, settlementAccountName } = summary;
  const admin = group.members.find((member) => member.role === 'admin');

  const changeRole = async (memberId: string, role: MemberRole) => {
    if (!admin) return;
    try {
      await updateGroupRole(repositories, group.id, memberId, role, admin.id);
      toast({ title: 'Rol actualizado', tone: 'success' });
    } catch (error) {
      toast({
        title: 'No se ha podido cambiar el rol',
        description: errorMessage(error, 'Inténtalo de nuevo.'),
        tone: 'error',
      });
    }
  };

  const changeSettlementAccount = async (accountId: string) => {
    setSavingAccount(true);
    try {
      await updateGroup(repositories, group.id, { settlementAccountId: accountId || null });
      toast({ title: 'Cuenta de cobro actualizada', tone: 'success' });
    } catch (error) {
      toast({
        title: 'No se ha podido guardar',
        description: errorMessage(error, 'Inténtalo de nuevo.'),
        tone: 'error',
      });
    } finally {
      setSavingAccount(false);
    }
  };

  const markSettled = async (transfer: {
    fromMemberId: string;
    toMemberId: string;
    amountMinor: number;
  }) => {
    try {
      await settleTransfer(repositories, { groupId: group.id, ...transfer });
      toast({ title: 'Transferencia saldada', tone: 'success' });
    } catch (error) {
      toast({
        title: 'No se ha podido saldar',
        description: errorMessage(error, 'Inténtalo de nuevo.'),
        tone: 'error',
      });
    }
  };

  return (
    <div>
      <PageTitle title={group.name} />
      <Stack gap={5}>
        <PageHeaderResponsive
          title={group.name}
          breadcrumbs={
            <span>
              Grupos <span className="px-1">/</span> {group.name}
            </span>
          }
          actions={
            <>
              <GroupStatusBadge status={summary.status} />
              <ActionLink href="/grupos" variant="secondary">
                Todos los grupos
              </ActionLink>
            </>
          }
        />
        <HeadingMeta
          label={`${group.members.length} miembros`}
          detail={`${group.currency}${settlementAccountName ? ` · cobro en ${settlementAccountName}` : ''}`}
        />

        {summary.status === 'settled' ? (
          <Banner tone="success" title="Grupo saldado">
            No quedan transferencias pendientes. Los gastos originales siguen en el historial.
          </Banner>
        ) : (
          <Banner tone="warning" title={`Quedan ${formatMinor(pendingTotalMinor, group.currency)} por liquidar`}>
            Revisa quién paga a quién y marca las transferencias cuando se hayan hecho.
          </Banner>
        )}

        <GroupExpenseForm group={group} accounts={accounts} />

        <div className="grid items-start gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Card padding="md" className="flex flex-col gap-3">
            <SectionHeader title="Liquidación" />
            {settlement.length === 0 ? (
              <StatePage
                type="success"
                title="Todo saldado"
                description="No hay transferencias pendientes en este grupo."
                className="border-0 bg-transparent py-6"
              />
            ) : (
              <div className="flex flex-col">
                {settlement.map((transfer) => (
                  <div
                    key={`${transfer.fromMemberId}-${transfer.toMemberId}`}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle py-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-ui-12-strong text-text-primary">
                        {summary.memberNames[transfer.fromMemberId]} paga a{' '}
                        {summary.memberNames[transfer.toMemberId]}
                      </p>
                      <p className="text-ui-10 text-text-secondary">
                        {settlementAccountName ? `Cobro en ${settlementAccountName}` : 'Sin cuenta de cobro'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-tabular text-ui-12-strong text-text-primary">
                        {formatMinor(transfer.amountMinor, group.currency)}
                      </span>
                      <Button variant="secondary" size="sm" onClick={() => markSettled(transfer)}>
                        Marcar saldada
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {transfers.length > 0 ? (
              <div className="flex flex-col gap-1">
                <p className="text-ui-10-strong text-text-secondary">Historial de transferencias</p>
                {transfers.map((transfer) => (
                  <Inline key={transfer.id} className="justify-between py-1">
                    <span className="text-ui-11 text-text-secondary">
                      {summary.memberNames[transfer.fromMemberId]} →{' '}
                      {summary.memberNames[transfer.toMemberId]}
                    </span>
                    <span className="text-ui-10 text-text-secondary">
                      {formatMinor(transfer.amountMinor, transfer.currency)} ·{' '}
                      {formatShortDate((transfer.settledAt ?? transfer.createdAt).slice(0, 10))}
                    </span>
                  </Inline>
                ))}
              </div>
            ) : null}
          </Card>

          <div className="flex flex-col gap-4">
            <Card padding="md" className="flex flex-col gap-3">
              <SectionHeader title="Miembros y roles" />
              {group.members.map((member) => (
                <div key={member.id} className="flex items-end gap-2">
                  <p className="min-w-0 flex-1 text-ui-12-strong text-text-primary">
                    {member.name}
                    {member.id === admin?.id ? (
                      <span className="ml-2 text-ui-9 text-text-secondary">(tú)</span>
                    ) : null}
                  </p>
                  <SelectPill
                    ariaLabel={`Rol de ${member.name}`}
                    value={member.role}
                    onChange={(value) => changeRole(member.id, value as MemberRole)}
                    options={memberRoleOptions}
                  />
                </div>
              ))}
              <p className="text-ui-10 text-text-secondary">
                Solo la administración puede cambiar roles; siempre debe quedar al menos una persona
                administradora.
              </p>
            </Card>

            <Card padding="md" className="flex flex-col gap-2.5">
              <SectionHeader title="Cuenta de cobro" />
              <SelectField
                label="Cuenta donde se recibe la liquidación"
                value={group.settlementAccountId ?? ''}
                onValueChange={(value) => void changeSettlementAccount(value)}
                options={[
                  { value: '', label: 'Sin cuenta' },
                  ...accounts.map((account) => ({
                    value: account.id,
                    label: `${account.name} · ${account.currency}`,
                  })),
                ]}
                disabled={savingAccount}
              />
            </Card>
          </div>
        </div>

        <Card padding="md" className="flex flex-col gap-2.5">
          <SectionHeader title="Gastos del grupo" action={<Badge tone="neutral">{expenses.length}</Badge>} />
          {expenses.length === 0 ? (
            <StatePage
              type="empty"
              title="Todavía no hay gastos"
              description="Registra el primero para empezar a repartir."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            <div className="flex flex-col">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-ui-12-strong text-text-primary">{expense.concept}</p>
                    <p className="text-ui-10 text-text-secondary">
                      Pagó {summary.memberNames[expense.payerMemberId]} ·{' '}
                      {formatLongDate(expense.date)} · {expense.shares.length} participantes
                    </p>
                    {expense.originalCurrency ? (
                      <p className="text-ui-9 text-text-secondary">
                        Original: {formatMinor(expense.originalAmountMinor ?? 0, expense.originalCurrency)} ·
                        tipo {expense.exchangeRate}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <GroupStatusBadge status={summary.status} />
                    <span className="font-tabular text-ui-12-strong text-text-primary">
                      {formatMinor(expense.amountMinor, expense.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Stack>
    </div>
  );
}
