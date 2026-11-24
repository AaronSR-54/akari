import { expect, test, type Page } from '@playwright/test';
import { seedDemo, startEmpty } from './helpers';

function visible(page: Page, text: string | RegExp) {
  return page.getByText(text).filter({ visible: true }).first();
}

test.describe('cuentas y movimientos', () => {
  test('crea una cuenta, la edita y registra un movimiento', async ({ page }) => {
    await startEmpty(page);
    await page.getByRole('link', { name: 'Añadir cuenta' }).first().click();
    await expect(page.getByRole('heading', { name: 'Nueva cuenta' })).toBeVisible();

    await page.getByLabel('Nombre de la cuenta').fill('Ahorro');
    await page.getByLabel('Saldo inicial').fill('500');
    await page.getByRole('button', { name: 'Guardar cuenta' }).click();
    await expect(page).toHaveURL(/\/cuentas\/acc_/);
    await expect(page.getByRole('heading', { name: 'Ahorro' })).toBeVisible();
    await expect(page.getByText(/500,00/).first()).toBeVisible();

    await page.getByRole('link', { name: 'Editar' }).click();
    await page.getByLabel('Saldo inicial').fill('600');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page).toHaveURL(/\/cuentas\/acc_/);
    await expect(page.getByText(/600,00/).first()).toBeVisible();

    await page.getByRole('link', { name: 'Añadir movimiento' }).first().click();
    await expect(page).toHaveURL(/\/movimientos\/nuevo\?cuenta=/);
    await page.getByLabel('Importe').fill('50');
    await page.getByLabel('Concepto').fill('Cine');
    await page.getByLabel('Categoría').selectOption({ label: 'Ocio' });
    await page.getByRole('button', { name: 'Guardar movimiento' }).click();
    await expect(page).toHaveURL(/\/movimientos/);
    await expect(visible(page, 'Cine')).toBeVisible();

    await page.goto('/');
    await page.getByText('Ahorro').click();
    await expect(page.getByText(/550,00/).first()).toBeVisible();
  });

  test('valida el saldo inicial obligatorio', async ({ page }) => {
    await startEmpty(page);
    await page.goto('/cuentas/nueva');
    await page.getByLabel('Nombre de la cuenta').fill('Sin saldo');
    await page.getByRole('button', { name: 'Guardar cuenta' }).click();
    await expect(page).toHaveURL(/\/cuentas\/nueva/);
    await expect(page.getByText('El saldo inicial es obligatorio', { exact: true })).toBeVisible();
  });

  test('filtra, ordena y edita movimientos', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');
    await expect(page.getByRole('heading', { name: 'Movimientos' })).toBeVisible();

    await page.getByRole('searchbox', { name: 'Buscar movimientos' }).fill('Cena');
    await expect(visible(page, 'Cena con amigos')).toBeVisible();
    await expect(page.getByText('Alquiler')).toHaveCount(0);

    await page.getByRole('searchbox', { name: 'Buscar movimientos' }).fill('zzz');
    await expect(visible(page, 'Ningún movimiento coincide')).toBeVisible();
    await page.getByRole('button', { name: 'Limpiar filtros' }).first().click();
    await expect(visible(page, 'Cena con amigos')).toBeVisible();

    await page.getByRole('group', { name: 'Tipo de movimiento' }).getByRole('button', { name: 'Ingresos' }).click();
    await expect(visible(page, 'Nómina')).toBeVisible();
    await expect(page.getByText('Alquiler')).toHaveCount(0);

    await page.getByRole('group', { name: 'Tipo de movimiento' }).getByRole('button', { name: 'Todos' }).click();
    await page.getByRole('button', { name: 'Editar' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Editar movimiento' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Concepto').fill('Suscripción música');
    await dialog.getByRole('button', { name: 'Guardar' }).click();
    await expect(visible(page, 'Suscripción música')).toBeVisible();

    if (page.viewportSize()!.width >= 768) {
      await expect(page.getByText(/1–10 de 11 movimientos/)).toBeVisible();
      await page.getByRole('button', { name: '2', exact: true }).click();
      await expect(page.getByText(/11–11 de 11 movimientos/)).toBeVisible();
    }
  });

  test('muestra saldo estimado negativo y registra una recurrencia', async ({ page }) => {
    await startEmpty(page);
    await page.goto('/cuentas/nueva');
    await page.getByLabel('Nombre de la cuenta').fill('Alquiler');
    await page.getByLabel('Saldo inicial').fill('500');
    await page.getByRole('button', { name: 'Guardar cuenta' }).click();
    await expect(page).toHaveURL(/\/cuentas\/acc_/);
    const accountUrl = page.url();

    await page.getByRole('link', { name: 'Añadir movimiento' }).first().click();
    await page.getByLabel('Importe').fill('700');
    await page.getByLabel('Concepto').fill('Alquiler extra');
    await page.getByRole('switch', { name: 'Repetir este movimiento' }).click();
    await page.getByLabel('Frecuencia').selectOption('monthly');
    await page.getByRole('button', { name: 'Guardar movimiento' }).click();
    await expect(page).toHaveURL(/\/movimientos/);
    await expect(visible(page, 'Alquiler extra')).toBeVisible();

    await page.goto(accountUrl);
    await expect(page.getByText('El saldo estimado a fin de mes es negativo')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recurrentes' })).toBeVisible();
    await expect(page.getByText('Alquiler extra').first()).toBeVisible();
  });

  test('muestra plazos y registra una cuota vencida', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/cuentas/demo-acc-day');
    await expect(page.getByText('Plazos').first()).toBeVisible();
    await page.getByRole('button', { name: 'Registrar cuota' }).click();
    await expect(page.getByText('Cuota registrada')).toBeVisible();
    await expect(page.getByText(/3 de 6/).first()).toBeVisible();
  });
});
