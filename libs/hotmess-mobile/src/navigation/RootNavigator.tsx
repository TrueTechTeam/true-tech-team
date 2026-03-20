import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ThreadDetailScreen } from '../screens/messages/ThreadDetailScreen';
import { TeamManagementScreen } from '../screens/captain/TeamManagementScreen';
import { InvitePlayersScreen } from '../screens/captain/InvitePlayersScreen';
import { JoinRequestsScreen } from '../screens/captain/JoinRequestsScreen';
import { FreeAgentRequestsScreen } from '../screens/captain/FreeAgentRequestsScreen';
import { SuperlativeNominationsScreen } from '../screens/captain/SuperlativeNominationsScreen';
import { ScoreEntryScreen } from '../screens/referee/ScoreEntryScreen';
import { SuperlativeVotingScreen } from '../screens/superlatives/SuperlativeVotingScreen';
import { NotificationPreferencesScreen } from '../screens/settings/NotificationPreferencesScreen';
import { EditProfileScreen } from '../screens/settings/EditProfileScreen';
import { PrivacyScreen } from '../screens/settings/PrivacyScreen';
import { TeamDetailsScreen } from '../screens/player/TeamDetailsScreen';
import { AllTeamsScreen } from '../screens/player/AllTeamsScreen';
import type { RootStackParamList } from './types';
import { colors } from '../theme';
import { useAuth } from '../contexts';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.bgPrimary,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bgSecondary,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.bgPrimary,
        },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ThreadDetail"
            component={ThreadDetailScreen}
            options={({ route }) => ({ title: route.params.threadName })}
          />
          <Stack.Screen
            name="TeamManagement"
            component={TeamManagementScreen}
            options={{ title: 'Team Management' }}
          />
          <Stack.Screen
            name="InvitePlayers"
            component={InvitePlayersScreen}
            options={{ title: 'Invite Players' }}
          />
          <Stack.Screen
            name="JoinRequests"
            component={JoinRequestsScreen}
            options={{ title: 'Join Requests' }}
          />
          <Stack.Screen
            name="FreeAgentRequests"
            component={FreeAgentRequestsScreen}
            options={{ title: 'Free Agents' }}
          />
          <Stack.Screen
            name="ScoreEntry"
            component={ScoreEntryScreen}
            options={{ title: 'Enter Score' }}
          />
          <Stack.Screen
            name="SuperlativeVoting"
            component={SuperlativeVotingScreen}
            options={{ title: 'Superlative Voting' }}
          />
          <Stack.Screen
            name="SuperlativeNominations"
            component={SuperlativeNominationsScreen}
            options={{ title: 'Nominations' }}
          />
          <Stack.Screen
            name="NotificationPreferences"
            component={NotificationPreferencesScreen}
            options={{ title: 'Notifications' }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: 'Edit Profile' }}
          />
          <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy' }} />
          <Stack.Screen
            name="TeamDetails"
            component={TeamDetailsScreen}
            options={{ title: 'Team Details' }}
          />
          <Stack.Screen
            name="AllTeams"
            component={AllTeamsScreen}
            options={{ title: 'All Teams' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
