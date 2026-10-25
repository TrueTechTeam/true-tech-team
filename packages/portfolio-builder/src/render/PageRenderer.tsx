import type { PortfolioPage } from '../schema/types';
import { sectionAnchors } from './anchors';
import { SectionRenderer } from './SectionRenderer';

export function PageRenderer({ page }: { page: PortfolioPage }) {
  const anchors = sectionAnchors(page.sections);
  return (
    <div>
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} page={page} anchors={anchors} />
      ))}
    </div>
  );
}
