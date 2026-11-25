'use client';

import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { cn } from './cn.js';

export type MonthBalanceDay = {
  id: string;
  /** Cabecera del detalle, p. ej. «jue 26 nov». */
  label: string;
  /** Saldo al cierre del día, en la unidad menor de la divisa. */
  balanceMinor: number;
  /** Saldo del día ya formateado. */
  total: string;
  items?: Array<{ id: string; label: string; value: string }>;
  /** Descripción completa para lectores de pantalla. */
  ariaLabel: string;
};

export type MonthBalanceProps = {
  days: MonthBalanceDay[];
  /** Saldo al cierre del mes anterior: base de la serie. */
  openingBalanceMinor: number;
  /** Fecha del cierre anterior para el detalle, p. ej. «sáb 31 oct». */
  openingLabel: string;
  /** Saldo de apertura ya formateado. */
  openingTotal: string;
  /** Descripción accesible del cierre anterior. */
  openingAriaLabel: string;
  /** Días transcurridos del mes; limita la serie y la interacción. */
  elapsedDays: number;
  ariaLabel: string;
  className?: string;
};

/**
 * Evolución del saldo durante el mes: arranca en el saldo de apertura y cada
 * ingreso sube la línea mientras cada gasto la baja. Permite recorrer los días
 * transcurridos con el puntero o el teclado para ver sus movimientos.
 */
export function MonthBalance({
  days,
  openingBalanceMinor,
  openingLabel,
  openingTotal,
  openingAriaLabel,
  elapsedDays,
  ariaLabel,
  className,
}: MonthBalanceProps) {
  const gradientId = `month-balance-${useId().replace(/:/g, '')}`;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const totalDays = days.length;
  const elapsed = Math.min(Math.max(elapsedDays, 0), totalDays);
  const elapsedDaysList = days.slice(0, elapsed);
  const values = [openingBalanceMinor, ...elapsedDaysList.map((day) => day.balanceMinor)];
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const rawRange = rawMax - rawMin;
  const padding = rawRange === 0 ? Math.max(Math.abs(rawMax) * 0.02, 1) : rawRange * 0.15;
  const min = rawMin - padding;
  const max = rawMax + padding;
  const scale = (value: number) => 34 - ((value - min) / (max - min)) * 28;
  const openingPoint = { x: 0, y: scale(openingBalanceMinor) };
  const points = [
    openingPoint,
    ...elapsedDaysList.map((day, index) => ({
      x: totalDays > 0 ? ((index + 1) / totalDays) * 100 : 0,
      y: scale(day.balanceMinor),
    })),
  ];
  const line = points.length
    ? `M ${points[0]!.x} ${points[0]!.y} ${points
        .slice(1)
        .map((point) => `L ${point.x} ${point.y}`)
        .join(' ')}`
    : '';
  const last = points[points.length - 1];
  const area = line && last ? `${line} L 100 ${last.y} L 100 46 L 0 46 Z` : '';
  const selectedIndex = activeIndex ?? (points.length > 0 ? points.length - 1 : null);
  const point = selectedIndex !== null ? points[selectedIndex] : undefined;
  const activeIsOpening = selectedIndex === 0;
  const activeDay =
    selectedIndex !== null && selectedIndex > 0 ? elapsedDaysList[selectedIndex - 1] : undefined;
  const activeVisible = activeIndex !== null && (activeIsOpening || Boolean(activeDay));
  const activeTop = point ? (point.y / 38) * 100 : 0;
  const openingTop = (openingPoint.y / 38) * 100;
  const tooltipAbove = activeTop > 52;

  const select = (index: number) => {
    setActiveIndex(Math.min(Math.max(index, 0), elapsed));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    select(totalDays > 0 ? Math.round(ratio * totalDays) : 0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = activeIndex ?? Math.max(elapsed, 0);
    const moves: Record<string, number> = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: elapsed,
    };
    if (event.key === 'Escape') {
      setActiveIndex(null);
      return;
    }
    if (!(event.key in moves)) return;
    event.preventDefault();
    select(moves[event.key]!);
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div
        role="group"
        tabIndex={0}
        aria-label={`${ariaLabel}. Usa las flechas izquierda y derecha para recorrer los días.`}
        onPointerDown={onPointerMove}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActiveIndex(null)}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (activeIndex === null) setActiveIndex(Math.max(elapsed, 0));
        }}
        onBlur={() => setActiveIndex(null)}
        className="relative min-h-32 w-full flex-1 cursor-default rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
      >
        <div className="absolute inset-0">
          <svg
            viewBox="0 0 100 38"
            preserveAspectRatio="none"
            overflow="visible"
            className="pointer-events-none h-full w-full"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent-default)" stopOpacity="0.34" />
                <stop offset="100%" stopColor="var(--color-accent-default)" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {area ? <path d={area} fill={`url(#${gradientId})`} stroke="none" /> : null}
            {line ? (
              <path
                d={line}
                fill="none"
                stroke="var(--color-text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute block h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-strong/70"
            style={{ left: 0, top: `${openingTop}%` }}
          />
          {point ? (
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute block h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-default/20"
                style={{ left: `${point.x}%`, top: `${activeTop}%` }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-strong ring-2 ring-surface-default"
                style={{ left: `${point.x}%`, top: `${activeTop}%` }}
              />
            </>
          ) : null}
          {activeVisible && point ? (
            <div
              className="pointer-events-none z-30 w-56 rounded-lg bg-surface-inverse px-2.5 py-1.5 shadow-elevation-2"
              style={{
                position: 'absolute',
                left: `clamp(0px, calc(${point.x}% - 7rem), calc(100% - 14rem))`,
                ...(tooltipAbove
                  ? { bottom: `calc(${100 - activeTop}% + 12px)` }
                  : { top: `calc(${activeTop}% + 12px)` }),
              }}
            >
              <p className="text-ui-9 uppercase tracking-wide text-text-inverse">
                {activeIsOpening ? openingLabel : activeDay?.label}
              </p>
              {activeIsOpening ? (
                <p className="mt-0.5 text-ui-9 text-text-inverse">Cierre del mes anterior</p>
              ) : activeDay?.items && activeDay.items.length > 0 ? (
                <ul className="mt-1 flex flex-col gap-0.5">
                  {activeDay.items.slice(0, 4).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-baseline justify-between gap-4 text-ui-9 text-text-inverse"
                    >
                      <span className="truncate">{item.label}</span>
                      <span className="whitespace-nowrap font-tabular">{item.value}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-0.5 text-ui-9 text-text-inverse">Sin movimientos</p>
              )}
              <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-text-inverse/20 pt-1 text-ui-9 text-text-inverse">
                <span>{activeIsOpening ? 'Saldo al cierre' : 'Saldo tras el día'}</span>
                <span className="whitespace-nowrap font-tabular">
                  {activeIsOpening ? openingTotal : activeDay?.total}
                </span>
              </div>
            </div>
          ) : null}
          <p aria-live="polite" className="sr-only">
            {activeVisible ? (activeIsOpening ? openingAriaLabel : activeDay?.ariaLabel ?? '') : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
