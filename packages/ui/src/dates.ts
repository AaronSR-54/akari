const BUSINESS_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const MONTH_FORMATTER = new Intl.DateTimeFormat('es-ES', { month: 'long' });

/**
 * Convierte una fecha de negocio `YYYY-MM-DD` en una fecha local a medianoche.
 * Nunca usa el constructor de cadena, que interpreta UTC y desplaza el día.
 */
export function parseBusinessDate(value: string): Date {
  const match = BUSINESS_DATE_PATTERN.exec(value);
  if (!match) {
    throw new RangeError(`Fecha de negocio no válida: ${value}`);
  }
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new RangeError(`Fecha de negocio no válida: ${value}`);
  }
  return date;
}

/** Serializa una fecha local como fecha de negocio `YYYY-MM-DD`. */
export function toBusinessKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Devuelve la fecha de negocio de hoy. */
export function todayBusinessKey(now = new Date()): string {
  return toBusinessKey(now);
}

/** Formatea `YYYY-MM-DD` como `dd MMM yyyy` en español. */
export function formatBusinessDate(value: string): string {
  return DATE_FORMATTER.format(parseBusinessDate(value)).toLowerCase();
}

/** Suma o resta días manteniendo la fecha local. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Suma o resta meses ajustando el día al último del mes destino. */
export function addMonths(date: Date, months: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), lastDay));
}

/**
 * Devuelve las 42 fechas (6 semanas) de la rejilla mensual, empezando en lunes
 * y rellenando con los días de los meses contiguos.
 */
export function startOfMonthGrid(month: Date): Date[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const offset = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => new Date(year, monthIndex, 1 - offset + index));
}

/** Etiqueta del mes visible, por ejemplo `Noviembre 2026`. */
export function monthLabel(month: Date): string {
  const label = `${MONTH_FORMATTER.format(month)} ${month.getFullYear()}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}
