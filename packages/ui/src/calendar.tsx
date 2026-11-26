'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Button, IconButton } from './buttons.js';
import { cn } from './cn.js';
import {
  addDays,
  addMonths,
  formatBusinessDate,
  monthLabel,
  parseBusinessDate,
  startOfMonthGrid,
  toBusinessKey,
  todayBusinessKey,
} from './dates.js';
import { IconChevronLeft } from './icons.js';

const WEEKDAYS = [
  { short: 'L', long: 'lunes' },
  { short: 'M', long: 'martes' },
  { short: 'X', long: 'miércoles' },
  { short: 'J', long: 'jueves' },
  { short: 'V', long: 'viernes' },
  { short: 'S', long: 'sábado' },
  { short: 'D', long: 'domingo' },
];

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const YEARS_PER_PAGE = 12;
const DECADE = 10;

function decadeStart(year: number): number {
  return Math.floor(year / DECADE) * DECADE - 1;
}

type CalendarView = 'days' | 'months' | 'years';

export type CalendarProps = {
  value?: string;
  onSelect: (value: string) => void;
  onCancel?: () => void;
  labelledBy?: string;
};

function clampToMonth(source: Date, year: number, monthIndex: number): Date {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return new Date(year, monthIndex, Math.min(source.getDate(), lastDay));
}

export function Calendar({ value, onSelect, onCancel, labelledBy }: CalendarProps) {
  const monthLabelId = useId();
  const todayKey = todayBusinessKey();
  const today = parseBusinessDate(todayKey);
  const selectedDate = value ? parseBusinessDate(value) : null;
  const selectedMonth = selectedDate?.getMonth();
  const selectedYear = selectedDate?.getFullYear();
  const [view, setView] = useState<CalendarView>('days');
  const [activeKey, setActiveKey] = useState(value ?? todayKey);
  const [month, setMonth] = useState(() => {
    const base = parseBusinessDate(value ?? todayKey);
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [yearStart, setYearStart] = useState(() =>
    decadeStart(parseBusinessDate(value ?? todayKey).getFullYear()),
  );
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());
  const monthRefs = useRef(new Map<number, HTMLButtonElement>());
  const yearRefs = useRef(new Map<number, HTMLButtonElement>());

  const activeDate = parseBusinessDate(activeKey);
  const days = startOfMonthGrid(month);
  const gridLabel = labelledBy ?? monthLabelId;

  useEffect(() => {
    if (view !== 'days') return;
    cellRefs.current.get(activeKey)?.focus();
  }, [activeKey, view]);

  useEffect(() => {
    if (view === 'months') {
      const target =
        selectedYear === month.getFullYear() && selectedMonth !== undefined
          ? selectedMonth
          : month.getMonth();
      monthRefs.current.get(target)?.focus();
    } else if (view === 'years') {
      yearRefs.current.get(month.getFullYear())?.focus();
    }
  }, [view, month, selectedMonth, selectedYear]);

  const showMonth = (year: number, monthIndex: number) => {
    setMonth(new Date(year, monthIndex, 1));
    setActiveKey(toBusinessKey(clampToMonth(activeDate, year, monthIndex)));
  };

  const changeMonth = (delta: number) => {
    const next = addMonths(activeDate, delta);
    setActiveKey(toBusinessKey(next));
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const shift = (delta: number) => {
    if (view === 'days') changeMonth(delta);
    else if (view === 'months') showMonth(month.getFullYear() + delta, month.getMonth());
    else setYearStart(yearStart + delta * DECADE);
  };

  const cycleView = () => {
    if (view === 'days') {
      setView('months');
      return;
    }
    if (view === 'months') {
      setYearStart(decadeStart(month.getFullYear()));
      setView('years');
      return;
    }
    setView('days');
  };

  const selectDay = (key: string) => {
    setActiveKey(key);
    onSelect(key);
  };

  const selectMonth = (index: number) => {
    showMonth(month.getFullYear(), index);
    setView('days');
  };

  const selectYear = (year: number) => {
    showMonth(year, month.getMonth());
    setView('months');
  };

  const selectToday = () => {
    setActiveKey(todayKey);
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setView('days');
    onSelect(todayKey);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel?.();
      return;
    }
    const target = event.target as HTMLElement | null;
    if (!target?.dataset.day) return;

    const offset = (activeDate.getDay() + 6) % 7;
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(activeDate, -1);
        break;
      case 'ArrowRight':
        next = addDays(activeDate, 1);
        break;
      case 'ArrowUp':
        next = addDays(activeDate, -7);
        break;
      case 'ArrowDown':
        next = addDays(activeDate, 7);
        break;
      case 'Home':
        next = addDays(activeDate, -offset);
        break;
      case 'End':
        next = addDays(activeDate, 6 - offset);
        break;
      case 'PageUp':
        next = addMonths(activeDate, -1);
        break;
      case 'PageDown':
        next = addMonths(activeDate, 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    setActiveKey(toBusinessKey(next));
    if (next.getMonth() !== month.getMonth() || next.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const headerLabel =
    view === 'days'
      ? monthLabel(month)
      : view === 'months'
        ? String(month.getFullYear())
        : `${yearStart}–${yearStart + YEARS_PER_PAGE - 1}`;
  const headerAction =
    view === 'days'
      ? `Elegir mes y año de ${monthLabel(month)}`
      : view === 'months'
        ? `Elegir año de ${month.getFullYear()}`
        : 'Volver a la rejilla de días';
  const previousLabel =
    view === 'years' ? 'Década anterior' : view === 'months' ? 'Año anterior' : 'Mes anterior';
  const nextLabel =
    view === 'years' ? 'Década siguiente' : view === 'months' ? 'Año siguiente' : 'Mes siguiente';

  return (
    <div className="flex w-full flex-col gap-3" onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between gap-2">
        <IconButton
          icon={<IconChevronLeft size={16} />}
          aria-label={previousLabel}
          onClick={() => shift(-1)}
        />
        <button
          type="button"
          onClick={cycleView}
          aria-label={headerAction}
          className="rounded-md px-2 py-1 text-ui-13-strong text-text-primary transition-colors duration-fast hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <span id={monthLabelId} aria-live="polite">
            {headerLabel}
          </span>
        </button>
        <IconButton
          icon={<IconChevronLeft size={16} className="rotate-180" />}
          aria-label={nextLabel}
          onClick={() => shift(1)}
        />
      </div>

      <div data-testid="calendar-body" className="flex min-h-80 flex-1 flex-col justify-center">
      {view === 'days' ? (
        <div role="grid" aria-labelledby={gridLabel} className="flex flex-col gap-1">
          <div role="row" className="grid grid-cols-7">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday.long}
                role="columnheader"
                aria-label={weekday.long}
                className="flex h-8 items-center justify-center text-ui-10 text-text-tertiary"
              >
                {weekday.short}
              </div>
            ))}
          </div>
          {Array.from({ length: 6 }, (_, row) => (
            <div key={row} role="row" className="grid grid-cols-7">
              {days.slice(row * 7, row * 7 + 7).map((day) => {
                const key = toBusinessKey(day);
                const outside = day.getMonth() !== month.getMonth();
                const selected = key === value;
                const isActive = key === activeKey;
                const isToday = key === todayKey;
                return (
                  <div
                    key={key}
                    role="gridcell"
                    aria-selected={selected}
                    className="flex items-center justify-center"
                  >
                    <button
                      type="button"
                      ref={(element) => {
                        if (element) cellRefs.current.set(key, element);
                        else cellRefs.current.delete(key);
                      }}
                      data-day={key}
                      data-autofocus={isActive ? true : undefined}
                      disabled={outside}
                      tabIndex={isActive ? 0 : -1}
                      aria-label={formatBusinessDate(key)}
                      aria-current={isToday ? 'date' : undefined}
                      onClick={() => selectDay(key)}
                      className={cn(
                        'flex h-11 w-full min-w-11 items-center justify-center rounded-lg text-ui-12 transition-colors duration-fast motion-reduce:transition-none',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                        outside && 'cursor-default text-text-disabled',
                        !outside && !selected && 'text-text-primary hover:bg-surface-sunken',
                        selected && 'bg-accent-default text-accent-ink hover:brightness-95',
                        isToday && !selected && 'ring-1 ring-border-strong',
                      )}
                    >
                      {day.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}

      {view === 'months' ? (
        <div role="grid" aria-labelledby={gridLabel} className="flex flex-1 flex-col justify-evenly gap-3">
          {Array.from({ length: 4 }, (_, row) => (
            <div key={row} role="row" className="grid grid-cols-3 gap-3">
              {MONTHS.slice(row * 3, row * 3 + 3).map((name, index) => {
                const monthIndex = row * 3 + index;
                const selected =
                  selectedYear === month.getFullYear() && selectedMonth === monthIndex;
                const isCurrent =
                  today.getFullYear() === month.getFullYear() && today.getMonth() === monthIndex;
                return (
                  <div key={name} role="gridcell" aria-selected={selected} className="flex">
                    <button
                      type="button"
                      ref={(element) => {
                        if (element) monthRefs.current.set(monthIndex, element);
                        else monthRefs.current.delete(monthIndex);
                      }}
                      data-month={monthIndex}
                      aria-label={`${name} de ${month.getFullYear()}`}
                      aria-current={isCurrent ? 'true' : undefined}
                      onClick={() => selectMonth(monthIndex)}
                      className={cn(
                        'h-11 w-full rounded-lg text-ui-12 transition-colors duration-fast motion-reduce:transition-none',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                        selected
                          ? 'bg-accent-default text-accent-ink hover:brightness-95'
                          : 'text-text-primary hover:bg-surface-sunken',
                        isCurrent && !selected && 'ring-1 ring-border-strong',
                      )}
                    >
                      {name}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}

      {view === 'years' ? (
        <div role="grid" aria-labelledby={gridLabel} className="flex flex-1 flex-col justify-evenly gap-3">
          {Array.from({ length: 4 }, (_, row) => (
            <div key={row} role="row" className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }, (_, column) => {
                const year = yearStart + row * 3 + column;
                const selected = selectedYear === year;
                const isCurrent = today.getFullYear() === year;
                return (
                  <div key={year} role="gridcell" aria-selected={selected} className="flex">
                    <button
                      type="button"
                      ref={(element) => {
                        if (element) yearRefs.current.set(year, element);
                        else yearRefs.current.delete(year);
                      }}
                      data-year={year}
                      aria-label={String(year)}
                      aria-current={isCurrent ? 'true' : undefined}
                      onClick={() => selectYear(year)}
                      className={cn(
                        'h-11 w-full rounded-lg text-ui-12 transition-colors duration-fast motion-reduce:transition-none',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                        selected
                          ? 'bg-accent-default text-accent-ink hover:brightness-95'
                          : 'text-text-primary hover:bg-surface-sunken',
                        isCurrent && !selected && 'ring-1 ring-border-strong',
                      )}
                    >
                      {year}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
      </div>

      <Button variant="tertiary" className="w-full" onClick={selectToday}>
        Hoy
      </Button>
    </div>
  );
}

export type MonthDayPickerProps = {
  /** Día del mes seleccionado (1-31) o null/undefined si no hay ninguno. */
  value?: number | null;
  onSelect: (day: number) => void;
  label?: string;
};

/**
 * Rejilla tipo calendario para elegir solo el día del mes (1-31), sin mes ni año.
 * Reutiliza los estilos y la navegación por teclado del calendario completo.
 */
export function MonthDayPicker({ value, onSelect, label = 'Día del mes' }: MonthDayPickerProps) {
  const today = todayBusinessKey();
  const todayDay = parseBusinessDate(today).getDate();
  const [active, setActive] = useState(value ?? todayDay);
  const refs = useRef(new Map<number, HTMLButtonElement>());

  useEffect(() => {
    if (value) setActive(value);
  }, [value]);

  const move = (event: ReactKeyboardEvent<HTMLDivElement>, day: number) => {
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = day - 1;
        break;
      case 'ArrowRight':
        next = day + 1;
        break;
      case 'ArrowUp':
        next = day - 7;
        break;
      case 'ArrowDown':
        next = day + 7;
        break;
      case 'Home':
        next = 1;
        break;
      case 'End':
        next = 31;
        break;
      default:
        return;
    }
    event.preventDefault();
    const target = Math.min(31, Math.max(1, next));
    setActive(target);
    refs.current.get(target)?.focus();
  };

  const rows = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => row * 7 + column + 1),
  );

  return (
    <div
      role="grid"
      aria-label={label}
      className="rounded-xl border border-border-subtle bg-surface-default p-3"
      onKeyDown={(event) => {
        const target = event.target as HTMLElement | null;
        const day = Number(target?.dataset.monthDay ?? '');
        if (Number.isInteger(day) && day >= 1 && day <= 31) move(event, day);
      }}
    >
      <div role="row" className="grid grid-cols-7">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday.long}
            role="columnheader"
            aria-label={weekday.long}
            className="flex h-8 items-center justify-center text-ui-10 text-text-tertiary"
          >
            {weekday.short}
          </div>
        ))}
      </div>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} role="row" className="grid grid-cols-7">
          {row.map((day) => {
            if (day > 31) {
              return <div key={`empty-${day}`} role="gridcell" aria-hidden="true" />;
            }
            const selected = value === day;
            const isToday = day === todayDay;
            return (
              <div key={day} role="gridcell" aria-selected={selected} className="flex items-center justify-center">
                <button
                  type="button"
                  ref={(element) => {
                    if (element) refs.current.set(day, element);
                    else refs.current.delete(day);
                  }}
                  data-month-day={day}
                  tabIndex={active === day ? 0 : -1}
                  aria-label={`Día ${day} de cada mes`}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => {
                    setActive(day);
                    onSelect(day);
                  }}
                  className={cn(
                    'flex h-11 w-full min-w-11 items-center justify-center rounded-lg text-ui-12 transition-colors duration-fast motion-reduce:transition-none',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                    !selected && 'text-text-primary hover:bg-surface-sunken',
                    selected && 'bg-accent-default text-accent-ink hover:brightness-95',
                    isToday && !selected && 'ring-1 ring-border-strong',
                  )}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
