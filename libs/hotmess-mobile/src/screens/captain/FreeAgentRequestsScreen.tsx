import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState } from 'react';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { EmptyState } from '../../components/common';

type Props = RootStackScreenProps<'FreeAgentRequests'>;

// Mock free agents for development
const MOCK_FREE_AGENTS = [
  { id: 'fa-1', name: 'Casey Rivera', position: 'Utility', experience: '2 seasons' },
  { id: 'fa-2', name: 'Morgan Chen', position: 'Kicker', experience: '1 season' },
  { id: 'fa-3', name: 'Taylor Kim', position: 'Outfield', experience: 'New player' },
];

export function FreeAgentRequestsScreen({ route }: Props) {
  const { teamId: _teamId } = route.params;
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const handleRequest = (agent: { id: string; name: string }) => {
    Alert.alert('Request Free Agent', `Send a request to ${agent.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Request',
        onPress: () => {
          setRequestedIds((prev) => new Set(prev).add(agent.id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.description}>
          Free agents are available players looking for a team. Send them a request to join yours.
        </Text>

        {MOCK_FREE_AGENTS.length > 0 ? (
          <View style={styles.list}>
            {MOCK_FREE_AGENTS.map((agent) => {
              const isRequested = requestedIds.has(agent.id);
              return (
                <View key={agent.id} style={styles.agentCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{agent.name[0]}</Text>
                  </View>
                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <Text style={styles.agentMeta}>
                      {agent.position} • {agent.experience}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.requestButton, isRequested && styles.requestedButton]}
                    onPress={() => handleRequest(agent)}
                    disabled={isRequested}
                  >
                    <Text
                      style={[styles.requestButtonText, isRequested && styles.requestedButtonText]}
                    >
                      {isRequested ? 'Requested' : 'Request'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon="🏃"
            title="No Free Agents"
            message="There are no free agents available for your league right now."
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
  description: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.sm,
  },
  agentCard: {
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
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  agentMeta: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  requestButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  requestedButton: {
    backgroundColor: colors.bgTertiary,
  },
  requestButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
  },
  requestedButtonText: {
    color: colors.textMuted,
  },
});
