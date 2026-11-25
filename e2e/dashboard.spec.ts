import { expect, test } from '@playwright/test';
import { seedDemo } from './helpers';

const toNumber = (text: string | null) => {
  const value = Number((text ?? '0').replace(/[^\d,]/g, '').replace(',', '.'));
  return text?.includes('−') || text?.includes('-') ? -value : value;
};

test.describe('dashboard hero', () => {
  test('saldo del mes con base y detalle diario, y balance en tarjeta', async ({ page }) => {
    await seedDemo(page);

    const balance = page.locator('[data-hero="balance"]');
    const monthBlock = page.locator('[data-hero="month"]');
    const summary = page.locator('[data-hero="month-summary"]');
    await expect(balance).toContainText('Saldo total');
    await expect(monthBlock).toBeVisible();
    await expect(monthBlock).not.toContainText('Base 1 nov');
    await expect(summary).toContainText('Balance del mes');
    await expect(summary).toContainText('+2.152,01 €');
    await expect(summary).toContainText('Saldo total estimado a fin de mes: 15.898,84 €');
    await expect(summary).not.toContainText('Ingresos');

    expect(await balance.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
      'rgba(0, 0, 0, 0)',
    );
    expect(await balance.evaluate((element) => getComputedStyle(element).borderTopWidth)).toBe('0px');

    const summaryCard = summary.locator('div').first();
    expect(await summaryCard.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe('0px');
    expect(await summaryCard.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');

    const chartBox = await monthBlock.boundingBox();
    const summaryBox = await summary.boundingBox();
    expect(chartBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    if (chartBox && summaryBox) {
      expect(summaryBox.y - (chartBox.y + chartBox.height)).toBeLessThanOrEqual(1);

      if ((page.viewportSize()?.width ?? 0) >= 1024) {
        const balanceBox = await balance.boundingBox();
        const upcomingBox = await page.locator('[data-hero="upcoming"]').boundingBox();
        expect(balanceBox).not.toBeNull();
        expect(upcomingBox).not.toBeNull();
        if (balanceBox && upcomingBox) {
          expect(Math.abs(chartBox.y - balanceBox.y)).toBeLessThanOrEqual(1);
          expect(Math.abs(summaryBox.y + summaryBox.height - (upcomingBox.y + upcomingBox.height))).toBeLessThanOrEqual(1);
        }
      }
    }

    const bar = monthBlock.getByRole('group', { name: /Saldo del mes por día/ });
    await expect(bar).toBeVisible();
    expect(await page.getByText('Gastos por semana').count()).toBe(0);
    expect(await page.getByRole('img', { name: /Movimientos de la semana/ }).count()).toBe(0);

    const questions = page.getByRole('link', { name: 'Preguntas rápidas →' });
    await expect(questions).toBeVisible();
    await expect(questions).toHaveAttribute('href', '/preguntas');

    await page.locator('a[href="/cuentas/demo-acc-day"]').first().click();
    await expect(page).toHaveURL(/\/cuentas\/demo-acc-day/);
  });

  test('recorre los días con el teclado y muestra movimientos y saldo', async ({ page }) => {
    await seedDemo(page);

    const month = page.locator('[data-hero="month"]');
    const bar = month.getByRole('group', { name: /Saldo del mes por día/ });
    await expect(month.getByText(/31 oct/)).toHaveCount(0);
    await bar.focus();

    await expect(month.getByText('dom 29 nov')).toBeVisible();
    await expect(month.getByText('Brunch de domingo')).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await expect(month.getByText('sáb 28 nov')).toBeVisible();
    await expect(month.getByText('Suscripción vídeo')).toBeVisible();
    await expect(month.getByText('Saldo tras el día')).toBeVisible();

    await page.keyboard.press('Home');
    await expect(month.getByText('sáb 31 oct')).toBeVisible();
    await expect(month.getByText('Cierre del mes anterior')).toBeVisible();
    await expect(month.getByText('Saldo al cierre')).toBeVisible();
    await expect(month.getByText('13.726,00 €', { exact: true })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(month.getByText('Saldo tras el día')).toBeHidden();
    await expect(month.getByText('Cierre del mes anterior')).toBeHidden();
  });

  test('registrar un movimiento actualiza el gasto del mes y el detalle del día', async ({ page }) => {
    await seedDemo(page);
    const summary = page.locator('[data-hero="month-summary"]');
    const total = summary.locator('p.font-tabular').first();
    const before = await total.textContent();

    await page.getByRole('link', { name: 'Añadir movimiento' }).first().click();
    await page.getByLabel('Importe').fill('25');
    await page.getByLabel('Concepto').fill('Entradas');
    await page.getByLabel('Categoría').selectOption({ label: 'Ocio' });
    await page.getByRole('button', { name: 'Guardar movimiento' }).click();
    await expect(page).toHaveURL(/\/movimientos$/);
    await expect(page.getByRole('heading', { name: 'Movimientos' })).toBeVisible();

    await page.goto('/');
    await expect(total).toBeVisible();
    expect(toNumber(await total.textContent())).toBeCloseTo(toNumber(before) - 25, 2);

    const month = page.locator('[data-hero="month"]');
    const bar = month.getByRole('group', { name: /Saldo del mes por día/ });
    const box = await bar.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    await page.mouse.move(box.x + box.width - 4, box.y + box.height / 2);
    await expect(month.getByText('Entradas')).toBeVisible();
    await expect(month.getByText('Saldo tras el día')).toBeVisible();
  });

  test('responsive sin desbordamiento y avance visible con movimiento reducido', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await seedDemo(page);

    const monthBlock = page.locator('[data-hero="month"]');
    await expect(monthBlock).toBeVisible();
    expect(await monthBlock.evaluate((element) => getComputedStyle(element).animationName)).toBe(
      'none',
    );
    expect(await monthBlock.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
    await expect(monthBlock.getByRole('group', { name: /Saldo del mes por día/ })).toBeVisible();

    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `desbordamiento a ${width}px`).toBeLessThanOrEqual(1);
    }
  });
});
