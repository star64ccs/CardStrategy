// 業務指標分析 React Hook
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  addEventListener,
  clearError,
  clearExportError,
  clearFilter,
  createBusinessMetricsAlert,
  deleteBusinessMetricsAlert,
  exportBusinessMetricsData,
  generateBusinessMetricsReport,
  getBusinessMetricsAlert,
  getBusinessMetricsAlerts,
  getBusinessMetricsAnalysis,
  getBusinessMetricsConfig,
  getBusinessMetricsInsights,
  getBusinessMetricsRecommendations,
  getBusinessMetricsReports,
  getRealTimeBusinessMetrics,
  initializeBusinessMetrics,
  removeEventListener,
  selectAlerts,
  selectAnalysis,
  selectConfig,
  selectCurrentFilter,
  selectError,
  selectExportData,
  selectExportError,
  selectInsights,
  selectIsExporting,
  selectIsInitialized,
  selectIsLoading,
  selectLastUpdate,
  selectMetrics,
  selectRealTimeMetrics,
  selectRecommendations,
  selectReports,
  setFilter,
  updateBusinessMetricsAlert,
  updateBusinessMetricsConfig,
  updateRealTimeMetrics,
} from '../../../store/slices/businessMetricsSlice';
import type {
  BusinessMetricsAnalysisResponse,
  BusinessMetricsConfig,
  BusinessMetricsExportOptions,
  BusinessMetricsFilter,
} from '../types/businessMetrics';

export const _useBusinessMetrics = () => {
  const _dispatch = useAppDispatch();

  // 狀態選擇器
  const _isInitialized = useSelector(selectIsInitialized);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);
  const _metrics = useSelector(selectMetrics);
  const _analysis = useSelector(selectAnalysis);
  const _reports = useSelector(selectReports);
  const _insights = useSelector(selectInsights);
  const _recommendations = useSelector(selectRecommendations);
  const _alerts = useSelector(selectAlerts);
  const _config = useSelector(selectConfig);
  const _realTimeMetrics = useSelector(selectRealTimeMetrics);
  const _lastUpdate = useSelector(selectLastUpdate);
  const _currentFilter = useSelector(selectCurrentFilter);
  const _exportDataState = useSelector(selectExportData);
  const _isExporting = useSelector(selectIsExporting);
  const _exportError = useSelector(selectExportError);

  // 初始化服務
  const _initialize = useCallback(
    async (config?: Partial<BusinessMetricsConfig>) => {
      try {
        await (dispatch as any)(initializeBusinessMetrics(config)).unwrap();
        return true;
      } catch (error) {
        console.error('業務指標分析服務初始化失敗:', error);
        return false;
      }
    },
    [dispatch]
  );

  // 獲取業務指標分析
  const _getAnalysis = useCallback(
    async (filter?: BusinessMetricsFilter) => {
      try {
        const _result = await (dispatch as any)(
          getBusinessMetricsAnalysis(filter)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('獲取業務指標分析失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 生成報告
  const _generateReport = useCallback(
    async (filter?: BusinessMetricsFilter) => {
      try {
        const _result = await (dispatch as any)(
          generateBusinessMetricsReport(filter)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('生成業務指標報告失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 導出數據
  const _exportData = useCallback(
    async (
      analysis: BusinessMetricsAnalysisResponse,
      options: BusinessMetricsExportOptions
    ) => {
      try {
        const _result = await (dispatch as any)(
          exportBusinessMetricsData({ analysis, options })
        ).unwrap();
        return result;
      } catch (error) {
        console.error('導出業務指標數據失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 創建警報
  const _createAlert = useCallback(
    async (alert: unknown) => {
      try {
        const _result = await (dispatch as any)(
          createBusinessMetricsAlert(alert)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('創建業務指標警報失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 更新警報
  const _updateAlert = useCallback(
    async (alertId: string, updates: unknown) => {
      try {
        const _result = await (dispatch as any)(
          updateBusinessMetricsAlert({ alertId, updates })
        ).unwrap();
        return result;
      } catch (error) {
        console.error('更新業務指標警報失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 刪除警報
  const _deleteAlert = useCallback(
    async (alertId: string) => {
      try {
        await (dispatch as any)(deleteBusinessMetricsAlert(alertId)).unwrap();
        return true;
      } catch (error) {
        console.error('刪除業務指標警報失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取警報
  const _getAlert = useCallback(
    async (alertId: string) => {
      try {
        const _result = await (dispatch as any)(
          getBusinessMetricsAlert(alertId)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('獲取業務指標警報失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取配置
  const _getConfig = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getBusinessMetricsConfig()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('獲取業務指標配置失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 更新配置
  const _updateConfig = useCallback(
    async (updates: Partial<BusinessMetricsConfig>) => {
      try {
        const _result = await (dispatch as any)(
          updateBusinessMetricsConfig(updates)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('更新業務指標配置失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取報告
  const _getReports = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getBusinessMetricsReports()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('獲取業務指標報告失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 獲取洞察
  const _getInsights = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getBusinessMetricsInsights()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('獲取業務指標洞察失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 獲取建議
  const _getRecommendations = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getBusinessMetricsRecommendations()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('獲取業務指標建議失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 獲取警報
  const _getAlerts = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getBusinessMetricsAlerts()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('獲取業務指標警報失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 獲取實時指標
  const _getRealTimeMetrics = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getRealTimeBusinessMetrics()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('獲取實時業務指標失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 清除錯誤
  const _clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 清除導出錯誤
  const _clearExportErrorHandler = useCallback(() => {
    dispatch(clearExportError());
  }, [dispatch]);

  // 設置過濾器
  const _setFilterHandler = useCallback(
    (filter: BusinessMetricsFilter) => {
      dispatch(setFilter(filter));
    },
    [dispatch]
  );

  // 清除過濾器
  const _clearFilterHandler = useCallback(() => {
    dispatch(clearFilter());
  }, [dispatch]);

  // 更新實時指標
  const _updateRealTimeMetricsHandler = useCallback(
    (metrics: unknown) => {
      dispatch(updateRealTimeMetrics(metrics));
    },
    [dispatch]
  );

  // 添加事件監聽器
  const _addEventListenerHandler = useCallback(
    (eventType: string, listener: (data: unknown) => void) => {
      dispatch(addEventListener({ eventType, listener }));
    },
    [dispatch]
  );

  // 移除事件監聽器
  const _removeEventListenerHandler = useCallback(
    (eventType: string, listener: (data: unknown) => void) => {
      dispatch(removeEventListener({ eventType, listener }));
    },
    [dispatch]
  );

  // 計算屬性
  const _activeAlerts = useMemo(() => {
    return alerts.filter(alert => !alert.acknowledged);
  }, [alerts]);

  const _criticalAlerts = useMemo(() => {
    return alerts.filter(alert => alert.severity === 'critical');
  }, [alerts]);

  const _positiveInsights = useMemo(() => {
    return insights.filter(insight => insight.type === 'positive');
  }, [insights]);

  const _negativeInsights = useMemo(() => {
    return insights.filter(insight => insight.type === 'negative');
  }, [insights]);

  const _highPriorityRecommendations = useMemo(() => {
    return recommendations.filter(rec => rec.priority === 'high');
  }, [recommendations]);

  const _isHealthy = useMemo((): boolean => {
    if (!analysis) return false;
    const _health = (analysis as any)?.summary?.overallHealth;
    return health === 'excellent' || health === 'good';
  }, [analysis]);

  // 自動初始化
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // 定期更新實時指標
  useEffect(() => {
    if (isInitialized && config?.realTimeUpdates) {
      const _interval = setInterval(() => {
        getRealTimeMetrics();
      }, config.updateInterval || 300000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isInitialized, config, getRealTimeMetrics]);

  return {
    // 狀態
    isInitialized,
    isLoading,
    error,
    metrics,
    analysis,
    reports,
    insights,
    recommendations,
    alerts,
    config,
    realTimeMetrics,
    lastUpdate,
    currentFilter,
    exportDataState,
    isExporting,
    exportError,

    // 計算屬性
    activeAlerts,
    criticalAlerts,
    positiveInsights,
    negativeInsights,
    highPriorityRecommendations,
    isHealthy,

    // 操作方法
    initialize,
    getAnalysis,
    generateReport,
    exportData,
    createAlert,
    updateAlert,
    deleteAlert,
    getAlert,
    getConfig,
    updateConfig,
    getReports,
    getInsights,
    getRecommendations,
    getAlerts,
    getRealTimeMetrics,

    // 工具方法
    clearError: clearErrorHandler,
    clearExportError: clearExportErrorHandler,
    setFilter: setFilterHandler,
    clearFilter: clearFilterHandler,
    updateRealTimeMetrics: updateRealTimeMetricsHandler,
    addEventListener: addEventListenerHandler,
    removeEventListener: removeEventListenerHandler,
  };
};
