import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useRef } from 'react';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { useAuth, usePermissions } from '../../contexts';
import { useThreadMessages } from '../../hooks';
import { LoadingSpinner } from '../../components/common';

type Props = RootStackScreenProps<'ThreadDetail'>;

interface Message {
  id: string;
  sender_id?: string;
  sender_name?: string;
  content?: string;
  body?: string;
  created_at: string;
}

export function ThreadDetailScreen({ route }: Props) {
  const { threadId, threadType } = route.params;
  const { user } = useAuth();
  const { effectiveRole } = usePermissions();
  const { data: messages, loading } = useThreadMessages(threadId);
  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const allMessages = [...(messages || []), ...localMessages] as Message[];
  const isAnnouncement = threadType === 'announcement';
  // Admins, commissioners, and managers can send announcements
  const canSendAnnouncement =
    isAnnouncement &&
    (effectiveRole === 'admin' || effectiveRole === 'commissioner' || effectiveRole === 'manager');
  const canSend = !isAnnouncement || canSendAnnouncement;

  const handleSend = () => {
    if (!inputText.trim()) {return;}

    const newMessage: Message = {
      id: `local-${Date.now()}`,
      sender_id: user?.id || 'current-user',
      sender_name: 'You',
      content: inputText.trim(),
      created_at: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.sender_id === user?.id || item.sender_id === 'current-user';
    const messageText = item.content || item.body || '';

    return (
      <View style={[styles.messageBubbleRow, isOwn && styles.messageBubbleRowOwn]}>
        {!isOwn && <Text style={styles.senderName}>{item.sender_name || 'Unknown'}</Text>}
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>{messageText}</Text>
          <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={allMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
            </View>
          }
        />

        {canSend && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={canSendAnnouncement ? 'Send announcement...' : 'Type a message...'}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}

        {!canSend && (
          <View style={styles.announcementBar}>
            <Text style={styles.announcementText}>Announcements are read-only</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  flex: {
    flex: 1,
  },
  messageList: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  messageBubbleRow: {
    marginBottom: spacing.sm,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageBubbleRowOwn: {
    alignSelf: 'flex-end',
  },
  senderName: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginBottom: 2,
    marginLeft: spacing.sm,
  },
  messageBubble: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.bgSecondary,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  messageText: {
    fontSize: typography.fontSizes.base,
    color: colors.textPrimary,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.fontSizes.base,
    color: colors.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    backgroundColor: colors.bgSecondary,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSizes.base,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
  },
  announcementBar: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    backgroundColor: colors.bgSecondary,
    alignItems: 'center',
  },
  announcementText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
