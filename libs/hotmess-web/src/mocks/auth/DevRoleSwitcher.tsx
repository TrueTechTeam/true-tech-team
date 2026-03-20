import { useState } from 'react';
import { UserRole } from '@true-tech-team/hotmess-types';
import { useMockAuth } from './MockAuthProvider';
import styles from './DevRoleSwitcher.module.scss';

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Commissioner]: 'Commissioner',
  [UserRole.Manager]: 'Manager',
  [UserRole.Referee]: 'Referee',
  [UserRole.TeamCaptain]: 'Captain',
  [UserRole.Player]: 'Player',
};

const ROLE_ORDER: UserRole[] = [
  UserRole.Admin,
  UserRole.Commissioner,
  UserRole.Manager,
  UserRole.Referee,
  UserRole.TeamCaptain,
  UserRole.Player,
];

export function DevRoleSwitcher() {
  const { role, setRole } = useMockAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.container}>
      <button
        className={styles.toggle}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Dev Role Switcher"
      >
        <span className={styles.badge}>DEV</span>
        <span className={styles.currentRole}>{ROLE_LABELS[role]}</span>
      </button>

      {isExpanded && (
        <div className={styles.panel}>
          <div className={styles.header}>Switch Role</div>
          {ROLE_ORDER.map((r) => (
            <button
              key={r}
              className={`${styles.roleButton} ${r === role ? styles.active : ''}`}
              onClick={() => {
                setRole(r);
                setIsExpanded(false);
              }}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
