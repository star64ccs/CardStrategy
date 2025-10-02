// 設計系統提供者組件
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { designSystemService } from '../../services/designSystemService';
import {
  selectAccessibilityConfig,
  selectComponents,
  selectCurrentTheme,
  selectThemes,
  selectTokens,
  setCurrentTheme,
} from '../../store/slices/designSystemSlice';
import type {
  AccessibilityConfig,
  ComponentLibrary,
  DesignToken,
  Theme,
  ThemeType,
} from '../../types/designSystem';

// 設計系統上下文類型
interface DesignSystemContextType {
  currentTheme: ThemeType;
  themes: Record<ThemeType, Theme>;
  components: ComponentLibrary;
  tokens: DesignToken[];
  accessibility: AccessibilityConfig;
  setTheme: (theme: ThemeType) => void;
  registerComponent: (name: string, config: unknown) => void;
  addToken: (token: DesignToken) => void;
  updateAccessibility: (config: Partial<AccessibilityConfig>) => void;
}

// 創建上下文
const _DesignSystemContext = createContext<DesignSystemContextType | undefined>(
  undefined
);

// 設計系統提供者屬性
interface DesignSystemProviderProps {
  children: ReactNode;
  initialTheme?: ThemeType;
}

// 設計系統提供者組件
export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({
  children,
  initialTheme = 'dark',
}) => {
  const _dispatch = useDispatch();

  // 從 Redux 獲取狀態
  const _currentTheme = useSelector(selectCurrentTheme);
  const _themes = useSelector(selectThemes);
  const _components = useSelector(selectComponents);
  const _tokens = useSelector(selectTokens);
  const _accessibility = useSelector(selectAccessibilityConfig);

  // 初始化設計系統
  useEffect(() => {
    const _initializeDesignSystem = async () => {
      try {
        // 初始化設計系統
        const _allThemes = designSystemService.getAllThemes();
        dispatch(setCurrentTheme(initialTheme || 'default'));
        return true;
      } catch (error) {
        console.error('Failed to initialize design system:', error);
        return false;
      }
    };

    initializeDesignSystem();
  }, [dispatch, initialTheme]);

  // 設置主題
  const _setTheme = (theme: ThemeType) => {
    designSystemService.setTheme(theme);
    dispatch(setCurrentTheme(theme));
  };

  // 註冊組件
  const _registerComponent = (name: string, config: unknown) => {
    designSystemService.registerComponent(name, config);
  };

  // 添加令牌
  const _addToken = (token: DesignToken) => {
    designSystemService.addToken(token);
  };

  // 更新可訪問性配置
  const _updateAccessibility = (config: Partial<AccessibilityConfig>) => {
    designSystemService.updateAccessibilityConfig(config);
  };

  // 上下文值
  const contextValue: DesignSystemContextType = {
    currentTheme,
    themes,
    components,
    tokens,
    accessibility,
    setTheme,
    registerComponent,
    addToken,
    updateAccessibility,
  };

  return (
    <DesignSystemContext.Provider value={contextValue}>
      {children}
    </DesignSystemContext.Provider>
  );
};

// 使用設計系統 Hook
export const _useDesignSystem = (): DesignSystemContextType => {
  const _context = useContext(DesignSystemContext);
  if (context === undefined) {
    throw new Error('useDesignSystem 必須在 DesignSystemProvider 內使用');
  }
  return context;
};

// 導出上下文
export { DesignSystemContext };
export default DesignSystemProvider;
