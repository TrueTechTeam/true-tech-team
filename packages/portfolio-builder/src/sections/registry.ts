import { isSectionType, type SectionType } from '../schema/types';
import type { SectionTypeEntry } from './types';
import { SECTION_META } from './meta';
import { NavbarSection } from './navbar/NavbarSection';
import { HeaderSection } from './header/HeaderSection';
import { GallerySection } from './gallery/GallerySection';

/**
 * Each section type's metadata joined to its component.
 *
 * This module is server-safe even though the components are client components: it only ever
 * passes an imported client-component name THROUGH into a plain object it owns. Server code may
 * then read `entry.component`, `entry.minHeight` and `entry.chrome` off that plain object, which
 * is legal - what throws in the RSC layer is dotting into a named export OF a `'use client'`
 * module, which is why the metadata cannot live beside the component.
 */
export const SECTION_REGISTRY: Record<SectionType, SectionTypeEntry> = {
  navbar: { ...SECTION_META.navbar, component: NavbarSection },
  header: { ...SECTION_META.header, component: HeaderSection },
  gallery: { ...SECTION_META.gallery, component: GallerySection },
};

export function getSectionTypeEntry(type: string): SectionTypeEntry | undefined {
  return isSectionType(type) ? SECTION_REGISTRY[type] : undefined;
}
