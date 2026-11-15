import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the rich text section. Lives apart from `RichTextSection.tsx` because
 * that module is `'use client'`; see `sections/navbar/meta.ts`.
 */
export const richTextSectionMeta: SectionTypeMeta = {
  label: 'Rich Text',
  propertySchema: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'body', label: 'Body', type: 'textarea' },
    {
      key: 'align',
      label: 'Alignment',
      type: 'select',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
      ],
    },
  ],
  defaultProps: {
    heading: 'About',
    body: 'Replace this with a few sentences about yourself.',
    align: 'left',
  },
  minHeight: '40vh',
};
