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

// 初始Status
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
    // Settings當前Theme
    setCurrentTheme: (state, action: PayloadAction<ThemeType>) => {
      state.currentTheme = action.payload;
    },

    // Settings所有Theme
    setThemes: (state, action: PayloadAction<Record<ThemeType, Theme>>) => {
      state.themes = action.payload;
    },

    // AddTheme
    addTheme: (
      state,
      action: PayloadAction<{ type: ThemeType; theme: Theme }>
    ) => {
      state.themes[action.payload.type] = action.payload.theme;
    },

    // UpdateTheme
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

    // RegisterComponent
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

    // UpdateComponent
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

    // Settings所有Component
    setComponents: (
      state,
      action: PayloadAction<DesignSystemState['components']>
    ) => {
      state.components = action.payload;
    },

    // Add設計令牌
    addToken: (state, action: PayloadAction<DesignToken>) => {
      state.tokens.push(action.payload);
    },

    // Update設計令牌
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

    // Settings所有令牌
    setTokens: (state, action: PayloadAction<DesignToken[]>) => {
      state.tokens = action.payload;
    },

    // Update可訪問性Configure
    updateAccessibilityConfig: (
      state,
      action: PayloadAction<Partial<AccessibilityConfig>>
    ) => {
      state.accessibility = {
        ...state.accessibility,
        ...action.payload,
      };
    },

    // Settings可訪問性Configure
    setAccessibilityConfig: (
      state,
      action: PayloadAction<AccessibilityConfig>
    ) => {
      state.accessibility = action.payload;
    },

    // Settings加載Status
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // SettingsError
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // ClearError
    clearError: state => {
      state.error = null;
    },

    // ResetStatus
    reset: state => {
      return initialState;
    },
  },
});

// 輔助Function
function determineComponentCategory(
  name: string
): keyof DesignSystemState['components'] | null {
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
  state: DesignSystemState,
  name: string
): ComponentConfig | null {
  for (const category of Object.values(state.components)) {
    if (category[name]) {
      return category[name];
    }
  }
  return null;
}

// Export actions
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

// Export reducer
export default designSystemSlice.reducer;

// Select器
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

// SpecificComponentSelect器
export const _selectComponent =
  (name: string) => (state: { designSystem: DesignSystemState }) => {
    return getComponentFromState(state.designSystem, name);
  };

// Specific令牌Select器
export const _selectToken =
  (name: string) => (state: { designSystem: DesignSystemState }) => {
    return state.designSystem.tokens.find(token => token.name === name) || null;
  };

// 按Class別Select令牌
export const _selectTokensByCategory =
  (category: string) => (state: { designSystem: DesignSystemState }) => {
    return state.designSystem.tokens.filter(
      token => token.category === category
    );
  };
