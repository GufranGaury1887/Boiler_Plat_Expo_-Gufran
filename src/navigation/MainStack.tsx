import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types';
import {
  HomeScreen,
  ProfileScreen,
  SettingsScreen,
  DetailsScreen,
  ClubDetailsScreen,
  SportHubScreen,
  MyTeamScreen,
  MyTeamDetailsScreen,
  JoinTeam,
  ChatThreadsScreen,
  ChatScreen,
  ReportMessageScreen,
  Announcements,
  VolunteerOpportunitiesScreen,
  RafflesScreen,
  RaffleDetailsScreen,
  BuyRaffleTicketsScreen,
  VolunteerOpportunitiesDetailsScreen,
  MyReferralMembersScreen,
  SetReminderScreen,
  SetRaffleReminderScreen,
  EventScreen
} from '../screens';
import { PendingRequestsScreen } from '../screens/teams/PendingRequestsScreen';
import { JoinClubScreen } from '../screens/clubs/JoinClub';
import { theme } from '../constants/theme';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="Home"
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
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Club Yakka', headerLargeTitle: true }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', headerBackTitle: 'Back' }} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Details',
          headerBackTitle: 'Back',
        })}
      />
      <Stack.Screen
        name="JoinClub"
        component={JoinClubScreen}
        options={{
          title: 'Join Club',
          headerBackTitle: 'Back',
        }}
      />

      <Stack.Screen
        name="ClubDetails"
        component={ClubDetailsScreen}
        options={{
          title: 'Club Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="SportHub"
        component={SportHubScreen}
        options={{
          title: 'MY SPORT HUB',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="MyTeam"
        component={MyTeamScreen}
      />
      <Stack.Screen
        name="MyTeamDetails"
        component={MyTeamDetailsScreen}
        options={{
          title: 'Team Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="PendingRequests"
        component={PendingRequestsScreen}
        options={{
          title: 'Pending Requests',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="JoinTeam"
        component={JoinTeam}
      />

      <Stack.Screen
        name="ChatThreads"
        component={ChatThreadsScreen}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
      />
      <Stack.Screen
        name="ReportMessage"
        component={ReportMessageScreen}
        options={{
          presentation: 'transparentModal',
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="Announcements"
        component={Announcements}
      />
      <Stack.Screen
        name="VolunteerOpportunitiesScreen"
        component={VolunteerOpportunitiesScreen}
      />
      <Stack.Screen
        name="VolunteerOpportunitiesDetailsScreen"
        component={VolunteerOpportunitiesDetailsScreen}
      />
      <Stack.Screen
        name="Raffles"
        component={RafflesScreen}
      />
      <Stack.Screen
        name="RaffleDetails"
        component={RaffleDetailsScreen}
      />
      <Stack.Screen
        name="BuyRaffleTickets"
        component={BuyRaffleTicketsScreen}
      />
      <Stack.Screen
        name="MyReferralMembers"
        component={MyReferralMembersScreen}
      />
      <Stack.Screen
        name="SetReminder"
        component={SetReminderScreen}
      />
      <Stack.Screen
        name="SetRaffleReminder"
        component={SetRaffleReminderScreen}
      />


      <Stack.Screen
        name="EventScreen"
        component={EventScreen}
      />
    </Stack.Navigator>
  );
};
