import type { ComponentType } from 'react';
import type { PageSection, PortfolioPage } from '../schema/types';
import type { PropertySchema } from '../properties/types';

export interface SectionComponentProps {
  section: PageSection;
  /**
   * The whole page. Every section component receives it so the navbar can build its link list
   * from its siblings without being special-cased - the uniform-section model holds only if
   * nothing needs an escape hatch.
   */
  page: PortfolioPage;
  /** Section id -> anchor, computed once per page render by `PageRenderer`. */
  anchors: Map<string, string>;
}

/**
 * Everything about a section type except its component.
 *
 * Deliberately React-free and free of any `'use client'` dependency: `schema/validate.ts` needs
 * each type's `propertySchema` and `singleton` flag, and it must stay importable from server
 * code (and from `pages/crud.ts`) without dragging in the component layer. Keeping the
 * component out of this type is what makes that possible.
 *
 * Metadata must not import from `@true-tech-team/react-components` (or anything else that may be
 * a `'use client'` module); `schema/clientBoundary.test.ts` guards the relative-import closure.
 *
 * Any user-supplied URL a section renders as a link target must pass through `isSafeHref`
 * (`sections/safeHref.ts`); the contract, not the code, is what carries this across section types.
 */
export interface SectionTypeMeta {
  /** Human label for the editor's section catalog, e.g. "Photo Gallery". */
  label: string;
  /** The type's limited configurable properties and its editable content. */
  propertySchema: PropertySchema;
  defaultProps: Record<string, unknown>;
  /** Per-type CSS min-height, applied by the section shell. */
  minHeight: string;
  /** When true, a page may contain at most one section of this type. */
  singleton?: boolean;
  /**
   * Page chrome rather than page content: rendered in its normal position in `page.sections`
   * but WITHOUT the `<section>` shell.
   *
   * Two reasons the shell is wrong for chrome. `position: sticky` resolves against the nearest
   * scrolling ancestor's containing block, so a sticky navbar wrapped in a short `<section>`
   * unsticks as soon as that element scrolls past - it must be a direct child of the page
   * container to stick across the whole page. And `<header role="banner">` must not be nested
   * inside `<section role="region">`.
   *
   * A chrome section is still a full section: present in `sections[]`, named, reorderable,
   * removable and configurable. Only its wrapper differs.
   */
  chrome?: boolean;
}

export interface SectionTypeEntry extends SectionTypeMeta {
  component: ComponentType<SectionComponentProps>;
}
