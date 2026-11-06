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
      { id: 'about', type: 'header', name: 'About', showInNav: true, props: { heading: 'Second' } },
    ]);
    const { container } = render(<PageRenderer page={page} />);

    const children = [...container.firstElementChild!.children];
    expect(children).toHaveLength(2);
    expect(children[0]?.matches('header[data-component="navbar"]')).toBe(true);
    expect(children[1]?.tagName).toBe('SECTION');
    expect(children[1]?.textContent).toContain('Second');
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

  // The divider is drawn on every section but the first. The signal is explicit (not :first-child)
  // so the editor, which wraps each section, can use it too.
  it('does not mark a hero under a navbar as first, so it keeps its divider', () => {
    const page = makePage([
      { id: 'nav', type: 'navbar', name: 'Home', showInNav: false, props: { brand: 'JT' } },
      { id: 'a', type: 'header', name: 'About', showInNav: true, props: { heading: 'A' } },
      { id: 'b', type: 'richText', name: 'Body', showInNav: true, props: { heading: 'B' } },
    ]);
    const { container } = render(<PageRenderer page={page} />);
    const sections = [...container.querySelectorAll('section')];
    expect(sections).toHaveLength(2);
    expect(sections.map((s) => s.getAttribute('data-first'))).toEqual([null, null]);
  });

  it('marks a content section as first when it is the first entry', () => {
    const page = makePage([
      { id: 'a', type: 'header', name: 'About', showInNav: true, props: { heading: 'A' } },
      { id: 'b', type: 'richText', name: 'Body', showInNav: true, props: { heading: 'B' } },
    ]);
    const { container } = render(<PageRenderer page={page} />);
    const sections = [...container.querySelectorAll('section')];
    expect(sections.map((s) => s.getAttribute('data-first'))).toEqual(['true', null]);
  });
});
