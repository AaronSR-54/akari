import { expect, test, type Page } from '@playwright/test';
import { openNewAccount, seedDemo } from './helpers';

async function openFirstAccount(page: Page) {
  await page.locator('a[data-account]').first().click();
  await expect(page).toHaveURL(/\/cuentas\//);
}

test.describe('panel de cuenta', () => {
  test('cambia de cuenta desde el selector en escritorio', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await openFirstAccount(page);

    await expect(
      page.getByRole('heading', { name: 'Cuenta diaria', exact: true }).first(),
    ).toBeVisible();
    await expect(page.locator('[data-breadcrumb]')).toHaveCount(0);
    await expect(page.getByText(/^Actualizada/)).toHaveCount(0);
    await expect(page.getByText('Saldo actual', { exact: true })).toBeVisible();

    await page
      .getByRole('button', { name: 'Cambiar de cuenta' })
      .filter({ visible: true })
      .first()
      .click();
    const listbox = page.getByRole('listbox', { name: 'Cuentas' });
    await expect(listbox).toBeVisible();
    await expect(listbox.locator('[data-account]')).toHaveCount(3);
    await expect(listbox.getByText('Saldo disponible')).toHaveCount(0);
    await expect(listbox.getByText('Al día')).toHaveCount(0);
    await expect(listbox.getByText(/^Actualizada/)).toHaveCount(0);
    const cardX = await listbox.locator('[data-account]').evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().x),
    );
    expect(new Set(cardX).size).toBe(1);
    await listbox.getByRole('option', { name: /Cuenta conjunta/ }).click();
    await expect(page.getByRole('heading', { name: 'Cuenta conjunta', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('listbox', { name: 'Cuentas' })).toHaveCount(0);
  });

  test('cambia de cuenta desde el modal en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedDemo(page);
    await openFirstAccount(page);

    await page
      .getByRole('button', { name: 'Cambiar de cuenta' })
      .filter({ visible: true })
      .first()
      .click();
    const dialog = page.getByRole('dialog', { name: 'Cambiar de cuenta' });
    await expect(dialog).toBeVisible();
    const sheet = await dialog.boundingBox();
    expect(sheet).not.toBeNull();
    expect(Math.round(sheet!.y + sheet!.height)).toBe(844);
    expect(sheet!.y).toBeGreaterThan(200);
    await dialog.getByRole('button', { name: /Cuenta conjunta/ }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Cuenta conjunta', exact: true }).first()).toBeVisible();
  });

  test('muestra solo el saldo actual y el balance del mes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await openFirstAccount(page);

    await expect(page.getByText('Saldo actual', { exact: true })).toBeVisible();
    const amount = page.locator('[data-hero="balance"]').locator('span').first();
    const label = page.locator('[data-hero="balance"] p').first();
    const amountBox = await amount.boundingBox();
    const labelBox = await label.boundingBox();
    expect(amountBox).not.toBeNull();
    expect(labelBox).not.toBeNull();
    expect(labelBox!.y).toBeGreaterThan(amountBox!.y);
    await expect(page.getByText('Saldo estimado a fin de mes', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Movimientos del mes', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Evolución del mes')).toHaveCount(0);
    const balanceCard = page.locator('[data-hero="month-summary"]');
    await expect(balanceCard.getByRole('heading', { name: 'Balance del mes' })).toBeVisible();
    await expect(balanceCard.getByText(/Saldo real estimado a fin de mes/)).toBeVisible();
    await expect(
      page.getByRole('group', { name: /Saldo de Cuenta diaria por día/ }),
    ).toBeVisible();
  });

  test('fija la columna izquierda y desplaza solo la derecha', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await openFirstAccount(page);

    await expect(page.locator('[data-hero="month"]')).toHaveAttribute('style', /height: \d+px/);

    const boxOf = async (selector: string) => {
      const box = await page.locator(selector).first().boundingBox();
      expect(box).not.toBeNull();
      return box!;
    };
    const chart = await boxOf('[data-hero="month"]');
    const summary = await boxOf('[data-hero="month-summary"]');
    const details = await boxOf('section[aria-labelledby="detalles-cuenta"]');
    const movements = await boxOf('[data-hero="recent"]');
    const plans = await boxOf('[data-panel="installments"]');
    const recurrences = await boxOf('section[aria-labelledby="recurrentes"]');

    expect(chart.x).toBeLessThan(movements.x);
    expect(details.x).toBeLessThan(movements.x);
    expect(details.y).toBeGreaterThanOrEqual(summary.y + summary.height);
    expect(plans.y).toBeLessThan(recurrences.y);
    await expect(page.getByRole('button', { name: 'Registrar cuota' })).toHaveCount(0);

    const main = page.locator('[data-shell-scroll]');
    const right = page.locator('[data-account-column="right"]');
    const left = page.locator('[data-account-column="left"]');
    await expect(main).toHaveCSS('overflow-y', 'auto');
    await expect(main).toHaveCSS('padding-top', '56px');
    await expect(right).toHaveCSS('overflow-y', 'visible');

    const leftBefore = await left.boundingBox();
    await main.evaluate((node) => {
      node.scrollTop = Math.round((node.scrollHeight - node.clientHeight) / 2);
    });
    await page.waitForTimeout(150);
    const maskMid = await right.evaluate((node) => getComputedStyle(node).maskImage);
    expect(maskMid).toContain('gradient');
    await main.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await page.waitForTimeout(150);
    const leftAfter = await left.boundingBox();
    const chartAfter = await page.locator('[data-hero="month"]').boundingBox();
    const movementsAfter = await page.locator('[data-hero="recent"]').boundingBox();
    expect(leftBefore).not.toBeNull();
    expect(leftAfter).not.toBeNull();
    expect(chartAfter).not.toBeNull();
    expect(movementsAfter).not.toBeNull();
    expect(Math.abs(leftAfter!.y - leftBefore!.y)).toBeLessThan(1);
    expect(Math.abs(chartAfter!.height - chart.height)).toBeLessThan(1);
    expect(movementsAfter!.y).toBeLessThan(movements.y);

    const maskAtEnd = await right.evaluate((node) => getComputedStyle(node).maskImage);
    expect(maskAtEnd).toBe('none');

    const detailsEnd = await page
      .locator('section[aria-labelledby="detalles-cuenta"]')
      .boundingBox();
    const recurrencesEnd = await page
      .locator('section[aria-labelledby="recurrentes"]')
      .boundingBox();
    expect(detailsEnd).not.toBeNull();
    expect(recurrencesEnd).not.toBeNull();
    expect(
      Math.abs(
        detailsEnd!.y + detailsEnd!.height - (recurrencesEnd!.y + recurrencesEnd!.height),
      ),
    ).toBeLessThanOrEqual(1);
  });

  test('añade movimiento, plazo y recurrencia desde el detalle', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await openFirstAccount(page);

    await page
      .getByRole('button', { name: 'Añadir movimiento' })
      .filter({ visible: true })
      .first()
      .click();
    const movementDialog = page.getByRole('dialog', { name: 'Nuevo movimiento' });
    await expect(movementDialog).toBeVisible();
    await movementDialog.getByLabel('Importe').fill('25');
    await movementDialog.getByLabel('Concepto').fill('Café de prueba');
    await movementDialog.getByRole('button', { name: 'Guardar movimiento' }).click();
    await expect(page.getByText('Movimiento guardado')).toBeVisible();
    await expect(movementDialog).toHaveCount(0);

    await page.getByRole('button', { name: 'Añadir plazo' }).click();
    const planDialog = page.getByRole('dialog', { name: 'Nuevo plan de plazos' });
    await expect(planDialog).toBeVisible();
    await planDialog.getByLabel('Concepto').fill('Portátil de prueba');
    await planDialog.getByLabel('Importe total').fill('300');
    await planDialog.getByRole('button', { name: 'Crear plan' }).click();
    await expect(page.getByText('Plan de plazos creado')).toBeVisible();
    await expect(
      page.getByRole('progressbar', { name: 'Portátil de prueba: 0 de 3' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Añadir recurrente' }).click();
    const recurrenceDialog = page.getByRole('dialog', { name: 'Nueva recurrencia' });
    await expect(recurrenceDialog).toBeVisible();
    await recurrenceDialog.getByLabel('Importe').fill('12,99');
    await recurrenceDialog.getByLabel('Concepto').fill('Suscripción de prueba');
    await recurrenceDialog.getByRole('button', { name: 'Crear recurrencia' }).click();
    await expect(page.getByText('Recurrencia creada')).toBeVisible();
    await expect(page.getByText('Suscripción de prueba')).toBeVisible();
  });

  test('en móvil el alta de movimiento vive en el pie del panel', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedDemo(page);
    await openFirstAccount(page);

    const addButtons = page
      .getByRole('button', { name: 'Añadir movimiento' })
      .filter({ visible: true });
    await expect(addButtons).toHaveCount(1);
    await addButtons.first().click();
    await expect(page.getByRole('dialog', { name: 'Nuevo movimiento' })).toBeVisible();
  });

  test('edita y elimina una cuenta desde la pantalla de edición', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await openNewAccount(page);

    await page.getByLabel('Nombre de la cuenta').fill('Temporal');
    await page.getByLabel('Saldo inicial').fill('100');
    await page.getByRole('button', { name: 'Guardar cuenta' }).click();
    await expect(page).toHaveURL(/\/cuentas\/acc_/);
    await expect(page.getByText('Detalles de la cuenta')).toBeVisible();

    await page.getByRole('link', { name: 'Editar' }).click();
    await expect(page).toHaveURL(/\/editar$/);
    await page.getByRole('button', { name: 'Eliminar cuenta' }).click();
    const confirm = page.getByRole('dialog', { name: 'Eliminar cuenta' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Eliminar cuenta' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('Temporal')).toHaveCount(0);
  });
});
