import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Auth Stack Parameter List
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerify: undefined;
  Success: undefined;
};

// Middle Stack Parameter List
export type MiddleStackParamList = {
  AddMember: undefined;
};

// Main App Stack Parameter List
export type MainStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Settings: undefined;
  Details: { itemId: string; title?: string };
  JoinClub: undefined;
  JoinTeam: {
    selectedClub?: any;
    selectedMember?: any;
  };
  MyTeam: {
    selectedClub?: any;
    selectedMember?: any;
  };
  MyTeamDetails: {
    club?: any;
    selectedClub?: any;
    selectedMember?: any;
  };
  Announcements: {
    selectedClub?: any;
    selectedMember?: any;
  };
  PendingRequests: any;
  ClubDetails: {
    TeamDetails?: any;
    clubName?: string;
    totalMembers?: number;
    clubCode?: string;
    clubAddress?: string;
    selectedMember?: any;
    [key: string]: any;
  };
  SportHub: {
    selectedClub?: any;
    selectedMember?: any;
  };
  ChatThreads: {
    team?: any;
    selectedClub?: any;
    selectedMember?: any;
  };
  ChatScreen: {
    itemDetails?: any;
    memberId?: string;
    teamId?: string;
    team?: any;
    userType?: string;
  };
  ReportMessage: {
    message: any;
    memberId: string;
    onReportSubmit?: (reason: string, message: any) => void;
  };


  
  // Raffles
  Raffles: {
    selectedClub?: any;
    selectedMember?: any;
  };
  RaffleDetails: {
    selectedClub?: any;
    selectedMember?: any;
    raffleId: number;
  };
  BuyRaffleTickets: {
    selectedClub?: any;
    selectedMember?: any;
    raffleId: number;
    raffleTitle: string;
    ticketOptions: Array<{
      id: number;
      raffleId: number;
      ticketCount: number;
      totalAmount: number;
      perTicketAmount: number;
    }>;
  };
  VolunteerOpportunitiesScreen:{
    selectedClub?: any;
    selectedMember?: any;
  }
  SetReminder:{
    item?:any 
    selectedClub?: any;
    selectedMember?: any;
  }
  VolunteerOpportunitiesDetailsScreen:{
    item?:any 
    selectedClub?: any;
    selectedMember?: any;
  },
  MyReferralMembers:{
    selectedClub?: any;
    selectedMember?: any;
    raffleId?: number;
    raffleTitle?: string;
  },
  SetRaffleReminder:{
    selectedClub?: any;
    selectedMember?: any;
    raffle?: any;
  }
  
  //Events
  EventScreen:{
    selectedClub?: any;
    selectedMember?: any;
    raffle?: any;
  }
};

// Root Stack Parameter List (combines Auth, Middle and Main)
export type RootStackParamList = AuthStackParamList & MiddleStackParamList & MainStackParamList;

// Auth Stack Navigation Props
export type WelcomeScreenProps = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;
export type OTPVerifyScreenProps = NativeStackScreenProps<AuthStackParamList, 'OTPVerify'>;
export type SuccessScreenProps = NativeStackScreenProps<AuthStackParamList, 'Success'>;

// Middle Stack Navigation Props
export type AddMemberScreenProps = NativeStackScreenProps<MiddleStackParamList, 'AddMember'>;

// Main Stack Navigation Props
export type HomeScreenProps = NativeStackScreenProps<MainStackParamList, 'Home'>;
export type ProfileScreenProps = NativeStackScreenProps<MainStackParamList, 'Profile'>;
export type SettingsScreenProps = NativeStackScreenProps<MainStackParamList, 'Settings'>;
export type DetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'Details'>;
export type JoinClubScreenProps = NativeStackScreenProps<MainStackParamList, 'JoinClub'>;
export type ClubDetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'ClubDetails'>;
export type SportHubScreenProps = NativeStackScreenProps<MainStackParamList, 'SportHub'>;



export type MyTeamScreen = NativeStackScreenProps<MainStackParamList, 'MyTeam'>;
export type MyTeamDetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'MyTeamDetails'>;
export type PendingRequestsScreenProps = NativeStackScreenProps<MainStackParamList, 'PendingRequests'>;
export type JoinTeamProps = NativeStackScreenProps<MainStackParamList, 'JoinTeam'>;
export type AnnouncementsScreenProps = NativeStackScreenProps<MainStackParamList, 'Announcements'>;

//Chat
export type ChatThreadsScreenProps = NativeStackScreenProps<MainStackParamList, 'ChatThreads'>;
export type ChatScreenProps = NativeStackScreenProps<MainStackParamList, 'ChatScreen'>;

// VolunteerOpportunitiesScreen
export type VolunteerOpportunitiesScreenProps = NativeStackScreenProps<MainStackParamList, 'VolunteerOpportunitiesScreen'>;
export type VolunteerOpportunitiesDetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'VolunteerOpportunitiesDetailsScreen'>;
export type SetReminderScreenProps = NativeStackScreenProps<MainStackParamList, 'SetReminder'>;

//Raffles
export type RafflesScreenProps = NativeStackScreenProps<MainStackParamList, 'Raffles'>;
export type MyReferralMembersScreenProps = NativeStackScreenProps<MainStackParamList, 'MyReferralMembers'>;
export type SetRaffleReminderScreenProps = NativeStackScreenProps<MainStackParamList, 'SetRaffleReminder'>;

//Event Screens
export type EventScreenProps = NativeStackScreenProps<MainStackParamList, 'EventScreen'>;

// Generic navigation prop types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MiddleStackScreenProps<T extends keyof MiddleStackParamList> = NativeStackScreenProps<
  MiddleStackParamList,
  T
>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}