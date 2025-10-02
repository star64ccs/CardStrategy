// GraphTable Redux Slice
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import ChartService from '../../features/analytics/services/chartService';
import type {
  ChartAnalytics,
  ChartConfig,
  ChartCreateRequest,
  ChartData,
  ChartFilterOptions,
  ChartInstance,
  ChartStatistics,
  ChartTemplate,
  ChartUpdateRequest,
} from '../../features/analytics/types/chart';

// GraphTableStatusInterface
interface ChartState {
  charts: ChartInstance[];
  currentChart: ChartInstance | null;
  templates: ChartTemplate[];
  analytics: Map<string, ChartAnalytics>;
  statistics: ChartStatistics | null;
  loading: boolean;
  error: string | null;
  selectedChartId: string | null;
  filterOptions: ChartFilterOptions;
  exportLoading: boolean;
  exportError: string | null;
}

// 初始Status
const initialState: ChartState = {
  charts: [],
  currentChart: null,
  templates: [],
  analytics: new Map(),
  statistics: null,
  loading: false,
  error: null,
  selectedChartId: null,
  filterOptions: {},
  exportLoading: false,
  exportError: null,
};

// Async Thunk Actions

// InitializeGraphTableService
export const _initializeChartService = createAsyncThunk(
  'chart/initializeService',
  async () => {
    const _chartService = ChartService.getInstance();
    await chartService.initialize();
    return chartService.getConfig();
  }
);

// CreateGraphTable
export const _createChart = createAsyncThunk(
  'chart/createChart',
  async (request: ChartCreateRequest) => {
    const _chartService = ChartService.getInstance();
    const _response = await chartService.createChart(request);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.chart;
  }
);

// GetGraphTable
export const _getChart = createAsyncThunk(
  'chart/getChart',
  async (chartId: string) => {
    const _chartService = ChartService.getInstance();
    const _response = await chartService.getChart(chartId);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.chart;
  }
);

// GetGraphTableList
export const _getCharts = createAsyncThunk(
  'chart/getCharts',
  async (options: ChartFilterOptions = {}) => {
    const _chartService = ChartService.getInstance();
    const _response = await chartService.getCharts(options);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response;
  }
);

// UpdateGraphTable
export const _updateChart = createAsyncThunk(
  'chart/updateChart',
  async ({
    chartId,
    request,
  }: {
    chartId: string;
    request: ChartUpdateRequest;
  }) => {
    const _chartService = ChartService.getInstance();
    const _response = await chartService.updateChart(chartId, request);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.chart;
  }
);

// DeleteGraphTable
export const _deleteChart = createAsyncThunk(
  'chart/deleteChart',
  async (chartId: string) => {
    const _chartService = ChartService.getInstance();
    const _response = await chartService.deleteChart(chartId);
    if (!response.success) {
      throw new Error(response.error);
    }
    return chartId;
  }
);

// ExportGraphTable
export const _exportChart = createAsyncThunk(
  'chart/exportChart',
  async ({
    chartId,
    format,
  }: {
    chartId: string;
    format: 'png' | 'jpg' | 'svg' | 'pdf';
  }) => {
    const _chartService = ChartService.getInstance();
    const _response = await chartService.exportChart(chartId, format);
    if (!response.success) {
      throw new Error(response.error);
    }
    return { chartId, format, message: response.message };
  }
);

// Get模板
export const _getTemplates = createAsyncThunk(
  'chart/getTemplates',
  async () => {
    const _chartService = ChartService.getInstance();
    return chartService.getTemplates();
  }
);

// GetAnalysisData
export const _getAnalytics = createAsyncThunk(
  'chart/getAnalytics',
  async (chartId: string) => {
    const _chartService = ChartService.getInstance();
    const _analytics = await chartService.getAnalytics(chartId);
    return { chartId, analytics };
  }
);

// Get統Count據
export const _getStatistics = createAsyncThunk(
  'chart/getStatistics',
  async () => {
    const _chartService = ChartService.getInstance();
    return chartService.getStatistics();
  }
);

// GraphTable Slice
const _chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    // Settings當前GraphTable
    setCurrentChart: (state, action: PayloadAction<ChartInstance | null>) => {
      state.currentChart = action.payload as any;
      state.selectedChartId = action.payload?.id || null;
    },

    // Settings選中的GraphTableID
    setSelectedChartId: (state, action: PayloadAction<string | null>) => {
      state.selectedChartId = action.payload;
      if (action.payload) {
        const _chart = state.charts.find(c => c.id === action.payload);
        state.currentChart = chart || null;
      } else {
        state.currentChart = null;
      }
    },

    // UpdateGraphTableConfigure
    updateChartConfig: (
      state,
      action: PayloadAction<{ chartId: string; config: Partial<ChartConfig> }>
    ) => {
      const { chartId, config } = action.payload;
      const _chart = state.charts.find(c => c.id === chartId);
      if (chart) {
        chart.config = { ...chart.config, ...config };
        chart.lastUpdate = new Date();
      }
      if (state.currentChart?.id === chartId) {
        state.currentChart = {
          ...state.currentChart,
          config: { ...state.currentChart.config, ...config },
        };
      }
    },

    // UpdateGraphTableData
    updateChartData: (
      state,
      action: PayloadAction<{ chartId: string; data: ChartData }>
    ) => {
      const { chartId, data } = action.payload;
      const _chart = state.charts.find(c => c.id === chartId);
      if (chart) {
        chart.data = data;
        chart.lastUpdate = new Date();
      }
      if (state.currentChart?.id === chartId) {
        state.currentChart = { ...state.currentChart, data };
      }
    },

    // AddGraphTable
    addChart: (state, action: PayloadAction<ChartInstance>) => {
      state.charts.push(action.payload as any);
    },

    // RemoveGraphTable
    removeChart: (state, action: PayloadAction<string>) => {
      state.charts = state.charts.filter(chart => chart.id !== action.payload);
      if (state.currentChart?.id === action.payload) {
        state.currentChart = null;
        state.selectedChartId = null;
      }
    },

    // SettingsFilterOptions
    setFilterOptions: (state, action: PayloadAction<ChartFilterOptions>) => {
      state.filterOptions = action.payload;
    },

    // ClearError
    clearError: state => {
      state.error = null;
      state.exportError = null;
    },

    // SettingsGraphTableStatus
    setChartStatus: (
      state,
      action: PayloadAction<{
        chartId: string;
        status: 'idle' | 'loading' | 'rendered' | 'error';
        error?: string;
      }>
    ) => {
      const { chartId, status, error } = action.payload;
      const _chart = state.charts.find(c => c.id === chartId);
      if (chart) {
        chart.status = status;
        if (error) {
          chart.error = error;
        }
      }
      if (state.currentChart?.id === chartId) {
        state.currentChart = { ...state.currentChart, status, error };
      }
    },

    // UpdateAnalysisData
    updateAnalyticsData: (
      state,
      action: PayloadAction<{ chartId: string; analytics: ChartAnalytics }>
    ) => {
      const { chartId, analytics } = action.payload;
      state.analytics.set(chartId, analytics);
    },

    // Settings模板
    setTemplates: (state, action: PayloadAction<ChartTemplate[]>) => {
      state.templates = action.payload;
    },

    // Settings統Count據
    setStatistics: (state, action: PayloadAction<ChartStatistics>) => {
      state.statistics = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // InitializeService
      .addCase(initializeChartService.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeChartService.fulfilled, state => {
        state.loading = false;
      })
      .addCase(initializeChartService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'InitializeFailed';
      })

      // CreateGraphTable
      .addCase(createChart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChart.fulfilled, (state, action) => {
        state.loading = false;
        state.charts.push(action.payload as any);
        state.currentChart = action.payload as any;
        state.selectedChartId = action.payload.id;
      })
      .addCase(createChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Create圖表Failed';
      })

      // GetGraphTable
      .addCase(getChart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChart.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChart = action.payload as any;
        state.selectedChartId = action.payload.id;

        // Update或AddGraphTable到List
        const _existingIndex = state.charts.findIndex(
          c => c.id === action.payload.id
        );
        if (existingIndex >= 0) {
          state.charts[existingIndex] = action.payload as any;
        } else {
          state.charts.push(action.payload as any);
        }
      })
      .addCase(getChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Get圖表Failed';
      })

      // GetGraphTableList
      .addCase(getCharts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCharts.fulfilled, (state, action) => {
        state.loading = false;
        state.charts = action.payload.charts as any;
      })
      .addCase(getCharts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Get圖表列表Failed';
      })

      // UpdateGraphTable
      .addCase(updateChart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChart.fulfilled, (state, action) => {
        state.loading = false;
        const _updatedChart = action.payload;

        // UpdateGraphTableList
        const _existingIndex = state.charts.findIndex(
          c => c.id === updatedChart.id
        );
        if (existingIndex >= 0) {
          state.charts[existingIndex] = updatedChart as any;
        }

        // Update當前GraphTable
        if (state.currentChart?.id === updatedChart.id) {
          state.currentChart = updatedChart as any;
        }
      })
      .addCase(updateChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Update圖表Failed';
      })

      // DeleteGraphTable
      .addCase(deleteChart.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChart.fulfilled, (state, action) => {
        state.loading = false;
        const _deletedChartId = action.payload;

        // 從List中Remove
        state.charts = state.charts.filter(
          chart => chart.id !== deletedChartId
        );

        // Clear當前GraphTable
        if (state.currentChart?.id === deletedChartId) {
          state.currentChart = null;
          state.selectedChartId = null;
        }

        // ClearAnalysisData
        state.analytics.delete(deletedChartId);
      })
      .addCase(deleteChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Delete圖表Failed';
      })

      // ExportGraphTable
      .addCase(exportChart.pending, state => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportChart.fulfilled, state => {
        state.exportLoading = false;
      })
      .addCase(exportChart.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.error.message || '導出圖表Failed';
      })

      // Get模板
      .addCase(getTemplates.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(getTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Get模板Failed';
      })

      // GetAnalysisData
      .addCase(getAnalytics.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        const { chartId, analytics } = action.payload;
        if (analytics) {
          state.analytics.set(chartId, analytics);
        }
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Get分析數據Failed';
      })

      // Get統Count據
      .addCase(getStatistics.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(getStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Get統計數據Failed';
      });
  },
});

// Export actions
export const {
  setCurrentChart,
  setSelectedChartId,
  updateChartConfig,
  updateChartData,
  addChart,
  removeChart,
  setFilterOptions,
  clearError,
  setChartStatus,
  updateAnalyticsData,
  setTemplates,
  setStatistics,
} = chartSlice.actions;

// Export selectors
export const _selectCharts = (state: { chart: ChartState }) =>
  state.chart.charts;
export const _selectCurrentChart = (state: { chart: ChartState }) =>
  state.chart.currentChart;
export const _selectSelectedChartId = (state: { chart: ChartState }) =>
  state.chart.selectedChartId;
export const _selectTemplates = (state: { chart: ChartState }) =>
  state.chart.templates;
export const _selectAnalytics = (state: { chart: ChartState }) =>
  state.chart.analytics;
export const _selectStatistics = (state: { chart: ChartState }) =>
  state.chart.statistics;
export const _selectChartLoading = (state: { chart: ChartState }) =>
  state.chart.loading;
export const _selectChartError = (state: { chart: ChartState }) =>
  state.chart.error;
export const _selectFilterOptions = (state: { chart: ChartState }) =>
  state.chart.filterOptions;
export const _selectExportLoading = (state: { chart: ChartState }) =>
  state.chart.exportLoading;
export const _selectExportError = (state: { chart: ChartState }) =>
  state.chart.exportError;

// Export reducer
export default chartSlice.reducer;
