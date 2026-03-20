import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ScheduleScreen } from '../screens/player/ScheduleScreen';
import { MessagesScreen } from '../screens/shared/MessagesScreen';
import { PhotosScreen } from '../screens/shared/PhotosScreen';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { usePermissions, UserRole, ROLE_HIERARCHY } from '../contexts';
import { colors, tabColors } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Schedule: { active: 'calendar', inactive: 'calendar-outline' },
  Messages: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  Photos: { active: 'camera', inactive: 'camera-outline' },
  Admin: { active: 'shield', inactive: 'shield-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export function MainTabNavigator() {
  const { effectiveRole } = usePermissions();

  const managerIndex = ROLE_HIERARCHY.indexOf(UserRole.Manager);
  const userIndex = ROLE_HIERARCHY.indexOf(effectiveRole);
  const showAdminTab = userIndex >= managerIndex;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, size }) => {
          const icons = TAB_ICONS[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };
          const iconName = focused ? icons.active : icons.inactive;
          const iconColor = focused ? tabColors[route.name] || colors.primary : colors.textMuted;
          return <Ionicons name={iconName} size={size} color={iconColor} />;
        },
        tabBarActiveTintColor: tabColors[route.name] || colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.borderDefault,
          height: 88,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Photos" component={PhotosScreen} />
      {showAdminTab && <Tab.Screen name="Admin" component={AdminDashboardScreen} />}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
