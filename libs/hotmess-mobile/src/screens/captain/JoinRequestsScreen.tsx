import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useState, useCallback } from 'react';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { usePendingJoinRequests } from '../../hooks';
import { LoadingSpinner, EmptyState } from '../../components/common';

type Props = RootStackScreenProps<'JoinRequests'>;

export function JoinRequestsScreen({ route }: Props) {
  const { teamId } = route.params;
  const { data: requests, loading, refetch } = usePendingJoinRequests([teamId]);
  const [refreshing, setRefreshing] = useState(false);
  const [handledIds, setHandledIds] = useState<Set<string>>(new Set());

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleAccept = (requestId: string, playerName: string) => {
    Alert.alert('Accept Request', `Accept ${playerName} to the team?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () => {
          setHandledIds((prev) => new Set(prev).add(requestId));
        },
      },
    ]);
  };

  const handleDecline = (requestId: string, playerName: string) => {
    Alert.alert('Decline Request', `Decline ${playerName}'s request?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          setHandledIds((prev) => new Set(prev).add(requestId));
        },
      },
    ]);
  };

  const pendingRequests = requests?.filter((r: { id: string }) => !handledIds.has(r.id)) || [];

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
        {loading && !refreshing ? (
          <LoadingSpinner />
        ) : pendingRequests.length > 0 ? (
          <View style={styles.list}>
            {pendingRequests.map(
              (request: {
                id: string;
                first_name?: string;
                last_name?: string;
                user_id?: string;
              }) => {
                const name = request.first_name
                  ? `${request.first_name} ${request.last_name || ''}`
                  : 'Unknown Player';
                return (
                  <View key={request.id} style={styles.requestCard}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {(request.first_name?.[0] || '?').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>{name}</Text>
                      <Text style={styles.requestMeta}>Wants to join your team</Text>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAccept(request.id, name)}
                      >
                        <Text style={styles.acceptText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDecline(request.id, name)}
                      >
                        <Text style={styles.declineText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }
            )}
          </View>
        ) : (
          <EmptyState
            icon="📋"
            title="No Pending Requests"
            message="You'll see join requests from players here."
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
  list: {
    gap: spacing.sm,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  avatar: {
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
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  requestMeta: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  acceptButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  acceptText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  declineButton: {
    backgroundColor: colors.bgTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  declineText: {
    color: colors.error,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
});
