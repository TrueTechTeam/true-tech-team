'use client';

import { Button } from '@true-tech-team/ui-components';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.scss';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="True Tech Team" width={40} height={40} />
          <span>True Tech Team</span>
        </Link>

        <nav className={styles.nav}>
          <a href="/#projects">Projects</a>
          <a href="/#features">Features</a>
          <a href="/#team">Team</a>
          <a
            href={process.env.NEXT_PUBLIC_STORYBOOK_URL || 'http://localhost:6006'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Storybook
          </a>

          {session ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
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
