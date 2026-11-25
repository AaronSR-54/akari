import { expect, test } from '@playwright/test';
import { chooseOption, seedDemo } from './helpers';

test.describe('preguntas y ajustes', () => {
  test('las preguntas rápidas responden con datos de ejemplo', async ({ page }) => {
    await seedDemo(page);
    await page.getByRole('link', { name: 'Preguntas rápidas' }).click();
    await expect(page.getByRole('heading', { name: 'Preguntas rápidas' })).toBeVisible();
    await expect(page.getByText(/¿Cuál fue tu mayor gasto/)).toBeVisible();
    await expect(page.getByText(/850,00/).first()).toBeVisible();
    await expect(page.getByText('Gastos evitables').first()).toBeVisible();
    await expect(page.getByText(/117,99/).first()).toBeVisible();
  });

  test('el perfil aparece al entrar desde el avatar', async ({ page }) => {
    await seedDemo(page);
    await page.getByRole('link', { name: 'Ajustes', exact: true }).click();
    await expect(page).toHaveURL(/\/ajustes$/);

    const perfil = page.locator('[data-profile="panel"]');
    await expect(perfil.getByRole('heading', { name: 'Perfil', level: 2 })).toBeVisible();
    await expect(perfil).toContainText('Marta');
    await expect(perfil).toContainText('Cuenta local');
  });

  test('edita el nombre del perfil y lo refleja el shell tras recargar', async ({ page }) => {
    await seedDemo(page);
    await page.getByRole('link', { name: 'Ajustes', exact: true }).click();

    const perfil = page.locator('[data-profile="panel"]');
    await perfil.getByRole('button', { name: 'Editar' }).click();
    const modal = page.getByRole('dialog', { name: 'Editar nombre' });
    await modal.getByLabel('Nombre').fill('   ');
    await modal.getByRole('button', { name: 'Guardar' }).click();
    await expect(modal.getByText(/obligatorio/)).toBeVisible();

    await modal.getByLabel('Nombre').fill('Ana Ruiz');
    await modal.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('Nombre actualizado')).toBeVisible();
    await expect(perfil).toContainText('Ana Ruiz');

    const enlacePerfil = page.getByRole('link', { name: 'Ajustes', exact: true });
    await expect(enlacePerfil).toHaveAttribute('title', 'Ajustes');
    await expect(enlacePerfil.getByRole('img', { name: 'Ana Ruiz' })).toBeVisible();

    await page.reload();
    await expect(page.locator('[data-profile="panel"]')).toContainText('Ana Ruiz');
    await expect(
      page.getByRole('link', { name: 'Ajustes', exact: true }).getByRole('img', { name: 'Ana Ruiz' }),
    ).toBeVisible();

    await page.goto('/');
    const greeting = page.getByRole('heading', { name: /, Ana Ruiz$/ });
    if ((page.viewportSize()?.width ?? 0) >= 768) {
      await expect(greeting).toBeVisible();
    } else {
      await expect(greeting).toHaveCount(0);
    }
  });

  test('cambia tema y shell y persiste el tema', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/ajustes');
    await chooseOption(page, 'Tema', 'Oscuro');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await chooseOption(page, 'Navegación de escritorio', 'Header');
    await expect(page.locator('aside')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Navegación principal' }).first()).toBeVisible();
  });

  test('exporta e importa una copia y reinicia los datos', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/ajustes');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar copia' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^akari-copia-\d{4}-\d{2}-\d{2}\.json$/);
    const backupPath = await download.path();
    expect(backupPath).toBeTruthy();

    await page.getByLabel('Archivo de copia de seguridad').setInputFiles(backupPath!);
    await expect(page.getByText('Copia importada')).toBeVisible();

    await page.getByRole('button', { name: 'Borrar', exact: true }).click();
    await page.getByRole('dialog', { name: 'Borrar base local' }).getByRole('button', { name: 'Borrar datos' }).click();
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.getByRole('heading', { name: /Tus cuentas/ })).toBeVisible();
  });
});
