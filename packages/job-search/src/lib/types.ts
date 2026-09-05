import type { AgentStreamEvent } from '@true-tech-team/agent-kit';

// ---- Job Search Profile ----

export interface JobSearchProfile {
  id: string;
  userId: string;
  // Profile
  fullName: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  linkedinUrl: string | null;
  blogUrl: string | null;
  // Search preferences
  targetTitle: string | null;
  industry: string | null;
  orgTypes: string[];
  dreamCompanies: string | null;
  priorities: string[];
  searchLocation: string | null;
  workType: 'any' | 'remote' | 'hybrid' | 'onsite';
  willingToRelocate: boolean;
  salaryMin: string | null;
  salaryMax: string | null;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  skillsFocus: string | null;
  excitingWork: string | null;
  idealWorkday: string | null;
  careerGoal: string | null;
  avoidTypes: string | null;
  openPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobSearchProfilePayload {
  fullName?: string | null;
  title?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  blogUrl?: string | null;
  targetTitle?: string | null;
  industry?: string | null;
  orgTypes?: string[];
  dreamCompanies?: string | null;
  priorities?: string[];
  searchLocation?: string | null;
  workType?: 'any' | 'remote' | 'hybrid' | 'onsite';
  willingToRelocate?: boolean;
  salaryMin?: string | null;
  salaryMax?: string | null;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead';
  skillsFocus?: string | null;
  excitingWork?: string | null;
  idealWorkday?: string | null;
  careerGoal?: string | null;
  avoidTypes?: string | null;
  openPrompt?: string | null;
}

// ---- Job (suggestion produced by the agent, persisted to job_search_jobs) ----

export interface JobSearchJob {
  id: string;
  userId: string;
  status: 'suggested' | 'applied' | 'dismissed';
  title: string;
  company: string;
  companyWebsite: string | null;
  applicationUrl: string | null;
  description: string | null;
  location: string | null;
  workType: string | null;
  salary: string | null;
  matchScore: number | null;
  matchReason: string | null;
  foundDate: string;
  postedDate: string | null;
  createdAt: string;
  updatedAt: string;
  // Id of the resume_documents row tailored toward this job, if one has been
  // generated (see resume-builder/customize) — null otherwise. Not a column
  // on job_search_jobs itself; the /api/job-search/jobs route merges this in
  // from a separate resume_documents lookup after mapping.
  tailoredResumeId: string | null;
}

// ---- Application ----

export interface JobSearchApplication {
  id: string;
  userId: string;
  jobId: string;
  status: 'applied' | 'phone_screen' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  appliedDate: string | null;
  confirmationLink: string | null;
  contactPerson: string | null;
  salary: string | null;
  interviewDate: string | null;
  notes: string | null;
  removed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationPayload {
  jobId: string;
  appliedDate?: string | null;
  confirmationLink?: string | null;
  contactPerson?: string | null;
  salary?: string | null;
  notes?: string | null;
}

export interface UpdateApplicationPayload {
  status?: 'applied' | 'phone_screen' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  appliedDate?: string | null;
  confirmationLink?: string | null;
  contactPerson?: string | null;
  salary?: string | null;
  interviewDate?: string | null;
  notes?: string | null;
  removed?: boolean;
}

// ---- Structured result from the job-search agent ----

export interface JobsAgentResultJob {
  title: string;
  company: string;
  companyWebsite: string | null;
  applicationUrl: string | null;
  description: string | null;
  location: string | null;
  workType: string | null;
  salary: string | null;
  matchScore: number | null;
  matchReason: string | null;
  postedDate: string | null;
}

export interface JobsAgentResult {
  jobs: JobsAgentResultJob[];
  searchNotes: string;
}

// Job Search has no reason to rename agent-kit's generic `result` event the
// way recipes renamed it to `recipe` — the frontend NDJSON consumer can just
// look for `type: 'result'`.
export type JobSearchAgentStreamEvent = AgentStreamEvent<JobsAgentResult>;

// ---- DB row helpers ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProfileRow(row: Record<string, any>): JobSearchProfile {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    fullName: (row['full_name'] as string | null) ?? null,
    title: (row['title'] as string | null) ?? null,
    phone: (row['phone'] as string | null) ?? null,
    email: (row['email'] as string | null) ?? null,
    location: (row['location'] as string | null) ?? null,
    linkedinUrl: (row['linkedin_url'] as string | null) ?? null,
    blogUrl: (row['blog_url'] as string | null) ?? null,
    targetTitle: (row['target_title'] as string | null) ?? null,
    industry: (row['industry'] as string | null) ?? null,
    orgTypes: (row['org_types'] as string[]) ?? [],
    dreamCompanies: (row['dream_companies'] as string | null) ?? null,
    priorities: (row['priorities'] as string[]) ?? [],
    searchLocation: (row['search_location'] as string | null) ?? null,
    workType: (row['work_type'] as JobSearchProfile['workType']) ?? 'any',
    willingToRelocate: (row['willing_to_relocate'] as boolean) ?? false,
    salaryMin: (row['salary_min'] as string | null) ?? null,
    salaryMax: (row['salary_max'] as string | null) ?? null,
    experienceLevel: (row['experience_level'] as JobSearchProfile['experienceLevel']) ?? 'mid',
    skillsFocus: (row['skills_focus'] as string | null) ?? null,
    excitingWork: (row['exciting_work'] as string | null) ?? null,
    idealWorkday: (row['ideal_workday'] as string | null) ?? null,
    careerGoal: (row['career_goal'] as string | null) ?? null,
    avoidTypes: (row['avoid_types'] as string | null) ?? null,
    openPrompt: (row['open_prompt'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapJobRow(row: Record<string, any>): JobSearchJob {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    status: row['status'] as JobSearchJob['status'],
    title: row['title'] as string,
    company: row['company'] as string,
    companyWebsite: (row['company_website'] as string | null) ?? null,
    applicationUrl: (row['application_url'] as string | null) ?? null,
    description: (row['description'] as string | null) ?? null,
    location: (row['location'] as string | null) ?? null,
    workType: (row['work_type'] as string | null) ?? null,
    salary: (row['salary'] as string | null) ?? null,
    matchScore: (row['match_score'] as number | null) ?? null,
    matchReason: (row['match_reason'] as string | null) ?? null,
    foundDate: row['found_date'] as string,
    postedDate: (row['posted_date'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
    // Merged in by the /api/job-search/jobs route after mapping — defaults
    // to null here since it isn't a column on job_search_jobs.
    tailoredResumeId: null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapApplicationRow(row: Record<string, any>): JobSearchApplication {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    jobId: row['job_id'] as string,
    status: row['status'] as JobSearchApplication['status'],
    appliedDate: (row['applied_date'] as string | null) ?? null,
    confirmationLink: (row['confirmation_link'] as string | null) ?? null,
    contactPerson: (row['contact_person'] as string | null) ?? null,
    salary: (row['salary'] as string | null) ?? null,
    interviewDate: (row['interview_date'] as string | null) ?? null,
    notes: (row['notes'] as string | null) ?? null,
    removed: (row['removed'] as boolean) ?? false,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}
