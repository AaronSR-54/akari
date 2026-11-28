import { expect, test } from '@playwright/test';
import { seedDemo, startEmpty } from './helpers';

test.describe('acceso', () => {
  test('la ruta de acceso mantiene la marca y no muestra textos internos', async ({ page }) => {
    await page.goto('/entrar');
    await expect(page.getByRole('img', { name: 'akari' }).first()).toBeVisible();
    await expect(page.getByText('Sin cifrado de extremo a extremo')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /Volver al resumen|Volver a primeros pasos/ }),
    ).toHaveCount(0);
    await expect(page.getByText(/Supabase/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Continuar sin registrarte' })).toBeVisible();
  });

  test('el alta pide email y después la contraseña dos veces', async ({ page }) => {
    await page.goto('/entrar');
    const signupTab = page.getByRole('tab', { name: 'Crear cuenta' });
    if (!(await signupTab.isVisible().catch(() => false))) {
      test.skip(true, 'Requiere Supabase configurado en el entorno');
    }

    await signupTab.click();
    await expect(page.getByRole('button', { name: 'Registrarse con Google' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Email/ })).toBeVisible();
    await expect(page.getByLabel(/Repite la contraseña/)).toHaveCount(0);

    await page.getByRole('textbox', { name: /Email/ }).fill('ana@example.com');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByLabel(/^Contraseña/)).toBeVisible();
    await expect(page.getByLabel(/Repite la contraseña/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Registrarse con Google' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Continuar sin registrarte' })).toBeVisible();
    await page.getByRole('button', { name: 'Cambiar email' }).click();
    await expect(page.getByRole('textbox', { name: /Email/ })).toBeVisible();
  });

  test('iniciar sesión ofrece Google y la salida sin cuenta vuelve a la app', async ({ page }) => {
    await startEmpty(page);
    await page.goto('/entrar');
    const signinTab = page.getByRole('tab', { name: 'Iniciar sesión' });
    if (!(await signinTab.isVisible().catch(() => false))) {
      test.skip(true, 'Requiere Supabase configurado en el entorno');
    }

    await expect(page.getByRole('button', { name: 'Iniciar sesión con Google' })).toBeVisible();
    await page.getByRole('tab', { name: 'Crear cuenta' }).click();
    await page.getByRole('button', { name: 'Continuar sin registrarte' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('con datos locales, el selector aparece al intentar entrar y se puede volver', async ({
    page,
  }) => {
    await seedDemo(page);
    await page.goto('/entrar');
    const signinTab = page.getByRole('tab', { name: 'Iniciar sesión' });
    if (!(await signinTab.isVisible().catch(() => false))) {
      test.skip(true, 'Requiere Supabase configurado en el entorno');
    }

    await expect(page.getByText(/no están en tu cuenta/)).toHaveCount(0);
    await page.getByRole('textbox', { name: /Email/ }).fill('ana@example.com');
    await page.getByLabel(/^Contraseña/).fill('secreto123');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();

    await expect(page.getByText(/no están en tu cuenta/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sincronizar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', { name: 'Usar los de la cuenta' }).click();
    await page.getByRole('button', { name: 'Volver' }).click();
    await expect(page.getByRole('textbox', { name: /Email/ })).toHaveValue('ana@example.com');
  });

  test('continuar sin cuenta con datos locales abre el resumen', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/entrar');
    await page.getByRole('button', { name: 'Continuar sin registrarte' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('continuar sin cuenta en un dispositivo vacío abre el onboarding', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByRole('button', { name: 'Continuar sin registrarte' }).click();
    await expect(page).toHaveURL(/\/onboarding$/);
  });
});
