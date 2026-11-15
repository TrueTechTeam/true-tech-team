import type { SectionTypeMeta } from '../types';

/**
 * Server-safe metadata for the contact section. Lives apart from `ContactSection.tsx` because
 * that module is `'use client'`; see `sections/navbar/meta.ts`.
 */
export const contactSectionMeta: SectionTypeMeta = {
  label: 'Contact',
  propertySchema: [
    { key: 'heading', label: 'Heading', type: 'text', required: true },
    { key: 'intro', label: 'Intro', type: 'textarea' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    {
      key: 'links',
      label: 'Links',
      type: 'list',
      itemLabel: 'Link',
      maxItems: 5,
      itemSchema: [
        { key: 'label', label: 'Label', type: 'text', required: true },
        { key: 'href', label: 'Link', type: 'text', required: true },
      ],
    },
  ],
  defaultProps: {
    heading: 'Get in touch',
    intro: '',
    email: '',
    phone: '',
    links: [],
  },
  minHeight: '40vh',
};
