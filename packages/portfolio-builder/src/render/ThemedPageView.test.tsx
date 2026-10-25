import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemedPageView } from './ThemedPageView';
import type { PortfolioPage } from '../schema/types';

function makePage(): PortfolioPage {
  return {
    schemaVersion: 2,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    sections: [
      {
        id: 'sec-nav',
        type: 'navbar',
        name: 'Home',
        showInNav: false,
        props: { brand: 'Hello there' },
      },
      { id: 'about', type: 'header', name: 'About', showInNav: true, props: {} },
    ],
  };
}

describe('ThemedPageView', () => {
  it('renders the page content via PageRenderer', () => {
    render(<ThemedPageView page={makePage()} />);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
  });

  it('renders a nav link for each nav-visible section when the page has a navbar section', () => {
    render(<ThemedPageView page={makePage()} />);
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });

  // The navbar section's presence is the nav toggle now - there is no `showNav` flag.
  it('omits the nav entirely when the page has no navbar section', () => {
    const { container } = render(<ThemedPageView page={{ ...makePage(), sections: [] }} />);
    expect(container.querySelector('[data-component="navbar"]')).toBeNull();
    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument();
  });
});
