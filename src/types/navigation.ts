import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Auth Stack Parameter List
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
};



// Main App Stack Parameter List
export type MainStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
  Details: { itemId: string; title?: string };

};

// Root Stack Parameter List (combines Auth, Middle and Main)
export type RootStackParamList = AuthStackParamList & MainStackParamList;

// Auth Stack Navigation Props
export type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;



// Main Stack Navigation Props
export type HomeScreenProps = NativeStackScreenProps<MainStackParamList, 'Home'>;
export type ProfileScreenProps = NativeStackScreenProps<MainStackParamList, 'Profile'>;
export type SettingsScreenProps = NativeStackScreenProps<MainStackParamList, 'Settings'>;
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


declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}