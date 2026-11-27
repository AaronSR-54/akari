'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Amount,
  Button,
  Card,
  Inline,
  MovementRow,
  SearchField,
  SelectPill,
  SegmentedControl,
  Stack,
  StatePage,
  cn,
} from '@akari/ui';
import { useAccounts, useMovements } from '../../components/hooks';
import { PageTitle } from '../../components/page-title';
import { PageHeaderResponsive } from '../../components/page-header-responsive';
import { HeadingMeta } from '../../components/heading-meta';
import { MovementDetailDialog } from '../../components/movement-detail-dialog';
import { BankIcon } from '../../components/bank-icon';
import { MovementDialog } from '../../components/movement-dialog';
import { PageSkeleton } from '../../components/page-skeleton';
import { downloadCsv, movementsToCsv } from '../../lib/csv';
import { formatMonthYear, formatShortDate } from '../../lib/format';
import { movementCategoryOptions } from '../../lib/options';

type TypeFilter = 'all' | 'expense' | 'income' | 'subscriptions';

const typeOptions = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'expense' as const, label: 'Gastos' },
  { value: 'income' as const, label: 'Ingresos' },
  { value: 'subscriptions' as const, label: 'Suscripciones' },
];

export function MovementsScreen() {
  const searchParams = useSearchParams();
  const initialAccount = searchParams.get('cuenta') ?? '';
  const accounts = useAccounts();
  const movements = useMovements();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [category, setCategory] = useState('all');
  const [accountId, setAccountId] = useState(initialAccount);
  const [sort, setSort] = useState('date-desc');
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(10);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    if (!movements) return [];
    const normalized = query.trim().toLowerCase();
    return movements
      .filter((movement) => {
        if (normalized && !movement.concept.toLowerCase().includes(normalized)) return false;
        if (type === 'expense' && movement.type !== 'expense') return false;
        if (type === 'income' && movement.type !== 'income') return false;
        if (type === 'subscriptions' && movement.category !== 'Suscripciones') return false;
        if (category !== 'all' && movement.category !== category) return false;
        if (accountId && movement.accountId !== accountId) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'amount-desc') return b.amountMinor - a.amountMinor;
        if (sort === 'amount-asc') return a.amountMinor - b.amountMinor;
        if (sort === 'date-asc') return a.date.localeCompare(b.date);
        return b.date.localeCompare(a.date);
      });
  }, [movements, query, type, category, accountId, sort]);

  if (!movements || !accounts) {
    return <PageSkeleton />;
  }

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  const mobileItems = filtered.slice(0, visible);
  const accountName = (id: string) => accounts.find((account) => account.id === id)?.name ?? '—';
  const bankIdFor = (id: string) => accounts.find((account) => account.id === id)?.bankId;
  const accountFilterActive = Boolean(accountId);
  const hasFilters = Boolean(query || type !== 'all' || category !== 'all' || accountId);

  const clearFilters = () => {
    setQuery('');
    setType('all');
    setCategory('all');
    setAccountId('');
    setPage(1);
    setVisible(10);
  };

  const exportCsv = () => {
    downloadCsv(`akari-movimientos-${new Date().toISOString().slice(0, 10)}.csv`, movementsToCsv(filtered, accountName));
  };

  return (
    <div>
      <PageTitle title="Movimientos" />
      <Stack gap={5}>
        <div className="hidden md:block">
          <PageHeaderResponsive
            title="Movimientos"
            actions={
              <>
                <Button variant="secondary" onClick={exportCsv}>
                  Exportar CSV
                </Button>
                <Button onClick={() => setCreating(true)}>Añadir movimiento</Button>
              </>
            }
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5 md:hidden">
          <Button variant="secondary" onClick={exportCsv}>
            Exportar CSV
          </Button>
          <Button onClick={() => setCreating(true)}>Añadir movimiento</Button>
        </div>
        <HeadingMeta label={`${filtered.length} movimientos`} detail={formatMonthYear()} />

        <div className="flex flex-wrap items-center gap-2.5">
          <SearchField
            aria-label="Buscar movimientos"
            placeholder="Buscar por concepto o cuenta"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
              setVisible(10);
            }}
            className="w-72"
          />
          <SegmentedControl
            ariaLabel="Tipo de movimiento"
            options={typeOptions}
            value={type}
            onChange={(value) => {
              setType(value);
              setPage(1);
            }}
          />
          <span className="inline-flex h-[34px] items-center rounded-full border border-border-subtle bg-surface-default px-3.5 text-ui-11-strong text-text-primary">
            {formatMonthYear()}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <SelectPill
              ariaLabel="Categoría"
              value={category}
              onChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
              options={[{ value: 'all', label: 'Todas las categorías' }, ...movementCategoryOptions]}
            />
            <SelectPill
              ariaLabel="Cuenta"
              value={accountId}
              onChange={(value) => {
                setAccountId(value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'Todas las cuentas' },
                ...accounts.map((account) => ({
                  value: account.id,
                  label: account.name,
                  icon: <BankIcon bankId={account.bankId} size={16} />,
                })),
              ]}
            />
            <SelectPill
              ariaLabel="Orden"
              value={sort}
              onChange={setSort}
              options={[
                { value: 'date-desc', label: 'Fecha ↓' },
                { value: 'date-asc', label: 'Fecha ↑' },
                { value: 'amount-desc', label: 'Importe ↓' },
                { value: 'amount-asc', label: 'Importe ↑' },
              ]}
            />
            {hasFilters ? (
              <Button variant="tertiary" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : null}
          </div>
        </div>

        {filtered.length === 0 ? (
          <StatePage
            type="empty"
            title={hasFilters ? 'Ningún movimiento coincide' : 'Todavía no hay movimientos'}
            description={
              hasFilters
                ? 'Prueba con otros filtros o límpialos para ver todo.'
                : 'Registra el primer gasto o ingreso para empezar.'
            }
            primaryAction={
              hasFilters ? (
                <Button onClick={clearFilters}>Limpiar filtros</Button>
              ) : (
                <Button onClick={() => setCreating(true)}>Añadir movimiento</Button>
              )
            }
          />
        ) : (
          <>
            <Card padding="none" className="hidden overflow-hidden md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="h-11 border-b border-border-subtle text-ui-11-strong text-text-secondary">
                    <th className="w-[90px] px-3 font-semibold">Fecha</th>
                    <th className="px-3 font-semibold">Concepto</th>
                    <th className="w-[170px] px-3 font-semibold">Categoría</th>
                    <th className="w-[190px] px-3 font-semibold">Cuenta</th>
                    <th className="w-[120px] px-3 text-right font-semibold">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((movement) => (
                    <tr
                      key={movement.id}
                      onClick={(event) => {
                        if ((event.target as Element).closest('button, a')) return;
                        setDetailId(movement.id);
                      }}
                      className="h-16 cursor-pointer border-b border-border-subtle transition-colors last:border-0 hover:bg-surface-sunken"
                    >
                      <td className="px-3 text-ui-13 text-text-secondary">{formatShortDate(movement.date)}</td>
                      <td className="px-3 text-ui-14-strong text-text-primary">
                        <button
                          type="button"
                          onClick={() => setDetailId(movement.id)}
                          className="text-left"
                        >
                          <span className="inline-flex items-center gap-2">
                            {!accountFilterActive ? (
                              <BankIcon bankId={bankIdFor(movement.accountId)} />
                            ) : null}
                            {movement.concept}
                          </span>
                        </button>
                      </td>
                      <td className="px-3 text-ui-13 text-text-secondary">{movement.category}</td>
                      <td className="px-3 text-ui-13 text-text-secondary">{accountName(movement.accountId)}</td>
                      <td className="px-3 text-right">
                        <Amount
                          minor={movement.amountMinor}
                          currency={movement.currency}
                          type={movement.type}
                          signed
                          className="text-ui-14-strong"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <p className="text-ui-11 text-text-secondary">
                  {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, filtered.length)} de{' '}
                  {filtered.length} movimientos
                </p>
                <Inline gap={1}>
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={safePage === 1}
                  >
                    Anterior
                  </Button>
                  {Array.from({ length: Math.min(5, pageCount) }, (_, index) => {
                    const number = Math.max(1, Math.min(pageCount - 4, safePage - 2)) + index;
                    if (number > pageCount) return null;
                    return (
                      <button
                        key={number}
                        type="button"
                        aria-current={number === safePage ? 'page' : undefined}
                        onClick={() => setPage(number)}
                        className={cn(
                          'inline-flex h-7 w-7 items-center justify-center rounded-full text-ui-11-strong',
                          number === safePage
                            ? 'bg-text-primary text-text-inverse'
                            : 'text-text-secondary hover:bg-surface-sunken',
                        )}
                      >
                        {number}
                      </button>
                    );
                  })}
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                    disabled={safePage === pageCount}
                  >
                    Siguiente
                  </Button>
                </Inline>
              </div>
            </Card>

            <div className="md:hidden">
              <Card padding="sm">
                <Stack gap={2}>
                  {mobileItems.map((movement) => (
                    <MovementRow
                      key={movement.id}
                      concept={movement.concept}
                      category={movement.category}
                      dateLabel={formatShortDate(movement.date)}
                      amountMinor={movement.amountMinor}
                      currency={movement.currency}
                      type={movement.type}
                      icon={accountFilterActive ? null : <BankIcon bankId={bankIdFor(movement.accountId)} />}
                      iconTone="plain"
                      onClick={() => setDetailId(movement.id)}
                    />
                  ))}
                </Stack>
              </Card>
              {visible < filtered.length ? (
                <div className="mt-3 flex justify-center">
                  <Button variant="secondary" onClick={() => setVisible((value) => value + 10)}>
                    Cargar más
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </Stack>
      <MovementDialog accounts={accounts} open={creating} onClose={() => setCreating(false)} />
      <MovementDetailDialog
        movementId={detailId}
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
        showBankIcon={!accountId}
      />
    </div>
  );
}
