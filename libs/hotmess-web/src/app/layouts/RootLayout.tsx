import { Outlet } from 'react-router-dom';
import { featureFlags } from '../../lib/feature-flags';
import { AuthProvider } from '../../contexts/AuthContext';
import { PermissionsProvider } from '../../contexts/PermissionsContext';
import { MockAuthProvider, MockPermissionsProvider, DevRoleSwitcher } from '../../mocks/auth';

export function RootLayout() {
  const AuthProviderComponent = featureFlags.useMockAuth ? MockAuthProvider : AuthProvider;
  const PermissionsProviderComponent = featureFlags.useMockAuth
    ? MockPermissionsProvider
    : PermissionsProvider;

  return (
    <AuthProviderComponent>
      <PermissionsProviderComponent>
        <Outlet />
        {featureFlags.useMockAuth && <DevRoleSwitcher />}
      </PermissionsProviderComponent>
    </AuthProviderComponent>
  );
}
