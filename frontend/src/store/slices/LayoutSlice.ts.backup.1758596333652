import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import type {
  Breakpoint,
  LayoutComponentRegistration,
  LayoutSystemConfig,
  LayoutSystemEvent,
  ResponsiveState,
} from '../../types/layout';

// 初始狀態
const initialState = {
  responsive: {
    currentBreakpoint: 'md' as Breakpoint,
    breakpoints: {
      xs: 575,
      sm: 767,
      md: 991,
      lg: 1199,
      xl: 1399,
      xxl: 1400,
    },
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeScreen: false,
    windowWidth: 1024,
    windowHeight: 768,
  } as ResponsiveState,
  components: {} as Record<string, LayoutComponentRegistration>,
  config: {
    breakpoints: {
      xs: 575,
      sm: 767,
      md: 991,
      lg: 1199,
      xl: 1399,
      xxl: 1400,
    },
    defaultBreakpoint: 'md',
    enableResponsive: true,
    enableAccessibility: true,
    enableAnimations: true,
    containerMaxWidths: {
      xs: '100%',
      sm: '540px',
      md: '720px',
      lg: '960px',
      xl: '1140px',
      xxl: '1320px',
    },
    gridColumns: 12,
    defaultSpacing: '1rem',
    defaultGap: '1rem',
  } as LayoutSystemConfig,
  isLoading: false,
  error: null as string | null,
  events: [] as LayoutSystemEvent[],
};

// 創建 slice
const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    // 設置響應式狀態
    setResponsiveState: (state, action: PayloadAction<ResponsiveState>) => {
      state.responsive = action.payload;
    },

    // 設置當前斷點
    setCurrentBreakpoint: (state, action: PayloadAction<Breakpoint>) => {
      state.responsive.currentBreakpoint = action.payload;
      state.responsive.isMobile =
        action.payload === 'xs' || action.payload === 'sm';
      state.responsive.isTablet = action.payload === 'md';
      state.responsive.isDesktop =
        action.payload === 'lg' || action.payload === 'xl';
      state.responsive.isLargeScreen = action.payload === 'xxl';
    },

    // 設置窗口尺寸
    setWindowSize: (
      state,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.responsive.windowWidth = action.payload.width;
      state.responsive.windowHeight = action.payload.height;
    },

    // 註冊佈局組件
    registerLayoutComponent: (
      state,
      action: PayloadAction<LayoutComponentRegistration>
    ) => {
      state.components[action.payload.name] = action.payload;
    },

    // 更新組件
    updateLayoutComponent: (
      state,
      action: PayloadAction<{
        name: string;
        updates: Partial<LayoutComponentRegistration>;
      }>
    ) => {
      const { name, updates } = action.payload;
      if (state.components[name]) {
        state.components[name] = { ...state.components[name], ...updates };
      }
    },

    // 移除組件
    removeLayoutComponent: (state, action: PayloadAction<string>) => {
      delete state.components[action.payload];
    },

    // 設置所有組件
    setLayoutComponents: (
      state,
      action: PayloadAction<Record<string, LayoutComponentRegistration>>
    ) => {
      state.components = action.payload;
    },

    // 更新佈局系統配置
    updateLayoutConfig: (
      state,
      action: PayloadAction<Partial<LayoutSystemConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    // 設置佈局系統配置
    setLayoutConfig: (state, action: PayloadAction<LayoutSystemConfig>) => {
      state.config = action.payload;
    },

    // 設置加載狀態
    setLayoutLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 設置錯誤
    setLayoutError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 添加事件
    addLayoutEvent: (state, action: PayloadAction<LayoutSystemEvent>) => {
      state.events.push(action.payload);
      // 保持最多 100 個事件
      if (state.events.length > 100) {
        state.events = state.events.slice(-100);
      }
    },

    // 清除事件
    clearLayoutEvents: state => {
      state.events = [];
    },

    // 重置狀態
    resetLayoutState: state => {
      return initialState;
    },
  },
});

// 導出 actions
export const {
  setResponsiveState,
  setCurrentBreakpoint,
  setWindowSize,
  registerLayoutComponent,
  updateLayoutComponent,
  removeLayoutComponent,
  setLayoutComponents,
  updateLayoutConfig,
  setLayoutConfig,
  setLayoutLoading,
  setLayoutError,
  addLayoutEvent,
  clearLayoutEvents,
  resetLayoutState,
} = layoutSlice.actions;

// 導出 reducer
export default layoutSlice.reducer;

// 選擇器
export const selectResponsiveState = (state: {
  layout: typeof initialState;
}) => state.layout.responsive;
export const selectCurrentBreakpoint = (state: {
  layout: typeof initialState;
}) => state.layout.responsive.currentBreakpoint;
export const selectIsMobile = (state: { layout: typeof initialState }) =>
  state.layout.responsive.isMobile;
export const selectIsTablet = (state: { layout: typeof initialState }) =>
  state.layout.responsive.isTablet;
export const selectIsDesktop = (state: { layout: typeof initialState }) =>
  state.layout.responsive.isDesktop;
export const selectIsLargeScreen = (state: { layout: typeof initialState }) =>
  state.layout.responsive.isLargeScreen;
export const selectWindowSize = (state: { layout: typeof initialState }) => ({
  width: state.layout.responsive.windowWidth,
  height: state.layout.responsive.windowHeight,
});

export const selectLayoutComponents = (state: {
  layout: typeof initialState;
}) => state.layout.components;
export const selectLayoutComponent =
  (name: string) => (state: { layout: typeof initialState }) =>
    state.layout.components[name];

export const selectLayoutConfig = (state: { layout: typeof initialState }) =>
  state.layout.config;
export const selectLayoutLoading = (state: { layout: typeof initialState }) =>
  state.layout.isLoading;
export const selectLayoutError = (state: { layout: typeof initialState }) =>
  state.layout.error;
export const selectLayoutEvents = (state: { layout: typeof initialState }) =>
  state.layout.events;

// 複合選擇器
export const selectLayoutComponentsByCategory = (category: string) =>
  createSelector([selectLayoutComponents], components =>
    Object.values(components).filter(
      component => component.category === category
    )
  );

export const selectResponsiveComponents = createSelector(
  [selectLayoutComponents],
  components =>
    Object.values(components).filter(component => component.responsive)
);

export const selectAccessibleComponents = createSelector(
  [selectLayoutComponents],
  components =>
    Object.values(components).filter(component => component.accessible)
);

export const selectLayoutSystemState = createSelector(
  [
    selectResponsiveState,
    selectLayoutComponents,
    selectLayoutConfig,
    selectLayoutLoading,
    selectLayoutError,
  ],
  (responsive, components, config, isLoading, error) => ({
    responsive,
    components,
    config,
    isLoading,
    error,
  })
);
