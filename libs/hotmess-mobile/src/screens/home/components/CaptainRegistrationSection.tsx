import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../../theme';
import { SectionCard } from '../../../components/common';

interface CaptainRegistrationSectionProps {
  captainTeamIds: string[];
  pendingRequestCount: number;
}

export function CaptainRegistrationSection({
  captainTeamIds,
  pendingRequestCount,
}: CaptainRegistrationSectionProps) {
  const navigation = useNavigation();

  return (
    <SectionCard title="Captain - Registration">
      <Text style={styles.subtitle}>
        You&apos;re captaining {captainTeamIds.length} team{captainTeamIds.length !== 1 ? 's' : ''}{' '}
        in registration
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TeamManagement', { teamId: captainTeamIds[0] })}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionText}>Manage Roster</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('InvitePlayers', { teamId: captainTeamIds[0] })}
        >
          <Text style={styles.actionIcon}>📨</Text>
          <Text style={styles.actionText}>Invite Players</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, pendingRequestCount > 0 && styles.actionButtonHighlight]}
          onPress={() => navigation.navigate('JoinRequests', { teamId: captainTeamIds[0] })}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>
            Requests{pendingRequestCount > 0 ? ` (${pendingRequestCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.bgTertiary,
    borderRadius: 8,
    gap: spacing.xs,
  },
  actionButtonHighlight: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
