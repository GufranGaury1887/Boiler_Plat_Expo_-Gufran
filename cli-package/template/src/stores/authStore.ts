import { create } from "zustand";
import { StorageService } from "../utils/storage";

// Types for authentication
export interface User {
  userId: number;
  email: string;
  Name: string;
  lastName: string;
  profileImage?: string;
  username?: string;
  gender?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
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
  isAuthenticated: false,
  isLoading: false,

  // Actions
  setUser: (user) => {
    console.log("setUser", user);
    set({ user });

    // Persist user changes to MMKV
    const { accessToken, refreshToken, isAuthenticated, isLoading } = get();
    const updatedData = {
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
    };
    StorageService.auth.setUser(updatedData);
  },
  setAccessToken: (token) => {
    set({ accessToken: token });
    if (token) {
      StorageService.auth.setAccessToken(token);
    } else {
      StorageService.auth.removeAccessToken();
    }
  },
  setRefreshToken: (token) => {
    set({ refreshToken: token });
    if (token) {
      StorageService.auth.setRefreshToken(token);
    } else {
      StorageService.auth.removeRefreshToken();
    }
  },
  setLoading: (isLoading) => set({ isLoading }),

  login: (user, accessToken, refreshToken) => {
    const data = {
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    };
    set(data);

    console.log("login==>>", data);

    try {
      if (accessToken && typeof accessToken === "string") {
        StorageService.auth.setAccessToken(accessToken);
      }
      if (refreshToken && typeof refreshToken === "string") {
        StorageService.auth.setRefreshToken(refreshToken);
      }
      StorageService.auth.setUser(JSON.parse(JSON.stringify(data)));
    } catch (error) {
      console.error("LOGIN - Error storing tokens:", error);
    }
  },

  logout: () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
    StorageService.auth.removeUser();
    StorageService.auth.clearAuthData();
  },

  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
    StorageService.auth.clearAuthData();
  },
}));

// Selectors for better performance
export const useAuth = () =>
  useAuthStore((state) => ({
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  }));

export const useAuthActions = () =>
  useAuthStore((state) => ({
    setUser: state.setUser,
    setAccessToken: state.setAccessToken,
    setRefreshToken: state.setRefreshToken,
    setLoading: state.setLoading,
    login: state.login,
    logout: state.logout,
    clearAuth: state.clearAuth,
  }));
