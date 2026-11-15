import { getSectionTypeMeta } from '../sections/meta';
import type { PageSection, PortfolioPage, SectionBackground, SectionType } from '../schema/types';

/**
 * Pure page mutations for the section editor.
 *
 * Every function takes a page and returns a new page, and returns the SAME page object
 * (reference-equal) when the requested change is a no-op — an absent id, a move past either
 * boundary, or an add barred by `singleton`. Callers can therefore treat reference equality as
 * "nothing changed" and skip marking the editor dirty.
 *
 * React-free and free of any `'use client'` dependency, following the pattern the deleted
 * `layout/transforms.ts` established.
 */

/**
 * Whether a section of `type` may be added to `page`: false when the type is unknown, or when its
 * metadata sets `singleton: true` and the page already contains one.
 *
 * Uses `getSectionTypeMeta` (which accepts a `string`) rather than indexing `SECTION_META`
 * directly, so an unknown type coming from stored data is a runtime `undefined` rather than a
 * value TypeScript believes always exists.
 */
export function canAddSectionType(page: PortfolioPage, type: SectionType): boolean {
  const meta = getSectionTypeMeta(type);
  if (!meta) {
    return false;
  }
  if (!meta.singleton) {
    return true;
  }
  return !page.sections.some((section) => section.type === type);
}

/**
 * Appends a section of `type`, seeded from that type's `defaultProps` with its `label` as the
 * section name. Chrome sections (the navbar) default to hidden in the navigation, since a nav
 * bar listing itself is never wanted; content sections default to shown.
 */
export function addSection(page: PortfolioPage, type: SectionType): PortfolioPage {
  const meta = getSectionTypeMeta(type);
  if (!meta || !canAddSectionType(page, type)) {
    return page;
  }
  const section: PageSection = {
    id: crypto.randomUUID(),
    type,
    name: meta.label,
    showInNav: !meta.chrome,
    // Spread, never share: the metadata object is module-level and would otherwise be aliased
    // into the page and mutated by the first edit.
    props: { ...meta.defaultProps },
  };
  return { ...page, sections: [...page.sections, section] };
}

export function removeSection(page: PortfolioPage, id: string): PortfolioPage {
  if (!page.sections.some((section) => section.id === id)) {
    return page;
  }
  return { ...page, sections: page.sections.filter((section) => section.id !== id) };
}

/** Moves the section with `id` one position toward the start (`-1`) or the end (`+1`). */
export function moveSection(page: PortfolioPage, id: string, delta: -1 | 1): PortfolioPage {
  const index = page.sections.findIndex((section) => section.id === id);
  if (index === -1) {
    return page;
  }
  const target = index + delta;
  if (target < 0 || target >= page.sections.length) {
    return page;
  }
  const sections = [...page.sections];
  const moved = sections[index];
  if (!moved) {
    return page;
  }
  sections.splice(index, 1);
  sections.splice(target, 0, moved);
  return { ...page, sections };
}

/** Replaces the whole `props` bag of the addressed section. */
export function updateSectionProps(
  page: PortfolioPage,
  id: string,
  props: Record<string, unknown>
): PortfolioPage {
  if (!page.sections.some((section) => section.id === id)) {
    return page;
  }
  return {
    ...page,
    sections: page.sections.map((section) => (section.id === id ? { ...section, props } : section)),
  };
}

/**
 * Updates the section-level fields that live on `PageSection` itself rather than inside `props`.
 * Only the keys present in `patch` are changed.
 */
export function updateSectionMeta(
  page: PortfolioPage,
  id: string,
  patch: { name?: string; showInNav?: boolean; background?: SectionBackground }
): PortfolioPage {
  if (!page.sections.some((section) => section.id === id)) {
    return page;
  }
  return {
    ...page,
    sections: page.sections.map((section) =>
      section.id === id ? { ...section, ...patch } : section
    ),
  };
}
