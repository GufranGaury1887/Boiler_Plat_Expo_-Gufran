import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@services/api';

// Types for API requests and responses
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  apiName: string;
  data: {
    Name: string;
    accessToken: string;
    authorizationToken: string;
    email: string;
    isProfileCompleted: boolean;
    profileImage: string;
    userId: number;
    userType: number;
    isAddMember?: boolean;
  };
  message: string;
}


export interface LogoutResponse {
  success: boolean;
  message: string;
  apiName?: string;
}


// API service functions
export const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },



  logout: async (): Promise<ApiResponse<LogoutResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },


};

// Error handling utility
export const getApiErrorInfo = (error: any) => {
  const statusCode = error?.response?.status || error?.status || 0;
  const statusText = error?.response?.statusText || error?.statusText || 'Unknown Error';
  const message = error?.response?.data?.message || error?.message || 'An error occurred';

  return {
    statusCode,
    statusText,
    message,
    isNetworkError: !error?.response,
    isServerError: statusCode >= 500,
    isClientError: statusCode >= 400 && statusCode < 500,
    isUnauthorized: statusCode === 401,
    isForbidden: statusCode === 403,
    isNotFound: statusCode === 404,
    isValidationError: statusCode === 422,
  };
};

// React Query hooks for authentication
export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      // Handle successful login
      console.log('Login successful:', response);
    },
    onError: (error) => {
      return error;
    },
  });
};






export const useLogout = () => {
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: (response) => {
      console.log('Logout request successful:', response.data);
    },
    onError: (error) => {
      // Handle logout error with status code
      const errorInfo = getApiErrorInfo(error);
      console.error('Logout request failed:', errorInfo);
    },
  });
};





