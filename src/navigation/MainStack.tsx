import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackParamList } from "../types";
import { BottomTabNavigator } from "./BottomTabNavigator";
import { useTheme } from "../stores/themeStore";

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="BottomTabs"
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
        headerBackTitle: "",
        animation: "fade",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="BottomTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
