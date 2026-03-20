import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../../theme';
import { sportColors } from '../../theme/colors';
import { useTeamMembers, useUpcomingGames } from '../../hooks';
import { useAuth } from '../../contexts';
import { LoadingSpinner } from '../../components/common';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TeamDetails'>;

type Tab = 'schedule' | 'roster' | 'stats';

function getSportColor(sportName: string | undefined): string {
  if (!sportName) return colors.primary;
  const key = sportName.toLowerCase().replace(/\s+/g, '') as keyof typeof sportColors;
  return sportColors[key] || colors.primary;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function TeamDetailsScreen({ route }: Props) {
  const { teamId } = route.params;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [refreshing, setRefreshing] = useState(false);

  const { data: members, loading: membersLoading, refetch: refetchMembers } = useTeamMembers(teamId);
  const { data: allGames, loading: gamesLoading, refetch: refetchGames } = useUpcomingGames(user?.id);

  const teamGames = allGames?.filter(
    (g) => g.home_team?.id === teamId || g.away_team?.id === teamId
  ) ?? [];

  const teamName = teamGames[0]?.home_team?.id === teamId
    ? teamGames[0]?.home_team?.name
    : teamGames[0]?.away_team?.name;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMembers(), refetchGames()]);
    setRefreshing(false);
  }, [refetchMembers, refetchGames]);

  const loading = membersLoading || gamesLoading;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'schedule', label: 'Schedule' },
    { key: 'roster', label: 'Roster' },
    { key: 'stats', label: 'Stats' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {loading && !refreshing ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === 'schedule' && (
              <ScheduleTab games={teamGames} teamId={teamId} />
            )}
            {activeTab === 'roster' && (
              <RosterTab members={members} />
            )}
            {activeTab === 'stats' && (
              <StatsTab games={teamGames} teamId={teamId} teamName={teamName} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Schedule Tab ---

interface Game {
  id: string;
  scheduled_at: string;
  status: string;
  home_team?: { id?: string; name: string };
  away_team?: { id?: string; name: string };
  venue?: { name: string; address?: string };
  venues?: { name: string; address?: string };
  home_score?: number | null;
  away_score?: number | null;
}

function ScheduleTab({ games, teamId }: { games: Game[]; teamId: string }) {
  if (games.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No Upcoming Games</Text>
        <Text style={styles.emptyText}>Games will appear here once scheduled.</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {games.map((game) => {
        const isHome = game.home_team?.id === teamId;
        const venue = game.venues?.name || game.venue?.name || 'TBD';

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
              <Text style={styles.location}>{venue}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// --- Roster Tab ---

interface Member {
  id: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  status?: string;
}

function RosterTab({ members }: { members: Member[] | null }) {
  if (!members || members.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No Roster Data</Text>
        <Text style={styles.emptyText}>Roster info will appear here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {members.map((member) => (
        <View key={member.id} style={styles.memberCard}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberInitials}>
              {(member.first_name?.[0] || '?')}{(member.last_name?.[0] || '')}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {member.first_name} {member.last_name}
            </Text>
            <Text style={styles.memberRole}>{member.role || 'Player'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// --- Stats Tab ---

function StatsTab({
  games,
  teamId,
  teamName,
}: {
  games: Game[];
  teamId: string;
  teamName?: string;
}) {
  const completedGames = games.filter((g) => g.status === 'completed');
  let wins = 0;
  let losses = 0;
  let ties = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;

  for (const game of completedGames) {
    const isHome = game.home_team?.id === teamId;
    const teamScore = isHome ? (game.home_score ?? 0) : (game.away_score ?? 0);
    const oppScore = isHome ? (game.away_score ?? 0) : (game.home_score ?? 0);

    pointsFor += teamScore;
    pointsAgainst += oppScore;

    if (teamScore > oppScore) wins++;
    else if (teamScore < oppScore) losses++;
    else ties++;
  }

  return (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <StatBox label="Record" value={`${wins}-${losses}${ties > 0 ? `-${ties}` : ''}`} />
        <StatBox label="Games Played" value={String(completedGames.length)} />
        <StatBox label="Points For" value={String(pointsFor)} />
        <StatBox label="Points Against" value={String(pointsAgainst)} />
      </View>

      {completedGames.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Completed Games</Text>
          <Text style={styles.emptyText}>Stats will populate as games are played.</Text>
        </View>
      )}
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  // Schedule styles
  gameCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
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
  // Roster styles
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  memberInitials: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.base,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  memberRole: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  // Stats styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    width: '48%',
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
  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing['2xl'],
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
