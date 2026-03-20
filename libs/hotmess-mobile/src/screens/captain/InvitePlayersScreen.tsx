import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useState } from 'react';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { EmptyState } from '../../components/common';

type Props = RootStackScreenProps<'InvitePlayers'>;

interface SearchResult {
  id: string;
  name: string;
  email: string;
}

export function InvitePlayersScreen({ route }: Props) {
  const { teamId: _teamId } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  // For mock mode, provide some sample results
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      // Mock search results for dev
      setResults(
        [
          { id: 'user-search-1', name: 'Alex Johnson', email: 'alex@example.com' },
          { id: 'user-search-2', name: 'Sam Williams', email: 'sam@example.com' },
          { id: 'user-search-3', name: 'Jordan Brown', email: 'jordan@example.com' },
        ].filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
      );
    } else {
      setResults([]);
    }
  };

  const handleInvite = (user: SearchResult) => {
    Alert.alert('Invite Sent', `Invitation sent to ${user.name}`, [{ text: 'OK' }]);
    setInvitedIds((prev) => new Set(prev).add(user.id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        {results.length > 0 ? (
          <View style={styles.resultsList}>
            {results.map((user) => {
              const isInvited = invitedIds.has(user.id);
              return (
                <View key={user.id} style={styles.resultCard}>
                  <View style={styles.resultAvatar}>
                    <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{user.name}</Text>
                    <Text style={styles.resultEmail}>{user.email}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.inviteButton, isInvited && styles.invitedButton]}
                    onPress={() => handleInvite(user)}
                    disabled={isInvited}
                  >
                    <Text style={[styles.inviteButtonText, isInvited && styles.invitedButtonText]}>
                      {isInvited ? 'Invited' : 'Invite'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : searchQuery.length >= 2 ? (
          <EmptyState
            icon="🔍"
            title="No Results"
            message="No players found matching your search."
          />
        ) : (
          <EmptyState
            icon="📨"
            title="Invite Players"
            message="Search by name or email to invite players to your team."
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
  searchContainer: {
    padding: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.base,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
    paddingTop: 0,
  },
  resultsList: {
    gap: spacing.sm,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  resultAvatar: {
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
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  resultEmail: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  inviteButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  invitedButton: {
    backgroundColor: colors.bgTertiary,
  },
  inviteButtonText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
  },
  invitedButtonText: {
    color: colors.textMuted,
  },
});
