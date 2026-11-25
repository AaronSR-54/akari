import { expect, test } from '@playwright/test';
import { chooseOption, seedDemo } from './helpers';

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

  test('el overscroll se contiene en escritorio y no en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 600 });
    await seedDemo(page);
    const overscrollY = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).overscrollBehaviorY);
    await expect.poll(overscrollY).toBe('none');

    await page.setViewportSize({ width: 390, height: 600 });
    await expect.poll(overscrollY).toBe('auto');
  });

  test('la sidebar y la cabecera permanecen fijas al hacer scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 600 });
    await seedDemo(page);
    await page.goto('/ajustes');
    await expect(page.getByRole('heading', { name: 'Datos y sincronización' })).toBeVisible();

    const aside = page.locator('aside');
    const header = page.locator('header.h-\\[72px\\]');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Datos y sincronización');
    await expect(header).toContainText('La base local vive en este dispositivo');
    await expect(page.getByRole('heading', { name: 'Datos y sincronización', level: 1 })).toHaveCount(1);
    await expect(header.getByRole('heading', { name: 'Datos y sincronización', level: 1 })).toBeVisible();
    await expect(page.locator('main').getByText('La base local vive en este dispositivo')).toBeHidden();
    const before = { aside: await aside.boundingBox(), header: await header.boundingBox() };
    expect(before.header?.y).toBe(0);
    const contentHeader = page.locator('main header').first();
    const contentBox = await contentHeader.boundingBox();
    const gap = (contentBox?.y ?? 0) - ((before.header?.y ?? 0) + (before.header?.height ?? 0));
    expect(gap).toBeGreaterThanOrEqual(24);

    await page.evaluate(() => window.scrollTo(0, 220));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(150);

    const after = { aside: await aside.boundingBox(), header: await header.boundingBox() };
    expect(after.aside?.y).toBe(before.aside?.y);
    expect(after.header?.y).toBe(0);
    await expect(header).toBeVisible();
  });

  test('el subtítulo dinámico del resumen va a la cabecera', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);

    const header = page.locator('header.h-\\[72px\\]');
    await expect(header).toContainText('domingo, 29 de noviembre');
    await expect(page.locator('main').getByText('domingo, 29 de noviembre', { exact: false })).toBeHidden();
    await expect(page).toHaveTitle('Resumen · akari', { timeout: 30_000 });
  });

  test('el título respira bajo la barra en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedDemo(page);
    await page.goto('/ajustes');

    const bar = page.locator('header.sticky.top-0:visible');
    const title = page.getByRole('heading', { name: 'Datos y sincronización', level: 1 });
    await expect(bar).toBeVisible();
    const barBox = await bar.boundingBox();
    const titleBox = await title.boundingBox();
    const gap = (titleBox?.y ?? 0) - ((barBox?.y ?? 0) + (barBox?.height ?? 0));
    expect(gap).toBeGreaterThanOrEqual(24);
  });

  test('el modo header deja solo la navegación superior', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 600 });
    await seedDemo(page);
    await page.goto('/ajustes');
    await chooseOption(page, 'Navegación de escritorio', 'Header');
    await expect(page.getByLabel('Navegación de escritorio')).toHaveAttribute('data-value', 'header');

    const nav = page.locator('header.sticky.top-0:visible');
    await expect(nav).toBeVisible();
    await expect(page.locator('header.h-\\[72px\\]')).toHaveCount(0);
    expect((await nav.boundingBox())?.y).toBe(0);

    await page.evaluate(() => window.scrollTo(0, 220));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(150);

    const navBox = await nav.boundingBox();
    expect(navBox?.y).toBe(0);
    await expect(page.getByRole('button', { name: 'Buscar' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Avisos' })).toHaveCount(1);
  });

  test('la identidad aparece una sola vez en cada variante', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 600 });
    await seedDemo(page);
    await page.goto('/ajustes');

    const avatar = page.getByRole('img', { name: 'Marta' });
    await expect(avatar).toHaveCount(1);
    await expect(page.locator('aside').getByRole('img', { name: 'Marta' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Avisos' })).toBeVisible();

    await chooseOption(page, 'Navegación de escritorio', 'Header');
    await expect(page.getByLabel('Navegación de escritorio')).toHaveAttribute('data-value', 'header');
    await expect(avatar).toHaveCount(1);
    await expect(
      page.locator('header.sticky.top-0:visible').getByRole('img', { name: 'Marta' }),
    ).toHaveCount(1);
  });

  test('deep links y atajo de búsqueda', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/cuentas/demo-acc-day');
    await expect(page.getByRole('heading', { name: 'Cuenta diaria' })).toBeVisible();
    await expect(page).toHaveTitle('Cuenta diaria · akari', { timeout: 30_000 });
    await expect(page.getByText(/Resumen.*Cuentas.*Cuenta diaria/)).toBeVisible();

    await page.goto('/movimientos?cuenta=demo-acc-day');
    await expect(page.getByLabel('Cuenta', { exact: true })).toHaveAttribute('data-value', 'demo-acc-day');

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
    await page.locator('header.h-\\[72px\\]').getByRole('heading', { level: 1 }).click();
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
