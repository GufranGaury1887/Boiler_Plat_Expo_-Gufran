import { Theme } from '../types';
import { moderateScale } from '../utils/scaling';

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    blue: '#0047AB',
    appleGreen: '#A7D129',
    DarkGray: '#484848',
    green: '#34C759',
    white: '#FFFFFF',
    black: '#000000',
    lightLavenderGray: '#F4F7FB',
    imageBorder: '#F1E9F9',
    paraText: '#3E3E3E',
    cancelButton: '#FB6A57',
    red: '#ED0000',
  },
  spacing: {
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(16),
    lg: moderateScale(24),
    xl: moderateScale(32),
  },
  borderRadius: {
    sm: moderateScale(4),
    md: moderateScale(8),
    lg: moderateScale(12),
    xl: moderateScale(16),
    xxl: moderateScale(30),
  },
  typography: {
    fontSize: {
      xs: moderateScale(12),
      sm: moderateScale(14),
      md: moderateScale(16),
      lg: moderateScale(18),
      xl: moderateScale(24),
      xxl: moderateScale(32)  ,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    blue: '#3B82F6',
    DarkGray: '#B0B0B0',
    lightLavenderGray: '#1C1C1E',
    imageBorder: '#2C2C2E',
    paraText: '#D1D1D6',
    white: '#FFFFFF',
    black: '#000000',
  },
};

export const theme = lightTheme; // Default theme
