'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { formatMinor, type Overview } from '@akari/domain';
import {
  AccountCard,
  Amount,
  Badge,
  Banner,
  Card,
  Grid,
  Icon,
  MonthBalance,
  MovementRow,
  SectionHeader,
  Stack,
  StatePage,
} from '@akari/ui';
import { useOverview } from '../hooks';
import { PageTitle } from '../page-title';
import { PageHeaderResponsive } from '../page-header-responsive';
import { ActionLink } from '../action-link';
import { PageSkeleton } from '../page-skeleton';
import { MovementDetailDialog } from '../movement-detail-dialog';
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
  const [detailId, setDetailId] = useState<string | null>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const left = leftRef.current;
    const chart = chartRef.current;
    const balance = balanceRef.current;
    const quick = quickRef.current;
    if (!left || !chart || !balance || !quick) return;
    const update = () => {
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        chart.style.height = '';
        return;
      }
      // Regla del dashboard (desktop): todo hueco entre paneles = 16px.
      const sideGap = 16;
      const minChart = 160;
      const height = left.offsetHeight - balance.offsetHeight - quick.offsetHeight - sideGap;
      chart.style.height = `${Math.max(height, minChart)}px`;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(left);
    observer.observe(balance);
    observer.observe(quick);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const currency = overview.accounts[0]?.currency ?? 'EUR';
  const month = overview.month;
  const projected = overview.projections.find((entry) => entry.currency === currency);
  const upcoming = overview.upcoming[0];
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
    <Stack gap={5.5} className="lg:gap-4">
      <section
        aria-label="Resumen de saldo y gastos del mes"
        className="flex flex-col lg:flex-row lg:gap-x-4"
      >
        <div ref={leftRef} className="contents lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:gap-4">
        <div className="order-1 flex flex-col items-center gap-1.5 text-center lg:order-none lg:items-start lg:text-left" data-hero="balance">
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
                  className={multipleTotals ? 'text-ui-28-bold' : 'text-ui-52-bold'}
                />
              ))}
            </div>
          )}
        </div>
        <section
          aria-labelledby="ultimos"
          data-hero="recent"
          className="order-3 relative z-10 lg:order-none lg:mt-0"
        >
          <Card padding="md" className="flex h-full flex-col gap-2.5 hero-recent-union">
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
                    onClick={() => setDetailId(movement.id)}
                  />
                ))}
              </div>
            )}
          </Card>
        </section>
        </div>
        <div className="contents lg:flex lg:flex-1 lg:flex-col">
        <div
          ref={chartRef}
          className="order-2 hero-chart-emerge relative mt-6 flex min-h-40 flex-col lg:order-none lg:mt-0 lg:min-h-0"
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
            className="flex-1"
          />
        </div>
        <div ref={balanceRef} data-hero="month-summary" className="order-4 relative z-10 mt-5 lg:order-none lg:mt-0">
          <Card padding="md" className="hero-card-shadow flex h-full flex-col gap-1 border-t-0">
            <SectionHeader id="balance-mes" title="Balance del mes" />
            <p className="font-tabular text-ui-28-bold text-text-primary">
              <span className={balanceTone}>
                {formatMinor(month.netMinor, currency, { signed: true })}
              </span>
            </p>
            {estimatedTotal ? (
              <p className="text-ui-10 text-text-secondary">
                Saldo total estimado a fin de mes:{' '}
                <span className="font-tabular text-text-primary">{estimatedTotal}</span>
              </p>
            ) : null}
          </Card>
        </div>
        <section
          ref={quickRef}
          aria-label="Accesos rápidos"
          data-hero="quick"
          className="order-5 mt-5 lg:order-none lg:mt-4"
        >
            <div className="flex items-center gap-2">
              <Link
                href="/movimientos/nuevo"
                aria-label="Nuevo movimiento"
                className="bg-accent-default text-accent-ink hidden h-11 flex-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 text-ui-12-strong transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring md:inline-flex"
              >
                <Icon name="add" size={20} />
                <span>Nuevo movimiento</span>
              </Link>
              <Link
                href="/cuentas/nueva"
                aria-label="Nueva cuenta"
                className="border-border-strong bg-surface-default text-text-primary inline-flex h-11 flex-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-ui-12-strong transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <Icon name="wallet" size={20} />
                <span>Nueva cuenta</span>
              </Link>
              <Link
                href="/ajustes"
                aria-label="Exportar"
                className="border-border-strong bg-surface-default text-text-primary inline-flex h-11 flex-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2 text-ui-12-strong transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <Icon name="arrows" size={20} />
                <span>Exportar</span>
              </Link>
              <Link
                href="/preguntas"
                aria-label="Preguntas rápidas"
                className="bg-text-primary text-text-inverse inline-flex h-11 flex-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 text-ui-12-strong transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              >
                <Icon name="insights" size={20} />
                <span className="md:hidden">Preguntas</span>
                <span className="hidden md:inline">Preguntas rápidas</span>
              </Link>
            </div>
        </section>
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
      <MovementDetailDialog
        movementId={detailId}
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
      />
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
        <PageHeaderResponsive
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
      <PageHeaderResponsive
        title={`${greeting()}, Marta`}
        meta={`${formatFullDate()} · ${overview.accounts.length} cuentas en este dispositivo`}
      />
      <OverviewBody overview={overview} />
    </Stack>
  );
}
