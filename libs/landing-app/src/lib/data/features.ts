import type { IconName } from '@true-tech-team/ui-components';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export const features: Feature[] = [
  {
    id: '1',
    title: 'Modern Stack',
    description:
      'Built with Next.js, React, and TypeScript for optimal performance and developer experience.',
    icon: 'check',
  },
  {
    id: '2',
    title: 'Component Library',
    description:
      'Leverage our comprehensive UI component library with theme support and accessibility built-in.',
    icon: 'check',
  },
  {
    id: '3',
    title: 'Responsive Design',
    description:
      'Fully responsive layouts that work seamlessly across all devices and screen sizes.',
    icon: 'check',
  },
  {
    id: '4',
    title: 'Type Safety',
    description: 'End-to-end TypeScript support ensures code quality and catches errors early.',
    icon: 'check',
  },
  {
    id: '5',
    title: 'Dark Mode',
    description: 'Built-in theme support with both light and dark modes for comfortable viewing.',
    icon: 'check',
  },
  {
    id: '6',
    title: 'Open Source',
    description:
      'All projects are open source and available for the community to use and contribute.',
    icon: 'check',
  },
];

