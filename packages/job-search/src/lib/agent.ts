import type Anthropic from '@anthropic-ai/sdk';
import { runAgentLoop } from '@true-tech-team/agent-kit';
import type { JobSearchProfile, JobsAgentResult, JobSearchAgentStreamEvent } from './types';

// ---- Tool definitions ----

// Native/server-executed tool — Anthropic resolves search results itself.
// No toolExecutors entry is needed (see agent-kit's loop.ts).
//
// max_uses caps how many searches the model can run *within a single API
// request* — without it, a request that uses this tool has no ceiling on
// real-world search time, since each search happens server-side before
// Anthropic ever returns control to us (our own maxIterations only bounds
// the number of round-trip API calls, not searches run inside one of them).
// A prior version relied on the system prompt alone ("as many times as
// needed") to bound this, which the model isn't required to honor — real
// searches ran long enough that requests appeared to hang indefinitely.
const MAX_WEB_SEARCHES_PER_REQUEST = 10;

export const JOB_SEARCH_TOOLS: Anthropic.ToolUnion[] = [
  { type: 'web_search_20250305', name: 'web_search', max_uses: MAX_WEB_SEARCHES_PER_REQUEST },
];

// ---- System prompt builder ----

export function buildJobSearchSystemPrompt(
  profile: JobSearchProfile,
  excludeUrls: string[]
): string {
  const parts: string[] = [
    'You are a job-search specialist. Your job is to find real, currently-open job postings on the internet that match this candidate profile, using the web_search tool.',
    '',
    '## How to work',
    `1. Use web_search up to ${MAX_WEB_SEARCHES_PER_REQUEST} times to find candidate job postings — vary your queries (exact target title, close synonyms, target title + location, target title + company names). Stop searching once you have enough strong candidates rather than using every search available.`,
    "2. Prefer real, currently-open postings with a working application URL. Prioritize direct company career pages (e.g. a company's own /careers or Greenhouse/Lever/Workday listing) over aggregator sites (LinkedIn, Indeed, ZipRecruiter, Glassdoor) when a direct posting can be found — aggregator links are acceptable as a fallback.",
    '3. For each job you include, assign a matchScore from 0-100 reflecting how well it fits the candidate profile below, and a short matchReason explaining the score.',
    '4. Return up to 10 jobs (fewer if genuinely not available — never pad the list with weak or irrelevant matches just to reach 10).',
    '5. Do not include any job whose application URL appears in the exclusion list below — the candidate has already seen it.',
  ];

  parts.push('', '## Candidate profile');

  if (profile.targetTitle) {
    parts.push(`- **Target title(s)**: ${profile.targetTitle}`);
  }
  if (profile.industry) {
    parts.push(`- **Industry**: ${profile.industry}`);
  }
  if (profile.experienceLevel) {
    parts.push(`- **Experience level**: ${profile.experienceLevel}`);
  }
  if (profile.searchLocation || profile.willingToRelocate) {
    const relocate = profile.willingToRelocate ? 'willing to relocate' : 'not willing to relocate';
    parts.push(`- **Location**: ${profile.searchLocation ?? 'not specified'} (${relocate})`);
  }
  if (profile.workType && profile.workType !== 'any') {
    parts.push(`- **Work type**: ${profile.workType}`);
  }
  if (profile.salaryMin || profile.salaryMax) {
    parts.push(
      `- **Target salary range**: ${profile.salaryMin ?? '?'} - ${profile.salaryMax ?? '?'}`
    );
  }
  if (profile.orgTypes.length) {
    parts.push(`- **Preferred organization types**: ${profile.orgTypes.join(', ')}`);
  }
  if (profile.dreamCompanies) {
    parts.push(`- **Dream companies**: ${profile.dreamCompanies}`);
    parts.push('  → Search directly for openings at these companies as one of your queries.');
  }
  if (profile.priorities.length) {
    parts.push(`- **Priorities**: ${profile.priorities.join(', ')}`);
  }
  if (profile.skillsFocus) {
    parts.push(`- **Skills to focus on**: ${profile.skillsFocus}`);
  }
  if (profile.excitingWork) {
    parts.push(`- **What excites them about work**: ${profile.excitingWork}`);
  }
  if (profile.idealWorkday) {
    parts.push(`- **Ideal workday**: ${profile.idealWorkday}`);
  }
  if (profile.careerGoal) {
    parts.push(`- **Career goal**: ${profile.careerGoal}`);
  }
  if (profile.avoidTypes) {
    parts.push(`- **Roles/companies to avoid**: ${profile.avoidTypes}`);
    parts.push('  → Do not return anything matching this description.');
  }
  if (profile.openPrompt) {
    parts.push(`- **Additional criteria (candidate's own words)**: ${profile.openPrompt}`);
  }

  if (excludeUrls.length) {
    parts.push('', '## Exclude — already seen, do not return these application URLs again');
    for (const url of excludeUrls) {
      parts.push(`- ${url}`);
    }
  }

  parts.push(
    '',
    '## Output format',
    'When you are done searching, output ONLY a JSON object — no markdown, no prose before or after it — in a fenced code block tagged `jobs-json`:',
    '```jobs-json',
    '{',
    '  "jobs": [',
    '    {',
    '      "title": "string",',
    '      "company": "string",',
    '      "companyWebsite": "string | null",',
    '      "applicationUrl": "string | null",',
    '      "description": "string | null",',
    '      "location": "string | null",',
    '      "workType": "string | null",',
    '      "salary": "string | null",',
    '      "matchScore": number,',
    '      "matchReason": "string | null",',
    '      "postedDate": "string | null"',
    '    }',
    '  ],',
    '  "searchNotes": "string"',
    '}',
    '```',
    'searchNotes should be 1-3 sentences summarizing your search strategy and any tradeoffs (e.g. "Focused on remote GIS analyst roles; few direct-apply postings found for dream companies, so aggregator links were used for those.").'
  );

  return parts.join('\n');
}

// ---- Core agent runner ----

// Job Search has no reason to rename agent-kit's generic `result` event —
// forward the loop's events straight through.
export function runJobSearchAgent(
  profile: JobSearchProfile,
  excludeUrls: string[],
  apiKey: string
): AsyncGenerator<JobSearchAgentStreamEvent> {
  return runAgentLoop<JobsAgentResult>({
    apiKey,
    model: 'claude-opus-4-5',
    systemPrompt: buildJobSearchSystemPrompt(profile, excludeUrls),
    tools: JOB_SEARCH_TOOLS,
    toolExecutors: {},
    initialMessage: 'Search for jobs matching my profile.',
    resultFenceTag: 'jobs-json',
    parseResult: (json) => json as JobsAgentResult,
    // Each iteration can now run up to MAX_WEB_SEARCHES_PER_REQUEST real
    // searches server-side before returning — allow generous per-request
    // time, but fail fast rather than relying solely on the platform's own
    // function timeout (which, on a dropped connection, previously left the
    // client's UI stuck in "loading" forever — see useAgentStream.ts).
    timeoutMs: 90_000,
    maxTotalDurationMs: 4 * 60_000,
  });
}
