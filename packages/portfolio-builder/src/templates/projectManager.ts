import type { TemplateDefinition } from './types';

export const projectManagerTemplate: TemplateDefinition = {
  id: 'project-manager',
  label: 'Project Manager',
  description: 'Outcome-focused: case studies, how you work, and results.',
  themeId: 'ocean',
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
        subheading: 'Project manager delivering complex work on time and in scope.',
        align: 'center',
        ctas: [
          { label: 'See case studies', href: '#case-studies', variant: 'primary' },
          { label: 'Get in touch', href: '#contact', variant: 'secondary' },
        ],
      },
    },
    {
      type: 'header',
      name: 'Case Studies',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Case Studies',
        subheading: 'Pick one project and describe the problem, your role and the outcome.',
        align: 'left',
      },
    },
    {
      type: 'header',
      name: 'Approach',
      showInNav: true,
      props: {
        heading: 'Approach',
        subheading: 'How you plan, communicate and keep delivery predictable.',
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
        subheading: 'Add an email address or a scheduling link.',
        align: 'center',
      },
    },
  ],
};
