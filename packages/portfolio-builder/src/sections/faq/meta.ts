import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the FAQ section. Lives apart from `FaqSection.tsx` because that module
 * is `'use client'`; see `sections/navbar/meta.ts`.
 */
export const faqSectionMeta: SectionTypeMeta = {
  label: 'FAQ',
  propertySchema: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'items',
      label: 'Questions',
      type: 'list',
      itemLabel: 'Question',
      maxItems: 10,
      itemSchema: [
        { key: 'question', label: 'Question', type: 'text', required: true },
        { key: 'answer', label: 'Answer', type: 'textarea', required: true },
      ],
    },
  ],
  defaultProps: {
    heading: 'Frequently asked',
    items: [],
  },
  minHeight: '50vh',
};
