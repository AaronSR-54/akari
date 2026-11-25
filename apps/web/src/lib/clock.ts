import { format } from 'date-fns';

/**
 * Fecha fija del mock: el domingo 29 de noviembre de 2026 cierra una semana
 * completa (23–29) para que el resumen y sus datos de ejemplo no cambien.
 * Se puede sobrescribir con NEXT_PUBLIC_AKARI_NOW (ISO 8601) sin tocar código.
 */
export const MOCK_NOW = '2026-11-29T12:00:00';

export function appNow(): Date {
  return new Date(process.env.NEXT_PUBLIC_AKARI_NOW ?? MOCK_NOW);
}

export function appTodayKey(): string {
  return format(appNow(), 'yyyy-MM-dd');
}
