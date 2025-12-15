import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { LoginScreen, WelcomeScreen } from '../screens/auth';
import { theme } from '@constants';
import { StorageService } from '@utils/storage';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
  // Check if welcome screen has been shown before
  const hasWelcomeScreenBeenShown = StorageService.preferences.getWelcomeScreenShown();

  // Set initial route based on whether welcome screen has been shown
  const initialRouteName = hasWelcomeScreenBeenShown ? 'Login' : 'Welcome';

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: theme.typography.fontWeight.semibold,
          fontSize: theme.typography.fontSize.lg,
        },
        headerBackTitle: '',
        animation: 'fade',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}

      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}

      />
    </Stack.Navigator>
  );
};
