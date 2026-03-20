import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

interface QuickStatsProps {
  teamCount: number;
  upcomingGameCount: number;
}

export function QuickStats({ teamCount, upcomingGameCount }: QuickStatsProps) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{teamCount}</Text>
        <Text style={styles.statLabel}>Teams</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{upcomingGameCount}</Text>
        <Text style={styles.statLabel}>Upcoming</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>--</Text>
        <Text style={styles.statLabel}>Standing</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  statValue: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
