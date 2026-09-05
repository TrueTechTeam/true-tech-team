'use client';

import { Icon, type IconName } from '@true-tech-team/react-components';
import styles from './AppIcon.module.scss';

// Kept local rather than imported from the hub's app registry (src/lib/apps/registry.ts)
// so this package has no dependency back on the hub app — the registry's own AppAccent
// is a duplicate of this union, not a separate concept.
export type AppAccent =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

interface AppIconProps {
  icon: IconName;
  accent: AppAccent;
  size?: 'sm' | 'md';
  label?: string;
}

// A colored icon tile representing one app — used in the header switcher, the
// dashboard grid, and the admin panel's access chips so every surface shares
// the same identity per app. Colors mirror the token pairs the library's own
// Badge variants use, so this reads as part of the design system rather than
// a one-off.
export default function AppIcon({ icon, accent, size = 'md', label }: AppIconProps) {
  return (
    <span
      className={[styles.tile, styles[accent], styles[size]].join(' ')}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} />
    </span>
  );
}
