import { test, expect } from '@playwright/test';

// One serial flow: each step depends on the last. The value is proving the whole path works once,
// which no amount of unit testing has established for this feature.
test.describe.configure({ mode: 'serial' });

const unique = Date.now();
const pageTitle = `E2E Graphic Design ${unique}`;
let publicPath = '';

test.describe('portfolio builder: create from template, edit, publish', () => {
  test('the page list is reachable (not access-denied)', async ({ page }) => {
    await page.goto('/portfolio-builder', { timeout: 90_000 });
    await expect(page.getByRole('heading', { name: /my pages/i })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/access denied|don.t have access/i)).toHaveCount(0);
  });

  test('the create dialog offers every template', async ({ page }) => {
    await page.goto('/portfolio-builder');
    await page.getByRole('button', { name: 'New Page', exact: true }).click();
    await expect(page.getByRole('group', { name: /template/i })).toBeVisible();
    for (const label of [
      'Software Engineer',
      'Graphic Design',
      'Project Manager',
      'Cartography',
      'Marketing',
      'Start Blank',
    ]) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
  });

  test('creating from Graphic Design seeds that template and opens the editor', async ({
    page,
  }) => {
    await page.goto('/portfolio-builder');
    await page.getByRole('button', { name: 'New Page', exact: true }).click();
    await page.getByRole('button', { name: 'Graphic Design' }).click();
    await page.getByLabel(/title/i).fill(pageTitle);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await page.waitForURL(/\/portfolio-builder\/edit\//, { timeout: 60_000 });

    // The sidebar names prove the TEMPLATE drove the seed, not the old hardcoded pair.
    for (const name of ['Home', 'Intro', 'Portfolio', 'Services', 'Contact']) {
      await expect(page.getByRole('button', { name: new RegExp(`\\d+\\. ${name}$`) })).toBeVisible({
        timeout: 30_000,
      });
    }

    // ...and the template's THEME reached the page: the canvas carries Graphic Design's preset
    // ('coral-reef', primary = --color-coral-500) as a scoped custom property. A computed custom
    // property has its var() substituted, and the library's minified CSS spells #ff7f50 as the
    // named color 'coral', so accept either spelling. The Slate default resolves to #06f, so this
    // cannot pass on an un-themed page.
    const canvas = page.getByTestId('canvas-background');
    await expect(canvas).toBeVisible({ timeout: 30_000 });
    const primary = await canvas.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('--theme-primary').trim()
    );
    expect(primary).toMatch(/^(coral|#ff7f50)$/i);
  });

  test('editing a section updates the live canvas, and the page saves', async ({ page }) => {
    await page.goto('/portfolio-builder');
    await page.getByRole('link', { name: new RegExp(pageTitle) }).click();
    await page.waitForURL(/\/portfolio-builder\/edit\//);

    await page.getByRole('button', { name: /^\d+\. Portfolio$/ }).click();
    const heading = page.getByLabel(/^Heading/);
    await heading.fill('My Best Work');
    // Scoped to the editor canvas so a sidebar/form echo of the heading cannot satisfy it.
    await expect(page.getByTestId('canvas-background').getByText('My Best Work')).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: /^save$/i }).click();
    await expect(page.getByText(/^saved$/i)).toBeVisible({ timeout: 30_000 });
  });

  test('publishing surfaces the public URL', async ({ page }) => {
    await page.goto('/portfolio-builder');
    await page.getByRole('link', { name: new RegExp(pageTitle) }).click();
    await page.waitForURL(/\/portfolio-builder\/edit\//);

    await page.getByRole('button', { name: /settings/i }).click();
    const publish = page.getByLabel(/publish/i);
    await expect(publish).toBeEnabled();
    // The library checkbox overlays the native input with a styled box that receives the click,
    // exactly as it does for a real user; force dispatches the click at those coordinates. The box
    // is controlled (state flips only after the Supabase call), so click rather than check(),
    // which asserts the new state synchronously; the link assertion below proves publishing.
    await publish.click({ force: true });

    const link = page.getByRole('link', { name: /^\/p\// });
    await expect(link).toBeVisible({ timeout: 30_000 });
    publicPath = (await link.getAttribute('href')) ?? '';
    expect(publicPath).toMatch(/^\/p\/.+/);
  });

  test('the published page is readable without a session', async ({ browser }) => {
    expect(publicPath, 'publish step must run first').not.toBe('');
    // A fresh context with NO storageState: this exercises the
    // "Anyone can view published portfolio pages" RLS policy as an anonymous visitor.
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const anon = await context.newPage();
    await anon.goto(publicPath, { timeout: 90_000 });
    await expect(anon.getByText('My Best Work')).toBeVisible({ timeout: 30_000 });
    await context.close();
  });

  test('a navbar link scrolls to its section', async ({ browser }) => {
    // Never verified in a real browser across three sub-projects.
    expect(publicPath).not.toBe('');
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const anon = await context.newPage();
    await anon.goto(publicPath);

    // exact: the hero CTA "View portfolio" also contains the word and points at the same anchor.
    const navLink = anon.getByRole('link', { name: 'Portfolio', exact: true });
    await expect(navLink).toBeVisible();

    // At the default viewport the section is already partly on screen, so "in viewport" alone
    // would pass even if the link did nothing. Assert real scrolling instead: the page moves and
    // the section's top edge ends up at the top of the viewport (allowing for a sticky navbar).
    const target = anon.locator('#portfolio');
    const topBefore = await target.evaluate((el) => el.getBoundingClientRect().top);
    expect(await anon.evaluate(() => window.scrollY)).toBe(0);
    expect(topBefore).toBeGreaterThan(200);

    await navLink.click();

    await expect(anon).toHaveURL(/#portfolio$/);
    await expect
      .poll(() => anon.evaluate(() => window.scrollY), { timeout: 10_000 })
      .toBeGreaterThan(0);
    await expect
      .poll(() => target.evaluate((el) => el.getBoundingClientRect().top), { timeout: 10_000 })
      .toBeLessThan(150);
    await expect(target).toBeInViewport();
    await context.close();
  });

  test.afterAll(async () => {
    const url = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    const key = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
    const email = process.env['E2E_EMAIL'];
    const password = process.env['E2E_PASSWORD'];
    if (!url || !key || !email || !password) {
      throw new Error('e2e cleanup skipped: missing env; a test row may have leaked');
    }
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);
    const signIn = await supabase.auth.signInWithPassword({ email, password });
    if (signIn.error) {
      throw new Error(`e2e cleanup sign-in failed: ${signIn.error.message}`);
    }
    const del = await supabase.from('portfolio_pages').delete().eq('title', pageTitle).select('id');
    if (del.error) {
      throw new Error(`e2e cleanup delete failed: ${del.error.message}`);
    }
    console.log(`e2e cleanup: deleted ${del.data.length} row(s) titled "${pageTitle}"`);
  });
});
