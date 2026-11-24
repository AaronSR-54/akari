import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

export function formatWeekdayLabels(count = 7): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return format(date, 'EEEEE', { locale: es });
  });
}

export function formatFullDate(date = new Date()): string {
  return format(date, "EEEE, d 'de' MMMM", { locale: es });
}

export function formatMonthYear(date = new Date()): string {
  return format(date, "LLLL 'de' yyyy", { locale: es });
}

export function formatMonthShort(date = new Date()): string {
  return format(date, 'LLLL', { locale: es });
}

export function formatUpdated(iso: string): string {
  return `Actualizada ${formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es })}`;
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
