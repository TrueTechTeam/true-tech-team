import { ScrollView, SafeAreaView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { colors, spacing } from '../../theme';
import { useAuth, usePermissions } from '../../contexts';
import {
  useMyTeams,
  useUpcomingGames,
  useRefereeGames,
  usePendingJoinRequests,
  useActiveSeasons,
} from '../../hooks';
import { LoadingSpinner, EmptyState } from '../../components/common';
import {
  GreetingHeader,
  UpcomingEventsSection,
  MyTeamsSection,
  CaptainRegistrationSection,
  RefereeDutiesSection,
  SuperlativeVotingCard,
} from './components';

export function HomeScreen() {
  const { user, profile } = useAuth();
  const { captainTeamIds, refereeSeasonIds } = usePermissions();

  const { data: myTeams, loading: teamsLoading, refetch: refetchTeams } = useMyTeams(user?.id);
  const {
    data: upcomingGames,
    loading: gamesLoading,
    refetch: refetchGames,
  } = useUpcomingGames(user?.id);
  const { data: refereeGames, refetch: refetchRefGames } = useRefereeGames(user?.id);
  const { data: pendingRequests } = usePendingJoinRequests(captainTeamIds);
  const { data: activeSeasons } = useActiveSeasons();

  const [refreshing, setRefreshing] = useState(false);

  const displayName = profile?.preferred_name || profile?.first_name || 'Player';

  const registrationSeasons = activeSeasons?.filter(
    (s: { status?: string }) => s.status === 'registration'
  );

  const votingSeason = activeSeasons?.find((s: { status?: string }) => s.status === 'active') as
    | { id: string; name: string }
    | undefined;

  const showCaptainSection = captainTeamIds.length > 0;
  const showRefereeSection = refereeSeasonIds.length > 0 && refereeGames && refereeGames.length > 0;

  const hasAnyContent =
    !!upcomingGames?.length ||
    !!myTeams?.length ||
    showCaptainSection ||
    showRefereeSection ||
    !!registrationSeasons?.length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTeams(), refetchGames(), refetchRefGames()]);
    setRefreshing(false);
  }, [refetchTeams, refetchGames, refetchRefGames]);

  const loading = teamsLoading || gamesLoading;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <GreetingHeader displayName={displayName} />
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
        {showRefereeSection && refereeGames && <RefereeDutiesSection games={refereeGames} />}

        {showCaptainSection && (
          <CaptainRegistrationSection
            captainTeamIds={captainTeamIds}
            pendingRequestCount={pendingRequests?.length || 0}
          />
        )}

        {votingSeason && (
          <SuperlativeVotingCard seasonId={votingSeason.id} seasonName={votingSeason.name} />
        )}

        <UpcomingEventsSection
          games={upcomingGames}
          registrationSeasons={registrationSeasons ?? null}
        />

        {myTeams && myTeams.length > 0 && <MyTeamsSection teams={myTeams} />}

        {!hasAnyContent && (
          <EmptyState
            icon="🏆"
            title="Welcome to Hotmess Sports!"
            message="Join a team or register for a season to get started."
          />
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
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
});
