import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { SearchAnalyticsService } from '../../features/search/services/searchAnalyticsService';
import type {
  SearchAnalytics,
  SearchAnalyticsConfig,
  SearchAnalyticsEvent,
  SearchAnalyticsReport,
  SearchAnalyticsFilter,
  SearchAnalyticsExportOptions,
  SearchAnalyticsAlert,
  SearchInsight,
  SearchRecommendation,
} from '../../features/search/types/searchAnalytics';

// Async Thunk
export const _initializeSearchAnalytics = createAsyncThunk(
  'searchAnalytics/initialize',
  async () => {
    const _service = SearchAnalyticsService.getInstance();
    return service.initialize();
  }
);

export const _fetchAnalytics = createAsyncThunk(
  'searchAnalytics/fetchAnalytics',
  async (filter?: SearchAnalyticsFilter) => {
    const _service = SearchAnalyticsService.getInstance();
    return service.getAnalytics(filter);
  }
);

export const _generateReport = createAsyncThunk(
  'searchAnalytics/generateReport',
  async (params: {
    title: string;
    description: string;
    period: { start: number; end: number };
    filter?: SearchAnalyticsFilter;
  }) => {
    const _service = SearchAnalyticsService.getInstance();
    return service.generateReport(
      params.title,
      params.description,
      params.period,
      params.filter
    );
  }
);

export const _exportData = createAsyncThunk(
  'searchAnalytics/exportData',
  async (params: {
    analytics: SearchAnalytics;
    options: SearchAnalyticsExportOptions;
  }) => {
    const _service = SearchAnalyticsService.getInstance();
    return service.exportData(params.analytics, params.options);
  }
);

export const _createAlert = createAsyncThunk(
  'searchAnalytics/createAlert',
  async (alert: Omit<SearchAnalyticsAlert, 'id' | 'triggerCount'>) => {
    const _service = SearchAnalyticsService.getInstance();
    return service.createAlert(alert);
  }
);

export const _updateAlert = createAsyncThunk(
  'searchAnalytics/updateAlert',
  async (params: {
    alertId: string;
    updates: Partial<SearchAnalyticsAlert>;
  }) => {
    const _service = SearchAnalyticsService.getInstance();
    await service.updateAlert(params.alertId, params.updates);
    return { alertId: params.alertId, updates: params.updates };
  }
);

export const _deleteAlert = createAsyncThunk(
  'searchAnalytics/deleteAlert',
  async (alertId: string) => {
    const _service = SearchAnalyticsService.getInstance();
    await service.deleteAlert(alertId);
    return alertId;
  }
);

// StatusInterface
interface SearchAnalyticsState {
  // ServiceStatus
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // AnalysisData
  analytics: SearchAnalytics | null;
  currentFilter: SearchAnalyticsFilter | null;

  // Report
  reports: SearchAnalyticsReport[];
  currentReport: SearchAnalyticsReport | null;
  reportGenerationLoading: boolean;

  // Configure
  config: SearchAnalyticsConfig;

  // Alert
  alerts: SearchAnalyticsAlert[];
  alertLoading: boolean;

  // Event
  recentEvents: SearchAnalyticsEvent[];
  eventCount: number;

  // Export
  exportLoading: boolean;
  exportData: string | null;

  // 實時Data
  realTimeMetrics: {
    currentSearches: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };

  // 洞察和建議
  insights: SearchInsight[];
  recommendations: SearchRecommendation[];
}

// 初始Status
const initialState: SearchAnalyticsState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  analytics: null,
  currentFilter: null,
  reports: [],
  currentReport: null,
  reportGenerationLoading: false,
  config: {
    enabled: true,
    trackingInterval: 60000,
    dataRetentionDays: 90,
    privacyMode: false,
    anonymizeData: false,
    exportFormat: 'json',
    realTimeTracking: true,
    batchProcessing: false,
  },
  alerts: [],
  alertLoading: false,
  recentEvents: [],
  eventCount: 0,
  exportLoading: false,
  exportData: null,
  realTimeMetrics: {
    currentSearches: 0,
    averageResponseTime: 0,
    errorRate: 0,
    throughput: 0,
  },
  insights: [],
  recommendations: [],
};

// Slice
const _searchAnalyticsSlice = createSlice({
  name: 'searchAnalytics',
  initialState,
  reducers: {
    // ResetStatus
    resetState: state => {
      state.isInitialized = false;
      state.analytics = null;
      state.error = null;
    },

    // SettingsFilter器
    setFilter: (state, action: PayloadAction<SearchAnalyticsFilter>) => {
      state.currentFilter = action.payload;
    },

    // ClearFilter器
    clearFilter: state => {
      state.currentFilter = null;
    },

    // UpdateConfigure
    updateConfig: (
      state,
      action: PayloadAction<Partial<SearchAnalyticsConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    // AddEvent
    addEvent: (state, action: PayloadAction<SearchAnalyticsEvent>) => {
      state.recentEvents.unshift(action.payload);
      state.eventCount++;

      // LimitEvent數量
      if (state.recentEvents.length > 100) {
        state.recentEvents = state.recentEvents.slice(0, 100);
      }
    },

    // Update實時指標
    updateRealTimeMetrics: (
      state,
      action: PayloadAction<{
        currentSearches: number;
        averageResponseTime: number;
        errorRate: number;
        throughput: number;
      }>
    ) => {
      state.realTimeMetrics = action.payload;
    },

    // Settings洞察
    setInsights: (state, action: PayloadAction<SearchInsight[]>) => {
      state.insights = action.payload;
    },

    // Settings建議
    setRecommendations: (
      state,
      action: PayloadAction<SearchRecommendation[]>
    ) => {
      state.recommendations = action.payload;
    },

    // ClearError
    clearError: state => {
      state.error = null;
    },

    // Settings當前Report
    setCurrentReport: (
      state,
      action: PayloadAction<SearchAnalyticsReport | null>
    ) => {
      state.currentReport = action.payload;
    },

    // AddReport
    addReport: (state, action: PayloadAction<SearchAnalyticsReport>) => {
      state.reports.unshift(action.payload);

      // LimitReport數量
      if (state.reports.length > 50) {
        state.reports = state.reports.slice(0, 50);
      }
    },

    // DeleteReport
    deleteReport: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(
        report => report.id !== action.payload
      );
      if (state.currentReport?.id === action.payload) {
        state.currentReport = null;
      }
    },
  },
  extraReducers: builder => {
    // Initialize
    builder
      .addCase(initializeSearchAnalytics.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeSearchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = action.payload;
      })
      .addCase(initializeSearchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'InitializeFailed';
      });

    // GetAnalysisData
    builder
      .addCase(fetchAnalytics.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Get分析數據Failed';
      });

    // 生成Report
    builder
      .addCase(generateReport.pending, state => {
        state.reportGenerationLoading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.reportGenerationLoading = false;
        state.currentReport = action.payload;
        state.reports.unshift(action.payload);
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.reportGenerationLoading = false;
        state.error = action.error.message || '生成報告Failed';
      });

    // ExportData
    builder
      .addCase(exportData.pending, state => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportData.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.exportData = action.payload;
      })
      .addCase(exportData.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.error.message || '導出數據Failed';
      });

    // CreateAlert
    builder
      .addCase(createAlert.pending, state => {
        state.alertLoading = true;
        state.error = null;
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.alertLoading = false;
        // Alert ID 會在Service中生成，這裡需要ReGetAlertList
      })
      .addCase(createAlert.rejected, (state, action) => {
        state.alertLoading = false;
        state.error = action.error.message || 'Create警報Failed';
      });

    // UpdateAlert
    builder
      .addCase(updateAlert.pending, state => {
        state.alertLoading = true;
        state.error = null;
      })
      .addCase(updateAlert.fulfilled, (state, action) => {
        state.alertLoading = false;
        const { alertId, updates } = action.payload;
        const _index = state.alerts.findIndex(alert => alert.id === alertId);
        if (index !== -1) {
          state.alerts[index] = { ...state.alerts[index], ...updates };
        }
      })
      .addCase(updateAlert.rejected, (state, action) => {
        state.alertLoading = false;
        state.error = action.error.message || 'Update警報Failed';
      });

    // DeleteAlert
    builder
      .addCase(deleteAlert.pending, state => {
        state.alertLoading = true;
        state.error = null;
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.alertLoading = false;
        state.alerts = state.alerts.filter(
          alert => alert.id !== action.payload
        );
      })
      .addCase(deleteAlert.rejected, (state, action) => {
        state.alertLoading = false;
        state.error = action.error.message || 'Delete警報Failed';
      });
  },
});

// Export actions
export const {
  resetState,
  setFilter,
  clearFilter,
  updateConfig,
  addEvent,
  updateRealTimeMetrics,
  setInsights,
  setRecommendations,
  clearError,
  setCurrentReport,
  addReport,
  deleteReport,
} = searchAnalyticsSlice.actions;

// Export selectors
export const _selectSearchAnalytics = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics;

export const _selectAnalytics = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.analytics;

export const _selectIsInitialized = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.isInitialized;

export const _selectIsLoading = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.isLoading;

export const _selectError = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.error;

export const _selectConfig = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.config;

export const _selectAlerts = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.alerts;

export const _selectRecentEvents = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.recentEvents;

export const _selectRealTimeMetrics = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.realTimeMetrics;

export const _selectInsights = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.insights;

export const _selectRecommendations = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.recommendations;

export const _selectCurrentReport = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.currentReport;

export const _selectReports = (state: {
  searchAnalytics: SearchAnalyticsState;
}) => state.searchAnalytics.reports;

// Export reducer
export default searchAnalyticsSlice.reducer;
