import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../../../store';
import {
  getContentRecommendationConfig,
  getContentRecommendationStats,
  recordUserInteraction,
  updateContentRecommendationConfig,
  updateUserPreference,
} from '../../../store/slices/contentRecommendationSlice';
import type {
  ContentRecommendation,
  ContentRecommendationConfig,
  UserPreference,
} from '../types/contentRecommendation';
import { UserInteraction } from '../types/contentRecommendation';

export const useContentRecommendation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    recommendations,
    config,
    stats,
    // userPreferences,
    // isLoading,
    error,
  } = useSelector((state: RootState) => state.contentRecommendation);

  // 本地狀態
  const [loading, setLoading] = useState({
    recommendations: false,
    similarContent: false,
    config: false,
    stats: false,
  });
  const [similarContent, setSimilarContent] = useState<ContentRecommendation[]>(
    []
  );
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFiltersState] = useState<any>({});
  const [options, setOptionsState] = useState<any>({});
  const [pagination, setPaginationState] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // 計算屬性
  const hasRecommendations = useMemo(
    () => recommendations && recommendations.length > 0,
    [recommendations]
  );
  const hasSimilarContent = useMemo(
    () => similarContent && similarContent.length > 0,
    [similarContent]
  );
  const averageScore = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return 0;
    const total = recommendations.reduce(
      (sum, rec) => sum + (rec.score || 0),
      0
    );
    return total / recommendations.length;
  }, [recommendations]);
  const hasNextPage = useMemo(
    () => pagination.page * pagination.pageSize < pagination.total,
    [pagination]
  );
  const hasPreviousPage = useMemo(() => pagination.page > 1, [pagination]);
  const isFirstPage = useMemo(() => pagination.page === 1, [pagination]);
  const isLastPage = useMemo(() => !hasNextPage, [hasNextPage]);
  const hasPerformanceMetrics = useMemo(
    () => performanceMetrics !== null,
    [performanceMetrics]
  );
  const accuracyScore = useMemo(
    () => performanceMetrics?.accuracy || 0,
    [performanceMetrics]
  );
  const precisionScore = useMemo(
    () => performanceMetrics?.precision || 0,
    [performanceMetrics]
  );
  const recallScore = useMemo(
    () => performanceMetrics?.recall || 0,
    [performanceMetrics]
  );
  const f1Score = useMemo(
    () => performanceMetrics?.f1Score || 0,
    [performanceMetrics]
  );
  const isStale = useMemo(() => {
    if (!lastUpdated) return true;
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    return diff > 5 * 60 * 1000; // 5分鐘
  }, [lastUpdated]);
  const timeSinceLastUpdate = useMemo(() => {
    if (!lastUpdated) return null;
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    return Math.floor(diff / 1000);
  }, [lastUpdated]);
  const isConfigured = useMemo(() => config !== null, [config]);
  const isEnabled = useMemo(() => config?.enabled || false, [config]);
  const hasCache = useMemo(
    () => stats?.performanceMetrics !== undefined,
    [stats]
  );
  const hasStats = useMemo(() => stats !== null, [stats]);
  const totalRecommendations = useMemo(
    () => recommendations?.length || 0,
    [recommendations]
  );
  const totalUsers = useMemo(() => stats?.totalUsers || 0, [stats]);
  const totalContent = useMemo(() => stats?.totalContent || 0, [stats]);
  const recommendationCount = useMemo(
    () => recommendations?.length || 0,
    [recommendations]
  );
  const similarContentCount = useMemo(
    () => similarContent?.length || 0,
    [similarContent]
  );
  const totalPages = useMemo(
    () => Math.ceil(pagination.total / pagination.pageSize),
    [pagination]
  );
  const isLoading = useMemo(
    () => Object.values(loading).some(Boolean),
    [loading]
  );
  const hasError = useMemo(() => error !== null, [error]);

  // 更新用戶偏好
  const updatePreference = useCallback(
    async (userId: string, preference: Partial<UserPreference>) => {
      try {
        await (
          dispatch(updateUserPreference({ userId, preference })) as any
        ).unwrap();
        return true;
      } catch (error) {
        console.error('更新用戶偏好失敗:', error);
        return false;
      }
    },
    [dispatch]
  );

  // 記錄用戶互動
  const recordInteraction = useCallback(
    async (userId: string, contentId: string, interaction: unknown) => {
      try {
        await (
          dispatch(
            recordUserInteraction({ userId, contentId, interaction })
          ) as any
        ).unwrap();
        return true;
      } catch (error) {
        console.error('記錄用戶互動失敗:', error);
        return false;
      }
    },
    [dispatch]
  );

  // 獲取推薦配置
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, config: true }));
      const response = await (
        dispatch(getContentRecommendationConfig()) as any
      ).unwrap();
      return response;
    } catch (error) {
      console.error('獲取推薦配置失敗:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, config: false }));
    }
  }, [dispatch]);

  // 更新推薦配置
  const updateConfig = useCallback(
    async (config: Partial<ContentRecommendationConfig>) => {
      try {
        await (
          dispatch(updateContentRecommendationConfig(config)) as any
        ).unwrap();
        return true;
      } catch (error) {
        console.error('更新推薦配置失敗:', error);
        return false;
      }
    },
    [dispatch]
  );

  // 獲取推薦統計
  const fetchStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await (
        dispatch(getContentRecommendationStats()) as any
      ).unwrap();
      return response;
    } catch (error) {
      console.error('獲取推薦統計失敗:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [dispatch]);

  // 清除錯誤
  const clearError = useCallback(() => {
    // 暫時註釋掉，等待實現
  }, []);

  // 初始化
  const initialize = useCallback(async () => {
    try {
      await fetchConfig();
      await fetchStats();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('初始化失敗:', error);
    }
  }, [fetchConfig, fetchStats]);

  // 獲取推薦
  const fetchRecommendations = useCallback(
    async (userId: string, options?: unknown) => {
      try {
        setLoading(prev => ({ ...prev, recommendations: true }));
        // 模擬獲取推薦
        setLastUpdated(new Date());
      } catch (error) {
        console.error('獲取推薦失敗:', error);
      } finally {
        setLoading(prev => ({ ...prev, recommendations: false }));
      }
    },
    []
  );

  // 獲取相似內容
  const fetchSimilarContent = useCallback(
    async (contentId: string, options?: unknown) => {
      try {
        setLoading(prev => ({ ...prev, similarContent: true }));
        // 模擬獲取相似內容
        setLastUpdated(new Date());
      } catch (error) {
        console.error('獲取相似內容失敗:', error);
      } finally {
        setLoading(prev => ({ ...prev, similarContent: false }));
      }
    },
    []
  );

  // 重置
  const reset = useCallback(() => {
    setSimilarContent([]);
    setPerformanceMetrics(null);
    setLastUpdated(null);
    setFiltersState({});
    setOptionsState({});
    setPaginationState({ page: 1, pageSize: 10, total: 0 });
  }, []);

  // 設置過濾器
  const setFilters = useCallback((newFilters: unknown) => {
    setFiltersState(newFilters);
  }, []);

  // 設置選項
  const setOptions = useCallback((newOptions: unknown) => {
    setOptionsState(newOptions);
  }, []);

  // 設置分頁
  const setPagination = useCallback((newPagination: unknown) => {
    setPaginationState(newPagination);
  }, []);

  // 快速操作方法
  const getRecommendationsForUser = useCallback(
    (userId: string) => {
      return fetchRecommendations(userId);
    },
    [fetchRecommendations]
  );

  const getSimilarForContent = useCallback(
    (contentId: string) => {
      return fetchSimilarContent(contentId);
    },
    [fetchSimilarContent]
  );

  const recordView = useCallback(
    (userId: string, contentId: string) => {
      return recordInteraction(userId, contentId, {
        type: 'view',
        timestamp: new Date(),
      });
    },
    [recordInteraction]
  );

  const recordLike = useCallback(
    (userId: string, contentId: string) => {
      return recordInteraction(userId, contentId, {
        type: 'like',
        timestamp: new Date(),
      });
    },
    [recordInteraction]
  );

  const recordShare = useCallback(
    (userId: string, contentId: string) => {
      return recordInteraction(userId, contentId, {
        type: 'share',
        timestamp: new Date(),
      });
    },
    [recordInteraction]
  );

  const recordBookmark = useCallback(
    (userId: string, contentId: string) => {
      return recordInteraction(userId, contentId, {
        type: 'bookmark',
        timestamp: new Date(),
      });
    },
    [recordInteraction]
  );

  const recordRating = useCallback(
    (userId: string, contentId: string, rating: number) => {
      return recordInteraction(userId, contentId, {
        type: 'rating',
        value: rating,
        timestamp: new Date(),
      });
    },
    [recordInteraction]
  );

  const updateUserPreferences = useCallback(
    (userId: string, preferences: Partial<UserPreference>) => {
      return updatePreference(userId, preferences);
    },
    [updatePreference]
  );

  const goToPage = useCallback((page: number) => {
    setPaginationState(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPaginationState(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const clearAllErrors = useCallback(() => {
    clearError();
  }, [clearError]);

  const refresh = useCallback(() => {
    initialize();
  }, [initialize]);

  return {
    // 狀態
    recommendations,
    similarContent,
    config,
    stats,
    loading,
    error,
    performanceMetrics,
    lastUpdated,
    isLoading,
    hasError,
    totalPages,
    recommendationCount,
    similarContentCount,

    // 計算屬性
    hasRecommendations,
    hasSimilarContent,
    averageScore,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
    hasPerformanceMetrics,
    accuracyScore,
    precisionScore,
    recallScore,
    f1Score,
    isStale,
    timeSinceLastUpdate,
    isConfigured,
    isEnabled,
    hasCache,
    hasStats,
    totalRecommendations,
    totalUsers,
    totalContent,

    // 操作方法
    initialize,
    fetchRecommendations,
    fetchSimilarContent,
    updatePreference,
    recordInteraction,
    fetchConfig,
    updateConfig,
    fetchStats,
    reset,
    setFilters,
    setOptions,
    setPagination,
    clearError,

    // 快速操作
    getRecommendationsForUser,
    getSimilarForContent,
    recordView,
    recordLike,
    recordShare,
    recordBookmark,
    recordRating,
    updateUserPreferences,
    goToPage,
    setPageSize,
    clearAllErrors,
    refresh,
  };
};
