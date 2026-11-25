import { expect, test } from '@playwright/test';
import { chooseOption, seedDemo } from './helpers';

test.describe('gastos grupales', () => {
  test('liquida un grupo y conserva el historial', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/grupos');
    await page.getByRole('link', { name: /Piso compartido/ }).click();
    await expect(page.getByRole('heading', { name: 'Piso compartido' })).toBeVisible();
    await expect(page.getByText(/Quedan 50,00/)).toBeVisible();

    await chooseOption(page, 'Rol de Luis', 'Administración');
    await expect(page.getByText('Rol actualizado')).toBeVisible();
    await page.getByRole('button', { name: 'Marcar saldada' }).first().click();
    await expect(page.getByText(/Quedan 20,00/)).toBeVisible();
    await expect(page.getByText(/Luis → Ana/)).toBeVisible();

    await page.getByLabel('Concepto').fill('Taxi');
    await page.getByLabel('Importe').fill('30');
    await page.getByRole('button', { name: 'Guardar y repartir' }).click();
    await expect(page.getByText('Taxi')).toBeVisible();
    await expect(page.getByText(/30,00/).first()).toBeVisible();
  });

  test('crea un grupo y valida que haya dos miembros', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/grupos');
    await page.getByRole('button', { name: 'Crear grupo' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Nuevo grupo' });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Nombre del grupo').fill('Viaje');
    await dialog.getByRole('textbox', { name: 'Miembro 1' }).fill('Ana');
    await dialog.getByRole('textbox', { name: 'Miembro 2' }).fill('Luis');
    await dialog.getByRole('button', { name: 'Crear grupo' }).click();
    await expect(page).toHaveURL(/\/grupos\/grp_/);
    await expect(page.getByRole('heading', { name: 'Viaje' })).toBeVisible();
    await expect(page.getByText(/2 miembros/).filter({ visible: true }).first()).toBeVisible();
  });

  test('el reparto porcentual avisa si no suma 100', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/grupos/demo-grp-flat');
    await page.getByRole('group', { name: 'Reparto' }).getByRole('button', { name: 'Porcentaje' }).click();
    const inputs = page.getByLabel(/Porcentaje de /);
    await inputs.nth(0).fill('80');
    await page.getByRole('button', { name: 'Guardar y repartir' }).click();
    await expect(page.getByText('El concepto es obligatorio')).toBeVisible();

    await page.getByLabel('Concepto').fill('Prueba');
    await page.getByLabel('Importe').fill('30');
    await page.getByRole('button', { name: 'Guardar y repartir' }).click();
    await expect(page.getByText(/Los porcentajes deben sumar 100/)).toBeVisible();
  });

  test('convierte una divisa y conserva el importe original', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/grupos/demo-grp-flat');
    await page.getByLabel('Concepto').fill('Hotel');
    await page.getByLabel('Importe').fill('100');
    await chooseOption(page, 'Divisa del gasto', 'Dólar (USD)');
    await page.getByLabel(/Tipo de cambio/).fill('0,9');
    await page.getByRole('button', { name: 'Guardar y repartir' }).click();
    await expect(page.getByText('Hotel').first()).toBeVisible();
    await expect(page.getByText(/Original: 100,00/)).toBeVisible();
    await expect(page.getByText(/tipo 0.9/)).toBeVisible();
  });
});
