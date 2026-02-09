import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.scss';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/cities', label: 'Cities', icon: '🏙️' },
  { path: '/admin/sports', label: 'Sports', icon: '⚽' },
  { path: '/admin/leagues', label: 'Leagues', icon: '🏆' },
  { path: '/admin/seasons', label: 'Seasons', icon: '📅' },
  { path: '/admin/teams', label: 'Teams', icon: '👥' },
  { path: '/admin/schedules', label: 'Schedules', icon: '📋' },
  { path: '/admin/brackets', label: 'Brackets', icon: '🎯' },
  { path: '/admin/notifications', label: 'Notifications', icon: '🔔' },
];

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoText}>Hotmess</span>
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
              <span className={styles.userName}>Admin User</span>
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
