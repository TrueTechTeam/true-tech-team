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

type Props = RootStackScreenProps<'SuperlativeVoting'>;

interface Nominee {
  id: string;
  name: string;
  teamName: string;
}

interface Category {
  id: string;
  label: string;
  description: string;
  nominees: Nominee[];
}

// Mock voting data
const MOCK_CATEGORIES: Category[] = [
  {
    id: 'mvp',
    label: 'MVP',
    description: 'Most Valuable Player of the season',
    nominees: [
      { id: 'n1', name: 'Alex Johnson', teamName: 'Nashville Kickers' },
      { id: 'n2', name: 'Sam Williams', teamName: 'Music City Mayhem' },
      { id: 'n3', name: 'Jordan Brown', teamName: 'Hot Chicken Hitters' },
    ],
  },
  {
    id: 'best-dressed',
    label: 'Best Dressed',
    description: 'Always looking fly on game day',
    nominees: [
      { id: 'n4', name: 'Casey Rivera', teamName: 'Nashville Kickers' },
      { id: 'n5', name: 'Morgan Chen', teamName: 'Honky Tonk Heroes' },
      { id: 'n6', name: 'Taylor Kim', teamName: 'Music City Mayhem' },
    ],
  },
  {
    id: 'most-spirited',
    label: 'Most Spirited',
    description: 'Brings the energy every single game',
    nominees: [
      { id: 'n7', name: 'Riley Davis', teamName: 'Hot Chicken Hitters' },
      { id: 'n8', name: 'Jamie Lee', teamName: 'Nashville Kickers' },
      { id: 'n9', name: 'Drew Martinez', teamName: 'Honky Tonk Heroes' },
    ],
  },
  {
    id: 'party-mvp',
    label: 'Party MVP',
    description: 'Life of the after-party',
    nominees: [
      { id: 'n10', name: 'Avery Thompson', teamName: 'Music City Mayhem' },
      { id: 'n11', name: 'Quinn Wilson', teamName: 'Hot Chicken Hitters' },
      { id: 'n12', name: 'Blake Anderson', teamName: 'Nashville Kickers' },
    ],
  },
];

export function SuperlativeVotingScreen({ route }: Props) {
  const { seasonId: _seasonId } = route.params;
  const [votes, setVotes] = useState<Record<string, string>>({});

  const handleVote = (categoryId: string, nomineeId: string) => {
    setVotes((prev) => ({ ...prev, [categoryId]: nomineeId }));
  };

  const handleSubmit = () => {
    const voteCount = Object.keys(votes).length;
    if (voteCount === 0) {
      Alert.alert('No Votes', 'Please vote in at least one category.');
      return;
    }

    Alert.alert(
      'Submit Votes',
      `Submit your ${voteCount} vote${voteCount !== 1 ? 's' : ''}? This cannot be changed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            Alert.alert('Votes Submitted!', 'Thanks for voting. Results will be announced soon!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.description}>
          Vote for your favorite players! One vote per category. Voting is anonymous.
        </Text>

        {MOCK_CATEGORIES.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <Text style={styles.categoryLabel}>{category.label}</Text>
            <Text style={styles.categoryDesc}>{category.description}</Text>

            <View style={styles.nominees}>
              {category.nominees.map((nominee) => {
                const isSelected = votes[category.id] === nominee.id;
                return (
                  <TouchableOpacity
                    key={nominee.id}
                    style={[styles.nomineeCard, isSelected && styles.nomineeCardSelected]}
                    onPress={() => handleVote(category.id, nominee.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.nomineeAvatar, isSelected && styles.nomineeAvatarSelected]}>
                      <Text style={styles.nomineeInitial}>{nominee.name[0]}</Text>
                    </View>
                    <View style={styles.nomineeInfo}>
                      <Text style={[styles.nomineeName, isSelected && styles.nomineeNameSelected]}>
                        {nominee.name}
                      </Text>
                      <Text style={styles.nomineeTeam}>{nominee.teamName}</Text>
                    </View>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, Object.keys(votes).length === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={Object.keys(votes).length === 0}
        >
          <Text style={styles.submitButtonText}>
            Submit Votes ({Object.keys(votes).length}/{MOCK_CATEGORIES.length})
          </Text>
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
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  categoryLabel: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  categoryDesc: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  nominees: {
    gap: spacing.sm,
  },
  nomineeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgTertiary,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  nomineeCardSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  nomineeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  nomineeAvatarSelected: {
    backgroundColor: colors.accent,
  },
  nomineeInitial: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
  nomineeInfo: {
    flex: 1,
  },
  nomineeName: {
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.medium,
  },
  nomineeNameSelected: {
    fontWeight: typography.fontWeights.bold,
  },
  nomineeTeam: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
  },
  checkmark: {
    fontSize: typography.fontSizes.lg,
    color: colors.accent,
    fontWeight: typography.fontWeights.bold,
    paddingHorizontal: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
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
