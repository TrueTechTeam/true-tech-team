import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation';
import { colors } from './src/theme';
import { featureFlags } from './src/lib/feature-flags';
import { AuthProvider, PermissionsProvider } from './src/contexts';
import { MockAuthProvider } from './src/mocks/auth/MockAuthProvider';
import { MockPermissionsProvider } from './src/mocks/auth/MockPermissionsProvider';
import { DevRoleSwitcher } from './src/mocks/auth/DevRoleSwitcher';

const AuthProviderComponent = featureFlags.useMockAuth ? MockAuthProvider : AuthProvider;
const PermissionsProviderComponent = featureFlags.useMockAuth
  ? MockPermissionsProvider
  : PermissionsProvider;

export default function App() {
  return (
    <AuthProviderComponent>
      <PermissionsProviderComponent>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: colors.primary,
              background: colors.bgPrimary,
              card: colors.bgSecondary,
              text: colors.textPrimary,
              border: colors.borderDefault,
              notification: colors.secondary,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '800' },
            },
          }}
        >
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
        {featureFlags.useMockAuth && <DevRoleSwitcher />}
      </PermissionsProviderComponent>
    </AuthProviderComponent>
  );
}
