'use client';

import { GlobalProvider } from '@true-tech-team/ui-components';
import { SessionProvider } from 'next-auth/react';
import './globals.scss';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>True Tech Team - Tech Project Portfolio</title>
        <meta
          name="description"
          content="Showcasing innovative tech projects and solutions from the True Tech Team"
        />
      </head>
      <body>
        <GlobalProvider themeConfig={{ mode: 'dark' }}>
          <SessionProvider>{children}</SessionProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
