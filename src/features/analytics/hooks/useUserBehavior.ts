import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  addEvent,
  addReport,
  clearError,
  clearFilter,
  createBehaviorAlert,
  deleteBehaviorAlert,
  deleteReport,
  exportBehaviorData,
  generateBehaviorReport,
  getBehaviorAnalysis,
  getUserMetrics,
  getUserPatterns,
  getUserProfile,
  initializeUserBehavior,
  selectAlerts,
  selectAnalysis,
  selectConfig,
  selectCurrentReport,
  selectError,
  selectInsights,
  selectIsInitialized,
  selectIsLoading,
  selectRealTimeMetrics,
  selectRecentEvents,
  selectRecommendations,
  selectReports,
  selectUserBehavior,
  setCurrentReport,
  setFilter,
  setInsights,
  setRecommendations,
  setUserMetrics,
  setUserPatterns,
  setUserProfile,
  updateBehaviorAlert,
  updateConfig,
  updateRealTimeMetrics,
} from '../../../store/slices/userBehaviorSlice';
import type {
  UserBehaviorAlert,
  UserBehaviorAnalysisResponse,
  UserBehaviorConfig,
  UserBehaviorEvent,
  UserBehaviorExportOptions,
  UserBehaviorFilter,
} from '../types/userBehavior';

/**
 * UserRow為Analysis Hook
 * 提供完整的UserRow為Analysis功能
 */
export const _useUserBehavior = () => {
  const _dispatch = useAppDispatch();
  const _userBehavior = useSelector(selectUserBehavior);
  const _analysis = useSelector(selectAnalysis);
  const _isInitialized = useSelector(selectIsInitialized);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);
  const _config = useSelector(selectConfig);
  const _alerts = useSelector(selectAlerts);
  const _recentEvents = useSelector(selectRecentEvents);
  const _realTimeMetrics = useSelector(selectRealTimeMetrics);
  const _insights = useSelector(selectInsights);
  const _recommendations = useSelector(selectRecommendations);
  const _currentReport = useSelector(selectCurrentReport);
  const _reports = useSelector(selectReports);

  // Initialize
  const _initialize = useCallback(async () => {
    return dispatch(initializeUserBehavior()).unwrap();
  }, [dispatch]);

  // GetRow為Analysis
  const _getAnalysis = useCallback(
    async (filter?: UserBehaviorFilter) => {
      return dispatch(getBehaviorAnalysis(filter)).unwrap();
    },
    [dispatch]
  );

  // 生成Report
  const _generateReport = useCallback(
    async (
      title: string,
      description: string,
      period: { start: number; end: number },
      filter?: UserBehaviorFilter
    ) => {
      return dispatch(
        generateBehaviorReport({
          title,
          description,
          period,
          filter,
        })
      ).unwrap();
    },
    [dispatch]
  );

  // ExportData
  const _exportData = useCallback(
    async (
      analysis: UserBehaviorAnalysisResponse,
      options: UserBehaviorExportOptions
    ) => {
      return dispatch(exportBehaviorData({ analysis, options })).unwrap();
    },
    [dispatch]
  );

  // CreateAlert
  const _createAlert = useCallback(
    async (alert: Omit<UserBehaviorAlert, 'id' | 'triggerCount'>) => {
      return dispatch(createBehaviorAlert(alert)).unwrap();
    },
    [dispatch]
  );

  // UpdateAlert
  const _updateAlert = useCallback(
    async (alertId: string, updates: Partial<UserBehaviorAlert>) => {
      return dispatch(updateBehaviorAlert({ alertId, updates })).unwrap();
    },
    [dispatch]
  );

  // DeleteAlert
  const _deleteAlert = useCallback(
    async (alertId: string) => {
      return dispatch(deleteBehaviorAlert(alertId)).unwrap();
    },
    [dispatch]
  );

  // GetUser畫像
  const _getUserProfileData = useCallback(
    async (userId: string) => {
      return dispatch(getUserProfile(userId)).unwrap();
    },
    [dispatch]
  );

  // GetUser模式
  const _getUserPatternsData = useCallback(
    async (userId: string) => {
      return dispatch(getUserPatterns(userId)).unwrap();
    },
    [dispatch]
  );

  // GetUser指標
  const _getUserMetricsData = useCallback(
    async (userId: string) => {
      return dispatch(getUserMetrics(userId)).unwrap();
    },
    [dispatch]
  );

  // SettingsFilter器
  const _setFilterData = useCallback(
    (filter: UserBehaviorFilter) => {
      dispatch(setFilter(filter));
    },
    [dispatch]
  );

  // ClearFilter器
  const _clearFilterData = useCallback(() => {
    dispatch(clearFilter());
  }, [dispatch]);

  // UpdateConfigure
  const _updateConfigData = useCallback(
    (updates: Partial<UserBehaviorConfig>) => {
      dispatch(updateConfig(updates));
    },
    [dispatch]
  );

  // AddEvent
  const _addEventData = useCallback(
    (event: UserBehaviorEvent) => {
      dispatch(addEvent(event));
    },
    [dispatch]
  );

  // Update實時指標
  const _updateRealTimeMetricsData = useCallback(
    (metrics: {
      activeUsers: number;
      averageSessionDuration: number;
      conversionRate: number;
      engagementScore: number;
    }) => {
      dispatch(updateRealTimeMetrics(metrics));
    },
    [dispatch]
  );

  // Settings洞察
  const _setInsightsData = useCallback(
    (insights: unknown[]) => {
      dispatch(setInsights(insights));
    },
    [dispatch]
  );

  // Settings建議
  const _setRecommendationsData = useCallback(
    (recommendations: unknown[]) => {
      dispatch(setRecommendations(recommendations));
    },
    [dispatch]
  );

  // ClearError
  const _clearErrorData = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Settings當前Report
  const _setCurrentReportData = useCallback(
    (report: unknown) => {
      dispatch(setCurrentReport(report));
    },
    [dispatch]
  );

  // AddReport
  const _addReportData = useCallback(
    (report: unknown) => {
      dispatch(addReport(report));
    },
    [dispatch]
  );

  // DeleteReport
  const _deleteReportData = useCallback(
    (reportId: string) => {
      dispatch(deleteReport(reportId));
    },
    [dispatch]
  );

  // SettingsUser畫像
  const _setUserProfileData = useCallback(
    (userId: string, profile: unknown) => {
      dispatch(setUserProfile({ userId, profile }));
    },
    [dispatch]
  );

  // SettingsUser模式
  const _setUserPatternsData = useCallback(
    (userId: string, patterns: unknown[]) => {
      dispatch(setUserPatterns({ userId, patterns }));
    },
    [dispatch]
  );

  // SettingsUser指標
  const _setUserMetricsData = useCallback(
    (userId: string, metrics: unknown) => {
      dispatch(setUserMetrics({ userId, metrics }));
    },
    [dispatch]
  );

  // AutoInitialize
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initialize();
    }
  }, [isInitialized, isLoading, initialize]);

  // 實時指標Update
  useEffect(() => {
    if (isInitialized && analysis) {
      const _interval = setInterval(() => {
        // 模擬實時DataUpdate
        updateRealTimeMetricsData({
          activeUsers: Math.floor(Math.random() * 1000) + 100,
          averageSessionDuration: Math.floor(Math.random() * 300) + 120,
          conversionRate: Math.random() * 0.1 + 0.02,
          engagementScore: Math.random() * 100,
        });
      }, 30000); // 每30SecondUpdate一次

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isInitialized, analysis, updateRealTimeMetricsData]);

  // 計算衍生Data
  const _derivedData = useMemo(() => {
    if (!analysis) return null;

    const _analysisData = analysis as any;

    return {
      // User活躍度
      userActivity: {
        totalUsers: analysisData.stats?.totalUsers || 0,
        activeUsers: analysisData.stats?.activeUsers || 0,
        newUsers: analysisData.stats?.newUsers || 0,
        returningUsers: analysisData.stats?.returningUsers || 0,
        churnRate: analysisData.stats?.churnRate || 0,
      },

      // Row為模式
      behaviorPatterns: {
        totalPatterns: analysisData.patterns?.length || 0,
        topPatterns: analysisData.patterns?.slice(0, 5) || [],
        patternCategories:
          analysisData.patterns?.reduce(
            (acc: unknown, pattern: unknown) => {
              acc[pattern.category] = (acc[pattern.category] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          ) || {},
      },

      // EventStatistics
      eventStats: {
        totalEvents: analysisData.stats?.totalEvents || 0,
        eventsByType: analysisData.stats?.eventsByType || {},
        averageEventsPerUser: analysisData.stats?.averageEventsPerUser || 0,
        topEventTypes: Object.entries(analysisData.stats?.eventsByType || {})
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5),
      },

      // TimeAnalysis
      timeAnalysis: {
        peakHours: analysisData.stats?.peakHours || [],
        averageSessionDuration: analysisData.stats?.averageSessionDuration || 0,
        sessionFrequency: analysisData.stats?.sessionFrequency || 0,
      },

      // ConvertAnalysis
      conversionAnalysis: {
        conversionRate: analysisData.stats?.conversionRate || 0,
        conversionFunnel: analysisData.stats?.conversionFunnel || [],
        revenuePerUser: analysisData.stats?.revenuePerUser || 0,
      },
    };
  }, [analysis]);

  return {
    // Status
    userBehavior,
    analysis,
    isInitialized,
    isLoading,
    error,
    config,
    alerts,
    recentEvents,
    realTimeMetrics,
    insights,
    recommendations,
    currentReport,
    reports,

    // Operation
    initialize,
    getAnalysis,
    generateReport,
    exportData,
    createAlert,
    updateAlert,
    deleteAlert,
    getUserProfile: getUserProfileData,
    getUserPatterns: getUserPatternsData,
    getUserMetrics: getUserMetricsData,
    setFilter: setFilterData,
    clearFilter: clearFilterData,
    updateConfig: updateConfigData,
    addEvent: addEventData,
    updateRealTimeMetrics: updateRealTimeMetricsData,
    setInsights: setInsightsData,
    setRecommendations: setRecommendationsData,
    clearError: clearErrorData,
    setCurrentReport: setCurrentReportData,
    addReport: addReportData,
    deleteReport: deleteReportData,
    setUserProfile: setUserProfileData,
    setUserPatterns: setUserPatternsData,
    setUserMetrics: setUserMetricsData,

    // 衍生Data
    derivedData,
  };
};

/**
 * 基礎UserRow為Analysis Hook
 * 提供基本的UserRow為Analysis功能
 */
export const _useBasicUserBehavior = () => {
  const { analysis, isInitialized, isLoading, error, getAnalysis, initialize } =
    useUserBehavior();

  return {
    analysis,
    isInitialized,
    isLoading,
    error,
    getAnalysis,
    initialize,
  };
};

/**
 * UserRow為Alert Hook
 * 專門用於ManageUserRow為Alert
 */
export const _useUserBehaviorAlerts = () => {
  const { alerts, isLoading, createAlert, updateAlert, deleteAlert } =
    useUserBehavior();

  return {
    alerts,
    isLoading,
    createAlert,
    updateAlert,
    deleteAlert,
  };
};

/**
 * UserRow為Report Hook
 * 專門用於ManageUserRow為Report
 */
export const _useUserBehaviorReports = () => {
  const {
    reports,
    currentReport,
    isLoading,
    generateReport,
    exportData,
    setCurrentReport,
    addReport,
    deleteReport,
  } = useUserBehavior();

  return {
    reports,
    currentReport,
    isLoading,
    generateReport,
    exportData,
    setCurrentReport,
    addReport,
    deleteReport,
  };
};

/**
 * User畫像 Hook
 * 專門用於ManageUser畫像Data
 */
export const _useUserProfiles = () => {
  const {
    userBehavior,
    getUserProfile,
    getUserPatterns,
    getUserMetrics,
    setUserProfile,
    setUserPatterns,
    setUserMetrics,
  } = useUserBehavior();

  const _getUserProfileData = useCallback(
    (userId: string) => {
      return userBehavior.userProfiles.get(userId);
    },
    [userBehavior.userProfiles]
  );

  const _getUserPatternsData = useCallback(
    (userId: string) => {
      return userBehavior.userPatterns.get(userId) || [];
    },
    [userBehavior.userPatterns]
  );

  const _getUserMetricsData = useCallback(
    (userId: string) => {
      return userBehavior.userMetrics.get(userId);
    },
    [userBehavior.userMetrics]
  );

  return {
    getUserProfile,
    getUserPatterns,
    getUserMetrics,
    getUserProfileData,
    getUserPatternsData,
    getUserMetricsData,
    setUserProfile,
    setUserPatterns,
    setUserMetrics,
  };
};

/**
 * 實時UserRow為 Hook
 * 專門用於實時UserRow為Monitor
 */
export const _useRealTimeUserBehavior = () => {
  const { realTimeMetrics, recentEvents, updateRealTimeMetrics, addEvent } =
    useUserBehavior();

  return {
    realTimeMetrics,
    recentEvents,
    updateRealTimeMetrics,
    addEvent,
  };
};
