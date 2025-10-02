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

// 設計系統 Hook 返回值類型
interface UseDesignSystemReturn {
  // 狀態
  currentTheme: ThemeType;
  theme: Theme | undefined; // 添加 theme 屬性作為 currentThemeData 的別名
  themes: Record<ThemeType, Theme>;
  currentThemeData: Theme | undefined;
  components: unknown;
  tokens: DesignToken[];
  accessibility: AccessibilityConfig;
  isLoading: boolean;
  error: string | null;

  // 方法
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
export const useDesignSystem = (): UseDesignSystemReturn => {
  const dispatch = useDispatch();

  // 從 Redux 獲取狀態
  const currentTheme = useSelector(selectCurrentTheme);
  const themes = useSelector(selectThemes);
  const currentThemeData = useSelector(selectCurrentThemeData);
  const components = useSelector(selectComponents);
  const tokens = useSelector(selectTokens);
  const accessibility = useSelector(selectAccessibilityConfig);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  // 設置主題
  const setTheme = useCallback(
    (theme: ThemeType) => {
      designSystemService.setTheme(theme);
      dispatch(setCurrentTheme(theme));
    },
    [dispatch]
  );

  // 獲取主題
  const getTheme = useCallback((theme: ThemeType) => {
    return designSystemService.getTheme(theme);
  }, []);

  // 獲取所有主題
  const getAllThemes = useCallback(() => {
    return designSystemService.getAllThemes();
  }, []);

  // 註冊組件
  const registerComponent = useCallback(
    (name: string, config: ComponentConfig) => {
      designSystemService.registerComponent(name, config);
      dispatch(registerComponentAction({ name, config }));
    },
    [dispatch]
  );

  // 獲取組件
  const getComponent = useCallback((name: string) => {
    return designSystemService.getComponent(name);
  }, []);

  // 獲取所有組件
  const getAllComponents = useCallback(() => {
    return designSystemService.getAllComponents();
  }, []);

  // 添加令牌
  const addToken = useCallback(
    (token: DesignToken) => {
      designSystemService.addToken(token);
      dispatch(addTokenAction(token));
    },
    [dispatch]
  );

  // 獲取令牌
  const getToken = useCallback((name: string) => {
    return designSystemService.getToken(name);
  }, []);

  // 獲取所有令牌
  const getAllTokens = useCallback(() => {
    return designSystemService.getAllTokens();
  }, []);

  // 更新令牌
  const updateToken = useCallback((name: string, value: string | number) => {
    designSystemService.updateToken(name, value);
  }, []);

  // 更新可訪問性配置
  const updateAccessibility = useCallback(
    (config: Partial<AccessibilityConfig>) => {
      designSystemService.updateAccessibilityConfig(config);
      dispatch(updateAccessibilityConfig(config));
    },
    [dispatch]
  );

  // 獲取可訪問性配置
  const getAccessibilityConfig = useCallback(() => {
    return designSystemService.getAccessibilityConfig();
  }, []);

  // 檢查對比度
  const checkContrastRatio = useCallback(
    (foreground: string, background: string) => {
      return designSystemService.checkContrastRatio(foreground, background);
    },
    []
  );

  // 檢查是否可訪問
  const isAccessible = useCallback(
    (
      foreground: string,
      background: string,
      size: 'normal' | 'large' = 'normal'
    ) => {
      return designSystemService.isAccessible(foreground, background, size);
    },
    []
  );

  // 訂閱事件
  const subscribe = useCallback(
    (event: string, callback: (event: unknown) => void) => {
      designSystemService.subscribe(event, callback);
    },
    []
  );

  // 取消訂閱
  const unsubscribe = useCallback(
    (event: string, callback: (event: unknown) => void) => {
      designSystemService.unsubscribe(event, callback);
    },
    []
  );

  return {
    // 狀態
    currentTheme,
    theme: currentThemeData, // 添加 theme 屬性
    themes,
    currentThemeData,
    components,
    tokens,
    accessibility,
    isLoading,
    error,

    // 方法
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

// 導出 Hook
export default useDesignSystem;
