import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../contexts';
import { useUpcomingGames, useMyTeams } from '../../hooks';

export function DashboardScreen() {
  const { user, profile } = useAuth();
  const { data: upcomingGames, loading: gamesLoading } = useUpcomingGames(user?.id);
  const { data: myTeams, loading: teamsLoading } = useMyTeams(user?.id);

  const nextGame = upcomingGames?.[0];
  const displayName = profile?.preferred_name || profile?.first_name || 'Player';

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey, {displayName}!</Text>
        </View>

        {/* Next Game Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Game</Text>
          {gamesLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : nextGame ? (
            <View style={styles.gameInfo}>
              <Text style={styles.gameTeams}>
                {nextGame.home_team?.name} vs. {nextGame.away_team?.name}
              </Text>
              <Text style={styles.gameTime}>
                {formatGameDate(nextGame.scheduled_at)}, {formatGameTime(nextGame.scheduled_at)}
              </Text>
              <Text style={styles.gameLocation}>{nextGame.venues?.name || 'TBD'}</Text>
            </View>
          ) : (
            <Text style={styles.noData}>No upcoming games scheduled</Text>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{myTeams?.length || 0}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{upcomingGames?.length || 0}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Standing</Text>
          </View>
        </View>

        {/* My Teams */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Teams</Text>
          {teamsLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : myTeams && myTeams.length > 0 ? (
            <View style={styles.activityList}>
              {myTeams.slice(0, 3).map((membership) => (
                <View key={membership.id} style={styles.activityItem}>
                  <Text style={styles.activityIcon}>⚽</Text>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{membership.teams?.name}</Text>
                    <Text style={styles.activityTime}>
                      {membership.teams?.divisions?.seasons?.leagues?.sports?.name} •{' '}
                      {membership.teams?.divisions?.seasons?.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>You are not on any teams yet</Text>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>👋</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Welcome to Hotmess Sports!</Text>
                <Text style={styles.activityTime}>Just now</Text>
              </View>
            </View>
          </View>
        </View>
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
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  cardTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
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
  noData: {
    fontSize: typography.fontSizes.base,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  activityList: {
    gap: spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
  },
  activityTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
