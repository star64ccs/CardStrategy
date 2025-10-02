import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch } from '../../../store';
import {
  addEvent,
  clearError,
  clearFilter,
  createAlert,
  deleteAlert,
  deleteReport,
  exportData,
  fetchAnalytics,
  generateReport,
  initializeSearchAnalytics,
  selectAlerts,
  selectAnalytics,
  selectConfig,
  selectError,
  selectIsInitialized,
  selectIsLoading,
  selectReports,
  setCurrentReport,
  setFilter,
  updateAlert,
  updateConfig,
  updateRealTimeMetrics,
} from '../../../store/slices/searchAnalyticsSlice';
import { SearchAnalyticsService } from '../services/searchAnalyticsService';
import type {
  SearchAnalyticsAlert,
  SearchAnalyticsEvent,
  SearchAnalyticsExportOptions,
  SearchAnalyticsFilter,
} from '../types/searchAnalytics';

export const _useSearchAnalytics = () => {
  const _dispatch = useDispatch<AppDispatch>();
  const _analytics = useSelector(selectAnalytics);
  const _isInitialized = useSelector(selectIsInitialized);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);
  const _config = useSelector(selectConfig);
  const _alerts = useSelector(selectAlerts);
  const _reports = useSelector(selectReports);

  // InitializeService
  const _initialize = useCallback(async () => {
    try {
      await dispatch(initializeSearchAnalytics()).unwrap();

      // SettingsEvent監聽器
      const _service = SearchAnalyticsService.getInstance();
      service.addEventListener((event: SearchAnalyticsEvent) => {
        dispatch(addEvent(event));
      });

      return true;
    } catch (error) {
      console.error('搜索分析InitializeFailed:', error);
      return false;
    }
  }, [dispatch]);

  // GetAnalysisData
  const _getAnalytics = useCallback(
    async (filter?: SearchAnalyticsFilter) => {
      try {
        await dispatch(fetchAnalytics(filter)).unwrap();
        return true;
      } catch (error) {
        console.error('Get分析數據Failed:', error);
        return false;
      }
    },
    [dispatch]
  );

  // 生成Report
  const _generateAnalyticsReport = useCallback(
    async (
      title: string,
      description: string,
      period: { start: number; end: number },
      filter?: SearchAnalyticsFilter
    ) => {
      try {
        const _report = await dispatch(
          generateReport({
            title,
            description,
            period,
            filter,
          })
        ).unwrap();
        return report;
      } catch (error) {
        console.error('生成報告Failed:', error);
        return null;
      }
    },
    [dispatch]
  );

  // ExportData
  const _exportAnalyticsData = useCallback(
    async (analytics: unknown, options: SearchAnalyticsExportOptions) => {
      try {
        const _data = await dispatch(
          exportData({ analytics, options })
        ).unwrap();
        return data;
      } catch (error) {
        console.error('導出數據Failed:', error);
        return null;
      }
    },
    [dispatch]
  );

  // CreateAlert
  const _createAnalyticsAlert = useCallback(
    async (alert: Omit<SearchAnalyticsAlert, 'id' | 'triggerCount'>) => {
      try {
        const _alertId = await dispatch(createAlert(alert)).unwrap();
        return alertId;
      } catch (error) {
        console.error('Create警報Failed:', error);
        return null;
      }
    },
    [dispatch]
  );

  // UpdateAlert
  const _updateAnalyticsAlert = useCallback(
    async (alertId: string, updates: Partial<SearchAnalyticsAlert>) => {
      try {
        await dispatch(updateAlert({ alertId, updates })).unwrap();
        return true;
      } catch (error) {
        console.error('Update警報Failed:', error);
        return false;
      }
    },
    [dispatch]
  );

  // DeleteAlert
  const _deleteAnalyticsAlert = useCallback(
    async (alertId: string) => {
      try {
        await dispatch(deleteAlert(alertId)).unwrap();
        return true;
      } catch (error) {
        console.error('Delete警報Failed:', error);
        return false;
      }
    },
    [dispatch]
  );

  // SettingsFilter器
  const _setAnalyticsFilter = useCallback(
    (filter: SearchAnalyticsFilter) => {
      dispatch(setFilter(filter));
    },
    [dispatch]
  );

  // ClearFilter器
  const _clearAnalyticsFilter = useCallback(() => {
    dispatch(clearFilter());
  }, [dispatch]);

  // UpdateConfigure
  const _updateAnalyticsConfig = useCallback(
    (newConfig: Partial<typeof config>) => {
      dispatch(updateConfig(newConfig));
    },
    [dispatch, config]
  );

  // ClearError
  const _clearAnalyticsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Settings當前Report
  const _setCurrentAnalyticsReport = useCallback(
    (report: unknown) => {
      dispatch(setCurrentReport(report));
    },
    [dispatch]
  );

  // DeleteReport
  const _deleteAnalyticsReport = useCallback(
    (reportId: string) => {
      dispatch(deleteReport(reportId));
    },
    [dispatch]
  );

  // TraceSearchEvent
  const _trackSearchEvent = useCallback(
    (event: Omit<SearchAnalyticsEvent, 'timestamp'>) => {
      const _service = SearchAnalyticsService.getInstance();
      service.trackEvent(event);
    },
    []
  );

  // Update實時指標
  const _updateRealTimeAnalyticsMetrics = useCallback(
    (metrics: {
      currentSearches: number;
      averageResponseTime: number;
      errorRate: number;
      throughput: number;
    }) => {
      dispatch(updateRealTimeMetrics(metrics));
    },
    [dispatch]
  );

  // 計算統Count據
  const _statistics = useMemo(() => {
    if (!analytics) return null;

    return {
      totalSearches: analytics.totalSearches,
      uniqueUsers: analytics.uniqueUsers,
      averageSearchTime: analytics.averageSearchTime,
      searchSuccessRate: analytics.searchSuccessRate,
      averageResponseTime: analytics.performanceMetrics.averageResponseTime,
      errorRate: analytics.errorRates.errorRate,
      throughput: analytics.performanceMetrics.throughput,
      cacheHitRate: analytics.cacheMetrics.hitRate,
      conversionRate: analytics.conversionRates.overallConversion,
    };
  }, [analytics]);

  // Get熱門Search
  const _popularSearches = useMemo(() => {
    return analytics?.popularSearches || [];
  }, [analytics]);

  // Get趨勢Search
  const _trendingSearches = useMemo(() => {
    return analytics?.trendingSearches || [];
  }, [analytics]);

  // GetClass別Statistics
  const _categoryStats = useMemo(() => {
    return analytics?.searchCategories || [];
  }, [analytics]);

  // GetTimeStatistics
  const _hourlyStats = useMemo(() => {
    return analytics?.searchesByHour || [];
  }, [analytics]);

  // Get性能指標
  const _performanceMetrics = useMemo(() => {
    return analytics?.performanceMetrics || null;
  }, [analytics]);

  // GetUserRow為Statistics
  const _userBehavior = useMemo(() => {
    return analytics?.userBehavior || null;
  }, [analytics]);

  // CheckYesNo有重要洞察
  const _hasCriticalInsights = useMemo(() => {
    // 洞察功能暫時不可用
    return false;
  }, []);

  // CheckYesNo有高優先級建議
  const _hasHighPriorityRecommendations = useMemo(() => {
    // 建議功能暫時不可用
    return false;
  }, []);

  // CheckAlertStatus
  const _activeAlerts = useMemo(() => {
    return alerts.filter(alert => alert.enabled);
  }, [alerts]);

  // Check實時性能
  const _isPerformanceGood = useMemo(() => {
    // 實時指標功能暫時不可用
    return true;
  }, []);

  // AutoInitialize
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initialize();
    }
  }, [isInitialized, isLoading, initialize]);

  // 定期Update實時指標
  useEffect(() => {
    if (!isInitialized) return;

    const _interval = setInterval(() => {
      if (analytics) {
        updateRealTimeAnalyticsMetrics({
          currentSearches: analytics.totalSearches,
          averageResponseTime: analytics.performanceMetrics.averageResponseTime,
          errorRate: analytics.errorRates.errorRate,
          throughput: analytics.performanceMetrics.throughput,
        });
      }
    }, 30000); // 每30SecondUpdate一次

    return () => clearInterval(interval);
  }, [isInitialized, analytics, updateRealTimeAnalyticsMetrics]);

  return {
    // Status
    analytics,
    isInitialized,
    isLoading,
    error,
    config,
    alerts,
    reports,

    // 計算Property
    statistics,
    popularSearches,
    trendingSearches,
    categoryStats,
    hourlyStats,
    performanceMetrics,
    userBehavior,
    hasCriticalInsights,
    hasHighPriorityRecommendations,
    activeAlerts,
    isPerformanceGood,

    // OperationMethod
    initialize,
    getAnalytics,
    generateAnalyticsReport,
    exportAnalyticsData,
    createAnalyticsAlert,
    updateAnalyticsAlert,
    deleteAnalyticsAlert,
    setAnalyticsFilter,
    clearAnalyticsFilter,
    updateAnalyticsConfig,
    clearAnalyticsError,
    setCurrentAnalyticsReport,
    deleteAnalyticsReport,
    trackSearchEvent,
    updateRealTimeAnalyticsMetrics,
  };
};

// 簡化的 Hook 用於基本Analysis功能
export const _useBasicSearchAnalytics = () => {
  const {
    analytics,
    isInitialized,
    isLoading,
    error,
    statistics,
    popularSearches,
    trendingSearches,
    categoryStats,
    performanceMetrics,
    initialize,
    getAnalytics,
    trackSearchEvent,
  } = useSearchAnalytics();

  return {
    analytics,
    isInitialized,
    isLoading,
    error,
    statistics,
    popularSearches,
    trendingSearches,
    categoryStats,
    performanceMetrics,
    initialize,
    getAnalytics,
    trackSearchEvent,
  };
};

// 專門用於AlertManage的 Hook
export const _useSearchAnalyticsAlerts = () => {
  const {
    alerts,
    activeAlerts,
    createAnalyticsAlert,
    updateAnalyticsAlert,
    deleteAnalyticsAlert,
  } = useSearchAnalytics();

  return {
    alerts,
    activeAlerts,
    createAlert: createAnalyticsAlert,
    updateAlert: updateAnalyticsAlert,
    deleteAlert: deleteAnalyticsAlert,
  };
};

// 專門用於ReportManage的 Hook
export const _useSearchAnalyticsReports = () => {
  const {
    reports,
    generateAnalyticsReport,
    exportAnalyticsData,
    setCurrentAnalyticsReport,
    deleteAnalyticsReport,
  } = useSearchAnalytics();

  return {
    reports,
    currentReport: null, // 暫時設為 null，Await實現
    generateReport: generateAnalyticsReport,
    exportData: exportAnalyticsData,
    setCurrentReport: setCurrentAnalyticsReport,
    deleteReport: deleteAnalyticsReport,
  };
};
