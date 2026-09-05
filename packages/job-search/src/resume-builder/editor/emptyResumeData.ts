import type { ResumeData } from '../lib/types';

// Seed state for a brand-new resume draft — every field present (empty) so
// every form control below can stay a controlled component from first render.
export function createEmptyResumeData(): ResumeData {
  return {
    profile: {
      name: '',
      title: '',
      phone: '',
      email: '',
      location: '',
      linkedin: '',
      website: '',
    },
    summary: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
  };
}
