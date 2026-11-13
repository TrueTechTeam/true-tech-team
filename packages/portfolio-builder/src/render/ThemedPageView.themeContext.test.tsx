import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useTheme } from '@true-tech-team/react-components';
import { ThemedPageView } from './ThemedPageView';
import type { PortfolioPage } from '../schema/types';

// Stand in for the page content so a probe can read the theme context ThemedPageView provides.
// Library components inside a portfolio read their mode from that context, not from the document,
// so the provider has to be told the page's mode and not just left on its default.
vi.mock('./PageRenderer', () => ({
  PageRenderer: function PageRendererProbe() {
    const { mode } = useTheme();
    return <span data-testid="context-mode">{mode}</span>;
  },
}));

function makePage(themeId: string): PortfolioPage {
  return {
    schemaVersion: 2,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    themeId,
    sections: [],
  };
}

describe('ThemedPageView theme context', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it("reports a light preset's mode to the content it renders", () => {
    render(<ThemedPageView page={makePage('coral-reef')} />);
    expect(screen.getByTestId('context-mode')).toHaveTextContent('light');
  });

  it("reports a dark preset's mode to the content it renders", () => {
    render(<ThemedPageView page={makePage('midnight')} />);
    expect(screen.getByTestId('context-mode')).toHaveTextContent('dark');
  });
});
