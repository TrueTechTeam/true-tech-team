import { useRef } from 'react';

// None of skills/experience/education/bullets entries carry a stable id in
// the canonical ResumeData shape (lib/types.ts), but React list rendering
// still needs non-index keys (this repo's eslint config runs
// react/no-array-index-key as a warning, and `npm run lint` treats warnings
// as failures). This hook hands out a per-position synthetic id, reusing
// existing ids when a list's length is unchanged and only growing/shrinking
// the id list when entries are actually added or removed — so appending (the
// common case, via the "Add …" buttons) never disturbs existing rows'
// identity. Shared by ManualFillSection (skills/experience/education) and
// ExperienceEntryFields (bullets).
export function useStableKeys(length: number): string[] {
  const idsRef = useRef<string[]>([]);
  const counterRef = useRef(0);
  if (idsRef.current.length !== length) {
    const next = idsRef.current.slice(0, length);
    while (next.length < length) {
      next.push(`k${counterRef.current++}`);
    }
    idsRef.current = next;
  }
  return idsRef.current;
}
