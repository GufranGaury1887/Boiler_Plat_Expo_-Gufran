import axios from 'axios';
import { MMKV } from 'react-native-mmkv';
import { StorageService } from '@utils/storage';
import { Platform } from 'react-native';
import ToastManager from '@components/common/ToastManager';
import { useAuthStore } from '@stores/authStore';

// API Configuration
export const API_BASE_URL = "https://clubyakkadev.24livehost.com/api/v1/"; // prod api url
export const CHAT_HUB_URL = "https://clubyakkadev.24livehost.com/chathub"; // dev chat hub url

// Create axios instance with default config
const offsetTime = new Date().getTimezoneOffset() * 60 * -1;

// MMKV default storage (NotificationManager saves fcmToken here)
const mmkvDefaultStorage = new MMKV();

// Helpers to manage the FCM device token within this module
export const setFCMDeviceToken = (token: string): void => {
  try {
    if (token) {
      mmkvDefaultStorage.set('fcmToken', token);
    }
  } catch { }
};

export const getFCMDeviceToken = (): string | undefined => {
  try {
    const token = mmkvDefaultStorage.getString('fcmToken');
    return token || undefined;
  } catch {
    return undefined;
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    UtcOffsetInSecond: offsetTime,
    AppVersion: 1,
    DeviceTypeId: Platform.OS == "android" ? 1 : 2,
    DeviceToken: ""
  },
});

// Request interceptor to add auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth tokens if available
    const tokens = StorageService.auth.getTokens();
    if (tokens.accessToken) {
      config.headers.AccessToken = tokens.accessToken;
    }
    if (tokens.authorizationToken) {
      config.headers.Authorization = "Bearer " + tokens.authorizationToken;
    }

    // Add FCM DeviceToken header if available
    try {
      const fcmToken = mmkvDefaultStorage.getString('fcmToken');
      if (fcmToken) {
        config.headers.DeviceToken = fcmToken;
      }
    } catch { }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log('Error response status:', error.response?.data);
    if (error.response?.status === 401) {
      clearAuthTokens();
      ToastManager.error(error.response?.data?.message);
    }
    // Handle 409 status code differently - don't treat it as an error flow
    if (error.response?.status === 409) {
      // Return the response so it can be handled as a successful response with special status
      return Promise.resolve({
        data: error.response.data,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

const clearAuthTokens = (): void => {
  StorageService.auth.clearAuthData();
  useAuthStore.getState().logout();
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'Account/Login',
    REGISTER: 'Account/SignUp',
    FORGOT_PASSWORD: 'Account/ForgetPassword',
    REFRESH_TOKEN: 'auth/refresh-token',
    UPLOAD_SAS: 'Upload/SasToken',
    VERIFY_OTP: 'Account/Verifyotp',
    RESEND_OTP: 'Account/ResendOtp',
    LOGOUT: 'Account/Logout',

  },
  VOLUNTEER: {
    HOURS_DETAILS: 'Volunteer/Opportunities/GetVolunteerHoursDetails',
    OPPORTUNITIES: 'Volunteer/Opportunities',
    OPPORTUNITIES_BY_ID: 'Volunteer/Opportunities/{opportunityId}',
    OPPORTUNITY_VOLUNTEERS: 'Volunteer/Opportunities/Volunteers',
    JOIN: 'Volunteer/Opportunities/Join',
    CANCEL_REQUEST: 'Volunteer/Opportunities/CancelVolunteerRequest',
    SLOTS_BY_OPPORTUNITY: 'Volunteer/Opportunities/GetSlotsByOpportunityId',
    REMINDER: 'Volunteer/opportunity/Reminder',
    GET_REMINDER: 'Volunteer/opportunity/{opportunityId}/reminder',
    DELETE_REMINDER: 'Volunteer/opportunity/{opportunityId}/reminder/{reminderId}',
    VOLUNTEER_CHAT: 'Volunteer/members/{memberId}/Threads/{threadId}/messages/{pageNumber}',
  },
  USER: {
    MEMBERS: 'user/members',
    UPDATE_MEMBER: 'user/members',
  },
  CLUB: {
    SEARCH: 'club/search',
    SEARCH_MY_CLUBS: 'club/myclubs',
    JOIN: 'club/{clubId}/members/{memberId}/join',
    MEMBERS: 'club/{clubId}/members',
    ANNOUNCEMENTS: 'club/{clubId}/announcements',
  },
  UPLOAD: {
    GET_IMAGE_URL: 'Upload/GetImageUrl',
  },
  PAYMENT: {
    PROCESS: 'Payments',
  },
  RAFFLE: {
    GET_REFEREE_CODE: 'GetRefereeCode',
    VERIFY_REFERRAL_CODE: 'Raffles/Code/Verify',
    REMINDER: 'Raffles/Reminder',
    GET_REMINDER: 'Raffles/{raffleId}/Reminder',
    DELETE_REMINDER: 'Raffles/Reminder/{reminderId}',
    GET_TICKET_DETAILS: 'Raffles/referral-ticket-details',
  },
  TEAM: {
    SERCH_JOIN_TEAMS: 'Teams/Club/{clubId}/Teams/search',
    MY_TEAMS: 'MyTeam/{memberId}',
    JOIN_TEAM: 'Teams/join',
    PENDING_REQUEST: 'Teams/GetJoinedTeamPendingRequestList',
    CANCEL_PENDING_REQUEST: 'MyTeam/Request/Cancle',
    TEAM_DETAILS: 'Teams/{teamId}/Details',
    TEAM_THREADS: 'Teams/{teamId}/member/{memberId}/Threads',
    TEAM_CHAT: 'Teams/{teamId}/members/{memberId}/Threads/{threadId}/messages/{pageNumber}',
  }
} as const;
