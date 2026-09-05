// Composes job title/company/description into a single block of tailoring
// context for the fill/critique agents. Shared by the Job Search deep-link
// ("Create a tailored resume for this job") and the resume-builder/customize
// route, so both compose the same agent-facing text from the same job fields.
export function composeTargetJobDescription(
  jobTitle?: string | null,
  company?: string | null,
  jobDescription?: string | null
): string | undefined {
  const heading = [jobTitle, company].filter(Boolean).join(' at ');
  const parts = [heading, jobDescription].filter((part) => part && part.trim());
  return parts.length > 0 ? parts.join('\n\n') : undefined;
}
