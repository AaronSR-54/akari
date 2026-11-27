import { toStorageError } from '@akari/domain';
import type { AkariDB } from './db.js';
import { createRepositories } from './repositories.js';
import { DEMO_SEED_VERSION, seedDemoData } from './seed.js';

export async function loadDemoDatabase(db: AkariDB, today = new Date()): Promise<void> {
  // Todo en una transacción: si la demo se refresca con la app abierta, las
  // vistas no llegan a ver la configuración por defecto (sin onboarding) y
  // no rebotan a la pantalla de bienvenida.
  const owner = await db.syncMeta.get('ownerId');
  await db.transaction('rw', db.tables, async () => {
    for (const name of db.tables.map((table) => table.name)) {
      await db.table(name).clear();
    }
    // La demo sustituye los datos, no la cuenta vinculada al dispositivo.
    if (owner) await db.syncMeta.put(owner);
    const repositories = createRepositories(db);
    await seedDemoData(repositories, today);
    await repositories.settings.update({
      onboardingCompleted: true,
      demoLoaded: true,
      demoSeedVersion: DEMO_SEED_VERSION,
      theme: 'system',
      shellMode: 'sidebar',
    });
  });
}

export async function resetDatabase(db: AkariDB): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const name of db.tables.map((table) => table.name)) {
      await db.table(name).clear();
    }
  });
}

export type StorageStatus = {
  available: boolean;
  usage: number | null;
  quota: number | null;
  persisted: boolean | null;
  message: string;
};

export async function getStorageStatus(): Promise<StorageStatus> {
  if (typeof indexedDB === 'undefined') {
    return {
      available: false,
      usage: null,
      quota: null,
      persisted: null,
      message:
        'Este navegador no permite almacenamiento local. Los cambios no se pueden guardar en este dispositivo.',
    };
  }

  try {
    const estimate = await navigator.storage?.estimate?.();
    const persisted = (await navigator.storage?.persisted?.()) ?? null;
    return {
      available: true,
      usage: estimate?.usage ?? null,
      quota: estimate?.quota ?? null,
      persisted,
      message: 'Los datos se guardan en este navegador. El cifrado y la sincronización llegan en una fase posterior.',
    };
  } catch (error) {
    const storageError = toStorageError(error);
    return {
      available: false,
      usage: null,
      quota: null,
      persisted: null,
      message: storageError.message,
    };
  }
}

export function storageErrorMessage(error: unknown): string {
  return toStorageError(error).message;
}
