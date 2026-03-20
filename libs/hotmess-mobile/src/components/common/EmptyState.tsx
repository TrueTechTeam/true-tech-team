import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.fontSizes.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
