// User體驗Monitor Redux slice
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import UXMonitoringService from '../../services/uxMonitoringService';
import type {
  ABTestAssignment,
  ErrorEvent,
  PerformanceMetric,
  SatisfactionSurvey,
  UXAnalytics,
  UXMonitoringConfig,
  UserAction,
  UserSession,
} from '../../types/uxMonitoring';

// Async thunks
export const _initializeUXMonitoring = createAsyncThunk(
  'uxMonitoring/initialize',
  async (config?: Partial<UXMonitoringConfig>) => {
    const _service = UXMonitoringService.getInstance();
    await service.initialize(config);
    return service.getStatus();
  }
);

export const _trackAction = createAsyncThunk(
  'uxMonitoring/trackAction',
  async (action: Omit<UserAction, 'id' | 'timestamp' | 'sessionId'>) => {
    const _service = UXMonitoringService.getInstance();
    service.trackAction(action);
    return service.getStatus();
  }
);

export const _trackPerformance = createAsyncThunk(
  'uxMonitoring/trackPerformance',
  async (metric: Omit<PerformanceMetric, 'id' | 'timestamp' | 'sessionId'>) => {
    const _service = UXMonitoringService.getInstance();
    service.trackPerformance(metric);
    return service.getStatus();
  }
);

export const _trackError = createAsyncThunk(
  'uxMonitoring/trackError',
  async (error: Error, context?: unknown) => {
    const _service = UXMonitoringService.getInstance();
    service.trackError(error, context);
    return service.getStatus();
  }
);

export const _submitSatisfaction = createAsyncThunk(
  'uxMonitoring/submitSatisfaction',
  async (
    survey: Omit<SatisfactionSurvey, 'id' | 'timestamp' | 'sessionId'>
  ) => {
    const _service = UXMonitoringService.getInstance();
    service.submitSatisfaction(survey);
    return service.getStatus();
  }
);

export const _getABTestVariant = createAsyncThunk(
  'uxMonitoring/getABTestVariant',
  async (testId: string) => {
    const _service = UXMonitoringService.getInstance();
    const _variant = service.getABTestVariant(testId);
    return { testId, variant };
  }
);

export const _trackConversion = createAsyncThunk(
  'uxMonitoring/trackConversion',
  async ({
    testId,
    goalId,
    value,
  }: {
    testId: string;
    goalId: string;
    value?: number;
  }) => {
    const _service = UXMonitoringService.getInstance();
    service.trackConversion(testId, goalId, value);
    return service.getStatus();
  }
);

export const _getAnalytics = createAsyncThunk(
  'uxMonitoring/getAnalytics',
  async () => {
    const _service = UXMonitoringService.getInstance();
    return service.getAnalytics();
  }
);

export const _updateConfig = createAsyncThunk(
  'uxMonitoring/updateConfig',
  async (config: Partial<UXMonitoringConfig>) => {
    const _service = UXMonitoringService.getInstance();
    service.updateConfig(config);
    return service.getConfig();
  }
);

export const _clearData = createAsyncThunk(
  'uxMonitoring/clearData',
  async () => {
    const _service = UXMonitoringService.getInstance();
    service.clearData();
    return service.getStatus();
  }
);

export const _exportData = createAsyncThunk(
  'uxMonitoring/exportData',
  async () => {
    const _service = UXMonitoringService.getInstance();
    return service.exportData();
  }
);

// 初始Status
interface UXMonitoringState {
  isInitialized: boolean;
  isEnabled: boolean;
  config: UXMonitoringConfig | null;
  currentSession: UserSession | null;
  analytics: UXAnalytics | null;
  status: {
    sessionCount: number;
    actionCount: number;
    errorCount: number;
    performanceMetricCount: number;
    satisfactionSurveyCount: number;
    abTestCount: number;
  };
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: UXMonitoringState = {
  isInitialized: false,
  isEnabled: false,
  config: null,
  currentSession: null,
  analytics: null,
  status: {
    sessionCount: 0,
    actionCount: 0,
    errorCount: 0,
    performanceMetricCount: 0,
    satisfactionSurveyCount: 0,
    abTestCount: 0,
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

// Slice
const _uxMonitoringSlice = createSlice({
  name: 'uxMonitoring',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateSession: (state, action: PayloadAction<UserSession>) => {
      state.currentSession = action.payload;
    },
    addAction: (state, action: PayloadAction<UserAction>) => {
      if (state.currentSession) {
        state.currentSession.actions.push(action.payload);
        state.status.actionCount++;
      }
    },
    addPerformanceMetric: (state, action: PayloadAction<PerformanceMetric>) => {
      state.status.performanceMetricCount++;
    },
    addError: (state, action: PayloadAction<ErrorEvent>) => {
      state.status.errorCount++;
    },
    addSatisfactionSurvey: (
      state,
      action: PayloadAction<SatisfactionSurvey>
    ) => {
      state.status.satisfactionSurveyCount++;
    },
    addABTestAssignment: (state, action: PayloadAction<ABTestAssignment>) => {
      state.status.abTestCount++;
    },
    updateAnalytics: (state, action: PayloadAction<UXAnalytics>) => {
      state.analytics = action.payload;
      state.lastUpdated = Date.now();
    },
    reset: state => {
      return initialState;
    },
  },
  extraReducers: builder => {
    // initializeUXMonitoring
    builder
      .addCase(initializeUXMonitoring.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeUXMonitoring.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = action.payload.isInitialized;
        state.isEnabled = action.payload.isEnabled;
        state.status = {
          sessionCount: action.payload.sessionCount,
          actionCount: action.payload.actionCount,
          errorCount: action.payload.errorCount,
          performanceMetricCount: action.payload.performanceMetricCount,
          satisfactionSurveyCount: action.payload.satisfactionSurveyCount,
          abTestCount: action.payload.abTestCount,
        };
        state.currentSession = action.payload.currentSession;
      })
      .addCase(initializeUXMonitoring.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'InitializeFailed';
      });

    // trackAction
    builder.addCase(trackAction.fulfilled, (state, action) => {
      state.status = {
        sessionCount: action.payload.sessionCount,
        actionCount: action.payload.actionCount,
        errorCount: action.payload.errorCount,
        performanceMetricCount: action.payload.performanceMetricCount,
        satisfactionSurveyCount: action.payload.satisfactionSurveyCount,
        abTestCount: action.payload.abTestCount,
      };
      state.currentSession = action.payload.currentSession;
    });

    // trackPerformance
    builder.addCase(trackPerformance.fulfilled, (state, action) => {
      state.status = {
        sessionCount: action.payload.sessionCount,
        actionCount: action.payload.actionCount,
        errorCount: action.payload.errorCount,
        performanceMetricCount: action.payload.performanceMetricCount,
        satisfactionSurveyCount: action.payload.satisfactionSurveyCount,
        abTestCount: action.payload.abTestCount,
      };
      state.currentSession = action.payload.currentSession;
    });

    // trackError
    builder.addCase(trackError.fulfilled, (state, action) => {
      state.status = {
        sessionCount: action.payload.sessionCount,
        actionCount: action.payload.actionCount,
        errorCount: action.payload.errorCount,
        performanceMetricCount: action.payload.performanceMetricCount,
        satisfactionSurveyCount: action.payload.satisfactionSurveyCount,
        abTestCount: action.payload.abTestCount,
      };
      state.currentSession = action.payload.currentSession;
    });

    // submitSatisfaction
    builder.addCase(submitSatisfaction.fulfilled, (state, action) => {
      state.status = {
        sessionCount: action.payload.sessionCount,
        actionCount: action.payload.actionCount,
        errorCount: action.payload.errorCount,
        performanceMetricCount: action.payload.performanceMetricCount,
        satisfactionSurveyCount: action.payload.satisfactionSurveyCount,
        abTestCount: action.payload.abTestCount,
      };
      state.currentSession = action.payload.currentSession;
    });

    // getAnalytics
    builder
      .addCase(getAnalytics.pending, state => {
        state.loading = true;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Get分析數據Failed';
      });

    // updateConfig
    builder.addCase(updateConfig.fulfilled, (state, action) => {
      state.config = action.payload;
    });

    // clearData
    builder.addCase(clearData.fulfilled, (state, action) => {
      state.status = {
        sessionCount: action.payload.sessionCount,
        actionCount: action.payload.actionCount,
        errorCount: action.payload.errorCount,
        performanceMetricCount: action.payload.performanceMetricCount,
        satisfactionSurveyCount: action.payload.satisfactionSurveyCount,
        abTestCount: action.payload.abTestCount,
      };
      state.currentSession = action.payload.currentSession;
      state.analytics = null;
    });
  },
});

// Actions
export const {
  setLoading,
  setError,
  updateSession,
  addAction,
  addPerformanceMetric,
  addError,
  addSatisfactionSurvey,
  addABTestAssignment,
  updateAnalytics,
  reset,
} = uxMonitoringSlice.actions;

// Selectors
export const _selectUXMonitoringState = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring;

export const _selectIsInitialized = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.isInitialized;
export const _selectIsEnabled = (state: { uxMonitoring: UXMonitoringState }) =>
  state.uxMonitoring.isEnabled;
export const _selectConfig = (state: { uxMonitoring: UXMonitoringState }) =>
  state.uxMonitoring.config;
export const _selectCurrentSession = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.currentSession;
export const _selectAnalytics = (state: { uxMonitoring: UXMonitoringState }) =>
  state.uxMonitoring.analytics;
export const _selectStatus = (state: { uxMonitoring: UXMonitoringState }) =>
  state.uxMonitoring.status;
export const _selectLoading = (state: { uxMonitoring: UXMonitoringState }) =>
  state.uxMonitoring.loading;
export const _selectError = (state: { uxMonitoring: UXMonitoringState }) =>
  state.uxMonitoring.error;
export const _selectLastUpdated = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.lastUpdated;

// 複合Select器
export const _selectSessionAnalytics = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.analytics?.sessionAnalytics;

export const _selectPerformanceAnalytics = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.analytics?.performanceAnalytics;

export const _selectErrorAnalytics = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.analytics?.errorAnalytics;

export const _selectSatisfactionAnalytics = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.analytics?.satisfactionAnalytics;

export const _selectABTestAnalytics = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.analytics?.abTestAnalytics;

export const _selectUserJourneyAnalytics = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.analytics?.userJourneyAnalytics;

export const _selectTotalSessions = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.status.sessionCount;

export const _selectTotalActions = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.status.actionCount;

export const _selectTotalErrors = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.status.errorCount;

export const _selectTotalPerformanceMetrics = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.status.performanceMetricCount;

export const _selectTotalSatisfactionSurveys = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.status.satisfactionSurveyCount;

export const _selectTotalABTests = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.status.abTestCount;

// 計算Select器
export const _selectAverageSessionDuration = (state: {
  uxMonitoring: UXMonitoringState;
}) => {
  const _analytics = state.uxMonitoring.analytics?.sessionAnalytics;
  return analytics ? analytics.averageSessionDuration : 0;
};

export const _selectBounceRate = (state: {
  uxMonitoring: UXMonitoringState;
}) => {
  const _analytics = state.uxMonitoring.analytics?.sessionAnalytics;
  return analytics ? analytics.bounceRate : 0;
};

export const _selectAveragePageLoadTime = (state: {
  uxMonitoring: UXMonitoringState;
}) => {
  const _analytics = state.uxMonitoring.analytics?.performanceAnalytics;
  return analytics ? analytics.averagePageLoadTime : 0;
};

export const _selectErrorRate = (state: {
  uxMonitoring: UXMonitoringState;
}) => {
  const _analytics = state.uxMonitoring.analytics?.errorAnalytics;
  return analytics ? analytics.errorRate : 0;
};

export const _selectAverageSatisfaction = (state: {
  uxMonitoring: UXMonitoringState;
}) => {
  const _analytics = state.uxMonitoring.analytics?.satisfactionAnalytics;
  return analytics ? analytics.averageSatisfaction : 0;
};

export const _selectNetPromoterScore = (state: {
  uxMonitoring: UXMonitoringState;
}) => {
  const _analytics = state.uxMonitoring.analytics?.satisfactionAnalytics;
  return analytics ? analytics.netPromoterScore : 0;
};

export const _selectActiveTests = (state: {
  uxMonitoring: UXMonitoringState;
}) => {
  const _analytics = state.uxMonitoring.analytics?.abTestAnalytics;
  return analytics ? analytics.activeTests : 0;
};

export const _selectCompletedTests = (state: {
  uxMonitoring: UXMonitoringState;
}) => {
  const _analytics = state.uxMonitoring.analytics?.abTestAnalytics;
  return analytics ? analytics.completedTests : 0;
};

// StatusCheckSelect器
export const _selectIsMonitoringActive = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.isInitialized && state.uxMonitoring.isEnabled;

export const _selectHasData = (state: { uxMonitoring: UXMonitoringState }) =>
  state.uxMonitoring.status.sessionCount > 0 ||
  state.uxMonitoring.status.actionCount > 0 ||
  state.uxMonitoring.status.errorCount > 0;

export const _selectHasAnalytics = (state: {
  uxMonitoring: UXMonitoringState;
}) => state.uxMonitoring.analytics !== null;

export const _selectIsDataStale = (state: {
  uxMonitoring: UXMonitoringState;
}) => {
  const { lastUpdated } = state.uxMonitoring;
  if (!lastUpdated) return true;

  const _staleThreshold = 5 * 60 * 1000; // 5Minute
  return Date.now() - lastUpdated > staleThreshold;
};

// Reducer
export default uxMonitoringSlice.reducer;
