import { expect, test } from '@playwright/test';

test('streams the risk-review route into approved cards', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Live run' })).toBeVisible();
  await page.getByRole('button', { name: 'Run risk review' }).click();
  await page.getByRole('button', { name: 'Apply next event' }).click();
  await page.getByRole('button', { name: 'Apply next event' }).click();
  await page.getByRole('button', { name: 'Apply next event' }).click();
  await page.getByRole('button', { name: 'Apply next event' }).click();

  await expect(
    page.getByRole('heading', { name: 'Review privileged access change' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Decision evidence' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Approve privileged access change' }),
  ).toBeVisible();
  await page.getByLabel('Decision note').fill('Synthetic reviewer recorded the required evidence.');
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page.getByText(/Synthetic route approved/i)).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Approve privileged access change' }),
  ).not.toBeVisible();
});

test('shows the schema-boundary evidence report', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Known components only' })).toBeVisible();
  await expect(page.getByText('Boundary holds')).toBeVisible();
  await expect(page.getByText(/4 approved specifications/i)).toBeVisible();
  await expect(page.getByText('unsafeLink')).toBeVisible();
});
