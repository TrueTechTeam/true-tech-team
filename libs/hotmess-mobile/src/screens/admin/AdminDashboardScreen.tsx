import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions, UserRole, ROLE_HIERARCHY } from '../../contexts';
import { useCities, useLeagues, useActiveSeasons, useTeams } from '../../hooks';
import { colors, tabColors, spacing, typography } from '../../theme';
import { SectionCard } from '../../components/common';

export function AdminDashboardScreen() {
  const { effectiveRole, commissionerCityIds, managedSeasonIds } = usePermissions();
  const { data: cities } = useCities();
  const { data: leagues } = useLeagues();
  const { data: seasons, refetch: refetchSeasons } = useActiveSeasons();
  const { data: teams } = useTeams();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchSeasons();
    setRefreshing(false);
  }, [refetchSeasons]);

  const isCommissioner =
    ROLE_HIERARCHY.indexOf(effectiveRole) >= ROLE_HIERARCHY.indexOf(UserRole.Commissioner);
  const isAdmin = ROLE_HIERARCHY.indexOf(effectiveRole) >= ROLE_HIERARCHY.indexOf(UserRole.Admin);

  const registrationSeasons =
    seasons?.filter((s: { status?: string }) => s.status === 'registration') || [];
  const activeGameSeasons =
    seasons?.filter((s: { status?: string }) => s.status === 'active') || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="shield" size={24} color={tabColors.Admin} style={styles.headerIcon} />
          <Text style={styles.pageTitle}>Admin Dashboard</Text>
          <Text style={styles.roleLabel}>{effectiveRole.replace(/_/g, ' ')}</Text>
        </View>
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
        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          {isCommissioner && (
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{commissionerCityIds.length}</Text>
              <Text style={styles.statLabel}>Cities</Text>
            </View>
          )}
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{managedSeasonIds.length}</Text>
            <Text style={styles.statLabel}>Managed Seasons</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{leagues?.length || 0}</Text>
            <Text style={styles.statLabel}>Leagues</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{teams?.length || 0}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
        </View>

        {/* Registration Seasons */}
        {registrationSeasons.length > 0 && (
          <SectionCard title="Registration Open">
            {registrationSeasons.map(
              (season: {
                id: string;
                name: string;
                leagues?: { name: string; sports?: { name: string } };
              }) => (
                <View key={season.id} style={styles.seasonItem}>
                  <Text style={styles.seasonName}>{season.name}</Text>
                  <Text style={styles.seasonMeta}>
                    {season.leagues?.name} • {season.leagues?.sports?.name}
                  </Text>
                </View>
              )
            )}
          </SectionCard>
        )}

        {/* Active Seasons */}
        {activeGameSeasons.length > 0 && (
          <SectionCard title="Active Seasons">
            {activeGameSeasons.map(
              (season: {
                id: string;
                name: string;
                leagues?: { name: string; sports?: { name: string } };
              }) => (
                <View key={season.id} style={styles.seasonItem}>
                  <Text style={styles.seasonName}>{season.name}</Text>
                  <Text style={styles.seasonMeta}>
                    {season.leagues?.name} • {season.leagues?.sports?.name}
                  </Text>
                </View>
              )
            )}
          </SectionCard>
        )}

        {/* Commissioner: City Overview */}
        {isCommissioner && cities && (
          <SectionCard title="City Overview">
            {cities
              .filter((c: { id: string }) => (isAdmin ? true : commissionerCityIds.includes(c.id)))
              .slice(0, 5)
              .map((city: { id: string; name: string; state: string }) => (
                <View key={city.id} style={styles.cityItem}>
                  <Text style={styles.cityName}>
                    {city.name}, {city.state}
                  </Text>
                  <Text style={styles.cityMeta}>
                    {leagues?.filter((l: { city_id: string }) => l.city_id === city.id).length || 0}{' '}
                    leagues
                  </Text>
                </View>
              ))}
          </SectionCard>
        )}

        {/* Admin: System Stats */}
        {isAdmin && (
          <SectionCard title="System Overview">
            <View style={styles.systemStats}>
              <Text style={styles.systemStat}>Cities: {cities?.length || 0}</Text>
              <Text style={styles.systemStat}>Leagues: {leagues?.length || 0}</Text>
              <Text style={styles.systemStat}>Active Seasons: {activeGameSeasons.length}</Text>
              <Text style={styles.systemStat}>Registration: {registrationSeasons.length}</Text>
            </View>
          </SectionCard>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Full management tools are available on the web dashboard
          </Text>
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
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  pageTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  roleLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.accent,
    textTransform: 'capitalize',
    marginLeft: 'auto',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
    textAlign: 'center',
  },
  seasonItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  seasonName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  seasonMeta: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  cityName: {
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
  },
  cityMeta: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
  },
  systemStats: {
    gap: spacing.sm,
  },
  systemStat: {
    fontSize: typography.fontSizes.base,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
