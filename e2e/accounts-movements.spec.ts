import { expect, test, type Page } from '@playwright/test';
import { chooseOption, expectHeadingForViewport, seedDemo, startEmpty } from './helpers';

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

    const accountUrl = page.url();
    await page.getByRole('button', { name: 'Añadir movimiento' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Nuevo movimiento' });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(accountUrl);
    await expect(dialog.getByLabel('Cuenta')).toContainText('Ahorro');
    await dialog.getByLabel('Importe').fill('50');
    await dialog.getByLabel('Concepto').fill('Cine');
    await chooseOption(page, 'Categoría', 'Ocio');
    const dateTrigger = dialog.getByRole('button', { name: 'Fecha' });
    await dateTrigger.click();
    await page.getByRole('dialog', { name: 'Fecha' }).getByRole('button', { name: /^15 / }).click();
    const pickedDate = ((await dateTrigger.textContent()) ?? '').trim();
    const shortDate = pickedDate.split(' ').slice(0, 2).join(' ');
    await expect(dateTrigger).toHaveAttribute('aria-expanded', 'false');
    await dialog.getByRole('button', { name: 'Guardar movimiento' }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(accountUrl);
    await expect(visible(page, 'Cine')).toBeVisible();
    await expect(visible(page, shortDate)).toBeVisible();

    await page.goto('/');
    await page.getByText('Ahorro').click();
    await expect(page.getByText(/550,00/).first()).toBeVisible();
  });

  test('asocia un banco a la cuenta y conserva la elección al editar', async ({ page }) => {
    await startEmpty(page);
    await page.goto('/cuentas/nueva');
    await page.getByLabel('Nombre de la cuenta').fill('Cuenta BBVA');
    await page.getByLabel('Saldo inicial').fill('500');
    const bankTrigger = page.getByLabel('Banco');
    await expect(bankTrigger.locator('[data-bank="other"]')).toBeVisible();
    await bankTrigger.click();
    await expect(
      page.getByRole('option', { name: 'BBVA' }).locator('[data-bank="bbva"]'),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await chooseOption(page, 'Banco', 'BBVA');
    await page.getByRole('button', { name: 'Guardar cuenta' }).click();
    await expect(page).toHaveURL(/\/cuentas\/acc_/);

    await page.getByRole('link', { name: 'Editar' }).click();
    await expect(page).toHaveURL(/\/editar$/);
    await page.reload();
    await expect(page.getByLabel('Banco')).toHaveAttribute('data-value', 'bbva');

    await chooseOption(page, 'Banco', 'Santander');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page).toHaveURL(/\/cuentas\/acc_[^/]+$/);
    await page.getByRole('link', { name: 'Editar' }).click();
    await expect(page).toHaveURL(/\/editar$/);
    await expect(page.getByLabel('Banco')).toHaveAttribute('data-value', 'santander');
  });

  test('guarda una cuenta sin banco y mantiene el icono genérico', async ({ page }) => {
    await startEmpty(page);
    await page.goto('/cuentas/nueva');
    await page.getByLabel('Nombre de la cuenta').fill('Cuenta sin banco');
    await page.getByLabel('Saldo inicial').fill('500');
    await chooseOption(page, 'Banco', 'Sin banco / Otro');
    await page.getByRole('button', { name: 'Guardar cuenta' }).click();
    await expect(page).toHaveURL(/\/cuentas\/acc_[^/]+$/);
    const accountUrl = page.url();

    await page.getByRole('link', { name: 'Editar' }).click();
    await expect(page).toHaveURL(/\/editar$/);
    await expect(page.getByLabel('Banco')).toHaveAttribute('data-value', 'other');

    await page.goto(accountUrl);
    await page.getByRole('button', { name: 'Añadir movimiento' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Nuevo movimiento' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Importe').fill('20');
    await dialog.getByLabel('Concepto').fill('Café');
    await chooseOption(page, 'Categoría', 'Alimentación');
    await dialog.getByRole('button', { name: 'Guardar movimiento' }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(accountUrl);
    const row = page.getByRole('button', { name: /Café/ }).first();
    await expect(row.locator('[data-bank="other"] svg')).toBeVisible();
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
    await expectHeadingForViewport(page, 'Movimientos');

    await page.getByRole('searchbox', { name: 'Buscar movimientos' }).fill('Cena');
    await expect(visible(page, 'Cena con amigos')).toBeVisible();
    await expect(page.getByText('Alquiler')).toHaveCount(0);

    await page.getByRole('searchbox', { name: 'Buscar movimientos' }).fill('zzz');
    await expect(visible(page, 'Ningún movimiento coincide')).toBeVisible();
    await page.getByRole('button', { name: 'Limpiar filtros' }).first().click();
    await expect(visible(page, 'Cena con amigos')).toBeVisible();

    await chooseOption(page, 'Tipo', 'Ingresos');
    await expect(visible(page, 'Nómina')).toBeVisible();
    await expect(page.getByText('Alquiler')).toHaveCount(0);

    await chooseOption(page, 'Tipo', 'Todos');
    await expect(page.getByRole('button', { name: 'Editar' })).toHaveCount(0);
    await visible(page, 'Cena con amigos').click();
    const detail = page.getByRole('dialog', { name: 'Cena con amigos' });
    await expect(detail).toBeVisible();
    await detail.getByRole('button', { name: 'Editar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Editar movimiento' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Concepto').fill('Suscripción música');
    const editDateTrigger = dialog.getByRole('button', { name: 'Fecha' });
    await editDateTrigger.click();
    await page.getByRole('dialog', { name: 'Fecha' }).getByRole('button', { name: /^20 / }).click();
    const editedDate = ((await editDateTrigger.textContent()) ?? '').trim();
    await dialog.getByRole('button', { name: 'Guardar' }).click();
    const updated = page.getByRole('dialog', { name: 'Suscripción música' });
    await expect(updated).toBeVisible();
    await expect(updated.getByText(editedDate)).toBeVisible();
    await updated.getByRole('button', { name: 'Cerrar' }).click();
    await expect(visible(page, 'Suscripción música')).toBeVisible();

    if (page.viewportSize()!.width >= 768) {
      await expect(page.getByText(/1–10 de 22 movimientos/)).toBeVisible();
      await page.getByRole('button', { name: '2', exact: true }).click();
      await expect(page.getByText(/11–20 de 22 movimientos/)).toBeVisible();
    }
  });

  test('mantiene la tabla de movimientos legible en escritorio', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');

    const row = page.getByRole('row').filter({ hasText: 'Cena con amigos' }).first();
    if ((page.viewportSize()?.width ?? 0) < 768) {
      await expect(row).toHaveCount(0);
      return;
    }

    await expect(page.getByRole('columnheader', { name: 'Concepto' })).toHaveCSS('font-size', '11px');
    await expect(row.getByRole('cell').first()).toHaveCSS('font-size', '13px');
    await expect(row.getByRole('cell').nth(1)).toHaveCSS('font-size', '14px');
    await expect
      .poll(async () => Math.round((await row.boundingBox())?.height ?? 0))
      .toBe(64);

    const card = page.getByRole('table').locator('xpath=..');
    const next = page.getByRole('button', { name: 'Siguiente' });
    await expect
      .poll(async () => {
        const cardBox = await card.boundingBox();
        const nextBox = await next.boundingBox();
        if (!cardBox || !nextBox) return -1;
        return Math.round(cardBox.y + cardBox.height - (nextBox.y + nextBox.height));
      })
      .toBeGreaterThanOrEqual(8);
  });

  test('ordena desde la cápsula y filtra por periodo desde el control del resumen', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');
    await expect(page.getByText('22 movimientos', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Periodo' })).toHaveText(/Cualquier fecha/);

    await page.getByRole('combobox', { name: 'Orden' }).click();
    await expect(page.getByRole('listbox', { name: 'Orden' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Periodo' })).toHaveCount(0);
    await page.getByRole('option', { name: 'Importe ↓' }).click();
    await expect(page.getByRole('combobox', { name: 'Orden' })).toHaveText(/Importe ↓/);

    await page.getByRole('button', { name: 'Periodo' }).click();
    await page.getByRole('dialog', { name: 'Periodo' }).getByRole('button', { name: 'Este mes' }).click();
    await expect(page.getByRole('button', { name: 'Periodo' })).toHaveText(/Este mes/);
    await expect(visible(page, 'Cena con amigos')).toBeVisible();
    await expect(page.getByText('Cena', { exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Periodo' }).click();
    // El primero es el atajo «Mes anterior»; el segundo, la flecha del calendario.
    await page.getByRole('dialog', { name: 'Periodo' }).getByRole('button', { name: 'Mes anterior' }).first().click();
    await expect(page.getByRole('button', { name: 'Periodo' })).toHaveText(/Mes anterior/);
    await expect(page.getByText('Cena con amigos')).toHaveCount(0);
    await expect(page.getByText('Cena', { exact: true }).filter({ visible: true }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Periodo' }).click();
    await page.getByRole('dialog', { name: 'Periodo' }).getByRole('button', { name: 'Cualquier fecha' }).click();
    await page.getByRole('button', { name: 'Periodo' }).click();
    const rangePanel = page.getByRole('dialog', { name: 'Periodo' });
    await rangePanel.getByRole('button', { name: '01 nov 2026' }).click();
    await rangePanel.getByRole('button', { name: '02 nov 2026' }).click();
    await rangePanel.getByRole('button', { name: 'Aplicar' }).click();
    await expect(page.getByRole('button', { name: 'Periodo' })).toHaveText(/1–2 nov 2026/);
    await expect(visible(page, 'Nómina')).toBeVisible();
    await expect(page.getByText('Cena con amigos')).toHaveCount(0);

    await page.getByRole('button', { name: 'Periodo' }).click();
    await page.getByRole('dialog', { name: 'Periodo' }).getByRole('button', { name: '10 nov 2026' }).click();
    await page.getByRole('dialog', { name: 'Periodo' }).getByRole('button', { name: '12 nov 2026' }).click();
    await page.getByRole('dialog', { name: 'Periodo' }).getByRole('button', { name: 'Aplicar' }).click();
    await expect(visible(page, 'Ningún movimiento coincide')).toBeVisible();

    await page.getByRole('button', { name: 'Limpiar filtros' }).first().click();
    await expect(page.getByText('22 movimientos', { exact: true })).toBeVisible();
    await chooseOption(page, 'Orden', 'Fecha ↓');
    await expect(visible(page, 'Cena con amigos')).toBeVisible();
  });

  test('en móvil los selectores abren una hoja inferior', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-web', 'Cobertura específica de la hoja inferior móvil');
    await seedDemo(page);
    await page.goto('/movimientos');

    await page.getByRole('combobox', { name: 'Categoría' }).click();
    const sheet = page.getByRole('dialog', { name: 'Categoría' });
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('aria-modal', 'true');
    await sheet.getByRole('option', { name: 'Ocio' }).click();
    await expect(page.getByRole('combobox', { name: 'Categoría' })).toHaveText(/Ocio/);
    await expect(page.getByRole('dialog', { name: 'Categoría' })).toHaveCount(0);
  });

  test('el desplegable se desplaza con la página y no se queda sticky', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 768, 'Cobertura de escritorio');
    await seedDemo(page);
    await page.goto('/movimientos');

    const trigger = page.getByRole('combobox', { name: 'Tipo' });
    await trigger.click();
    const listbox = page.getByRole('listbox', { name: 'Tipo' });
    await expect(listbox).toBeVisible();
    const panelBox = await listbox.boundingBox();

    const beforeScroll = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, 120));
    const afterScroll = await page.evaluate(() => window.scrollY);
    test.skip(afterScroll === beforeScroll, 'La página no tiene scroll suficiente');

    const delta = afterScroll - beforeScroll;
    await expect.poll(async () => {
      const nextPanel = await listbox.boundingBox();
      return Math.abs(panelBox!.y - nextPanel!.y - delta);
    }).toBeLessThan(2);
  });

  test('muestra saldo estimado negativo y registra una recurrencia', async ({ page }) => {
    await startEmpty(page);
    await page.goto('/cuentas/nueva');
    await page.getByLabel('Nombre de la cuenta').fill('Alquiler');
    await page.getByLabel('Saldo inicial').fill('500');
    await page.getByRole('button', { name: 'Guardar cuenta' }).click();
    await expect(page).toHaveURL(/\/cuentas\/acc_/);
    const accountUrl = page.url();

    await page.getByRole('button', { name: 'Añadir movimiento' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Nuevo movimiento' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Importe').fill('700');
    await dialog.getByLabel('Concepto').fill('Alquiler extra');
    await dialog.getByRole('switch', { name: 'Repetir este movimiento' }).click();
    await chooseOption(page, 'Frecuencia', 'Mensual');
    await dialog.getByRole('button', { name: 'Guardar movimiento' }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(accountUrl);
    await expect(visible(page, 'Alquiler extra')).toBeVisible();

    await page.goto(accountUrl);
    await expect(page.getByText('El saldo estimado a fin de mes es negativo')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recurrentes' })).toBeVisible();
    await expect(page.getByText('Alquiler extra').first()).toBeVisible();
  });

  test('muestra el banco de la cuenta en los movimientos y lo actualiza al cambiarlo', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');
    const cena = () => page.getByRole('button', { name: /Cena con amigos/ }).first();
    await expect(cena().locator('[data-bank="bbva"]')).toBeVisible();
    const nomina = page.getByRole('button', { name: /Nómina/ }).first();
    await expect(nomina.locator('[data-bank="bbva"]')).toBeVisible();
    await expect(nomina.locator('[data-bank="bbva"]').locator('..')).not.toHaveClass(
      /bg-status-positive-soft/,
    );

    await page.goto('/cuentas/demo-acc-day/editar');
    await chooseOption(page, 'Banco', 'Revolut');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page).toHaveURL(/\/cuentas\/demo-acc-day$/);

    await page.goto('/movimientos');
    await expect(cena().locator('[data-bank="revolut"]')).toBeVisible();
  });

  test('el filtro de cuentas muestra logos y oculta el logo al filtrar', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');

    const trigger = page.getByLabel('Cuenta');
    await trigger.click();
    const option = page.getByRole('option', { name: 'Cuenta diaria' });
    await expect(option.locator('[data-bank="bbva"]')).toBeVisible();
    await option.click();
    await expect(trigger).toHaveAttribute('data-value', 'demo-acc-day');

    const cena = page.getByRole('button', { name: /Cena con amigos/ }).first();
    await expect(cena.locator('[data-bank]')).toHaveCount(0);
    await expect(cena.locator('svg')).toHaveCount(0);
  });

  test('muestra plazos y registra una cuota vencida', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/cuentas/demo-acc-day');
    await expect(page.getByText('Plazos').first()).toBeVisible();
    await page.getByRole('button', { name: 'Registrar cuota' }).first().click();
    await expect(page.getByText('Cuota registrada')).toBeVisible();
    await expect(page.getByText(/3 de 6/).first()).toBeVisible();
  });
});
