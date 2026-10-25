import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageRenderer } from './PageRenderer';
import type { PageSection, PortfolioPage } from '../schema/types';

function makePage(sections: PageSection[]): PortfolioPage {
  return { schemaVersion: 2, slug: 's', title: 'Justin True', templateId: 'default', sections };
}

describe('PageRenderer', () => {
  // Uses the REAL registry, so this is the live check that the navbar type renders as chrome.
  it('renders the navbar section bare, as a direct child of the page container', () => {
    const page = makePage([
      { id: 'nav', type: 'navbar', name: 'Home', showInNav: false, props: { brand: 'JT' } },
    ]);
    const { container } = render(<PageRenderer page={page} />);

    expect(screen.getByText('JT')).toBeInTheDocument();
    // No section shell: it would clamp the navbar's `position: sticky` to its own height and
    // nest <header role="banner"> inside <section role="region">.
    expect(container.querySelectorAll('section')).toHaveLength(0);

    const header = container.querySelector('header[data-component="navbar"]');
    expect(header).not.toBeNull();
    expect(header?.parentElement).toBe(container.firstElementChild);
  });

  it('keeps a chrome section in its declared position among the sections', () => {
    const page = makePage([
      { id: 'nav', type: 'navbar', name: 'Home', showInNav: false, props: { brand: 'JT' } },
      { id: 'about', type: 'navbar', name: 'About', showInNav: true, props: { brand: 'Second' } },
    ]);
    const { container } = render(<PageRenderer page={page} />);

    const brands = [...container.querySelectorAll('[data-component="navbar-brand"]')].map(
      (node) => node.textContent
    );
    expect(brands).toEqual(['JT', 'Second']);
  });

  // Review Focus 3
  it('renders an empty page without crashing when there are no sections', () => {
    const { container } = render(<PageRenderer page={makePage([])} />);
    expect(container.querySelectorAll('section')).toHaveLength(0);
    expect(container.querySelector('header')).toBeNull();
  });

  // Review Focus 5
  it('renders a pre-pivot page blank rather than throwing', () => {
    const legacy = {
      schemaVersion: 1,
      slug: 's',
      title: 'Old',
      templateId: 'blank',
      showNav: true,
      sections: [{ id: 'sec1', name: 'Intro', showInNav: false, rows: [] }],
    } as unknown as PortfolioPage;
    const { container } = render(<PageRenderer page={legacy} />);
    expect(container.querySelectorAll('section')).toHaveLength(0);
    expect(container.querySelector('header')).toBeNull();
  });
});
