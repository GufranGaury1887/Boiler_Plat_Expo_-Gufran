import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { StorageService } from '../utils';

// Auth State
interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'RESTORE_TOKEN'; token: string | null; user: User | null }
  | { type: 'SIGN_IN'; token: string; user: User }
  | { type: 'SIGN_OUT' }
  | { type: 'SET_LOADING'; isLoading: boolean };

// Auth Context Type
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Initial state
const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  token: null,
};

// Auth reducer
function authReducer(prevState: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...prevState,
        token: action.token,
        user: action.user,
        isAuthenticated: !!action.token,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...prevState,
        isAuthenticated: true,
        token: action.token,
        user: action.user,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...prevState,
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...prevState,
        isLoading: action.isLoading,
      };
    default:
      return prevState;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore authentication state on app startup
  useEffect(() => {
    const restoreAuthState = () => {
      try {
        const token = StorageService.auth.getToken();
        const user = StorageService.auth.getUser();

        dispatch({ type: 'RESTORE_TOKEN', token: token || null, user: user || null });
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    };

    restoreAuthState();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', isLoading: true });

      // Mock API call - replace with actual authentication API
      const response = await mockAuthAPI.login(email, password);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store authentication data
        StorageService.auth.setToken(token);
        StorageService.auth.setUser(user);
        
        dispatch({ type: 'SIGN_IN', token, user });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', isLoading: true });

      // Mock API call - replace with actual registration API
      const response = await mockAuthAPI.register(userData);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store authentication data
        StorageService.auth.setToken(token);
        StorageService.auth.setUser(user);
        
        dispatch({ type: 'SIGN_IN', token, user });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Clear stored authentication data
      StorageService.auth.clearAuthData();
      
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!state.user) return;

      const updatedUser = { ...state.user, ...userData };
      
      // Update stored user data
      StorageService.auth.setUser(updatedUser);
      
      // Update context state
      dispatch({ 
        type: 'SIGN_IN', 
        token: state.token!, 
        user: updatedUser 
      });
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock API for demonstration - replace with actual API calls
const mockAuthAPI = {
  login: async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login - in real app, validate against server
    if (email === 'demo@example.com' && password === 'password123') {
      return {
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: '1',
            name: 'Demo User',
            email: email,
            avatar: 'https://via.placeholder.com/100x100/007AFF/FFFFFF?text=DU',
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date(),
          },
        },
      };
    }
    
    return { success: false };
  },

  register: async (userData: RegisterData) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful registration
    return {
      success: true,
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: Date.now().toString(),
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          avatar: `https://via.placeholder.com/100x100/007AFF/FFFFFF?text=${userData.firstName[0]}${userData.lastName[0]}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    };
  },
};
