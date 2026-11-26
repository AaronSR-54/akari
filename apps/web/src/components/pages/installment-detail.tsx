'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  formatMinor,
  installmentAmounts,
  installmentDueDate,
  installmentProgress,
  installmentStatus,
  nextInstallment,
  registerInstallment,
} from '@akari/domain';
import {
  Badge,
  Button,
  Card,
  ProgressInstallments,
  SectionHeader,
  Stack,
  StatCard,
  StatePage,
  useToast,
} from '@akari/ui';
import { useInstallmentDetail } from '../hooks';
import { useData } from '../providers';
import { ActionLink } from '../action-link';
import { PageTitle } from '../page-title';
import { PageHeaderResponsive } from '../page-header-responsive';
import { HeadingMeta } from '../heading-meta';
import { PageSkeleton } from '../page-skeleton';
import { appTodayKey } from '../../lib/clock';
import { errorMessage, formatLongDate } from '../../lib/format';

const statusLabel = {
  'on-track': 'Al día',
  overdue: 'Atrasado',
  completed: 'Completado',
} as const;

export function InstallmentDetailScreen({ planId }: { planId: string }) {
  const detail = useInstallmentDetail(planId);
  const { repositories } = useData();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  if (detail === undefined) return <PageSkeleton />;

  if (detail === null) {
    return (
      <StatePage
        type="empty"
        title="El pago a plazos no existe"
        description="Puede que se haya eliminado o que el enlace ya no sea válido."
        primaryAction={<ActionLink href="/">Volver al resumen</ActionLink>}
      />
    );
  }

  const { plan, account } = detail;
  const progress = installmentProgress(plan);
  const status = installmentStatus(plan);
  const next = nextInstallment(plan);
  const amounts = installmentAmounts(plan);
  const today = appTodayKey();

  const register = async () => {
    setBusy(true);
    try {
      await registerInstallment(repositories, plan.id);
      toast({ title: 'Cuota registrada', tone: 'success' });
    } catch (error) {
      toast({
        title: 'No se ha podido registrar',
        description: errorMessage(error, 'Inténtalo de nuevo.'),
        tone: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageTitle title={plan.concept} />
      <Stack gap={5.5}>
        <PageHeaderResponsive
          title={plan.concept}
          breadcrumbs={
            <span>
              Resumen <span className="px-1">/</span> Cuotas <span className="px-1">/</span>{' '}
              {plan.concept}
            </span>
          }
          actions={
            <>
              {account ? (
                <ActionLink href={`/cuentas/${account.id}`} variant="secondary">
                  Ver cuenta
                </ActionLink>
              ) : null}
              {next ? (
                <Button onClick={() => void register()} loading={busy}>
                  Registrar cuota
                </Button>
              ) : null}
            </>
          }
        />
        <HeadingMeta
          label="Pago a plazos"
          detail={`${plan.installments} cuotas · ${formatMinor(plan.totalMinor, plan.currency)}`}
        />

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Card padding="md" className="flex flex-col gap-4">
            <SectionHeader
              title="Progreso"
              action={
                <Badge
                  tone={
                    status === 'overdue' ? 'negative' : status === 'completed' ? 'positive' : 'neutral'
                  }
                >
                  {statusLabel[status]}
                </Badge>
              }
            />
            <ProgressInstallments
              paid={progress.paid}
              total={progress.total}
              label={plan.concept}
              status={status}
              percent={progress.percent}
              remainingLabel={`Quedan ${progress.total - progress.paid} cuotas · ${formatMinor(progress.remainingAmountMinor, plan.currency)}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Pagado"
                value={formatMinor(progress.paidAmountMinor, plan.currency)}
                foot={`${progress.paid} de ${progress.total} cuotas`}
                size="md"
              />
              <StatCard
                label="Pendiente"
                value={formatMinor(progress.remainingAmountMinor, plan.currency)}
                foot={`${progress.total - progress.paid} cuotas`}
                size="md"
              />
            </div>
            {next ? (
              <div className="flex flex-col gap-1 rounded-xl bg-surface-sunken p-4">
                <p className="text-ui-11 text-text-secondary">Próxima cuota</p>
                <p className="font-tabular text-ui-28-bold text-text-primary">
                  {formatMinor(next.amountMinor, plan.currency)}
                </p>
                <p className="text-ui-11 text-text-secondary">
                  Cuota {next.number} de {plan.installments} · {formatLongDate(next.dueDate)}
                </p>
              </div>
            ) : (
              <p className="rounded-xl bg-status-positive-soft p-4 text-ui-12 text-status-positive-text">
                Plan completado. No quedan cuotas pendientes.
              </p>
            )}
            {account ? (
              <p className="text-ui-11 text-text-secondary">
                Cuenta:{' '}
                <Link
                  href={`/cuentas/${account.id}`}
                  className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline"
                >
                  {account.name}
                </Link>
              </p>
            ) : null}
          </Card>

          <Card padding="md" className="flex flex-col gap-3">
            <SectionHeader title="Calendario de cuotas" />
            <div className="flex flex-col gap-2">
              {amounts.map((amount, index) => {
                const dueDate = installmentDueDate(plan, index);
                const paid = index < plan.paidInstallments;
                const overdue = !paid && dueDate < today;
                return (
                  <div
                    key={`${plan.id}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-surface-sunken px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-ui-12-strong text-text-primary">Cuota {index + 1}</p>
                      <p className="truncate text-ui-10 text-text-secondary">
                        {formatLongDate(dueDate)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-tabular text-ui-12-strong text-text-primary">
                        {formatMinor(amount, plan.currency)}
                      </span>
                      <Badge tone={paid ? 'positive' : overdue ? 'negative' : 'neutral'}>
                        {paid ? 'Pagada' : overdue ? 'Vencida' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </Stack>
    </div>
  );
}
