import { SECTION_META } from '../sections/meta';
import { CURRENT_SCHEMA_VERSION, type PageSection, type PortfolioPage } from '../schema/types';
import type { TemplateDefinition } from './types';

/**
 * Seeds a brand-new page from a template.
 *
 * Pure, and deliberately not a component concern: page seeding used to live in a closure inside
 * `PortfolioPagesList`, where it could not be unit-tested.
 *
 * Each section's props are the section type's `defaultProps` with the template's own props merged
 * over the top, so a template states only what it overrides. A template that omits `props`
 * entirely inherits every default.
 */
export function buildPageFromTemplate(
  template: TemplateDefinition,
  title: string,
  slug: string
): PortfolioPage {
  const sections: PageSection[] = template.sections.map((templateSection) => ({
    id: crypto.randomUUID(),
    type: templateSection.type,
    name: templateSection.name,
    showInNav: templateSection.showInNav,
    ...(templateSection.background === undefined ? {} : { background: templateSection.background }),
    // Spread both: never alias the module-level defaults into the page, or the first edit would
    // mutate the metadata for every page in the process.
    props: {
      ...SECTION_META[templateSection.type].defaultProps,
      ...(templateSection.props ?? {}),
    },
  }));

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    slug,
    title,
    templateId: template.id,
    themeId: template.themeId,
    sections,
  };
}
