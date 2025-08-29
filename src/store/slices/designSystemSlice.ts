// 設計系統 Redux Slice
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type {
  AccessibilityConfig,
  ComponentConfig,
  DesignSystemState,
  DesignToken,
  Theme,
  ThemeType,
} from '../../types/designSystem';

// 初始狀態
const initialState: DesignSystemState = {
  currentTheme: 'dark',
  themes: {} as Record<ThemeType, Theme>,
  components: {
    atoms: {} as any,
    molecules: {} as any,
    organisms: {} as any,
    templates: {} as any,
  },
  tokens: [],
  accessibility: {
    contrastRatios: {
      normal: 4.5,
      large: 3.0,
      ui: 3.0,
    },
    focusIndicator: {
      color: '#FFD700',
      width: 2,
      style: 'solid',
    },
    animationPreferences: {
      reduceMotion: false,
      prefersReducedMotion: false,
    },
    fontSizePreferences: {
      minimum: 12,
      maximum: 24,
      step: 2,
    },
  },
  isLoading: false,
  error: null,
};

// 設計系統 slice
const _designSystemSlice = createSlice({
  name: 'designSystem',
  initialState,
  reducers: {
    // 設置當前主題
    setCurrentTheme: (state, action: PayloadAction<ThemeType>) => {
      state.currentTheme = action.payload;
    },

    // 設置所有主題
    setThemes: (state, action: PayloadAction<Record<ThemeType, Theme>>) => {
      state.themes = action.payload;
    },

    // 添加主題
    addTheme: (
      state,
      action: PayloadAction<{ type: ThemeType; theme: Theme }>
    ) => {
      state.themes[action.payload.type] = action.payload.theme;
    },

    // 更新主題
    updateTheme: (
      state,
      action: PayloadAction<{ type: ThemeType; theme: Partial<Theme> }>
    ) => {
      if (state.themes[action.payload.type]) {
        state.themes[action.payload.type] = {
          ...state.themes[action.payload.type],
          ...action.payload.theme,
        };
      }
    },

    // 註冊組件
    registerComponent: (
      state,
      action: PayloadAction<{ name: string; config: ComponentConfig }>
    ) => {
      const { name, config } = action.payload;
      const _category = determineComponentCategory(name);
      if (category) {
        (state.components[category] as any)[name] = config;
      }
    },

    // 更新組件
    updateComponent: (
      state,
      action: PayloadAction<{ name: string; config: Partial<ComponentConfig> }>
    ) => {
      const { name, config } = action.payload;
      const _existingConfig = getComponentFromState(state, name);
      if (existingConfig) {
        const _category = determineComponentCategory(name);
        if (category) {
          (state.components[category] as any)[name] = {
            ...existingConfig,
            ...config,
          };
        }
      }
    },

    // 設置所有組件
    setComponents: (
      state,
      action: PayloadAction<DesignSystemState['components']>
    ) => {
      state.components = action.payload;
    },

    // 添加設計令牌
    addToken: (state, action: PayloadAction<DesignToken>) => {
      state.tokens.push(action.payload);
    },

    // 更新設計令牌
    updateToken: (
      state,
      action: PayloadAction<{ name: string; value: string | number }>
    ) => {
      const { name, value } = action.payload;
      const _token = state.tokens.find(t => t.name === name);
      if (token) {
        token.value = value;
      }
    },

    // 設置所有令牌
    setTokens: (state, action: PayloadAction<DesignToken[]>) => {
      state.tokens = action.payload;
    },

    // 更新可訪問性配置
    updateAccessibilityConfig: (
      state,
      action: PayloadAction<Partial<AccessibilityConfig>>
    ) => {
      state.accessibility = {
        ...state.accessibility,
        ...action.payload,
      };
    },

    // 設置可訪問性配置
    setAccessibilityConfig: (
      state,
      action: PayloadAction<AccessibilityConfig>
    ) => {
      state.accessibility = action.payload;
    },

    // 設置加載狀態
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 設置錯誤
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 清除錯誤
    clearError: state => {
      state.error = null;
    },

    // 重置狀態
    reset: state => {
      return initialState;
    },
  },
});

// 輔助函數
function determineComponentCategory(
  name: string): keyof DesignSystemState['components'] | null {
  const _atomComponents = ['Button', 'Input', 'Label', 'Icon', 'Badge'];
  const _moleculeComponents = ['Card', 'Modal', 'Dropdown', 'Tabs', 'Alert'];
  const _organismComponents = [
    'Header',
    'Footer',
    'Navigation',
    'Sidebar',
    'Form',
  ];
  const _templateComponents = ['Page', 'Layout', 'Dashboard'];

  if (atomComponents.includes(name)) return 'atoms';
  if (moleculeComponents.includes(name)) return 'molecules';
  if (organismComponents.includes(name)) return 'organisms';
  if (templateComponents.includes(name)) return 'templates';

  return null;
}

function getComponentFromState(
  state: DesignSystemState, name: string): ComponentConfig | null {
  for (const category of Object.values(state.components)) {
    if (category[name]) {
      return category[name];
    }
  }
  return null;
}

// 導出 actions
export const {
  setCurrentTheme,
  setThemes,
  addTheme,
  updateTheme,
  registerComponent,
  updateComponent,
  setComponents,
  addToken,
  updateToken,
  setTokens,
  updateAccessibilityConfig,
  setAccessibilityConfig,
  setLoading,
  setError,
  clearError,
  reset,
} = designSystemSlice.actions;

// 導出 reducer
export default designSystemSlice.reducer;

// 選擇器
export const _selectCurrentTheme = (state: {
  designSystem: DesignSystemState;
}) => state.designSystem.currentTheme;

export const _selectThemes = (state: { designSystem: DesignSystemState }) =>
  state.designSystem.themes;

export const _selectCurrentThemeData = (state: {
  designSystem: DesignSystemState;
}) => state.designSystem.themes[state.designSystem.currentTheme];

export const _selectComponents = (state: { designSystem: DesignSystemState }) =>
  state.designSystem.components;

export const _selectTokens = (state: { designSystem: DesignSystemState }) =>
  state.designSystem.tokens;

export const _selectAccessibilityConfig = (state: {
  designSystem: DesignSystemState;
}) => state.designSystem.accessibility;

export const _selectIsLoading = (state: { designSystem: DesignSystemState }) =>
  state.designSystem.isLoading;

export const _selectError = (state: { designSystem: DesignSystemState }) =>
  state.designSystem.error;

// 特定組件選擇器
export const _selectComponent =
  (name: string) => (state: { designSystem: DesignSystemState }) => {
    return getComponentFromState(state.designSystem, name);
  };

// 特定令牌選擇器
export const _selectToken =
  (name: string) => (state: { designSystem: DesignSystemState }) => {
    return state.designSystem.tokens.find(token => token.name === name) || null;
  };

// 按類別選擇令牌
export const _selectTokensByCategory =
  (category: string) => (state: { designSystem: DesignSystemState }) => {
    return state.designSystem.tokens.filter(
      token => token.category === category
    );
  };
