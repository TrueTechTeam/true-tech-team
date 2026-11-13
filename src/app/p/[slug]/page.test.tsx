import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as supabaseServer from '../../../lib/supabase/server';
import * as portfolioBuilder from '@true-tech-team/portfolio-builder';
import type { PortfolioPageRecord } from '@true-tech-team/portfolio-builder';
import PortfolioPublicPage, { generateMetadata } from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

function makeRecord(overrides: Partial<PortfolioPageRecord> = {}): PortfolioPageRecord {
  return {
    id: 'page-1',
    userId: 'user-1',
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    published: true,
    sections: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('PortfolioPublicPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(supabaseServer, 'createClient').mockResolvedValue({} as never);
    vi.spyOn(portfolioBuilder, 'ThemedPageView').mockImplementation(({ page }) => (
      <div data-testid="themed-page-view">{page.title}</div>
    ));
  });

  it('renders ThemedPageView with the mapped page when the slug resolves to a published record', async () => {
    vi.spyOn(portfolioBuilder, 'loadPortfolioPageBySlug').mockResolvedValue(makeRecord());

    const element = await PortfolioPublicPage({ params: Promise.resolve({ slug: 'jtrue' }) });
    render(element);

    expect(screen.getByTestId('themed-page-view')).toHaveTextContent('Justin True');
  });

  it('calls notFound when the slug matches no record', async () => {
    vi.spyOn(portfolioBuilder, 'loadPortfolioPageBySlug').mockResolvedValue(null);

    await expect(
      PortfolioPublicPage({ params: Promise.resolve({ slug: 'missing' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('calls notFound for an unpublished slug the same way as a nonexistent one', async () => {
    vi.spyOn(portfolioBuilder, 'loadPortfolioPageBySlug').mockResolvedValue(null);

    await expect(
      PortfolioPublicPage({ params: Promise.resolve({ slug: 'unpublished-slug' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  // The root layout renders <html data-theme="dark"> for every route, so a light portfolio would
  // paint with the dark token block until hydration. The page emits a script that sets the mode
  // during parse, ahead of its own markup, so the FIRST paint is already correct. These assert the
  // markup the server sends; the e2e test asserts it in the delivered HTML.
  describe('the pre-hydration theme mode script', () => {
    async function scriptFor(record: PortfolioPageRecord) {
      vi.spyOn(portfolioBuilder, 'loadPortfolioPageBySlug').mockResolvedValue(record);
      const { container } = render(
        await PortfolioPublicPage({ params: Promise.resolve({ slug: record.slug }) })
      );
      return container.querySelector('script')?.innerHTML ?? null;
    }

    it('sets light for a page on a light preset', async () => {
      expect(await scriptFor(makeRecord({ themeId: 'coral-reef' }))).toBe(
        "document.documentElement.dataset.theme='light'"
      );
    });

    it('sets dark for a page on a dark preset', async () => {
      expect(await scriptFor(makeRecord({ themeId: 'midnight' }))).toBe(
        "document.documentElement.dataset.theme='dark'"
      );
    });

    // The stored mode is the axis the template picker now writes, so a page can hold a mode that
    // contradicts its style's default. The script must follow the stored mode, not the default -
    // otherwise a dark page created on a light-default style flashes light before hydration.
    it("sets dark for a light-default style with a stored 'dark'", async () => {
      expect(await scriptFor(makeRecord({ themeId: 'coral-reef', themeMode: 'dark' }))).toBe(
        "document.documentElement.dataset.theme='dark'"
      );
    });

    it("sets light for a dark-default style with a stored 'light'", async () => {
      expect(await scriptFor(makeRecord({ themeId: 'midnight', themeMode: 'light' }))).toBe(
        "document.documentElement.dataset.theme='light'"
      );
    });

    it('sets light when the page names no theme', async () => {
      expect(await scriptFor(makeRecord())).toBe("document.documentElement.dataset.theme='light'");
    });

    // Stored page data must not be able to reach the script body.
    it('emits a fixed literal for an unrecognised theme id', async () => {
      expect(await scriptFor(makeRecord({ themeId: "x';alert(1);//" }))).toBe(
        "document.documentElement.dataset.theme='light'"
      );
    });

    it('runs before the portfolio markup, so the first paint is already themed', async () => {
      vi.spyOn(portfolioBuilder, 'loadPortfolioPageBySlug').mockResolvedValue(
        makeRecord({ themeId: 'coral-reef' })
      );
      const { container } = render(
        await PortfolioPublicPage({ params: Promise.resolve({ slug: 'jtrue' }) })
      );

      const script = container.querySelector('script');
      const view = container.querySelector('[data-testid="themed-page-view"]');
      expect(script).not.toBeNull();
      expect(view).not.toBeNull();
      // DOCUMENT_POSITION_FOLLOWING: the view comes after the script.
      expect(script!.compareDocumentPosition(view!) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });
  });
});

describe('generateMetadata', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(supabaseServer, 'createClient').mockResolvedValue({} as never);
  });

  it("returns the record's title when the slug resolves", async () => {
    vi.spyOn(portfolioBuilder, 'loadPortfolioPageBySlug').mockResolvedValue(makeRecord());

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'jtrue' }) });

    expect(metadata.title).toBe('Justin True');
  });

  it('falls back to a generic title when the slug does not resolve', async () => {
    vi.spyOn(portfolioBuilder, 'loadPortfolioPageBySlug').mockResolvedValue(null);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'missing' }) });

    expect(metadata.title).toBe('Portfolio');
  });

  // The host app's branding must not reach someone's portfolio. What makes that work is the key
  // being PRESENT - Next's `mergeMetadata` uses `for...in`, which visits an `undefined`-valued key
  // too, and resolves both `undefined` and `null` to "emit nothing"; only an absent key inherits.
  // So these assert `null` exactly to pin the chosen spelling (which says the suppression out
  // loud) rather than because `undefined` would behave differently. The e2e branding test is what
  // pins the actual behaviour: no description and no icon tag reach a visitor.
  it("carries no description, rather than inheriting the app's", async () => {
    vi.spyOn(portfolioBuilder, 'loadPortfolioPageBySlug').mockResolvedValue(makeRecord());

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'jtrue' }) });

    expect(metadata.description).toBeNull();
  });

  it("carries no icon, rather than inheriting the app's favicon", async () => {
    vi.spyOn(portfolioBuilder, 'loadPortfolioPageBySlug').mockResolvedValue(makeRecord());

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'jtrue' }) });

    expect(metadata.icons).toBeNull();
  });

  it('suppresses the app description and icon even for a slug that does not resolve', async () => {
    vi.spyOn(portfolioBuilder, 'loadPortfolioPageBySlug').mockResolvedValue(null);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'missing' }) });

    expect(metadata.description).toBeNull();
    expect(metadata.icons).toBeNull();
  });
});
