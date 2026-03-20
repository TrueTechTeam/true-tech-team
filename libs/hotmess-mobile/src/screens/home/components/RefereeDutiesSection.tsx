import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../../theme';
import { SectionCard } from '../../../components/common';

interface Game {
  id: string;
  scheduled_at: string;
  home_team?: { id?: string; name: string };
  away_team?: { id?: string; name: string };
  venue?: { name: string };
  venues?: { name: string };
  status: string;
}

interface RefereeDutiesSectionProps {
  games: Game[];
}

export function RefereeDutiesSection({ games }: RefereeDutiesSectionProps) {
  const navigation = useNavigation();

  const pendingGames = games.filter((g) => g.status === 'scheduled' || g.status === 'in_progress');
  const nextGame = pendingGames[0];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <SectionCard title="Referee Duties">
      <Text style={styles.assignedCount}>
        {pendingGames.length} game{pendingGames.length !== 1 ? 's' : ''} assigned
      </Text>

      {nextGame && (
        <TouchableOpacity
          style={styles.gameCard}
          onPress={() => navigation.navigate('ScoreEntry', { gameId: nextGame.id })}
          activeOpacity={0.7}
        >
          <View style={styles.gameInfo}>
            <Text style={styles.gameTeams}>
              {nextGame.home_team?.name} vs. {nextGame.away_team?.name}
            </Text>
            <Text style={styles.gameTime}>
              {formatDate(nextGame.scheduled_at)} at {formatTime(nextGame.scheduled_at)}
            </Text>
            <Text style={styles.gameVenue}>
              {nextGame.venues?.name || nextGame.venue?.name || 'TBD'}
            </Text>
          </View>
          <View style={styles.scoreCta}>
            <Text style={styles.scoreCtaText}>Enter Score</Text>
          </View>
        </TouchableOpacity>
      )}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  assignedCount: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgTertiary,
    borderRadius: 8,
    padding: spacing.sm,
  },
  gameInfo: {
    flex: 1,
    gap: 2,
  },
  gameTeams: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  gameTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
  },
  gameVenue: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
  },
  scoreCta: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  scoreCtaText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
});
