import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { DashboardScreen } from '../screens/player/DashboardScreen';
import { ScheduleScreen } from '../screens/player/ScheduleScreen';
import { MessagesScreen } from '../screens/shared/MessagesScreen';
import { PhotosScreen } from '../screens/shared/PhotosScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { colors } from '../theme';
import type { PlayerTabParamList } from './types';

const Tab = createBottomTabNavigator<PlayerTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🏠',
    Schedule: '📅',
    Messages: '💬',
    Photos: '📷',
    Profile: '👤',
  };
  return <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{icons[name] || '•'}</Text>;
}

export function PlayerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.borderDefault,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Photos" component={PhotosScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
