import { create } from 'zustand';
import { Theme } from '../types';
import { lightTheme, darkTheme } from '../constants/theme';
import { StorageService } from '../utils/storage';

export interface ThemeState {
  isDarkMode: boolean;
  theme: Theme;
}

export interface ThemeActions {
  toggleTheme: () => void;
  setDarkMode: (enabled: boolean) => void;
  initializeTheme: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()((set) => {
  // Read persisted preference synchronously on store creation
  const savedTheme = StorageService.preferences.getTheme();
  const initialDark = savedTheme === 'dark';

  return {
    isDarkMode: initialDark,
    theme: initialDark ? darkTheme : lightTheme,

    toggleTheme: () =>
      set((state) => {
        const newDark = !state.isDarkMode;
        StorageService.preferences.setTheme(newDark ? 'dark' : 'light');
        return {
          isDarkMode: newDark,
          theme: newDark ? darkTheme : lightTheme,
        };
      }),

    setDarkMode: (enabled: boolean) => {
      StorageService.preferences.setTheme(enabled ? 'dark' : 'light');
      set({
        isDarkMode: enabled,
        theme: enabled ? darkTheme : lightTheme,
      });
    },

    initializeTheme: () => {
      const saved = StorageService.preferences.getTheme();
      const dark = saved === 'dark';
      set({
        isDarkMode: dark,
        theme: dark ? darkTheme : lightTheme,
      });
    },
  };
});

// Convenience hook – returns just the theme object
export const useTheme = () => useThemeStore((s) => s.theme);

// Convenience hook – returns isDarkMode boolean
export const useIsDarkMode = () => useThemeStore((s) => s.isDarkMode);
