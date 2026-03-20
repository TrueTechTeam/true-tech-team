import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { UserRole } from '@true-tech-team/hotmess-types';
import styles from './AdminLayout.module.scss';

const ALL_NAV_ITEMS: Array<{
  path: string;
  label: string;
  icon: string;
  roles: UserRole[];
}> = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: '📊',
    roles: [
      UserRole.Admin,
      UserRole.Commissioner,
      UserRole.Manager,
      UserRole.Referee,
      UserRole.TeamCaptain,
      UserRole.Player,
    ],
  },
  {
    path: '/admin/cities',
    label: 'Cities',
    icon: '🏙️',
    roles: [UserRole.Admin, UserRole.Commissioner],
  },
  { path: '/admin/sports', label: 'Sports', icon: '⚽', roles: [UserRole.Admin] },
  {
    path: '/admin/leagues',
    label: 'Leagues',
    icon: '🏆',
    roles: [UserRole.Admin, UserRole.Commissioner],
  },
  {
    path: '/admin/seasons',
    label: 'Seasons',
    icon: '📅',
    roles: [UserRole.Admin, UserRole.Commissioner, UserRole.Manager],
  },
  {
    path: '/admin/teams',
    label: 'Teams',
    icon: '👥',
    roles: [UserRole.Admin, UserRole.Commissioner, UserRole.Manager, UserRole.TeamCaptain],
  },
  {
    path: '/admin/schedules',
    label: 'Schedules',
    icon: '📋',
    roles: [UserRole.Admin, UserRole.Commissioner, UserRole.Manager, UserRole.Referee],
  },
  {
    path: '/admin/brackets',
    label: 'Brackets',
    icon: '🎯',
    roles: [UserRole.Admin, UserRole.Commissioner, UserRole.Manager, UserRole.Referee],
  },
  {
    path: '/admin/notifications',
    label: 'Notifications',
    icon: '🔔',
    roles: [UserRole.Admin, UserRole.Commissioner, UserRole.Manager],
  },
  { path: '/admin/permissions', label: 'Permissions', icon: '🔐', roles: [UserRole.Admin] },
];

const ROLE_LABELS: Record<string, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Commissioner]: 'Commissioner',
  [UserRole.Manager]: 'Manager',
  [UserRole.Referee]: 'Referee',
  [UserRole.TeamCaptain]: 'Team Captain',
  [UserRole.Player]: 'Player',
};

export function AdminLayout() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { effectiveRole, isCommissioner, commissionerCityIds } = usePermissions();

  // Filter nav items based on effective role
  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(effectiveRole));

  // Get user display name from auth context
  const userName = auth.profile
    ? `${auth.profile.first_name} ${auth.profile.last_name}`
    : 'Admin User';

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.logo}>
            <Logo size="sm" />
            <span className={styles.logoSubtext}>Admin</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {isCommissioner && commissionerCityIds.length > 0 && (
            <div className={styles.scopeIndicator}>
              <span className={styles.scopeLabel}>Your Cities</span>
              <span className={styles.scopeValue}>{commissionerCityIds.length} assigned</span>
            </div>
          )}
          <button onClick={handleLogout} className={styles.logoutButton}>
            Sign Out
          </button>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Admin Console</h1>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.roleBadge}>
                {ROLE_LABELS[effectiveRole] ?? effectiveRole}
              </span>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
