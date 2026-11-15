import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the timeline section. Lives apart from `TimelineSection.tsx` because
 * that module is `'use client'`; see `sections/navbar/meta.ts`.
 */
export const timelineSectionMeta: SectionTypeMeta = {
  label: 'Timeline',
  propertySchema: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'entries',
      label: 'Entries',
      type: 'list',
      itemLabel: 'Entry',
      maxItems: 10,
      itemSchema: [
        { key: 'period', label: 'Period', type: 'text', required: true },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'body', label: 'Description', type: 'textarea' },
      ],
    },
  ],
  defaultProps: {
    heading: 'Experience',
    entries: [],
  },
  minHeight: '60vh',
};
