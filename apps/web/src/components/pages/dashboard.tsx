'use client';

import Link from 'next/link';
import { formatMinor, type Overview } from '@akari/domain';
import {
  AccountCard,
  Amount,
  Badge,
  Banner,
  Card,
  ChartBars,
  Grid,
  MovementRow,
  PageHeader,
  SectionHeader,
  Stack,
  StatCard,
  StatePage,
} from '@akari/ui';
import { useOverview } from '../hooks';
import { PageTitle } from '../page-title';
import { ActionLink } from '../action-link';
import { PageSkeleton } from '../page-skeleton';
import {
  formatDayMonth,
  formatFullDate,
  formatMonthShort,
  formatShortDate,
  formatUpdated,
  formatWeekdayLabels,
} from '../../lib/format';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function OverviewBody({ overview }: { overview: Overview }) {
  const currency = overview.accounts[0]?.currency ?? 'EUR';
  const monthExpense = overview.monthExpense.find((entry) => entry.currency === currency);
  const projected = overview.projections.find((entry) => entry.currency === currency);
  const upcoming = overview.upcoming[0];
  const variation = overview.comparison.changePct;
  const total = overview.totalBalances.find((entry) => entry.currency === currency);
  const projectedDelta = projected && total ? projected.minor - total.minor : 0;
  const monthName = formatMonthShort();
  const weekLabels = formatWeekdayLabels(overview.dailyExpenses.length);

  return (
    <Stack gap={5.5}>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Saldo total"
          value={
            overview.totalBalances.length === 0 ? (
              '—'
            ) : (
              <span className="flex flex-col">
                {overview.totalBalances.map((entry) => (
                  <Amount key={entry.currency} minor={entry.minor} currency={entry.currency} />
                ))}
              </span>
            )
          }
          foot={
            projected ? (
              <>
                {projectedDelta >= 0 ? '+' : '−'}
                {formatMinor(Math.abs(projectedDelta), projected.currency)} estimado a fin de mes
              </>
            ) : (
              'Sin proyección'
            )
          }
          tone={projectedDelta < 0 ? 'negative' : 'positive'}
        />
        <StatCard
          label={`Gastos de ${monthName}`}
          value={formatMinor(monthExpense?.minor ?? 0, currency)}
          foot={
            variation === null
              ? 'Sin comparación del mes anterior'
              : `${variation >= 0 ? '+' : ''}${variation} % frente al mes anterior`
          }
        />
        <StatCard
          label={upcoming?.overdue ? 'Cuota vencida' : 'Próximo pago'}
          value={upcoming ? formatMinor(upcoming.amountMinor, upcoming.currency) : 'Sin pagos'}
          foot={
            upcoming
              ? `${upcoming.label} · ${formatShortDate(upcoming.date)}`
              : 'Nada en los próximos 14 días'
          }
          tone={upcoming?.overdue ? 'negative' : 'default'}
        />
      </div>

      <section aria-labelledby="cuentas">
        <SectionHeader
          id="cuentas"
          title="Cuentas"
          action={
            <Link
              href="/cuentas/nueva"
              className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline"
            >
              Gestionar cuentas
            </Link>
          }
        />
        <Grid columns={3} className="mt-2.5">
          {overview.accounts.map((account) => (
            <Link
              key={account.id}
              href={`/cuentas/${account.id}`}
              className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              <AccountCard
                name={account.name}
                type={account.type}
                currency={account.currency}
                balanceMinor={overview.balancesByAccount[account.id]?.minor ?? 0}
                badge={
                  <Badge tone={account.includeInTotal ? 'positive' : 'neutral'}>
                    {account.includeInTotal ? 'Al día' : 'Excluida'}
                  </Badge>
                }
                meta={formatUpdated(account.updatedAt)}
              />
            </Link>
          ))}
        </Grid>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.06fr_1fr]">
        <section aria-labelledby="ultimos">
          <Card padding="md" className="flex h-full flex-col gap-2.5">
            <SectionHeader
              id="ultimos"
              title="Últimos movimientos"
              action={
                <Link
                  href="/movimientos"
                  className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline"
                >
                  Ver todos
                </Link>
              }
            />
            {overview.recentMovements.length === 0 ? (
              <StatePage
                type="empty"
                title="Todavía no hay movimientos"
                description="Registra el primero para ver tu resumen cobrar vida."
                primaryAction={<ActionLink href="/movimientos/nuevo">Añadir movimiento</ActionLink>}
                className="border-0 bg-transparent py-6"
              />
            ) : (
              <div className="flex flex-col">
                {overview.recentMovements.map((movement) => (
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
        </section>

        <div className="flex flex-col gap-4">
          <Card padding="md" className="flex flex-col gap-2.5">
            <ChartBars
              title="Gastos por semana"
              total={formatMinor(monthExpense?.minor ?? 0, currency)}
              values={overview.dailyExpenses.map((day) => day.totalMinor)}
              labels={weekLabels}
              ariaLabel={`Gastos por semana de ${monthName}`}
            />
            <Link
              href="/preguntas"
              className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline"
            >
              Preguntas rápidas →
            </Link>
          </Card>
          {upcoming ? (
            <Banner
              tone={upcoming.overdue ? 'error' : 'warning'}
              title={upcoming.overdue ? 'La cuota está vencida' : 'La cuota vence pronto'}
              action={
                <Link
                  href={`/movimientos/nuevo?cuenta=${upcoming.accountId}`}
                  className="text-ui-12-strong underline underline-offset-4"
                >
                  Pagar ahora
                </Link>
              }
            >
              {formatMinor(upcoming.amountMinor, upcoming.currency)} de {upcoming.label} ·{' '}
              {formatDayMonth(upcoming.date)}.
            </Banner>
          ) : null}
        </div>
      </div>
    </Stack>
  );
}

export function DashboardScreen() {
  const overview = useOverview();

  if (!overview) {
    return <PageSkeleton variant="cards" />;
  }

  if (overview.accounts.length === 0) {
    return (
      <Stack gap={5.5}>
        <PageHeader
          title={`${greeting()}, Marta`}
          meta="Aún no hay cuentas · datos en este dispositivo"
          actions={
            <>
              <ActionLink href="/cuentas/nueva">Añadir cuenta</ActionLink>
              <ActionLink href="/movimientos/nuevo" variant="secondary">
                Añadir movimiento
              </ActionLink>
            </>
          }
        />
        <StatePage
          type="empty"
          title="Tu resumen empieza con una cuenta"
          description="Crea una cuenta personal, conjunta o de depósito y registra su saldo inicial."
          primaryAction={<ActionLink href="/cuentas/nueva">Añadir cuenta</ActionLink>}
        />
      </Stack>
    );
  }

  return (
    <Stack gap={5.5}>
      <PageTitle title="Resumen" />
      <PageHeader
        title={`${greeting()}, Marta`}
        meta={`${formatFullDate()} · ${overview.accounts.length} cuentas en este dispositivo`}
        actions={
          <>
            <ActionLink href="/ajustes" variant="secondary">
              Exportar
            </ActionLink>
            <ActionLink href="/movimientos/nuevo">Añadir movimiento</ActionLink>
          </>
        }
      />
      <OverviewBody overview={overview} />
    </Stack>
  );
}
