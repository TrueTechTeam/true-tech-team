'use client';

import type { ReactNode } from 'react';
import styles from './MiniAppHeader.module.scss';

export interface MiniAppNavItem {
  id: string;
  label: string;
}

interface MiniAppHeaderProps {
  title: string;
  navItems?: MiniAppNavItem[];
  activeNavId?: string;
  onNavChange?: (id: string) => void;
  actions?: ReactNode;
}

// One consistent header for every mini-app: title + right-aligned actions on
// top, an optional row of view-switching nav buttons below. This replaces
// the old pattern of a desktop tab bar plus a separate mobile bottom-icon
// nav — a single markup tree that stays responsive via CSS (the nav row
// scrolls horizontally on narrow screens) instead of branching in JS.
export default function MiniAppHeader({
  title,
  navItems,
  activeNavId,
  onNavChange,
  actions,
}: MiniAppHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.topRow}>
        <h1 className={styles.title}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {navItems && navItems.length > 0 && (
        <nav className={styles.nav} aria-label={`${title} sections`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={[styles.navItem, item.id === activeNavId ? styles.navItemActive : '']
                .join(' ')
                .trim()}
              onClick={() => onNavChange?.(item.id)}
              aria-current={item.id === activeNavId ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
