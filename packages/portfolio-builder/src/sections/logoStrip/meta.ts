import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the logo strip section. Lives apart from `LogoStripSection.tsx` because
 * that module is `'use client'`; see `sections/navbar/meta.ts`.
 */
export const logoStripSectionMeta: SectionTypeMeta = {
  label: 'Logo Strip',
  propertySchema: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'items',
      label: 'Logos',
      type: 'list',
      itemLabel: 'Logo',
      maxItems: 10,
      itemSchema: [
        { key: 'image', label: 'Image', type: 'image', required: true },
        { key: 'alt', label: 'Alt text', type: 'text', required: true },
        { key: 'href', label: 'Link', type: 'text' },
      ],
    },
  ],
  defaultProps: {
    // Empty on purpose: a logo strip usually needs no title.
    heading: '',
    items: [],
  },
  minHeight: '20vh',
};
