import { expect, test, type Page } from '@playwright/test';
import { seedDemo } from './helpers';

function visible(page: Page, text: string | RegExp) {
  return page.getByText(text).filter({ visible: true }).first();
}

test.describe('modal de movimiento', () => {
  test('crea un movimiento sin salir del listado', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');

    await page.getByRole('button', { name: 'Añadir movimiento' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Nuevo movimiento' });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/movimientos$/);

    await dialog.getByLabel('Importe').fill('42,50');
    await dialog.getByLabel('Concepto').fill('Cena en modal');
    await dialog.getByRole('button', { name: 'Guardar movimiento' }).click();

    await expect(dialog).toBeHidden();
    await expect(visible(page, 'Cena en modal')).toBeVisible();
    await expect(page).toHaveURL(/\/movimientos$/);
  });

  test('edita tipo, importe, concepto y nota en el modal', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');
    await page.getByRole('searchbox', { name: 'Buscar movimientos' }).fill('Cena con amigos');

    await page.getByRole('button', { name: 'Editar' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Editar movimiento' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Cuenta')).toBeVisible();
    await expect(page).toHaveURL(/\/movimientos$/);

    await dialog
      .getByRole('group', { name: 'Tipo de movimiento' })
      .getByRole('button', { name: 'Ingreso' })
      .click();
    await dialog.getByLabel('Importe').fill('52,00');
    await dialog.getByLabel('Concepto').fill('Cena reembolsada');
    await dialog.getByLabel('Nota').fill('La pagó Luis');
    await dialog.getByRole('button', { name: 'Guardar' }).click();

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/movimientos$/);

    await page.getByRole('searchbox', { name: 'Buscar movimientos' }).fill('Cena reembolsada');
    await expect(visible(page, 'Cena reembolsada')).toBeVisible();
    await expect(visible(page, /\+52,00/)).toBeVisible();
  });
});
