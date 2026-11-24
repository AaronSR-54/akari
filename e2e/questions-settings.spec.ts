import { expect, test } from '@playwright/test';
import { seedDemo } from './helpers';

test.describe('preguntas y ajustes', () => {
  test('las preguntas rápidas responden con datos de ejemplo', async ({ page }) => {
    await seedDemo(page);
    await page.getByRole('link', { name: 'Preguntas rápidas' }).click();
    await expect(page.getByRole('heading', { name: 'Preguntas rápidas' })).toBeVisible();
    await expect(page.getByText(/¿Cuál fue tu mayor gasto/)).toBeVisible();
    await expect(page.getByText(/850,00/).first()).toBeVisible();
    await expect(page.getByText('Gastos evitables').first()).toBeVisible();
    await expect(page.getByText(/117,99/).first()).toBeVisible();
  });

  test('cambia tema y shell y persiste el tema', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/ajustes');
    await page.getByLabel('Tema').selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByLabel('Navegación de escritorio').selectOption('header');
    await expect(page.locator('aside')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Navegación principal' }).first()).toBeVisible();
  });

  test('exporta e importa una copia y reinicia los datos', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/ajustes');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar copia' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^akari-copia-\d{4}-\d{2}-\d{2}\.json$/);
    const backupPath = await download.path();
    expect(backupPath).toBeTruthy();

    await page.getByLabel('Archivo de copia de seguridad').setInputFiles(backupPath!);
    await expect(page.getByText('Copia importada')).toBeVisible();

    await page.getByRole('button', { name: 'Borrar', exact: true }).click();
    await page.getByRole('dialog', { name: 'Borrar base local' }).getByRole('button', { name: 'Borrar datos' }).click();
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByRole('heading', { name: /Tus cuentas/ })).toBeVisible();
  });
});
