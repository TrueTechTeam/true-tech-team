import type { TemplateDefinition } from './types';

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
      type: 'header',
      name: 'Portfolio',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Portfolio',
        subheading: 'Replace this with your strongest piece and a line about the brief.',
        align: 'left',
      },
    },
    {
      type: 'header',
      name: 'Services',
      showInNav: true,
      props: {
        heading: 'Services',
        subheading: 'What you offer, and who it is for.',
        align: 'left',
      },
    },
    {
      type: 'header',
      name: 'Contact',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Work with me',
        subheading: 'Add an email address and your typical turnaround.',
        align: 'center',
      },
    },
  ],
};
