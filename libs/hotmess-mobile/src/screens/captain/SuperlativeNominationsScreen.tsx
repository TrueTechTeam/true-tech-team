import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState } from 'react';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { useTeamMembers } from '../../hooks';
import { LoadingSpinner } from '../../components/common';

type Props = RootStackScreenProps<'SuperlativeNominations'>;

const SUPERLATIVE_CATEGORIES = [
  { id: 'mvp', label: 'MVP', description: 'Most Valuable Player' },
  { id: 'best-dressed', label: 'Best Dressed', description: 'Always looking fly on game day' },
  { id: 'most-spirited', label: 'Most Spirited', description: 'Brings the most energy' },
  { id: 'best-teammate', label: 'Best Teammate', description: 'Always has your back' },
  { id: 'most-improved', label: 'Most Improved', description: 'Biggest glow-up this season' },
  { id: 'party-mvp', label: 'Party MVP', description: 'Life of the after-party' },
];

export function SuperlativeNominationsScreen({ route }: Props) {
  const { seasonId: _seasonId, teamId } = route.params;
  const { data: members, loading } = useTeamMembers(teamId);
  const [nominations, setNominations] = useState<Record<string, string>>({});

  const handleNominate = (categoryId: string, memberId: string, _memberName: string) => {
    setNominations((prev) => ({ ...prev, [categoryId]: memberId }));
  };

  const handleSubmit = () => {
    const nominationCount = Object.keys(nominations).length;
    Alert.alert(
      'Submit Nominations',
      `Submit ${nominationCount} nomination${nominationCount !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            Alert.alert('Submitted!', 'Your nominations have been recorded.');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  const teamMembers = members || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.description}>
          Nominate one of your teammates for each category. Nominations are anonymous.
        </Text>

        {SUPERLATIVE_CATEGORIES.map((category) => {
          const nominatedId = nominations[category.id];
          return (
            <View key={category.id} style={styles.categoryCard}>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <Text style={styles.categoryDesc}>{category.description}</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.memberScroll}
              >
                {teamMembers.map((member) => {
                  const isSelected = nominatedId === member.id;
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[styles.memberChip, isSelected && styles.memberChipSelected]}
                      onPress={() =>
                        handleNominate(
                          category.id,
                          member.id,
                          `${member.first_name} ${member.last_name}`
                        )
                      }
                    >
                      <Text
                        style={[styles.memberChipText, isSelected && styles.memberChipTextSelected]}
                      >
                        {member.first_name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}

        <TouchableOpacity
          style={[
            styles.submitButton,
            Object.keys(nominations).length === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={Object.keys(nominations).length === 0}
        >
          <Text style={styles.submitButtonText}>Submit Nominations</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  description: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  categoryLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  categoryDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  memberScroll: {
    flexDirection: 'row',
  },
  memberChip: {
    backgroundColor: colors.bgTertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  memberChipSelected: {
    backgroundColor: colors.accent,
  },
  memberChipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  memberChipTextSelected: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.semibold,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.base,
  },
});
