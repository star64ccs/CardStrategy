import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import DashboardService from '../../features/analytics/services/dashboardService';
import type {
  DashboardConfig,
  DashboardWidget,
  DashboardLayout,
  DashboardData,
  DashboardExport,
  DashboardAlert,
  DashboardCreateRequest,
  DashboardUpdateRequest,
  DashboardFilterOptions,
  DashboardAnalytics,
  DashboardTemplate,
  AlertCondition,
  AlertAction,
  DashboardTheme,
  PerformanceMetrics,
} from '../../features/analytics/types/dashboard';

// 異步 thunk actions
export const _initializeDashboard = createAsyncThunk(
  'dashboard/initialize',
  async () => {
    const _service = DashboardService.getInstance();
    await service.initialize();
    return { timestamp: new Date() };
  }
);

export const _getDashboard = createAsyncThunk(
  'dashboard/getDashboard',
  async (dashboardId: string) => {
    const _service = DashboardService.getInstance();
    return service.getDashboard(dashboardId);
  }
);

export const _getDashboards = createAsyncThunk(
  'dashboard/getDashboards',
  async (filter?: DashboardFilterOptions) => {
    const _service = DashboardService.getInstance();
    return service.getDashboards(filter);
  }
);

export const _createDashboard = createAsyncThunk(
  'dashboard/createDashboard',
  async (request: DashboardCreateRequest) => {
    const _service = DashboardService.getInstance();
    return service.createDashboard(request);
  }
);

export const _updateDashboard = createAsyncThunk(
  'dashboard/updateDashboard',
  async ({
    dashboardId,
    request,
  }: {
    dashboardId: string;
    request: DashboardUpdateRequest;
  }) => {
    const _service = DashboardService.getInstance();
    return service.updateDashboard(dashboardId, request);
  }
);

export const _deleteDashboard = createAsyncThunk(
  'dashboard/deleteDashboard',
  async (dashboardId: string) => {
    const _service = DashboardService.getInstance();
    await service.deleteDashboard(dashboardId);
    return dashboardId;
  }
);

export const _getDashboardData = createAsyncThunk(
  'dashboard/getDashboardData',
  async ({
    dashboardId,
    widgetId,
  }: {
    dashboardId: string;
    widgetId?: string;
  }) => {
    const _service = DashboardService.getInstance();
    return service.getDashboardData(dashboardId, widgetId);
  }
);

export const _refreshDashboardData = createAsyncThunk(
  'dashboard/refreshDashboardData',
  async (dashboardId: string) => {
    const _service = DashboardService.getInstance();
    await service.refreshDashboardData(dashboardId);
    return { dashboardId, timestamp: new Date() };
  }
);

export const _exportDashboard = createAsyncThunk(
  'dashboard/exportDashboard',
  async ({
    dashboardId,
    format,
  }: {
    dashboardId: string;
    format: 'pdf' | 'png' | 'jpg' | 'svg' | 'html';
  }) => {
    const _service = DashboardService.getInstance();
    return service.exportDashboard(dashboardId, format);
  }
);

export const _createAlert = createAsyncThunk(
  'dashboard/createAlert',
  async ({
    dashboardId,
    condition,
    action,
  }: {
    dashboardId: string;
    condition: AlertCondition;
    action: AlertAction;
  }) => {
    const _service = DashboardService.getInstance();
    return service.createAlert(dashboardId, condition, action);
  }
);

export const _updateAlert = createAsyncThunk(
  'dashboard/updateAlert',
  async ({
    alertId,
    updates,
  }: {
    alertId: string;
    updates: Partial<DashboardAlert>;
  }) => {
    const _service = DashboardService.getInstance();
    return service.updateAlert(alertId, updates);
  }
);

export const _deleteAlert = createAsyncThunk(
  'dashboard/deleteAlert',
  async (alertId: string) => {
    const _service = DashboardService.getInstance();
    await service.deleteAlert(alertId);
    return alertId;
  }
);

export const _getAlerts = createAsyncThunk(
  'dashboard/getAlerts',
  async (dashboardId?: string) => {
    const _service = DashboardService.getInstance();
    return service.getAlerts(dashboardId);
  }
);

export const _getTemplates = createAsyncThunk(
  'dashboard/getTemplates',
  async (category?: string) => {
    const _service = DashboardService.getInstance();
    return service.getTemplates(category);
  }
);

export const _getAnalytics = createAsyncThunk(
  'dashboard/getAnalytics',
  async (dashboardId: string) => {
    const _service = DashboardService.getInstance();
    return service.getAnalytics(dashboardId);
  }
);

export const _updateAnalytics = createAsyncThunk(
  'dashboard/updateAnalytics',
  async ({
    dashboardId,
    updates,
  }: {
    dashboardId: string;
    updates: Partial<DashboardAnalytics>;
  }) => {
    const _service = DashboardService.getInstance();
    return service.updateAnalytics(dashboardId, updates);
  }
);

export const _getPerformanceMetrics = createAsyncThunk(
  'dashboard/getPerformanceMetrics',
  async (dashboardId: string) => {
    const _service = DashboardService.getInstance();
    return service.getPerformanceMetrics(dashboardId);
  }
);

export const _getConfig = createAsyncThunk('dashboard/getConfig', async () => {
  const _service = DashboardService.getInstance();
  return service.getConfig();
});

export const _updateConfig = createAsyncThunk(
  'dashboard/updateConfig',
  async (config: unknown) => {
    const _service = DashboardService.getInstance();
    await service.updateConfig(config);
    return config;
  }
);

// 狀態接口
interface DashboardState {
  // 初始化狀態
  isInitialized: boolean;
  initializationError: string | null;

  // 儀表板列表
  dashboards: DashboardConfig[];
  currentDashboard: DashboardConfig | null;
  dashboardsLoading: boolean;
  dashboardsError: string | null;

  // 儀表板數據
  dashboardData: Map<string, DashboardData[]>;
  dataLoading: boolean;
  dataError: string | null;

  // 導出
  exports: DashboardExport[];
  exportLoading: boolean;
  exportError: string | null;

  // 警報
  alerts: DashboardAlert[];
  alertsLoading: boolean;
  alertsError: string | null;

  // 模板
  templates: DashboardTemplate[];
  templatesLoading: boolean;
  templatesError: string | null;

  // 分析
  analytics: Map<string, DashboardAnalytics>;
  analyticsLoading: boolean;
  analyticsError: string | null;

  // 性能指標
  performanceMetrics: Map<string, PerformanceMetrics>;
  performanceLoading: boolean;
  performanceError: string | null;

  // 配置
  config: unknown;
  configLoading: boolean;
  configError: string | null;

  // UI 狀態
  selectedWidget: DashboardWidget | null;
  editingLayout: DashboardLayout | null;
  previewMode: boolean;
  fullscreenMode: boolean;
}

// 初始狀態
const initialState: DashboardState = {
  isInitialized: false,
  initializationError: null,
  dashboards: [],
  currentDashboard: null,
  dashboardsLoading: false,
  dashboardsError: null,
  dashboardData: new Map(),
  dataLoading: false,
  dataError: null,
  exports: [],
  exportLoading: false,
  exportError: null,
  alerts: [],
  alertsLoading: false,
  alertsError: null,
  templates: [],
  templatesLoading: false,
  templatesError: null,
  analytics: new Map(),
  analyticsLoading: false,
  analyticsError: null,
  performanceMetrics: new Map(),
  performanceLoading: false,
  performanceError: null,
  config: null,
  configLoading: false,
  configError: null,
  selectedWidget: null,
  editingLayout: null,
  previewMode: false,
  fullscreenMode: false,
};

// 創建 slice
const _dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // 同步 actions
    setCurrentDashboard: (
      state,
      action: PayloadAction<DashboardConfig | null>
    ) => {
      state.currentDashboard = action.payload;
    },

    setSelectedWidget: (
      state,
      action: PayloadAction<DashboardWidget | null>
    ) => {
      state.selectedWidget = action.payload;
    },

    setEditingLayout: (
      state,
      action: PayloadAction<DashboardLayout | null>
    ) => {
      state.editingLayout = action.payload;
    },

    setPreviewMode: (state, action: PayloadAction<boolean>) => {
      state.previewMode = action.payload;
    },

    setFullscreenMode: (state, action: PayloadAction<boolean>) => {
      state.fullscreenMode = action.payload;
    },

    updateWidget: (
      state,
      action: PayloadAction<{
        dashboardId: string;
        widgetId: string;
        updates: Partial<DashboardWidget>;
      }>
    ) => {
      const { dashboardId, widgetId, updates } = action.payload;
      const _dashboard = state.dashboards.find(d => d.id === dashboardId);
      if (dashboard) {
        for (const layout of dashboard.layouts) {
          const _widget = layout.widgets.find(w => w.id === widgetId);
          if (widget) {
            Object.assign(widget, updates);
            break;
          }
        }
      }
    },

    addWidget: (
      state,
      action: PayloadAction<{ dashboardId: string; widget: DashboardWidget }>
    ) => {
      const { dashboardId, widget } = action.payload;
      const _dashboard = state.dashboards.find(d => d.id === dashboardId);
      if (dashboard && dashboard.layouts.length > 0) {
        dashboard.layouts[0].widgets.push(widget);
      }
    },

    removeWidget: (
      state,
      action: PayloadAction<{ dashboardId: string; widgetId: string }>
    ) => {
      const { dashboardId, widgetId } = action.payload;
      const _dashboard = state.dashboards.find(d => d.id === dashboardId);
      if (dashboard) {
        for (const layout of dashboard.layouts) {
          layout.widgets = layout.widgets.filter(w => w.id !== widgetId);
        }
      }
    },

    updateTheme: (
      state,
      action: PayloadAction<{
        dashboardId: string;
        theme: Partial<DashboardTheme>;
      }>
    ) => {
      const { dashboardId, theme } = action.payload;
      const _dashboard = state.dashboards.find(d => d.id === dashboardId);
      if (dashboard) {
        Object.assign(dashboard.theme, theme);
      }
    },

    clearErrors: state => {
      state.initializationError = null;
      state.dashboardsError = null;
      state.dataError = null;
      state.exportError = null;
      state.alertsError = null;
      state.templatesError = null;
      state.analyticsError = null;
      state.performanceError = null;
      state.configError = null;
    },
  },
  extraReducers: builder => {
    builder
      // 初始化
      .addCase(initializeDashboard.pending, state => {
        state.initializationError = null;
      })
      .addCase(initializeDashboard.fulfilled, state => {
        state.isInitialized = true;
      })
      .addCase(initializeDashboard.rejected, (state, action) => {
        state.initializationError = action.error.message || '初始化失敗';
      })

      // 獲取儀表板
      .addCase(getDashboard.pending, state => {
        state.dashboardsLoading = true;
        state.dashboardsError = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.dashboardsLoading = false;
        if (action.payload) {
          const _existingIndex = state.dashboards.findIndex(
            d => d.id === action.payload.id
          );
          if (existingIndex >= 0) {
            state.dashboards[existingIndex] = action.payload;
          } else {
            state.dashboards.push(action.payload);
          }
        }
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.dashboardsLoading = false;
        state.dashboardsError = action.error.message || '獲取儀表板失敗';
      })

      // 獲取儀表板列表
      .addCase(getDashboards.pending, state => {
        state.dashboardsLoading = true;
        state.dashboardsError = null;
      })
      .addCase(getDashboards.fulfilled, (state, action) => {
        state.dashboardsLoading = false;
        if (action.payload.data) {
          state.dashboards = action.payload.data;
        }
      })
      .addCase(getDashboards.rejected, (state, action) => {
        state.dashboardsLoading = false;
        state.dashboardsError = action.error.message || '獲取儀表板列表失敗';
      })

      // 創建儀表板
      .addCase(createDashboard.fulfilled, (state, action) => {
        state.dashboards.push(action.payload);
      })

      // 更新儀表板
      .addCase(updateDashboard.fulfilled, (state, action) => {
        const _index = state.dashboards.findIndex(
          d => d.id === action.payload.id
        );
        if (index >= 0) {
          state.dashboards[index] = action.payload;
        }
        if (state.currentDashboard?.id === action.payload.id) {
          state.currentDashboard = action.payload;
        }
      })

      // 刪除儀表板
      .addCase(deleteDashboard.fulfilled, (state, action) => {
        state.dashboards = state.dashboards.filter(
          d => d.id !== action.payload
        );
        if (state.currentDashboard?.id === action.payload) {
          state.currentDashboard = null;
        }
      })

      // 獲取儀表板數據
      .addCase(getDashboardData.pending, state => {
        state.dataLoading = true;
        state.dataError = null;
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.dataLoading = false;
        // 這裡需要根據實際情況更新 dashboardData
      })
      .addCase(getDashboardData.rejected, (state, action) => {
        state.dataLoading = false;
        state.dataError = action.error.message || '獲取數據失敗';
      })

      // 刷新數據
      .addCase(refreshDashboardData.fulfilled, (state, action) => {
        // 數據刷新完成
      })

      // 導出儀表板
      .addCase(exportDashboard.pending, state => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportDashboard.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.exports.push(action.payload);
      })
      .addCase(exportDashboard.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.error.message || '導出失敗';
      })

      // 創建警報
      .addCase(createAlert.fulfilled, (state, action) => {
        state.alerts.push(action.payload);
      })

      // 更新警報
      .addCase(updateAlert.fulfilled, (state, action) => {
        const _index = state.alerts.findIndex(a => a.id === action.payload.id);
        if (index >= 0) {
          state.alerts[index] = action.payload;
        }
      })

      // 刪除警報
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.alerts = state.alerts.filter(a => a.id !== action.payload);
      })

      // 獲取警報
      .addCase(getAlerts.pending, state => {
        state.alertsLoading = true;
        state.alertsError = null;
      })
      .addCase(getAlerts.fulfilled, (state, action) => {
        state.alertsLoading = false;
        state.alerts = action.payload;
      })
      .addCase(getAlerts.rejected, (state, action) => {
        state.alertsLoading = false;
        state.alertsError = action.error.message || '獲取警報失敗';
      })

      // 獲取模板
      .addCase(getTemplates.pending, state => {
        state.templatesLoading = true;
        state.templatesError = null;
      })
      .addCase(getTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = action.payload;
      })
      .addCase(getTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.templatesError = action.error.message || '獲取模板失敗';
      })

      // 獲取分析
      .addCase(getAnalytics.pending, state => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        if (action.payload) {
          state.analytics.set(action.payload.dashboardId, action.payload);
        }
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.error.message || '獲取分析失敗';
      })

      // 更新分析
      .addCase(updateAnalytics.fulfilled, (state, action) => {
        state.analytics.set(action.payload.dashboardId, action.payload);
      })

      // 獲取性能指標
      .addCase(getPerformanceMetrics.pending, state => {
        state.performanceLoading = true;
        state.performanceError = null;
      })
      .addCase(getPerformanceMetrics.fulfilled, (state, action) => {
        state.performanceLoading = false;
        if (action.payload) {
          // 需要根據實際情況更新 performanceMetrics
        }
      })
      .addCase(getPerformanceMetrics.rejected, (state, action) => {
        state.performanceLoading = false;
        state.performanceError = action.error.message || '獲取性能指標失敗';
      })

      // 獲取配置
      .addCase(getConfig.pending, state => {
        state.configLoading = true;
        state.configError = null;
      })
      .addCase(getConfig.fulfilled, (state, action) => {
        state.configLoading = false;
        state.config = action.payload;
      })
      .addCase(getConfig.rejected, (state, action) => {
        state.configLoading = false;
        state.configError = action.error.message || '獲取配置失敗';
      })

      // 更新配置
      .addCase(updateConfig.fulfilled, (state, action) => {
        state.config = { ...state.config, ...action.payload };
      });
  },
});

// 導出 actions
export const {
  setCurrentDashboard,
  setSelectedWidget,
  setEditingLayout,
  setPreviewMode,
  setFullscreenMode,
  updateWidget,
  addWidget,
  removeWidget,
  updateTheme,
  clearErrors,
} = dashboardSlice.actions;

// 導出 selectors
export const _selectDashboardState = (state: { dashboard: DashboardState }) =>
  state.dashboard;
export const _selectIsInitialized = (state: { dashboard: DashboardState }) =>
  state.dashboard.isInitialized;
export const _selectDashboards = (state: { dashboard: DashboardState }) =>
  state.dashboard.dashboards;
export const _selectCurrentDashboard = (state: { dashboard: DashboardState }) =>
  state.dashboard.currentDashboard;
export const _selectDashboardsLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.dashboardsLoading;
export const _selectDashboardsError = (state: { dashboard: DashboardState }) =>
  state.dashboard.dashboardsError;
export const _selectDashboardData = (state: { dashboard: DashboardState }) =>
  state.dashboard.dashboardData;
export const _selectDataLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.dataLoading;
export const _selectDataError = (state: { dashboard: DashboardState }) =>
  state.dashboard.dataError;
export const _selectExports = (state: { dashboard: DashboardState }) =>
  state.dashboard.exports;
export const _selectExportLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.exportLoading;
export const _selectExportError = (state: { dashboard: DashboardState }) =>
  state.dashboard.exportError;
export const _selectAlerts = (state: { dashboard: DashboardState }) =>
  state.dashboard.alerts;
export const _selectAlertsLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.alertsLoading;
export const _selectAlertsError = (state: { dashboard: DashboardState }) =>
  state.dashboard.alertsError;
export const _selectTemplates = (state: { dashboard: DashboardState }) =>
  state.dashboard.templates;
export const _selectTemplatesLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.templatesLoading;
export const _selectTemplatesError = (state: { dashboard: DashboardState }) =>
  state.dashboard.templatesError;
export const _selectAnalytics = (state: { dashboard: DashboardState }) =>
  state.dashboard.analytics;
export const _selectAnalyticsLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.analyticsLoading;
export const _selectAnalyticsError = (state: { dashboard: DashboardState }) =>
  state.dashboard.analyticsError;
export const _selectPerformanceMetrics = (state: {
  dashboard: DashboardState;
}) => state.dashboard.performanceMetrics;
export const _selectPerformanceLoading = (state: {
  dashboard: DashboardState;
}) => state.dashboard.performanceLoading;
export const _selectPerformanceError = (state: { dashboard: DashboardState }) =>
  state.dashboard.performanceError;
export const _selectConfig = (state: { dashboard: DashboardState }) =>
  state.dashboard.config;
export const _selectConfigLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.configLoading;
export const _selectConfigError = (state: { dashboard: DashboardState }) =>
  state.dashboard.configError;
export const _selectSelectedWidget = (state: { dashboard: DashboardState }) =>
  state.dashboard.selectedWidget;
export const _selectEditingLayout = (state: { dashboard: DashboardState }) =>
  state.dashboard.editingLayout;
export const _selectPreviewMode = (state: { dashboard: DashboardState }) =>
  state.dashboard.previewMode;
export const _selectFullscreenMode = (state: { dashboard: DashboardState }) =>
  state.dashboard.fullscreenMode;

export default dashboardSlice.reducer;
