import { slugify } from '../pages/slug';

/**
 * Maps section id -> URL-fragment anchor, derived from section names.
 *
 * Both `NavbarSection`'s link targets and `SectionRenderer`'s element ids read from this one map
 * (computed once in `PageRenderer`) so a link and its target cannot drift apart.
 *
 * Typed structurally rather than against `PageSection` so it depends on nothing but the two
 * fields it actually reads.
 */
export function sectionAnchors(sections: Array<{ id: string; name: string }>): Map<string, string> {
  const used = new Set<string>();
  const anchors = new Map<string, string>();

  sections.forEach((section, index) => {
    // `slugify` strips every non-alphanumeric character, so a name like "!!!" or "   " yields an
    // empty string - which would render href="#" and break getElementById. Fall back to the
    // section's position, mirroring how `generateUniqueSlug` falls back to 'page'.
    const base = slugify(section.name) || `section-${index + 1}`;
    let anchor = base;
    let suffix = 2;
    while (used.has(anchor)) {
      anchor = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(anchor);
    anchors.set(section.id, anchor);
  });

  return anchors;
}
