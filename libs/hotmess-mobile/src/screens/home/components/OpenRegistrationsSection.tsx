import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

interface Season {
  id: string;
  name: string;
  start_date?: string;
  leagues?: {
    name: string;
    sports?: { name: string };
    cities?: { name: string };
  };
}

interface OpenRegistrationsSectionProps {
  seasons: Season[];
}

export function OpenRegistrationsSection({ seasons }: OpenRegistrationsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Open Registrations</Text>
      <View style={styles.list}>
        {seasons.slice(0, 3).map((season) => (
          <TouchableOpacity key={season.id} style={styles.card} activeOpacity={0.7}>
            <View style={styles.content}>
              <Text style={styles.leagueName}>
                {season.leagues?.cities?.name} {season.leagues?.sports?.name}
              </Text>
              <Text style={styles.seasonName}>{season.name}</Text>
              {season.start_date && (
                <Text style={styles.startDate}>
                  Starts{' '}
                  {new Date(season.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              )}
            </View>
            <View style={styles.registerButton}>
              <Text style={styles.registerText}>Register</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  leagueName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  seasonName: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  startDate: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
  },
  registerButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  registerText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
});
