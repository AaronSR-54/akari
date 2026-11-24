import { describe, expect, it } from 'vitest';
import {
  add,
  compare,
  decimalString,
  formatMoney,
  money,
  parseAmountToMinor,
  subtract,
} from './money.js';

describe('money', () => {
  it('suma y resta en unidad menor sin coma flotante', () => {
    const a = money(1050, 'EUR');
    const b = money(499, 'EUR');
    expect(add(a, b).minor).toBe(1549);
    expect(subtract(a, b).minor).toBe(551);
    expect(decimalString(add(a, b))).toBe('15.49');
  });

  it('compara importes de la misma divisa', () => {
    expect(compare(money(100, 'EUR'), money(200, 'EUR'))).toBe(-1);
    expect(compare(money(200, 'EUR'), money(200, 'EUR'))).toBe(0);
    expect(() => compare(money(1, 'EUR'), money(1, 'USD'))).toThrow(/divisas/);
  });

  it('formatea con signo explícito y locale es-ES', () => {
    expect(formatMoney(money(-1234, 'EUR'))).toContain('−');
    expect(formatMoney(money(1234, 'EUR'), { signed: true })).toMatch(/^\+/);
    expect(formatMoney(money(0, 'EUR'))).toContain('0,00');
  });

  it('redondea al crear el importe', () => {
    expect(money(10.6, 'EUR').minor).toBe(11);
  });

  it('interpreta coma decimal y separadores de miles', () => {
    expect(parseAmountToMinor('1.234,56', 'EUR')).toBe(123456);
    expect(parseAmountToMinor('1234,5', 'EUR')).toBe(123450);
    expect(parseAmountToMinor('', 'EUR')).toBeNull();
    expect(parseAmountToMinor('abc', 'EUR')).toBeNull();
  });

  it('respeta divisas sin decimales', () => {
    expect(parseAmountToMinor('1500', 'JPY')).toBe(1500);
    expect(formatMoney(money(1500, 'JPY'))).toContain('JPY');
    expect(formatMoney(money(1500, 'JPY'))).not.toContain(',');
  });
});
