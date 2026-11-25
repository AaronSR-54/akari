import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { chooseOption, seedDemo } from './helpers';

const routes = [
  '/',
  '/movimientos',
  '/grupos',
  '/preguntas',
  '/ajustes',
  '/cuentas/demo-acc-day',
  '/grupos/demo-grp-flat',
];

test.describe('accesibilidad', () => {
  test('las pantallas core no tienen violaciones graves', async ({ page }) => {
    test.slow();
    await seedDemo(page);
    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(250);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('nextjs-portal')
        .analyze();
      expect(
        results.violations,
        `${route}: ${results.violations.map((violation) => `${violation.id} (${violation.nodes.length})`).join(', ')}`,
      ).toEqual([]);
    }
  });

  test('la modal de detalle no tiene violaciones graves', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');
    await page.getByRole('button', { name: /Cena con amigos/ }).click();
    await expect(page.getByRole('dialog', { name: 'Cena con amigos' })).toBeVisible();
    // Los botones animan su color al habilitarse; axe debe medir el estado estable.
    await page.waitForTimeout(300);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('nextjs-portal')
      .analyze();
    expect(
      results.violations,
      results.violations.map((violation) => violation.id).join(', '),
    ).toEqual([]);
  });

  test('el tema oscuro mantiene la accesibilidad', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/ajustes');
    await chooseOption(page, 'Tema', 'Oscuro');
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('nextjs-portal')
      .analyze();
    expect(
      results.violations,
      results.violations.map((violation) => violation.id).join(', '),
    ).toEqual([]);
  });
});
