import type { ReactElement } from 'react';
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

export interface SectionTypeEntry {
  component: (props: SectionComponentProps) => ReactElement | null;
  /** Human label for the editor's section catalog, e.g. "Photo Gallery". */
  label: string;
  /** The type's limited configurable properties and its editable content. */
  propertySchema: PropertySchema;
  defaultProps: Record<string, unknown>;
  /** Per-type CSS min-height, applied by the section shell. */
  minHeight: string;
  /** When true, a page may contain at most one section of this type. */
  singleton?: boolean;
}
