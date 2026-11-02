import type { TemplateDefinition } from './types';

export const softwareTemplate: TemplateDefinition = {
  id: 'software',
  label: 'Software Engineer',
  description: 'A project-led layout for developers: work first, then experience and contact.',
  themeId: 'slate',
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
        subheading: 'Software engineer. I build reliable, well-tested systems.',
        align: 'center',
        ctas: [
          { label: 'See my work', href: '#projects', variant: 'primary' },
          { label: 'Get in touch', href: '#contact', variant: 'secondary' },
        ],
      },
    },
    {
      type: 'header',
      name: 'Projects',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Projects',
        subheading: 'Replace this with a project you are proud of and what it does.',
        align: 'left',
      },
    },
    {
      type: 'header',
      name: 'Experience',
      showInNav: true,
      props: {
        heading: 'Experience',
        subheading: 'Where you have worked, and what you were responsible for.',
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
        subheading: 'Add an email address or a link to your preferred way of being contacted.',
        align: 'center',
      },
    },
  ],
};
