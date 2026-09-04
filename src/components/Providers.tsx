'use client';

import { GlobalProvider } from '@true-tech-team/ui-components';
import { AuthProvider } from '../context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GlobalProvider themeConfig={{ mode: 'dark' }}>
      <AuthProvider>{children}</AuthProvider>
    </GlobalProvider>
  );
}
