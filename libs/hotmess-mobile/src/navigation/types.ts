import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Welcome: undefined;
};

// Main Tab Navigator (Player role)
export type PlayerTabParamList = {
  Dashboard: undefined;
  Schedule: undefined;
  Messages: undefined;
  Photos: undefined;
  Profile: undefined;
};

// Captain Tab Navigator
export type CaptainTabParamList = {
  Dashboard: undefined;
  Schedule: undefined;
  Team: undefined;
  Messages: undefined;
  Profile: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  PlayerTabs: NavigatorScreenParams<PlayerTabParamList>;
  CaptainTabs: NavigatorScreenParams<CaptainTabParamList>;
  // Shared screens
  GameDetails: { gameId: string };
  TeamDetails: { teamId: string };
  PlayerProfile: { userId: string };
  Settings: undefined;
  Notifications: undefined;
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

export type PlayerTabScreenProps<T extends keyof PlayerTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<PlayerTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
