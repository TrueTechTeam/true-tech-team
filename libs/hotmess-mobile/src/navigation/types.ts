import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type AuthStackParamList = {
  Login: undefined;
  Welcome: undefined;
};

// Main Tab Navigator (Player role)
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PlayerTabParamList = {
  Dashboard: undefined;
  Schedule: undefined;
  Messages: undefined;
  Photos: undefined;
  Profile: undefined;
};

// Captain Tab Navigator
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type CaptainTabParamList = {
  Dashboard: undefined;
  Schedule: undefined;
  Team: undefined;
  Messages: undefined;
  Profile: undefined;
};

// Root Stack
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
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
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
