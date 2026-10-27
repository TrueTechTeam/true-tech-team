import type { PageSection, PortfolioPage } from '../schema/types';

export interface PortfolioPageRecord {
  id: string;
  userId: string;
  slug: string;
  title: string;
  templateId: string;
  themeId?: string;
  published: boolean;
  /**
   * From the stored `data` blob; `mapRowToRecord` sets `PRE_PIVOT_SCHEMA_VERSION` when the row
   * has none. Optional so hand-built records (fixtures) need not supply it; `recordToPage`
   * treats a missing value the same way, as pre-pivot.
   */
  schemaVersion?: number;
  sections: PageSection[];
  themeOverride?: PortfolioPage['themeOverride'];
  createdAt: string;
  updatedAt: string;
}
