import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionRenderer } from './SectionRenderer';
import type { PageSection, PortfolioPage } from '../schema/types';
import type { SectionComponentProps } from '../sections/types';

// `navbar` is currently the only registered type and it is page chrome, so the non-chrome shell
// branch has no real type to exercise yet (Task 5's `header` will be one). Stand in synthetic
// entries so BOTH branches of the shell decision are covered. The real registry's wiring is
// asserted against live types in `sections/registry.test.ts` and `PageRenderer.test.tsx`.
vi.mock('../sections/registry', () => {
  function Stub({ section }: SectionComponentProps) {
    return <p>stub:{String(section.props.marker ?? '')}</p>;
  }
  const contentEntry = {
    component: Stub,
    label: 'Content Section',
    propertySchema: [],
    defaultProps: {},
    minHeight: '320px',
  };
  const chromeEntry = {
    component: Stub,
    label: 'Chrome Section',
    propertySchema: [],
    defaultProps: {},
    minHeight: '0',
    chrome: true,
  };
  // Same shape as `content` but with a list field, so a section can be populated.
  const listedEntry = {
    ...contentEntry,
    propertySchema: [{ key: 'items', label: 'Items', type: 'list', itemSchema: [] }],
    minHeight: '60vh',
  } as unknown as typeof contentEntry;
  const entries: Record<string, typeof contentEntry> = {
    content: contentEntry,
    listed: listedEntry,
    header: listedEntry,
    chrome: chromeEntry,
  };
  return {
    SECTION_REGISTRY: entries,
    getSectionTypeEntry: (type: string) => entries[type],
  };
});

function makeSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 'sec',
    type: 'content',
    name: 'Home Page',
    showInNav: false,
    props: { marker: 'body' },
    ...overrides,
  } as unknown as PageSection;
}

function makePage(sections: PageSection[]): PortfolioPage {
  return { schemaVersion: 2, slug: 's', title: 'T', templateId: 'default', sections };
}

function renderSection(section: PageSection, anchors: Map<string, string>) {
  return render(<SectionRenderer section={section} page={makePage([section])} anchors={anchors} />);
}

describe('SectionRenderer', () => {
  it('wraps a content section in the shell, with the anchor id and min-height', () => {
    const section = makeSection();
    const { container } = renderSection(section, new Map([['sec', 'home-page']]));

    const element = container.querySelector('section');
    expect(element).toHaveAttribute('id', 'home-page');
    expect(element).toHaveAttribute('aria-label', 'Home Page');
    expect(element?.style.getPropertyValue('--section-min-height')).toBe('320px');
    expect(screen.getByText(/stub:body/)).toBeInTheDocument();
  });

  // The sticky-navbar / nested-landmark fix: chrome renders bare.
  it('renders a chrome section with no wrapping shell', () => {
    const section = makeSection({ type: 'chrome' as PageSection['type'], id: 'nav' });
    const { container } = renderSection(section, new Map([['nav', 'home-page']]));

    expect(container.querySelector('section')).toBeNull();
    expect(screen.getByText(/stub:body/)).toBeInTheDocument();
    // Bare means bare: the component is the top-level node, not wrapped in a div either.
    expect(container.firstElementChild?.tagName).toBe('P');
  });

  // Review Focus 5: a pre-pivot row's sections have no `type`.
  it('renders nothing for an unknown or missing section type', () => {
    const section = makeSection({ type: 'legacyRowSection' as PageSection['type'] });
    const { container } = renderSection(section, new Map());
    expect(container.querySelector('section')).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it('falls back to the section id when no anchor was computed', () => {
    const { container } = renderSection(makeSection({ id: 'sec' }), new Map());
    expect(container.querySelector('section')).toHaveAttribute('id', 'sec');
  });

  it('wraps the content in the inner container that carries the max-width and gutter', () => {
    const { container } = renderSection(makeSection(), new Map());
    const inner = container.querySelector('section > div');
    expect(inner).not.toBeNull();
    expect(inner).toContainElement(screen.getByText(/stub:body/));
  });

  describe('min-height is a floor for an empty section', () => {
    const minHeight = (container: HTMLElement) =>
      container.querySelector('section')?.style.getPropertyValue('--section-min-height');

    it('applies it while the section has no content', () => {
      const { container } = renderSection(
        makeSection({ type: 'listed' as PageSection['type'], props: { items: [] } }),
        new Map()
      );
      expect(minHeight(container)).toBe('60vh');
    });

    it('drops it once the section is populated', () => {
      const { container } = renderSection(
        makeSection({ type: 'listed' as PageSection['type'], props: { items: [{ a: 1 }] } }),
        new Map()
      );
      expect(minHeight(container)).toBe('');
    });

    it('keeps it on a populated header, which is meant to fill the viewport', () => {
      const { container } = renderSection(
        makeSection({ type: 'header' as PageSection['type'], props: { items: [{ a: 1 }] } }),
        new Map()
      );
      expect(minHeight(container)).toBe('60vh');
    });
  });
});
