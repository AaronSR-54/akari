import { expect, test, type Page } from '@playwright/test';
import { seedDemo } from './helpers';

function visible(page: Page, text: string) {
  return page.getByText(text).filter({ visible: true }).first();
}

function mobileOnly() {
  test.skip(test.info().project.name !== 'mobile-web', 'Cobertura específica de la hoja inferior móvil');
}

async function pickDay(page: import('@playwright/test').Page, day: number) {
  const trigger = page.getByRole('button', { name: 'Fecha' });
  await trigger.click();
  const sheet = page.getByRole('dialog', { name: 'Fecha' });
  await expect(sheet).toBeVisible();
  await expect(sheet).toHaveAttribute('aria-modal', 'true');
  await sheet.getByRole('button', { name: new RegExp(`^${String(day).padStart(2, '0')} `) }).click();
  await expect(sheet).toHaveCount(0);
  return { trigger, pickedDate: ((await trigger.textContent()) ?? '').trim() };
}

test.describe('calendario de fecha en móvil', () => {
  test('elige la fecha con la hoja inferior en el alta de movimiento', async ({ page }) => {
    mobileOnly();
    await seedDemo(page);
    await page.goto('/movimientos');
    await page.getByRole('button', { name: 'Añadir movimiento' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Nuevo movimiento' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Importe').fill('25');
    await dialog.getByLabel('Concepto').fill('Cena móvil');

    const { pickedDate } = await pickDay(page, 10);
    await dialog.getByRole('button', { name: 'Guardar movimiento' }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/movimientos$/);
    await expect(visible(page, 'Cena móvil')).toBeVisible();

    await visible(page, 'Cena móvil').click();
    await expect(page.getByRole('dialog', { name: 'Cena móvil' }).getByText(pickedDate)).toBeVisible();
  });

  test('la hoja dentro del diálogo de edición cierra solo la hoja con Escape', async ({ page }) => {
    mobileOnly();
    await seedDemo(page);
    await page.goto('/movimientos');
    await visible(page, 'Cena con amigos').click();
    const detail = page.getByRole('dialog', { name: 'Cena con amigos' });
    await detail.getByRole('button', { name: 'Editar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Editar movimiento' });
    await expect(dialog).toBeVisible();

    const { pickedDate } = await pickDay(page, 21);
    await dialog.getByRole('button', { name: 'Guardar' }).click();
    const updated = page.getByRole('dialog', { name: 'Cena con amigos' });
    await expect(updated.getByText(pickedDate)).toBeVisible();

    await updated.getByRole('button', { name: 'Editar' }).click();
    await dialog.getByRole('button', { name: 'Fecha' }).click();
    await expect(page.getByRole('dialog', { name: 'Fecha' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Fecha' })).toHaveCount(0);
    await expect(dialog).toBeVisible();
  });

  test('elige la fecha con la hoja inferior en el gasto grupal', async ({ page }) => {
    mobileOnly();
    await seedDemo(page);
    await page.goto('/grupos/demo-grp-flat');
    await page.getByLabel('Concepto').fill('Tarta');
    await page.getByLabel('Importe').fill('18');

    const { pickedDate } = await pickDay(page, 12);
    await page.getByRole('button', { name: 'Guardar y repartir' }).click();
    await expect(visible(page, 'Tarta')).toBeVisible();
    await expect(page.getByText(new RegExp(`${pickedDate} · \\d+ participantes`))).toBeVisible();
  });
});
