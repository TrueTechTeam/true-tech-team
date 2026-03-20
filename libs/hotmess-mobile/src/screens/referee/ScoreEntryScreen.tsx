import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useState } from 'react';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';

type Props = RootStackScreenProps<'ScoreEntry'>;

type GameStatus = 'scheduled' | 'in_progress' | 'completed';

export function ScoreEntryScreen({ route }: Props) {
  const { gameId } = route.params;

  // In a real implementation these would come from a hook. Using mock state for dev.
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [status, setStatus] = useState<GameStatus>('scheduled');

  // Mock game data
  const game = {
    id: gameId,
    homeTeam: 'Nashville Kickers',
    awayTeam: 'Music City Mayhem',
    venue: 'Centennial Park Field 1',
    scheduledAt: new Date().toISOString(),
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleSave = () => {
    if (!homeScore || !awayScore) {
      Alert.alert('Missing Scores', 'Please enter scores for both teams.');
      return;
    }

    Alert.alert('Save Score', `${game.homeTeam} ${homeScore} - ${awayScore} ${game.awayTeam}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: () => {
          setStatus('completed');
          Alert.alert('Saved!', 'The score has been recorded.');
        },
      },
    ]);
  };

  const statusOptions: Array<{ key: GameStatus; label: string }> = [
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Final' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Game Info */}
        <View style={styles.gameHeader}>
          <Text style={styles.dateText}>{formatDate(game.scheduledAt)}</Text>
          <Text style={styles.venueText}>{game.venue}</Text>
        </View>

        {/* Status Selector */}
        <View style={styles.statusRow}>
          {statusOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.statusChip, status === opt.key && styles.statusChipActive]}
              onPress={() => setStatus(opt.key)}
            >
              <Text
                style={[styles.statusChipText, status === opt.key && styles.statusChipTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Score Entry */}
        <View style={styles.scoreContainer}>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{game.homeTeam}</Text>
            <Text style={styles.homeAwayLabel}>HOME</Text>
            <TextInput
              style={styles.scoreInput}
              value={homeScore}
              onChangeText={setHomeScore}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
            />
          </View>

          <View style={styles.divider}>
            <Text style={styles.vsText}>vs</Text>
          </View>

          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{game.awayTeam}</Text>
            <Text style={styles.homeAwayLabel}>AWAY</Text>
            <TextInput
              style={styles.scoreInput}
              value={awayScore}
              onChangeText={setAwayScore}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Score</Text>
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
  gameHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dateText: {
    fontSize: typography.fontSizes.base,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  venueText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    justifyContent: 'center',
  },
  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  statusChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
  },
  statusChipTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.semibold,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  teamName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  homeAwayLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  scoreInput: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.borderDefault,
    width: 80,
    height: 80,
    textAlign: 'center',
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  divider: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  vsText: {
    fontSize: typography.fontSizes.lg,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.medium,
  },
  saveButton: {
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.lg,
  },
});
