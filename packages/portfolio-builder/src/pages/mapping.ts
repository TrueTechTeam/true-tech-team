import type { PageSection, PortfolioPage } from '../schema/types';
import type { PortfolioPageRecord } from './types';

export interface PortfolioPageRow {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  template_id: string;
  theme_id: string | null;
  published: boolean;
  data: {
    showNav?: boolean;
    sections?: PageSection[];
    themeOverride?: PortfolioPage['themeOverride'];
  };
  created_at: string;
  updated_at: string;
}

export function mapRowToRecord(row: PortfolioPageRow): PortfolioPageRecord {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    title: row.title,
    templateId: row.template_id,
    themeId: row.theme_id ?? undefined,
    published: row.published,
    showNav: row.data.showNav ?? true,
    sections: row.data.sections ?? [],
    themeOverride: row.data.themeOverride,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface PortfolioPageColumns {
  user_id: string;
  slug: string;
  title: string;
  template_id: string;
  theme_id: string | null;
  data: {
    showNav: boolean;
    sections: PageSection[];
    themeOverride?: PortfolioPage['themeOverride'];
  };
}

export function pageToColumns(userId: string, page: PortfolioPage): PortfolioPageColumns {
  return {
    user_id: userId,
    slug: page.slug,
    title: page.title,
    template_id: page.templateId,
    theme_id: page.themeId ?? null,
    data: {
      showNav: page.showNav,
      sections: page.sections,
      themeOverride: page.themeOverride,
    },
  };
}
