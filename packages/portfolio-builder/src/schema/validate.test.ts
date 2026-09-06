import { describe, it, expect } from 'vitest';
import { validatePortfolioPage } from './validate';
import type { PortfolioPage } from './types';

function makeValidPage(): PortfolioPage {
  return {
    schemaVersion: 1,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    showNav: true,
    sections: [
      {
        id: 'about',
        name: 'About',
        showInNav: true,
        background: 'primary',
        rows: [
          {
            id: 'row-1',
            items: [
              { id: 'item-1', component: 'heading', span: 8, props: { text: 'Hi' } },
              { id: 'item-2', component: 'avatar', span: 4, props: { initials: 'JT' } },
            ],
          },
        ],
      },
    ],
  };
}

describe('validatePortfolioPage', () => {
  it('accepts a well-formed page', () => {
    const result = validatePortfolioPage(makeValidPage());
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it('rejects a row whose item spans sum to more than 12', () => {
    const page = makeValidPage();
    page.sections[0].rows[0].items[0].span = 10;
    page.sections[0].rows[0].items[1].span = 10;
    const result = validatePortfolioPage(page);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('exceeds 12'))).toBe(true);
  });

  it('rejects an unknown component type', () => {
    const page = makeValidPage();
    // @ts-expect-error -- deliberately invalid for the test
    page.sections[0].rows[0].items[0].component = 'not-a-real-component';
    const result = validatePortfolioPage(page);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('unknown component'))).toBe(true);
  });

  it('rejects a page missing a slug', () => {
    const page = makeValidPage();
    // @ts-expect-error -- deliberately invalid for the test
    page.slug = '';
    const result = validatePortfolioPage(page);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('slug'))).toBe(true);
  });

  it('rejects a non-object input', () => {
    const result = validatePortfolioPage(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
