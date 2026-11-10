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
        variant: 'proof',
        heading: 'Your name here',
        subheading: 'Replace this with the one thing you do for clients and who it is for.',
        align: 'center',
        stats: [
          { value: 'XX%', label: 'Replace this with your strongest result, and name the client' },
        ],
        ctas: [{ label: 'See campaigns', href: '#campaigns', variant: 'primary' }],
      },
    },
    {
      type: 'cards',
      name: 'Campaigns',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Campaigns',
        style: 'static',
        items: [
          {
            title: 'Replace with a campaign name',
            body: 'Replace this with the audience and the channel mix.',
          },
          {
            title: 'Replace with another campaign name',
            body: 'Replace this with what you set out to achieve.',
          },
        ],
      },
    },
    {
      type: 'metrics',
      name: 'Results',
      showInNav: true,
      props: {
        heading: 'Results',
        animate: false,
        items: [
          { value: 0, label: 'Replace with a result, e.g. Conversion lift', suffix: '%' },
          { value: 0, label: 'Replace with another result, e.g. Leads generated', suffix: '' },
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
        intro: 'Replace this with what you are looking for.',
        email: '',
        phone: '',
        links: [{ label: 'Replace with a link', href: 'https://example.com' }],
      },
    },
  ],
};
