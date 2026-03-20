import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../../theme';
import { sportColors } from '../../../theme/colors';

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

interface MyTeamsSectionProps {
  teams: TeamMembership[];
}

function getSportColor(sportName: string | undefined): string {
  if (!sportName) {return colors.primary;}
  const key = sportName.toLowerCase().replace(/\s+/g, '') as keyof typeof sportColors;
  return sportColors[key] || colors.primary;
}

function getCurrentTeams(teams: TeamMembership[]): TeamMembership[] {
  return teams.filter((membership) => {
    const status = membership.teams?.divisions?.seasons?.status;
    return status === 'active' || status === 'registration';
  });
}

export function MyTeamsSection({ teams }: MyTeamsSectionProps) {
  const navigation = useNavigation();

  const currentTeams = getCurrentTeams(teams);
  const displayTeams = currentTeams.slice(0, 3);
  const hasMore = teams.length > displayTeams.length;

  if (displayTeams.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Teams</Text>
        {hasMore && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AllTeams' as never)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.teamList}>
        {displayTeams.map((membership) => {
          const sportName = membership.teams?.divisions?.seasons?.leagues?.sports?.name;
          const sportColor = getSportColor(sportName);

          return (
            <TouchableOpacity
              key={membership.id}
              style={styles.teamCard}
              onPress={() =>
                navigation.navigate('TeamDetails' as never, { teamId: membership.teams?.id } as never)
              }
              activeOpacity={0.7}
            >
              <View style={[styles.sportIndicator, { backgroundColor: sportColor }]} />
              <View style={styles.teamContent}>
                <Text style={styles.teamName}>{membership.teams?.name}</Text>
                <Text style={styles.teamMeta}>
                  {sportName || 'Sport'} • {membership.teams?.divisions?.seasons?.name || 'Season'}
                </Text>
              </View>
              <Text style={[styles.roleTag, { color: sportColor }]}>
                {membership.role || 'Player'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  viewAllText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
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
  roleTag: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    paddingHorizontal: spacing.md,
    textTransform: 'capitalize',
  },
});
