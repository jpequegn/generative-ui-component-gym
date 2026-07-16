import { expect, test } from '@playwright/test';

test('renders the controlled workspace shell', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Execution workspace' })).toBeVisible();
  await expect(page.getByText('Foundation ready')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No active run' })).toBeVisible();
});
