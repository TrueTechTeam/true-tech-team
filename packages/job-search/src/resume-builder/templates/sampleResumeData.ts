import type { ResumeData } from '../lib/types';

// A realistic, fully-populated resume used only to preview what a template's
// layout/style looks like before picking it (see TemplateStep's "Preview"
// action) — never persisted or shown to end users as real data.
export const SAMPLE_RESUME_DATA: ResumeData = {
  profile: {
    name: 'Jordan Rivera',
    title: 'Senior Product Manager',
    phone: '(555) 123-4567',
    email: 'jordan.rivera@example.com',
    location: 'Austin, TX',
    linkedin: 'linkedin.com/in/jordanrivera',
    website: 'jordanrivera.dev',
  },
  summary:
    'Product leader with 8+ years building and scaling B2B SaaS platforms. Known for turning ambiguous problems into shipped features that move revenue and retention.',
  skills: [
    { category: 'Product', items: ['Roadmapping', 'A/B Testing', 'User Research', 'SQL'] },
    { category: 'Tools', items: ['Jira', 'Figma', 'Amplitude', 'Looker'] },
  ],
  experience: [
    {
      company: 'Northwind Analytics',
      role: 'Senior Product Manager',
      location: 'Austin, TX',
      startDate: '2021',
      endDate: 'Present',
      bullets: [
        'Led a cross-functional team of 12 to launch a self-serve onboarding flow, cutting time-to-value from 14 days to 2.',
        'Grew monthly active accounts 34% year-over-year by prioritizing a data-backed pricing overhaul.',
      ],
    },
    {
      company: 'Bluecrest Software',
      role: 'Product Manager',
      location: 'Remote',
      startDate: '2018',
      endDate: '2021',
      bullets: [
        'Shipped a reporting dashboard adopted by 70% of enterprise customers within two quarters.',
        'Partnered with sales and support to reduce churn 18% by closing the top three requested feature gaps.',
      ],
    },
  ],
  education: [
    {
      school: 'University of Texas at Austin',
      degree: 'B.B.A. in Business Analytics',
      location: 'Austin, TX',
      startDate: '2012',
      endDate: '2016',
    },
  ],
  certifications: [
    { title: 'Certified Scrum Product Owner', issuer: 'Scrum Alliance', date: '2019' },
  ],
};
