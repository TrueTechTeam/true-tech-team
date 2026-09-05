import { runAgentLoop } from '@true-tech-team/agent-kit';
import type { ResumeData, ResumeCritique } from './types';

const RESUME_DATA_SHAPE = `{
  "profile": {
    "name": "string",
    "title": "string",
    "phone": "string",
    "email": "string",
    "location": "string",
    "linkedin": "string (optional)",
    "website": "string (optional)"
  },
  "summary": "string",
  "skills": [
    { "category": "string", "items": ["string", ...] }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["string", ...]
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "location": "string (optional)",
      "startDate": "string (optional)",
      "endDate": "string (optional)"
    }
  ],
  "certifications": [
    { "title": "string", "issuer": "string", "date": "string (optional)" }
  ]
}`;

// Only requested when parsing an uploaded resume (see buildFillSystemPrompt)
// — gives the user a starting point for their Job Search preferences
// without them having to fill out Settings from scratch. Embedded as a bonus
// top-level key alongside the normal resume-json fields, not nested under
// them, so parseResult's plain `json as ResumeData` cast is unaffected.
const SEARCH_PREFERENCES_SHAPE = `{
    "targetTitle": "string — 1-3 job titles this candidate should search for, comma-separated (e.g. \\"Senior Software Engineer, Staff Engineer\\")",
    "industry": "string (optional) — the industry this candidate's experience is in",
    "experienceLevel": "one of: \\"entry\\", \\"mid\\", \\"senior\\", \\"lead\\" — based on years of experience and seniority of titles/responsibilities actually shown",
    "skillsFocus": "string (optional) — comma-separated key skills to emphasize when matching jobs"
  }`;

const CRITIQUE_SHAPE = `{
  "overallScore": number (0-100),
  "strengths": ["string", ...],
  "weaknesses": ["string", ...],
  "suggestions": ["string", ...],
  "keywordGaps": ["string", ...] (optional, only if a target job description was provided)
}`;

// ---- System prompt builders ----

export interface BuildFillPromptOptions {
  uploadedText?: string;
  targetJobDescription?: string;
  existingDraft?: ResumeData;
  freeformNotes?: string;
}

export function buildFillSystemPrompt(opts: BuildFillPromptOptions): string {
  const { uploadedText, targetJobDescription, existingDraft, freeformNotes } = opts;

  const parts: string[] = [
    'You are a professional resume-writing assistant. Your job is to produce a single, well-structured resume as JSON matching an exact schema.',
    '',
    '## Ground rules',
    '- NEVER invent employers, job titles, dates, schools, or accomplishments that are not supported by the source material given to you below.',
    '- It is fine to rephrase, tighten, reorganize, and improve the wording of real content, and to infer obviously-implied structure (e.g. splitting a skills paragraph into categorized groups).',
    '- Write resume bullets in strong, concise, results-oriented language (action verb first; quantify impact where the source material supports it). Do not fabricate numbers/metrics that are not present or clearly implied in the source.',
    '- If information for an optional field is genuinely not available, omit it (for optional fields) or use an empty string (for required string fields) rather than inventing a placeholder.',
  ];

  if (uploadedText) {
    parts.push(
      '',
      '## Source: an uploaded resume was parsed to this raw text',
      "Extract and restructure this real person's actual resume content into the required JSON shape. Every fact (employers, dates, schools, skills, bullets) must come from this text — do not add experience or education that is not present here.",
      '```',
      uploadedText,
      '```',
      '',
      '## Also infer a starting point for Job Search preferences',
      "Based solely on this resume's real content, infer reasonable Job Search preferences for this candidate (see `suggestedSearchPreferences` in the output format below). This is a starting point the candidate can edit, not a locked-in answer — when genuinely unsure, prefer a broader/more general value over guessing something narrow and possibly wrong."
    );
  } else if (existingDraft) {
    parts.push(
      '',
      '## Source: an in-progress draft the user has already started',
      'Improve and complete this draft. Fill gaps sensibly (e.g. write a summary if missing, flesh out thin bullets, organize skills into clear categories), but do not remove or contradict real content the user already entered, and do not invent entirely new employers/schools that are not implied by what is here.',
      '```json',
      JSON.stringify(existingDraft, null, 2),
      '```'
    );
  } else {
    parts.push(
      '',
      '## Source',
      'No uploaded resume or existing draft was provided. Work only from the freeform notes below (if any); leave fields you have no basis for as empty strings/arrays rather than fabricating content.'
    );
  }

  if (freeformNotes) {
    parts.push(
      '',
      '## Additional notes from the user',
      'Incorporate this additional context (it may add detail, correct something, or describe things not present in the source above):',
      '```',
      freeformNotes,
      '```'
    );
  }

  if (targetJobDescription) {
    parts.push(
      '',
      '## Target job — tailor toward this without inventing false experience',
      "Tailor the summary, the ordering/emphasis of skills, and the emphasis of experience bullets toward the job description below. You may reorder and re-emphasize real accomplishments to highlight relevance, and adjust word choice to mirror the job's terminology where it genuinely matches the candidate's real background. Do NOT add skills, tools, or experience the candidate does not actually have.",
      '```',
      targetJobDescription,
      '```'
    );
  }

  const outputShape = uploadedText
    ? `${RESUME_DATA_SHAPE.slice(0, -1)},\n  "suggestedSearchPreferences": ${SEARCH_PREFERENCES_SHAPE}\n}`
    : RESUME_DATA_SHAPE;

  parts.push(
    '',
    '## Output format',
    uploadedText
      ? 'Respond with ONLY a single fenced code block tagged `resume-json` containing a JSON object matching EXACTLY this shape, including the `suggestedSearchPreferences` key (no extra top-level fields beyond what is shown, no commentary before or after the fence):'
      : 'Respond with ONLY a single fenced code block tagged `resume-json` containing a JSON object matching EXACTLY this shape (no extra top-level fields, no commentary before or after the fence):',
    '```resume-json',
    outputShape,
    '```'
  );

  return parts.join('\n');
}

export function buildCritiqueSystemPrompt(
  resumeData: ResumeData,
  targetJobDescription?: string
): string {
  const parts: string[] = [
    'You are a resume-critique specialist with deep expertise in both applicant tracking systems (ATS) and how human recruiters actually scan resumes. Your job is to give direct, specific, actionable feedback — not generic platitudes.',
    '',
    '## Resume to review',
    '```json',
    JSON.stringify(resumeData, null, 2),
    '```',
  ];

  if (targetJobDescription) {
    parts.push(
      '',
      '## Target job description',
      'Evaluate the resume specifically against this target role — call out missing keywords/skills an ATS or recruiter would expect for this job, and note where the resume already aligns well.',
      '```',
      targetJobDescription,
      '```'
    );
  }

  parts.push(
    '',
    '## What to evaluate',
    '- Clarity and impact of the professional summary.',
    '- Whether experience bullets lead with strong action verbs and quantify impact where possible.',
    '- Whether skills are well-organized and relevant.',
    '- Structural/formatting issues that would hurt ATS parsing or recruiter skimming (e.g. missing dates, vague titles, wall-of-text bullets).',
    '- Overall competitiveness for the stated (or an implied general professional) target.',
    targetJobDescription
      ? '- Specific keyword/skill gaps versus the target job description.'
      : '- Note: no target job description was provided, so omit `keywordGaps` entirely.',
    '',
    '## Output format',
    'Respond with ONLY a single fenced code block tagged `critique-json` containing a JSON object matching EXACTLY this shape (no extra top-level fields, no commentary before or after the fence):',
    '```critique-json',
    CRITIQUE_SHAPE,
    '```'
  );

  return parts.join('\n');
}

// ---- Core agent runners ----
// Both agents are pure single-turn structured-JSON generators: no tools, no
// tool-use loop iterations expected (the model answers directly on the first
// turn with stop_reason 'end_turn'). agent-kit's runAgentLoop handles that
// case fine with an empty tools/toolExecutors set.

export function runResumeFillAgent(opts: BuildFillPromptOptions, apiKey: string) {
  return runAgentLoop<ResumeData>({
    apiKey,
    model: 'claude-opus-4-5',
    systemPrompt: buildFillSystemPrompt(opts),
    tools: [],
    toolExecutors: {},
    initialMessage: 'Generate the structured resume JSON now.',
    resultFenceTag: 'resume-json',
    parseResult: (json) => json as ResumeData,
  });
}

export function runResumeCritiqueAgent(
  resumeData: ResumeData,
  targetJobDescription: string | undefined,
  apiKey: string
) {
  return runAgentLoop<ResumeCritique>({
    apiKey,
    model: 'claude-opus-4-5',
    systemPrompt: buildCritiqueSystemPrompt(resumeData, targetJobDescription),
    tools: [],
    toolExecutors: {},
    initialMessage: 'Generate the structured critique JSON now.',
    resultFenceTag: 'critique-json',
    parseResult: (json) => json as ResumeCritique,
  });
}
