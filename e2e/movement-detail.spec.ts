import { expect, test } from '@playwright/test';
import { seedDemo } from './helpers';

test.describe('detalle de movimiento', () => {
  test('abre la modal desde el listado, muestra los datos y edita', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');

    await page.getByRole('button', { name: /Cena con amigos/ }).click();
    const detail = page.getByRole('dialog', { name: 'Cena con amigos' });
    await expect(detail).toBeVisible();
    await expect(detail.getByText('Datos del movimiento')).toBeVisible();
    await expect(detail.getByText('Ocio', { exact: true })).toBeVisible();
    await expect(detail.getByText('Cuenta diaria')).toBeVisible();
    await expect(detail.getByText(/45,00/).first()).toBeVisible();

    await detail.getByRole('button', { name: 'Editar' }).click();
    const dialog = page.getByRole('dialog', { name: 'Editar movimiento' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Concepto').fill('Cena de equipo');
    await dialog.getByRole('button', { name: 'Guardar' }).click();

    const updated = page.getByRole('dialog', { name: 'Cena de equipo' });
    await expect(updated).toBeVisible();
    await updated.getByRole('button', { name: 'Cerrar' }).click();
    await expect(page.getByRole('button', { name: /Cena de equipo/ })).toBeVisible();
  });

  test('la fila completa abre la modal', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');
    if (page.viewportSize()!.width >= 768) {
      await page.getByRole('row', { name: /Cena con amigos/ }).getByText('Ocio').click();
    } else {
      await page.getByRole('button', { name: /Cena con amigos/ }).getByText('Ocio').click();
    }
    await expect(page.getByRole('dialog', { name: 'Cena con amigos' })).toBeVisible();
  });

  test('elimina desde la modal y deshace', async ({ page }) => {
    await seedDemo(page);
    await page.goto('/movimientos');
    await page.getByRole('button', { name: /Cena con amigos/ }).click();

    const detail = page.getByRole('dialog', { name: 'Cena con amigos' });
    await expect(detail).toBeVisible();
    await detail.getByRole('button', { name: 'Eliminar' }).click();

    const confirm = page.getByRole('dialog', { name: 'Eliminar movimiento' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Eliminar movimiento' }).click();

    await expect(page.getByText('Movimiento eliminado')).toBeVisible();
    await expect(page.getByRole('button', { name: /Cena con amigos/ })).toHaveCount(0);

    await page.getByRole('button', { name: 'Deshacer' }).click();
    await expect(page.getByRole('button', { name: /Cena con amigos/ })).toBeVisible();
  });
});
