import Link from 'next/link';
import {
  formatMinor,
  installmentProgress,
  installmentStatus,
  nextInstallment,
  type InstallmentPlan,
} from '@akari/domain';
import { Card, ProgressInstallments, SectionHeader } from '@akari/ui';
import { formatShortDate } from '../lib/format';

export function UpcomingInstallments({ plans }: { plans: InstallmentPlan[] }) {
  if (plans.length === 0) return null;

  return (
    <section aria-labelledby="proximas-cuotas" className="w-full">
      <Card padding="lg" data-panel="installments">
        <SectionHeader
          id="proximas-cuotas"
          title="Próximas cuotas"
          action={
            <span className="text-ui-11 text-text-secondary">
              {plans.length === 1 ? '1 plan activo' : `${plans.length} planes activos`}
            </span>
          }
        />
        <div className="flex flex-col gap-1 pt-4">
          {plans.map((plan) => {
            const progress = installmentProgress(plan);
            const status = installmentStatus(plan);
            const next = nextInstallment(plan);
            if (!next) return null;
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
                  remainingLabel={`Quedan ${progress.total - progress.paid} cuotas · ${formatMinor(progress.remainingAmountMinor, plan.currency)}`}
                  showStatus
                />
                <p className="text-ui-10 text-text-secondary">
                  Próxima: {formatMinor(next.amountMinor, plan.currency)} ·{' '}
                  {formatShortDate(next.dueDate)}
                </p>
              </Link>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
