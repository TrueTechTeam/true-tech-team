import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { PlayerTabNavigator } from './PlayerTabNavigator';
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
            name="PlayerTabs"
            component={PlayerTabNavigator}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
