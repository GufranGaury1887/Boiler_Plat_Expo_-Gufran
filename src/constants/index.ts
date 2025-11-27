// Theme constants
export * from './theme';

// String constants
export { Strings } from './strings';

// App constants
export const APP_CONFIG = {
  name: 'RN Club Yakka',
  version: '1.0.0',
  environment: __DEV__ ? 'development' : 'production',
} as const;

// API constants
export const API_CONFIG = {
  baseUrl: __DEV__ 
    ? 'https://api-dev.example.com' 
    : 'https://api.example.com',
  timeout: 10000,
  retryAttempts: 3,
} as const;

// Screen names
export const SCREEN_NAMES = {
  HOME: 'Home',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  DETAILS: 'Details',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@user_token',
  USER_DATA: '@user_data',
  THEME_PREFERENCE: '@theme_preference',
  LANGUAGE_PREFERENCE: '@language_preference',
} as const;

// Validation constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_EMAIL_LENGTH: 254,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
} as const;
