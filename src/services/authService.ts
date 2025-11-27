import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '../services/api';
import { User } from '../stores/authStore';

// Types for API requests and responses
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface LoginRequest {
  email: string;
  password: string;
  device_type?: string;
  device_id?: string;
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

export interface RegisterRequest {
  email: string;
  password: string;
  profileImage: string;
  name?: string;
  phoneNumber?: string;
  confirmPassword?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  deviceToken: string;
  deviceType: number;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    Name: string;
    email: string;
    profileImage: string;
    authorizationToken: string;
    accessToken: string;
    userType: number;
    isProfileCompleted: boolean;
    isAddMember: boolean;
    message: string;
    apiName: string;
  };
}

export interface ResendOTPRequest {
  email: string;
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  apiName?: string;
}

export interface MembersRequest {
  PageNumber: number;
  PageSize: number;
}


export interface MembersResponse {
  apiName: string;
  data: {
    members?: any[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

export interface UpdateMemberRequest {
  id?: number;
  name: string;
  profileImage: string;
  birthDate: string;
  relation: string;
}

export interface UpdateMemberResponse {
  apiName: string;
  data: any;
  message: string;
  success: boolean;
}

export interface ClubSearchRequest {
  pageNumber: number;
  pageSize: number;
}

export interface ClubSearchResponse {
  apiName: string;
  data:any[];
  message: string;
  success: boolean;
}

export interface GetImageUrlRequest {
  containerName: string;
  blobName: string;
}

export interface GetImageUrlResponse {
  apiName: string;
  data: {
    imageUrl: string;
    url: string;
  };
  message: string;
  success: boolean;
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

  register: async (userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  forgotPassword: async (email: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, email);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  verifyOTP: async (otp: VerifyOTPRequest): Promise<ApiResponse<VerifyOTPResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, otp);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },
  
  resendOTP: async (email: ResendOTPRequest): Promise<ApiResponse<ResendOTPResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, email);
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

  getMembers: async (params: MembersRequest): Promise<ApiResponse<MembersResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.USER.MEMBERS, {
      params: params,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  updateMember: async (memberId: number, memberData: UpdateMemberRequest): Promise<ApiResponse<UpdateMemberResponse>> => {
    const response = await apiClient.post(`${API_ENDPOINTS.USER.UPDATE_MEMBER}/${memberId}`, memberData);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },

  searchClubs: async (params: ClubSearchRequest): Promise<ApiResponse<ClubSearchResponse>> => {
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

  getImageUrl: async (params: GetImageUrlRequest): Promise<ApiResponse<GetImageUrlResponse>> => {
    const response = await apiClient.post(API_ENDPOINTS.UPLOAD.GET_IMAGE_URL, params);
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

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      // Handle successful registration
      console.log('Registration successful:', response.data);
    },
    onError: (error) => {
      // Handle registration error with status code
      const errorInfo = getApiErrorInfo(error);
      console.error('Registration failed:', errorInfo);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (response) => {
      // Handle successful forgot password request
      console.log('Forgot password request successful:', response.data);
    },
    onError: (error) => {
      // Handle forgot password error with status code
      const errorInfo = getApiErrorInfo(error);
      console.error('Forgot password request failed:', errorInfo);
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: authService.verifyOTP,
    onSuccess: (response) => {
      // Handle successful OTP verification
      console.log('Verify OTP request successful:', response.data);
    },
    onError: (error) => {
      // Handle OTP verification error with status code
      const errorInfo = getApiErrorInfo(error);
      console.error('Verify OTP request failed:', errorInfo);
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: authService.resendOTP,
    onSuccess: (response) => {
      console.log('Resend OTP request successful:', response.data);
    },
    onError: (error) => {
      // Handle resend OTP error with status code
      const errorInfo = getApiErrorInfo(error);
      console.error('Resend OTP request failed:', errorInfo);
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

export const useMembers = (params: MembersRequest) => {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => authService.getMembers(params),
  });
};

export const useUpdateMember = () => {
  return useMutation({
    mutationFn: ({ memberId, memberData }: { memberId: number; memberData: UpdateMemberRequest }) => 
      authService.updateMember(memberId, memberData),
    onSuccess: (response) => {
      console.log('Member update successful:', response.data);
    },
    onError: (error) => {
      // Handle member update error with status code
      const errorInfo = getApiErrorInfo(error);
      console.error('Member update failed:', errorInfo);
    },
  });
};

export const useClubSearch = (params: ClubSearchRequest) => {
  return useQuery({
    queryKey: ['clubSearch', params],
    queryFn: () => authService.searchClubs(params),
  });
};

export const useGetImageUrl = () => {
  return useMutation({
    mutationFn: authService.getImageUrl,
    onSuccess: (response) => {
      console.log('Get image URL successful:', response.data);
    },
    onError: (error) => {
      const errorInfo = getApiErrorInfo(error);
      console.error('Get image URL failed:', errorInfo);
    },
  });
};



