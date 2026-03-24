'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@true-tech-team/ui-components';
import { createClient } from '../../../lib/supabase/client';
import styles from './dashboard.module.scss';

// Restricted apps that require explicit permission grants.
// Add new app slugs here as you build out the landing app.
const RESTRICTED_APPS = [
  { slug: 'analytics', label: 'Analytics' },
  { slug: 'internal-tools', label: 'Internal Tools' },
  { slug: 'beta-features', label: 'Beta Features' },
];

interface UserRow {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
}

interface Props {
  currentUserId: string;
}

export default function AdminPanel({ currentUserId }: Props) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [appAccessMap, setAppAccessMap] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [{ data: profiles }, { data: roles }, { data: appPerms }] = await Promise.all([
      supabase.from('profiles').select('id, email, first_name, last_name').order('email'),
      supabase.from('user_roles').select('user_id'),
      supabase.from('app_permissions').select('user_id, app_slug'),
    ]);

    setUsers(profiles ?? []);
    setAdminIds(new Set((roles ?? []).map((r) => r.user_id as string)));

    const accessMap: Record<string, Set<string>> = {};
    for (const p of appPerms ?? []) {
      if (!accessMap[p.user_id]) {
        accessMap[p.user_id] = new Set();
      }
      accessMap[p.user_id].add(p.app_slug as string);
    }
    setAppAccessMap(accessMap);
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

  const toggleAppAccess = async (userId: string, appSlug: string) => {
    const supabase = createClient();
    const hasAccess = appAccessMap[userId]?.has(appSlug);
    if (hasAccess) {
      await supabase.from('app_permissions').delete().eq('user_id', userId).eq('app_slug', appSlug);
    } else {
      await supabase
        .from('app_permissions')
        .insert({ user_id: userId, app_slug: appSlug, granted_by: currentUserId });
    }
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
        {users.map((u) => {
          const isAdmin = adminIds.has(u.id);
          const userApps = appAccessMap[u.id] ?? new Set<string>();
          const name =
            u.first_name || u.last_name
              ? `${u.first_name} ${u.last_name}`.trim()
              : (u.email ?? u.id);
          return (
            <div key={u.id} className={styles.adminRow}>
              <div className={styles.adminUser}>
                <strong>{name}</strong>
                <span>{u.email}</span>
                {u.id === currentUserId && <em>(you)</em>}
              </div>
              <div className={styles.adminRoles}>
                <Button
                  variant={isAdmin ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => toggleAdmin(u.id)}
                >
                  Admin
                </Button>
                {RESTRICTED_APPS.map((app) => (
                  <Button
                    key={app.slug}
                    variant={userApps.has(app.slug) ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => toggleAppAccess(u.id, app.slug)}
                  >
                    {app.label}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
