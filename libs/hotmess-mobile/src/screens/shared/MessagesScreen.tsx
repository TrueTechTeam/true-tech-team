import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme';

const threads = [
  { id: '1', name: 'Team Chat', lastMessage: 'See everyone Saturday!', time: '2m', unread: 3 },
  {
    id: '2',
    name: 'Captain Chat',
    lastMessage: 'Reminder: Bring your jerseys',
    time: '1h',
    unread: 0,
  },
  {
    id: '3',
    name: 'League Announcements',
    lastMessage: 'Schedule updated for week 8',
    time: '3h',
    unread: 1,
  },
];

export function MessagesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {threads.map((thread) => (
          <TouchableOpacity key={thread.id} style={styles.threadItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{thread.name.charAt(0)}</Text>
            </View>
            <View style={styles.threadContent}>
              <View style={styles.threadHeader}>
                <Text style={styles.threadName}>{thread.name}</Text>
                <Text style={styles.threadTime}>{thread.time}</Text>
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {thread.lastMessage}
              </Text>
            </View>
            {thread.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{thread.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
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
