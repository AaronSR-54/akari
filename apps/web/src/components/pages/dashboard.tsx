'use client';

import Link from 'next/link';
import { formatMinor, type Overview } from '@akari/domain';
import {
  AccountCard,
  Amount,
  Badge,
  Banner,
  Card,
  Grid,
  MonthBalance,
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
import { appNow } from '../../lib/clock';
import {
  formatDayMonth,
  formatFullDate,
  formatShortDate,
  formatUpdated,
  formatWeekdayDate,
  formatWeekdayFullDate,
} from '../../lib/format';

function greeting() {
  const hour = appNow().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function OverviewBody({ overview }: { overview: Overview }) {
  const currency = overview.accounts[0]?.currency ?? 'EUR';
  const month = overview.month;
  const projected = overview.projections.find((entry) => entry.currency === currency);
  const upcoming = overview.upcoming[0];
  const total = overview.totalBalances.find((entry) => entry.currency === currency);
  const projectedDelta = projected && total ? projected.minor - total.minor : 0;
  const plural = (count: number, one: string, many: string) =>
    `${count} ${count === 1 ? one : many}`;
  const monthDays = month.days.map((day) => ({
    id: day.date,
    label: formatWeekdayDate(day.date),
    balanceMinor: day.balanceMinor,
    total: formatMinor(day.balanceMinor, currency),
    items: day.movements.map((movement) => ({
      id: movement.id,
      label: movement.concept,
      value: formatMinor(
        movement.type === 'income' ? movement.amountMinor : -movement.amountMinor,
        currency,
        { signed: true },
      ),
    })),
    ariaLabel: `${formatWeekdayFullDate(day.date)}: saldo ${formatMinor(day.balanceMinor, currency)} con ${plural(day.count, 'movimiento', 'movimientos')}`,
  }));
  const estimatedTotal = projected
    ? formatMinor(projected.minor, projected.currency)
    : undefined;
  const openingTotal = formatMinor(month.openingBalanceMinor, currency);
  const openingLabel = formatWeekdayDate(month.openingDate);
  const openingAriaLabel = `${formatWeekdayFullDate(month.openingDate)}: saldo de cierre ${openingTotal}`;
  const balanceTone =
    month.netMinor > 0
      ? 'text-status-positive-text'
      : month.netMinor < 0
        ? 'text-status-danger-text'
        : 'text-text-primary';
  const multipleTotals = overview.totalBalances.length > 1;

  return (
    <Stack gap={5.5}>
      <section
        aria-label="Resumen de saldo y gastos del mes"
        className="grid gap-x-6 gap-y-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      >
        <div className="flex flex-col gap-1.5 lg:col-start-1 lg:row-start-1" data-hero="balance">
          <p className="text-ui-11 text-text-secondary">Saldo total</p>
          {overview.totalBalances.length === 0 ? (
            <p className="text-ui-44-bold text-text-tertiary">—</p>
          ) : (
            <div className="flex flex-col">
              {overview.totalBalances.map((entry) => (
                <Amount
                  key={entry.currency}
                  minor={entry.minor}
                  currency={entry.currency}
                  className={multipleTotals ? 'text-ui-28-bold' : 'text-ui-44-bold sm:text-ui-52-bold'}
                />
              ))}
            </div>
          )}
          {projected ? (
            <p
              className={`text-ui-11 ${projectedDelta < 0 ? 'text-status-danger-text' : 'text-status-positive-text'}`}
            >
              {projectedDelta >= 0 ? '+' : '−'}
              {formatMinor(Math.abs(projectedDelta), projected.currency)} estimado a fin de mes
              {projectedDelta < 0 ? ' · revisa tus gastos' : ''}
            </p>
          ) : (
            <p className="text-ui-11 text-text-secondary">Sin proyección</p>
          )}
        </div>
        <div
          className="hero-chart-emerge relative mt-6 h-full min-h-40 lg:col-start-2 lg:row-start-1 lg:mt-0"
          data-hero="month"
        >
          <MonthBalance
            days={monthDays}
            openingBalanceMinor={month.openingBalanceMinor}
            openingLabel={openingLabel}
            openingTotal={openingTotal}
            openingAriaLabel={openingAriaLabel}
            elapsedDays={month.elapsedDays}
            ariaLabel="Saldo del mes por día"
          />
        </div>
        <div data-hero="month-summary" className="relative z-10 lg:col-start-2 lg:row-start-2">
          <StatCard
            className="hero-card-shadow border-t-0"
            label="Balance del mes"
            value={
              <span className={balanceTone}>
                {formatMinor(month.netMinor, currency, { signed: true })}
              </span>
            }
            foot={
              estimatedTotal ? (
                <>
                  Saldo total estimado a fin de mes:{' '}
                  <span className="font-tabular text-text-primary">{estimatedTotal}</span>
                </>
              ) : undefined
            }
          />
        </div>
        <div
          data-hero="upcoming"
          className="mt-5 h-full lg:col-start-1 lg:row-start-2 lg:mt-0"
        >
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
      </section>

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
          <div className="mt-1 flex justify-end">
            <Link
              href="/preguntas"
              className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline"
            >
              Preguntas rápidas →
            </Link>
          </div>
        </Card>
      </section>
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
