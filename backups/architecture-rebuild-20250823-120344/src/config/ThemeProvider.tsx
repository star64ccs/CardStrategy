import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, darkTheme, ThemeMode, ThemeContextType } from './theme';
import { logger } from '@/utils/logger';

// 創建主題上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主題提供者組件
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [isDark, setIsDark] = useState(false);

  // 從存儲中加載主題模式
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem('themeMode');
        if (storedMode && ['light', 'dark', 'auto'].includes(storedMode)) {
          setMode(storedMode as ThemeMode);
        }
      } catch (error) {
        logger.warn('Failed to load theme mode:', { error });
      }
    };

    loadThemeMode();
  }, []);

  // 根據模式和系統設置確定當前主題
  useEffect(() => {
    const determineTheme = () => {
      if (mode === 'auto') {
        setIsDark(systemColorScheme === 'dark');
      } else {
        setIsDark(mode === 'dark');
      }
    };

    determineTheme();
  }, [mode, systemColorScheme]);

  // 切換主題
  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  // 設置主題模式
  const setThemeMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', newMode);
      setMode(newMode);
    } catch (error) {
      logger.warn('Failed to save theme mode:', { error });
    }
  };

  // 當前主題
  const currentTheme = isDark ? darkTheme : theme;

  const contextValue: ThemeContextType = {
    theme: currentTheme as any, // 臨時類型轉換
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

// 使用主題的 Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 導出主題上下文
export default ThemeContext;
