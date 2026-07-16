import { expect, test } from '@playwright/test';

test('renders the approved card workspace', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Approved work cards' })).toBeVisible();
  await expect(page.getByText('Catalog verified')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Review privileged access change' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Median approval latency' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Review evidence' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Approve privileged access change' }),
  ).toBeVisible();
});
