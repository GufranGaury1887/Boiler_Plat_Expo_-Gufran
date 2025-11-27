// Navigation types
export * from './navigation';

// Common types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface ApiResponse<T = any> extends BaseResponse {
  data?: T;
}

// Common component props
export interface BaseScreenProps {
  testID?: string;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  blue: string;
  appleGreen: string;
  DarkGray: string;
  green: string;
  white: string;
  black: string;
  lightLavenderGray: string;
  imageBorder: string;
  paraText: string;
  cancelButton: string;
  red: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeight: {
      normal: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
    };
  };
}
