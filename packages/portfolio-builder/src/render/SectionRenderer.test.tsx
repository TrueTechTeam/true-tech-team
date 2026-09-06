import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { SectionRenderer } from './SectionRenderer';
import type { PageSection } from '../schema/types';

function makeSection(overrides: Partial<PageSection> = {}): PageSection {
  return {
    id: 'about',
    name: 'About',
    showInNav: true,
    rows: [
      {
        id: 'row-1',
        items: [{ id: 'item-1', component: 'heading', span: 12, props: { text: 'About me' } }],
      },
    ],
    ...overrides,
  };
}

describe('SectionRenderer', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a section element with the section id as its anchor', () => {
    render(<SectionRenderer section={makeSection()} />);
    const section = screen.getByRole('region', { name: 'About' });
    expect(section).toHaveAttribute('id', 'about');
  });

  it('renders every row in the section', () => {
    render(<SectionRenderer section={makeSection()} />);
    expect(screen.getByText('About me')).toBeInTheDocument();
  });
});
