import { expect, test } from '@playwright/test';
import { seedDemo } from './helpers';

test.describe('shell web', () => {
  test('sidebar, tablet y móvil sin desbordamiento', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await expect(page.locator('aside')).toBeVisible();

    await page.setViewportSize({ width: 900, height: 900 });
    await expect(page.locator('aside')).toBeHidden();
    await expect(page.getByRole('navigation', { name: 'Navegación principal' }).first()).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('navigation', { name: 'Navegación principal' }).last()).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('deep links y atajo de búsqueda', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/cuentas/demo-acc-day');
    await expect(page.getByRole('heading', { name: 'Cuenta diaria' })).toBeVisible();
    await expect(page).toHaveTitle('Cuenta diaria · akari');
    await expect(page.getByText(/Resumen.*Cuentas.*Cuenta diaria/)).toBeVisible();

    await page.goto('/movimientos?cuenta=demo-acc-day');
    await expect(page.getByLabel('Cuenta', { exact: true })).toHaveValue('demo-acc-day');

    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Buscar en akari' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('searchbox')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('la sidebar se expande con hover y foco', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    const aside = page.locator('aside');
    await expect(aside).toHaveAttribute('data-expanded', 'false');
    await aside.hover();
    await expect(aside).toHaveAttribute('data-expanded', 'true');
    await page.mouse.move(600, 400);
    await expect(aside).toHaveAttribute('data-expanded', 'false');

    await aside.getByRole('link', { name: 'Movimientos' }).focus();
    await expect(aside).toHaveAttribute('data-expanded', 'true');
    await page.locator('main').click({ position: { x: 10, y: 10 } });
    await expect(aside).toHaveAttribute('data-expanded', 'false');
  });

  test('el error de almacenamiento conserva la navegación', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'indexedDB', { value: undefined, configurable: true });
    });
    await page.goto('/');
    await expect(page.getByText('No se puede abrir el almacenamiento local')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navegación principal' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ajustes', exact: true }).first()).toBeVisible();
  });
});
