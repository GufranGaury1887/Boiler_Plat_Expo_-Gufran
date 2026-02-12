import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Parameter List
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
};

// Bottom Tab Parameter List
export type BottomTabParamList = {
  Home: undefined;
  Settings: undefined;
  Profile: undefined;
};

// Main App Stack Parameter List
export type MainStackParamList = {
  BottomTabs: NavigatorScreenParams<BottomTabParamList>;
  Details: { itemId: string; title?: string };
};

// Root Stack Parameter List (combines Auth and Main)
export type RootStackParamList = AuthStackParamList & MainStackParamList;

// Auth Stack Navigation Props
export type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// Bottom Tab Screen Props (composed with MainStack for nested navigation)
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Home'>,
  NativeStackScreenProps<MainStackParamList>
>;
export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Profile'>,
  NativeStackScreenProps<MainStackParamList>
>;
export type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Settings'>,
  NativeStackScreenProps<MainStackParamList>
>;

// Main Stack Navigation Props
export type DetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'Details'>;

// Generic navigation prop types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>;

export type BottomTabScreenPropsGeneric<T extends keyof BottomTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, T>,
  NativeStackScreenProps<MainStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}