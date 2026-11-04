import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the metrics section. Lives apart from `MetricsSection.tsx` because
 * that module is `'use client'`; see `sections/navbar/meta.ts`.
 */
export const metricsSectionMeta: SectionTypeMeta = {
  label: 'Metrics',
  propertySchema: [
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'animate', label: 'Count up when scrolled into view', type: 'boolean' },
    {
      key: 'items',
      label: 'Metrics',
      type: 'list',
      itemLabel: 'Metric',
      maxItems: 4,
      itemSchema: [
        { key: 'value', label: 'Value', type: 'number', required: true },
        { key: 'label', label: 'Label', type: 'text', required: true },
        { key: 'suffix', label: 'Suffix', type: 'text' },
      ],
    },
  ],
  defaultProps: {
    heading: 'Results',
    animate: false,
    items: [],
  },
  minHeight: '40vh',
};
