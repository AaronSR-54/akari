import { expect, test } from '@playwright/test';
import {
  chooseOption,
  expectGreetingForViewport,
  expectHeadingForViewport,
  seedDemo,
  startEmpty,
} from './helpers';

const toNumber = (text: string | null) => {
  const value = Number((text ?? '0').replace(/[^\d,]/g, '').replace(',', '.'));
  return text?.includes('−') || text?.includes('-') ? -value : value;
};

test.describe('dashboard hero', () => {
  test('el saludo del resumen se adapta al breakpoint', async ({ page }) => {
    await seedDemo(page);
    await expectGreetingForViewport(page);

    const width = page.viewportSize()?.width ?? 0;
    if (width >= 1024) {
      const header = page.locator('header.h-\\[72px\\]');
      await expect(header.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(header).not.toContainText('domingo, 29 de noviembre');
    }
    await expect(page.locator('[data-hero="balance"]')).toContainText(
      'Saldo total · domingo, 29 de noviembre',
    );
    await expect(page.locator('section[aria-labelledby="cuentas"]')).toContainText(
      'Cuentas · 3 cuentas en este dispositivo',
    );
  });

  test('saldo del mes con base y detalle diario, y balance en tarjeta', async ({ page }) => {
    await seedDemo(page);

    const balance = page.locator('[data-hero="balance"]');
    const monthBlock = page.locator('[data-hero="month"]');
    const quick = page.locator('[data-hero="quick"]');
    const recent = page.locator('[data-hero="recent"]');
    const summary = page.locator('[data-hero="month-summary"]');
    await expect(balance).toContainText('Saldo total · domingo, 29 de noviembre');
    await expect(monthBlock).toBeVisible();
    await expect(monthBlock).not.toContainText('Base 1 nov');
    await expect(recent).toContainText('Últimos movimientos');
    const recentLogo = recent.locator('[data-bank]').first();
    await expect(recentLogo).toBeVisible();
    const logoBox = await recentLogo.boundingBox();
    expect(logoBox?.width).toBe(32);
    expect(logoBox?.height).toBe(32);
    await expect(recent.getByRole('link', { name: 'Ver todos' })).toHaveAttribute(
      'href',
      '/movimientos',
    );
    await expect(quick).toBeVisible();
    await expect(quick).toHaveAttribute('aria-label', 'Accesos rápidos');
    const isDesktopWidth = (page.viewportSize()?.width ?? 1280) >= 768;
    const nuevoQuick = quick.getByRole('link', { name: 'Nuevo movimiento' });
    if (isDesktopWidth) {
      await expect(nuevoQuick).toHaveAttribute('href', '/movimientos/nuevo');
      await expect(nuevoQuick).toBeVisible();
    } else {
      await expect(nuevoQuick).toBeHidden();
    }
    await expect(quick.getByRole('link', { name: 'Nueva cuenta' })).toHaveAttribute(
      'href',
      '/cuentas/nueva',
    );
    await expect(quick.getByRole('link', { name: 'Preguntas rápidas' })).toHaveAttribute(
      'href',
      '/preguntas',
    );
    await expect(quick.getByRole('link', { name: 'Exportar' })).toHaveAttribute(
      'href',
      '/ajustes',
    );
    const addNav = page.locator('nav[aria-label="Navegación principal"] a[aria-label="Añadir movimiento"]');
    await expect(addNav).toHaveAttribute('href', '/movimientos/nuevo');
    if (isDesktopWidth) {
      await expect(addNav).toBeHidden();
      const deskPills = [
        nuevoQuick,
        quick.getByRole('link', { name: 'Nueva cuenta' }),
        quick.getByRole('link', { name: 'Preguntas rápidas' }),
        quick.getByRole('link', { name: 'Exportar' }),
      ];
      for (const pill of deskPills) await expect(pill).toBeVisible();
      const deskTops = await Promise.all(
        deskPills.map(async (pill) => (await pill.boundingBox())?.y ?? 0),
      );
      expect(Math.max(...deskTops) - Math.min(...deskTops)).toBeLessThanOrEqual(2);
    } else {
      await expect(addNav).toBeVisible();
      const pills = [
        quick.getByRole('link', { name: 'Nueva cuenta' }),
        quick.getByRole('link', { name: 'Preguntas rápidas' }),
        quick.getByRole('link', { name: 'Exportar' }),
      ];
      for (const pill of pills) await expect(pill).toBeVisible();
      const pillTops = await Promise.all(
        pills.map(async (pill) => (await pill.boundingBox())?.y ?? 0),
      );
      expect(Math.max(...pillTops) - Math.min(...pillTops)).toBeLessThanOrEqual(2);
    }
    await expect(recent.getByRole('link', { name: 'Preguntas rápidas' })).toHaveCount(0);
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

    const chartBox = await monthBlock.evaluate(async (element) => {
      try {
        await Promise.all(
          element.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
        );
      } catch {
        /* sin Web Animations: seguir con la medición */
      }
      return null;
    }).then(() => monthBlock.boundingBox());
    const summaryBox = await summary.boundingBox();
    expect(chartBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    if (chartBox && summaryBox) {
      const lineTop = await monthBlock.evaluate((element) => {
        const path = element.querySelector('svg path[fill="none"]');
        if (!path) return null;
        const box = element.getBoundingClientRect();
        return path.getBoundingClientRect().top - box.top;
      });
      expect(lineTop).not.toBeNull();
      if (lineTop !== null) expect(Math.abs(lineTop)).toBeLessThanOrEqual(2);
      const svgFill = await monthBlock.evaluate((element) => {
        const svg = element.querySelector('svg');
        if (!svg) return null;
        const box = element.getBoundingClientRect();
        return svg.getBoundingClientRect().height - box.height;
      });
      expect(svgFill).not.toBeNull();
      if (svgFill !== null) expect(Math.abs(svgFill)).toBeLessThanOrEqual(1);
      if ((page.viewportSize()?.width ?? 0) >= 1024) {
        expect(summaryBox.y - (chartBox.y + chartBox.height)).toBeLessThanOrEqual(1);
      } else {
        const recentBox = await recent.boundingBox();
        expect(recentBox).not.toBeNull();
        if (recentBox) {
          expect(recentBox.y).toBeGreaterThan(chartBox.y);
          expect(summaryBox.y).toBeGreaterThan(recentBox.y);
          const quickBoxM = await quick.boundingBox();
          expect(quickBoxM).not.toBeNull();
          if (quickBoxM) {
            expect(quickBoxM.y).toBeGreaterThan(summaryBox.y + summaryBox.height);
          }
          expect(Math.abs(recentBox.y - (chartBox.y + chartBox.height))).toBeLessThanOrEqual(1);
          await expect(balance).toHaveCSS('text-align', 'center');
          const recentCard = recent.locator('div').first();
          expect(await recentCard.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe(
            '0px',
          );
        }
      }

      if ((page.viewportSize()?.width ?? 0) >= 1024) {
        const balanceBox = await balance.boundingBox();
        const recentBox = await recent.boundingBox();
        expect(balanceBox).not.toBeNull();
        expect(recentBox).not.toBeNull();
        if (balanceBox && recentBox) {
          expect(Math.abs(chartBox.y - balanceBox.y)).toBeLessThanOrEqual(1);
          const quickBox = await quick.boundingBox();
          expect(quickBox).not.toBeNull();
          if (quickBox) {
            expect(quickBox.y).toBeGreaterThan(summaryBox.y + summaryBox.height);
            expect(quickBox.y - (summaryBox.y + summaryBox.height)).toBeGreaterThanOrEqual(16);
          }
          expect(quickBox ? quickBox.height : 0).toBeGreaterThan(0);
          const leftBottom = recentBox.y + recentBox.height;
          const rightBottom = quickBox.y + quickBox.height;
          expect(Math.abs(leftBottom - rightBottom)).toBeLessThanOrEqual(2);
        }
      }

      if ((page.viewportSize()?.width ?? 0) >= 1024) {
        const amountSize = await balance
          .locator('[data-amount]')
          .first()
          .evaluate((element) => getComputedStyle(element).fontSize);
        expect(amountSize).toBe('52px');
        await expect(balance).not.toContainText('estimado a fin de mes');
        await expect(balance).not.toContainText('Sin proyección');
        await expect(balance).not.toHaveCSS('text-align', 'center');
        const recentCard = recent.locator('div').first();
        expect(await recentCard.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe(
          '1px',
        );
      }
    }

    await expect(page.locator('[data-hero="upcoming"]')).toHaveCount(0);

    const bar = monthBlock.getByRole('group', { name: /Saldo del mes por día/ });
    await expect(bar).toBeVisible();
    expect(await page.getByText('Gastos por semana').count()).toBe(0);
    expect(await page.getByRole('img', { name: /Movimientos de la semana/ }).count()).toBe(0);

    const questions = quick.getByRole('link', { name: 'Preguntas rápidas' });
    await expect(questions).toBeVisible();
    await expect(questions).toHaveAttribute('href', '/preguntas');

    await page.locator('a[href="/cuentas/demo-acc-day"]').first().click();
    await expect(page).toHaveURL(/\/cuentas\/demo-acc-day/);
  });

  test('el gráfico deja espacio lateral y el detalle iguala el fondo de las cuentas', async ({ page }) => {
    await seedDemo(page);
    const month = page.locator('[data-hero="month"]');
    const monthBox = await month.boundingBox();
    const svgBox = await month.locator('svg').first().boundingBox();
    expect(monthBox).not.toBeNull();
    expect(svgBox).not.toBeNull();
    if (monthBox && svgBox) {
      expect(svgBox.x - monthBox.x).toBeCloseTo(8, 0);
      expect(monthBox.x + monthBox.width - (svgBox.x + svgBox.width)).toBeCloseTo(8, 0);
    }

    const bar = month.getByRole('group', { name: /Saldo del mes por día/ });
    await bar.focus();
    const detail = month.getByTestId('month-balance-detail');
    await expect(detail).toBeVisible();
    const detailBackground = await detail.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    const accountBackground = await page
      .locator('a[data-account]')
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(detailBackground).toBe(accountBackground);
  });

  test('la línea de la gráfica usa el acento mostaza en ambos temas', async ({ page }) => {
    await seedDemo(page);
    const line = page.locator('[data-hero="month"] svg path[fill="none"]');
    const expectAcento = async () => {
      const expected = await page.evaluate(() => {
        const hex = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-accent-default')
          .trim()
          .replace('#', '');
        return `rgb(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)})`;
      });
      const actual = await line.evaluate((element) => getComputedStyle(element).stroke);
      expect(actual).toBe(expected);
    };

    await expectAcento();
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await expectAcento();
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

    const addNavLink = page.locator('nav[aria-label="Navegación principal"] a[aria-label="Añadir movimiento"]');
    if (await addNavLink.isVisible()) {
      await addNavLink.click();
    } else {
      await page.getByRole('link', { name: 'Nuevo movimiento' }).first().click();
    }
    await page.getByLabel('Importe').fill('25');
    await page.getByLabel('Concepto').fill('Entradas');
    await chooseOption(page, 'Categoría', 'Ocio');
    await page.getByRole('button', { name: 'Guardar movimiento' }).click();
    await expect(page).toHaveURL(/\/movimientos$/);
    await expectHeadingForViewport(page, 'Movimientos');

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

  test('las cuentas son un único panel del bento con encabezado', async ({ page }) => {
    await seedDemo(page);

    const accounts = page.locator('section[aria-labelledby="cuentas"]');
    await expect(accounts).toBeVisible();
    const panel = accounts.locator('[data-panel="accounts"]');
    await expect(panel).toHaveCount(1);
    await expect(panel.getByRole('heading', { name: 'Cuentas · 3 cuentas en este dispositivo' })).toBeVisible();
    const manage = panel.getByRole('link', { name: 'Gestionar cuentas' });
    await expect(manage).toHaveAttribute('href', '/cuentas/nueva');
    const blocks = accounts.locator('a[data-account]');
    await expect(blocks).toHaveCount(3);

    const panelBackground = await panel.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    const blockBackground = await blocks.first().evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    expect(blockBackground).not.toBe(panelBackground);

    for (const name of ['Cuenta diaria', 'Depósito a plazo', 'Cuenta conjunta']) {
      await expect(accounts.getByText(name)).toBeVisible();
    }
    for (const bank of ['bbva', 'caixabank', 'santander']) {
      await expect(accounts.locator(`a[data-account] [data-bank="${bank}"]`)).toHaveCount(1);
    }
    await expect(accounts.locator('[data-accounts-header]')).toHaveCount(0);

    const tops: number[] = [];
    for (const block of await blocks.all()) {
      const box = await block.boundingBox();
      expect(box).not.toBeNull();
      if (box) tops.push(box.y);
    }
    expect(tops).toHaveLength(3);
    const width = page.viewportSize()?.width ?? 0;
    if (width >= 1024) {
      expect(new Set(tops.map((top) => Math.round(top))).size).toBe(1);
    } else if (width >= 640) {
      expect(Math.abs(tops[0]! - tops[1]!)).toBeLessThanOrEqual(1);
      expect(tops[2]!).toBeGreaterThan(tops[1]!);
    } else {
      expect(tops[1]!).toBeGreaterThan(tops[0]!);
      expect(tops[2]!).toBeGreaterThan(tops[1]!);
    }

    const hero = page.locator('section[aria-label="Resumen de saldo y gastos del mes"]');
    const heroBox = await hero.boundingBox();
    const accountsBox = await accounts.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(accountsBox).not.toBeNull();
    if (heroBox && accountsBox) {
      expect(Math.abs(accountsBox.width - heroBox.width)).toBeLessThanOrEqual(1);
      expect(accountsBox.y).toBeGreaterThan(heroBox.y + heroBox.height);
    }
  });

  test('el panel de cuentas escala de ninguna a muchas cuentas', async ({ page }) => {
    await startEmpty(page);
    await expect(page.locator('section[aria-labelledby="cuentas"]')).toHaveCount(0);

    const addAccount = async (name: string) => {
      await page.goto('/cuentas/nueva');
      await page.getByLabel('Nombre de la cuenta').fill(name);
      await page.getByLabel('Saldo inicial').fill('100');
      await page.getByRole('button', { name: 'Guardar cuenta' }).click();
      await expect(page).toHaveURL(/\/cuentas\/acc_/);
    };

    await addAccount('Única');
    await page.goto('/');
    const accounts = page.locator('section[aria-labelledby="cuentas"]');
    await expect(accounts.locator('a[href="/cuentas/nueva"]')).toHaveCount(1);
    await expect(accounts.locator('a[data-account]')).toHaveCount(1);
    await expect(accounts.getByText('Única')).toBeVisible();

    for (const name of ['Segunda', 'Tercera', 'Cuarta', 'Quinta']) await addAccount(name);
    await page.goto('/');
    const rows = accounts.locator('a[data-account]');
    await expect(rows).toHaveCount(5);

    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `desbordamiento a ${width}px`).toBeLessThanOrEqual(1);
    }
  });
});
