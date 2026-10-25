import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionRenderer } from './SectionRenderer';
import { SECTION_REGISTRY } from '../sections/registry';
import type { PageSection, PortfolioPage } from '../schema/types';

function makePage(sections: PageSection[]): PortfolioPage {
  return { schemaVersion: 2, slug: 's', title: 'T', templateId: 'default', sections };
}

describe('SectionRenderer', () => {
  it('renders the registry component for a known type, with the anchor id and min-height', () => {
    const section: PageSection = {
      id: 'nav',
      type: 'navbar',
      name: 'Home Page',
      showInNav: false,
      props: { brand: 'JT' },
    };
    const anchors = new Map([['nav', 'home-page']]);
    const { container } = render(
      <SectionRenderer section={section} page={makePage([section])} anchors={anchors} />
    );

    const element = container.querySelector('section');
    expect(element).toHaveAttribute('id', 'home-page');
    expect(element).toHaveAttribute('aria-label', 'Home Page');
    expect(element?.style.getPropertyValue('--section-min-height')).toBe(
      SECTION_REGISTRY.navbar.minHeight
    );
    expect(screen.getByText('JT')).toBeInTheDocument();
  });

  // Review Focus 5: a pre-pivot row's sections have no `type`.
  it('renders nothing for an unknown or missing section type', () => {
    const section = {
      id: 'x',
      type: 'legacyRowSection',
      name: 'Old',
      showInNav: false,
      props: {},
    } as unknown as PageSection;
    const { container } = render(
      <SectionRenderer section={section} page={makePage([section])} anchors={new Map()} />
    );
    expect(container.querySelector('section')).toBeNull();
  });

  it('falls back to the section id when no anchor was computed', () => {
    const section: PageSection = {
      id: 'nav',
      type: 'navbar',
      name: 'Home',
      showInNav: false,
      props: {},
    };
    const { container } = render(
      <SectionRenderer section={section} page={makePage([section])} anchors={new Map()} />
    );
    expect(container.querySelector('section')).toHaveAttribute('id', 'nav');
  });
});
