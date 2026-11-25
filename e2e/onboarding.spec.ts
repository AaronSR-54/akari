import { expect, test } from '@playwright/test';
import { expectGreetingForViewport, expectHeadingForViewport, seedDemo, startEmpty } from './helpers';

test.describe('onboarding', () => {
  test('primera apertura redirige y empezar vacío no se repite', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByRole('heading', { name: /Tus cuentas/ })).toBeVisible();
    await page.getByRole('button', { name: 'Empezar vacío' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expectGreetingForViewport(page);
    await expect(page.getByText('Tu resumen empieza con una cuenta')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Añadir movimiento' }).first()).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/$/);
    await expectGreetingForViewport(page);
  });

  test('los datos de ejemplo crean cuentas y grupos', async ({ page }) => {
    await seedDemo(page);
    await expect(page.getByText('Cuenta diaria')).toBeVisible();
    await expect(page.getByText('Cuenta conjunta')).toBeVisible();
    await expect(page.getByText('Depósito a plazo')).toBeVisible();
    await page.getByRole('link', { name: 'Grupos', exact: true }).first().click();
    await expectHeadingForViewport(page, 'Grupos');
    await expect(page.getByText('Piso compartido')).toBeVisible();
  });

  test('refresca un demo antiguo sin rebotar al onboarding', async ({ page }) => {
    await seedDemo(page);

    // Simula una demo guardada por una versión anterior: sin versión de seed
    // y con un único movimiento, que producía una línea plana.
    await page.evaluate(async () => {
      const openDatabase = () =>
        new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('akari');
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      const database = await openDatabase();
      const transaction = database.transaction(['settings', 'movements'], 'readwrite');
      const settingsStore = transaction.objectStore('settings');
      const movementsStore = transaction.objectStore('movements');
      const settings = await new Promise<Record<string, unknown>>((resolve) => {
        const request = settingsStore.get('app');
        request.onsuccess = () => resolve(request.result);
      });
      delete settings.demoSeedVersion;
      settingsStore.put(settings);
      const movements = await new Promise<Array<{ id: string }>>((resolve) => {
        const request = movementsStore.getAll();
        request.onsuccess = () => resolve(request.result);
      });
      for (const movement of movements.slice(1)) movementsStore.delete(movement.id);
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
      database.close();
    });

    await page.reload();
    await expect(page).toHaveURL(/\/$/);
    await expectGreetingForViewport(page);
    await expect(page.locator('[data-hero="month-summary"]')).toContainText(
      'Saldo total estimado a fin de mes',
    );
  });

  test('el aviso de almacenamiento sin cifrado es visible', async ({ page }) => {
    await startEmpty(page);
    await page.getByRole('link', { name: 'Ajustes', exact: true }).first().click();
    await expect(page.getByText('Esta fase es local y sin cifrado')).toBeVisible();
    await expect(page.getByRole('link', { name: /Ver desviaciones documentadas/ })).toHaveAttribute(
      'href',
      /desviaciones\.md/,
    );
  });
});
