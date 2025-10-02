import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import type {
  Breakpoint,
  LayoutComponentRegistration,
  LayoutSystemConfig,
  LayoutSystemEvent,
  ResponsiveState,
} from '../../types/layout';

// 初始Status
const _initialState = {
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

// Create slice
const _layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    // SettingsResponse式Status
    setResponsiveState: (state, action: PayloadAction<ResponsiveState>) => {
      state.responsive = action.payload;
    },

    // Settings當前斷點
    setCurrentBreakpoint: (state, action: PayloadAction<Breakpoint>) => {
      state.responsive.currentBreakpoint = action.payload;
      state.responsive.isMobile =
        action.payload === 'xs' || action.payload === 'sm';
      state.responsive.isTablet = action.payload === 'md';
      state.responsive.isDesktop =
        action.payload === 'lg' || action.payload === 'xl';
      state.responsive.isLargeScreen = action.payload === 'xxl';
    },

    // Settings窗口尺寸
    setWindowSize: (
      state,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.responsive.windowWidth = action.payload.width;
      state.responsive.windowHeight = action.payload.height;
    },

    // Register佈局Component
    registerLayoutComponent: (
      state,
      action: PayloadAction<LayoutComponentRegistration>
    ) => {
      state.components[action.payload.name] = action.payload;
    },

    // UpdateComponent
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

    // RemoveComponent
    removeLayoutComponent: (state, action: PayloadAction<string>) => {
      delete state.components[action.payload];
    },

    // Settings所有Component
    setLayoutComponents: (
      state,
      action: PayloadAction<Record<string, LayoutComponentRegistration>>
    ) => {
      state.components = action.payload;
    },

    // Update佈局系統Configure
    updateLayoutConfig: (
      state,
      action: PayloadAction<Partial<LayoutSystemConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    // Settings佈局系統Configure
    setLayoutConfig: (state, action: PayloadAction<LayoutSystemConfig>) => {
      state.config = action.payload;
    },

    // Settings加載Status
    setLayoutLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // SettingsError
    setLayoutError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // AddEvent
    addLayoutEvent: (state, action: PayloadAction<LayoutSystemEvent>) => {
      state.events.push(action.payload);
      // 保持最多 100 個Event
      if (state.events.length > 100) {
        state.events = state.events.slice(-100);
      }
    },

    // ClearEvent
    clearLayoutEvents: state => {
      state.events = [];
    },

    // ResetStatus
    resetLayoutState: state => {
      return initialState;
    },
  },
});

// Export actions
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

// Export reducer
export default layoutSlice.reducer;

// Select器
export const _selectResponsiveState = (state: {
  layout: typeof initialState;
}) => state.layout.responsive;
export const _selectCurrentBreakpoint = (state: {
  layout: typeof initialState;
}) => state.layout.responsive.currentBreakpoint;
export const _selectIsMobile = (state: { layout: typeof initialState }) =>
  state.layout.responsive.isMobile;
export const _selectIsTablet = (state: { layout: typeof initialState }) =>
  state.layout.responsive.isTablet;
export const _selectIsDesktop = (state: { layout: typeof initialState }) =>
  state.layout.responsive.isDesktop;
export const _selectIsLargeScreen = (state: { layout: typeof initialState }) =>
  state.layout.responsive.isLargeScreen;
export const _selectWindowSize = (state: { layout: typeof initialState }) => ({
  width: state.layout.responsive.windowWidth,
  height: state.layout.responsive.windowHeight,
});

export const _selectLayoutComponents = (state: {
  layout: typeof initialState;
}) => state.layout.components;
export const _selectLayoutComponent =
  (name: string) => (state: { layout: typeof initialState }) =>
    state.layout.components[name];

export const _selectLayoutConfig = (state: { layout: typeof initialState }) =>
  state.layout.config;
export const _selectLayoutLoading = (state: { layout: typeof initialState }) =>
  state.layout.isLoading;
export const _selectLayoutError = (state: { layout: typeof initialState }) =>
  state.layout.error;
export const _selectLayoutEvents = (state: { layout: typeof initialState }) =>
  state.layout.events;

// 複合Select器
export const _selectLayoutComponentsByCategory = (category: string) =>
  createSelector([selectLayoutComponents], components =>
    Object.values(components).filter(
      component => component.category === category
    )
  );

export const _selectResponsiveComponents = createSelector(
  [selectLayoutComponents],
  components =>
    Object.values(components).filter(component => component.responsive)
);

export const _selectAccessibleComponents = createSelector(
  [selectLayoutComponents],
  components =>
    Object.values(components).filter(component => component.accessible)
);

export const _selectLayoutSystemState = createSelector(
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
