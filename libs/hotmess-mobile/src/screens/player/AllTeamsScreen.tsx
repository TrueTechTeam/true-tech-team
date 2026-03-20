import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import { sportColors } from '../../theme/colors';
import { useAuth } from '../../contexts';
import { useMyTeams } from '../../hooks';
import { LoadingSpinner } from '../../components/common';

function getSportColor(sportName: string | undefined): string {
  if (!sportName) return colors.primary;
  const key = sportName.toLowerCase().replace(/\s+/g, '') as keyof typeof sportColors;
  return sportColors[key] || colors.primary;
}

export function AllTeamsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: teams, loading, refetch } = useMyTeams(user?.id);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  // Group teams by season status
  const currentTeams = (teams ?? []).filter((m) => {
    const status = m.teams?.divisions?.seasons?.status;
    return status === 'active' || status === 'registration';
  });
  const pastTeams = (teams ?? []).filter((m) => {
    const status = m.teams?.divisions?.seasons?.status;
    return status !== 'active' && status !== 'registration';
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {currentTeams.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Teams</Text>
            <View style={styles.teamList}>
              {currentTeams.map((membership) => (
                <TeamCard
                  key={membership.id}
                  membership={membership}
                  onPress={() =>
                    navigation.navigate('TeamDetails' as never, { teamId: membership.teams?.id } as never)
                  }
                />
              ))}
            </View>
          </View>
        )}

        {pastTeams.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Teams</Text>
            <View style={styles.teamList}>
              {pastTeams.map((membership) => (
                <TeamCard
                  key={membership.id}
                  membership={membership}
                  onPress={() =>
                    navigation.navigate('TeamDetails' as never, { teamId: membership.teams?.id } as never)
                  }
                />
              ))}
            </View>
          </View>
        )}

        {(!teams || teams.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Teams Yet</Text>
            <Text style={styles.emptyText}>Join a team or register for a season to get started.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface TeamMembership {
  id: string;
  team_id: string;
  role?: string;
  teams?: {
    id: string;
    name: string;
    divisions?: {
      id: string;
      name: string;
      seasons?: {
        id: string;
        name: string;
        status?: string;
        leagues?: {
          name: string;
          sports?: { name: string };
          cities?: { name: string };
        };
      };
    };
  };
}

function TeamCard({ membership, onPress }: { membership: TeamMembership; onPress: () => void }) {
  const sportName = membership.teams?.divisions?.seasons?.leagues?.sports?.name;
  const sportColor = getSportColor(sportName);

  return (
    <TouchableOpacity style={styles.teamCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.sportIndicator, { backgroundColor: sportColor }]} />
      <View style={styles.teamContent}>
        <Text style={styles.teamName}>{membership.teams?.name}</Text>
        <Text style={styles.teamMeta}>
          {sportName || 'Sport'} • {membership.teams?.divisions?.seasons?.name || 'Season'}
        </Text>
        {membership.teams?.divisions?.seasons?.leagues?.cities?.name && (
          <Text style={styles.teamCity}>
            {membership.teams.divisions.seasons.leagues.cities.name}
          </Text>
        )}
      </View>
      <Text style={[styles.roleTag, { color: sportColor }]}>
        {membership.role || 'Player'}
      </Text>
    </TouchableOpacity>
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  teamList: {
    gap: spacing.sm,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  sportIndicator: {
    width: 4,
    height: '100%',
  },
  teamContent: {
    flex: 1,
    padding: spacing.md,
  },
  teamName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  teamMeta: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  teamCity: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleTag: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    paddingHorizontal: spacing.md,
    textTransform: 'capitalize',
  },
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
