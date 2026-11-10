import type { TemplateDefinition } from './types';

// Neutral grey tile, the same placeholder the primitives use. The gallery's `image` field is
// required, so a seeded entry needs a real value; the user replaces it with an upload.
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3C/svg%3E";

export const cartographyTemplate: TemplateDefinition = {
  id: 'cartography',
  label: 'Cartography',
  description: 'Built around a map gallery, with room for technique and tooling.',
  themeId: 'forest',
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
        variant: 'place',
        eyebrow: 'Replace this with your location, e.g. City, Country',
        heading: 'Your name here',
        subheading:
          'Replace this with a plain statement of your craft, e.g. a cartographer working in data visualisation.',
        align: 'left',
        ctas: [
          {
            label: 'Replace this with the name of a map',
            href: '#map-gallery',
            variant: 'primary',
          },
          {
            label: 'Replace this with the name of another map',
            href: '#map-gallery',
            variant: 'secondary',
          },
        ],
      },
    },
    {
      type: 'gallery',
      name: 'Map Gallery',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Map Gallery',
        columns: 3,
        images: [
          {
            image: PLACEHOLDER_IMAGE,
            alt: 'Replace this with a description of a map you have made',
            caption: 'Replace this with the story the map tells.',
          },
          {
            image: PLACEHOLDER_IMAGE,
            alt: 'Replace this with a description of a second map',
            caption: 'Replace this with the data and the audience behind it.',
          },
        ],
      },
    },
    {
      type: 'faq',
      name: 'Techniques',
      showInNav: true,
      props: {
        heading: 'Techniques',
        items: [
          {
            question: 'Replace this with a question about your tools',
            answer: 'Replace this with the software, projections and data sources you work with.',
          },
          {
            question: 'Replace this with a question about your process',
            answer: 'Replace this with how you go from raw data to a finished map.',
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
        heading: 'Get in touch',
        intro: 'Replace this with what you would like people to contact you about.',
        email: '',
        phone: '',
        links: [{ label: 'Replace with a link', href: 'https://example.com' }],
      },
    },
  ],
};
