import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../../theme';
import { SectionCard } from '../../../components/common';

interface Game {
  id: string;
  scheduled_at: string;
  home_team?: { id?: string; name: string };
  away_team?: { id?: string; name: string };
  venue?: { name: string; address?: string };
  venues?: { name: string; address?: string };
}

interface NextGameCardProps {
  game: Game;
}

export function NextGameCard({ game }: NextGameCardProps) {
  const navigation = useNavigation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const venueName = game.venues?.name || game.venue?.name || 'TBD';

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('GameDetails' as never, { gameId: game.id } as never)}
      activeOpacity={0.7}
    >
      <SectionCard title="Next Game">
        <View style={styles.gameInfo}>
          <Text style={styles.gameTeams}>
            {game.home_team?.name} vs. {game.away_team?.name}
          </Text>
          <Text style={styles.gameTime}>
            {formatDate(game.scheduled_at)}, {formatTime(game.scheduled_at)}
          </Text>
          <Text style={styles.gameLocation}>{venueName}</Text>
        </View>
      </SectionCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gameInfo: {
    gap: spacing.xs,
  },
  gameTeams: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  gameTime: {
    fontSize: typography.fontSizes.base,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  gameLocation: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
});
