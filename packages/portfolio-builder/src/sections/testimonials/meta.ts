import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the testimonials section. Lives apart from `TestimonialsSection.tsx`
 * because that module is `'use client'`; see `sections/navbar/meta.ts`.
 */
export const testimonialsSectionMeta: SectionTypeMeta = {
  label: 'Testimonials',
  propertySchema: [
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'items',
      label: 'Testimonials',
      type: 'list',
      itemLabel: 'Testimonial',
      maxItems: 6,
      itemSchema: [
        { key: 'quote', label: 'Quote', type: 'textarea', required: true },
        { key: 'author', label: 'Author', type: 'text', required: true },
        { key: 'role', label: 'Role', type: 'text' },
        { key: 'avatar', label: 'Avatar', type: 'image' },
      ],
    },
  ],
  defaultProps: {
    heading: 'What people say',
    items: [],
  },
  minHeight: '50vh',
};
