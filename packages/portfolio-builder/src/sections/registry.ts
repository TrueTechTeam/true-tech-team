import { isSectionType, type SectionType } from '../schema/types';
import type { SectionTypeEntry } from './types';
import { navbarSectionEntry } from './navbar/NavbarSection';

export const SECTION_REGISTRY: Record<SectionType, SectionTypeEntry> = {
  navbar: navbarSectionEntry,
};

export function getSectionTypeEntry(type: string): SectionTypeEntry | undefined {
  return isSectionType(type) ? SECTION_REGISTRY[type] : undefined;
}
