'use client';

import type { MouseEvent } from 'react';
import { Navbar, NavbarBrand, NavbarNav, NavLink } from '@true-tech-team/react-components';
import type { SectionComponentProps, SectionTypeEntry } from '../types';

function scrollToAnchor(event: MouseEvent<HTMLAnchorElement>, anchor: string) {
  event.preventDefault();
  const target = document.getElementById(anchor);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
  window.history.pushState(null, '', `#${anchor}`);
}

export function NavbarSection({ section, page, anchors }: SectionComponentProps) {
  // Review Focus 1: `brand` may be missing entirely from hand-edited JSON. Fall back to the
  // page title rather than rendering an empty brand.
  const brand =
    typeof section.props.brand === 'string' && section.props.brand.trim().length > 0
      ? section.props.brand
      : page.title;
  const sticky = section.props.sticky !== false;

  // Review Focus 3: a page whose only section is this navbar yields an empty link list, which
  // must render as a bar with no links rather than throwing.
  const links = page.sections.filter(
    (candidate) => candidate.showInNav && candidate.id !== section.id
  );

  // The library's `Navbar` owns stickiness natively via its `position` prop
  // ('fixed' | 'sticky' | 'static'), which it renders as `data-position` and styles with
  // `position: sticky; top: 0`. No local sticky wrapper is needed.
  return (
    <Navbar position={sticky ? 'sticky' : 'static'}>
      <NavbarBrand>{brand}</NavbarBrand>
      <NavbarNav>
        {links.map((candidate) => {
          const anchor = anchors.get(candidate.id) ?? candidate.id;
          return (
            <NavLink
              key={candidate.id}
              href={`#${anchor}`}
              onClick={(event) => scrollToAnchor(event, anchor)}
            >
              {candidate.name}
            </NavLink>
          );
        })}
      </NavbarNav>
    </Navbar>
  );
}

export const navbarSectionEntry: SectionTypeEntry = {
  component: NavbarSection,
  label: 'Navigation Bar',
  propertySchema: [
    { key: 'brand', label: 'Brand Text', type: 'text' },
    { key: 'sticky', label: 'Stick to top on scroll', type: 'boolean' },
  ],
  defaultProps: { brand: '', sticky: true },
  minHeight: '0',
  singleton: true,
};
