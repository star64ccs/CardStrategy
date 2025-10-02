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
 * 用戶行為分析 Hook
 * 提供完整的用戶行為分析功能
 */
export const useUserBehavior = () => {
  const dispatch = useAppDispatch();
  const userBehavior = useSelector(selectUserBehavior);
  const analysis = useSelector(selectAnalysis);
  const isInitialized = useSelector(selectIsInitialized);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const config = useSelector(selectConfig);
  const alerts = useSelector(selectAlerts);
  const recentEvents = useSelector(selectRecentEvents);
  const realTimeMetrics = useSelector(selectRealTimeMetrics);
  const insights = useSelector(selectInsights);
  const recommendations = useSelector(selectRecommendations);
  const currentReport = useSelector(selectCurrentReport);
  const reports = useSelector(selectReports);

  // 初始化
  const initialize = useCallback(async () => {
    return dispatch(initializeUserBehavior()).unwrap();
  }, [dispatch]);

  // 獲取行為分析
  const getAnalysis = useCallback(
    async (filter?: UserBehaviorFilter) => {
      return dispatch(getBehaviorAnalysis(filter)).unwrap();
    },
    [dispatch]
  );

  // 生成報告
  const generateReport = useCallback(
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

  // 導出數據
  const exportData = useCallback(
    async (
      analysis: UserBehaviorAnalysisResponse,
      options: UserBehaviorExportOptions
    ) => {
      return dispatch(exportBehaviorData({ analysis, options })).unwrap();
    },
    [dispatch]
  );

  // 創建警報
  const createAlert = useCallback(
    async (alert: Omit<UserBehaviorAlert, 'id' | 'triggerCount'>) => {
      return dispatch(createBehaviorAlert(alert)).unwrap();
    },
    [dispatch]
  );

  // 更新警報
  const updateAlert = useCallback(
    async (alertId: string, updates: Partial<UserBehaviorAlert>) => {
      return dispatch(updateBehaviorAlert({ alertId, updates })).unwrap();
    },
    [dispatch]
  );

  // 刪除警報
  const deleteAlert = useCallback(
    async (alertId: string) => {
      return dispatch(deleteBehaviorAlert(alertId)).unwrap();
    },
    [dispatch]
  );

  // 獲取用戶畫像
  const getUserProfileData = useCallback(
    async (userId: string) => {
      return dispatch(getUserProfile(userId)).unwrap();
    },
    [dispatch]
  );

  // 獲取用戶模式
  const getUserPatternsData = useCallback(
    async (userId: string) => {
      return dispatch(getUserPatterns(userId)).unwrap();
    },
    [dispatch]
  );

  // 獲取用戶指標
  const getUserMetricsData = useCallback(
    async (userId: string) => {
      return dispatch(getUserMetrics(userId)).unwrap();
    },
    [dispatch]
  );

  // 設置過濾器
  const setFilterData = useCallback(
    (filter: UserBehaviorFilter) => {
      dispatch(setFilter(filter));
    },
    [dispatch]
  );

  // 清除過濾器
  const clearFilterData = useCallback(() => {
    dispatch(clearFilter());
  }, [dispatch]);

  // 更新配置
  const updateConfigData = useCallback(
    (updates: Partial<UserBehaviorConfig>) => {
      dispatch(updateConfig(updates));
    },
    [dispatch]
  );

  // 添加事件
  const addEventData = useCallback(
    (event: UserBehaviorEvent) => {
      dispatch(addEvent(event));
    },
    [dispatch]
  );

  // 更新實時指標
  const updateRealTimeMetricsData = useCallback(
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

  // 設置洞察
  const setInsightsData = useCallback(
    (insights: unknown[]) => {
      dispatch(setInsights(insights));
    },
    [dispatch]
  );

  // 設置建議
  const setRecommendationsData = useCallback(
    (recommendations: unknown[]) => {
      dispatch(setRecommendations(recommendations));
    },
    [dispatch]
  );

  // 清除錯誤
  const clearErrorData = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 設置當前報告
  const setCurrentReportData = useCallback(
    (report: unknown) => {
      dispatch(setCurrentReport(report));
    },
    [dispatch]
  );

  // 添加報告
  const addReportData = useCallback(
    (report: unknown) => {
      dispatch(addReport(report));
    },
    [dispatch]
  );

  // 刪除報告
  const deleteReportData = useCallback(
    (reportId: string) => {
      dispatch(deleteReport(reportId));
    },
    [dispatch]
  );

  // 設置用戶畫像
  const setUserProfileData = useCallback(
    (userId: string, profile: unknown) => {
      dispatch(setUserProfile({ userId, profile }));
    },
    [dispatch]
  );

  // 設置用戶模式
  const setUserPatternsData = useCallback(
    (userId: string, patterns: unknown[]) => {
      dispatch(setUserPatterns({ userId, patterns }));
    },
    [dispatch]
  );

  // 設置用戶指標
  const setUserMetricsData = useCallback(
    (userId: string, metrics: unknown) => {
      dispatch(setUserMetrics({ userId, metrics }));
    },
    [dispatch]
  );

  // 自動初始化
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initialize();
    }
  }, [isInitialized, isLoading, initialize]);

  // 實時指標更新
  useEffect(() => {
    if (isInitialized && analysis) {
      const interval = setInterval(() => {
        // 模擬實時數據更新
        updateRealTimeMetricsData({
          activeUsers: Math.floor(Math.random() * 1000) + 100,
          averageSessionDuration: Math.floor(Math.random() * 300) + 120,
          conversionRate: Math.random() * 0.1 + 0.02,
          engagementScore: Math.random() * 100,
        });
      }, 30000); // 每30秒更新一次

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isInitialized, analysis, updateRealTimeMetricsData]);

  // 計算衍生數據
  const derivedData = useMemo(() => {
    if (!analysis) return null;

    const analysisData = analysis as any;

    return {
      // 用戶活躍度
      userActivity: {
        totalUsers: analysisData.stats?.totalUsers || 0,
        activeUsers: analysisData.stats?.activeUsers || 0,
        newUsers: analysisData.stats?.newUsers || 0,
        returningUsers: analysisData.stats?.returningUsers || 0,
        churnRate: analysisData.stats?.churnRate || 0,
      },

      // 行為模式
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

      // 事件統計
      eventStats: {
        totalEvents: analysisData.stats?.totalEvents || 0,
        eventsByType: analysisData.stats?.eventsByType || {},
        averageEventsPerUser: analysisData.stats?.averageEventsPerUser || 0,
        topEventTypes: Object.entries(analysisData.stats?.eventsByType || {})
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5),
      },

      // 時間分析
      timeAnalysis: {
        peakHours: analysisData.stats?.peakHours || [],
        averageSessionDuration: analysisData.stats?.averageSessionDuration || 0,
        sessionFrequency: analysisData.stats?.sessionFrequency || 0,
      },

      // 轉換分析
      conversionAnalysis: {
        conversionRate: analysisData.stats?.conversionRate || 0,
        conversionFunnel: analysisData.stats?.conversionFunnel || [],
        revenuePerUser: analysisData.stats?.revenuePerUser || 0,
      },
    };
  }, [analysis]);

  return {
    // 狀態
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

    // 操作
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

    // 衍生數據
    derivedData,
  };
};

/**
 * 基礎用戶行為分析 Hook
 * 提供基本的用戶行為分析功能
 */
export const useBasicUserBehavior = () => {
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
 * 用戶行為警報 Hook
 * 專門用於管理用戶行為警報
 */
export const useUserBehaviorAlerts = () => {
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
 * 用戶行為報告 Hook
 * 專門用於管理用戶行為報告
 */
export const useUserBehaviorReports = () => {
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
 * 用戶畫像 Hook
 * 專門用於管理用戶畫像數據
 */
export const useUserProfiles = () => {
  const {
    userBehavior,
    getUserProfile,
    getUserPatterns,
    getUserMetrics,
    setUserProfile,
    setUserPatterns,
    setUserMetrics,
  } = useUserBehavior();

  const getUserProfileData = useCallback(
    (userId: string) => {
      return userBehavior.userProfiles.get(userId);
    },
    [userBehavior.userProfiles]
  );

  const getUserPatternsData = useCallback(
    (userId: string) => {
      return userBehavior.userPatterns.get(userId) || [];
    },
    [userBehavior.userPatterns]
  );

  const getUserMetricsData = useCallback(
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
 * 實時用戶行為 Hook
 * 專門用於實時用戶行為監控
 */
export const useRealTimeUserBehavior = () => {
  const { realTimeMetrics, recentEvents, updateRealTimeMetrics, addEvent } =
    useUserBehavior();

  return {
    realTimeMetrics,
    recentEvents,
    updateRealTimeMetrics,
    addEvent,
  };
};
