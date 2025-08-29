import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../../../store';
import {
  clearError,
  customizeTheme,
  exportTheme,
  importTheme,
  initializeTheme,
  resetTheme,
  setAutoTheme,
  setTheme,
  toggleTheme,
} from '../../../store/slices/themeSlice';
import type {
  ThemeBorderRadius,
  ThemeColors,
  ThemeCustomization,
  ThemeShadows,
  ThemeSpacing,
  ThemeTypography,
} from '../types/theme';

export const _useTheme = () => {
  const _dispatch = useDispatch<AppDispatch>();
  const {
    currentTheme,
    availableThemes,
    config,
    isAutoTheme,
    systemTheme,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.theme);

  // 初始化主題
  const _initialize = useCallback(async () => {
    try {
      await dispatch(initializeTheme()).unwrap();
      return true;
    } catch (error) {
      console.error('主題初始化失敗:', error);
      return false;
    }
  }, [dispatch]);

  // 設置主題
  const _changeTheme = useCallback(
    async (themeId: string, persist = true) => {
      try {
        await dispatch(setTheme({ themeId, persist })).unwrap();
      } catch (error) {
        console.error('Failed to set theme:', error);
      }
    },
    [dispatch]
  );

  // 切換主題
  const _toggle = useCallback(async () => {
    try {
      await dispatch(toggleTheme()).unwrap();
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  }, [dispatch]);

  // 設置自動主題
  const _setAuto = useCallback(
    async (enabled: boolean) => {
      try {
        await dispatch(setAutoTheme(enabled)).unwrap();
      } catch (error) {
        console.error('Failed to set auto theme:', error);
      }
    },
    [dispatch]
  );

  // 自定義主題
  const _customize = useCallback(
    async (customization: ThemeCustomization) => {
      try {
        await dispatch(customizeTheme(customization)).unwrap();
      } catch (error) {
        console.error('Failed to customize theme:', error);
      }
    },
    [dispatch]
  );

  // 重置主題
  const _reset = useCallback(async () => {
    try {
      await dispatch(resetTheme()).unwrap();
    } catch (error) {
      console.error('Failed to reset theme:', error);
    }
  }, [dispatch]);

  // 導出主題
  const _exportThemeData = useCallback(
    async (themeId: string) => {
      try {
        return await dispatch(exportTheme(themeId)).unwrap();
      } catch (error) {
        console.error('Failed to export theme:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 導入主題
  const _importThemeData = useCallback(
    async (themeData: string) => {
      try {
        await dispatch(importTheme(themeData)).unwrap();
      } catch (error) {
        console.error('Failed to import theme:', error);
      }
    },
    [dispatch]
  );

  // 清除錯誤
  const _clearThemeError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 檢查是否為深色模式
  const _isDarkMode = useMemo(() => {
    return currentTheme.type === 'dark';
  }, [currentTheme.type]);

  // 獲取主題顏色
  const _colors = useMemo(() => {
    return currentTheme.colors;
  }, [currentTheme.colors]);

  // 獲取主題間距
  const _spacing = useMemo(() => {
    return currentTheme.spacing;
  }, [currentTheme.spacing]);

  // 獲取主題字體
  const _typography = useMemo(() => {
    return currentTheme.typography;
  }, [currentTheme.typography]);

  // 獲取主題圓角
  const _borderRadius = useMemo(() => {
    return currentTheme.borderRadius;
  }, [currentTheme.borderRadius]);

  // 獲取主題陰影
  const _shadows = useMemo(() => {
    return currentTheme.shadows;
  }, [currentTheme.shadows]);

  // 初始化效果
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // 狀態
    currentTheme,
    availableThemes,
    config,
    isAutoTheme,
    systemTheme,
    isLoading,
    error,
    isDarkMode,

    // 主題屬性
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,

    // 操作方法
    initialize,
    changeTheme,
    toggle,
    setAuto,
    customize,
    reset,
    exportTheme: exportThemeData,
    importTheme: importThemeData,
    clearError: clearThemeError,
  };
};

// 專門用於獲取主題顏色的 Hook
export const _useThemeColors = (): ThemeColors => {
  const { colors } = useTheme();
  return colors;
};

// 專門用於獲取主題間距的 Hook
export const _useThemeSpacing = (): ThemeSpacing => {
  const { spacing } = useTheme();
  return spacing;
};

// 專門用於獲取主題字體的 Hook
export const _useThemeTypography = (): ThemeTypography => {
  const { typography } = useTheme();
  return typography;
};

// 專門用於獲取主題圓角的 Hook
export const _useThemeBorderRadius = (): ThemeBorderRadius => {
  const { borderRadius } = useTheme();
  return borderRadius;
};

// 專門用於獲取主題陰影的 Hook
export const _useThemeShadows = (): ThemeShadows => {
  const { shadows } = useTheme();
  return shadows;
};

// 專門用於檢查深色模式的 Hook
export const _useIsDarkMode = (): boolean => {
  const { isDarkMode } = useTheme();
  return isDarkMode;
};

// 主題切換 Hook
export const _useThemeToggle = () => {
  const { toggle, isLoading, error } = useTheme();

  return {
    toggle,
    isLoading,
    error,
  };
};

// 主題自定義 Hook
export const _useThemeCustomization = () => {
  const { customize, availableThemes, isLoading, error } = useTheme();

  return {
    customize,
    availableThemes,
    isLoading,
    error,
  };
};

// 主題導入/導出 Hook
export const _useThemeImportExport = () => {
  const { exportTheme, importTheme, availableThemes, isLoading, error } =
    useTheme();

  return {
    exportTheme,
    importTheme,
    availableThemes,
    isLoading,
    error,
  };
};
