import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';

export function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Hotmess Sports</Text>
          <Text style={styles.tagline}>Play. Compete. Connect.</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureText}>View schedules & scores</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Chat with your team</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📷</Text>
            <Text style={styles.featureText}>Share game photos</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink}>Create one on Sports Engine</Text>
          </Text>
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  logo: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.fontSizes.lg,
    color: colors.textSecondary,
  },
  features: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureText: {
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.medium,
  },
  actions: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  signupText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
  },
  signupLink: {
    color: colors.primary,
  },
});
