import type { TemplateDefinition } from './types';

// Neutral grey tile, the same placeholder the primitives use. The gallery's `image` field is
// required, so a seeded entry needs a real value; the user replaces it with an upload.
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3C/svg%3E";

export const graphicDesignTemplate: TemplateDefinition = {
  id: 'graphic-design',
  label: 'Graphic Design',
  description: 'Lead with the portfolio: large visual sections for showing work.',
  themeId: 'coral-reef',
  sections: [
    {
      type: 'navbar',
      name: 'Home',
      showInNav: false,
      props: { brand: '', sticky: true },
    },
    {
      type: 'header',
      name: 'Intro',
      showInNav: true,
      props: {
        heading: 'Your name here',
        subheading: 'Graphic designer working in brand, print and digital.',
        align: 'center',
        ctas: [
          { label: 'View portfolio', href: '#portfolio', variant: 'primary' },
          { label: 'Work with me', href: '#contact', variant: 'secondary' },
        ],
      },
    },
    {
      type: 'gallery',
      name: 'Portfolio',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Portfolio',
        columns: 3,
        images: [
          {
            image: PLACEHOLDER_IMAGE,
            alt: 'Replace this with a description of your strongest piece',
            caption: 'Replace this with a line about the brief.',
          },
          {
            image: PLACEHOLDER_IMAGE,
            alt: 'Replace this with a description of a second piece',
            caption: 'Replace this with a line about the client and the result.',
          },
        ],
      },
    },
    {
      type: 'cards',
      name: 'Services',
      showInNav: true,
      props: {
        heading: 'Services',
        style: 'static',
        items: [
          {
            title: 'Replace with a service you offer',
            body: 'Replace this with what the service includes and who it is for.',
          },
          {
            title: 'Replace with another service',
            body: 'Replace this with what the client gets from it.',
          },
        ],
      },
    },
    {
      type: 'contact',
      name: 'Contact',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Work with me',
        intro: 'Replace this with your typical turnaround and the kind of projects you take on.',
        email: '',
        phone: '',
        links: [{ label: 'Replace with a link', href: 'https://example.com' }],
      },
    },
  ],
};
