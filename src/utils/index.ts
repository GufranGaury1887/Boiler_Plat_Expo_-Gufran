// Validation utilities - Re-export from validation class for backward compatibility
export * from './validation';

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Date utilities
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatReminderDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // Format: "30 May 2025, 3:00 PM"
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${displayHours}:${displayMinutes} ${period}`;
  } catch (error) {
    console.error('Error formatting reminder date:', error);
    return dateString;
  }
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Platform utilities
export const isIOS = (): boolean => {
  return require('react-native').Platform.OS === 'ios';
};

export const isAndroid = (): boolean => {
  return require('react-native').Platform.OS === 'android';
};

// API utilities
export const createQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Re-export storage utilities
export * from './storage';

// Re-export permission utilities
export * from './permissions';

// Re-export permission hooks
export * from './usePermissions';

// Re-export image picker utilities
export * from './imagePicker';

// Re-export UploadDebugUtil
export * from './UploadDebugUtil';

// Re-export AzureUploaderService
export * from './AzureUploaderService';

// Re-export ClubSearchManager
export * from './ClubSearchManager';

