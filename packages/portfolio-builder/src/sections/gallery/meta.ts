import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the photo gallery section.
 *
 * Lives apart from `GallerySection.tsx` because that module is `'use client'`: `schema/validate.ts`
 * imports this file, and `pages/crud.ts` imports that, so a client-module import here would reach
 * server code and every published page would 500. See `sections/navbar/meta.ts`.
 */
export const gallerySectionMeta: SectionTypeMeta = {
  label: 'Photo Gallery',
  propertySchema: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'columns',
      label: 'Columns',
      type: 'select',
      optionValueType: 'number',
      options: [
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
    },
    {
      key: 'images',
      label: 'Images',
      type: 'list',
      itemLabel: 'Image',
      maxItems: 12,
      itemSchema: [
        { key: 'image', label: 'Image', type: 'image', required: true },
        { key: 'alt', label: 'Alt text', type: 'text', required: true },
        { key: 'caption', label: 'Caption', type: 'text' },
      ],
    },
  ],
  defaultProps: {
    heading: 'Gallery',
    columns: 3,
    images: [],
  },
  minHeight: '60vh',
};
