import { expect, type Page } from '@playwright/test';

export async function seedDemo(page: Page) {
  await page.goto('/onboarding');
  await page.getByRole('button', { name: 'Ver con datos de ejemplo' }).click();
  await page.waitForURL(/\/$/);
  await expect(page.getByRole('heading', { name: /Buen[oa]s/ })).toBeVisible();
}

export async function startEmpty(page: Page) {
  await page.goto('/onboarding');
  await page.getByRole('button', { name: 'Empezar vacío' }).click();
  await page.waitForURL(/\/$/);
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
