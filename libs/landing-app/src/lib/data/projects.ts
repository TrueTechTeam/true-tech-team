export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'UI Components Library',
    description:
      'A comprehensive React component library with 44+ components, dark mode support, and 37 color families. Built with TypeScript, SCSS, and documented with Storybook.',
    image: '/placeholder-project.png',
    tags: ['React', 'TypeScript', 'SCSS', 'Storybook'],
    demoUrl: 'http://localhost:6006',
    githubUrl: 'https://github.com/true-tech-team/ui-components',
  },
  {
    id: '2',
    title: 'Landing Page Application',
    description:
      'Modern Next.js landing page with NextAuth authentication, showcasing the True Tech Team portfolio and providing access to various projects.',
    image: '/placeholder-project.png',
    tags: ['Next.js', 'NextAuth', 'React', 'TypeScript'],
    githubUrl: 'https://github.com/true-tech-team/landing-app',
  },
  // Add more projects as they are created
];
