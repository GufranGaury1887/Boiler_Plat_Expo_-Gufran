import { MMKV } from 'react-native-mmkv';

// Create MMKV instances for different data types
const storage = new MMKV({
  id: 'club-yakka-storage',
  encryptionKey: 'club-yakka-encryption-key', // In production, use a secure key
});

const authStorage = new MMKV({
  id: 'club-yakka-auth',
  encryptionKey: 'club-yakka-auth-key', // In production, use a secure key
});

// Generic storage interface
interface StorageInterface {
  setItem: (key: string, value: string) => void;
  getItem: (key: string) => string | undefined;
  removeItem: (key: string) => void;
  getAllKeys: () => string[];
  clear: () => void;
  setObject: <T>(key: string, value: T) => void;
  getObject: <T>(key: string) => T | undefined;
  setBoolean: (key: string, value: boolean) => void;
  getBoolean: (key: string) => boolean | undefined;
  setNumber: (key: string, value: number) => void;
  getNumber: (key: string) => number | undefined;
}

// Create storage utilities
const createStorageUtil = (mmkvInstance: MMKV): StorageInterface => ({
  setItem: (key: string, value: string) => {
    mmkvInstance.set(key, value);
  },

  getItem: (key: string) => {
    return mmkvInstance.getString(key);
  },

  removeItem: (key: string) => {
    mmkvInstance.delete(key);
  },

  getAllKeys: () => {
    return mmkvInstance.getAllKeys();
  },

  clear: () => {
    mmkvInstance.clearAll();
  },

  setObject: <T>(key: string, value: T) => {
    try {
      mmkvInstance.set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing object for key ${key}:`, error);
    }
  },

  getObject: <T>(key: string): T | undefined => {
    try {
      const value = mmkvInstance.getString(key);
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      console.error(`Error parsing object for key ${key}:`, error);
      return undefined;
    }
  },

  setBoolean: (key: string, value: boolean) => {
    mmkvInstance.set(key, value);
  },

  getBoolean: (key: string) => {
    return mmkvInstance.getBoolean(key);
  },

  setNumber: (key: string, value: number) => {
    mmkvInstance.set(key, value);
  },

  getNumber: (key: string) => {
    return mmkvInstance.getNumber(key);
  },
});

// Export storage instances
export const generalStorage = createStorageUtil(storage);
export const secureStorage = createStorageUtil(authStorage);

// Specific storage functions for common use cases
export const StorageService = {
  // Authentication related storage
  auth: {
    setToken: (token: string) => secureStorage.setItem('user_token', token),
    getToken: () => secureStorage.getItem('user_token'),
    removeToken: () => secureStorage.removeItem('user_token'),
    
    setAccessToken: (token: string) => {secureStorage.setItem('access_token', token);},
    getAccessToken: () => {
      const token = secureStorage.getItem('access_token')
      return token;
    },
    removeAccessToken: () => secureStorage.removeItem('access_token'),
    setRefreshToken: (token: string) => {
      secureStorage.setItem('refresh_token', token);
    },
    getRefreshToken: () => {
      const token = secureStorage.getItem('refresh_token');
      return token;
    },
    removeRefreshToken: () => secureStorage.removeItem('refresh_token'),
    
    setUser: (user: any) => secureStorage.setObject('user_data', user),
    getUser: () => secureStorage.getObject('user_data'),
    removeUser: () => secureStorage.removeItem('user_data'),
    
    setTokens: (accessToken: string, refreshToken: string) => {
      secureStorage.setItem('access_token', accessToken);
      secureStorage.setItem('refresh_token', refreshToken);
    },
    
    getTokens: () => {
      const accessToken = secureStorage.getItem('access_token');
      const refreshToken = secureStorage.getItem('refresh_token');
      
      return {
        accessToken,
        refreshToken,
      };
    },
    
    clearAuthData: () => {
      secureStorage.removeItem('user_token');
      secureStorage.removeItem('access_token');
      secureStorage.removeItem('refresh_token');
      secureStorage.removeItem('user_data');
    },
  },

  // App preferences
  preferences: {
    setTheme: (theme: 'light' | 'dark') => generalStorage.setItem('theme_preference', theme),
    getTheme: () => generalStorage.getItem('theme_preference') as 'light' | 'dark' | undefined,
    
    setLanguage: (language: string) => generalStorage.setItem('language_preference', language),
    getLanguage: () => generalStorage.getItem('language_preference'),
    
    setNotificationsEnabled: (enabled: boolean) => generalStorage.setBoolean('notifications_enabled', enabled),
    getNotificationsEnabled: () => generalStorage.getBoolean('notifications_enabled') ?? true,
    
    setBiometricEnabled: (enabled: boolean) => generalStorage.setBoolean('biometric_enabled', enabled),
    getBiometricEnabled: () => generalStorage.getBoolean('biometric_enabled') ?? false,
    
    // Welcome screen tracking
    setWelcomeScreenShown: (shown: boolean) => generalStorage.setBoolean('welcome_screen_shown', shown),
    getWelcomeScreenShown: () => generalStorage.getBoolean('welcome_screen_shown') ?? false,
  },

  // App data cache
  cache: {
    set: <T>(key: string, data: T, ttl?: number) => {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: ttl || 0,
      };
      generalStorage.setObject(`cache_${key}`, cacheData);
    },

    get: <T>(key: string): T | undefined => {
      const cacheData = generalStorage.getObject<{
        data: T;
        timestamp: number;
        ttl: number;
      }>(`cache_${key}`);

      if (!cacheData) return undefined;

      // Check if cache has expired
      if (cacheData.ttl > 0 && Date.now() - cacheData.timestamp > cacheData.ttl) {
        generalStorage.removeItem(`cache_${key}`);
        return undefined;
      }

      return cacheData.data;
    },

    remove: (key: string) => generalStorage.removeItem(`cache_${key}`),

    clear: () => {
      const keys = generalStorage.getAllKeys();
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          generalStorage.removeItem(key);
        }
      });
    },
  },

  // Development utilities
  dev: {
    logAllKeys: () => {
      console.log('General Storage Keys:', generalStorage.getAllKeys());
      console.log('Secure Storage Keys:', secureStorage.getAllKeys());
    },
    
    clearAll: () => {
      generalStorage.clear();
      secureStorage.clear();
      console.log('All storage cleared');
    },
  },
};

// Hook for reactive storage updates (optional)
export class StorageListener {
  private listeners: Map<string, ((value: any) => void)[]> = new Map();

  subscribe<T>(key: string, callback: (value: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    
    this.listeners.get(key)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  notify(key: string, value: any) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(value));
    }
  }
}

export const storageListener = new StorageListener();
