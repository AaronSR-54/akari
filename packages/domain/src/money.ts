export type Currency = string;

export type Money = {
  /** Importe en la unidad menor de la divisa (céntimos, yenes, etc.). */
  minor: number;
  currency: Currency;
};

const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'CLP', 'ISK']);
const THREE_DECIMAL = new Set(['BHD', 'KWD', 'OMR', 'TND', 'JOD']);

export function minorDigits(currency: Currency): number {
  const code = currency.toUpperCase();
  if (ZERO_DECIMAL.has(code)) return 0;
  if (THREE_DECIMAL.has(code)) return 3;
  return 2;
}

export function factorFor(currency: Currency): number {
  return 10 ** minorDigits(currency);
}

export function money(minor: number, currency: Currency): Money {
  if (!Number.isFinite(minor)) throw new Error('El importe debe ser un número finito');
  return { minor: Math.round(minor), currency: currency.toUpperCase() };
}

export function zero(currency: Currency): Money {
  return money(0, currency);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`No se pueden operar divisas distintas: ${a.currency} y ${b.currency}`);
  }
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.minor + b.minor, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.minor - b.minor, a.currency);
}

export function negate(a: Money): Money {
  return money(-a.minor, a.currency);
}

export function multiply(a: Money, factor: number): Money {
  return money(a.minor * factor, a.currency);
}

export function compare(a: Money, b: Money): number {
  assertSameCurrency(a, b);
  return a.minor === b.minor ? 0 : a.minor < b.minor ? -1 : 1;
}

export function isZero(a: Money): boolean {
  return a.minor === 0;
}

export function formatMoney(
  value: Money,
  options: { locale?: string; signed?: boolean } = {},
): string {
  const { locale = 'es-ES', signed = false } = options;
  const digits = minorDigits(value.currency);
  const abs = Math.abs(value.minor) / factorFor(value.currency);
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency.toUpperCase(),
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    // es-ES omite el separador de miles en cifras de cuatro dígitos; el diseño
    // siempre lo muestra (1.482,01 €), así que forzamos la agrupación.
    useGrouping: 'always',
  } as unknown as Intl.NumberFormatOptions).format(abs);
  const sign = value.minor < 0 ? '−' : signed && value.minor > 0 ? '+' : '';
  return `${sign}${formatted}`;
}

export function formatMinor(
  minor: number,
  currency: Currency,
  options: { locale?: string; signed?: boolean } = {},
): string {
  return formatMoney(money(minor, currency), options);
}

export function parseAmountToMinor(input: string, currency: Currency): number | null {
  const cleaned = input
    .trim()
    .replace(/\u00a0/g, '')
    .replace(/[€$£¥]/g, '')
    .replace(/\s/g, '');
  if (!cleaned) return null;

  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned.replace(/,/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * factorFor(currency));
}

export function decimalString(value: Money): string {
  return (value.minor / factorFor(value.currency)).toFixed(minorDigits(value.currency));
}
