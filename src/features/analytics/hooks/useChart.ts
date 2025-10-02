// GraphTable Hook
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  addChart,
  clearError,
  createChart,
  deleteChart,
  exportChart,
  getAnalytics,
  getChart,
  getCharts,
  getStatistics,
  getTemplates,
  // Actions
  initializeChartService,
  removeChart,
  selectAnalytics,
  selectChartError,
  selectChartLoading,
  // Selectors
  selectCharts,
  selectCurrentChart,
  selectExportError,
  selectExportLoading,
  selectFilterOptions,
  selectSelectedChartId,
  selectStatistics,
  selectTemplates,
  setChartStatus,
  setFilterOptions,
  setSelectedChartId,
  setStatistics,
  setTemplates,
  updateChart,
  updateChartConfig,
  updateChartData,
  updateAnalyticsData,
} from '../../../store/slices/chartSlice';
import type {
  ChartAnalytics,
  ChartConfig,
  ChartCreateRequest,
  ChartData,
  ChartFilterOptions,
  ChartInstance,
  ChartTemplate,
  ChartUpdateRequest,
} from '../types/chart';

// GraphTable Hook Interface
interface UseChartReturn {
  // Status
  charts: ChartInstance[];
  currentChart: ChartInstance | null;
  selectedChartId: string | null;
  templates: ChartTemplate[];
  analytics: Map<string, ChartAnalytics>;
  statistics: unknown;
  loading: boolean;
  error: string | null;
  filterOptions: ChartFilterOptions;
  exportLoading: boolean;
  exportError: string | null;

  // 計算Property
  chartCount: number;
  currentAnalytics: ChartAnalytics | null;
  hasCharts: boolean;
  isLoading: boolean;
  hasError: boolean;

  // OperationMethod
  initialize: () => Promise<void>;
  createNewChart: (
    request: ChartCreateRequest
  ) => Promise<ChartInstance | null>;
  fetchChart: (chartId: string) => Promise<ChartInstance | null>;
  fetchCharts: (options?: ChartFilterOptions) => Promise<void>;
  updateChartDataAsync: (
    chartId: string,
    request: ChartUpdateRequest
  ) => Promise<ChartInstance | null>;
  removeChartById: (chartId: string) => Promise<boolean>;
  exportChartAs: (
    chartId: string,
    format: 'png' | 'jpg' | 'svg' | 'pdf'
  ) => Promise<boolean>;
  fetchTemplates: () => Promise<ChartTemplate[]>;
  fetchAnalytics: (chartId: string) => Promise<ChartAnalytics | null>;
  fetchStatistics: () => Promise<any>;

  // StatusManage
  selectChart: (chartId: string | null) => void;
  updateConfig: (chartId: string, config: Partial<ChartConfig>) => void;
  updateData: (chartId: string, data: ChartData) => void;
  addChartToState: (chart: ChartInstance) => void;
  removeChartFromState: (chartId: string) => void;
  setFilters: (options: ChartFilterOptions) => void;
  clearErrors: () => void;
  setStatus: (
    chartId: string,
    status: 'idle' | 'loading' | 'rendered' | 'error',
    error?: string
  ) => void;
  updateAnalyticsDataHandler: (
    chartId: string,
    analytics: ChartAnalytics
  ) => void;
  setTemplatesData: (templates: ChartTemplate[]) => void;
  setStatisticsData: (statistics: unknown) => void;
}

// GraphTable Hook
export const _useChart = (): UseChartReturn => {
  const _dispatch = useDispatch();

  // 從 Redux GetStatus
  const _charts = useSelector(selectCharts);
  const _currentChart = useSelector(selectCurrentChart);
  const _selectedChartId = useSelector(selectSelectedChartId);
  const _templates = useSelector(selectTemplates);
  const _analytics = useSelector(selectAnalytics);
  const _statistics = useSelector(selectStatistics);
  const _loading = useSelector(selectChartLoading);
  const _error = useSelector(selectChartError);
  const _filterOptions = useSelector(selectFilterOptions);
  const _exportLoading = useSelector(selectExportLoading);
  const _exportError = useSelector(selectExportError);

  // 計算Property
  const _chartCount = useMemo(() => charts.length, [charts]);
  const _currentAnalytics = useMemo(() => {
    if (!currentChart) return null;
    return analytics.get(currentChart.id) || null;
  }, [currentChart, analytics]);
  const _hasCharts = useMemo(() => charts.length > 0, [charts]);
  const _isLoading = useMemo(
    () => loading || exportLoading,
    [loading, exportLoading]
  );
  const _hasError = useMemo(
    () => !!(error || exportError),
    [error, exportError]
  );

  // InitializeService
  const _initialize = useCallback(async () => {
    try {
      await (dispatch as any)(initializeChartService()).unwrap();
    } catch (error) {
      console.error('useChart: InitializeFailed', error);
    }
  }, [dispatch]);

  // Create新GraphTable
  const _createNewChart = useCallback(
    async (request: ChartCreateRequest): Promise<ChartInstance | null> => {
      try {
        const _chart = await (dispatch as any)(createChart(request)).unwrap();
        return chart;
      } catch (error) {
        console.error('useChart: Create圖表Failed', error);
        return null;
      }
    },
    [dispatch]
  );

  // GetGraphTable
  const _fetchChart = useCallback(
    async (chartId: string): Promise<ChartInstance | null> => {
      try {
        const _chart = await (dispatch as any)(getChart(chartId)).unwrap();
        return chart;
      } catch (error) {
        console.error('useChart: Get圖表Failed', error);
        return null;
      }
    },
    [dispatch]
  );

  // GetGraphTableList
  const _fetchCharts = useCallback(
    async (options?: ChartFilterOptions): Promise<void> => {
      try {
        await (dispatch as any)(getCharts(options || {})).unwrap();
      } catch (error) {
        console.error('useChart: Get圖表列表Failed', error);
      }
    },
    [dispatch]
  );

  // UpdateGraphTable
  const _updateChartDataAsync = useCallback(
    async (
      chartId: string,
      request: ChartUpdateRequest
    ): Promise<ChartInstance | null> => {
      try {
        const _chart = await (dispatch as any)(
          updateChart({ chartId, request })
        ).unwrap();
        return chart;
      } catch (error) {
        console.error('useChart: Update圖表Failed', error);
        return null;
      }
    },
    [dispatch]
  );

  // DeleteGraphTable
  const _removeChartById = useCallback(
    async (chartId: string): Promise<boolean> => {
      try {
        await (dispatch as any)(deleteChart(chartId)).unwrap();
        return true;
      } catch (error) {
        console.error('useChart: Delete圖表Failed', error);
        return false;
      }
    },
    [dispatch]
  );

  // ExportGraphTable
  const _exportChartAs = useCallback(
    async (
      chartId: string,
      format: 'png' | 'jpg' | 'svg' | 'pdf'
    ): Promise<boolean> => {
      try {
        await (dispatch as any)(exportChart({ chartId, format })).unwrap();
        return true;
      } catch (error) {
        console.error('useChart: 導出圖表Failed', error);
        return false;
      }
    },
    [dispatch]
  );

  // Get模板
  const _fetchTemplates = useCallback(async (): Promise<ChartTemplate[]> => {
    try {
      const _templates = await (dispatch as any)(getTemplates()).unwrap();
      return templates;
    } catch (error) {
      console.error('useChart: Get模板Failed', error);
      return [];
    }
  }, [dispatch]);

  // GetAnalysisData
  const _fetchAnalytics = useCallback(
    async (chartId: string): Promise<ChartAnalytics | null> => {
      try {
        const _result = await (dispatch as any)(getAnalytics(chartId)).unwrap();
        return result.analytics;
      } catch (error) {
        console.error('useChart: Get分析數據Failed', error);
        return null;
      }
    },
    [dispatch]
  );

  // Get統Count據
  const _fetchStatistics = useCallback(async (): Promise<any> => {
    try {
      const _statistics = await (dispatch as any)(getStatistics()).unwrap();
      return statistics;
    } catch (error) {
      console.error('useChart: Get統計數據Failed', error);
      return null;
    }
  }, [dispatch]);

  // SelectGraphTable
  const _selectChart = useCallback(
    (chartId: string | null) => {
      dispatch(setSelectedChartId(chartId));
    },
    [dispatch]
  );

  // UpdateConfigure
  const _updateConfig = useCallback(
    (chartId: string, config: Partial<ChartConfig>) => {
      dispatch(updateChartConfig({ chartId, config }));
    },
    [dispatch]
  );

  // UpdateData
  const _updateData = useCallback(
    (chartId: string, data: ChartData) => {
      dispatch(updateChartData({ chartId, data }));
    },
    [dispatch]
  );

  // AddGraphTable到Status
  const _addChartToState = useCallback(
    (chart: ChartInstance) => {
      dispatch(addChart(chart));
    },
    [dispatch]
  );

  // 從StatusRemoveGraphTable
  const _removeChartFromState = useCallback(
    (chartId: string) => {
      dispatch(removeChart(chartId));
    },
    [dispatch]
  );

  // SettingsFilter器
  const _setFilters = useCallback(
    (options: ChartFilterOptions) => {
      dispatch(setFilterOptions(options));
    },
    [dispatch]
  );

  // ClearError
  const _clearErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // SettingsStatus
  const _setStatus = useCallback(
    (
      chartId: string,
      status: 'idle' | 'loading' | 'rendered' | 'error',
      error?: string
    ) => {
      dispatch(setChartStatus({ chartId, status, error }));
    },
    [dispatch]
  );

  // UpdateAnalysisData
  const _updateAnalyticsDataHandler = useCallback(
    (chartId: string, analytics: ChartAnalytics) => {
      dispatch(updateAnalyticsData({ chartId, analytics }));
    },
    [dispatch]
  );

  // Settings模板Data
  const _setTemplatesData = useCallback(
    (templates: ChartTemplate[]) => {
      dispatch(setTemplates(templates));
    },
    [dispatch]
  );

  // Settings統Count據
  const _setStatisticsData = useCallback(
    (statistics: unknown) => {
      dispatch(setStatistics(statistics));
    },
    [dispatch]
  );

  // AutoInitialize
  useEffect(() => {
    initialize();
  }, [initialize]);

  // AutoGet模板
  useEffect(() => {
    if (templates.length === 0) {
      fetchTemplates();
    }
  }, [templates.length, fetchTemplates]);

  // AutoGet統Count據
  useEffect(() => {
    if (!statistics) {
      fetchStatistics();
    }
  }, [statistics, fetchStatistics]);

  // Return Hook Interface
  return {
    // Status
    charts,
    currentChart,
    selectedChartId,
    templates,
    analytics,
    statistics,
    loading,
    error,
    filterOptions,
    exportLoading,
    exportError,

    // 計算Property
    chartCount,
    currentAnalytics,
    hasCharts,
    isLoading,
    hasError,

    // OperationMethod
    initialize,
    createNewChart,
    fetchChart,
    fetchCharts,
    updateChartDataAsync,
    removeChartById,
    exportChartAs,
    fetchTemplates,
    fetchAnalytics,
    fetchStatistics,

    // StatusManage
    selectChart,
    updateConfig,
    updateData,
    addChartToState,
    removeChartFromState,
    setFilters,
    clearErrors,
    setStatus,
    updateAnalyticsDataHandler,
    setTemplatesData,
    setStatisticsData,
  };
};

export default useChart;
