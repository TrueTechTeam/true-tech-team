import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // The hero heading; a substring keeps this durable against copy tweaks.
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();
  await expect(heading).toContainText('Building Tomorrow');
});
