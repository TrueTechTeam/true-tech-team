'use client';

import type { MouseEvent } from 'react';
import { Navbar, NavbarBrand, NavbarNav, NavLink } from '@true-tech-team/react-components';
import type { PageSection } from '../schema/types';

function scrollToSection(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
  event.preventDefault();
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
  window.history.pushState(null, '', `#${sectionId}`);
}

export interface NavBarProps {
  title: string;
  sections: PageSection[];
}

export function NavBar({ title, sections }: NavBarProps) {
  const navSections = sections.filter((section) => section.showInNav);
  return (
    <Navbar>
      <NavbarBrand>{title}</NavbarBrand>
      <NavbarNav>
        {navSections.map((section) => (
          <NavLink
            key={section.id}
            href={`#${section.id}`}
            onClick={(event) => scrollToSection(event, section.id)}
          >
            {section.name}
          </NavLink>
        ))}
      </NavbarNav>
    </Navbar>
  );
}
