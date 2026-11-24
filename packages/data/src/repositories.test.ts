import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAccount, deleteAccount, recordMovement, ValidationError } from '@akari/domain';
import { AkariDB } from './db.js';
import { createRepositories } from './repositories.js';

let db: AkariDB;
let repositories: ReturnType<typeof createRepositories>;

beforeEach(() => {
  db = new AkariDB(`test-${Math.random().toString(36).slice(2)}`);
  repositories = createRepositories(db);
});

afterEach(async () => {
  await db.delete();
});

describe('repositories', () => {
  it('crea cuentas y calcula saldos con movimientos', async () => {
    const account = await createAccount(repositories, {
      name: 'Diaria',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 100000,
    });
    await recordMovement(repositories, {
      accountId: account.id,
      type: 'expense',
      amountMinor: 2500,
      date: '2026-11-10',
      concept: 'Cena',
      category: 'Ocio',
    });
    const movements = await repositories.movements.listByAccount(account.id);
    expect(movements).toHaveLength(1);
    expect(movements[0]?.amountMinor).toBe(2500);
  });

  it('rechaza movimientos de cuentas inexistentes', async () => {
    await expect(
      recordMovement(repositories, {
        accountId: 'no-existe',
        type: 'expense',
        amountMinor: 100,
        date: '2026-11-10',
        concept: 'X',
        category: 'Ocio',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(await repositories.movements.list()).toHaveLength(0);
  });

  it('bloquea el borrado de cuentas con movimientos', async () => {
    const account = await createAccount(repositories, {
      name: 'Diaria',
      type: 'personal',
      currency: 'EUR',
      initialBalanceMinor: 1000,
    });
    await recordMovement(repositories, {
      accountId: account.id,
      type: 'expense',
      amountMinor: 100,
      date: '2026-11-10',
      concept: 'X',
      category: 'Ocio',
    });
    await expect(deleteAccount(repositories, account.id)).rejects.toThrow(/movimientos/);
  });

  it('devuelve ajustes por defecto y persiste cambios', async () => {
    expect((await repositories.settings.get()).onboardingCompleted).toBe(false);
    const updated = await repositories.settings.update({ onboardingCompleted: true, theme: 'dark' });
    expect(updated.onboardingCompleted).toBe(true);
    expect((await repositories.settings.get()).theme).toBe('dark');
  });

  it('revierte las escrituras de una transacción fallida', async () => {
    await expect(
      repositories.transaction!(async () => {
        await repositories.accounts.put({
          id: 'acc-atomic',
          name: 'Atómica',
          type: 'personal',
          currency: 'EUR',
          initialBalanceMinor: 1000,
          includeInTotal: true,
          createdAt: '2026-11-10T00:00:00.000Z',
          updatedAt: '2026-11-10T00:00:00.000Z',
        });
        throw new Error('fallo simulado');
      }),
    ).rejects.toThrow('fallo simulado');
    expect(await repositories.accounts.list()).toHaveLength(0);
  });
});
