import type { PortfolioPage } from '../schema/types';
import { NavBar } from './NavBar';
import { SectionRenderer } from './SectionRenderer';

export function PageRenderer({ page }: { page: PortfolioPage }) {
  return (
    <div>
      {page.showNav ? <NavBar title={page.title} sections={page.sections} /> : null}
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}
