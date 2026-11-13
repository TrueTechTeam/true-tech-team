import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the navbar section type.
 *
 * Lives apart from `NavbarSection.tsx` because that module is `'use client'`: in the RSC layer
 * every named export of a client module becomes a proxy that throws (or yields undefined) on
 * property access from a server module, so metadata exported alongside the component could not
 * be read by `SectionRenderer` or by `schema/validate.ts`.
 */
export const navbarSectionMeta: SectionTypeMeta = {
  label: 'Navigation Bar',
  propertySchema: [
    { key: 'brand', label: 'Brand Text', type: 'text' },
    { key: 'sticky', label: 'Stick to top on scroll', type: 'boolean' },
  ],
  defaultProps: { brand: '', sticky: true },
  minHeight: '0',
  singleton: true,
  // The navbar is page chrome: it must not be wrapped in the <section> shell, or its
  // `position: sticky` is clamped to that wrapper's own height. See `SectionTypeMeta.chrome`.
  chrome: true,
};
