'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { endOfMonth, format, subMonths } from 'date-fns';
import {
  calculateAccountBalance,
  currentMonthMovements,
  formatMinor,
  monthOverMonthExpenses,
} from '@akari/domain';
import {
  Amount,
  Badge,
  Banner,
  Button,
  Card,
  InfoRow,
  MonthBalance,
  MovementRow,
  SectionHeader,
  Stack,
  StatePage,
} from '@akari/ui';
import { useAccountSummary, useAccounts, useOverview, useRecurrences } from '../../components/hooks';
import { PageTitle } from '../../components/page-title';
import { PageHeaderResponsive } from '../../components/page-header-responsive';
import { ActionLink } from '../../components/action-link';
import { PageSkeleton } from '../../components/page-skeleton';
import { MovementDetailDialog } from '../../components/movement-detail-dialog';
import { MovementDialog } from '../../components/movement-dialog';
import { BankIcon } from '../../components/bank-icon';
import { AccountMenu } from '../../components/account-menu';
import { AccountDialog } from '../../components/account-dialog';
import { InstallmentPlanDialog } from '../../components/installment-plan-dialog';
import { RecurrenceDialog } from '../../components/recurrence-dialog';
import { UpcomingInstallments } from '../../components/upcoming-installments';
import {
  formatFullDate,
  formatLongDate,
  formatShortDate,
  formatWeekdayDate,
  formatWeekdayFullDate,
} from '../../lib/format';
import { appNow, appTodayKey } from '../../lib/clock';
import { accountTypeOptions } from '../../lib/options';

const typeLabel = Object.fromEntries(accountTypeOptions.map((option) => [option.value, option.label]));

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export function AccountDetailScreen({ accountId }: { accountId: string }) {
  const summary = useAccountSummary(accountId);
  const accounts = useAccounts();
  const overview = useOverview();
  const recurrences = useRecurrences(accountId);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [creatingMovement, setCreatingMovement] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [creatingRecurrence, setCreatingRecurrence] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const rightPadRef = useRef<HTMLDivElement>(null);

  // La cabecera de saldo y la columna izquierda quedan fijas en el scroll de la
  // raíz; la derecha es la única que avanza. La gráfica se ajusta hasta su tope.
  useLayoutEffect(() => {
    if (!summary) return;
    const left = leftRef.current;
    const chart = chartRef.current;
    const hero = heroRef.current;
    const balance = balanceRef.current;
    const details = detailsRef.current;
    const row = rowRef.current;
    const right = rightRef.current;
    const scroll = row?.closest<HTMLElement>('[data-shell-scroll]');
    if (!left || !chart || !hero || !balance || !details || !row || !scroll) return;
    let frame = 0;
    const clearMask = () => {
      if (!right) return;
      right.style.maskImage = '';
      right.style.removeProperty('-webkit-mask-image');
    };
    const updateMask = () => {
      if (!right) return;
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        clearMask();
        return;
      }
      // El límite superior lo pone ahora la cabecera con su difuminado: la
      // columna puede subir hasta el borde de la raíz y pasa difuminada por
      // detrás. La máscara solo funde la salida inferior, donde el contenido
      // termina contra el borde del scroll.
      const edge = 20;
      const scrollRect = scroll.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      const height = right.offsetHeight;
      const visibleBottom = Math.min(
        Math.max(scrollRect.bottom - rightRect.top, 0),
        height,
      );
      const bottomBand = Math.min(edge, height - visibleBottom);
      if (bottomBand < 1) {
        clearMask();
        return;
      }
      const mask = `linear-gradient(to bottom, #000 ${visibleBottom - bottomBand}px, transparent ${visibleBottom}px)`;
      right.style.maskImage = mask;
      right.style.setProperty('-webkit-mask-image', mask);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateMask();
      });
    };
    const update = () => {
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        hero.style.top = '';
        left.style.top = '';
        chart.style.height = '';
        if (rightPadRef.current) rightPadRef.current.style.height = '';
        updateMask();
        return;
      }
      const scrollRect = scroll.getBoundingClientRect();
      // Los topes de sticky se miden desde la caja de contenido del scroller
      // (tras su padding superior), no desde el borde de la caja.
      const padTop = Number.parseFloat(window.getComputedStyle(scroll).paddingTop) || 0;
      const contentTop = scrollRect.top + padTop;
      const rowTop = row.getBoundingClientRect().top - contentTop + scroll.scrollTop;
      // El saldo se queda donde está: su tope de sticky es su propia posición
      // natural, sin desplazarlo sobre la fila.
      const heroTop = Math.max(rowTop - hero.offsetHeight, 0);
      hero.style.top = `${heroTop}px`;
      left.style.top = `${rowTop}px`;
      const available = Math.max(scroll.clientHeight - padTop - rowTop - 16, 0);
      const gap = 16;
      const minChart = 128;
      const maxChart = 356;
      const height = available - balance.offsetHeight - details.offsetHeight - gap;
      chart.style.height = `${Math.min(Math.max(height, minChart), maxChart)}px`;
      // La columna derecha termina donde termina la izquierda: el último panel
      // no debe quedar por debajo. El relleno solo aparece si su contenido
      // desborda; así el final del scroll coincide con el borde de la columna
      // izquierda.
      const leftBottom = left.getBoundingClientRect().bottom - contentTop;
      const visibleHeight = scroll.clientHeight - padTop;
      const spacer = rightPadRef.current;
      if (right) {
        const currentPad = spacer ? Number.parseFloat(spacer.style.height) || 0 : 0;
        const contentHeight = right.offsetHeight - currentPad;
        const nextPad =
          contentHeight > leftBottom
            ? Math.max(0, Math.round(visibleHeight - leftBottom))
            : 0;
        if (spacer && spacer.style.height !== `${nextPad}px`) {
          spacer.style.height = `${nextPad}px`;
        }
      }
      updateMask();
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(scroll);
    observer.observe(hero);
    observer.observe(balance);
    observer.observe(details);
    if (right) observer.observe(right);
    scroll.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      scroll.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, [summary]);

  if (summary === undefined || accounts === undefined) {
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
  const activeAccounts = accounts.filter((candidate) => !candidate.archivedAt);
  const balance = calculateAccountBalance(account, movements, appTodayKey());
  const monthDate = appNow();
  const previousMonthEnd = format(endOfMonth(subMonths(monthDate, 1)), 'yyyy-MM-dd');
  const openingBalanceMinor = calculateAccountBalance(
    account,
    movements,
    previousMonthEnd,
  ).minor;
  const monthData = currentMonthMovements(
    movements,
    account.currency,
    monthDate,
    openingBalanceMinor,
  );
  const monthDays = monthData.days.map((day) => ({
    id: day.date,
    label: formatWeekdayDate(day.date),
    balanceMinor: day.balanceMinor,
    total: formatMinor(day.balanceMinor, account.currency),
    items: day.movements.map((movement) => ({
      id: movement.id,
      label: movement.concept,
      value: formatMinor(
        movement.type === 'income' ? movement.amountMinor : -movement.amountMinor,
        account.currency,
        { signed: true },
      ),
    })),
    ariaLabel: `${formatWeekdayFullDate(day.date)}: saldo ${formatMinor(day.balanceMinor, account.currency)} con ${plural(day.count, 'movimiento', 'movimientos')}`,
  }));
  const openingTotal = formatMinor(openingBalanceMinor, account.currency);
  const balanceTone =
    monthData.netMinor > 0
      ? 'text-status-positive-text'
      : monthData.netMinor < 0
        ? 'text-status-danger-text'
        : 'text-text-primary';
  const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  const monthMovements = movements.filter((movement) => movement.date.startsWith(monthKey));
  const comparison = monthOverMonthExpenses(movements, monthDate, account.currency);
  const comparisonLabel =
    comparison.changePct === null
      ? 'sin comparación'
      : `${comparison.changePct >= 0 ? '+' : ''}${comparison.changePct} % frente al anterior`;

  return (
    <div>
      <PageTitle title={account.name} />
      <Stack gap={5.5} className="lg:gap-3">
        <PageHeaderResponsive
          title={account.name}
          titleAction={
            <AccountMenu
              accounts={activeAccounts}
              balances={overview?.balancesByAccount ?? {}}
              currentId={account.id}
              onCreateAccount={() => setCreatingAccount(true)}
            />
          }
        />
        {movements.length === 0 ? (
          <Banner
            tone="info"
            title="Primer paso completado"
            action={
              <Button variant="secondary" size="sm" onClick={() => setCreatingMovement(true)}>
                Añadir primer movimiento
              </Button>
            }
          >
            Tu cuenta ya está creada. Registra tu primer gasto o ingreso para empezar a ver el
            resumen en movimiento.
          </Banner>
        ) : null}

        {projected.minor < 0 ? (
          <Banner tone="warning" title="El saldo estimado a fin de mes es negativo">
            Revisa las cuotas y los pagos recurrentes antes de que llegue el vencimiento.
          </Banner>
        ) : null}

        <div
          ref={heroRef}
          data-hero="balance"
          className="flex flex-col items-center gap-1 text-center lg:sticky lg:z-20 lg:-mb-3 lg:-mt-3 lg:items-start lg:pb-3 lg:pt-3 lg:text-left"
        >
          <Amount minor={balance.minor} currency={account.currency} className="text-ui-52-bold" />
          <p className="text-ui-13-strong text-text-primary">
            <span className="font-bold">Saldo actual</span>
            <span className="font-normal italic"> · {formatFullDate()}</span>
          </p>
        </div>

        <div
          ref={rowRef}
          className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-x-4"
        >
          <div
            ref={leftRef}
            data-account-column="left"
            className="contents lg:sticky lg:flex lg:flex-1 lg:flex-col lg:gap-4 lg:self-start"
          >
            <div className="order-2 flex flex-col lg:order-none">
              <div
                ref={chartRef}
                data-hero="month"
                className="hero-chart-emerge relative flex min-h-40 flex-col lg:pt-2.5"
              >
                <MonthBalance
                  days={monthDays}
                  openingBalanceMinor={openingBalanceMinor}
                  openingLabel={formatWeekdayDate(monthData.openingDate)}
                  openingTotal={openingTotal}
                  openingAriaLabel={`${formatWeekdayFullDate(monthData.openingDate)}: saldo de cierre ${openingTotal}`}
                  elapsedDays={monthData.elapsedDays}
                  ariaLabel={`Saldo de ${account.name} por día`}
                  className="flex-1"
                />
              </div>
              <div ref={balanceRef} data-hero="month-summary" className="relative z-10">
                <Card
                  padding="md"
                  className="hero-card-shadow flex h-full flex-col gap-1 border-t-0"
                >
                  <SectionHeader id="balance-mes" title="Balance del mes" />
                  <p className="font-tabular text-ui-28-bold text-text-primary">
                    <span className={balanceTone}>
                      {formatMinor(monthData.netMinor, account.currency, { signed: true })}
                    </span>
                  </p>
                  <p className="text-ui-10 text-text-secondary">
                    Saldo real estimado a fin de mes:{' '}
                    <span className="font-tabular text-text-primary">
                      {formatMinor(projected.minor, account.currency)}
                    </span>
                  </p>
                </Card>
              </div>
            </div>

            <section
              ref={detailsRef}
              aria-labelledby="detalles-cuenta"
              className="order-3 lg:order-none"
            >
              <Card padding="lg">
                <SectionHeader
                  id="detalles-cuenta"
                  title="Detalles de la cuenta"
                  action={
                    <Link
                      href={`/cuentas/${account.id}/editar`}
                      className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline"
                    >
                      Editar
                    </Link>
                  }
                />
                <div className="grid gap-x-8 gap-y-1 pt-4 sm:grid-cols-2">
                  <InfoRow label="Tipo" value={typeLabel[account.type] ?? account.type} />
                  <InfoRow label="Divisa" value={account.currency} />
                  <InfoRow
                    label="Titular"
                    value={account.members?.map((member) => member.name).join(', ') || 'Cuenta local'}
                  />
                  <InfoRow
                    label="Incluida en el saldo total"
                    value={account.includeInTotal ? 'Sí' : 'No'}
                  />
                  {account.type === 'deposit' ? (
                    <InfoRow label="TAE" value={`${((account.taeBps ?? 0) / 100).toFixed(2)} %`} />
                  ) : null}
                  <InfoRow label="Creada" value={formatLongDate(account.createdAt.slice(0, 10))} />
                </div>
              </Card>
            </section>
          </div>

          <div
            ref={rightRef}
            data-account-column="right"
            className="contents lg:block lg:flex-1"
          >
            <div className="contents lg:flex lg:flex-col lg:gap-4">
              <section
                aria-labelledby="ultimos"
              data-hero="recent"
              className="order-4 relative z-10 lg:order-none"
            >
              <Card padding="md" className="flex h-full flex-col gap-2.5 hero-recent-union">
                <SectionHeader
                  id="ultimos"
                  title="Últimos movimientos"
                  action={
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/movimientos?cuenta=${account.id}`}
                        className="text-ui-11-strong text-accent-strong underline-offset-4 hover:underline"
                      >
                        Ver todos
                      </Link>
                      <Button
                        size="sm"
                        className="hidden md:inline-flex"
                        onClick={() => setCreatingMovement(true)}
                      >
                        Añadir movimiento
                      </Button>
                    </div>
                  }
                />
                <p className="text-ui-10 text-text-secondary">
                  {plural(monthMovements.length, 'movimiento este mes', 'movimientos este mes')} ·{' '}
                  {comparisonLabel}
                </p>
                {movements.length === 0 ? (
                  <StatePage
                    type="empty"
                    title="Esta cuenta no tiene movimientos"
                    description="Añade el primero para empezar a seguir su saldo."
                    primaryAction={
                      <Button onClick={() => setCreatingMovement(true)}>Añadir movimiento</Button>
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
                        icon={<BankIcon bankId={account.bankId} />}
                        iconTone="plain"
                        onClick={() => setDetailId(movement.id)}
                      />
                    ))}
                  </div>
                )}
                <Button className="w-full md:hidden" onClick={() => setCreatingMovement(true)}>
                  Añadir movimiento
                </Button>
              </Card>
            </section>

            <div className="order-5 lg:order-none">
              <UpcomingInstallments
                plans={plans}
                action={
                  <Button variant="secondary" size="sm" onClick={() => setCreatingPlan(true)}>
                    Añadir plazo
                  </Button>
                }
                emptyMessage="Sin planes activos. Añade uno para repartir un importe en cuotas."
              />
            </div>

            <section aria-labelledby="recurrentes" className="order-6 lg:order-none">
              <Card padding="lg" className="flex flex-col gap-3">
                <SectionHeader
                  id="recurrentes"
                  title="Recurrentes"
                  action={
                    <div className="flex items-center gap-3">
                      {recurrences && recurrences.length > 0 ? (
                        <Badge tone="neutral">{recurrences.length}</Badge>
                      ) : null}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCreatingRecurrence(true)}
                      >
                        Añadir recurrente
                      </Button>
                    </div>
                  }
                />
                {recurrences && recurrences.length > 0 ? (
                  <div className="flex flex-col divide-y divide-border-subtle">
                    {recurrences.map((recurrence) => (
                      <div
                        key={recurrence.id}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <span className="min-w-0 truncate text-ui-12 text-text-primary">
                          {recurrence.concept}
                        </span>
                        <span className="shrink-0 font-tabular text-ui-12-strong">
                          {formatMinor(recurrence.amountMinor, recurrence.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-ui-11 text-text-secondary">
                    Sin recurrencias. Añade una suscripción, un alquiler o un ingreso periódico.
                  </p>
                )}
              </Card>
            </section>
            </div>
            <div ref={rightPadRef} aria-hidden="true" className="hidden lg:block" />
          </div>
        </div>
      </Stack>

      <AccountDialog open={creatingAccount} onClose={() => setCreatingAccount(false)} />

      <MovementDialog
        accounts={activeAccounts}
        defaultAccountId={account.id}
        open={creatingMovement}
        onClose={() => setCreatingMovement(false)}
      />

      <InstallmentPlanDialog
        account={account}
        open={creatingPlan}
        onClose={() => setCreatingPlan(false)}
      />

      <RecurrenceDialog
        account={account}
        open={creatingRecurrence}
        onClose={() => setCreatingRecurrence(false)}
      />

      <MovementDetailDialog
        movementId={detailId}
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
