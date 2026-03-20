import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { useTeamMembers } from '../../hooks';
import { LoadingSpinner, EmptyState } from '../../components/common';

type Props = RootStackScreenProps<'TeamManagement'>;

export function TeamManagementScreen({ route }: Props) {
  const { teamId } = route.params;
  const navigation = useNavigation();
  const { data: members, loading, refetch } = useTeamMembers(teamId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const activePlayers = members?.filter((m) => m.status === 'active' || !m.status) || [];
  const pendingPlayers = members?.filter((m) => m.status === 'requested') || [];

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('InvitePlayers', { teamId })}
          >
            <Text style={styles.actionButtonText}>Invite Players</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('FreeAgentRequests', { teamId })}
          >
            <Text style={styles.actionButtonText}>Free Agents</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Requests */}
        {pendingPlayers.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity onPress={() => navigation.navigate('JoinRequests', { teamId })}>
              <View style={styles.pendingBanner}>
                <Text style={styles.pendingText}>
                  {pendingPlayers.length} pending request{pendingPlayers.length !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.pendingArrow}>View &rsaquo;</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Roster */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Roster ({activePlayers.length})</Text>
          {loading && !refreshing ? (
            <LoadingSpinner />
          ) : activePlayers.length > 0 ? (
            <View style={styles.memberList}>
              {activePlayers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberCard}
                  onPress={() => navigation.navigate('PlayerProfile', { userId: member.user_id })}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.avatarText}>
                      {(member.first_name?.[0] || '?').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.first_name} {member.last_name}
                    </Text>
                    <Text style={styles.memberRole}>{member.role || 'Player'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="👥"
              title="No Players Yet"
              message="Invite players or accept join requests to build your roster."
            />
          )}
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
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
  pendingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  pendingText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.semibold,
  },
  pendingArrow: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.semibold,
  },
  memberList: {
    gap: spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: 12,
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
  avatarText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
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
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    textTransform: 'capitalize',
    marginTop: 2,
  },
});
