import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the cards section. Lives apart from `CardsSection.tsx` because that
 * module is `'use client'`; see `sections/navbar/meta.ts`.
 */
export const cardsSectionMeta: SectionTypeMeta = {
  label: 'Cards',
  propertySchema: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'style',
      label: 'Style',
      type: 'select',
      options: [
        { value: 'static', label: 'Static' },
        { value: 'flip', label: 'Flip' },
      ],
    },
    {
      key: 'items',
      label: 'Cards',
      type: 'list',
      itemLabel: 'Card',
      maxItems: 8,
      itemSchema: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'backText', label: 'Back text (flip style only)', type: 'textarea' },
      ],
    },
  ],
  defaultProps: {
    heading: 'Services',
    style: 'static',
    items: [],
  },
  minHeight: '60vh',
};
