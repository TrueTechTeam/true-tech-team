import type { IconName } from '@true-tech-team/react-components';

export type AppAccent =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface AppDefinition {
  slug: string;
  label: string;
  description: string;
  icon: IconName;
  accent: AppAccent;
  // null = no page built yet (analytics/internal-tools/beta-features are permission
  // flags with a placeholder dashboard card, not real mini-apps).
  href: string | null;
}

export const APPS: AppDefinition[] = [
  {
    slug: 'recipe-agent',
    label: 'Recipe AI Agent',
    description:
      'Search for recipes with AI — filters by your dietary profile, saves favorites, and tracks what you’ve tried.',
    icon: 'compass',
    accent: 'success',
    href: '/recipes',
  },
  {
    slug: 'job-search',
    label: 'Job Search',
    description:
      'AI-powered job search — finds openings matching your profile, tracks your application pipeline, and tailors your resume for each one.',
    icon: 'search',
    accent: 'info',
    href: '/job-search',
  },
  {
    slug: 'analytics',
    label: 'Analytics',
    description: 'Project analytics and usage metrics.',
    icon: 'bar-chart-2',
    accent: 'secondary',
    href: null,
  },
  {
    slug: 'internal-tools',
    label: 'Internal Tools',
    description: 'Internal team tooling and utilities.',
    icon: 'terminal',
    accent: 'neutral',
    href: null,
  },
  {
    slug: 'beta-features',
    label: 'Beta Features',
    description: 'Early access to features in development.',
    icon: 'zap',
    accent: 'warning',
    href: null,
  },
];

export function getApp(slug: string): AppDefinition | undefined {
  return APPS.find((a) => a.slug === slug);
}
