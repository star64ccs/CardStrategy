// 業務指標分析 Redux Slice
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

// 異步 thunk 動作
export const initializeBusinessMetrics = createAsyncThunk(
  'businessMetrics/initialize',
  async (config?: Partial<BusinessMetricsConfig>) => {
    const service = BusinessMetricsService.getInstance();
    const success = await service.initialize(config);
    if (!success) {
      throw new Error('業務指標分析服務初始化失敗');
    }
    return success;
  }
);

export const getBusinessMetricsAnalysis = createAsyncThunk(
  'businessMetrics/getAnalysis',
  async (filter?: BusinessMetricsFilter) => {
    const service = BusinessMetricsService.getInstance();
    return service.getBusinessMetrics(filter);
  }
);

export const generateBusinessMetricsReport = createAsyncThunk(
  'businessMetrics/generateReport',
  async (filter?: BusinessMetricsFilter) => {
    const service = BusinessMetricsService.getInstance();
    return service.generateReport(filter);
  }
);

export const exportBusinessMetricsData = createAsyncThunk(
  'businessMetrics/exportData',
  async ({
    analysis,
    options,
  }: {
    analysis: BusinessMetricsAnalysisResponse;
    options: BusinessMetricsExportOptions;
  }) => {
    const service = BusinessMetricsService.getInstance();
    return service.exportData(analysis, options);
  }
);

export const createBusinessMetricsAlert = createAsyncThunk(
  'businessMetrics/createAlert',
  async (
    alert: Omit<BusinessMetricsAlert, 'id' | 'timestamp' | 'acknowledged'>
  ) => {
    const service = BusinessMetricsService.getInstance();
    return service.createAlert(alert);
  }
);

export const updateBusinessMetricsAlert = createAsyncThunk(
  'businessMetrics/updateAlert',
  async ({
    alertId,
    updates,
  }: {
    alertId: string;
    updates: Partial<BusinessMetricsAlert>;
  }) => {
    const service = BusinessMetricsService.getInstance();
    const updatedAlert = service.updateAlert(alertId, updates);
    if (!updatedAlert) {
      throw new Error('警報不存在');
    }
    return updatedAlert;
  }
);

export const deleteBusinessMetricsAlert = createAsyncThunk(
  'businessMetrics/deleteAlert',
  async (alertId: string) => {
    const service = BusinessMetricsService.getInstance();
    const success = service.deleteAlert(alertId);
    if (!success) {
      throw new Error('警報不存在');
    }
    return alertId;
  }
);

export const getBusinessMetricsAlert = createAsyncThunk(
  'businessMetrics/getAlert',
  async (alertId: string) => {
    const service = BusinessMetricsService.getInstance();
    return service.getAlert(alertId);
  }
);

export const getBusinessMetricsConfig = createAsyncThunk(
  'businessMetrics/getConfig',
  async () => {
    const service = BusinessMetricsService.getInstance();
    return service.getConfig();
  }
);

export const updateBusinessMetricsConfig = createAsyncThunk(
  'businessMetrics/updateConfig',
  async (updates: Partial<BusinessMetricsConfig>) => {
    const service = BusinessMetricsService.getInstance();
    service.updateConfig(updates);
    return service.getConfig();
  }
);

export const getBusinessMetricsReports = createAsyncThunk(
  'businessMetrics/getReports',
  async () => {
    const service = BusinessMetricsService.getInstance();
    return service.getReports();
  }
);

export const getBusinessMetricsInsights = createAsyncThunk(
  'businessMetrics/getInsights',
  async () => {
    const service = BusinessMetricsService.getInstance();
    return service.getInsights();
  }
);

export const getBusinessMetricsRecommendations = createAsyncThunk(
  'businessMetrics/getRecommendations',
  async () => {
    const service = BusinessMetricsService.getInstance();
    return service.getRecommendations();
  }
);

export const getBusinessMetricsAlerts = createAsyncThunk(
  'businessMetrics/getAlerts',
  async () => {
    const service = BusinessMetricsService.getInstance();
    return service.getAlerts();
  }
);

export const getRealTimeBusinessMetrics = createAsyncThunk(
  'businessMetrics/getRealTimeMetrics',
  async () => {
    const service = BusinessMetricsService.getInstance();
    return service.getRealTimeMetrics();
  }
);

// 狀態接口
interface BusinessMetricsState {
  // 服務狀態
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // 數據
  metrics: BusinessMetrics | null;
  analysis: BusinessMetricsAnalysisResponse | null;
  reports: BusinessMetricsReport[];
  insights: BusinessMetricsInsight[];
  recommendations: BusinessMetricsRecommendation[];
  alerts: BusinessMetricsAlert[];
  config: BusinessMetricsConfig | null;

  // 實時數據
  realTimeMetrics: BusinessMetrics | null;
  lastUpdate: number | null;

  // 過濾器
  currentFilter: BusinessMetricsFilter | null;

  // 導出狀態
  exportData: string | null;
  isExporting: boolean;
  exportError: string | null;
}

// 初始狀態
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

// 創建 slice
const businessMetricsSlice = createSlice({
  name: 'businessMetrics',
  initialState,
  reducers: {
    // 清除錯誤
    clearError: state => {
      state.error = null;
    },

    // 清除導出錯誤
    clearExportError: state => {
      state.exportError = null;
    },

    // 設置過濾器
    setFilter: (state, action: PayloadAction<BusinessMetricsFilter>) => {
      state.currentFilter = action.payload;
    },

    // 清除過濾器
    clearFilter: state => {
      state.currentFilter = null;
    },

    // 更新實時指標
    updateRealTimeMetrics: (state, action: PayloadAction<BusinessMetrics>) => {
      state.realTimeMetrics = action.payload;
      state.lastUpdate = Date.now();
    },

    // 添加事件監聽器
    addEventListener: (
      state,
      action: PayloadAction<{
        eventType: string;
        listener: (data: unknown) => void;
      }>
    ) => {
      const service = BusinessMetricsService.getInstance();
      service.addEventListener(
        action.payload.eventType as any,
        action.payload.listener
      );
    },

    // 移除事件監聽器
    removeEventListener: (
      state,
      action: PayloadAction<{
        eventType: string;
        listener: (data: unknown) => void;
      }>
    ) => {
      const service = BusinessMetricsService.getInstance();
      service.removeEventListener(
        action.payload.eventType as any,
        action.payload.listener
      );
    },
  },
  extraReducers: builder => {
    // 初始化
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
        state.error = action.error.message || '初始化失敗';
      });

    // 獲取業務指標分析
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
        state.error = action.error.message || '獲取業務指標分析失敗';
      });

    // 生成報告
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
        state.error = action.error.message || '生成報告失敗';
      });

    // 導出數據
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
        state.exportError = action.error.message || '導出失敗';
      });

    // 創建警報
    builder.addCase(createBusinessMetricsAlert.fulfilled, (state, action) => {
      state.alerts.push(action.payload);
    });

    // 更新警報
    builder.addCase(updateBusinessMetricsAlert.fulfilled, (state, action) => {
      const index = state.alerts.findIndex(
        alert => alert.id === action.payload.id
      );
      if (index !== -1) {
        state.alerts[index] = action.payload;
      }
    });

    // 刪除警報
    builder.addCase(deleteBusinessMetricsAlert.fulfilled, (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    });

    // 獲取警報
    builder.addCase(getBusinessMetricsAlert.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.alerts.findIndex(
          alert => alert.id === action.payload.id
        );
        if (index !== -1) {
          state.alerts[index] = action.payload;
        } else {
          state.alerts.push(action.payload);
        }
      }
    });

    // 獲取配置
    builder.addCase(getBusinessMetricsConfig.fulfilled, (state, action) => {
      state.config = action.payload;
    });

    // 更新配置
    builder.addCase(updateBusinessMetricsConfig.fulfilled, (state, action) => {
      state.config = action.payload;
    });

    // 獲取報告
    builder.addCase(getBusinessMetricsReports.fulfilled, (state, action) => {
      state.reports = action.payload;
    });

    // 獲取洞察
    builder.addCase(getBusinessMetricsInsights.fulfilled, (state, action) => {
      state.insights = action.payload;
    });

    // 獲取建議
    builder.addCase(
      getBusinessMetricsRecommendations.fulfilled,
      (state, action) => {
        state.recommendations = action.payload;
      }
    );

    // 獲取警報
    builder.addCase(getBusinessMetricsAlerts.fulfilled, (state, action) => {
      state.alerts = action.payload;
    });

    // 獲取實時指標
    builder.addCase(getRealTimeBusinessMetrics.fulfilled, (state, action) => {
      state.realTimeMetrics = action.payload;
      state.lastUpdate = Date.now();
    });
  },
});

// 導出 actions
export const {
  clearError,
  clearExportError,
  setFilter,
  clearFilter,
  updateRealTimeMetrics,
  addEventListener,
  removeEventListener,
} = businessMetricsSlice.actions;

// 導出 reducer
export default businessMetricsSlice.reducer;

// 選擇器
export const selectBusinessMetricsState = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics;

export const selectIsInitialized = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.isInitialized;
export const selectIsLoading = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.isLoading;
export const selectError = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.error;

export const selectMetrics = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.metrics;
export const selectAnalysis = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.analysis;
export const selectReports = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.reports;
export const selectInsights = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.insights;
export const selectRecommendations = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.recommendations;
export const selectAlerts = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.alerts;
export const selectConfig = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.config;

export const selectRealTimeMetrics = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.realTimeMetrics;
export const selectLastUpdate = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.lastUpdate;

export const selectCurrentFilter = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.currentFilter;

export const selectExportData = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.exportData;
export const selectIsExporting = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.isExporting;
export const selectExportError = (state: {
  businessMetrics: BusinessMetricsState;
}) => state.businessMetrics.exportError;
