import type { PortfolioPage } from '../schema/types';
import { sectionAnchors } from './anchors';
import { SectionRenderer } from './SectionRenderer';

export function PageRenderer({ page }: { page: PortfolioPage }) {
  const anchors = sectionAnchors(page.sections);
  return (
    <div>
      {page.sections.map((section, index) => (
        <SectionRenderer
          key={section.id}
          section={section}
          page={page}
          anchors={anchors}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}
