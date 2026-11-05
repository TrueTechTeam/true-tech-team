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

  // The host app's branding must not reach someone's portfolio. `null` is Next.js's "remove this
  // inherited field"; `undefined` or an absent key would let the root layout's values through,
  // so these assert null exactly rather than merely falsy.
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
