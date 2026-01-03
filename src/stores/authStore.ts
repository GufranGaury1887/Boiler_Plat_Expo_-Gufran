import { create } from 'zustand';
import { StorageService } from '../utils/storage';

// Types for authentication
export interface User {
  userId: number;
  email: string;
  Name: string;
  profileImage?: string;
  isProfileCompleted: boolean;
  isAddMember: boolean;
  userType: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  authorizationToken: string | null;
  refreshToken: string | null;
  isAddMember: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setAuthorizationToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  registerVerify: (user: User, accessToken: string, authorizationToken: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;

// Create the auth store
export const useAuthStore = create<AuthStore>()((set, get) => ({

  
  // Initial state
  user: null,
  accessToken: null,
  refreshToken: null,
  authorizationToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isAddMember: false,
  isLoading: false,
  registerVerify: (user, accessToken, refreshToken) => {
    const data = {
      user,
      accessToken,
      refreshToken,
      isAddMember: user.isAddMember,
      isAuthenticated: true,
      isLoading: false,
    }
    set(data);
    
    // Store tokens in both individual methods and user object
    StorageService.auth.setAccessToken(accessToken);
    StorageService.auth.setAuthorizationToken(authorizationToken);
    StorageService.auth.setUser(data);
  },

  // Actions
  setUser: (user) => {
    set({ user });
    // persist user changes (e.g., isAddMember) to MMKV
    const { accessToken, authorizationToken, isAuthenticated, isLoading } = get();
    const updatedData = { user, accessToken, authorizationToken, isAuthenticated, isLoading, isAddMember: user?.isAddMember ?? false };
    StorageService.auth.setUser(updatedData);
  },
  setAccessToken: (token) => {
    set({ accessToken: token });
    // Also store token in MMKV for API interceptor
    if (token) {
      StorageService.auth.setAccessToken(token);
    } else {
      StorageService.auth.removeAccessToken();
    }
  },
  setAuthorizationToken: (token) => {
    set({ authorizationToken: token });
    // Also store token in MMKV for API interceptor
    if (token) {
      StorageService.auth.setAuthorizationToken(token);
    } else {
      StorageService.auth.removeAuthorizationToken();
    }
  },
  setLoading: (isLoading) => set({ isLoading }),
  
  login: (user, accessToken, authorizationToken) => {
    const data = {
      user,
      accessToken,
      authorizationToken,
      isAddMember: user.isAddMember,
      isAuthenticated: true,
      isLoading: false,
    }
    set(data);
    
    try {
      StorageService.auth.setAccessToken(accessToken);
      StorageService.auth.setAuthorizationToken(authorizationToken);
      StorageService.auth.setUser(data);
      
  
    } catch (error) {
      console.error("❌ LOGIN - Error storing tokens:", error);
    }
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
      authorizationToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
    // Clear all auth data from MMKV
    StorageService.auth.removeUser();
    StorageService.auth.clearAuthData();
  },
  
  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
      authorizationToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
    // Clear all auth data from MMKV
    StorageService.auth.clearAuthData();
  },
}));

// Selectors for better performance
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  accessToken: state.accessToken,
  authorizationToken: state.authorizationToken,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  setUser: state.setUser,
  setAccessToken: state.setAccessToken,
  setAuthorizationToken: state.setAuthorizationToken,
  setLoading: state.setLoading,
  login: state.login,
  registerVerify: state.registerVerify,
  logout: state.logout,
  clearAuth: state.clearAuth,
}));
