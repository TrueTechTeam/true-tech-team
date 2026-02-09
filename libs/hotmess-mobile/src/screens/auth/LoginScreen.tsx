import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../contexts';
import { discovery, getRedirectUri, getAuthRequestConfig } from '../../lib/sports-engine';

// Ensure web browser redirects work
WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const navigation = useNavigation();
  const { handleAuthCode, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // Get redirect URI
  const redirectUri = getRedirectUri();

  // Create auth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    getAuthRequestConfig(redirectUri),
    discovery
  );

  // Handle auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      if (code) {
        setLoading(true);
        handleAuthCode(code, redirectUri)
          .catch((error) => {
            Alert.alert('Error', 'Failed to sign in. Please try again.');
            console.error('Auth error:', error);
          })
          .finally(() => setLoading(false));
      }
    } else if (response?.type === 'error') {
      Alert.alert('Error', 'Authentication was cancelled or failed.');
    }
  }, [response, handleAuthCode, redirectUri]);

  const handleSportsEngineLogin = async () => {
    if (!request) {
      Alert.alert('Error', 'Authentication is not ready. Please try again.');
      return;
    }
    await promptAsync();
  };

  const handleCreateAccount = () => {
    Linking.openURL('https://user.sportsengine.com/users/sign_up');
  };

  const isLoading = loading || authLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in with your Sports Engine account to continue</Text>
        </View>

        <View style={styles.loginSection}>
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleSportsEngineLogin}
            disabled={isLoading || !request}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.loginButtonText}>Sign in with Sports Engine</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.createAccountButton} onPress={handleCreateAccount}>
            <Text style={styles.createAccountText}>Create a Sports Engine Account</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>Need help? Contact support@hotmesssports.com</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.xl,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.fontSizes.base,
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
  },
  loginSection: {
    gap: spacing.lg,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.sm,
  },
  createAccountButton: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  createAccountText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.base,
  },
  helpText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.md,
  },
});
