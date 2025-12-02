import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '../services/api';
import { User } from '../stores/authStore';

// Types for API requests and responses
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface ClubSearchResponse {
  apiName: string;
  data: any[];
  message: string;
  success: boolean;
}
export interface TeamSearchResponse {
  apiName: string;
  data: any[];
  message: string;
  success: boolean;
}
export interface ApiClubSearchResponse {
  data: ClubSearchResponse;
  status: number;
  statusText: string;
  headers: any;
}

export interface ClubSearchRequest {
  pageNumber: number;
  pageSize: number;
  search: string;
}
export interface ApiTeamSearchResponse {
  data: TeamSearchResponse;
  status: number;
  statusText: string;
  headers: any;
}

export interface TeamSearchRequest {
  pageNumber: number;
  pageSize: number;
  search: string;
  clubId: number;
  memberId?: number;
}

export interface MyClubsRequest {
  pageNumber: number;
  pageSize: number;
  search: string;
}

export interface MyClubsResponse {

  apiName: string;
  data: any[];
  message: string;
  success: boolean;
}

export interface JoinClubRequest {
  clubId: number;
  memberId: number;
}
export interface JoinTeamRequest {
  clubId: number;
  memberId: number;
  teamId: number;
}

export interface JoinClubResponse {
  apiName: string;
  data: any;
  message: string;
  success: boolean;
}

export interface ClubMembersRequest {
  clubId: number;
}

export interface ClubMembersResponse {
  apiName: string;
  data: any[];
  message: string;
  success: boolean;
}

export interface MyTeamsRequest {
  memberId: number;
  pageNumber: number;
  pageSize: number;
}

export interface MyTeamsResponse {
  apiName: string;
  data: {
    members: any[];
    pendingRequest: number;
    totalRecord: number;
  };
  message: string;
  success: boolean;
}

export interface PendingTeamRequestsRequest {
  memberId: number;
  PageNumber: number;
  PageSize: number;
}

export interface PendingTeamRequest {
  id: number;
  teamName: string;
  teamImageUrl?: string;
  requestDate: string;
  status: string;
  clubId?: number;
  teamId?: number;
  memberId?: number;
  totalRecord?: number;
}

export interface PendingTeamRequestsResponse {
  apiName: string;
  data: PendingTeamRequest[];
  message: string;
  success: boolean;
}

export interface TeamDetailsRequest {
  teamId: number;
}

export interface TeamMember {
  id: number;
  name: string;
  profileImage?: string;
  position?: string;
  birthDate?: string;
  relation?: string;
  isOwner?: boolean;
}

export interface Coach {
  id: number;
  name: string;
  profileImage?: string;
  title: string;
  experienceYears?: number;
  joinedDate?: string;
}

export interface TeamDetails {
  id: number;
  name: string;
  clubId: number;
  clubName: string;
  clubImage?: string;
  teamImage?: string;
  description?: string;
  totalMembers: number;
  members: TeamMember[];
  coach?: Coach;
  createdDate: string;
  isActive: boolean;
}

export interface TeamDetailsResponse {
  apiName: string;
  data: TeamDetails;
  message: string;
  success: boolean;
}

export interface TeamThreadsRequest {
  teamId: number;
  memberId: number;
}

export interface ChatThread {
  id: number;
  threadName: string;
  lastMessage?: string;
  lastMessageSentAt?: string;
  unreadMessageCount: number;
  isMute: boolean;
  participants: number;
  threadImage?: string;
  isActive: boolean;
  createdDate: string;
  lastMessageText?: string;
}

export interface TeamThreadsResponse {
  apiName: string;
  data: ChatThread[];
  message: string;
  success: boolean;
}

// Add message-related types
export interface ChatMessage {
  messageId: number;
  threadId: number;
  senderId: number;
  message: string;
  image?: string;
  senderName: string;
  senderImage?: string;
  sentAt: string;
  userTypeId?: number;
  userType?: string;
  profileImage?: string;
  isMute?: boolean;
}

export interface TeamChatMessagesRequest {
  teamId: number;
  memberId: number;
  threadId: number;
  pageNumber: number;
}

export interface TeamChatMessagesData {
  lstMessages: ChatMessage[];
  totalRecords: number;
  currentPage: number;
  hasMorePages: boolean;
  isMute?: boolean;
}

export interface TeamChatMessagesResponse {
  apiName: string;
  data: TeamChatMessagesData;
  message: string;
  success: boolean;
}

export interface AnnouncementsRequest {
  clubId: number;
  pageNumber: number;
  pageSize: number;
}

export interface Announcement {
  message: string;
  image: string | null;
  sentOn: string;
}

export interface AnnouncementsResponse {
  apiName: string;
  data: {
    announcements?: Announcement[];
    totalRecord?: number;
  } | Announcement[];
  message: string;
  success: boolean;
  totalRecord?: number;
}

export interface PaymentRequest {
  nonce: string;
  amount: number;
  clubId: number;
  token: string;
  memberId: number;
  metadata: {
    orderTypeId: number;
    id: number;
    referralCode: string;
  };
}

export interface PaymentResponse {
  apiName: string;
  data: {
    transactionId: string;
    status: string;
  };
  message: string;
  success: boolean;
}

export interface VolunteerHoursDetailsRequest {
  memberId: number;
  clubId: number;
}

export interface VolunteerHoursDetailsResponse {
  apiName?: string;
  data?: any;
  message?: string;
  success?: boolean;
  // Keep it flexible until backend schema is finalized
}

// Volunteer: Opportunities
export interface VolunteerOpportunitiesRequest {
  memberId: number;
  clubId: number;
  requestType: number; // Tab ID: 1=Upcoming, 2=Requested, 3=Ongoing, 4=Past
  pageNo: number;
  pageSize: number;
}

export interface VolunteerOpportunity {
  id: number;
  title: string;
  location?: string;
  dateLabel?: string;
  ctaType?: 'join' | 'request';
  // Add other fields as needed based on API response
  [key: string]: any;
}

export interface VolunteerOpportunitiesData {
  opportunities?: VolunteerOpportunity[];
  totalRecord?: number;
  currentPage?: number;
  hasMorePages?: boolean;
}

export interface VolunteerOpportunitiesResponse {
  apiName?: string;
  data?: VolunteerOpportunitiesData | VolunteerOpportunity[];
  message?: string;
  success?: boolean;
  totalRecord?: number;
}

export interface VolunteerOpportunitySlot {
  slotId?: number;
  id?: number;
  slotName?: string;
  [key: string]: any;
}

export interface VolunteerOpportunitySlotsResponse {
  apiName?: string;
  data?: VolunteerOpportunitySlot[] | {
    slots?: VolunteerOpportunitySlot[];
    lstSlots?: VolunteerOpportunitySlot[];
    data?: VolunteerOpportunitySlot[];
    [key: string]: any;
  };
  message?: string;
  success?: boolean;
}

// Volunteer: Join Opportunity
export interface JoinVolunteerOpportunityRequest {
  opportunityId: number;
  slotId: number;
  opportunityType: number;
  memberId: number;
}

export interface JoinVolunteerOpportunityResponse {
  apiName?: string;
  data?: any;
  message?: string;
  success?: boolean;
}

// Volunteer: Cancel Request
export interface CancelVolunteerRequestRequest {
  opportunityId: number;
  memberId: number;
  slotId: number;
}

export interface CancelVolunteerRequestResponse {
  apiName?: string;
  data?: any;
  message?: string;
  success?: boolean;
}

// Volunteer: Set Reminder
export interface SetVolunteerReminderRequest {
  reminderDateTime: string;
  opportunityId: number;
  memberId: number;
  clubId: number;
}

export interface SetVolunteerReminderResponse {
  apiName?: string;
  data?: any;
  message?: string;
  success?: boolean;
}

// Volunteer: Get Reminder
export interface GetVolunteerReminderRequest {
  opportunityId: number;
  clubId: number;
  memberId: number;
}

export interface VolunteerReminder {
  id?: number;
  reminderId?: number;
  reminderDateTime: string;
  opportunityId: number;
  memberId: number;
  clubId: number;
  createdDate?: string;
  [key: string]: any;
}

export interface GetVolunteerReminderResponse {
  apiName?: string;
  data?: {
    scheduledDate?: string;
    opportunityReminders?: VolunteerReminder[];
  };
  message?: string;
  success?: boolean;
}

// Raffle: Set Reminder
export interface SetRaffleReminderRequest {
  reminderDateTime: string;
  raffleId: number;
  memberId: number;
  clubId: number;
}

export interface SetRaffleReminderResponse {
  apiName?: string;
  data?: any;
  message?: string;
  success?: boolean;
}

// Raffle: Get Reminder
export interface GetRaffleReminderRequest {

  raffleId: number;
  clubId: number;
  memberId: number;
}

export interface RaffleReminder {
  id?: number;
  reminderId?: number;
  reminderDateTime: string;
  raffleId: number;
  memberId: number;
  clubId: number;
  createdDate?: string;
  [key: string]: any;
}

export interface GetRaffleReminderResponse {
  apiName?: string;
  data?: {
    raffleDrawDate: string;
    raffleReminders: RaffleReminder[];
  }
  message?: string;
  success?: boolean;
}

export interface VolunteerOpportunityDetailsRequest {
  opportunityId: number;
}

export interface VolunteerOpportunityDetailsResponse {
  apiName?: string;
  data?: VolunteerOpportunity; // Reusing VolunteerOpportunity type
  message?: string;
  success?: boolean;
}

export interface VolunteerOpportunityVolunteer {
  id?: number | string;
  memberId?: number;
  volunteerId?: number;
  userId?: number;
  participantId?: number;
  name?: string;
  fullName?: string;
  volunteerName?: string;
  memberName?: string;
  displayName?: string;
  profileImage?: string;
  image?: string;
  avatar?: string;
  profileImageUrl?: string;
  photoUrl?: string;
  memberImage?: string;
  slotId?: number;
  slotName?: string;
  slotLabel?: string;
  assignedSlotId?: number;
  [key: string]: any;
}

export interface VolunteerOpportunityVolunteersRequest {
  opportunityId: number;
  slotId?: number | null;
}

export interface VolunteerOpportunityVolunteersResponse {
  apiName?: string;
  data?:
  | VolunteerOpportunityVolunteer[]
  | {
    volunteers?: VolunteerOpportunityVolunteer[];
    lstVolunteers?: VolunteerOpportunityVolunteer[];
    data?: VolunteerOpportunityVolunteer[];
    items?: VolunteerOpportunityVolunteer[];
    list?: VolunteerOpportunityVolunteer[];
    [key: string]: any;
  };
  message?: string;
  success?: boolean;
  totalRecord?: number;
}

// Raffle Details Types
export interface RafflePrizePool {
  id: number;
  raffleId: number;
  title: string;
  prizeTitle: string;
  description: string;
  bannerImageUrl: string | null;
  prizeRank: number;
  prizeAmount: number;
}

export interface RaffleTicketOption {
  id: number;
  raffleId: number;
  ticketCount: number;
  totalAmount: number;
  perTicketAmount: number;
}

export interface RaffleDetailsData {
  raffleId: number;
  raffleTitle: string;
  bannerImageUrl: string | null;
  description: string;
  totalPricePoolAmount: number;
  drawDate: string;
  drawTime: string;
  purchaseEndDate: string;
  termsAndConditionFileUrl: string | null;
  latitude: number;
  longitude: number;
  locationAddress: string;
  pricePools: RafflePrizePool[];
  ticketOptions: RaffleTicketOption[];
}

export interface RaffleDetailsResponse {
  data: RaffleDetailsData;
  message: string;
  apiName: string;
}

// Referrer Member Sales Types
export interface ReferrerMember {
  id: number;
  memberId: number;
  name?: string;
  memberName?: string;
  profileImage?: string;
  profileImageUrl?: string;
  ticketCount?: number;
  ticketsSold?: number;
  totalTickets?: number;
  purchasedTicketCount?: number;
}

export interface ReferrerMemberSalesRequest {
  raffleId: number;
  memberId: number;
  pageNumber: number;
  pageSize: number;
}

export interface ReferrerMemberSalesData {
  salesList?: ReferrerMember[];
  members?: ReferrerMember[];
  referralMembers?: ReferrerMember[];
  data?: {
    salesList?: ReferrerMember[];
    totalPurchasedTicketCount?: number;
    pageNumber?: number;
    pageSize?: number;
    totalRecords?: number;
  };
  totalPurchasedTicketCount?: number;
  totalRecord?: number;
  totalRecords?: number;
  totalSales?: number;
  pageNumber?: number;
  pageSize?: number;
  currentPage?: number;
  hasMorePages?: boolean;
}

export interface ReferrerMemberSalesResponse {
  apiName: string;
  data: ReferrerMemberSalesData;
  message: string;
  success?: boolean;
  totalRecord?: number;
}

// Referral Code Types
export interface ReferralCodeRequest {
  raffleId: number;
  memberId: number;
}

export interface ReferralCodeResponse {
  apiName?: string;
  data?: {
    referralCode: string;
    clubId?: number;
    clubCode?: string;
    clubName?: string;
    raffleTitle?: string;
  };
  message?: string;
  success?: boolean;
}

export interface VerifyReferralCodeRequest {
  raffleId: number;
  clubId: number;
  memberId: number;
  referralCode: string;
}

export interface VerifyReferralCodeResponse {
  apiName: string;
  data: any;
  message: string;
  success: boolean;
}

// Ticket Details Types
export interface TicketDetailsRequest {
  raffleId: number;
  memberId: number;
  purchasedMemberId: number;
}

export interface TicketDetailsResponse {
  apiName: string;
  data: {
    id: number;
    orderId: number;
    ticketNumber: number[];
    memberId?: string;
  };
  message: string;
}


export const MainService = {
  clubSearch: async (params: ClubSearchRequest): Promise<ApiResponse<ClubSearchResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.CLUB.SEARCH, {
      params: params,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },
}

// API service functions
export const mainService = {
  // Raffles: list with pagination
  getRaffles: async (params: { clubId: number; memberId: number; PageNumber: number; PageSize: number; Search?: string }) => {
    const response = await apiClient.get('Raffles', {
      params,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  // Raffle Details: Get single raffle by ID
  getRaffleDetails: async (raffleId: number): Promise<ApiResponse<RaffleDetailsResponse>> => {
    const response = await apiClient.get(`Raffles/${raffleId}`);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  // Get Referral Code for raffle
  getReferralCode: async (params: ReferralCodeRequest): Promise<ApiResponse<ReferralCodeResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.RAFFLE.GET_REFEREE_CODE, {
      params: {
        raffleId: params.raffleId,
        memberId: params.memberId,
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  // Verify Referral Code
  verifyReferralCode: async (params: VerifyReferralCodeRequest): Promise<ApiResponse<VerifyReferralCodeResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.RAFFLE.VERIFY_REFERRAL_CODE, params);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  clubSearch: async (params: ClubSearchRequest): Promise<ApiResponse<ClubSearchResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.CLUB.SEARCH, {
      params: params,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  myTeam: async (params: MyTeamsRequest): Promise<ApiResponse<MyTeamsResponse>> => {
    const endpoint = API_ENDPOINTS.TEAM.MY_TEAMS.replace('{memberId}', params?.memberId.toString());
    const queryParams: Record<string, any> = {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    };
    const response = await apiClient.get(endpoint, { params: queryParams });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  teamSearch: async (params: TeamSearchRequest): Promise<ApiResponse<TeamSearchResponse>> => {
    const endpoint = API_ENDPOINTS.TEAM.SERCH_JOIN_TEAMS
      .replace('{clubId}', params.clubId.toString());
    const { pageNumber, pageSize, search, memberId } = params;
    const queryParams: Record<string, any> = {
      PageNumber: pageNumber,
      PageSize: pageSize,
    };
    if (typeof search === 'string' && search.trim().length > 0) {
      queryParams.search = search.trim();
    }
    if (memberId) {
      queryParams.memberId = memberId;
    }
    const response = await apiClient.get(endpoint, { params: queryParams });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },
  getUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(API_ENDPOINTS.USER.MEMBERS);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },
  myClubs: async (params: MyClubsRequest): Promise<ApiResponse<MyClubsResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.CLUB.SEARCH_MY_CLUBS, {
      params: params,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },
  joinClub: async (params: JoinClubRequest): Promise<ApiResponse<JoinClubResponse>> => {
    const endpoint = API_ENDPOINTS.CLUB.JOIN
      .replace('{clubId}', params.clubId.toString())
      .replace('{memberId}', params.memberId.toString());
    const response = await apiClient.post(endpoint);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },
  getClubMembers: async (params: ClubMembersRequest): Promise<ApiResponse<ClubMembersResponse>> => {
    const endpoint = API_ENDPOINTS.CLUB.MEMBERS
      .replace('{clubId}', params.clubId.toString());
    const response = await apiClient.get(endpoint);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },
  joinTeam: async (params: JoinTeamRequest): Promise<ApiResponse<JoinClubResponse>> => {
    const endpoint = API_ENDPOINTS.TEAM.JOIN_TEAM;
    const response = await apiClient.post(endpoint, params);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  cancelRequestTeam: async (params: JoinTeamRequest): Promise<ApiResponse<JoinClubResponse>> => {
    const endpoint = API_ENDPOINTS.TEAM.CANCEL_PENDING_REQUEST;
    const response = await apiClient.post(endpoint, params);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  getPendingTeamRequests: async (params: PendingTeamRequestsRequest): Promise<ApiResponse<PendingTeamRequestsResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.TEAM.PENDING_REQUEST, {
      params: params,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  getTeamDetails: async (params: TeamDetailsRequest): Promise<ApiResponse<TeamDetailsResponse>> => {
    const endpoint = API_ENDPOINTS.TEAM.TEAM_DETAILS.replace('{teamId}', params.teamId.toString());
    const response = await apiClient.get(endpoint);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  getTeamThreads: async (params: TeamThreadsRequest): Promise<ApiResponse<TeamThreadsResponse>> => {
    const endpoint = API_ENDPOINTS.TEAM.TEAM_THREADS
      .replace('{teamId}', params.teamId.toString())
      .replace('{memberId}', params.memberId.toString());

    const response = await apiClient.get(endpoint);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  // Add service function for fetching chat messages with pagination
  getTeamChatMessages: async (params: TeamChatMessagesRequest): Promise<ApiResponse<TeamChatMessagesResponse>> => {
    const endpoint = API_ENDPOINTS.TEAM.TEAM_CHAT
      .replace('{teamId}', params.teamId.toString())
      .replace('{memberId}', params.memberId.toString())
      .replace('{threadId}', params.threadId.toString())
      .replace('{pageNumber}', params.pageNumber.toString());

    const response = await apiClient.get(endpoint);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  // New service function for fetching chat messages with userType condition
  getChatMessages: async (params: TeamChatMessagesRequest & { userType?: string }): Promise<ApiResponse<TeamChatMessagesResponse>> => {
    let endpoint: string;

    // Check userType and use appropriate API endpoint
    if (params?.userType === 'volunteer') {
      endpoint = API_ENDPOINTS?.VOLUNTEER?.VOLUNTEER_CHAT;
      console.log('🔄 Using VOLUNTEER_CHAT endpoint:', endpoint);
    } else {
      // Default to team chat for 'teams' userType or if userType is not provided
      endpoint = API_ENDPOINTS?.TEAM?.TEAM_CHAT;
      console.log('🔄 Using TEAM_CHAT endpoint:', endpoint);
    }

    // Replace parameters based on userType
    let finalEndpoint: string;
    if (params?.userType === 'volunteer') {
      // For volunteer endpoint, don't replace {teamId}
      finalEndpoint = endpoint
        .replace('{memberId}', params?.memberId.toString())
        .replace('{threadId}', params?.threadId.toString())
        .replace('{pageNumber}', params?.pageNumber.toString());
    } else {
      // For team endpoint, replace all parameters including {teamId}
      finalEndpoint = endpoint
        .replace('{teamId}', params?.teamId.toString())
        .replace('{memberId}', params?.memberId.toString())
        .replace('{threadId}', params?.threadId.toString())
        .replace('{pageNumber}', params?.pageNumber.toString());
    }


    const response = await apiClient.get(finalEndpoint);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  getAnnouncements: async (params: AnnouncementsRequest): Promise<ApiResponse<AnnouncementsResponse>> => {
    const endpoint = API_ENDPOINTS.CLUB.ANNOUNCEMENTS.replace('{clubId}', params.clubId.toString());
    const queryParams: Record<string, any> = {
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
    };
    const response = await apiClient.get(endpoint, { params: queryParams });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  // New: Update Chat Mute Status (POST)
  updateChatMuteStatus: async ({ teamId, memberId, threadId, isMute, chatTypeId }: { teamId: number; memberId: number; threadId: number; isMute: boolean; chatTypeId: number }): Promise<ApiResponse<any>> => {
    const endpoint = `Teams/UpdateChatMuteStatus?teamId=${teamId}&memberId=${memberId}&threadId=${threadId}&isMute=${isMute}&chatTypeId=${chatTypeId}`;
    // POST with empty body as per API style
    const response = await apiClient.post(endpoint, {});
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  processPayment: async (payload: PaymentRequest): Promise<ApiResponse<PaymentResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.PAYMENT.PROCESS, payload);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  getVolunteerHoursDetails: async (params: VolunteerHoursDetailsRequest): Promise<ApiResponse<VolunteerHoursDetailsResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.VOLUNTEER.HOURS_DETAILS, {
      params: {
        memberId: params.memberId,
        clubId: params.clubId,
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  // Volunteer: Get Opportunities with pagination
  getVolunteerOpportunities: async (params: VolunteerOpportunitiesRequest): Promise<ApiResponse<VolunteerOpportunitiesResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.VOLUNTEER.OPPORTUNITIES, {
      params: {
        memberId: params.memberId,
        clubId: params.clubId,
        requestType: params.requestType,
        pageNo: params.pageNo,
        pageSize: params.pageSize,
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  // Volunteer: Get Single Opportunity Details by ID
  getVolunteerOpportunityDetails: async (
    params: VolunteerOpportunityDetailsRequest
  ): Promise<ApiResponse<VolunteerOpportunityDetailsResponse>> => {
    const endpoint = API_ENDPOINTS.VOLUNTEER.OPPORTUNITIES_BY_ID.replace(
      '{opportunityId}',
      params.opportunityId.toString()
    );
    const response = await apiClient.get(endpoint);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },

  // Volunteer: Join Opportunity
  joinVolunteerOpportunity: async (params: JoinVolunteerOpportunityRequest): Promise<ApiResponse<JoinVolunteerOpportunityResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.VOLUNTEER.JOIN, {
      opportunityId: params.opportunityId,
      slotId: params.slotId,
      opportunityType: params.opportunityType,
      memberId: params.memberId,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  // Volunteer: Cancel Request
  cancelVolunteerRequest: async (params: CancelVolunteerRequestRequest): Promise<ApiResponse<CancelVolunteerRequestResponse>> => {
    const endpoint = API_ENDPOINTS.VOLUNTEER.CANCEL_REQUEST;
    const response = await apiClient.post(endpoint, {
      opportunityId: params.opportunityId,
      memberId: params.memberId,
      slotId: params.slotId,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  // Volunteer: Get Slots By Opportunity
  getVolunteerSlots: async (opportunityId: number, memberId: number): Promise<ApiResponse<VolunteerOpportunitySlotsResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.VOLUNTEER.SLOTS_BY_OPPORTUNITY, {
      params: { opportunityId, memberId },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },

  getVolunteerOpportunityVolunteers: async (
    params: VolunteerOpportunityVolunteersRequest
  ): Promise<ApiResponse<VolunteerOpportunityVolunteersResponse>> => {
    const { opportunityId, slotId } = params;
    const queryParams: Record<string, any> = {
      opportunityId,
      slotId: typeof slotId === 'number' && !Number.isNaN(slotId) ? slotId : 0,
    };

    const response = await apiClient.get(API_ENDPOINTS.VOLUNTEER.OPPORTUNITY_VOLUNTEERS, {
      params: queryParams,
    });

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },

  // Volunteer: Set Reminder
  setVolunteerReminder: async (params: SetVolunteerReminderRequest): Promise<ApiResponse<SetVolunteerReminderResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.VOLUNTEER.REMINDER, {
      reminderDateTime: params.reminderDateTime,
      opportunityId: params.opportunityId,
      memberId: params.memberId,
      clubId: params.clubId,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },

  // Volunteer: Get Reminder
  getVolunteerReminder: async (params: GetVolunteerReminderRequest): Promise<ApiResponse<GetVolunteerReminderResponse>> => {
    const endpoint = API_ENDPOINTS.VOLUNTEER.GET_REMINDER.replace(
      '{opportunityId}',
      params.opportunityId.toString()
    );
    const response = await apiClient.get(endpoint, {
      params: {
        clubId: params.clubId,
        memberId: params.memberId,
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },

  // Volunteer: Delete Reminder
  deleteVolunteerReminder: async (opportunityId: number, reminderId: number, clubId?: number, memberId?: number): Promise<ApiResponse<any>> => {
    let endpoint = API_ENDPOINTS.VOLUNTEER.DELETE_REMINDER
      .replace('{opportunityId}', opportunityId.toString())
      .replace('{reminderId}', reminderId.toString());

    const params: Record<string, any> = {};
    if (clubId) params.clubId = clubId;
    if (memberId) params.memberId = memberId;

    const response = await apiClient.delete(endpoint, { params });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },

  // Raffle: Set Reminder
  setRaffleReminder: async (params: SetRaffleReminderRequest): Promise<ApiResponse<SetRaffleReminderResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.RAFFLE.REMINDER, {
      reminderDateTime: params.reminderDateTime,
      raffleId: params.raffleId,
      memberId: params.memberId,
      clubId: params.clubId,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },

  // Raffle: Get Reminder
  getRaffleReminder: async (params: GetRaffleReminderRequest): Promise<ApiResponse<GetRaffleReminderResponse>> => {
    const endpoint = API_ENDPOINTS.RAFFLE.GET_REMINDER.replace(
      '{raffleId}',
      params.raffleId.toString()
    );
    const response = await apiClient.get(endpoint, {
      params: {
        clubId: params.clubId,
        memberId: params.memberId,
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },

  // Raffle: Delete Reminder
  deleteRaffleReminder: async (raffleId: number, reminderId: number, clubId?: number, memberId?: number): Promise<ApiResponse<any>> => {
    let endpoint = API_ENDPOINTS.RAFFLE.DELETE_REMINDER
      .replace('{reminderId}', reminderId.toString());

    const params: Record<string, any> = {};
    if (clubId) params.clubId = clubId;
    if (memberId) params.memberId = memberId;
    if (raffleId) params.raffleId = raffleId;

    const response = await apiClient.delete(endpoint, { params });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },

  // Get Referrer Member Sales
  getReferrerMemberSales: async (params: ReferrerMemberSalesRequest): Promise<ApiResponse<ReferrerMemberSalesResponse>> => {
    const response = await apiClient.get('ReferrerMemberSales', {
      params: {
        raffleId: params.raffleId,
        memberId: params.memberId,
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },

  // Get Ticket Details
  getTicketDetails: async (params: TicketDetailsRequest): Promise<ApiResponse<TicketDetailsResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.RAFFLE.GET_TICKET_DETAILS, {
      params: {
        raffleId: params.raffleId,
        memberId: params.memberId,
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  },
}

export const useClubSearch = (params: ClubSearchRequest) => {
  return useQuery({
    queryKey: ['clubSearch', params],
    queryFn: () => mainService.clubSearch(params),
  });
};

// Volunteer hooks
export const useVolunteerHoursDetails = (memberId?: number, clubId?: number) => {
  return useQuery({
    queryKey: ['volunteerHoursDetails', memberId, clubId],
    queryFn: () => mainService.getVolunteerHoursDetails({ memberId: memberId as number, clubId: clubId as number }),
    enabled: !!memberId && memberId > 0 && !!clubId && clubId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Volunteer: Infinite Query for Opportunities with pagination
export const useInfiniteVolunteerOpportunities = (
  memberId: number,
  clubId: number,
  requestType: number,
  pageSize: number = 10
) => {
  return useInfiniteQuery({
    queryKey: ['infiniteVolunteerOpportunities', memberId, clubId, requestType, pageSize],
    queryFn: ({ pageParam = 1 }) =>
      mainService.getVolunteerOpportunities({
        memberId,
        clubId,
        requestType,
        pageNo: pageParam,
        pageSize,
      }),
    getNextPageParam: (lastPage, allPages) => {
      // Check if we have valid data structure
      if (!lastPage?.data?.data) {
        return undefined;
      }

      const pageData = lastPage.data.data;
      let opportunities: VolunteerOpportunity[] = [];
      let totalRecords = 0;

      // Handle both structures: { opportunities: [], totalRecord: number } or []
      if (Array.isArray(pageData)) {
        opportunities = pageData;
        totalRecords = lastPage?.data?.totalRecord || 0;
      } else if (pageData && typeof pageData === 'object' && 'opportunities' in pageData) {
        opportunities = pageData.opportunities || [];
        totalRecords = pageData.totalRecord || lastPage?.data?.totalRecord || 0;
      }

      // If no items returned, no more pages
      if (opportunities.length === 0) {
        return undefined;
      }

      // If fewer items than pageSize, we've reached the end
      if (opportunities.length < pageSize) {
        return undefined;
      }

      // If totalRecord is available, use it for pagination
      if (totalRecords > 0) {
        const totalPages = Math.ceil(totalRecords / pageSize);
        const currentPage = allPages.length;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      }

      // Fallback: if we got a full page of items, assume there might be more
      return opportunities.length === pageSize ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!memberId && memberId > 0 && !!clubId && clubId > 0 && !!requestType && requestType > 0,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Infinite query for Raffles with pagination
export const useInfiniteRaffles = (memberId: number | undefined, clubId: number | undefined, pageSize: number = 10, search?: string) => {
  return useInfiniteQuery({
    queryKey: ['infiniteRaffles', memberId, clubId, pageSize, search],
    queryFn: ({ pageParam = 0 }) =>
      mainService.getRaffles({
        clubId: clubId as number,
        memberId: memberId as number,
        PageNumber: pageParam,
        PageSize: pageSize,
        Search: search ? search : "",
      }),
    getNextPageParam: (lastPage, allPages) => {
      // Expect either { data: { data: [], totalRecord? } } or { data: [] }
      const payload = lastPage?.data;
      const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      const totalRecord = typeof payload?.totalRecord === 'number' ? payload.totalRecord : undefined;
      const currentCount = allPages.reduce((acc, p) => {
        const pp = p?.data;
        const arr = Array.isArray(pp?.data) ? pp.data : Array.isArray(pp) ? pp : [];
        return acc + arr.length;
      }, 0);
      if (list.length === 0) return undefined;
      if (totalRecord && currentCount >= totalRecord) return undefined;
      if (list.length < pageSize) return undefined;
      return (allPages.length); // next PageNumber (0-based)
    },
    initialPageParam: 0,
    enabled: !!memberId && memberId > 0 && !!clubId && clubId > 0,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Volunteer: Join Opportunity Mutation Hook
export const useJoinVolunteerOpportunity = () => {
  return useMutation({
    mutationFn: mainService.joinVolunteerOpportunity,
    onSuccess: (response) => {
      console.log('Join volunteer opportunity successful:', response.data);
    },
  });
};

// Volunteer: Cancel Request Mutation Hook
export const useCancelVolunteerRequest = () => {
  return useMutation({
    mutationFn: mainService.cancelVolunteerRequest,
    onSuccess: (response) => {
      console.log('Cancel volunteer request successful:', response.data);
    },
    onError: (error) => {
      console.error('Cancel volunteer request failed:', error);
    },
  });
};

// Volunteer: Set Reminder Mutation Hook
export const useSetVolunteerReminder = () => {
  return useMutation({
    mutationFn: mainService.setVolunteerReminder,
    onSuccess: (response) => {
      console.log('Set reminder successful:', response.data);
    },
    onError: (error) => {
      console.error('Set reminder failed:', error);
    },
  });
};

// Volunteer: Delete Reminder Mutation Hook
export const useDeleteVolunteerReminder = () => {
  return useMutation({
    mutationFn: ({ opportunityId, reminderId, clubId, memberId }: { opportunityId: number; reminderId: number; clubId?: number; memberId?: number }) =>
      mainService.deleteVolunteerReminder(opportunityId, reminderId, clubId, memberId),
    onSuccess: (response) => {
      console.log('Delete reminder successful:', response.data);
    },
    onError: (error) => {
      console.error('Delete reminder failed:', error);
    },
  });
};

// Raffle: Set Reminder Mutation Hook
export const useSetRaffleReminder = () => {
  return useMutation({
    mutationFn: mainService.setRaffleReminder,
    onSuccess: (response) => {
      console.log('Set raffle reminder successful:', response.data);
    },
    onError: (error) => {
      console.error('Set raffle reminder failed:', error);
    },
  });
};

// Raffle: Delete Reminder Mutation Hook
export const useDeleteRaffleReminder = () => {
  return useMutation({
    mutationFn: ({ raffleId, reminderId, clubId, memberId }: { raffleId: number; reminderId: number; clubId?: number; memberId?: number }) =>
      mainService.deleteRaffleReminder(raffleId, reminderId, clubId, memberId),
    onSuccess: (response) => {
      console.log('Delete raffle reminder successful:', response.data);
    },
    onError: (error) => {
      console.error('Delete raffle reminder failed:', error);
    },
  });
};

// Raffle: Get Reminder Hook
export const useRaffleReminder = (raffleId?: number, clubId?: number, memberId?: number) => {
  return useQuery({
    queryKey: ['raffleReminder', raffleId, clubId, memberId],
    queryFn: () => mainService.getRaffleReminder({
      raffleId: raffleId as number,
      clubId: clubId as number,
      memberId: memberId as number,
    }),
    enabled: !!raffleId && raffleId > 0 && !!clubId && clubId > 0 && !!memberId && memberId > 0,
    staleTime: 60 * 1000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });
};

// Volunteer: Get Reminder Hook
export const useVolunteerReminder = (opportunityId?: number, clubId?: number, memberId?: number) => {
  return useQuery({
    queryKey: ['volunteerReminder', opportunityId, clubId, memberId],
    queryFn: () => mainService.getVolunteerReminder({
      opportunityId: opportunityId as number,
      clubId: clubId as number,
      memberId: memberId as number,
    }),
    enabled: !!opportunityId && opportunityId > 0 && !!clubId && clubId > 0 && !!memberId && memberId > 0,
    staleTime: 60 * 1000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });
};

// Volunteer: Get Single Opportunity Details Hook
export const useVolunteerOpportunityDetails = (opportunityId?: number) => {
  return useQuery({
    queryKey: ['volunteerOpportunityDetails', opportunityId],
    queryFn: () => mainService.getVolunteerOpportunityDetails({ opportunityId: opportunityId as number }),
    enabled: !!opportunityId && opportunityId > 0,
    staleTime: 0
  });
};

// Raffle Details Hook
export const useRaffleDetails = (raffleId?: number) => {
  return useQuery({
    queryKey: ['raffleDetails', raffleId],
    queryFn: () => mainService.getRaffleDetails(raffleId as number),
    enabled: !!raffleId && raffleId > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Volunteer: Get Slots Hook
export const useVolunteerSlots = (opportunityId?: number, memberId?: number) => {
  return useQuery({
    queryKey: ['volunteerSlots', opportunityId, memberId],
    queryFn: () => mainService.getVolunteerSlots(opportunityId as number, memberId as number),
    enabled: !!opportunityId && opportunityId > 0,
    staleTime: 60 * 1000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });
};

export const useVolunteerOpportunityVolunteers = (opportunityId?: number, slotId?: number | null) => {
  const slotQueryValue = typeof slotId === 'number' && !Number.isNaN(slotId) ? slotId : 0;
  return useQuery({
    queryKey: ['volunteerOpportunityVolunteers', opportunityId, slotQueryValue],
    queryFn: () =>
      mainService.getVolunteerOpportunityVolunteers({
        opportunityId: opportunityId as number,
        slotId: slotQueryValue,
      }),
    enabled: typeof opportunityId === 'number' && opportunityId > 0,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useInfiniteClubSearch = (search: string, pageSize: number) => {
  return useInfiniteQuery({
    queryKey: ['infiniteClubSearch', search, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      mainService.clubSearch({
        search,
        pageNumber: pageParam,
        pageSize
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length - 1;
      const totalRecords = lastPage?.data?.data?.[0]?.totalRecord || 0;
      const totalPages = Math.ceil(totalRecords / pageSize);

      // Return next page number if there are more pages
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });
};

export const useInfiniteTeamSearch = (search: string, pageSize: number, clubId: number, memberId?: number) => {
  return useInfiniteQuery({
    queryKey: ['infiniteTeamSearch', search, pageSize, clubId, memberId],
    queryFn: ({ pageParam = 0 }) =>
      mainService.teamSearch({
        search,
        pageNumber: pageParam,
        pageSize,
        clubId,
        memberId,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length - 1;
      const totalRecords = lastPage?.data?.data?.[0]?.totalRecord || 0;
      const totalPages = Math.ceil(totalRecords / pageSize);

      // Return next page number if there are more pages
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });
};

export const useInfiniteMyClubs = (search: string, pageSize: number) => {
  return useInfiniteQuery({
    queryKey: ['infiniteMyClubs', search, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      mainService.myClubs({
        search: '',
        pageNumber: pageParam,
        pageSize
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length - 1;
      const totalRecords = lastPage?.data?.data?.[0]?.totalRecord || 0;
      const totalPages = Math.ceil(totalRecords / pageSize);

      // Return next page number if there are more pages
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });
};

export const useInfiniteMyTams = (search: string, pageSize: number, clubId: number) => {
  return useInfiniteQuery({
    queryKey: ['infiniteMyTeams', search, pageSize, clubId],
    queryFn: ({ pageParam = 0 }) =>
      mainService.teamSearch({
        search,
        pageNumber: pageParam,
        pageSize,
        clubId
      }),
    getNextPageParam: (lastPage, allPages) => {
      const totalRecords = lastPage?.data?.data?.[0]?.totalRecord || 0;
      const totalPages = Math.ceil(totalRecords / pageSize);
      const nextPage = allPages.length; // zero-based next page index
      return nextPage < totalPages ? nextPage : undefined;
    },
    initialPageParam: 0,
  });
};

export const useJoinClub = () => {
  return useMutation({
    mutationFn: mainService.joinClub,
    onSuccess: (response) => {
      console.log('Join club successful:', response.data);
    },
    onError: (error) => {
      console.error('Join club failed:', error);
    },
  });
};

export const useClubMembers = (clubId: number) => {
  return useQuery({
    queryKey: ['clubMembers', clubId],
    queryFn: () => mainService.getClubMembers({ clubId }),
    enabled: !!clubId, // Only run query if clubId is provided
  });
};


// Teams

export const useInfiniteMyTeams = (memberId: number, pageSize: number) => {
  return useInfiniteQuery({
    queryKey: ['infiniteMyTeams', memberId, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      mainService.myTeam({
        memberId,
        pageNumber: pageParam,
        pageSize
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length - 1;
      const totalRecords = lastPage?.data?.data?.[0]?.totalRecord || 0;
      const totalPages = Math.ceil(totalRecords / pageSize);

      // Return next page number if there are more pages
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: !!memberId, // Only run query if teamId is provided
  });
};

export const useVerifyReferralCode = () => {
  return useMutation({
    mutationFn: mainService.verifyReferralCode,
  });
};

export const useJoinTeam = () => {
  return useMutation({
    mutationFn: mainService.joinTeam,
    onSuccess: (response) => {
      console.log('Join club successful:', response.data);
    },
    onError: (error) => {
      console.error('Join club failed:', error);
    },
  });
};

export const useCancelRequestTeam = () => {
  return useMutation({
    mutationFn: mainService.cancelRequestTeam,
    onSuccess: (response) => {
      console.log('Join club successful:', response.data);
    },
    onError: (error) => {
      console.error('Join club failed:', error);
    },
  });
};

export const useInfinitePendingTeamRequests = (memberId: number, pageSize: number) => {
  return useInfiniteQuery({
    queryKey: ['infinitePendingTeamRequests', memberId, pageSize],
    queryFn: ({ pageParam = 1 }) =>
      mainService.getPendingTeamRequests({
        memberId,
        PageNumber: pageParam,
        PageSize: pageSize
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalRecords = lastPage?.data?.data?.[0]?.totalRecord || 0;
      const totalPages = Math.ceil(totalRecords / pageSize);

      // Return next page number if there are more pages
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: !!memberId && memberId > 0, // Only run query if memberId is provided
  });
};

export const useTeamDetails = (teamId: number) => {
  return useQuery({
    queryKey: ['teamDetails', teamId],
    queryFn: () => mainService.getTeamDetails({ teamId }),
    enabled: !!teamId && teamId > 0, // Only run query if teamId is provided
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

export const useTeamThreads = (teamId: number, memberId: number) => {
  return useQuery({
    queryKey: ['teamThreads', teamId, memberId],
    queryFn: () => mainService.getTeamThreads({ teamId, memberId }),
    enabled: !!teamId && teamId > 0 && !!memberId && memberId > 0, // Only run query if both IDs are provided
    staleTime: 30 * 1000, // Data stays fresh for 30 seconds (chat data should be more frequently updated)
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Add React Query hook for infinite chat messages with pagination
export const useInfiniteTeamChatMessages = (teamId: number, memberId: number, threadId: number) => {
  return useInfiniteQuery({
    queryKey: ['infiniteTeamChatMessages', teamId, memberId, threadId],
    queryFn: ({ pageParam = 0 }) =>
      mainService.getTeamChatMessages({
        teamId,
        memberId,
        threadId,
        pageNumber: pageParam
      }),
    getNextPageParam: (lastPage, allPages) => {
      // Check if we have valid data structure
      if (!lastPage?.data?.data?.lstMessages) {
        console.log('No valid message data structure found');
        return undefined;
      }

      const { lstMessages, totalRecords, hasMorePages } = lastPage.data.data;

      // If hasMorePages is explicitly provided, use it
      if (typeof hasMorePages === 'boolean') {
        return hasMorePages ? allPages.length : undefined;
      }

      // Fallback: check if we have messages and calculate based on total records
      const currentMessagesCount = allPages.reduce((total, page) => {
        return total + (page?.data?.data?.lstMessages?.length || 0);
      }, 0);

      // If we have totalRecords, use it to determine if there are more pages
      if (typeof totalRecords === 'number' && totalRecords > 0) {
        return currentMessagesCount < totalRecords ? allPages.length : undefined;
      }

      // Final fallback: if we got messages in the last response, assume there might be more
      const hasMessages = lstMessages && lstMessages.length > 0;
      return hasMessages ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!teamId && teamId > 0 && !!memberId && memberId > 0 && !!threadId && threadId > 0,
    staleTime: 0, // Chat messages should always be fresh
    gcTime: 2 * 60 * 1000, // Cache for 2 minutes (updated property name)
    refetchOnWindowFocus: false, // Don't refetch when window gains focus (better for chat UX)
  });
};

// New React Query hook for infinite chat messages with userType support
export const useInfiniteChatMessages = (teamId: number, memberId: number, threadId: number, userType?: string) => {
  return useInfiniteQuery({
    queryKey: ['infiniteChatMessages', teamId, memberId, threadId, userType],
    queryFn: ({ pageParam = 0 }) =>
      mainService.getChatMessages({
        teamId,
        memberId,
        threadId,
        pageNumber: pageParam,
        userType
      }),
    getNextPageParam: (lastPage, allPages) => {
      // Check if we have valid data structure
      if (!lastPage?.data?.data?.lstMessages) {
        console.log('No valid message data structure found');
        return undefined;
      }

      const { lstMessages, totalRecords, hasMorePages } = lastPage.data.data;

      // If hasMorePages is explicitly provided, use it
      if (typeof hasMorePages === 'boolean') {
        return hasMorePages ? allPages.length : undefined;
      }

      // Fallback: check if we have messages and calculate based on total records
      const currentMessagesCount = allPages.reduce((total, page) => {
        return total + (page?.data?.data?.lstMessages?.length || 0);
      }, 0);

      // If we have totalRecords, use it to determine if there are more pages
      if (typeof totalRecords === 'number' && totalRecords > 0) {
        return currentMessagesCount < totalRecords ? allPages.length : undefined;
      }

      // Final fallback: if we got messages in the last response, assume there might be more
      const hasMessages = lstMessages && lstMessages.length > 0;
      return hasMessages ? allPages.length : undefined;
    },
    initialPageParam: 0,
    enabled: !!teamId && teamId > 0 && !!memberId && memberId > 0 && !!threadId && threadId > 0,
    staleTime: 0, // Chat messages should always be fresh
    gcTime: 2 * 60 * 1000, // Cache for 2 minutes (updated property name)
    refetchOnWindowFocus: false, // Don't refetch when window gains focus (better for chat UX)
  });
};

// Add React Query hook for infinite announcements with pagination
export const useInfiniteAnnouncements = (clubId: number, pageSize: number) => {
  return useInfiniteQuery({
    queryKey: ['infiniteAnnouncements', clubId, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      mainService.getAnnouncements({
        clubId,
        pageNumber: pageParam,
        pageSize
      }),
    getNextPageParam: (lastPage, allPages) => {
      // Check if we have valid data structure
      if (!lastPage?.data?.data) {
        console.log('getNextPageParam: No data found');
        return undefined;
      }

      const pageData = lastPage.data.data;
      let announcements: Announcement[] = [];
      let totalRecords = 0;

      // Handle both structures: { announcements: [], totalRecord: number } or []
      if (Array.isArray(pageData)) {
        announcements = pageData;
        totalRecords = lastPage?.data?.totalRecord || 0;
      } else if (pageData && typeof pageData === 'object' && 'announcements' in pageData) {
        announcements = pageData.announcements || [];
        totalRecords = pageData.totalRecord || lastPage?.data?.totalRecord || 0;
      }

      // If no items returned, no more pages
      if (announcements.length === 0) {
        console.log('getNextPageParam: No items, returning undefined');
        return undefined;
      }

      // If fewer items than pageSize, we've reached the end
      if (announcements.length < pageSize) {
        console.log('getNextPageParam: Fewer items than pageSize, returning undefined');
        return undefined;
      }

      // If totalRecord is available, use it for pagination
      if (totalRecords > 0) {
        const totalPages = Math.ceil(totalRecords / pageSize);
        const currentPage = allPages.length;
        const nextPage = currentPage < totalPages ? currentPage : undefined;
        console.log('getNextPageParam: Using totalRecord - totalPages:', totalPages, 'currentPage:', currentPage, 'nextPage:', nextPage);
        // Return next page number if there are more pages (0-indexed)
        return nextPage;
      }

      // Fallback: if we got a full page of items, assume there might be more
      // (This is less reliable but works if totalRecord is not provided)
      const currentPage = allPages.length;
      const nextPage = announcements.length === pageSize ? currentPage : undefined;
      console.log('getNextPageParam: Using fallback - nextPage:', nextPage);
      return nextPage;
    },
    initialPageParam: 0,
    enabled: !!clubId && clubId > 0 && pageSize > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 0, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Infinite query for Referrer Member Sales with pagination
export const useInfiniteReferrerMemberSales = (raffleId?: number, memberId?: number, pageSize?: number) => {
  return useInfiniteQuery({
    queryKey: ['infiniteReferrerMemberSales', raffleId, memberId, pageSize],
    queryFn: ({ pageParam = 1 }) =>
      mainService.getReferrerMemberSales({
        raffleId: raffleId as number,
        memberId: memberId as number,
        pageNumber: pageParam,
        pageSize,
      }),
    getNextPageParam: (lastPage, allPages) => {
      // Check if we have valid data structure
      if (!lastPage?.data?.data) {
        return undefined;
      }

      const responseData = lastPage.data.data;
      let members: ReferrerMember[] = [];
      let totalRecords = 0;
      let currentPageNumber = 1;

      // Handle the actual API structure: data.data.salesList
      if (responseData && typeof responseData === 'object') {
        // Check for nested data.data structure
        if ('data' in responseData && responseData.data && typeof responseData.data === 'object') {
          const nestedData = responseData.data;
          if ('salesList' in nestedData && Array.isArray(nestedData.salesList)) {
            members = nestedData.salesList;
          }
          totalRecords = nestedData.totalRecords || 0;
          currentPageNumber = nestedData.pageNumber || 1;
        }
        // Fallback to direct salesList
        else if ('salesList' in responseData && Array.isArray(responseData.salesList)) {
          members = responseData.salesList;
          totalRecords = responseData.totalRecords || responseData.totalRecord || 0;
          currentPageNumber = responseData.pageNumber || 1;
        }
        // Other possible structures
        else if ('members' in responseData && Array.isArray(responseData.members)) {
          members = responseData.members;
          totalRecords = responseData.totalRecords || responseData.totalRecord || 0;
        } else if ('referralMembers' in responseData && Array.isArray(responseData.referralMembers)) {
          members = responseData.referralMembers;
          totalRecords = responseData.totalRecords || responseData.totalRecord || 0;
        } else if (Array.isArray(responseData)) {
          members = responseData;
          totalRecords = lastPage?.data?.totalRecord || 0;
        }
      }

      // If no items returned, no more pages
      if (members.length === 0) {
        return undefined;
      }

      // If fewer items than pageSize, we've reached the end
      if (members.length < pageSize) {
        return undefined;
      }

      // If totalRecords is available, use it for pagination
      if (totalRecords > 0) {
        const totalPages = Math.ceil(totalRecords / pageSize);
        const nextPage = currentPageNumber + 1;
        return nextPage <= totalPages ? nextPage : undefined;
      }

      // Fallback: if we got a full page of items, assume there might be more
      return members.length === pageSize ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!raffleId && raffleId > 0,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};