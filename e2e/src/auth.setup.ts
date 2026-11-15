import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env['E2E_EMAIL'];
  const password = process.env['E2E_PASSWORD'];

  // Fail loudly rather than running unauthenticated: an anonymous run would redirect every
  // protected route to /login and produce a cascade of confusing failures downstream.
  if (!email || !password) {
    throw new Error(
      'E2E_EMAIL and E2E_PASSWORD must be set (see .env.local.example). ' +
        'Create a non-admin Supabase user with a portfolio-builder grant in app_permissions.'
    );
  }

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('textbox', { name: /^password/i }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // The app redirects to the dashboard on success; waiting on the URL proves the session took.
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 60_000 });
  await expect(page).not.toHaveURL(/\/login/);

  await page.context().storageState({ path: authFile });
});
