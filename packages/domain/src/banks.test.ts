import { describe, expect, it } from 'vitest';
import { bankCatalog, bankIds, isBankId, type BankId } from './banks.js';

describe('catálogo de bancos', () => {
  it('tiene identificadores únicos y nombres no vacíos', () => {
    const ids = bankCatalog.map((bank) => bank.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...bankIds]);
    expect(bankCatalog.every((bank) => bank.name.trim().length > 0)).toBe(true);
  });

  it('incluye las opciones especiales Efectivo y Sin banco / Otro', () => {
    expect(bankCatalog.find((bank) => bank.id === 'cash')?.name).toBe('Efectivo');
    expect(bankCatalog.find((bank) => bank.id === 'other')?.name).toBe('Sin banco / Otro');
  });

  it('reconoce solo identificadores del catálogo', () => {
    expect(isBankId('bbva')).toBe(true);
    expect(isBankId('cash')).toBe(true);
    expect(isBankId('trade-republic')).toBe(true);
    expect(isBankId('banco-inventado')).toBe(false);
    expect(isBankId(null)).toBe(false);
    expect(isBankId(42)).toBe(false);
  });

  it('declara el tipo de icono para cada banco', () => {
    const withAppIcon = bankCatalog.filter((bank) => bank.icon === 'app');
    expect(withAppIcon).toHaveLength(13);
    expect(bankCatalog.every((bank) => ['app', 'cash', 'other'].includes(bank.icon))).toBe(true);
    expect(isBankId('bbva' as BankId)).toBe(true);
  });
});
