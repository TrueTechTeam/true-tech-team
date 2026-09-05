'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Avatar,
  Button,
  Icon,
  IconButton,
  Menu,
  MenuList,
  MenuItem,
} from '@true-tech-team/react-components';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { APPS } from '../../lib/apps/registry';
import { AppIcon } from '@true-tech-team/dashboard-kit';
import styles from './Header.module.scss';

export default function Header() {
  const { user, isAdmin, appAccess, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const quickLinkApps = APPS.filter((app) => app.href && (isAdmin || appAccess.includes(app.slug)));
  const initials = user?.email ? user.email[0].toUpperCase() : undefined;

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="True Tech Team" width={40} height={40} />
          <span>True Tech Team</span>
        </Link>

        <nav className={styles.nav}>
          <a
            href={process.env.NEXT_PUBLIC_STORYBOOK_URL || 'http://localhost:6006'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Storybook
          </a>

          {user ? (
            <>
              <div className={styles.dashboardNav}>
                <Link href="/dashboard">Dashboard</Link>
                {quickLinkApps.length > 0 && (
                  <Menu
                    isOpen={menuOpen}
                    onOpenChange={setMenuOpen}
                    position="bottom-right"
                    trigger={({ ref }) => (
                      <span ref={ref as React.Ref<HTMLSpanElement>} className={styles.menuTrigger}>
                        <IconButton
                          icon="chevron-down"
                          size="xs"
                          variant="ghost"
                          aria-label="Quick-switch apps"
                          onClick={() => setMenuOpen((open) => !open)}
                        />
                      </span>
                    )}
                  >
                    <MenuList>
                      {quickLinkApps.map((app) => (
                        <MenuItem
                          key={app.slug}
                          itemKey={app.slug}
                          startIcon={<AppIcon icon={app.icon} accent={app.accent} size="sm" />}
                          onClick={() => {
                            setMenuOpen(false);
                            router.push(app.href as string);
                          }}
                        >
                          {app.label}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}
              </div>
              {isAdmin && <Link href="/admin">Admin</Link>}
              <Menu
                isOpen={userMenuOpen}
                onOpenChange={setUserMenuOpen}
                position="bottom-right"
                trigger={({ ref }) => (
                  <button
                    ref={ref as React.Ref<HTMLButtonElement>}
                    type="button"
                    className={styles.avatarTrigger}
                    aria-label="User menu"
                    onClick={() => setUserMenuOpen((open) => !open)}
                  >
                    <Avatar initials={initials} size="sm" />
                  </button>
                )}
              >
                <MenuList>
                  <MenuItem
                    itemKey="sign-out"
                    startIcon={<Icon name="logout" size={16} />}
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                  >
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
