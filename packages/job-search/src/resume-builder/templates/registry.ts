import type { ComponentType } from 'react';
import type { ResumeData } from '../lib/types';

import Template01 from './01-classic-ats/Template';
import Template02 from './02-modern-minimalist/Template';
import Template03 from './03-two-column-sidebar/Template';
import Template04 from './04-executive-bold-header/Template';
import Template05 from './05-functional-skills-first/Template';
import Template06 from './06-combination-hybrid/Template';
import Template07 from './07-technical-monospace-accent/Template';
import Template08 from './08-academic-cv/Template';
import Template09 from './09-compact-dense/Template';
import Template10 from './10-timeline-visual/Template';
import Template11 from './11-banner-header-accent-bar/Template';
import Template12 from './12-elegant-serif-traditional/Template';
import Template13 from './13-startup-modern-casual/Template';
import Template14 from './14-government-federal-plain/Template';
import Template15 from './15-consulting-metrics-forward/Template';
import Template16 from './16-healthcare-clinical/Template';
import Template17 from './17-creative-portfolio-lean/Template';
import Template18 from './18-sales-marketing-kpi-forward/Template';
import Template19 from './19-entry-level-recent-grad/Template';
import Template20 from './20-two-tone-modern-header/Template';

export interface ResumeTemplateDefinition {
  id: string;
  label: string;
  description: string;
  atsWarning?: string;
  component: ComponentType<{ data: ResumeData }>;
}

export const TEMPLATES: ResumeTemplateDefinition[] = [
  {
    id: 'classic-ats',
    label: 'Classic Single-Column ATS',
    description: 'The safest, most traditional format — single column, minimal styling.',
    component: Template01,
  },
  {
    id: 'modern-minimalist',
    label: 'Modern Minimalist',
    description: 'Clean sans-serif with generous whitespace and understated color.',
    component: Template02,
  },
  {
    id: 'two-column-sidebar',
    label: 'Two-Column Sidebar',
    description: 'Skills, contact, and education in a sidebar beside your experience.',
    atsWarning: 'Some ATS parsers struggle with multi-column layouts.',
    component: Template03,
  },
  {
    id: 'executive-bold-header',
    label: 'Executive Bold Header',
    description: 'A bold, business-forward header band with a career-progression focus.',
    component: Template04,
  },
  {
    id: 'functional-skills-first',
    label: 'Functional Skills-First',
    description: 'Leads with skills before work history — good for career changers.',
    component: Template05,
  },
  {
    id: 'combination-hybrid',
    label: 'Combination / Hybrid',
    description: 'Balances a skills summary with a full chronological work history.',
    component: Template06,
  },
  {
    id: 'technical-monospace-accent',
    label: 'Technical Monospace-Accent',
    description: 'A subtle code-inspired aesthetic for engineering and technical roles.',
    component: Template07,
  },
  {
    id: 'academic-cv',
    label: 'Academic CV Style',
    description: 'Formal and education-forward, with credentials listed before experience.',
    component: Template08,
  },
  {
    id: 'compact-dense',
    label: 'Compact Dense',
    description: 'Tighter spacing and smaller type to fit more experience on one page.',
    component: Template09,
  },
  {
    id: 'timeline-visual',
    label: 'Timeline Visual',
    description: 'A vertical timeline treatment for your work history.',
    component: Template10,
  },
  {
    id: 'banner-header-accent-bar',
    label: 'Banner Header Accent Bar',
    description: 'A full-width color band behind your name and title.',
    component: Template11,
  },
  {
    id: 'elegant-serif-traditional',
    label: 'Elegant Serif Traditional',
    description: 'A refined, formal serif design suited to law, finance, and academia.',
    component: Template12,
  },
  {
    id: 'startup-modern-casual',
    label: 'Startup Modern Casual',
    description: 'Friendly and approachable, with rounded accents and a warm palette.',
    component: Template13,
  },
  {
    id: 'government-federal-plain',
    label: 'Government / Federal Plain',
    description: 'Maximally plain and detailed, following federal-resume conventions.',
    component: Template14,
  },
  {
    id: 'consulting-metrics-forward',
    label: 'Consulting Metrics-Forward',
    description: 'Confident, bold styling that puts your impact bullets front and center.',
    component: Template15,
  },
  {
    id: 'healthcare-clinical',
    label: 'Healthcare / Clinical',
    description: 'A clean, trustworthy design that gives licensure and certifications priority.',
    component: Template16,
  },
  {
    id: 'creative-portfolio-lean',
    label: 'Creative Portfolio-Lean',
    description: 'Bolder color and personality for design, creative, and marketing roles.',
    atsWarning: 'Heavier styling may not parse cleanly on every ATS.',
    component: Template17,
  },
  {
    id: 'sales-marketing-kpi-forward',
    label: 'Sales / Marketing KPI-Forward',
    description: 'An energetic, results-oriented design built to highlight your numbers.',
    component: Template18,
  },
  {
    id: 'entry-level-recent-grad',
    label: 'Entry-Level / Recent Grad',
    description: 'Leads with education — ideal when your degree outweighs work history.',
    component: Template19,
  },
  {
    id: 'two-tone-modern-header',
    label: 'Two-Tone Modern Header',
    description: 'A modern single-column design with a distinctive two-tone header.',
    component: Template20,
  },
];

export function getTemplateById(id: string): ResumeTemplateDefinition | undefined {
  return TEMPLATES.find((template) => template.id === id);
}
