import { expect, type Page } from '@playwright/test';

export async function seedDemo(page: Page) {
  await page.goto('/onboarding');
  await page.getByRole('button', { name: 'Ver con datos de ejemplo' }).click();
  await page.waitForURL(/\/$/);
  await expect(page.locator('[data-hero="balance"]')).toBeVisible();
}

export async function expectGreetingForViewport(page: Page) {
  const greeting = page.getByRole('heading', { name: /Buen[oa]s/ });
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    await expect(greeting).toBeVisible();
  } else {
    await expect(greeting).toHaveCount(0);
  }
}

export async function expectHeadingForViewport(page: Page, name: string) {
  const heading = page.getByRole('heading', { name, exact: true });
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    await expect(heading).toBeVisible();
  } else {
    await expect(heading).toHaveCount(0);
  }
}

export async function startEmpty(page: Page) {
  await page.goto('/onboarding');
  await page.getByRole('button', { name: 'Omitir el asistente' }).click();
  await page.waitForURL(/\/$/);
}

export async function openNewAccount(page: Page) {
  await page.goto('/');
  const pill = page.getByRole('button', { name: 'Nueva cuenta' });
  if (await pill.count()) {
    await pill.first().click();
  } else {
    await page.getByRole('button', { name: 'Añadir cuenta' }).first().click();
  }
  await expect(page.getByRole('dialog', { name: 'Nueva cuenta' })).toBeVisible();
}

export async function openNav(page: Page, name: string) {
  await page.getByRole('link', { name, exact: true }).first().click();
  await expect(page.getByRole('heading', { name, exact: true }).first()).toBeVisible();
}

export async function chooseOption(page: Page, label: string, option: string) {
  const trigger = page.getByLabel(label).first();
  await trigger.click();
  await page.getByRole('option', { name: option, exact: true }).click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
}
