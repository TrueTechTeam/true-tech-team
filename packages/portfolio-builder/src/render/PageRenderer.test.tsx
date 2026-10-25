import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageRenderer } from './PageRenderer';
import type { PageSection, PortfolioPage } from '../schema/types';

function makePage(sections: PageSection[]): PortfolioPage {
  return { schemaVersion: 2, slug: 's', title: 'Justin True', templateId: 'default', sections };
}

describe('PageRenderer', () => {
  it('renders every section with name-derived anchors', () => {
    const page = makePage([
      { id: 'nav', type: 'navbar', name: 'Home', showInNav: false, props: { brand: 'JT' } },
    ]);
    const { container } = render(<PageRenderer page={page} />);
    expect(container.querySelector('section')).toHaveAttribute('id', 'home');
    expect(screen.getByText('JT')).toBeInTheDocument();
  });

  // Review Focus 3
  it('renders an empty page without crashing when there are no sections', () => {
    const { container } = render(<PageRenderer page={makePage([])} />);
    expect(container.querySelectorAll('section')).toHaveLength(0);
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
  });
});
