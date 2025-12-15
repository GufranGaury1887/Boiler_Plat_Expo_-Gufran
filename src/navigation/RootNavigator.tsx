import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '@stores/authStore';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { LoadingSpinner } from '@components/common';
import * as SplashScreen from 'expo-splash-screen';
import { navigationRef } from './navigationRef';
import NotificationManager from '@utils/NotificationManager';

// Navigation component that switches between Auth, Middle and Main stacks
const AppNavigator: React.FC = () => {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Otherwise show MainStack
  return <MainStack />;
};

// Root Navigator
export const RootNavigator: React.FC = () => {
  useEffect(() => {
    const initializeFCM = async () => {
      try {
        // Initialize notification manager (this handles initial notifications from killed state)
        await NotificationManager.initialize();

        // Set up foreground event listener (when app is active)
        NotificationManager.setForegroundEventListener((type, detail) => {
          console.log("Foreground notification event:", type, detail);
          // The navigation handling is now done inside NotificationManager
        });

        // Set up background event listener (when app is backgrounded)
        NotificationManager.setBackgroundEventListener((type, detail) => {
          console.log("Background notification event:", type, detail);
          // The navigation handling is now done inside NotificationManager
        });

        // Handle initial notification for Android (when app is launched from notification)
        NotificationManager.setInitialNotificationAndroidEvent(
          ({ notification, pressAction }) => {
            // The navigation handling is now done inside NotificationManager
          }
        );
      } catch (error) {
        console.error("Error initializing FCM:", error);
      }
    };

    initializeFCM();

    return () => {
      NotificationManager.removeListeners();
    };
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        setTimeout(() => {
          SplashScreen.hide();
        }, 300);
        // Process any pending navigation queued from a notification
        NotificationManager.executePendingNavigation();
      }}>
      <AppNavigator />
    </NavigationContainer>
  );
};
