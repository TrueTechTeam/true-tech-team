import type { BaseEntity } from './base';
import type { User } from './user';

/**
 * Type of message thread.
 */
export enum ThreadType {
  /** Direct message between users */
  Direct = 'direct',
  /** Team chat */
  Team = 'team',
  /** All captains in a division */
  Captains = 'captains',
  /** Refs for a league */
  Refs = 'refs',
  /** League-wide announcements */
  Announcement = 'announcement',
  /** Custom group */
  Custom = 'custom',
}

/**
 * A message thread (group chat or DM).
 */
export interface MessageThread extends BaseEntity {
  type: ThreadType;
  name?: string;
  /** Reference to team/division/league if applicable */
  referenceId?: string;
  referenceType?: 'team' | 'division' | 'league' | 'season';

  // Relations
  participants?: ThreadParticipant[];
  messages?: Message[];
}

/**
 * A participant in a message thread.
 */
export interface ThreadParticipant extends BaseEntity {
  threadId: string;
  userId: string;
  /** Last message read by this participant */
  lastReadMessageId?: string;
  /** Whether notifications are muted */
  isMuted: boolean;

  // Relations
  thread?: MessageThread;
  user?: User;
}

/**
 * A message in a thread.
 */
export interface Message extends BaseEntity {
  threadId: string;
  senderId: string;
  content: string;
  /** Optional image attachment */
  imageUrl?: string;

  // Relations
  thread?: MessageThread;
  sender?: User;
}
