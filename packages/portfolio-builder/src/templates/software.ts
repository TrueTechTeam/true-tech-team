import type { TemplateDefinition } from './types';

// Neutral grey tile, the same placeholder the primitives use. The gallery's `image` field is
// required, so a seeded entry needs a real value; the user replaces it with an upload.
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3C/svg%3E";

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
      type: 'gallery',
      name: 'Projects',
      showInNav: true,
      background: 'secondary',
      props: {
        heading: 'Projects',
        columns: 3,
        images: [
          {
            image: PLACEHOLDER_IMAGE,
            alt: 'Replace this with a description of your first project screenshot',
            caption: 'Replace this with a project you are proud of and what it does.',
          },
          {
            image: PLACEHOLDER_IMAGE,
            alt: 'Replace this with a description of your second project screenshot',
            caption: 'Replace this with another project and the problem it solves.',
          },
        ],
      },
    },
    {
      type: 'timeline',
      name: 'Experience',
      showInNav: true,
      props: {
        heading: 'Experience',
        entries: [
          {
            period: 'Replace with dates, e.g. 2022 - Present',
            title: 'Replace this with your role and employer',
            body: 'Replace this with what you were responsible for and what you shipped.',
          },
          {
            period: 'Replace with dates, e.g. 2019 - 2022',
            title: 'Replace this with a previous role',
            body: 'Replace this with a short summary of the work.',
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
        intro: 'Replace this with a line about what you would like people to contact you for.',
        email: '',
        phone: '',
        links: [{ label: 'Replace with a link', href: 'https://example.com' }],
      },
    },
  ],
};
