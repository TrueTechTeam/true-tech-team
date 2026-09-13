import { GlobalProvider } from '@true-tech-team/react-components';
import { PageRenderer } from './PageRenderer';
import { resolveEffectiveTheme } from '../themes/resolveTheme';
import type { PortfolioPage } from '../schema/types';

export interface ThemedPageViewProps {
  page: PortfolioPage;
}

export function ThemedPageView({ page }: ThemedPageViewProps) {
  return (
    <GlobalProvider themeConfig={{ theme: resolveEffectiveTheme(page) }}>
      <PageRenderer page={page} />
    </GlobalProvider>
  );
}
