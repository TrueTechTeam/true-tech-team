import type { TemplateDefinition } from './types';

export const blankTemplate: TemplateDefinition = {
  id: 'blank',
  label: 'Start Blank',
  description: 'A navigation bar and one header section. Build the rest yourself.',
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
      props: { variant: 'plain' },
    },
  ],
};
