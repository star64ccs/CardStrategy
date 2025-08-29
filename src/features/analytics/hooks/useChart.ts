// 圖表 Hook
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

// 圖表 Hook 接口
interface UseChartReturn {
  // 狀態
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

  // 計算屬性
  chartCount: number;
  currentAnalytics: ChartAnalytics | null;
  hasCharts: boolean;
  isLoading: boolean;
  hasError: boolean;

  // 操作方法
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

  // 狀態管理
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

// 圖表 Hook
export const _useChart = (): UseChartReturn => {
  const _dispatch = useDispatch();

  // 從 Redux 獲取狀態
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

  // 計算屬性
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

  // 初始化服務
  const _initialize = useCallback(async () => {
    try {
      await (dispatch as any)(initializeChartService()).unwrap();
    } catch (error) {
      console.error('useChart: 初始化失敗', error);
    }
  }, [dispatch]);

  // 創建新圖表
  const _createNewChart = useCallback(
    async (request: ChartCreateRequest): Promise<ChartInstance | null> => {
      try {
        const _chart = await (dispatch as any)(createChart(request)).unwrap();
        return chart;
      } catch (error) {
        console.error('useChart: 創建圖表失敗', error);
        return null;
      }
    },
    [dispatch]
  );

  // 獲取圖表
  const _fetchChart = useCallback(
    async (chartId: string): Promise<ChartInstance | null> => {
      try {
        const _chart = await (dispatch as any)(getChart(chartId)).unwrap();
        return chart;
      } catch (error) {
        console.error('useChart: 獲取圖表失敗', error);
        return null;
      }
    },
    [dispatch]
  );

  // 獲取圖表列表
  const _fetchCharts = useCallback(
    async (options?: ChartFilterOptions): Promise<void> => {
      try {
        await (dispatch as any)(getCharts(options || {})).unwrap();
      } catch (error) {
        console.error('useChart: 獲取圖表列表失敗', error);
      }
    },
    [dispatch]
  );

  // 更新圖表
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
        console.error('useChart: 更新圖表失敗', error);
        return null;
      }
    },
    [dispatch]
  );

  // 刪除圖表
  const _removeChartById = useCallback(
    async (chartId: string): Promise<boolean> => {
      try {
        await (dispatch as any)(deleteChart(chartId)).unwrap();
        return true;
      } catch (error) {
        console.error('useChart: 刪除圖表失敗', error);
        return false;
      }
    },
    [dispatch]
  );

  // 導出圖表
  const _exportChartAs = useCallback(
    async (
      chartId: string,
      format: 'png' | 'jpg' | 'svg' | 'pdf'
    ): Promise<boolean> => {
      try {
        await (dispatch as any)(exportChart({ chartId, format })).unwrap();
        return true;
      } catch (error) {
        console.error('useChart: 導出圖表失敗', error);
        return false;
      }
    },
    [dispatch]
  );

  // 獲取模板
  const _fetchTemplates = useCallback(async (): Promise<ChartTemplate[]> => {
    try {
      const _templates = await (dispatch as any)(getTemplates()).unwrap();
      return templates;
    } catch (error) {
      console.error('useChart: 獲取模板失敗', error);
      return [];
    }
  }, [dispatch]);

  // 獲取分析數據
  const _fetchAnalytics = useCallback(
    async (chartId: string): Promise<ChartAnalytics | null> => {
      try {
        const _result = await (dispatch as any)(getAnalytics(chartId)).unwrap();
        return result.analytics;
      } catch (error) {
        console.error('useChart: 獲取分析數據失敗', error);
        return null;
      }
    },
    [dispatch]
  );

  // 獲取統計數據
  const _fetchStatistics = useCallback(async (): Promise<any> => {
    try {
      const _statistics = await (dispatch as any)(getStatistics()).unwrap();
      return statistics;
    } catch (error) {
      console.error('useChart: 獲取統計數據失敗', error);
      return null;
    }
  }, [dispatch]);

  // 選擇圖表
  const _selectChart = useCallback(
    (chartId: string | null) => {
      dispatch(setSelectedChartId(chartId));
    },
    [dispatch]
  );

  // 更新配置
  const _updateConfig = useCallback(
    (chartId: string, config: Partial<ChartConfig>) => {
      dispatch(updateChartConfig({ chartId, config }));
    },
    [dispatch]
  );

  // 更新數據
  const _updateData = useCallback(
    (chartId: string, data: ChartData) => {
      dispatch(updateChartData({ chartId, data }));
    },
    [dispatch]
  );

  // 添加圖表到狀態
  const _addChartToState = useCallback(
    (chart: ChartInstance) => {
      dispatch(addChart(chart));
    },
    [dispatch]
  );

  // 從狀態移除圖表
  const _removeChartFromState = useCallback(
    (chartId: string) => {
      dispatch(removeChart(chartId));
    },
    [dispatch]
  );

  // 設置過濾器
  const _setFilters = useCallback(
    (options: ChartFilterOptions) => {
      dispatch(setFilterOptions(options));
    },
    [dispatch]
  );

  // 清除錯誤
  const _clearErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 設置狀態
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

  // 更新分析數據
  const _updateAnalyticsDataHandler = useCallback(
    (chartId: string, analytics: ChartAnalytics) => {
      dispatch(updateAnalyticsData({ chartId, analytics }));
    },
    [dispatch]
  );

  // 設置模板數據
  const _setTemplatesData = useCallback(
    (templates: ChartTemplate[]) => {
      dispatch(setTemplates(templates));
    },
    [dispatch]
  );

  // 設置統計數據
  const _setStatisticsData = useCallback(
    (statistics: unknown) => {
      dispatch(setStatistics(statistics));
    },
    [dispatch]
  );

  // 自動初始化
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 自動獲取模板
  useEffect(() => {
    if (templates.length === 0) {
      fetchTemplates();
    }
  }, [templates.length, fetchTemplates]);

  // 自動獲取統計數據
  useEffect(() => {
    if (!statistics) {
      fetchStatistics();
    }
  }, [statistics, fetchStatistics]);

  // 返回 Hook 接口
  return {
    // 狀態
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

    // 計算屬性
    chartCount,
    currentAnalytics,
    hasCharts,
    isLoading,
    hasError,

    // 操作方法
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

    // 狀態管理
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
