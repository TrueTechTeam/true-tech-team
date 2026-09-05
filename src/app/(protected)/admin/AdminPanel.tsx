'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAppUsage, type UsageStatus } from '@true-tech-team/project-gateway';
import { createClient } from '../../../lib/supabase/client';
import AdminUserRow from './AdminUserRow';
import styles from './admin.module.scss';

interface UserRow {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
}

interface Props {
  currentUserId: string;
}

// Usage is tracked at a finer grain than access grants — e.g. Resume Builder
// has separate fill/critique/customize limits, all gated by the single
// "job-search" permission slug it now shares with Job Search (see
// supabase/008_merge_resume_builder_permission.sql). This maps a usage
// app_slug back to the access slug that gates it (identity if not listed).
const USAGE_TO_ACCESS_SLUG: Record<string, string> = {
  'job-search': 'job-search',
  'resume-builder-fill': 'job-search',
  'resume-builder-critique': 'job-search',
  'resume-builder-customize': 'job-search',
};

export default function AdminPanel({ currentUserId }: Props) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [appAccessMap, setAppAccessMap] = useState<Record<string, Set<string>>>({});
  const [usageMap, setUsageMap] = useState<Record<string, UsageStatus[]>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [{ data: profiles }, { data: roles }, { data: appPerms }, { data: limits }] =
      await Promise.all([
        supabase.from('profiles').select('id, email, first_name, last_name').order('email'),
        supabase.from('user_roles').select('user_id'),
        supabase.from('app_permissions').select('user_id, app_slug'),
        supabase.from('app_usage_limits').select('app_slug'),
      ]);

    const admins = new Set((roles ?? []).map((r) => r.user_id as string));

    const accessMap: Record<string, Set<string>> = {};
    for (const p of appPerms ?? []) {
      if (!accessMap[p.user_id]) {
        accessMap[p.user_id] = new Set();
      }
      accessMap[p.user_id].add(p.app_slug as string);
    }

    setUsers(profiles ?? []);
    setAdminIds(admins);
    setAppAccessMap(accessMap);

    const limitSlugs = (limits ?? []).map((l) => l.app_slug as string);
    const usage: Record<string, UsageStatus[]> = {};
    await Promise.all(
      (profiles ?? []).map(async (p) => {
        const isUserAdmin = admins.has(p.id);
        const userAccess = accessMap[p.id] ?? new Set<string>();
        const relevantSlugs = limitSlugs.filter((slug) => {
          const accessSlug = USAGE_TO_ACCESS_SLUG[slug] ?? slug;
          return isUserAdmin || userAccess.has(accessSlug);
        });
        if (relevantSlugs.length === 0) {
          return;
        }
        usage[p.id] = await Promise.all(
          relevantSlugs.map((slug) => getAppUsage(supabase, p.id, slug))
        );
      })
    );
    setUsageMap(usage);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleAdmin = async (userId: string) => {
    const supabase = createClient();
    if (adminIds.has(userId)) {
      await supabase.from('user_roles').delete().eq('user_id', userId);
    } else {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
    }
    await loadData();
  };

  const saveAppAccess = async (userId: string, nextSlugs: string[]) => {
    const supabase = createClient();
    const current = appAccessMap[userId] ?? new Set<string>();
    const next = new Set(nextSlugs);
    const toAdd = nextSlugs.filter((slug) => !current.has(slug));
    const toRemove = [...current].filter((slug) => !next.has(slug));

    await Promise.all([
      ...toAdd.map((slug) =>
        supabase
          .from('app_permissions')
          .insert({ user_id: userId, app_slug: slug, granted_by: currentUserId })
      ),
      ...toRemove.map((slug) =>
        supabase.from('app_permissions').delete().eq('user_id', userId).eq('app_slug', slug)
      ),
    ]);
    await loadData();
  };

  if (loading) {
    return null;
  }

  return (
    <div className={styles.card}>
      <h2>Admin Panel — Manage Access</h2>
      <p>Toggle admin status and grant or revoke access to restricted tools.</p>
      <div className={styles.adminTable}>
        {users.map((u) => (
          <AdminUserRow
            key={u.id}
            user={u}
            isCurrentUser={u.id === currentUserId}
            isAdmin={adminIds.has(u.id)}
            grantedSlugs={appAccessMap[u.id] ?? new Set<string>()}
            usage={usageMap[u.id] ?? []}
            onToggleAdmin={() => toggleAdmin(u.id)}
            onSaveAppAccess={(slugs) => saveAppAccess(u.id, slugs)}
          />
        ))}
      </div>
    </div>
  );
}
