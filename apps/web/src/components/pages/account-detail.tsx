'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  calculateAccountBalance,
  deleteAccount,
  formatMinor,
  installmentProgress,
  installmentStatus,
  monthExpenses,
  monthOverMonthExpenses,
  nextInstallment,
  registerInstallment,
  dailyTotals,
} from '@akari/domain';
import {
  Badge,
  Banner,
  Button,
  Card,
  ChartBars,
  InfoRow,
  Modal,
  MovementRow,
  PageHeader,
  ProgressInstallments,
  SectionHeader,
  StatCard,
  Stack,
  StatePage,
  useToast,
} from '@akari/ui';
import { useAccountSummary, useRecurrences } from '../../components/hooks';
import { PageTitle } from '../../components/page-title';
import { useData } from '../../components/providers';
import { ActionLink } from '../../components/action-link';
import { PageSkeleton } from '../../components/page-skeleton';
import {
  errorMessage,
  formatLongDate,
  formatMonthShort,
  formatShortDate,
  formatUpdated,
  formatWeekdayLabels,
} from '../../lib/format';
import { appNow, appTodayKey } from '../../lib/clock';
import { accountTypeOptions } from '../../lib/options';

const typeLabel = Object.fromEntries(accountTypeOptions.map((option) => [option.value, option.label]));

export function AccountDetailScreen({ accountId }: { accountId: string }) {
  const summary = useAccountSummary(accountId);
  const recurrences = useRecurrences(accountId);
  const { repositories } = useData();
  const { toast } = useToast();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  if (summary === undefined) {
    return <PageSkeleton />;
  }

  if (summary === null) {
    return (
      <StatePage
        type="empty"
        title="La cuenta no existe"
        description="Puede que se haya eliminado o que el enlace ya no sea válido."
        primaryAction={<ActionLink href="/">Volver al resumen</ActionLink>}
      />
    );
  }

  const { account, movements, plans, projected } = summary;
  const balance = calculateAccountBalance(account, movements, appTodayKey());
  const month = appNow();
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  const monthMovements = movements.filter((movement) => movement.date.startsWith(monthKey));
  const monthExpense = monthExpenses(movements, month).find((entry) => entry.currency === account.currency);
  const comparison = monthOverMonthExpenses(movements, month, account.currency);
  const daily = dailyTotals(movements, account.currency, 7, month);
  const delta = projected.minor - balance.minor;

  const remove = async () => {
    setBusy(true);
    try {
      await deleteAccount(repositories, account.id);
      toast({ title: 'Cuenta eliminada', tone: 'success' });
      router.push('/');
    } catch (error) {
      toast({
        title: 'No se ha podido eliminar',
        description: errorMessage(error, 'Inténtalo de nuevo.'),
        tone: 'error',
      });
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  const payInstallment = async (planId: string) => {
    try {
      await registerInstallment(repositories, planId);
      toast({ title: 'Cuota registrada', tone: 'success' });
    } catch (error) {
      toast({
        title: 'No se ha podido registrar',
        description: errorMessage(error, 'Inténtalo de nuevo.'),
        tone: 'error',
      });
    }
  };

  return (
    <div>
      <PageTitle title={account.name} />
      <Stack gap={5.5}>
        <PageHeader
          title={account.name}
          breadcrumbs={
            <span>
              Resumen <span className="px-1">/</span> Cuentas <span className="px-1">/</span>{' '}
              {account.name}
            </span>
          }
          meta={`${typeLabel[account.type] ?? account.type} · ${account.currency} · ${formatUpdated(account.updatedAt)}`}
          actions={
            <>
              <ActionLink href={`/cuentas/${account.id}/editar`} variant="secondary">
                Editar
              </ActionLink>
              <ActionLink href={`/movimientos/nuevo?cuenta=${account.id}`}>
                Añadir movimiento
              </ActionLink>
              <Button variant="tertiary" size="sm" onClick={() => setConfirmDelete(true)}>
                Eliminar
              </Button>
            </>
          }
        />

        {projected.minor < 0 ? (
          <Banner tone="warning" title="El saldo estimado a fin de mes es negativo">
            Revisa las cuotas y los pagos recurrentes antes de que llegue el vencimiento.
          </Banner>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Saldo real" value={formatMinor(balance.minor, account.currency)} foot="Hoy" size="md" />
          <StatCard
            label="Saldo estimado a fin de mes"
            value={formatMinor(projected.minor, account.currency)}
            foot={
              delta === 0
                ? 'Sin cambios previstos'
                : `${delta > 0 ? '+' : '−'}${formatMinor(Math.abs(delta), account.currency)} previstos`
            }
            tone={projected.minor < 0 ? 'negative' : 'default'}
            size="md"
          />
          <StatCard
            label="Movimientos del mes"
            value={monthMovements.length}
            foot={
              comparison.changePct === null
                ? `${formatMonthShort(month)} · sin comparación`
                : `${comparison.changePct >= 0 ? '+' : ''}${comparison.changePct} % frente al mes anterior`
            }
            size="md"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.06fr_1fr]">
          <div className="flex flex-col gap-4">
            <Card padding="md" className="flex flex-col gap-3">
              <SectionHeader
                title="Evolución del mes"
                action={
                  <span className="text-ui-11-strong text-accent-strong">
                    Comparar con {formatMonthShort(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  </span>
                }
              />
              <ChartBars
                title="Gastos por semana"
                total={formatMinor(monthExpense?.minor ?? 0, account.currency)}
                values={daily.map((day) => day.totalMinor)}
                labels={formatWeekdayLabels(daily.length)}
                ariaLabel={`Gasto de ${account.name} por semana`}
              />
            </Card>

            <Card padding="md" className="flex flex-col gap-2.5">
              <SectionHeader
                title="Últimos movimientos"
                action={
                  <Link
                    href={`/movimientos?cuenta=${account.id}`}
                    className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline"
                  >
                    Ver todos
                  </Link>
                }
              />
              {movements.length === 0 ? (
                <StatePage
                  type="empty"
                  title="Esta cuenta no tiene movimientos"
                  description="Añade el primero para empezar a seguir su saldo."
                  primaryAction={
                    <ActionLink href={`/movimientos/nuevo?cuenta=${account.id}`}>
                      Añadir movimiento
                    </ActionLink>
                  }
                  className="border-0 bg-transparent py-6"
                />
              ) : (
                <div className="flex flex-col">
                  {movements.slice(0, 5).map((movement) => (
                    <MovementRow
                      key={movement.id}
                      concept={movement.concept}
                      category={movement.category}
                      dateLabel={formatShortDate(movement.date)}
                      amountMinor={movement.amountMinor}
                      currency={movement.currency}
                      type={movement.type}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card padding="md" className="flex flex-col gap-2.5">
              <h2 className="text-ui-13-strong text-text-primary">Detalles de la cuenta</h2>
              <InfoRow label="Tipo" value={typeLabel[account.type] ?? account.type} />
              <InfoRow label="Divisa" value={account.currency} />
              <InfoRow
                label="Titular"
                value={account.members?.map((member) => member.name).join(', ') || 'Cuenta local'}
              />
              <InfoRow label="Incluida en el saldo total" value={account.includeInTotal ? 'Sí' : 'No'} />
              {account.type === 'deposit' ? (
                <InfoRow label="TAE" value={`${((account.taeBps ?? 0) / 100).toFixed(2)} %`} />
              ) : null}
              <InfoRow label="Creada" value={formatLongDate(account.createdAt.slice(0, 10))} />
            </Card>

            {plans.length > 0 ? (
              <Card padding="md" className="flex flex-col gap-4">
                <h2 className="text-ui-13-strong text-text-primary">Plazos</h2>
                {plans.map((plan) => {
                  const progress = installmentProgress(plan);
                  const status = installmentStatus(plan);
                  const next = nextInstallment(plan);
                  return (
                    <div key={plan.id} className="flex flex-col gap-2">
                      <ProgressInstallments
                        paid={progress.paid}
                        total={progress.total}
                        label={plan.concept}
                        status={status}
                        percent={progress.percent}
                        remainingLabel={
                          next
                            ? `Quedan ${progress.total - progress.paid} cuotas · ${formatMinor(progress.remainingAmountMinor, plan.currency)}`
                            : 'Completado'
                        }
                      />
                      {next ? (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-ui-10 text-text-secondary">
                            Próxima: {formatMinor(next.amountMinor, plan.currency)} ·{' '}
                            {formatShortDate(next.dueDate)}
                          </p>
                          <Button variant="secondary" size="sm" onClick={() => payInstallment(plan.id)}>
                            Registrar cuota
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </Card>
            ) : null}

            {recurrences && recurrences.length > 0 ? (
              <Card padding="md" className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-ui-13-strong text-text-primary">Recurrentes</h2>
                  <Badge tone="neutral">{recurrences.length}</Badge>
                </div>
                {recurrences.map((recurrence) => (
                  <div key={recurrence.id} className="flex items-center justify-between gap-3 py-1">
                    <span className="min-w-0 truncate text-ui-12 text-text-primary">
                      {recurrence.concept}
                    </span>
                    <span className="shrink-0 font-tabular text-ui-12-strong">
                      {formatMinor(recurrence.amountMinor, recurrence.currency)}
                    </span>
                  </div>
                ))}
              </Card>
            ) : null}
          </div>
        </div>
      </Stack>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminar cuenta"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button onClick={remove} loading={busy}>
              Eliminar cuenta
            </Button>
          </>
        }
      >
        {movements.length > 0
          ? 'Esta cuenta tiene movimientos. No se puede eliminar mientras existan; archívala o elimina sus movimientos primero.'
          : 'La cuenta se eliminará de este navegador. Esta acción no se puede deshacer.'}
      </Modal>
    </div>
  );
}
