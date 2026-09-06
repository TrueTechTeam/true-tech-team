import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageRenderer } from './PageRenderer';
import type { PortfolioPage } from '../schema/types';

function makePage(): PortfolioPage {
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
        rows: [
          {
            id: 'row-1',
            items: [{ id: 'item-1', component: 'heading', span: 12, props: { text: 'About me' } }],
          },
        ],
      },
      {
        id: 'projects',
        name: 'Projects',
        showInNav: true,
        rows: [
          {
            id: 'row-2',
            items: [
              { id: 'item-2', component: 'heading', span: 12, props: { text: 'My projects' } },
            ],
          },
        ],
      },
    ],
  };
}

describe('PageRenderer', () => {
  it('renders a nav link for every section when showNav is true', () => {
    render(<PageRenderer page={makePage()} />);
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
  });

  it('omits the nav entirely when showNav is false', () => {
    render(<PageRenderer page={{ ...makePage(), showNav: false }} />);
    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
  });

  it('renders every section', () => {
    render(<PageRenderer page={makePage()} />);
    expect(screen.getByText('About me')).toBeInTheDocument();
    expect(screen.getByText('My projects')).toBeInTheDocument();
  });
});
