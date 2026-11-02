import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// Playwright does not load .env.local itself. Node's built-in loader avoids adding a dependency;
// it does not override variables already present in the environment (e.g. CI secrets).
try {
  process.loadEnvFile(path.join(__dirname, '../.env.local'));
} catch {
  // No .env.local (CI supplies real environment variables instead).
}

const baseURL = process.env['BASE_URL'] || 'http://localhost:3000';
const authFile = path.join(__dirname, '.auth/user.json');

export default defineConfig({
  testDir: './src',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    cwd: '..',
    timeout: 180_000,
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      testIgnore: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: authFile },
      dependencies: ['setup'],
    },
    // firefox and webkit are intentionally not configured: only the chromium browser binary is
    // installed in this environment. Add them back alongside `npx playwright install` if needed.
  ],
});
