import { isSectionType, type SectionType } from '../schema/types';
import type { SectionTypeMeta } from './types';
import { navbarSectionMeta } from './navbar/meta';

/**
 * Every section type's server-safe metadata.
 *
 * Nothing reachable from this module may be a `'use client'` module or import React, so that
 * `schema/validate.ts` (and therefore `pages/crud.ts`) can read property schemas without
 * pulling in the component layer.
 */
export const SECTION_META: Record<SectionType, SectionTypeMeta> = {
  navbar: navbarSectionMeta,
};

export function getSectionTypeMeta(type: string): SectionTypeMeta | undefined {
  return isSectionType(type) ? SECTION_META[type] : undefined;
}
