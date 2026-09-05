import type { ResumeData, ResumeDataWithSuggestions } from '../resume-builder/lib/types';
import type { JobSearchProfilePayload } from './types';

type ImportedProfileFields = Pick<
  JobSearchProfilePayload,
  'fullName' | 'title' | 'phone' | 'email' | 'location' | 'linkedinUrl' | 'blogUrl'
>;

// Maps a parsed resume's profile block onto the subset of Job Search profile
// fields it can actually inform. Shared by the Job Search profile dialog's
// "Import from Resume" section and the Resume Builder Content step's
// configure-a-profile-if-none-exists flow — both parse a resume through the
// same agent (see ResumeUploadParse / /api/resume-builder/upload) and need
// the same resume-shape-to-profile-shape mapping.
export function mapResumeDataToProfilePayload(data: ResumeData): ImportedProfileFields {
  const profile = data.profile;
  return {
    fullName: profile.name || null,
    title: profile.title || null,
    phone: profile.phone || null,
    email: profile.email || null,
    location: profile.location || null,
    linkedinUrl: profile.linkedin || null,
    blogUrl: profile.website || null,
  };
}

type SuggestedSearchPreferenceFields = Partial<
  Pick<JobSearchProfilePayload, 'targetTitle' | 'industry' | 'experienceLevel' | 'skillsFocus'>
>;

// Reads the fill agent's bonus `suggestedSearchPreferences` field (only
// present when it parsed an uploaded resume — see agent.ts's
// buildFillSystemPrompt) into a starting point for the Job Search
// preferences fields. Only includes keys the agent actually suggested, so
// callers can spread this over their own defaults without clobbering them
// with `undefined`.
export function mapSuggestedSearchPreferences(
  data: ResumeDataWithSuggestions
): SuggestedSearchPreferenceFields {
  const suggestions = data.suggestedSearchPreferences;
  if (!suggestions) {
    return {};
  }
  const result: SuggestedSearchPreferenceFields = {};
  if (suggestions.targetTitle) {
    result.targetTitle = suggestions.targetTitle;
  }
  if (suggestions.industry) {
    result.industry = suggestions.industry;
  }
  if (suggestions.experienceLevel) {
    result.experienceLevel = suggestions.experienceLevel;
  }
  if (suggestions.skillsFocus) {
    result.skillsFocus = suggestions.skillsFocus;
  }
  return result;
}
