import type { ResumeSkillGroup } from '../../lib/types';

// Renders a start/end date pair the way every template's experience and
// education entries display them, e.g. "Nov 2024 – Present".
export function formatDateRange(startDate?: string, endDate?: string): string {
  if (startDate && endDate) {
    return `${startDate} – ${endDate}`;
  }
  return startDate || endDate || '';
}

// Joins one skill category's items into a single display line, e.g.
// "ArcGIS Pro, ArcMap, Python (ArcPy)".
export function skillGroupLine(group: ResumeSkillGroup): string {
  return group.items.join(', ');
}
