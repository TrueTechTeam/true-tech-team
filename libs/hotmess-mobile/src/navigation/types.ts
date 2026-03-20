import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type AuthStackParamList = {
  Login: undefined;
  Welcome: undefined;
};

// Main Tab Navigator (adaptive - shows/hides tabs based on role)
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type MainTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Messages: undefined;
  Photos: undefined;
  Admin: undefined;
  Profile: undefined;
};

// Root Stack
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  // Detail screens pushed on top of tabs
  GameDetails: { gameId: string };
  TeamDetails: { teamId: string };
  PlayerProfile: { userId: string };
  Settings: undefined;
  Notifications: undefined;
  NotificationPreferences: undefined;
  EditProfile: undefined;
  Privacy: undefined;
  ThreadDetail: { threadId: string; threadName: string; threadType: string };
  TeamManagement: { teamId: string };
  ScoreEntry: { gameId: string };
  SuperlativeVoting: { seasonId: string };
  SuperlativeNominations: { seasonId: string; teamId: string };
  InvitePlayers: { teamId: string };
  FreeAgentRequests: { teamId: string };
  JoinRequests: { teamId: string };
  AllTeams: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
