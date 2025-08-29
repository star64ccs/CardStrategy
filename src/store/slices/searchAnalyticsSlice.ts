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

// 異步 Thunk
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

// 狀態接口
interface SearchAnalyticsState {
  // 服務狀態
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // 分析數據
  analytics: SearchAnalytics | null;
  currentFilter: SearchAnalyticsFilter | null;

  // 報告
  reports: SearchAnalyticsReport[];
  currentReport: SearchAnalyticsReport | null;
  reportGenerationLoading: boolean;

  // 配置
  config: SearchAnalyticsConfig;

  // 警報
  alerts: SearchAnalyticsAlert[];
  alertLoading: boolean;

  // 事件
  recentEvents: SearchAnalyticsEvent[];
  eventCount: number;

  // 導出
  exportLoading: boolean;
  exportData: string | null;

  // 實時數據
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

// 初始狀態
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
    // 重置狀態
    resetState: state => {
      state.isInitialized = false;
      state.analytics = null;
      state.error = null;
    },

    // 設置過濾器
    setFilter: (state, action: PayloadAction<SearchAnalyticsFilter>) => {
      state.currentFilter = action.payload;
    },

    // 清除過濾器
    clearFilter: state => {
      state.currentFilter = null;
    },

    // 更新配置
    updateConfig: (
      state,
      action: PayloadAction<Partial<SearchAnalyticsConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    // 添加事件
    addEvent: (state, action: PayloadAction<SearchAnalyticsEvent>) => {
      state.recentEvents.unshift(action.payload);
      state.eventCount++;

      // 限制事件數量
      if (state.recentEvents.length > 100) {
        state.recentEvents = state.recentEvents.slice(0, 100);
      }
    },

    // 更新實時指標
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

    // 設置洞察
    setInsights: (state, action: PayloadAction<SearchInsight[]>) => {
      state.insights = action.payload;
    },

    // 設置建議
    setRecommendations: (
      state,
      action: PayloadAction<SearchRecommendation[]>
    ) => {
      state.recommendations = action.payload;
    },

    // 清除錯誤
    clearError: state => {
      state.error = null;
    },

    // 設置當前報告
    setCurrentReport: (
      state,
      action: PayloadAction<SearchAnalyticsReport | null>
    ) => {
      state.currentReport = action.payload;
    },

    // 添加報告
    addReport: (state, action: PayloadAction<SearchAnalyticsReport>) => {
      state.reports.unshift(action.payload);

      // 限制報告數量
      if (state.reports.length > 50) {
        state.reports = state.reports.slice(0, 50);
      }
    },

    // 刪除報告
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
    // 初始化
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
        state.error = action.error.message || '初始化失敗';
      });

    // 獲取分析數據
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
        state.error = action.error.message || '獲取分析數據失敗';
      });

    // 生成報告
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
        state.error = action.error.message || '生成報告失敗';
      });

    // 導出數據
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
        state.error = action.error.message || '導出數據失敗';
      });

    // 創建警報
    builder
      .addCase(createAlert.pending, state => {
        state.alertLoading = true;
        state.error = null;
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.alertLoading = false;
        // 警報 ID 會在服務中生成，這裡需要重新獲取警報列表
      })
      .addCase(createAlert.rejected, (state, action) => {
        state.alertLoading = false;
        state.error = action.error.message || '創建警報失敗';
      });

    // 更新警報
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
        state.error = action.error.message || '更新警報失敗';
      });

    // 刪除警報
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
        state.error = action.error.message || '刪除警報失敗';
      });
  },
});

// 導出 actions
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

// 導出 selectors
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

// 導出 reducer
export default searchAnalyticsSlice.reducer;
