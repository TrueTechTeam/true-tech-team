import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useState, useCallback } from 'react';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../contexts';
import { useUpcomingGames } from '../../hooks';

export function ScheduleScreen() {
  const { user } = useAuth();
  const { data: games, loading, refetch } = useUpcomingGames(user?.id);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getSeasonName = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    if (month >= 2 && month <= 4) return `Spring ${year}`;
    if (month >= 5 && month <= 7) return `Summer ${year}`;
    if (month >= 8 && month <= 10) return `Fall ${year}`;
    return `Winter ${year}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.subtitle}>{getSeasonName()} Season</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : games && games.length > 0 ? (
          games.map((game: any) => {
            const isHome = game.home_team_id === user?.id;
            return (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.gameDate}>
                  <Text style={styles.gameDateText}>{formatDate(game.scheduled_at)}</Text>
                  <Text style={styles.gameTimeText}>{formatTime(game.scheduled_at)}</Text>
                </View>
                <View style={styles.gameDetails}>
                  <Text style={styles.homeAway}>{isHome ? 'HOME' : 'AWAY'}</Text>
                  <Text style={styles.opponent}>
                    {game.home_team?.name} vs. {game.away_team?.name}
                  </Text>
                  <Text style={styles.location}>
                    {game.venues?.name || 'TBD'}
                    {game.venues?.address && ` • ${game.venues.address}`}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No Upcoming Games</Text>
            <Text style={styles.emptyText}>
              Your schedule will appear here once games are scheduled
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
    paddingTop: 0,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  gameDate: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  gameDateText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
  },
  gameTimeText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  gameDetails: {
    flex: 1,
    padding: spacing.md,
    gap: 2,
  },
  homeAway: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  opponent: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  location: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSizes.base,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
