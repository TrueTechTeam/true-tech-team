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
        variant: 'outcome',
        heading: 'Your name here',
        subheading: 'Replace this with the kind of work you deliver and the result it produced.',
        align: 'center',
        stats: [
          { value: 'XX%', label: 'Replace this with a result, e.g. on-time delivery' },
          { value: '$X.XM', label: 'Replace this with a budget you managed' },
          { value: 'XX', label: 'Replace this with a team size or number of projects' },
        ],
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
        email: '',
        phone: '',
        links: [{ label: 'Replace with a link', href: 'https://example.com' }],
      },
    },
  ],
};
