export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
  // Slug of the mini-app in lib/apps/registry.ts this project maps to. When
  // set, the "View" button only renders for users with access to that app.
  appSlug?: string;
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'UI Components Library',
    description:
      'A comprehensive React component library with 44+ components, dark mode support, and 37 color families. Built with TypeScript, SCSS, and documented with Storybook.',
    image: '/placeholder-project.png',
    tags: ['React', 'TypeScript', 'SCSS', 'Storybook'],
    demoUrl: '/storybook',
    githubUrl: 'https://github.com/TrueTechTeam/true-tech-team/tree/master/libs/ui-components',
  },
  {
    id: '2',
    title: 'Recipe AI Agent',
    description:
      'Search for recipes with AI — filters by your dietary profile, saves favorites, and tracks what you’ve tried.',
    image: '/placeholder-project.png',
    tags: ['Next.js', 'AI Agent', 'TypeScript'],
    demoUrl: '/recipes',
    appSlug: 'recipe-agent',
  },
  {
    id: '3',
    title: 'Job Search',
    description:
      'AI-powered job search — finds openings matching your profile, tracks your application pipeline, and tailors your resume for each one.',
    image: '/placeholder-project.png',
    tags: ['Next.js', 'AI Agent', 'TypeScript'],
    demoUrl: '/job-search',
    appSlug: 'job-search',
  },
  // Add more projects as they are created
];
