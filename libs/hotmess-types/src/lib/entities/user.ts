import type { BaseEntity } from './base';

/**
 * User profile information.
 */
export interface User extends BaseEntity {
  /** Sports Engine user ID for authentication */
  sportsEngineId: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  pronouns?: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;

  /** Whether the user has completed onboarding */
  isOnboarded: boolean;
  /** Last t-shirt size ordered */
  lastTshirtSize?: string;
}

/**
 * User's notification preferences.
 */
export interface NotificationPreferences {
  userId: string;

  // Push notification settings
  pushEnabled: boolean;
  pushGameReminders: boolean;
  pushScoreUpdates: boolean;
  pushTeamMessages: boolean;
  pushSeasonAnnouncements: boolean;
  pushSuperlativeVoting: boolean;

  // Email settings
  emailEnabled: boolean;
  emailWeeklyDigest: boolean;
  emailGameCancellations: boolean;
}
