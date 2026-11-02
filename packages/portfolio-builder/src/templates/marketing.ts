import type { TemplateDefinition } from './types';

export const marketingTemplate: TemplateDefinition = {
  id: 'marketing',
  label: 'Marketing',
  description: 'Campaign-led, with space for measurable results.',
  themeId: 'sunset',
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
        subheading: 'Marketer building campaigns that move the numbers.',
        align: 'center',
        ctas: [
          { label: 'See campaigns', href: '#campaigns', variant: 'primary' },
          { label: 'Get in touch', href: '#contact', variant: 'secondary' },
        ],
      },
    },
    {
      type: 'header',
      name: 'Campaigns',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Campaigns',
        subheading: 'Describe a campaign, the audience and the channel mix.',
        align: 'left',
      },
    },
    {
      type: 'header',
      name: 'Results',
      showInNav: true,
      props: {
        heading: 'Results',
        subheading: 'The numbers that mattered, and how you moved them.',
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
        subheading: 'Add an email address and what you are looking for.',
        align: 'center',
      },
    },
  ],
};
