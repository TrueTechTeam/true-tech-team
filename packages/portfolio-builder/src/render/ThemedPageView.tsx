import { GlobalProvider } from '@true-tech-team/react-components';
import { PageRenderer } from './PageRenderer';
import { PageThemeMode } from './PageThemeMode';
import { resolveEffectiveMode, resolveEffectiveTheme } from '../themes/resolveTheme';
import type { PortfolioPage } from '../schema/types';

export interface ThemedPageViewProps {
  page: PortfolioPage;
}

export function ThemedPageView({ page }: ThemedPageViewProps) {
  // The mode goes to the provider so the library's own theme context reports it, and to
  // PageThemeMode so the document's `data-theme` ends up carrying it - see that component for
  // why the provider alone is not enough.
  const mode = resolveEffectiveMode(page);

  return (
    <GlobalProvider themeConfig={{ mode, theme: resolveEffectiveTheme(page) }}>
      <PageThemeMode mode={mode} />
      <PageRenderer page={page} />
    </GlobalProvider>
  );
}
