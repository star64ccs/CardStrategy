import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { logger } from '../core/utils/logger';

import type { ThemeMode, ThemeContextType } from './theme';
import { theme, darkTheme } from './theme';

// CreateTheme上下文
const _ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme提供者Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const _systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [isDark, setIsDark] = useState(false);

  // 從Storage中加載Theme模式
  useEffect(() => {
    const _loadThemeMode = async () => {
      try {
        const _storedMode = await AsyncStorage.getItem('themeMode');
        if (storedMode && ['light', 'dark', 'auto'].includes(storedMode)) {
          setMode(storedMode as ThemeMode);
        }
      } catch (error) {
        logger.warn('Failed to load theme mode:', { error });
      }
    };

    loadThemeMode();
  }, []);

  // Root據模式和系統SettingsOK當前Theme
  useEffect(() => {
    const _determineTheme = () => {
      if (mode === 'auto') {
        setIsDark(systemColorScheme === 'dark');
      } else {
        setIsDark(mode === 'dark');
      }
    };

    determineTheme();
  }, [mode, systemColorScheme]);

  // SwitchTheme
  const _toggleTheme = () => {
    const _newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  // SettingsTheme模式
  const _setThemeMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', newMode);
      setMode(newMode);
    } catch (error) {
      logger.warn('Failed to save theme mode:', { error });
    }
  };

  // 當前Theme
  const _currentTheme = isDark ? darkTheme : theme;

  const contextValue: ThemeContextType = {
    theme: currentTheme as any, // 臨時Class型Convert
    isDark,
    mode,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 使用Theme的 Hook
export const _useTheme = (): ThemeContextType => {
  const _context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// ExportTheme上下文
export default ThemeContext;
