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

export type CalendarProps = {
  value?: string;
  onSelect: (value: string) => void;
  onCancel?: () => void;
  labelledBy?: string;
};

export function Calendar({ value, onSelect, onCancel, labelledBy }: CalendarProps) {
  const monthLabelId = useId();
  const todayKey = todayBusinessKey();
  const [activeKey, setActiveKey] = useState(value ?? todayKey);
  const [month, setMonth] = useState(() => {
    const base = parseBusinessDate(value ?? todayKey);
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());

  const activeDate = parseBusinessDate(activeKey);
  const days = startOfMonthGrid(month);

  useEffect(() => {
    cellRefs.current.get(activeKey)?.focus();
  }, [activeKey]);

  const moveActive = (next: Date) => {
    setActiveKey(toBusinessKey(next));
    if (next.getMonth() !== month.getMonth() || next.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const changeMonth = (delta: number) => {
    const next = addMonths(activeDate, delta);
    setActiveKey(toBusinessKey(next));
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const selectDay = (key: string) => {
    setActiveKey(key);
    onSelect(key);
  };

  const selectToday = () => {
    const today = parseBusinessDate(todayKey);
    setActiveKey(todayKey);
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
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
    moveActive(next);
  };

  return (
    <div className="flex w-full flex-col gap-3" onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between gap-2">
        <IconButton
          icon={<IconChevronLeft size={16} />}
          aria-label="Mes anterior"
          onClick={() => changeMonth(-1)}
        />
        <p id={monthLabelId} aria-live="polite" className="text-ui-13-strong text-text-primary">
          {monthLabel(month)}
        </p>
        <IconButton
          icon={<IconChevronLeft size={16} className="rotate-180" />}
          aria-label="Mes siguiente"
          onClick={() => changeMonth(1)}
        />
      </div>
      <div
        role="grid"
        aria-labelledby={labelledBy ?? monthLabelId}
        className="flex flex-col gap-1"
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
                      selected && 'bg-surface-inverse text-text-inverse',
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
      <Button variant="tertiary" className="w-full" onClick={selectToday}>
        Hoy
      </Button>
    </div>
  );
}
