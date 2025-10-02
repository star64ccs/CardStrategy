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
export const useChart = (): UseChartReturn => {
  const dispatch = useDispatch();

  // 從 Redux 獲取狀態
  const charts = useSelector(selectCharts);
  const currentChart = useSelector(selectCurrentChart);
  const selectedChartId = useSelector(selectSelectedChartId);
  const templates = useSelector(selectTemplates);
  const analytics = useSelector(selectAnalytics);
  const statistics = useSelector(selectStatistics);
  const loading = useSelector(selectChartLoading);
  const error = useSelector(selectChartError);
  const filterOptions = useSelector(selectFilterOptions);
  const exportLoading = useSelector(selectExportLoading);
  const exportError = useSelector(selectExportError);

  // 計算屬性
  const chartCount = useMemo(() => charts.length, [charts]);
  const currentAnalytics = useMemo(() => {
    if (!currentChart) return null;
    return analytics.get(currentChart.id) || null;
  }, [currentChart, analytics]);
  const hasCharts = useMemo(() => charts.length > 0, [charts]);
  const isLoading = useMemo(
    () => loading || exportLoading,
    [loading, exportLoading]
  );
  const hasError = useMemo(
    () => !!(error || exportError),
    [error, exportError]
  );

  // 初始化服務
  const initialize = useCallback(async () => {
    try {
      await (dispatch as any)(initializeChartService()).unwrap();
    } catch (error) {
      console.error('useChart: 初始化失敗', error);
    }
  }, [dispatch]);

  // 創建新圖表
  const createNewChart = useCallback(
    async (request: ChartCreateRequest): Promise<ChartInstance | null> => {
      try {
        const chart = await (dispatch as any)(createChart(request)).unwrap();
        return chart;
      } catch (error) {
        console.error('useChart: 創建圖表失敗', error);
        return null;
      }
    },
    [dispatch]
  );

  // 獲取圖表
  const fetchChart = useCallback(
    async (chartId: string): Promise<ChartInstance | null> => {
      try {
        const chart = await (dispatch as any)(getChart(chartId)).unwrap();
        return chart;
      } catch (error) {
        console.error('useChart: 獲取圖表失敗', error);
        return null;
      }
    },
    [dispatch]
  );

  // 獲取圖表列表
  const fetchCharts = useCallback(
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
  const updateChartDataAsync = useCallback(
    async (
      chartId: string,
      request: ChartUpdateRequest
    ): Promise<ChartInstance | null> => {
      try {
        const chart = await (dispatch as any)(
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
  const removeChartById = useCallback(
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
  const exportChartAs = useCallback(
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
  const fetchTemplates = useCallback(async (): Promise<ChartTemplate[]> => {
    try {
      const templates = await (dispatch as any)(getTemplates()).unwrap();
      return templates;
    } catch (error) {
      console.error('useChart: 獲取模板失敗', error);
      return [];
    }
  }, [dispatch]);

  // 獲取分析數據
  const fetchAnalytics = useCallback(
    async (chartId: string): Promise<ChartAnalytics | null> => {
      try {
        const result = await (dispatch as any)(getAnalytics(chartId)).unwrap();
        return result.analytics;
      } catch (error) {
        console.error('useChart: 獲取分析數據失敗', error);
        return null;
      }
    },
    [dispatch]
  );

  // 獲取統計數據
  const fetchStatistics = useCallback(async (): Promise<any> => {
    try {
      const statistics = await (dispatch as any)(getStatistics()).unwrap();
      return statistics;
    } catch (error) {
      console.error('useChart: 獲取統計數據失敗', error);
      return null;
    }
  }, [dispatch]);

  // 選擇圖表
  const selectChart = useCallback(
    (chartId: string | null) => {
      dispatch(setSelectedChartId(chartId));
    },
    [dispatch]
  );

  // 更新配置
  const updateConfig = useCallback(
    (chartId: string, config: Partial<ChartConfig>) => {
      dispatch(updateChartConfig({ chartId, config }));
    },
    [dispatch]
  );

  // 更新數據
  const updateData = useCallback(
    (chartId: string, data: ChartData) => {
      dispatch(updateChartData({ chartId, data }));
    },
    [dispatch]
  );

  // 添加圖表到狀態
  const addChartToState = useCallback(
    (chart: ChartInstance) => {
      dispatch(addChart(chart));
    },
    [dispatch]
  );

  // 從狀態移除圖表
  const removeChartFromState = useCallback(
    (chartId: string) => {
      dispatch(removeChart(chartId));
    },
    [dispatch]
  );

  // 設置過濾器
  const setFilters = useCallback(
    (options: ChartFilterOptions) => {
      dispatch(setFilterOptions(options));
    },
    [dispatch]
  );

  // 清除錯誤
  const clearErrors = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 設置狀態
  const setStatus = useCallback(
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
  const updateAnalyticsDataHandler = useCallback(
    (chartId: string, analytics: ChartAnalytics) => {
      dispatch(updateAnalyticsData({ chartId, analytics }));
    },
    [dispatch]
  );

  // 設置模板數據
  const setTemplatesData = useCallback(
    (templates: ChartTemplate[]) => {
      dispatch(setTemplates(templates));
    },
    [dispatch]
  );

  // 設置統計數據
  const setStatisticsData = useCallback(
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
