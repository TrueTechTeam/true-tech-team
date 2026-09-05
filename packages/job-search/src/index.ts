export { default as JobSearchHeader } from './JobSearchHeader';
export { default as JobSearchOverview } from './overview/JobSearchOverview';
export { JobSearchSearchProvider } from './JobSearchSearchContext';

export { JOB_SEARCH_TOOLS, buildJobSearchSystemPrompt, runJobSearchAgent } from './lib/agent';
export { mapResumeDataToProfilePayload, mapSuggestedSearchPreferences } from './lib/resumeImport';
export { mapProfileRow, mapJobRow, mapApplicationRow } from './lib/types';
export type {
  JobSearchProfile,
  JobSearchProfilePayload,
  JobSearchJob,
  JobSearchApplication,
  CreateApplicationPayload,
  UpdateApplicationPayload,
  JobsAgentResultJob,
  JobsAgentResult,
  JobSearchAgentStreamEvent,
} from './lib/types';

export { default as ResumeBuilderHome } from './resume-builder/ResumeBuilderHome';
export {
  TEMPLATES,
  getTemplateById,
  type ResumeTemplateDefinition,
} from './resume-builder/templates/registry';

export {
  buildFillSystemPrompt,
  buildCritiqueSystemPrompt,
  runResumeFillAgent,
  runResumeCritiqueAgent,
  type BuildFillPromptOptions,
} from './resume-builder/lib/agent';
export { composeTargetJobDescription } from './resume-builder/lib/jobContext';
export { extractTextFromUpload } from './resume-builder/lib/parse';
export { mapDocumentRow, mapCritiqueRow } from './resume-builder/lib/types';
export type {
  ResumeProfile,
  ResumeSkillGroup,
  ResumeExperienceEntry,
  ResumeEducationEntry,
  ResumeCertification,
  ResumeData,
  ResumeDataWithSuggestions,
  SuggestedSearchPreferences,
  ResumeDocument,
  ResumeCritique,
  ResumeCritiqueRecord,
  CreateDocumentPayload,
  UpdateDocumentPayload,
  ResumeFillStreamEvent,
  ResumeCritiqueStreamEvent,
  ResumeCustomizeStreamEvent,
} from './resume-builder/lib/types';
