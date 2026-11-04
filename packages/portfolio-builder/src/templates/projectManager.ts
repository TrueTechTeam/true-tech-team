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
      type: 'cards',
      name: 'Case Studies',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Case Studies',
        style: 'static',
        items: [
          {
            title: 'Replace with a project name',
            body: 'Replace this with the problem, your role and the outcome.',
          },
          {
            title: 'Replace with another project name',
            body: 'Replace this with the problem, your role and the outcome.',
          },
        ],
      },
    },
    {
      type: 'timeline',
      name: 'Approach',
      showInNav: true,
      props: {
        heading: 'Approach',
        entries: [
          {
            period: 'Step 1',
            title: 'Replace this with how you start a project',
            body: 'Replace this with how you scope, plan and align stakeholders.',
          },
          {
            period: 'Step 2',
            title: 'Replace this with how you keep delivery on track',
            body: 'Replace this with how you communicate progress and handle risk.',
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
        intro:
          'Replace this with how you would like people to reach you, or add a scheduling link below.',
        email: 'Replace this with your email address',
        phone: '',
        links: [{ label: 'Replace with a link', href: 'https://example.com' }],
      },
    },
  ],
};
