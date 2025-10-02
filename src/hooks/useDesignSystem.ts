// 設計系統 Hook
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { designSystemService } from '../services/designSystemService';
import {
  selectCurrentTheme,
  selectThemes,
  selectCurrentThemeData,
  selectComponents,
  selectTokens,
  selectAccessibilityConfig,
  selectIsLoading,
  selectError,
  setCurrentTheme,
  registerComponent as registerComponentAction,
  addToken as addTokenAction,
  updateAccessibilityConfig,
} from '../store/slices/designSystemSlice';
import type {
  ThemeType,
  Theme,
  ComponentConfig,
  DesignToken,
  AccessibilityConfig,
} from '../types/designSystem';

// 設計系統 Hook ReturnValueClass型
interface UseDesignSystemReturn {
  // Status
  currentTheme: ThemeType;
  theme: Theme | undefined; // Add theme Property作為 currentThemeData 的別名
  themes: Record<ThemeType, Theme>;
  currentThemeData: Theme | undefined;
  components: unknown;
  tokens: DesignToken[];
  accessibility: AccessibilityConfig;
  isLoading: boolean;
  error: string | null;

  // Method
  setTheme: (theme: ThemeType) => void;
  getTheme: (theme: ThemeType) => Theme | undefined;
  getAllThemes: () => Record<ThemeType, Theme>;
  registerComponent: (name: string, config: ComponentConfig) => void;
  getComponent: (name: string) => ComponentConfig | null;
  getAllComponents: () => any;
  addToken: (token: DesignToken) => void;
  getToken: (name: string) => DesignToken | null;
  getAllTokens: () => DesignToken[];
  updateToken: (name: string, value: string | number) => void;
  updateAccessibility: (config: Partial<AccessibilityConfig>) => void;
  getAccessibilityConfig: () => AccessibilityConfig;
  checkContrastRatio: (foreground: string, background: string) => number;
  isAccessible: (
    foreground: string,
    background: string,
    size?: 'normal' | 'large'
  ) => boolean;
  subscribe: (event: string, callback: (event: unknown) => void) => void;
  unsubscribe: (event: string, callback: (event: unknown) => void) => void;
}

// 設計系統 Hook
export const _useDesignSystem = (): UseDesignSystemReturn => {
  const _dispatch = useDispatch();

  // 從 Redux GetStatus
  const _currentTheme = useSelector(selectCurrentTheme);
  const _themes = useSelector(selectThemes);
  const _currentThemeData = useSelector(selectCurrentThemeData);
  const _components = useSelector(selectComponents);
  const _tokens = useSelector(selectTokens);
  const _accessibility = useSelector(selectAccessibilityConfig);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);

  // SettingsTheme
  const _setTheme = useCallback(
    (theme: ThemeType) => {
      designSystemService.setTheme(theme);
      dispatch(setCurrentTheme(theme));
    },
    [dispatch]
  );

  // GetTheme
  const _getTheme = useCallback((theme: ThemeType) => {
    return designSystemService.getTheme(theme);
  }, []);

  // Get所有Theme
  const _getAllThemes = useCallback(() => {
    return designSystemService.getAllThemes();
  }, []);

  // RegisterComponent
  const _registerComponent = useCallback(
    (name: string, config: ComponentConfig) => {
      designSystemService.registerComponent(name, config);
      dispatch(registerComponentAction({ name, config }));
    },
    [dispatch]
  );

  // GetComponent
  const _getComponent = useCallback((name: string) => {
    return designSystemService.getComponent(name);
  }, []);

  // Get所有Component
  const _getAllComponents = useCallback(() => {
    return designSystemService.getAllComponents();
  }, []);

  // Add令牌
  const _addToken = useCallback(
    (token: DesignToken) => {
      designSystemService.addToken(token);
      dispatch(addTokenAction(token));
    },
    [dispatch]
  );

  // Get令牌
  const _getToken = useCallback((name: string) => {
    return designSystemService.getToken(name);
  }, []);

  // Get所有令牌
  const _getAllTokens = useCallback(() => {
    return designSystemService.getAllTokens();
  }, []);

  // Update令牌
  const _updateToken = useCallback((name: string, value: string | number) => {
    designSystemService.updateToken(name, value);
  }, []);

  // Update可訪問性Configure
  const _updateAccessibility = useCallback(
    (config: Partial<AccessibilityConfig>) => {
      designSystemService.updateAccessibilityConfig(config);
      dispatch(updateAccessibilityConfig(config));
    },
    [dispatch]
  );

  // Get可訪問性Configure
  const _getAccessibilityConfig = useCallback(() => {
    return designSystemService.getAccessibilityConfig();
  }, []);

  // Check對比度
  const _checkContrastRatio = useCallback(
    (foreground: string, background: string) => {
      return designSystemService.checkContrastRatio(foreground, background);
    },
    []
  );

  // CheckYesNo可訪問
  const _isAccessible = useCallback(
    (
      foreground: string,
      background: string,
      size: 'normal' | 'large' = 'normal'
    ) => {
      return designSystemService.isAccessible(foreground, background, size);
    },
    []
  );

  // 訂閱Event
  const _subscribe = useCallback(
    (event: string, callback: (event: unknown) => void) => {
      designSystemService.subscribe(event, callback);
    },
    []
  );

  // Cancel訂閱
  const _unsubscribe = useCallback(
    (event: string, callback: (event: unknown) => void) => {
      designSystemService.unsubscribe(event, callback);
    },
    []
  );

  return {
    // Status
    currentTheme,
    theme: currentThemeData, // Add theme Property
    themes,
    currentThemeData,
    components,
    tokens,
    accessibility,
    isLoading,
    error,

    // Method
    setTheme,
    getTheme,
    getAllThemes,
    registerComponent,
    getComponent,
    getAllComponents,
    addToken,
    getToken,
    getAllTokens,
    updateToken,
    updateAccessibility,
    getAccessibilityConfig,
    checkContrastRatio,
    isAccessible,
    subscribe,
    unsubscribe,
  };
};

// Export Hook
export default useDesignSystem;
