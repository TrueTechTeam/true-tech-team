import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemedPageView } from './ThemedPageView';
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
            items: [
              { id: 'item-1', component: 'heading', span: 12, props: { text: 'Hello there' } },
            ],
          },
        ],
      },
    ],
  };
}

describe('ThemedPageView', () => {
  it('renders the page content via PageRenderer', () => {
    render(<ThemedPageView page={makePage()} />);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  it('renders the nav when the page has showNav set', () => {
    render(<ThemedPageView page={makePage()} />);
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  it('omits the nav when showNav is false', () => {
    render(<ThemedPageView page={{ ...makePage(), showNav: false }} />);
    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
  });
});
