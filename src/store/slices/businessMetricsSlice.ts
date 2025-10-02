// 業務指標Analysis Redux Slice
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import BusinessMetricsService from '../../features/analytics/services/businessMetricsService';
import type {
  BusinessMetrics,
  BusinessMetricsFilter,
  BusinessMetricsReport,
  BusinessMetricsInsight,
  BusinessMetricsRecommendation,
  BusinessMetricsAlert,
  BusinessMetricsConfig,
  BusinessMetricsExportOptions,
  BusinessMetricsAnalysisResponse,
} from '../../features/analytics/types/businessMetrics';

// Async thunk 動作
export const _initializeBusinessMetrics = createAsyncThunk(
  'businessMetrics/initialize',
  async (config?: Partial<BusinessMetricsConfig>) => {
    const _service = BusinessMetricsService.getInstance();
    const _success = await service.initialize(config);
    if (!success) {
      throw new Error('業務指標分析ServiceInitializeFailed');
    }
    return success;
  }
);

export const _getBusinessMetricsAnalysis = createAsyncThunk(
  'businessMetrics/getAnalysis',
  async (filter?: BusinessMetricsFilter) => {
    const _service = BusinessMetricsService.getInstance();
    return service.getBusinessMetrics(filter);
  }
);

export const _generateBusinessMetricsReport = createAsyncThunk(
  'businessMetrics/generateReport',
  async (filter?: BusinessMetricsFilter) => {
    const _service = BusinessMetricsService.getInstance();
    return service.generateReport(filter);
  }
);

export const _exportBusinessMetricsData = createAsyncThunk(
  'businessMetrics/exportData',
  async ({
    analysis,
    options,
  }: {
    analysis: BusinessMetricsAnalysisResponse;
    options: BusinessMetricsExportOptions;
  }) => {
    const _service = BusinessMetricsService.getInstance();
    return service.exportData(analysis, options);
  }
);

export const _createBusinessMetricsAlert = createAsyncThunk(
  'businessMetrics/createAlert',
  async (
    alert: Omit<BusinessMetricsAlert, 'id' | 'timestamp' | 'acknowledged'>
  ) => {
    const _service = BusinessMetricsService.getInstance();
    return service.createAlert(alert);
  }
);

export const _updateBusinessMetricsAlert = createAsyncThunk(
  'businessMetrics/updateAlert',
  async ({
    alertId,
    updates,
  }: {
    alertId: string;
    updates: Partial<BusinessMetricsAlert>;
  }) => {
    const _service = BusinessMetricsService.getInstance();
    const _updatedAlert = service.updateAlert(alertId, updates);
    if (!updatedAlert) {
      throw new Error('警報不存在');
    }
    return updatedAlert;
  }
);

export const _deleteBusinessMetricsAlert = createAsyncThunk(
  'businessMetrics/deleteAlert',
  async (alertId: string) => {
    const _service = BusinessMetricsService.getInstance();
    const _success = service.deleteAlert(alertId);
    if (!success) {
      throw new Error('警報不存在');
    }
    return alertId;
  }
);

export const _getBusinessMetricsAlert = createAsyncThunk(
  'businessMetrics/getAlert',
  async (alertId: string) => {
    const _service = BusinessMetricsService.getInstance();
    return service.getAlert(alertId);
  }
);

export const _getBusinessMetricsConfig = createAsyncThunk(
  'businessMetrics/getConfig',
  async () => {
    const _service = BusinessMetricsService.getInstance();
    return service.getConfig();
  }
);

export const _updateBusinessMetricsConfig = createAsyncThunk(
  'businessMetrics/updateConfig',
  async (updates: Partial<BusinessMetricsConfig>) => {
    const _service = BusinessMetricsService.getInstance();
    service.updateConfig(updates);
    return service.getConfig();
  }
);

export const _getBusinessMetricsReports = createAsyncThunk(
  'businessMetrics/getReports',
  async () => {
    const _service = BusinessMetricsService.getInstance();
    return service.getReports();
  }
);

export const _getBusinessMetricsInsights = createAsyncThunk(
  'businessMetrics/getInsights',
  async () => {
    const _service = BusinessMetricsService.getInstance();
    return service.getInsights();
  }
);

export const _getBusinessMetricsRecommendations = createAsyncThunk(
  'businessMetrics/getRecommendations',
  async () => {
    const _service = BusinessMetricsService.getInstance();
    return service.getRecommendations();
  }
);

export const _getBusinessMetricsAlerts = createAsyncThunk(
  'businessMetrics/getAlerts',
  async () => {
    const _service = BusinessMetricsService.getInstance();
    return service.getAlerts();
  }
);

export const _getRealTimeBusinessMetrics = createAsyncThunk(
  'businessMetrics/getRealTimeMetrics',
  async () => {
    const _service = BusinessMetricsService.getInstance();
    return service.getRealTimeMetrics();
  }
);

// StatusInterface
interface BusinessMetricsState {
  // ServiceStatus
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Data
  metrics: BusinessMetrics | null;
  analysis: BusinessMetricsAnalysisResponse | null;
  reports: BusinessMetricsReport[];
  insights: BusinessMetricsInsight[];
  recommendations: BusinessMetricsRecommendation[];
  alerts: BusinessMetricsAlert[];
  config: BusinessMetricsConfig | null;

  // 實時Data
  realTimeMetrics: BusinessMetrics | null;
  lastUpdate: number | null;

  // Filter器
  currentFilter: BusinessMetricsFilter | null;

  // ExportStatus
  exportData: string | null;
  isExporting: boolean;
  exportError: string | null;
}

// 初始Status
const initialState: BusinessMetricsState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  metrics: null,
  analysis: null,
  reports: [],
  insights: [],
  recommendations: [],
  alerts: [],
  config: null,
  realTimeMetrics: null,
  lastUpdate: null,
  currentFilter: null,
  exportData: null,
  isExporting: false,
  exportError: null,
};

// Create slice
const _businessMetricsSlice = createSlice({
  name: 'businessMetrics',
  initialState,
  reducers: {
    // ClearError
    clearError: state => {
      state.error = null;
    },

    // ClearExportError
    clearExportError: state => {
      state.exportError = null;
    },

    // SettingsFilter器
    setFilter: (state, action: PayloadAction<BusinessMetricsFilter>) => {
      state.currentFilter = action.payload;
    },

    // ClearFilter器
    clearFilter: state => {
      state.currentFilter = null;
    },

    // Update實時指標
    updateRealTimeMetrics: (state, action: PayloadAction<BusinessMetrics>) => {
      state.realTimeMetrics = action.payload;
      state.lastUpdate = Date.now();
    },

    // AddEvent監聽器
    addEventListener: (
      state,
      action: PayloadAction<{
        eventType: string;
        listener: (data: unknown) => void;
      }>
    ) => {
      const _service = BusinessMetricsService.getInstance();
      service.addEventListener(
        action.payload.eventType as any,
        action.payload.listener
      );
    },

    // RemoveEvent監聽器
    removeEventListener: (
      state,
      action: PayloadAction<{
        eventType: string;
        listener: (data: unknown) => void;
      }>
    ) => {
      const _service = BusinessMetricsService.getInstance();
      service.removeEventListener(
        action.payload.eventType as any,
        action.payload.listener
      );
    },
  },
  extraReducers: builder => {
    // Initialize
    builder
      .addCase(initializeBusinessMetrics.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeBusinessMetrics.fulfilled, state => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(initializeBusinessMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'InitializeFailed';
      });

    // Get業務指標Analysis
    builder
      .addCase(getBusinessMetricsAnalysis.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessMetricsAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analysis = action.payload;
        state.metrics = action.payload.metrics;
        state.insights = action.payload.insights;
        state.recommendations = action.payload.recommendations;
        state.alerts = action.payload.alerts;
      })
      .addCase(getBusinessMetricsAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Get業務指標分析Failed';
      });

    // 生成Report
    builder
      .addCase(generateBusinessMetricsReport.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateBusinessMetricsReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.push(action.payload);
      })
      .addCase(generateBusinessMetricsReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '生成報告Failed';
      });

    // ExportData
    builder
      .addCase(exportBusinessMetricsData.pending, state => {
        state.isExporting = true;
        state.exportError = null;
      })
      .addCase(exportBusinessMetricsData.fulfilled, (state, action) => {
        state.isExporting = false;
        state.exportData = action.payload;
      })
      .addCase(exportBusinessMetricsData.rejected, (state, action) => {
        state.isExporting = false;
        state.exportError = action.error.message || '導出Failed';
      });

    // CreateAlert
    builder.addCase(createBusinessMetricsAlert.fulfilled, (state, action) => {
      state.alerts.push(action.payload);
    });

    // UpdateAlert
    builder.addCase(updateBusinessMetricsAlert.fulfilled, (state, action) => {
      const _index = state.alerts.findIndex(
        alert => alert.id === action.payload.id
      );
      if (index !== -1) {
        state.alerts[index] = action.payload;
      }
    });

    // DeleteAlert
    builder.addCase(deleteBusinessMetricsAlert.fulfilled, (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    });

    // GetAlert
    builder.addCase(getBusinessMetricsAlert.fulfilled, (state, action) => {
      if (action.payload) {
        const _index = state.alerts.findIndex(
          alert => alert.id === action.payload.id
        );
        if (index !== -1) {
          state.alerts[index] = action.payload;
        } else {
          state.alerts.push(action.payload);
        }
      }
    });

    // GetConfigure
    builder.addCase(getBusinessMetricsConfig.fulfilled, (state, action) => {
      state.config = action.payload;
    });

    // UpdateConfigure
    builder.addCase(updateBusinessMetricsConfig.fulfilled, (state, action) => {
      state.config = action.payload;
    });

    // GetReport
    builder.addCase(getBusinessMetricsReports.fulfilled, (state, action) => {
      state.reports = action.payload;
    });

    // Get洞察
    builder.addCase(getBusinessMetricsInsights.fulfilled, (state, action) => {
      state.insights = action.payload;
    });

    // Get建議
    builder.addCase(
      getBusinessMetricsRecommendations.fulfilled,
      (state, action) => {
        state.recommendations = action.payload;
      }
    );

    // GetAlert
    builder.addCase(getBusinessMetricsAlerts.fulfilled, (state, action) => {
      state.alerts = action.payload;
    });

    // Get實時指標
    builder.addCase(getRealTimeBusinessMetrics.fulfilled, (state, action) => {
      state.realTimeMetrics = action.payload;
      state.lastUpdate = Date.now();
    });
  },
});

// Export actions
export const {
  clearError,
  clearExportError,
  setFilter,
  clearFilter,
  updateRealTimeMetrics,
  addEventListener,
  removeEventListener,
} = businessMetricsSlice.actions;

// Export reducer
export default businessMetricsSlice.reducer;

// Select器
export const _selectBusinessMetricsState = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics;

export const _selectIsInitialized = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.isInitialized;
export const _selectIsLoading = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.isLoading;
export const _selectError = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.error;

export const _selectMetrics = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.metrics;
export const _selectAnalysis = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.analysis;
export const _selectReports = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.reports;
export const _selectInsights = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.insights;
export const _selectRecommendations = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.recommendations;
export const _selectAlerts = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.alerts;
export const _selectConfig = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.config;

export const _selectRealTimeMetrics = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.realTimeMetrics;
export const _selectLastUpdate = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.lastUpdate;

export const _selectCurrentFilter = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.currentFilter;

export const _selectExportData = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.exportData;
export const _selectIsExporting = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.isExporting;
export const _selectExportError = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.exportError;
