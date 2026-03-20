import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../../theme';
import { useSuperlativeCategories } from '../../../hooks';

interface SuperlativeVotingCardProps {
  seasonId: string;
  seasonName: string;
}

export function SuperlativeVotingCard({ seasonId, seasonName }: SuperlativeVotingCardProps) {
  const navigation = useNavigation();
  const { data: categories } = useSuperlativeCategories(seasonId);

  if (!categories || categories.length === 0) return null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('SuperlativeVoting' as never, { seasonId } as never)}
    >
      <View style={styles.iconBadge}>
        <Text style={styles.icon}>🏆</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>VOTE NOW</Text>
        <Text style={styles.title}>Season Superlatives</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {seasonName} · {categories.length} categories
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent,
    gap: spacing.sm,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: colors.accent,
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
  },
  arrow: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: typography.fontWeights.bold,
  },
});
