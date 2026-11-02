import type { TemplateDefinition } from './types';

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
        heading: 'Your name here',
        subheading: 'Cartographer and spatial designer. I make maps that explain things.',
        align: 'center',
        ctas: [
          { label: 'View maps', href: '#map-gallery', variant: 'primary' },
          { label: 'Get in touch', href: '#contact', variant: 'secondary' },
        ],
      },
    },
    {
      type: 'header',
      name: 'Map Gallery',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Map Gallery',
        subheading: 'Replace this with a map you have made and the story it tells.',
        align: 'left',
      },
    },
    {
      type: 'header',
      name: 'Techniques',
      showInNav: true,
      props: {
        heading: 'Techniques',
        subheading: 'The tools, projections and data sources you work with.',
        align: 'left',
      },
    },
    {
      type: 'header',
      name: 'Contact',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Get in touch',
        subheading: 'Add an email address or a link to your preferred contact method.',
        align: 'center',
      },
    },
  ],
};
