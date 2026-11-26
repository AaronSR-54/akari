import { expect, test } from '@playwright/test';
import { chooseOption, seedDemo, startEmpty } from './helpers';

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

  test('la barra de desplazamiento usa los tokens y se adapta al tema', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 600 });
    await seedDemo(page);
    await page.goto('/movimientos');
    await page.mouse.move(10, 10);

    const readScrollbar = () =>
      page.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) throw new Error('Falta main');
        const style = getComputedStyle(main);
        const root = getComputedStyle(document.documentElement);
        return {
          scrollbarWidth: style.getPropertyValue('scrollbar-width'),
          scrollbarColor: style.getPropertyValue('scrollbar-color'),
          overflowY: style.overflowY,
          accent: root.getPropertyValue('--color-accent-default').trim(),
          accentRgb: root.getPropertyValue('--color-accent-default-rgb').trim(),
          scrolls: main.scrollHeight > main.clientHeight,
          documentScrolls:
            document.documentElement.scrollHeight > document.documentElement.clientHeight,
          right: main.getBoundingClientRect().right,
          viewport: window.innerWidth,
        };
      });

    const light = await readScrollbar();
    expect(light.scrollbarWidth).toBe('thin');
    expect(light.scrollbarColor).toContain('232, 163, 61');
    expect(light.scrollbarColor).toContain('0.55');
    expect(light.scrollbarColor).toContain('rgba(0, 0, 0, 0)');
    expect(light.overflowY).toBe('auto');
    expect(light.scrolls).toBe(true);
    expect(light.documentScrolls).toBe(false);
    expect(Math.round(light.right)).toBe(light.viewport);

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const dark = await readScrollbar();
    expect(dark.accent).not.toBe(light.accent);
    expect(dark.scrollbarColor).not.toBe(light.scrollbarColor);

    await page.setViewportSize({ width: 900, height: 900 });
    const tabletWidth = await page.evaluate(() =>
      getComputedStyle(document.querySelector('main')!).getPropertyValue('scrollbar-width'),
    );
    expect(tabletWidth).toBe('auto');

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 900, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        )
        .toBeLessThanOrEqual(1);
    }

    await page.goto('/preguntas');
    const noScrollbar = page.locator('.no-scrollbar').first();
    await expect(noScrollbar).toBeVisible();
    const hidden = await noScrollbar.evaluate((element) => ({
      scrollable: element.scrollWidth > element.clientWidth,
      width: getComputedStyle(element).getPropertyValue('scrollbar-width'),
      display: getComputedStyle(element, '::-webkit-scrollbar').display,
    }));
    expect(hidden.scrollable).toBe(true);
    expect(hidden.width).toBe('none');
    expect(hidden.display).toBe('none');
  });

  test('la sidebar y la cabecera permanecen fijas al hacer scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 600 });
    await seedDemo(page);
    await page.goto('/ajustes');
    await expect(page.getByRole('heading', { name: 'Ajustes' })).toBeVisible();

    const aside = page.locator('aside');
    const header = page.locator('header.h-\\[72px\\]');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Ajustes');
    await expect(header).not.toContainText('Tu perfil y los datos guardados en este dispositivo');
    await expect(page.getByRole('heading', { name: 'Ajustes', level: 1 })).toHaveCount(1);
    await expect(header.getByRole('heading', { name: 'Ajustes', level: 1 })).toBeVisible();
    await expect(page).toHaveTitle('Ajustes · akari', { timeout: 30_000 });
    await expect(
      page.locator('main').getByText('Tu perfil y los datos guardados en este dispositivo', {
        exact: false,
      }),
    ).toBeVisible();
    const before = { aside: await aside.boundingBox(), header: await header.boundingBox() };
    expect(before.header?.y).toBe(0);
    const contentHeader = page.locator('main header').first();
    const contentBox = await contentHeader.boundingBox();
    const gap = (contentBox?.y ?? 0) - ((before.header?.y ?? 0) + (before.header?.height ?? 0));
    expect(gap).toBeGreaterThanOrEqual(24);

    const scroller = page.locator('main');
    await scroller.evaluate((element) => element.scrollTo(0, 220));
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(150);

    const after = { aside: await aside.boundingBox(), header: await header.boundingBox() };
    expect(after.aside?.y).toBe(before.aside?.y);
    expect(after.header?.y).toBe(0);
    await expect(header).toBeVisible();
  });

  test('el resumen lleva el saludo sin subtítulo en la cabecera', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);

    const header = page.locator('header.h-\\[72px\\]');
    await expect(header.getByRole('heading', { name: /Buen[oa]s/ })).toBeVisible();
    await expect(header).not.toContainText('domingo, 29 de noviembre');
    await expect(page.locator('[data-hero="balance"]')).toContainText(
      'Saldo total · domingo, 29 de noviembre',
    );
    await expect(page).toHaveTitle('Resumen · akari', { timeout: 30_000 });
  });

  test('el título respira bajo la barra en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seedDemo(page);
    await page.goto('/ajustes');

    const bar = page.locator('header.sticky.top-0:visible');
    const title = page.getByRole('heading', { name: 'Ajustes', level: 1 });
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

    const scroller = page.locator('main');
    await scroller.evaluate((element) => element.scrollTo(0, 220));
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(150);

    const navBox = await nav.boundingBox();
    expect(navBox?.y).toBe(0);
    await expect(page.getByRole('button', { name: 'Buscar' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Avisos' })).toHaveCount(1);
  });

  test('la identidad aparece una sola vez en cada variante', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 600 });
    await seedDemo(page);
    await page.goto('/ajustes');

    await expect(page.locator('aside').getByRole('img', { name: 'Marta' })).toHaveCount(1);
    await expect(page.locator('[data-profile="panel"]').getByRole('img', { name: 'Marta' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Avisos' })).toBeVisible();

    await chooseOption(page, 'Navegación de escritorio', 'Header');
    await expect(page.getByLabel('Navegación de escritorio')).toHaveAttribute('data-value', 'header');
    await expect(page.locator('aside')).toHaveCount(0);
    await expect(
      page.locator('header.sticky.top-0:visible').getByRole('img', { name: 'Marta' }),
    ).toHaveCount(1);
  });

  test('el avatar abre ajustes en todas las variantes del shell', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);

    const accederAjustes = async () => {
      await page.getByRole('link', { name: 'Ajustes', exact: true }).click();
      await expect(page).toHaveURL(/\/ajustes$/);
    };

    await accederAjustes();

    await chooseOption(page, 'Navegación de escritorio', 'Header');
    await page.goto('/');
    await accederAjustes();

    await page.setViewportSize({ width: 900, height: 900 });
    await page.goto('/');
    await accederAjustes();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await accederAjustes();
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

  test('el desplegable muestra una lista única por fecha y limpia el indicador al abrir', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);

    const bell = page.getByRole('button', { name: 'Avisos, 6 pendientes' });
    await expect(bell).toBeVisible();
    await bell.click();

    const dialog = page.getByRole('dialog', { name: 'Avisos' });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(360);
    expect(box?.width ?? 0).toBeLessThan(520);
    const bellBox = await page.getByRole('button', { name: /^Avisos/ }).boundingBox();
    expect(Math.abs((box?.x ?? 0) + (box?.width ?? 0) - ((bellBox?.x ?? 0) + (bellBox?.width ?? 0)))).toBeLessThan(8);
    await expect(
      dialog.getByRole('heading', { name: /Pagos próximos|Cuentas compartidas|Liquidaciones/ }),
    ).toHaveCount(0);
    const items = dialog.getByRole('listitem');
    await expect(items).toHaveCount(6);
    await expect(items.nth(0)).toContainText('Portátil · cuota');
    await expect(items.nth(1)).toContainText('Ana gastó dinero');
    await expect(items.nth(2)).toContainText('Debes 20,00');
    await expect(items.nth(3)).toContainText('Debes 30,00');
    await expect(items.nth(4)).toContainText('Alquiler');
    await expect(items.nth(5)).toContainText('Suscripción vídeo');
    await expect(items.last()).toBeInViewport();
    const payment = dialog.getByRole('button', { name: /Portátil · cuota/ });
    await expect(payment).toHaveAttribute('data-tone', 'danger');
    await expect(payment).toHaveClass(/bg-status-danger-soft/);
    await expect(payment).toContainText('Vencida');
    await expect(items.nth(4).getByRole('button')).toHaveClass(/bg-status-info-soft/);
    await expect(items.nth(5).getByRole('button')).toHaveClass(/bg-status-info-soft/);
    await expect(payment).toContainText('Saldo');
    await expect(payment).toContainText('Cuenta diaria');
    await expect(dialog.getByText('Pagar')).toHaveCount(0);

    const clearedBell = page.getByRole('button', { name: 'Avisos' });
    await expect(clearedBell).toBeVisible();
    await expect(clearedBell.locator('[data-notification-count]')).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(clearedBell).toBeFocused();
  });

  test('paga una suscripción al pulsar su aviso', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await page.getByRole('button', { name: 'Avisos, 6 pendientes' }).click();

    const dialog = page.getByRole('dialog', { name: 'Avisos' });
    const row = dialog.getByRole('button', { name: /Suscripción vídeo/ });
    await expect(row).toBeVisible();
    await row.click();
    await expect(page.getByText('Pago registrado')).toBeVisible();
    await expect(dialog.getByRole('button', { name: /Suscripción vídeo/ })).toHaveCount(0);

    await page.keyboard.press('Escape');
    await page.goto('/movimientos');
    await expect(page.getByText('Suscripción vídeo').first()).toBeVisible();
  });

  test('la actividad conjunta muestra al autor y abre la cuenta', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await page.getByRole('button', { name: 'Avisos, 6 pendientes' }).click();

    const dialog = page.getByRole('dialog', { name: 'Avisos' });
    const activity = dialog.getByRole('link', { name: /Ana gastó dinero/ });
    await expect(activity).toContainText('Compra del piso');
    await expect(activity).toContainText('Cuenta conjunta');
    await activity.click();

    await expect(page).toHaveURL(/\/cuentas\/demo-acc-joint/);
    await expect(page.getByRole('heading', { name: 'Cuenta conjunta' })).toBeVisible();
    await expect(page.getByText('Compra del piso').first()).toBeVisible();
  });

  test('las liquidaciones pendientes abren el grupo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await page.getByRole('button', { name: 'Avisos, 6 pendientes' }).click();

    const dialog = page.getByRole('dialog', { name: 'Avisos' });
    await expect(page.getByRole('button', { name: 'Avisos' })).toBeVisible();
    const settlement = dialog.getByRole('link', { name: /Debes 30,00.* a Ana/ });
    await expect(settlement).toBeVisible();
    await expect(dialog.getByRole('link', { name: /Debes 20,00.* a Luis/ })).toBeVisible();
    await settlement.click();

    await expect(page).toHaveURL(/\/grupos\/demo-grp-flat/);
    await expect(page.getByRole('heading', { name: 'Piso compartido' })).toBeVisible();
  });

  test('vuelve a avisar cuando aparece actividad nueva', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await page.getByRole('button', { name: 'Avisos, 6 pendientes' }).click();
    await expect(page.getByRole('button', { name: 'Avisos' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Avisos' })).toBeHidden();

    await page.goto('/movimientos/nuevo?cuenta=demo-acc-joint');
    await page.getByText('Registrado por').waitFor();
    await page.getByLabel('Importe').fill('10');
    await page.getByLabel('Concepto').fill('Cena nueva');
    await page.getByRole('button', { name: 'Guardar movimiento' }).click();
    await page.waitForURL(/\/movimientos$/);

    await expect(page.getByRole('button', { name: 'Avisos, 1 pendiente' })).toBeVisible();
  });

  test('el panel de avisos se abre desde la cabecera superior', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    await page.goto('/ajustes');
    await chooseOption(page, 'Navegación de escritorio', 'Header');

    const bells = page.getByRole('button', { name: /^Avisos/ });
    await expect(bells).toHaveCount(1);
    await bells.click();
    const dialog = page.getByRole('dialog', { name: 'Avisos' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('listitem')).toHaveCount(6);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Avisos' })).toBeFocused();
  });

  test('el panel de avisos muestra su estado vacío sin indicador', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await startEmpty(page);

    const bell = page.getByRole('button', { name: 'Avisos' });
    await expect(bell).toBeVisible();
    await expect(bell.locator('[data-notification-count]')).toHaveCount(0);
    await bell.click();

    const dialog = page.getByRole('dialog', { name: 'Avisos' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('No hay avisos')).toBeVisible();
    await expect(dialog.getByRole('listitem')).toHaveCount(0);
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

  test('ítems de 44 px y avatar de 40 px sin desbordamiento', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seedDemo(page);
    const overflow = () =>
      page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const navHeight = (selector: string) =>
      page.locator(selector).first().evaluate((el) => Math.round(el.getBoundingClientRect().height));

    await expect.poll(() => navHeight('aside ul li a:visible')).toBe(44);
    const asideAvatar = page.locator('aside [role="img"][aria-label="Marta"]');
    expect(Math.round((await asideAvatar.boundingBox())?.width ?? 0)).toBe(40);
    expect(await overflow()).toBeLessThanOrEqual(1);

    await page.goto('/ajustes');
    await chooseOption(page, 'Navegación de escritorio', 'Header');
    await expect.poll(() => navHeight('header nav a:visible')).toBe(44);
    const headerAvatar = page.locator('header.sticky.top-0:visible [role="img"][aria-label="Marta"]');
    expect(Math.round((await headerAvatar.boundingBox())?.width ?? 0)).toBe(40);
    expect(await overflow()).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 900, height: 900 });
    await expect.poll(() => navHeight('header nav a:visible')).toBe(44);
    const tabletAvatar = page.locator('header [role="img"][aria-label="Marta"]:visible');
    expect(Math.round((await tabletAvatar.boundingBox())?.width ?? 0)).toBe(40);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileAvatar = page.locator('header [role="img"][aria-label="Marta"]:visible');
    expect(Math.round((await mobileAvatar.boundingBox())?.width ?? 0)).toBe(40);
    const tabHeight = await page
      .locator('nav.fixed a')
      .first()
      .evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(tabHeight).toBeGreaterThanOrEqual(44);
  });

  test('el logotipo mide 32 px en sidebar y en header', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    const logoHeight = async () =>
      Math.round(
        (await page.locator('[role="img"][aria-label="akari"]:visible').first().boundingBox())?.height ?? 0,
      );

    await expect.poll(logoHeight).toBe(32);

    await page.goto('/ajustes');
    await chooseOption(page, 'Navegación de escritorio', 'Header');
    await expect(page.locator('header.sticky.top-0:visible')).toBeVisible();
    await expect.poll(logoHeight).toBe(32);
  });

  test('el punto del logotipo compacto hace de punto final en la línea base', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    const logo = page.locator('aside [role="img"][aria-label="akari"]:visible').first();
    await expect
      .poll(async () => Math.round((await logo.boundingBox())?.height ?? 0))
      .toBe(32);

    const glyph = logo.locator('span[aria-hidden="true"]').first();
    const dot = logo.locator('span[aria-hidden="true"]').last();
    await expect
      .poll(async () => {
        const glyphBox = await glyph.boundingBox();
        const dotBox = await dot.boundingBox();
        if (!glyphBox || !dotBox) return false;
        const dotCenterY = dotBox.y + dotBox.height / 2;
        const glyphCenterY = glyphBox.y + glyphBox.height / 2;
        const baselineGap = glyphBox.y + glyphBox.height - (dotBox.y + dotBox.height);
        return (
          dotCenterY > glyphCenterY &&
          dotBox.x > glyphBox.x + glyphBox.width &&
          baselineGap >= 1 &&
          baselineGap <= 12
        );
      })
      .toBe(true);
  });

  test('la sidebar se expande sobre el contenido sin redimensionarlo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    const aside = page.locator('aside');
    const main = page.locator('main');

    await expect(aside).toHaveAttribute('data-expanded', 'false');
    await expect.poll(async () => Math.round((await aside.boundingBox())?.width ?? 0)).toBe(76);
    const mainCompact = await main.boundingBox();

    await aside.hover();
    await expect(aside).toHaveAttribute('data-expanded', 'true');
    await expect.poll(async () => Math.round((await aside.boundingBox())?.width ?? 0)).toBe(240);
    const mainExpanded = await main.boundingBox();
    expect(mainExpanded?.x).toBe(mainCompact?.x);
    expect(mainExpanded?.width).toBe(mainCompact?.width);

    const asideBox = await aside.boundingBox();
    expect((asideBox?.x ?? 0) + (asideBox?.width ?? 0)).toBeGreaterThan(mainExpanded?.x ?? 0);

    await page.mouse.move(600, 400);
    await expect(aside).toHaveAttribute('data-expanded', 'false');
    await expect.poll(async () => Math.round((await aside.boundingBox())?.width ?? 0)).toBe(76);
    const mainCollapsed = await main.boundingBox();
    expect(mainCollapsed?.x).toBe(mainCompact?.x);
    expect(mainCollapsed?.width).toBe(mainCompact?.width);
  });

  test('el panel flotante se atenúa y al fijarlo se redimensiona el contenido', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seedDemo(page);
    const aside = page.locator('aside');
    const main = page.locator('main');
    const scrim = page.locator('[data-sidebar-scrim]');

    await aside.hover();
    await expect(aside).toHaveAttribute('data-expanded', 'true');
    await expect(scrim).toHaveCount(1);
    expect(await aside.getAttribute('class')).toContain('elevation-3');
    const compactMain = await main.boundingBox();

    await aside.getByRole('button', { name: 'Expandir navegación' }).click();
    await expect(scrim).toHaveCount(0);
    await page.mouse.move(700, 500);
    await expect(aside).toHaveAttribute('data-expanded', 'true');
    await expect.poll(async () => Math.round((await main.boundingBox())?.x ?? 0)).toBe(
      Math.round((compactMain?.x ?? 0) + 164),
    );
    expect(Math.round((await main.boundingBox())?.width ?? 0)).toBe(Math.round((compactMain?.width ?? 0) - 164));
    expect(await aside.getAttribute('class')).toContain('elevation-1');

    await aside.hover();
    await aside.getByRole('button', { name: 'Colapsar navegación' }).click();
    await page.locator('header.h-\\[72px\\]').getByRole('heading', { level: 1 }).click();
    await page.mouse.move(700, 500);
    await expect(aside).toHaveAttribute('data-expanded', 'false');
    await expect.poll(async () => Math.round((await main.boundingBox())?.x ?? 0)).toBe(Math.round(compactMain?.x ?? 0));
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
