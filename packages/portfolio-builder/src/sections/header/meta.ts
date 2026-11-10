import type { SectionTypeMeta } from '../types';
import { DEFAULT_HEADER_VARIANT, HEADER_VARIANTS, HEADER_VARIANT_LABELS } from './variants';

/**
 * Server-safe metadata for the header section type. Lives apart from `HeaderSection.tsx`
 * because that module is `'use client'`; see `sections/navbar/meta.ts`.
 *
 * The header is page content, not chrome, so it keeps the `<section>` shell.
 */
export const headerSectionMeta: SectionTypeMeta = {
  label: 'Header',
  propertySchema: [
    {
      key: 'variant',
      label: 'Layout',
      type: 'select',
      options: HEADER_VARIANTS.map((value) => ({ value, label: HEADER_VARIANT_LABELS[value] })),
    },
    { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
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
      key: 'stats',
      label: 'Stats',
      type: 'list',
      itemLabel: 'Stat',
      maxItems: 4,
      itemSchema: [
        { key: 'value', label: 'Value', type: 'text', required: true },
        { key: 'label', label: 'Label', type: 'text', required: true },
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
    variant: DEFAULT_HEADER_VARIANT,
    eyebrow: '',
    heading: 'Your name here',
    subheading: '',
    backgroundImage: '',
    align: 'left',
    stats: [],
    ctas: [],
  },
  minHeight: '70vh',
};
