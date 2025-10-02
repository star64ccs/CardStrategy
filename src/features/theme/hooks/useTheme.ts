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

  // InitializeTheme
  const _initialize = useCallback(async () => {
    try {
      await dispatch(initializeTheme()).unwrap();
      return true;
    } catch (error) {
      console.error('主題InitializeFailed:', error);
      return false;
    }
  }, [dispatch]);

  // SettingsTheme
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

  // SwitchTheme
  const _toggle = useCallback(async () => {
    try {
      await dispatch(toggleTheme()).unwrap();
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  }, [dispatch]);

  // SettingsAutoTheme
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

  // CustomTheme
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

  // ResetTheme
  const _reset = useCallback(async () => {
    try {
      await dispatch(resetTheme()).unwrap();
    } catch (error) {
      console.error('Failed to reset theme:', error);
    }
  }, [dispatch]);

  // ExportTheme
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

  // ImportTheme
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

  // ClearError
  const _clearThemeError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // CheckYesNo為深色模式
  const _isDarkMode = useMemo(() => {
    return currentTheme.type === 'dark';
  }, [currentTheme.type]);

  // GetTheme顏色
  const _colors = useMemo(() => {
    return currentTheme.colors;
  }, [currentTheme.colors]);

  // GetTheme間距
  const _spacing = useMemo(() => {
    return currentTheme.spacing;
  }, [currentTheme.spacing]);

  // GetTheme字體
  const _typography = useMemo(() => {
    return currentTheme.typography;
  }, [currentTheme.typography]);

  // GetTheme圓角
  const _borderRadius = useMemo(() => {
    return currentTheme.borderRadius;
  }, [currentTheme.borderRadius]);

  // GetTheme陰影
  const _shadows = useMemo(() => {
    return currentTheme.shadows;
  }, [currentTheme.shadows]);

  // Initialize效果
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // Status
    currentTheme,
    availableThemes,
    config,
    isAutoTheme,
    systemTheme,
    isLoading,
    error,
    isDarkMode,

    // ThemeProperty
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,

    // OperationMethod
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

// 專門用於GetTheme顏色的 Hook
export const _useThemeColors = (): ThemeColors => {
  const { colors } = useTheme();
  return colors;
};

// 專門用於GetTheme間距的 Hook
export const _useThemeSpacing = (): ThemeSpacing => {
  const { spacing } = useTheme();
  return spacing;
};

// 專門用於GetTheme字體的 Hook
export const _useThemeTypography = (): ThemeTypography => {
  const { typography } = useTheme();
  return typography;
};

// 專門用於GetTheme圓角的 Hook
export const _useThemeBorderRadius = (): ThemeBorderRadius => {
  const { borderRadius } = useTheme();
  return borderRadius;
};

// 專門用於GetTheme陰影的 Hook
export const _useThemeShadows = (): ThemeShadows => {
  const { shadows } = useTheme();
  return shadows;
};

// 專門用於Check深色模式的 Hook
export const _useIsDarkMode = (): boolean => {
  const { isDarkMode } = useTheme();
  return isDarkMode;
};

// ThemeSwitch Hook
export const _useThemeToggle = () => {
  const { toggle, isLoading, error } = useTheme();

  return {
    toggle,
    isLoading,
    error,
  };
};

// ThemeCustom Hook
export const _useThemeCustomization = () => {
  const { customize, availableThemes, isLoading, error } = useTheme();

  return {
    customize,
    availableThemes,
    isLoading,
    error,
  };
};

// ThemeImport/Export Hook
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
