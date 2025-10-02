// 業務指標Analysis React Hook
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

  // StatusSelect器
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

  // InitializeService
  const _initialize = useCallback(
    async (config?: Partial<BusinessMetricsConfig>) => {
      try {
        await (dispatch as any)(initializeBusinessMetrics(config)).unwrap();
        return true;
      } catch (error) {
        console.error('業務指標分析ServiceInitializeFailed:', error);
        return false;
      }
    },
    [dispatch]
  );

  // Get業務指標Analysis
  const _getAnalysis = useCallback(
    async (filter?: BusinessMetricsFilter) => {
      try {
        const _result = await (dispatch as any)(
          getBusinessMetricsAnalysis(filter)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('Get業務指標分析Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 生成Report
  const _generateReport = useCallback(
    async (filter?: BusinessMetricsFilter) => {
      try {
        const _result = await (dispatch as any)(
          generateBusinessMetricsReport(filter)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('生成業務指標報告Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // ExportData
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
        console.error('導出業務指標數據Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // CreateAlert
  const _createAlert = useCallback(
    async (alert: unknown) => {
      try {
        const _result = await (dispatch as any)(
          createBusinessMetricsAlert(alert)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('Create業務指標警報Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // UpdateAlert
  const _updateAlert = useCallback(
    async (alertId: string, updates: unknown) => {
      try {
        const _result = await (dispatch as any)(
          updateBusinessMetricsAlert({ alertId, updates })
        ).unwrap();
        return result;
      } catch (error) {
        console.error('Update業務指標警報Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // DeleteAlert
  const _deleteAlert = useCallback(
    async (alertId: string) => {
      try {
        await (dispatch as any)(deleteBusinessMetricsAlert(alertId)).unwrap();
        return true;
      } catch (error) {
        console.error('Delete業務指標警報Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // GetAlert
  const _getAlert = useCallback(
    async (alertId: string) => {
      try {
        const _result = await (dispatch as any)(
          getBusinessMetricsAlert(alertId)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('Get業務指標警報Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // GetConfigure
  const _getConfig = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getBusinessMetricsConfig()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('Get業務指標ConfigureFailed:', error);
      throw error;
    }
  }, [dispatch]);

  // UpdateConfigure
  const _updateConfig = useCallback(
    async (updates: Partial<BusinessMetricsConfig>) => {
      try {
        const _result = await (dispatch as any)(
          updateBusinessMetricsConfig(updates)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('Update業務指標ConfigureFailed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // GetReport
  const _getReports = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getBusinessMetricsReports()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('Get業務指標報告Failed:', error);
      throw error;
    }
  }, [dispatch]);

  // Get洞察
  const _getInsights = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getBusinessMetricsInsights()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('Get業務指標洞察Failed:', error);
      throw error;
    }
  }, [dispatch]);

  // Get建議
  const _getRecommendations = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getBusinessMetricsRecommendations()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('Get業務指標建議Failed:', error);
      throw error;
    }
  }, [dispatch]);

  // GetAlert
  const _getAlerts = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getBusinessMetricsAlerts()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('Get業務指標警報Failed:', error);
      throw error;
    }
  }, [dispatch]);

  // Get實時指標
  const _getRealTimeMetrics = useCallback(async () => {
    try {
      const _result = await (dispatch as any)(
        getRealTimeBusinessMetrics()
      ).unwrap();
      return result;
    } catch (error) {
      console.error('Get實時業務指標Failed:', error);
      throw error;
    }
  }, [dispatch]);

  // ClearError
  const _clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // ClearExportError
  const _clearExportErrorHandler = useCallback(() => {
    dispatch(clearExportError());
  }, [dispatch]);

  // SettingsFilter器
  const _setFilterHandler = useCallback(
    (filter: BusinessMetricsFilter) => {
      dispatch(setFilter(filter));
    },
    [dispatch]
  );

  // ClearFilter器
  const _clearFilterHandler = useCallback(() => {
    dispatch(clearFilter());
  }, [dispatch]);

  // Update實時指標
  const _updateRealTimeMetricsHandler = useCallback(
    (metrics: unknown) => {
      dispatch(updateRealTimeMetrics(metrics));
    },
    [dispatch]
  );

  // AddEvent監聽器
  const _addEventListenerHandler = useCallback(
    (eventType: string, listener: (data: unknown) => void) => {
      dispatch(addEventListener({ eventType, listener }));
    },
    [dispatch]
  );

  // RemoveEvent監聽器
  const _removeEventListenerHandler = useCallback(
    (eventType: string, listener: (data: unknown) => void) => {
      dispatch(removeEventListener({ eventType, listener }));
    },
    [dispatch]
  );

  // 計算Property
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

  // AutoInitialize
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // 定期Update實時指標
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
    // Status
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

    // 計算Property
    activeAlerts,
    criticalAlerts,
    positiveInsights,
    negativeInsights,
    highPriorityRecommendations,
    isHealthy,

    // OperationMethod
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

    // ToolMethod
    clearError: clearErrorHandler,
    clearExportError: clearExportErrorHandler,
    setFilter: setFilterHandler,
    clearFilter: clearFilterHandler,
    updateRealTimeMetrics: updateRealTimeMetricsHandler,
    addEventListener: addEventListenerHandler,
    removeEventListener: removeEventListenerHandler,
  };
};
