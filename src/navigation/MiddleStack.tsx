import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MiddleStackParamList } from '../types';
import { AddMemberScreen } from '../screens/auth';
import { theme } from '../constants';

const Stack = createNativeStackNavigator<MiddleStackParamList>();

export const MiddleStack: React.FC = () => {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="AddMember"
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
        name="AddMember"
        component={AddMemberScreen}
      />
    </Stack.Navigator>
  );
};
