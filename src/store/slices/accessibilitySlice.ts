// 可訪問性 Redux Slice
// Manage可訪問性Status、Configure和Event

import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { accessibilityService } from '../../services/accessibilityService';
import type {
  AccessibilityConfig,
  AccessibilityEvent,
  AccessibilityIssue,
  AccessibilityState,
  AccessibilitySuggestion,
  AccessibilityTestConfig,
} from '../../types/accessibility';

// Async Action Creators
export const _initializeAccessibility = createAsyncThunk(
  'accessibility/initialize',
  async (config?: unknown) => {
    accessibilityService.init(config);
    return accessibilityService.getState();
  }
);

export const _updateAccessibilityConfig = createAsyncThunk(
  'accessibility/updateConfig',
  async (config: Partial<AccessibilityConfig>) => {
    accessibilityService.updateConfig(config);
    return accessibilityService.getState();
  }
);

export const _runAccessibilityTest = createAsyncThunk(
  'accessibility/runTest',
  async (config?: Partial<AccessibilityTestConfig>) => {
    const _result = await accessibilityService.runTest(config);
    return result;
  }
);

export const _fixAccessibilityIssues = createAsyncThunk(
  'accessibility/fixIssues',
  async (issues: AccessibilityIssue[]) => {
    await accessibilityService.fixIssues(issues);
    return accessibilityService.getState();
  }
);

// 初始Status
const initialState: AccessibilityState = {
  config: {
    focusManager: {
      trapFocus: false,
      restoreFocus: true,
      focusOrder: [],
      focusIndicator: 'outline',
      focusIndicatorColor: '#007AFF',
      focusIndicatorWidth: '2px',
      focusIndicatorStyle: 'solid',
      focusIndicatorOffset: '2px',
      focusIndicatorAnimation: true,
      focusIndicatorDuration: 200,
      focusIndicatorEasing: 'ease-in-out',
    },
    keyboardNavigation: {
      enabled: true,
      mode: 'linear',
      arrowKeys: true,
      tabKey: true,
      enterKey: true,
      escapeKey: true,
      spaceKey: true,
      shortcuts: {},
      handlers: {},
    },
    screenReader: {
      enabled: true,
      voice: {
        rate: 1,
        pitch: 1,
        volume: 1,
        language: 'zh-CN',
      },
      reading: {
        autoRead: false,
        readOnFocus: true,
        readOnChange: true,
        readOnError: true,
        readOnSuccess: true,
      },
      feedback: {
        onFocus: '已聚焦',
        onBlur: '已失焦',
        onChange: '已更改',
        onError: '發生Error',
        onSuccess: '操作Success',
        onComplete: '操作完成',
      },
    },
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    voiceControl: false,
    switchControl: false,
    assistiveTechnology: {
      screenReader: false,
      voiceControl: false,
      switchControl: false,
      keyboardOnly: false,
      mouseOnly: false,
    },
  },
  focusManager: {
    currentFocus: null,
    focusHistory: [],
    isTrapped: false,
    showIndicator: true,
    focusOrder: [],
    restoreElement: null,
  },
  mode: 'default',
  assistiveTechnology: {
    screenReader: false,
    voiceControl: false,
    switchControl: false,
    keyboardOnly: false,
    mouseOnly: false,
  },
  score: 0,
  issues: [],
  suggestions: [],
};

// 可訪問性 Slice
const _accessibilitySlice = createSlice({
  name: 'accessibility',
  initialState,
  reducers: {
    // Sync Reducers
    setCurrentFocus: (state, action: PayloadAction<string | null>) => {
      state.focusManager.currentFocus = action.payload;
      if (action.payload) {
        state.focusManager.focusHistory.push(action.payload);
        // Limit歷史Record長度
        if (state.focusManager.focusHistory.length > 50) {
          state.focusManager.focusHistory.shift();
        }
      }
    },

    setFocusTrapped: (state, action: PayloadAction<boolean>) => {
      state.focusManager.isTrapped = action.payload;
    },

    setShowIndicator: (state, action: PayloadAction<boolean>) => {
      state.focusManager.showIndicator = action.payload;
    },

    setFocusOrder: (state, action: PayloadAction<string[]>) => {
      state.focusManager.focusOrder = action.payload;
    },

    setRestoreElement: (state, action: PayloadAction<string | null>) => {
      state.focusManager.restoreElement = action.payload;
    },

    switchMode: (
      state,
      action: PayloadAction<
        'default' | 'highContrast' | 'reducedMotion' | 'largeText'
      >
    ) => {
      state.mode = action.payload;

      // Root據模式UpdateConfigure
      switch (action.payload) {
        case 'highContrast':
          state.config.highContrast = true;
          if (state.config.focusManager) {
            state.config.focusManager.focusIndicatorColor = '#FFFFFF';
            state.config.focusManager.focusIndicatorWidth = '3px';
          }
          break;
        case 'reducedMotion':
          state.config.reducedMotion = true;
          if (state.config.focusManager) {
            state.config.focusManager.focusIndicatorAnimation = false;
          }
          break;
        case 'largeText':
          state.config.largeText = true;
          break;
        default:
          state.config.highContrast = false;
          state.config.reducedMotion = false;
          state.config.largeText = false;
          if (state.config.focusManager) {
            state.config.focusManager.focusIndicatorColor = '#007AFF';
            state.config.focusManager.focusIndicatorWidth = '2px';
            state.config.focusManager.focusIndicatorAnimation = true;
          }
      }
    },

    updateAssistiveTechnology: (
      state,
      action: PayloadAction<Partial<AccessibilityState['assistiveTechnology']>>
    ) => {
      state.assistiveTechnology = {
        ...state.assistiveTechnology,
        ...action.payload,
      };
    },

    addIssue: (state, action: PayloadAction<AccessibilityIssue>) => {
      state.issues.push(action.payload);
      // Re計算分數
      state.score = calculateScore(state.issues, state.suggestions);
    },

    updateIssue: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<AccessibilityIssue>;
      }>
    ) => {
      const { id, updates } = action.payload;
      const _issueIndex = state.issues.findIndex(issue => issue.id === id);
      if (issueIndex !== -1) {
        state.issues[issueIndex] = { ...state.issues[issueIndex], ...updates };
        // Re計算分數
        state.score = calculateScore(state.issues, state.suggestions);
      }
    },

    removeIssue: (state, action: PayloadAction<string>) => {
      state.issues = state.issues.filter(issue => issue.id !== action.payload);
      // Re計算分數
      state.score = calculateScore(state.issues, state.suggestions);
    },

    addSuggestion: (state, action: PayloadAction<AccessibilitySuggestion>) => {
      state.suggestions.push(action.payload);
    },

    updateSuggestion: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<AccessibilitySuggestion>;
      }>
    ) => {
      const { id, updates } = action.payload;
      const _suggestionIndex = state.suggestions.findIndex(
        suggestion => suggestion.id === id
      );
      if (suggestionIndex !== -1) {
        state.suggestions[suggestionIndex] = {
          ...state.suggestions[suggestionIndex],
          ...updates,
        };
      }
    },

    removeSuggestion: (state, action: PayloadAction<string>) => {
      state.suggestions = state.suggestions.filter(
        suggestion => suggestion.id !== action.payload
      );
    },

    setScore: (state, action: PayloadAction<number>) => {
      state.score = Math.max(0, Math.min(100, action.payload));
    },

    clearIssues: state => {
      state.issues = [];
      state.score = calculateScore(state.issues, state.suggestions);
    },

    clearSuggestions: state => {
      state.suggestions = [];
    },

    resetFocusManager: state => {
      state.focusManager = {
        currentFocus: null,
        focusHistory: [],
        isTrapped: false,
        showIndicator: true,
        focusOrder: [],
        restoreElement: null,
      };
    },

    // 焦點Manage相Off
    focusNext: state => {
      const { focusOrder, currentFocus } = state.focusManager;
      if (focusOrder.length === 0) return;

      const _currentIndex = currentFocus
        ? focusOrder.indexOf(currentFocus)
        : -1;
      const _nextIndex =
        currentIndex < focusOrder.length - 1 ? currentIndex + 1 : 0;
      state.focusManager.currentFocus = focusOrder[nextIndex];
    },

    focusPrevious: state => {
      const { focusOrder, currentFocus } = state.focusManager;
      if (focusOrder.length === 0) return;

      const _currentIndex = currentFocus
        ? focusOrder.indexOf(currentFocus)
        : -1;
      const _prevIndex =
        currentIndex > 0 ? currentIndex - 1 : focusOrder.length - 1;
      state.focusManager.currentFocus = focusOrder[prevIndex];
    },

    focusFirst: state => {
      const { focusOrder } = state.focusManager;
      if (focusOrder.length > 0) {
        state.focusManager.currentFocus = focusOrder[0];
      }
    },

    focusLast: state => {
      const { focusOrder } = state.focusManager;
      if (focusOrder.length > 0) {
        state.focusManager.currentFocus = focusOrder[focusOrder.length - 1];
      }
    },

    // Key盤導航相Off
    enableKeyboardNavigation: state => {
      if (state.config.keyboardNavigation) {
        state.config.keyboardNavigation.enabled = true;
      }
    },

    disableKeyboardNavigation: state => {
      if (state.config.keyboardNavigation) {
        state.config.keyboardNavigation.enabled = false;
      }
    },

    setKeyboardNavigationMode: (
      state,
      action: PayloadAction<'linear' | 'grid' | 'tree' | 'custom'>
    ) => {
      if (state.config.keyboardNavigation) {
        state.config.keyboardNavigation.mode = action.payload;
      }
    },

    addKeyboardShortcut: (
      state,
      action: PayloadAction<{ key: string; action: string }>
    ) => {
      const { key, action: actionName } = action.payload;
      if (state.config.keyboardNavigation?.shortcuts) {
        state.config.keyboardNavigation.shortcuts[key] = actionName;
      }
    },

    removeKeyboardShortcut: (state, action: PayloadAction<string>) => {
      if (state.config.keyboardNavigation?.shortcuts) {
        delete state.config.keyboardNavigation.shortcuts[action.payload];
      }
    },

    // 屏幕閱讀器相Off
    enableScreenReader: state => {
      if (state.config.screenReader) {
        state.config.screenReader.enabled = true;
      }
    },

    disableScreenReader: state => {
      if (state.config.screenReader) {
        state.config.screenReader.enabled = false;
      }
    },

    updateVoiceSettings: (
      state,
      action: PayloadAction<
        Partial<NonNullable<AccessibilityState['config']['screenReader']>>
      >
    ) => {
      if (state.config.screenReader) {
        state.config.screenReader = {
          ...state.config.screenReader,
          ...action.payload,
        };
      }
    },

    updateReadingSettings: (
      state,
      action: PayloadAction<
        Partial<NonNullable<AccessibilityState['config']['screenReader']>>
      >
    ) => {
      if (state.config.screenReader) {
        state.config.screenReader = {
          ...state.config.screenReader,
          ...action.payload,
        };
      }
    },

    updateFeedbackSettings: (
      state,
      action: PayloadAction<
        Partial<NonNullable<AccessibilityState['config']['screenReader']>>
      >
    ) => {
      if (state.config.screenReader) {
        state.config.screenReader = {
          ...state.config.screenReader,
          ...action.payload,
        };
      }
    },

    // 焦點指示器相Off
    updateFocusIndicator: (
      state,
      action: PayloadAction<
        Partial<AccessibilityState['config']['focusManager']>
      >
    ) => {
      if (state.config.focusManager) {
        state.config.focusManager = {
          ...state.config.focusManager,
          ...action.payload,
        };
      }
    },

    setFocusIndicatorColor: (state, action: PayloadAction<string>) => {
      if (state.config.focusManager) {
        state.config.focusManager.focusIndicatorColor = action.payload;
      }
    },

    setFocusIndicatorWidth: (state, action: PayloadAction<string>) => {
      if (state.config.focusManager) {
        state.config.focusManager.focusIndicatorWidth = action.payload;
      }
    },

    setFocusIndicatorStyle: (
      state,
      action: PayloadAction<'solid' | 'dashed' | 'dotted'>
    ) => {
      if (state.config.focusManager) {
        state.config.focusManager.focusIndicatorStyle = action.payload;
      }
    },

    setFocusIndicatorAnimation: (state, action: PayloadAction<boolean>) => {
      if (state.config.focusManager) {
        state.config.focusManager.focusIndicatorAnimation = action.payload;
      }
    },

    // EventHandle
    addAccessibilityEvent: (
      state,
      action: PayloadAction<AccessibilityEvent>
    ) => {
      // 這裡可以AddEventLogRecord邏輯
      console.log('Accessibility event:', action.payload);
    },
  },
  extraReducers: builder => {
    builder
      // Initialize可訪問性
      .addCase(initializeAccessibility.pending, state => {
        // 可以Settings加載Status
      })
      .addCase(initializeAccessibility.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      })
      .addCase(initializeAccessibility.rejected, (state, action) => {
        console.error('Failed to initialize accessibility:', action.error);
      })

      // UpdateConfigure
      .addCase(updateAccessibilityConfig.pending, state => {
        // 可以Settings加載Status
      })
      .addCase(updateAccessibilityConfig.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      })
      .addCase(updateAccessibilityConfig.rejected, (state, action) => {
        console.error('Failed to update accessibility config:', action.error);
      })

      // 運RowTest
      .addCase(runAccessibilityTest.pending, state => {
        // 可以SettingsTestStatus
      })
      .addCase(runAccessibilityTest.fulfilled, (state, action) => {
        const _result = action.payload;
        state.issues = result.details.issues;
        state.suggestions = result.details.suggestions;
        state.score = result.details.score;
      })
      .addCase(runAccessibilityTest.rejected, (state, action) => {
        console.error('Failed to run accessibility test:', action.error);
      })

      // 修復問題
      .addCase(fixAccessibilityIssues.pending, state => {
        // 可以Settings修復Status
      })
      .addCase(fixAccessibilityIssues.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      })
      .addCase(fixAccessibilityIssues.rejected, (state, action) => {
        console.error('Failed to fix accessibility issues:', action.error);
      });
  },
});

// 輔助Function
function calculateScore(
  issues: AccessibilityIssue[],
  suggestions: AccessibilitySuggestion[]
): number {
  let score = 100;

  // Root據問題嚴重程度扣分
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        score -= 20;
        break;
      case 'high':
        score -= 10;
        break;
      case 'medium':
        score -= 5;
        break;
      case 'low':
        score -= 2;
        break;
    }
  });

  return Math.max(0, score);
}

// Export Actions
export const {
  setCurrentFocus,
  setFocusTrapped,
  setShowIndicator,
  setFocusOrder,
  setRestoreElement,
  switchMode,
  updateAssistiveTechnology,
  addIssue,
  updateIssue,
  removeIssue,
  addSuggestion,
  updateSuggestion,
  removeSuggestion,
  setScore,
  clearIssues,
  clearSuggestions,
  resetFocusManager,
  focusNext,
  focusPrevious,
  focusFirst,
  focusLast,
  enableKeyboardNavigation,
  disableKeyboardNavigation,
  setKeyboardNavigationMode,
  addKeyboardShortcut,
  removeKeyboardShortcut,
  enableScreenReader,
  disableScreenReader,
  updateVoiceSettings,
  updateReadingSettings,
  updateFeedbackSettings,
  updateFocusIndicator,
  setFocusIndicatorColor,
  setFocusIndicatorWidth,
  setFocusIndicatorStyle,
  setFocusIndicatorAnimation,
  addAccessibilityEvent,
} = accessibilitySlice.actions;

// Export Selectors
export const _selectAccessibilityState = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility;
export const _selectAccessibilityConfig = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.config;
export const _selectFocusManager = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.focusManager;
export const _selectCurrentFocus = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.focusManager.currentFocus;
export const _selectAccessibilityMode = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.mode;
export const _selectAssistiveTechnology = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.assistiveTechnology;
export const _selectAccessibilityScore = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.score;
export const _selectAccessibilityIssues = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.issues;
export const _selectAccessibilitySuggestions = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.suggestions;
export const _selectKeyboardNavigationEnabled = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.config.keyboardNavigation?.enabled || false;
export const _selectScreenReaderEnabled = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.config.screenReader?.enabled || false;
export const _selectHighContrastEnabled = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.config.highContrast;
export const _selectReducedMotionEnabled = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.config.reducedMotion;
export const _selectLargeTextEnabled = (state: {
  accessibility: AccessibilityState;
}) => state.accessibility.config.largeText;

// Export Reducer
export default accessibilitySlice.reducer;
