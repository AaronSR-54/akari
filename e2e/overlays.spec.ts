import { expect, test } from '@playwright/test';
import { seedDemo } from './helpers';

test.describe('overlays', () => {
  test('atenúa y difumina el fondo y bloquea el scroll de la página', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 420 });
    await seedDemo(page);
    const scroller = page.locator('main');
    await scroller.evaluate((element) => element.scrollTo(0, 240));
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    const scrollBefore = await scroller.evaluate((element) => element.scrollTop);

    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Buscar en akari' });
    await expect(dialog).toBeVisible();

    const scrim = await dialog.evaluate((element) => {
      const style = getComputedStyle(element.parentElement!);
      return {
        background: style.backgroundColor,
        backdrop: style.backdropFilter || style.webkitBackdropFilter,
      };
    });
    expect(scrim.background).toMatch(/rgba\(31, 27, 22, 0\.5\)/);
    expect(scrim.backdrop).toContain('blur');

    await page.mouse.move(700, 350);
    await page.mouse.wheel(0, 600);
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(200);
    expect(await scroller.evaluate((element) => element.scrollTop)).toBe(scrollBefore);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
    expect(await page.evaluate(() => document.documentElement.dataset.scrollLocked)).toBe('true');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    expect(await scroller.evaluate((element) => element.scrollTop)).toBe(scrollBefore);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
    expect(await page.evaluate(() => document.documentElement.dataset.scrollLocked)).toBeUndefined();

    await scroller.evaluate((element) => element.scrollTo(0, 0));
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBe(0);
  });
});
