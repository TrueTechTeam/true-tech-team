import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the header section type. Lives apart from `HeaderSection.tsx`
 * because that module is `'use client'`; see `sections/navbar/meta.ts`.
 *
 * The header is page content, not chrome, so it keeps the `<section>` shell.
 */
export const headerSectionMeta: SectionTypeMeta = {
  label: 'Header',
  propertySchema: [
    { key: 'heading', label: 'Heading', type: 'text', required: true },
    { key: 'subheading', label: 'Subheading', type: 'textarea' },
    { key: 'backgroundImage', label: 'Background Image', type: 'image' },
    {
      key: 'align',
      label: 'Alignment',
      type: 'select',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
      ],
    },
    {
      key: 'ctas',
      label: 'Buttons',
      type: 'list',
      itemLabel: 'Button',
      maxItems: 2,
      itemSchema: [
        { key: 'label', label: 'Label', type: 'text', required: true },
        { key: 'href', label: 'Link', type: 'text', required: true },
        {
          key: 'variant',
          label: 'Style',
          type: 'select',
          options: [
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
          ],
        },
      ],
    },
  ],
  defaultProps: {
    heading: 'Your name here',
    subheading: '',
    backgroundImage: '',
    align: 'left',
    ctas: [],
  },
  minHeight: '70vh',
};
