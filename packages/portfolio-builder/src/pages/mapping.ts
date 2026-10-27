import { PRE_PIVOT_SCHEMA_VERSION, type PageSection, type PortfolioPage } from '../schema/types';
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
    /** Absent on rows written before the section-type pivot. */
    schemaVersion?: number;
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
    // A row with no stored version predates the pivot (v1). Surface that as 1 rather than
    // assuming the current version, so `validatePortfolioPage` rejects it and the data migration
    // can find it by discriminator instead of sniffing section shape.
    schemaVersion: row.data.schemaVersion ?? PRE_PIVOT_SCHEMA_VERSION,
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
    schemaVersion: number;
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
      schemaVersion: page.schemaVersion,
      sections: page.sections,
      themeOverride: page.themeOverride,
    },
  };
}

export function recordToPage(record: PortfolioPageRecord): PortfolioPage {
  return {
    schemaVersion: record.schemaVersion ?? PRE_PIVOT_SCHEMA_VERSION,
    slug: record.slug,
    title: record.title,
    templateId: record.templateId,
    themeId: record.themeId,
    themeOverride: record.themeOverride,
    sections: record.sections,
  };
}
