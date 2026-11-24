import { expect, test } from '@playwright/test';
import { seedDemo, startEmpty } from './helpers';

test.describe('onboarding', () => {
  test('primera apertura redirige y empezar vacío no se repite', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByRole('heading', { name: /Tus cuentas/ })).toBeVisible();
    await page.getByRole('button', { name: 'Empezar vacío' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /Buen[oa]s/ })).toBeVisible();
    await expect(page.getByText('Tu resumen empieza con una cuenta')).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /Buen[oa]s/ })).toBeVisible();
  });

  test('los datos de ejemplo crean cuentas y grupos', async ({ page }) => {
    await seedDemo(page);
    await expect(page.getByText('Cuenta diaria')).toBeVisible();
    await expect(page.getByText('Cuenta conjunta')).toBeVisible();
    await expect(page.getByText('Depósito a plazo')).toBeVisible();
    await page.getByRole('link', { name: 'Grupos', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: 'Grupos' })).toBeVisible();
    await expect(page.getByText('Piso compartido')).toBeVisible();
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
