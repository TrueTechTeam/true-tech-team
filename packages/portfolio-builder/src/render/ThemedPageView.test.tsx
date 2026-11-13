import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  // The host app's shell pins the document to dark for every route; a portfolio renders in its
  // own preset's mode instead. See PageThemeMode for why the provider alone cannot do this.
  describe("the document's theme mode", () => {
    afterEach(() => {
      document.documentElement.removeAttribute('data-theme');
    });

    // Each case starts from the OPPOSITE mode, so neither can pass by the document already
    // happening to carry the expected value.
    it('becomes light for a page on a light preset', async () => {
      document.documentElement.setAttribute('data-theme', 'dark');

      render(<ThemedPageView page={{ ...makePage(), themeId: 'coral-reef' }} />);

      await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    });

    it('becomes dark for a page on a dark preset', async () => {
      document.documentElement.setAttribute('data-theme', 'light');

      render(<ThemedPageView page={{ ...makePage(), themeId: 'midnight' }} />);

      await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    });

    // The provider's own mount effect runs before the app shell's, so it alone cannot hold the
    // mode. This is the composition that has to survive the shell writing 'dark' afterwards.
    it('holds light after the app shell pins the document to dark', async () => {
      render(<ThemedPageView page={{ ...makePage(), themeId: 'coral-reef' }} />);
      await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));

      document.documentElement.setAttribute('data-theme', 'dark');

      await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    });
  });
});
