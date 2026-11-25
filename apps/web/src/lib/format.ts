import { format, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { appNow, appTodayKey } from './clock';

/** Fechas de negocio (`yyyy-MM-dd`) a medianoche local segura para formatear. */
export function parseDateOnly(value: string): Date {
  return new Date(`${value}T12:00:00`);
}

export function formatShortDate(value: string): string {
  return format(parseDateOnly(value), 'd MMM', { locale: es });
}

export function formatLongDate(value: string): string {
  return format(parseDateOnly(value), 'd MMM yyyy', { locale: es });
}

export function formatDayMonth(value: string): string {
  return format(parseDateOnly(value), "d 'de' MMMM", { locale: es });
}

/** Inicial de día de una fecha de negocio en español (L, M, X, J, V, S, D). */
export function formatWeekdayLabel(value: string): string {
  return format(parseDateOnly(value), 'EEEEE', { locale: es });
}

/** «jue 26 nov» para cabeceras de detalle diario. */
export function formatWeekdayDate(value: string): string {
  return format(parseDateOnly(value), 'EEE d MMM', { locale: es });
}

/** «jueves 26 de noviembre» para descripciones accesibles. */
export function formatWeekdayFullDate(value: string): string {
  return format(parseDateOnly(value), "EEEE d 'de' MMMM", { locale: es });
}

/** Rango corto para el tooltip del gráfico: «23–29 nov». */
export function formatWeekRangeCompact(first: string, last: string): string {
  const start = parseDateOnly(first);
  const end = parseDateOnly(last);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth
    ? `${format(start, 'd')}–${format(end, 'd MMM', { locale: es })}`
    : `${format(start, 'd MMM', { locale: es })}–${format(end, 'd MMM', { locale: es })}`;
}

/** Rango visible de la semana, con «hoy» cuando el último día es hoy en el mock. */
export function formatWeekRange(first: string, last: string): string {
  const start = format(parseDateOnly(first), 'EEE d', { locale: es });
  const end = last === appTodayKey() ? 'hoy' : format(parseDateOnly(last), 'EEE d', { locale: es });
  return `${start} – ${end}`;
}

export function formatWeekdayLabels(count = 7): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = appNow();
    date.setDate(date.getDate() - (count - 1 - index));
    return format(date, 'EEEEE', { locale: es });
  });
}

export function formatFullDate(date = appNow()): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: es });
}

export function formatMonthYear(date = appNow()): string {
  return format(date, "LLLL 'de' yyyy", { locale: es });
}

export function formatMonthShort(date = appNow()): string {
  return format(date, 'LLLL', { locale: es });
}

export function formatUpdated(iso: string): string {
  return `Actualizada ${formatDistance(new Date(iso), appNow(), { addSuffix: true, locale: es })}`;
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
