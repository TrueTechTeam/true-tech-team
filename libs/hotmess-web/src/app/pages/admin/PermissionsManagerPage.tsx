import { useState, useMemo, useCallback } from 'react';
import {
  Table,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  Breadcrumbs,
  type ColumnConfig,
} from '@true-tech-team/ui-components';
import { UserRole } from '@true-tech-team/hotmess-types';
import { usePermissions } from '../../../contexts/PermissionsContext';
import { useCities } from '../../../hooks/useSupabaseQuery';
import { MOCK_USERS } from '../../../mocks/auth/mock-users';
import { buildAdminBreadcrumbs } from './utils';
import styles from './AdminPages.module.scss';

interface UserPermissionRow {
  id: string;
  email: string;
  name: string;
  effectiveRole: UserRole;
  source: string;
  cityAssignments: string[];
  [key: string]: unknown;
}

const ROLE_LABELS: Record<string, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Commissioner]: 'Commissioner',
  [UserRole.Manager]: 'Manager',
  [UserRole.Referee]: 'Referee',
  [UserRole.TeamCaptain]: 'Team Captain',
  [UserRole.Player]: 'Player',
};

const ROLE_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'danger'> = {
  [UserRole.Admin]: 'danger',
  [UserRole.Commissioner]: 'warning',
  [UserRole.Manager]: 'info',
  [UserRole.Referee]: 'info',
  [UserRole.TeamCaptain]: 'neutral',
  [UserRole.Player]: 'neutral',
};

const ASSIGNABLE_ROLES = [
  UserRole.Admin,
  UserRole.Commissioner,
  UserRole.Manager,
  UserRole.Referee,
  UserRole.TeamCaptain,
  UserRole.Player,
];

export function PermissionsManagerPage() {
  const { isAdmin } = usePermissions();
  const { data: cities } = useCities();
  const [selectedUser, setSelectedUser] = useState<UserPermissionRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<UserRole>(UserRole.Player);
  const [editCities, setEditCities] = useState<string[]>([]);

  // Build user list from mock users (in production, this would query profiles + user_roles)
  const users = useMemo<UserPermissionRow[]>(() => {
    return Object.values(MOCK_USERS).map((u) => ({
      id: u.profile.id,
      email: u.profile.email,
      name: `${u.profile.first_name} ${u.profile.last_name}`,
      effectiveRole: u.role,
      source: 'manual',
      cityAssignments: u.role === UserRole.Commissioner ? ['city-nashville', 'city-st-pete'] : [],
    }));
  }, []);

  const breadcrumbs = buildAdminBreadcrumbs([{ label: 'Permissions' }]);

  const openEditDialog = useCallback((user: UserPermissionRow) => {
    setSelectedUser(user);
    setEditRole(user.effectiveRole);
    setEditCities(user.cityAssignments);
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedUser) { return; }
    // TODO: Replace with actual mutation against user_roles table
    console.warn('[PermissionsManager] Save role assignment:', {
      userId: selectedUser.id,
      role: editRole,
      cityIds: editRole === UserRole.Commissioner ? editCities : [],
    });
    setDialogOpen(false);
    setSelectedUser(null);
  }, [selectedUser, editRole, editCities]);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedUser(null);
  }, []);

  const toggleCity = useCallback((cityId: string) => {
    setEditCities((prev) =>
      prev.includes(cityId) ? prev.filter((id) => id !== cityId) : [...prev, cityId]
    );
  }, []);

  const columns: Array<ColumnConfig<UserPermissionRow>> = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'effectiveRole',
      header: 'Role',
      sortable: true,
      render: (_v, row) => (
        <Badge variant={ROLE_BADGE_VARIANT[row.effectiveRole] ?? 'neutral'} size="sm">
          {ROLE_LABELS[row.effectiveRole] ?? row.effectiveRole}
        </Badge>
      ),
    },
    { key: 'source', header: 'Source' },
    {
      key: 'cityAssignments',
      header: 'City Scope',
      render: (_v, row) => {
        if (row.cityAssignments.length === 0) { return '—'; }
        const cityNames = row.cityAssignments.map((id) => {
          const city = cities?.find((c) => c.id === id);
          return city ? city.name : id;
        });
        return cityNames.join(', ');
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_v, row) => (
        <Button variant="outline" size="xs" onClick={() => openEditDialog(row)}>
          Edit
        </Button>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Access Denied</h1>
        <p>Only administrators can manage permissions.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Permissions</h1>
      </div>

      <section className={styles.section} style={{ marginTop: 0 }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Manage user roles and city assignments. Sports Engine roles are synced automatically
          and shown as read-only. Manual assignments enhance SE permissions.
        </p>
      </section>

      <Table<UserPermissionRow>
        data={users}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder="Search users..."
        searchFields={['name', 'email']}
        emptyContent="No users found."
      />

      <Dialog
        isOpen={dialogOpen}
        onClose={handleClose}
        title={selectedUser ? `Edit Role — ${selectedUser.name}` : 'Edit Role'}
        size="md"
        actions={
          <DialogFooter align="end">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save</Button>
          </DialogFooter>
        }
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                Role
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ASSIGNABLE_ROLES.map((role) => (
                  <Button
                    key={role}
                    variant={editRole === role ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setEditRole(role)}
                  >
                    {ROLE_LABELS[role]}
                  </Button>
                ))}
              </div>
            </div>

            {selectedUser.source === 'sports_engine' && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-default)',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>SE Synced Role: </span>
                <Badge variant="info" size="sm">
                  {ROLE_LABELS[selectedUser.effectiveRole]}
                </Badge>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>
                  (read-only — synced from Sports Engine)
                </span>
              </div>
            )}

            {editRole === UserRole.Commissioner && (
              <div>
                <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Assigned Cities
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {cities?.map((city) => (
                    <label
                      key={city.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.375rem 0',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={editCities.includes(city.id)}
                        onChange={() => toggleCity(city.id)}
                      />
                      <span>{city.name}</span>
                      {city.state && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          ({city.state})
                        </span>
                      )}
                    </label>
                  )) ?? <span style={{ color: 'var(--text-muted)' }}>No cities available</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
