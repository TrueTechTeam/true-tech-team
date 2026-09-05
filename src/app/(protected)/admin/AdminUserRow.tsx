'use client';

import { useState } from 'react';
import { Button, Badge, Tooltip } from '@true-tech-team/react-components';
import type { UsageStatus } from '@true-tech-team/project-gateway';
import { ConfirmDialog, AppIcon } from '@true-tech-team/dashboard-kit';
import AppAccessDialog from './AppAccessDialog';
import { APPS } from '../../../lib/apps/registry';
import styles from './admin.module.scss';

interface UserRow {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
}

interface Props {
  user: UserRow;
  isCurrentUser: boolean;
  isAdmin: boolean;
  grantedSlugs: Set<string>;
  usage: UsageStatus[];
  onToggleAdmin: () => Promise<void> | void;
  onSaveAppAccess: (slugs: string[]) => Promise<void> | void;
}

const TRUNCATE_AFTER = 3;

const USAGE_LABELS: Record<string, string> = {
  'job-search': 'Job Search',
  'resume-builder-fill': 'Resume Fill',
  'resume-builder-critique': 'Resume Critique',
  'resume-builder-customize': 'Resume Tailoring',
};

export default function AdminUserRow({
  user,
  isCurrentUser,
  isAdmin,
  grantedSlugs,
  usage,
  onToggleAdmin,
  onSaveAppAccess,
}: Props) {
  const [confirmAdminChange, setConfirmAdminChange] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);

  const name =
    user.first_name || user.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : (user.email ?? user.id);

  const grantedApps = APPS.filter((app) => grantedSlugs.has(app.slug));
  const visibleApps = grantedApps.slice(0, TRUNCATE_AFTER);
  const hiddenCount = grantedApps.length - visibleApps.length;

  return (
    <div className={styles.adminRow}>
      <div className={styles.adminUser}>
        <strong>{name}</strong>
        <span>{user.email}</span>
        {isCurrentUser && <em>(you)</em>}
      </div>

      <div className={styles.adminAccessSummary}>
        {grantedApps.length === 0 ? (
          <span className={styles.noAccess}>No app access granted</span>
        ) : (
          <Tooltip content={grantedApps.map((app) => app.label).join(', ')}>
            <div className={styles.appChips}>
              {visibleApps.map((app) => (
                <span key={app.slug} className={styles.appChip}>
                  <AppIcon icon={app.icon} accent={app.accent} size="sm" />
                  {app.label}
                </span>
              ))}
              {hiddenCount > 0 && <Badge variant="neutral">+{hiddenCount}</Badge>}
            </div>
          </Tooltip>
        )}

        {usage.length > 0 && (
          <p className={styles.usageSummary}>
            {usage
              .map((u) => `${USAGE_LABELS[u.appSlug] ?? u.appSlug} ${u.used}/${u.limit}`)
              .join(' · ')}
          </p>
        )}
      </div>

      <div className={styles.adminActions}>
        <Button
          variant={isAdmin ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setConfirmAdminChange(true)}
        >
          Admin
        </Button>
        <Button variant="outline" size="sm" onClick={() => setAccessDialogOpen(true)}>
          App Access
        </Button>
      </div>

      {confirmAdminChange && (
        <ConfirmDialog
          title={isAdmin ? 'Revoke admin access?' : 'Grant admin access?'}
          message={
            isAdmin
              ? `${name} will immediately lose the ability to manage roles and app access for every user, including their own.`
              : `${name} will be able to manage every user's role and app access — including granting or revoking admin for anyone, including you.`
          }
          confirmLabel={isAdmin ? 'Revoke' : 'Grant'}
          danger={isAdmin}
          onConfirm={async () => {
            setConfirmAdminChange(false);
            await onToggleAdmin();
          }}
          onCancel={() => setConfirmAdminChange(false)}
        />
      )}

      {accessDialogOpen && (
        <AppAccessDialog
          userName={name}
          initialSlugs={[...grantedSlugs]}
          onClose={() => setAccessDialogOpen(false)}
          onSave={async (slugs) => {
            await onSaveAppAccess(slugs);
            setAccessDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
