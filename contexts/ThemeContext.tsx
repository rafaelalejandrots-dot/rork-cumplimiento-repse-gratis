import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, ThemeColors } from '@/constants/colors';

const THEME_STORAGE_KEY = 'app_theme_preference';

export type ThemeMode = 'light' | 'dark' | 'system';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const queryClient = useQueryClient();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const themeQuery = useQuery({
    queryKey: ['themePreference'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
          return stored as ThemeMode;
        }
        return 'system' as ThemeMode;
      } catch (error) {
        console.log('Error loading theme preference:', error);
        return 'system' as ThemeMode;
      }
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (themeQuery.data) {
      setThemeMode(themeQuery.data);
    }
  }, [themeQuery.data]);

  const { mutate: saveTheme } = useMutation({
    mutationFn: async (mode: ThemeMode) => {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      return mode;
    },
    onSuccess: (savedMode) => {
      setThemeMode(savedMode);
      queryClient.setQueryData(['themePreference'], savedMode);
    },
  });

  const setThemePreference = useCallback((mode: ThemeMode) => {
    saveTheme(mode);
  }, [saveTheme]);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const colors: ThemeColors = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    setThemePreference(newMode);
  }, [isDark, setThemePreference]);

  return {
    themeMode,
    isDark,
    colors,
    setThemePreference,
    toggleTheme,
    isLoading: themeQuery.isLoading,
  };
});

export function useColors(): ThemeColors {
  const { colors } = useTheme();
  return colors;
}
