import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavbarSection } from './NavbarSection';
import type { PageSection, PortfolioPage } from '../../schema/types';

function makeNav(props: Record<string, unknown> = {}): PageSection {
  return { id: 'nav', type: 'navbar', name: 'Home', showInNav: false, props };
}

function makePage(sections: PageSection[]): PortfolioPage {
  return {
    schemaVersion: 2,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'default',
    sections,
  };
}

function renderNav(section: PageSection, page: PortfolioPage) {
  const anchors = new Map(page.sections.map((s) => [s.id, s.name.toLowerCase()]));
  return render(<NavbarSection section={section} page={page} anchors={anchors} />);
}

describe('NavbarSection', () => {
  it('renders a link per nav-visible sibling, excluding itself', () => {
    const nav = makeNav({ brand: 'JT' });
    const page = makePage([
      nav,
      { id: 'a', type: 'navbar', name: 'About', showInNav: true, props: {} },
      { id: 'b', type: 'navbar', name: 'Hidden', showInNav: false, props: {} },
    ]);
    renderNav(nav, page);

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '#about');
    expect(screen.queryByRole('link', { name: 'Hidden' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
  });

  // Review Focus 1
  it('falls back to the page title when brand is missing or blank', () => {
    const nav = makeNav({});
    renderNav(nav, makePage([nav]));
    expect(screen.getByText('Justin True')).toBeInTheDocument();
  });

  // Review Focus 3
  it('renders without links when it is the only section', () => {
    const nav = makeNav({ brand: 'JT' });
    renderNav(nav, makePage([nav]));
    expect(screen.getByText('JT')).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('smooth-scrolls to a section and updates the hash on click', () => {
    const nav = makeNav({ brand: 'JT' });
    const page = makePage([
      nav,
      { id: 'a', type: 'navbar', name: 'About', showInNav: true, props: {} },
    ]);
    const target = document.createElement('div');
    target.id = 'about';
    const scrollIntoView = vi.fn();
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);
    const pushState = vi.spyOn(window.history, 'pushState');

    renderNav(nav, page);
    screen.getByRole('link', { name: 'About' }).click();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    expect(pushState).toHaveBeenCalledWith(null, '', '#about');
    document.body.removeChild(target);
  });

  it('drives stickiness through the library Navbar position prop', () => {
    const sticky = makeNav({ brand: 'JT', sticky: true });
    const { container: stickyContainer } = renderNav(sticky, makePage([sticky]));
    expect(stickyContainer.querySelector('[data-component="navbar"]')).toHaveAttribute(
      'data-position',
      'sticky'
    );

    const stat = makeNav({ brand: 'JT', sticky: false });
    const { container: staticContainer } = renderNav(stat, makePage([stat]));
    expect(staticContainer.querySelector('[data-component="navbar"]')).toHaveAttribute(
      'data-position',
      'static'
    );
  });
});
