import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
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

const datesPath =
  typeof import.meta.dirname === 'string'
    ? join(import.meta.dirname, 'dates.ts')
    : fileURLToPath(new URL('./dates.ts', import.meta.url));

describe('dates', () => {
  it('parsea y serializa fechas de negocio sin cambiar el día', () => {
    const date = parseBusinessDate('2026-11-25');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(25);
    expect(toBusinessKey(date)).toBe('2026-11-25');
    expect(todayBusinessKey(date)).toBe('2026-11-25');
  });

  it('rechaza fechas con formato o día inválidos', () => {
    expect(() => parseBusinessDate('25/11/2026')).toThrow(RangeError);
    expect(() => parseBusinessDate('2026-02-30')).toThrow(RangeError);
    expect(() => parseBusinessDate('2026-13-01')).toThrow(RangeError);
  });

  it('formatea en español y etiqueta el mes visible', () => {
    expect(formatBusinessDate('2026-11-25')).toBe('25 nov 2026');
    expect(formatBusinessDate('2026-01-01')).toBe('01 ene 2026');
    expect(monthLabel(parseBusinessDate('2026-11-25'))).toBe('noviembre 2026');
  });

  it('suma días y meses con ajuste de fin de mes y cambio de año', () => {
    expect(toBusinessKey(addDays(parseBusinessDate('2026-11-25'), 7))).toBe('2026-12-02');
    expect(toBusinessKey(addDays(parseBusinessDate('2026-11-01'), -1))).toBe('2026-10-31');
    expect(toBusinessKey(addMonths(parseBusinessDate('2026-01-31'), 1))).toBe('2026-02-28');
    expect(toBusinessKey(addMonths(parseBusinessDate('2026-12-15'), 1))).toBe('2027-01-15');
    expect(toBusinessKey(addMonths(parseBusinessDate('2026-01-15'), -1))).toBe('2025-12-15');
  });

  it('genera 42 días desde el lunes de la primera semana del mes', () => {
    const grid = startOfMonthGrid(parseBusinessDate('2026-11-15'));
    expect(grid).toHaveLength(42);
    expect(toBusinessKey(grid[0]!)).toBe('2026-10-26');
    expect(grid[0]!.getDay()).toBe(1);
    expect(toBusinessKey(grid[41]!)).toBe('2026-12-06');
  });

  it('una fecha YYYY-MM-DD se parsea y serializa igual con husos distintos', () => {
    const code = `
      const dates = await import(${JSON.stringify(datesPath)});
      const parsed = dates.parseBusinessDate('2026-01-01');
      process.stdout.write(JSON.stringify({
        key: dates.toBusinessKey(parsed),
        day: parsed.getDate(),
        formatted: dates.formatBusinessDate('2026-01-01'),
        nativeDay: new Date('2026-01-01').getDate(),
      }));
    `;

    const run = (tz: string) => {
      const output = execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', code], {
        env: { ...process.env, TZ: tz },
        encoding: 'utf8',
        timeout: 20_000,
      });
      return JSON.parse(output) as { key: string; day: number; formatted: string; nativeDay: number };
    };

    const madrid = run('Europe/Madrid');
    const losAngeles = run('America/Los_Angeles');

    expect(madrid).toMatchObject({ key: '2026-01-01', day: 1, formatted: '01 ene 2026', nativeDay: 1 });
    expect(losAngeles).toMatchObject({ key: '2026-01-01', day: 1, nativeDay: 31 });
    expect(losAngeles.formatted).toBe('01 ene 2026');
  });

  it('no serializa con toISOString', () => {
    expect(readFileSync(datesPath, 'utf8')).not.toContain('toISOString');
  });
});
