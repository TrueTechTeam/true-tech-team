import type { PageSection, PortfolioPage } from '../schema/types';

export interface PortfolioPageRecord {
  id: string;
  userId: string;
  slug: string;
  title: string;
  templateId: string;
  themeId?: string;
  published: boolean;
  sections: PageSection[];
  themeOverride?: PortfolioPage['themeOverride'];
  createdAt: string;
  updatedAt: string;
}
