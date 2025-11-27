import React, { useEffect, useState } from 'react';
import { RootNavigator } from './src/navigation';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppLoader, { loaderRef } from './src/components/common/AppLoader';
import Toast from 'react-native-toast-message';
import { QueryProvider } from './src/providers/QueryProvider';
import { StorageService } from './src';
import { useAuthStore } from './src/stores';
import { toastConfig } from './src/components/common/ToastConfig';
import * as Sentry from "@sentry/react-native";

import * as SplashScreen from 'expo-splash-screen';
import Constants from './src/constants/Constants';
import { LogBox, View, Text, TextInput } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SlowInternet } from './src/components/common';
import { moderateScale } from './src/utils/scaling';
import SVG from './src/assets/icons';
import { Fonts } from './src/constants/Fonts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


if (__DEV__) {
  require("./ReactotronConfig");
}

SplashScreen.preventAutoHideAsync();

function App() {
  const login = useAuthStore((state) => state.login);
  const setLoading = useAuthStore((state) => state.setLoading);
  const [isConnected, setIsConnected] = useState(true);
  const [isSlowConnection, setSlowConnection] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = !!state.isConnected;
      const isSlowConnection =
        isConnected &&
        state.type === "cellular" &&
        state.details?.cellularGeneration === "3g";

      setIsConnected(isConnected);
      setSlowConnection(isSlowConnection);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const initialize = () => {
      try {
        if (__DEV__) {
          LogBox.ignoreAllLogs();
        } else {
          Sentry.init({
            dsn: Constants.SENTRY_SESSION_ID,
          });
        }
        setLoading(true);
        const stored = StorageService.auth.getUser();
        if (stored?.accessToken && stored?.user) {
          login(stored.user, stored.accessToken, stored.authorizationToken);
        }
      } catch (e) {
        console.log('Auth restore failed', e);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [login, setLoading]);

  if (!isConnected) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}>
        <SVG.no_wifi width={moderateScale(50)} height={moderateScale(50)} />
        <Text
          style={{
            marginTop: moderateScale(2),
            fontSize: moderateScale(16),
            fontFamily: Fonts.outfitBold,
          }}>
          No Internet Connection
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <KeyboardProvider>
            <RootNavigator />
            {isSlowConnection && (
              <SlowInternet
                isLoading={true}
                message="Slow internet connection detected"
              />
            )}
            <AppLoader ref={loaderRef} />
            <Toast config={toastConfig} />
          </KeyboardProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


export default App;
