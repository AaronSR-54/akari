'use client';

import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { cn } from './cn.js';

/** Inset lateral de la capa visual (`left-2`/`right-2`). */
const INLINE_INSET_PX = 8;
/** Radio de las esquinas del área, en unidades del viewBox 100×38. */
const CORNER = 3.2;

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
  const max = rawMax;
  const scale = (value: number) => 34 - ((value - min) / (max - min)) * 34;
  // El trazo vive entre las tangentes de las esquinas redondeadas del área:
  // arranca y termina donde empieza el radio, no en los bordes del viewBox.
  const openingPoint = { x: CORNER, y: scale(openingBalanceMinor) };
  const points = [
    openingPoint,
    ...elapsedDaysList.map((day, index) => ({
      x: totalDays > 0 ? CORNER + ((index + 1) / totalDays) * (100 - 2 * CORNER) : CORNER,
      y: scale(day.balanceMinor),
    })),
  ];
  // Curvas cúbicas tipo Catmull-Rom: pasan por cada punto y suavizan los
  // cambios de dirección. Las ordenadas de control se limitan al viewBox para
  // que la línea no sobresalga por encima del máximo ni por debajo del área.
  const tension = 0.12;
  const clampY = (value: number) => Math.min(Math.max(value, 0), 38);
  const lineCommands = (() => {
    if (!points.length) return [] as string[];
    const start = `M ${points[0]!.x} ${points[0]!.y}`;
    if (points.length < 3) {
      return [start, ...points.slice(1).map((point) => `L ${point.x} ${point.y}`)];
    }
    const commands = [start];
    for (let index = 0; index < points.length - 1; index += 1) {
      const previous = points[Math.max(0, index - 1)]!;
      const current = points[index]!;
      const next = points[index + 1]!;
      const following = points[Math.min(points.length - 1, index + 2)]!;
      const control1X = current.x + (next.x - previous.x) * tension;
      const control1Y = clampY(current.y + (next.y - previous.y) * tension);
      const control2X = next.x - (following.x - current.x) * tension;
      const control2Y = clampY(next.y - (following.y - current.y) * tension);
      commands.push(`C ${control1X} ${control1Y} ${control2X} ${control2Y} ${next.x} ${next.y}`);
    }
    return commands;
  })();
  const line = lineCommands.join(' ');
  const last = points[points.length - 1];
  // El relleno se dibuja como una barra con las cuatro esquinas redondeadas y
  // el trazo entra y sale por las tangentes. El mismo trazado aplica con el mes
  // abierto y completo.
  const area =
    lineCommands.length && last
      ? `M 0 ${openingPoint.y + CORNER} Q 0 ${openingPoint.y} ${CORNER} ${openingPoint.y} ${lineCommands.slice(1).join(' ')} L ${100 - CORNER} ${last.y} Q 100 ${last.y} 100 ${last.y + CORNER} L 100 ${46 - CORNER} Q 100 46 ${100 - CORNER} 46 L ${CORNER} 46 Q 0 46 0 ${46 - CORNER} Z`
      : '';
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
    const innerWidth = rect.width - 2 * INLINE_INSET_PX;
    if (innerWidth <= 0) return;
    const plotLeft = rect.left + INLINE_INSET_PX + (CORNER / 100) * innerWidth;
    const plotWidth = ((100 - 2 * CORNER) / 100) * innerWidth;
    const ratio = Math.min(Math.max((event.clientX - plotLeft) / plotWidth, 0), 1);
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
        <div className="absolute inset-y-0 left-2 right-2">
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
                stroke="var(--color-accent-default)"
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
            style={{ left: `${CORNER}%`, top: `${openingTop}%` }}
          />
          {point ? (
            <>
              <span
                aria-hidden="true"
                data-chart-point="halo"
                className="pointer-events-none absolute block h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-default/20"
                style={{ left: `${point.x}%`, top: `${activeTop}%` }}
              />
              <span
                aria-hidden="true"
                data-chart-point="core"
                className="pointer-events-none absolute block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-strong ring-2 ring-surface-sunken"
                style={{ left: `${point.x}%`, top: `${activeTop}%` }}
              />
            </>
          ) : null}
          {activeVisible && point ? (
            <div
              data-testid="month-balance-detail"
              className="pointer-events-none z-30 w-64 rounded-xl border border-border-subtle bg-surface-sunken p-3 shadow-elevation-2"
              style={{
                position: 'absolute',
                left: `clamp(0px, calc(${point.x}% - 8rem), calc(100% - 16rem))`,
                ...(tooltipAbove
                  ? { bottom: `calc(${100 - activeTop}% + 12px)` }
                  : { top: `calc(${activeTop}% + 12px)` }),
              }}
            >
              <p className="text-ui-11-strong text-text-primary">
                {activeIsOpening ? openingLabel : activeDay?.label}
              </p>
              {activeIsOpening ? (
                <p className="mt-0.5 text-ui-11 text-text-secondary">Cierre del mes anterior</p>
              ) : activeDay?.items && activeDay.items.length > 0 ? (
                <>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {activeDay.items.slice(0, 4).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-baseline justify-between gap-4 text-ui-11 text-text-primary"
                      >
                        <span className="truncate">{item.label}</span>
                        <span className="whitespace-nowrap font-tabular text-ui-11-strong">
                          {item.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {activeDay.items.length > 4 ? (
                    <p className="mt-1 text-ui-10 text-text-secondary">
                      y {activeDay.items.length - 4} más
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="mt-1 text-ui-11 text-text-secondary">Sin movimientos</p>
              )}
              <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-border-subtle pt-2 text-ui-11 text-text-secondary">
                <span>{activeIsOpening ? 'Saldo al cierre' : 'Saldo tras el día'}</span>
                <span className="whitespace-nowrap font-tabular text-ui-12-strong text-text-primary">
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
