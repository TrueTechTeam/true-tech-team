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
import { Ionicons } from '@expo/vector-icons';
import { colors, tabColors, spacing, typography } from '../../theme';
import { useAuth } from '../../contexts';
import { useMessageThreads } from '../../hooks';
import { LoadingSpinner, EmptyState } from '../../components/common';

interface Thread {
  id: string;
  threads?: {
    id: string;
    name: string;
    type: string;
    last_message?: string;
    last_message_at?: string;
    unread_count?: number;
  };
  // Flat mock data shape
  name?: string;
  type?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

const THREAD_TYPE_ORDER = ['announcement', 'team', 'captain', 'referee', 'direct'];

function getThreadData(thread: Thread) {
  // Handle both nested (real) and flat (mock) data shapes
  const t = thread.threads || thread;
  return {
    id: t.id || thread.id,
    name: t.name || 'Chat',
    type: t.type || 'team',
    lastMessage: t.last_message || '',
    lastMessageAt: t.last_message_at || '',
    unreadCount: t.unread_count || 0,
  };
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'announcement':
      return 'Announcements';
    case 'team':
      return 'Team Chats';
    case 'captain':
      return 'Captain Chats';
    case 'referee':
      return 'Referee Chat';
    case 'direct':
      return 'Direct Messages';
    default:
      return 'Other';
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'announcement':
      return 'A';
    case 'team':
      return 'T';
    case 'captain':
      return 'C';
    case 'referee':
      return 'R';
    case 'direct':
      return 'D';
    default:
      return '?';
  }
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) {
    return '';
  }
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) {
    return 'now';
  }
  if (diffMin < 60) {
    return `${diffMin}m`;
  }
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr}h`;
  }
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d`;
}

export function MessagesScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: rawThreads, loading, refetch } = useMessageThreads(user?.id);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const threads = (rawThreads || []) as Thread[];

  // Group threads by type
  const grouped = THREAD_TYPE_ORDER.map((type) => ({
    type,
    label: getTypeLabel(type),
    threads: threads
      .map((t) => ({ raw: t, data: getThreadData(t) }))
      .filter((t) => t.data.type === type),
  })).filter((g) => g.threads.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="chatbubbles"
          size={24}
          color={tabColors.Messages}
          style={styles.headerIcon}
        />
        <Text style={styles.title}>Messages</Text>
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
        {loading && !refreshing ? (
          <LoadingSpinner />
        ) : grouped.length > 0 ? (
          grouped.map((group) => (
            <View key={group.type} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.threads.map(({ data }) => (
                <TouchableOpacity
                  key={data.id}
                  style={styles.threadItem}
                  onPress={() =>
                    navigation.navigate('ThreadDetail', {
                      threadId: data.id,
                      threadName: data.name,
                      threadType: data.type,
                    })
                  }
                >
                  <View
                    style={[
                      styles.avatar,
                      data.type === 'announcement' && styles.avatarAnnouncement,
                    ]}
                  >
                    <Text style={styles.avatarText}>{getTypeIcon(data.type)}</Text>
                  </View>
                  <View style={styles.threadContent}>
                    <View style={styles.threadHeader}>
                      <Text style={styles.threadName} numberOfLines={1}>
                        {data.name}
                      </Text>
                      {data.lastMessageAt && (
                        <Text style={styles.threadTime}>
                          {formatRelativeTime(data.lastMessageAt)}
                        </Text>
                      )}
                    </View>
                    {data.lastMessage ? (
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {data.lastMessage}
                      </Text>
                    ) : null}
                  </View>
                  {data.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{data.unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <EmptyState
            icon="💬"
            title="No Messages"
            message="Join a team to start chatting with your teammates."
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
  header: {
    backgroundColor: colors.bgSecondary,
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  group: {
    marginBottom: spacing.md,
  },
  groupLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarAnnouncement: {
    backgroundColor: colors.accent,
  },
  avatarText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.lg,
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  threadName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  threadTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
  },
  lastMessage: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: colors.textPrimary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
});
