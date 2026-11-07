import { test, expect, type Browser, type Page } from '@playwright/test';

// One serial flow: each step depends on the last. The value is proving the whole path works once,
// which no amount of unit testing has established for this feature.
test.describe.configure({ mode: 'serial' });

const unique = Date.now();
const pageTitle = `E2E Graphic Design ${unique}`;
let publicPath = '';

/** The host app's own marketing copy, from the root layout. It must never reach a portfolio. */
const APP_DESCRIPTION = 'Showcasing innovative tech projects and solutions from the True Tech Team';
/** The host app's own favicon. */
const APP_FAVICON = '/logo.svg';
/** What the published page emits so the first paint already carries its own mode. */
const LIGHT_MODE_SCRIPT = "document.documentElement.dataset.theme='light'";
const DARK_MODE_SCRIPT = "document.documentElement.dataset.theme='dark'";

/**
 * Opens the fixture page's settings, switches the theme preset through the real dropdown, and
 * saves. `current` is the trigger's present label; the trigger is labelled with the active preset.
 */
async function savePreset(
  page: Page,
  current: RegExp,
  next: string,
  expected: RegExp
): Promise<void> {
  // Explicit timeouts, like every other navigation in this file - a cold dev server compiles the
  // route on first hit and this goto was seen failing with net::ERR_ABORTED without one. Note the
  // per-test cap still bounds the whole call; see the timeout on the test that calls this twice.
  await page.goto('/portfolio-builder', { timeout: 90_000 });
  await page.getByRole('link', { name: new RegExp(pageTitle) }).click();
  await page.waitForURL(/\/portfolio-builder\/edit\//, { timeout: 90_000 });

  await page.getByRole('button', { name: /settings/i }).click();
  await page.getByRole('button', { name: current }).click();
  await page.getByText(next, { exact: true }).click();
  await expect(page.getByRole('button', { name: expected })).toBeVisible();
  await page.getByRole('button', { name: /^done$/i }).click();

  await page.getByRole('button', { name: /^save$/i }).click();
  await expect(page.getByText(/^saved$/i)).toBeVisible({ timeout: 30_000 });
}

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

  test('the editor fits the viewport: panes scroll, the page does not', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/portfolio-builder');
    await page.getByRole('link', { name: new RegExp(pageTitle) }).click();
    await page.waitForURL(/\/portfolio-builder\/edit\//);
    await expect(page.getByTestId('canvas-background')).toBeVisible({ timeout: 30_000 });

    const m = await page.evaluate(() => {
      const panes = [
        document.querySelector('[data-testid="editor-sidebar"]'),
        document.querySelector('[data-testid="canvas-background"]'),
        document.querySelector('[data-testid="editor-form-panel"]'),
      ];
      return {
        docHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        panesOverflow: panes.map((p) => (p ? p.scrollHeight > p.clientHeight : null)),
      };
    });
    // Only the panes scroll: the page must fit the viewport...
    expect(m.docHeight).toBeLessThanOrEqual(m.innerHeight + 2);
    // ...and the scrolling moved INTO a pane rather than vanishing.
    expect(m.panesOverflow).not.toContain(null);
    expect(m.panesOverflow).toContain(true);
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

    // The new section types, as a real visitor receives them. Each assertion is scoped to this
    // anonymous page and names text only the template's seed data supplies.
    // gallery: both seeded entries render as role="img" tiles carrying their alt text.
    const gallery = anon.locator('#portfolio');
    await expect(gallery.getByRole('img')).toHaveCount(2);
    await expect(
      anon.getByRole('img', {
        name: 'Replace this with a description of your strongest piece',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      anon.getByRole('img', {
        name: 'Replace this with a description of a second piece',
        exact: true,
      })
    ).toBeVisible();
    // cards: a seeded card title is visible (the cards section is static style, so it is the header).
    await expect(anon.getByText('Replace with a service you offer', { exact: true })).toBeVisible();
    // contact: its heading rendered (a heading role, so the "Work with me" hero CTA cannot satisfy it).
    await expect(anon.getByRole('heading', { name: 'Work with me', exact: true })).toBeVisible();
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

  test('the published page carries none of the host app branding', async ({ browser }) => {
    expect(publicPath, 'publish step must run first').not.toBe('');
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const anon = await context.newPage();
    await anon.goto(publicPath, { timeout: 90_000 });
    // The app shell pins itself to dark in a mount effect, so wait for the page to hydrate
    // before reading `data-theme` - otherwise this asserts the pre-hydration HTML.
    await expect(anon.getByText('My Best Work')).toBeVisible({ timeout: 30_000 });

    const branding = await anon.evaluate(() => ({
      descriptions: [...document.querySelectorAll('meta[name="description"]')].map(
        (m) => m.getAttribute('content') ?? ''
      ),
      icons: [...document.querySelectorAll('link[rel~="icon"]')].map(
        (l) => l.getAttribute('href') ?? ''
      ),
    }));

    // Soft, so one run reports all three leaks rather than stopping at the first.
    // 1. The app's marketing copy is not this portfolio's description.
    expect
      .soft(branding.descriptions, 'app description must not reach a portfolio')
      .not.toContain(APP_DESCRIPTION);
    // 2. The True Tech Team favicon does not brand this portfolio.
    expect
      .soft(branding.icons, 'app favicon must not brand a portfolio')
      .not.toContain(APP_FAVICON);
    // 3. The page is not forced dark. The Graphic Design template seeds the 'coral-reef' preset,
    //    which is a LIGHT theme; the app shell's `dark` must not win over it. Polled because the
    //    shell and the portfolio both write `data-theme` during hydration.
    await expect.soft
      .poll(() => anon.evaluate(() => document.documentElement.getAttribute('data-theme')), {
        message: 'a light-themed portfolio must not render dark',
        timeout: 10_000,
      })
      .toBe('light');
    // 4. ...and it is not forced dark for the FIRST PAINT either. `data-theme` above is the
    //    hydrated DOM; this asserts the markup the server actually sent, where the page's own
    //    mode must already be set ahead of its content. Without this the page paints dark for a
    //    frame, which is still being forced dark.
    const html = await (await anon.request.get(publicPath)).text();
    expect
      .soft(html, 'server HTML must set the light mode before painting')
      .toContain(LIGHT_MODE_SCRIPT);
    expect
      .soft(html, 'server HTML must not set the dark mode on a light page')
      .not.toContain(DARK_MODE_SCRIPT);
    expect
      .soft(
        html.indexOf(LIGHT_MODE_SCRIPT),
        'the mode must be set before the portfolio content is parsed'
      )
      .toBeLessThan(html.indexOf('My Best Work'));

    await context.close();
  });

  // Four of the twenty presets are dark, and a fix aimed at making light pages light is exactly
  // the kind that inverts them. This switches the live page to a dark preset through the real
  // theme dropdown and asserts the published result goes dark, first paint included.
  //
  // This test persists Midnight, and the branding test above needs the seeded light Coral Reef. So
  // it restores Coral Reef in a `finally`: a retry (CI runs retries: 2) or a --grep of either test
  // must not depend on what the other left in the database.
  test('a dark preset still publishes dark', async ({ page, browser }) => {
    // Twice the work of any other test here: two full settings round-trips (switch, then restore)
    // either side of an anonymous page load. That does not fit Playwright's 30s default, and it
    // failed on exactly that cap - not on any single step, each of which has its own timeout.
    test.setTimeout(150_000);
    expect(publicPath, 'publish step must run first').not.toBe('');

    await savePreset(page, /coral reef/i, 'Midnight', /midnight/i);
    try {
      await assertPublishedDark(browser);
    } finally {
      await savePreset(page, /midnight/i, 'Coral Reef', /coral reef/i);
    }
  });

  async function assertPublishedDark(browser: Browser): Promise<void> {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const anon = await context.newPage();
    await anon.goto(publicPath, { timeout: 90_000 });
    await expect(anon.getByText('My Best Work')).toBeVisible({ timeout: 30_000 });

    // The server HTML sets dark before painting...
    const html = await (await anon.request.get(publicPath)).text();
    expect
      .soft(html, 'server HTML must set the dark mode for a dark preset')
      .toContain(DARK_MODE_SCRIPT);
    expect
      .soft(html, 'server HTML must not set the light mode on a dark page')
      .not.toContain(LIGHT_MODE_SCRIPT);
    // ...and hydration leaves it dark rather than reverting to the light default.
    await expect.soft
      .poll(() => anon.evaluate(() => document.documentElement.getAttribute('data-theme')), {
        message: 'a dark-themed portfolio must stay dark',
        timeout: 10_000,
      })
      .toBe('dark');

    await context.close();
  }

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
