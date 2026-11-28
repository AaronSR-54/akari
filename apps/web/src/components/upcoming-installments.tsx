import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  formatMinor,
  installmentProgress,
  installmentStatus,
  nextInstallment,
  type InstallmentPlan,
} from '@akari/domain';
import { Card, ProgressInstallments, SectionHeader } from '@akari/ui';
import { formatShortDate } from '../lib/format';

export function UpcomingInstallments({
  plans,
  action,
  emptyMessage,
}: {
  plans: InstallmentPlan[];
  action?: ReactNode;
  emptyMessage?: string;
}) {
  if (plans.length === 0 && !emptyMessage) return null;

  const activePlans = plans.filter((plan) => nextInstallment(plan)).length;

  return (
    <section aria-labelledby="proximas-cuotas" className="w-full">
      <Card padding="lg" data-panel="installments">
        <SectionHeader
          id="proximas-cuotas"
          title="Próximas cuotas"
          action={
            <div className="flex flex-wrap items-center justify-end gap-3">
              <span className="text-ui-11 text-text-secondary">
                {activePlans === 1 ? '1 plan activo' : `${activePlans} planes activos`}
              </span>
              {action}
            </div>
          }
        />
        {plans.length === 0 ? (
          <p className="pt-4 text-ui-11 text-text-secondary">{emptyMessage}</p>
        ) : (
          <div className="flex flex-col gap-1 pt-4">
            {plans.map((plan) => {
              const progress = installmentProgress(plan);
              const status = installmentStatus(plan);
              const next = nextInstallment(plan);
              return (
                <Link
                  key={plan.id}
                  href={`/cuotas/${plan.id}`}
                  data-installment-plan={plan.id}
                  aria-label={`Ver detalle de ${plan.concept}`}
                  className="-mx-3 flex flex-col gap-2.5 rounded-lg px-3 py-3 transition-colors duration-fast hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
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
                    showStatus
                  />
                  <p className="text-ui-10 text-text-secondary">
                    {next
                      ? `Próxima: ${formatMinor(next.amountMinor, plan.currency)} · ${formatShortDate(next.dueDate)}`
                      : 'Todas las cuotas registradas'}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
}
