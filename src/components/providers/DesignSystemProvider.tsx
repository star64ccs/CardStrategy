// 設計系統提供者Component
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

// 設計系統上下文Class型
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

// Create上下文
const _DesignSystemContext = createContext<DesignSystemContextType | undefined>(
  undefined
);

// 設計系統提供者Property
interface DesignSystemProviderProps {
  children: ReactNode;
  initialTheme?: ThemeType;
}

// 設計系統提供者Component
export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({
  children,
  initialTheme = 'dark',
}) => {
  const _dispatch = useDispatch();

  // 從 Redux GetStatus
  const _currentTheme = useSelector(selectCurrentTheme);
  const _themes = useSelector(selectThemes);
  const _components = useSelector(selectComponents);
  const _tokens = useSelector(selectTokens);
  const _accessibility = useSelector(selectAccessibilityConfig);

  // Initialize設計系統
  useEffect(() => {
    const _initializeDesignSystem = async () => {
      try {
        // Initialize設計系統
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

  // SettingsTheme
  const _setTheme = (theme: ThemeType) => {
    designSystemService.setTheme(theme);
    dispatch(setCurrentTheme(theme));
  };

  // RegisterComponent
  const _registerComponent = (name: string, config: unknown) => {
    designSystemService.registerComponent(name, config);
  };

  // Add令牌
  const _addToken = (token: DesignToken) => {
    designSystemService.addToken(token);
  };

  // Update可訪問性Configure
  const _updateAccessibility = (config: Partial<AccessibilityConfig>) => {
    designSystemService.updateAccessibilityConfig(config);
  };

  // 上下文Value
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

// Export上下文
export { DesignSystemContext };
export default DesignSystemProvider;
