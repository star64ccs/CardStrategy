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

export const _useContentRecommendation = () => {
  const _dispatch = useDispatch<AppDispatch>();
  const {
    recommendations,
    config,
    stats,
    // userPreferences,
    // isLoading,
    error,
  } = useSelector((state: RootState) => state.contentRecommendation);

  // LocalStatus
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

  // 計算Property
  const _hasRecommendations = useMemo(
    () => recommendations && recommendations.length > 0,
    [recommendations]
  );
  const _hasSimilarContent = useMemo(
    () => similarContent && similarContent.length > 0,
    [similarContent]
  );
  const _averageScore = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return 0;
    const _total = recommendations.reduce(
      (sum, rec) => sum + (rec.score || 0),
      0
    );
    return total / recommendations.length;
  }, [recommendations]);
  const _hasNextPage = useMemo(
    () => pagination.page * pagination.pageSize < pagination.total,
    [pagination]
  );
  const _hasPreviousPage = useMemo(() => pagination.page > 1, [pagination]);
  const _isFirstPage = useMemo(() => pagination.page === 1, [pagination]);
  const _isLastPage = useMemo(() => !hasNextPage, [hasNextPage]);
  const _hasPerformanceMetrics = useMemo(
    () => performanceMetrics !== null,
    [performanceMetrics]
  );
  const _accuracyScore = useMemo(
    () => performanceMetrics?.accuracy || 0,
    [performanceMetrics]
  );
  const _precisionScore = useMemo(
    () => performanceMetrics?.precision || 0,
    [performanceMetrics]
  );
  const _recallScore = useMemo(
    () => performanceMetrics?.recall || 0,
    [performanceMetrics]
  );
  const _f1Score = useMemo(
    () => performanceMetrics?.f1Score || 0,
    [performanceMetrics]
  );
  const _isStale = useMemo(() => {
    if (!lastUpdated) return true;
    const _now = new Date();
    const _diff = now.getTime() - lastUpdated.getTime();
    return diff > 5 * 60 * 1000; // 5Minute
  }, [lastUpdated]);
  const _timeSinceLastUpdate = useMemo(() => {
    if (!lastUpdated) return null;
    const _now = new Date();
    const _diff = now.getTime() - lastUpdated.getTime();
    return Math.floor(diff / 1000);
  }, [lastUpdated]);
  const _isConfigured = useMemo(() => config !== null, [config]);
  const _isEnabled = useMemo(() => config?.enabled || false, [config]);
  const _hasCache = useMemo(
    () => stats?.performanceMetrics !== undefined,
    [stats]
  );
  const _hasStats = useMemo(() => stats !== null, [stats]);
  const _totalRecommendations = useMemo(
    () => recommendations?.length || 0,
    [recommendations]
  );
  const _totalUsers = useMemo(() => stats?.totalUsers || 0, [stats]);
  const _totalContent = useMemo(() => stats?.totalContent || 0, [stats]);
  const _recommendationCount = useMemo(
    () => recommendations?.length || 0,
    [recommendations]
  );
  const _similarContentCount = useMemo(
    () => similarContent?.length || 0,
    [similarContent]
  );
  const _totalPages = useMemo(
    () => Math.ceil(pagination.total / pagination.pageSize),
    [pagination]
  );
  const _isLoading = useMemo(
    () => Object.values(loading).some(Boolean),
    [loading]
  );
  const _hasError = useMemo(() => error !== null, [error]);

  // UpdateUserPreferences
  const _updatePreference = useCallback(
    async (userId: string, preference: Partial<UserPreference>) => {
      try {
        await (
          dispatch(updateUserPreference({ userId, preference })) as any
        ).unwrap();
        return true;
      } catch (error) {
        console.error('Update用戶偏好Failed:', error);
        return false;
      }
    },
    [dispatch]
  );

  // RecordUser互動
  const _recordInteraction = useCallback(
    async (userId: string, contentId: string, interaction: unknown) => {
      try {
        await (
          dispatch(
            recordUserInteraction({ userId, contentId, interaction })
          ) as any
        ).unwrap();
        return true;
      } catch (error) {
        console.error('記錄用戶互動Failed:', error);
        return false;
      }
    },
    [dispatch]
  );

  // Get推薦Configure
  const _fetchConfig = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, config: true }));
      const _response = await (
        dispatch(getContentRecommendationConfig()) as any
      ).unwrap();
      return response;
    } catch (error) {
      console.error('Get推薦ConfigureFailed:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, config: false }));
    }
  }, [dispatch]);

  // Update推薦Configure
  const _updateConfig = useCallback(
    async (config: Partial<ContentRecommendationConfig>) => {
      try {
        await (
          dispatch(updateContentRecommendationConfig(config)) as any
        ).unwrap();
        return true;
      } catch (error) {
        console.error('Update推薦ConfigureFailed:', error);
        return false;
      }
    },
    [dispatch]
  );

  // Get推薦Statistics
  const _fetchStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const _response = await (
        dispatch(getContentRecommendationStats()) as any
      ).unwrap();
      return response;
    } catch (error) {
      console.error('Get推薦統計Failed:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [dispatch]);

  // ClearError
  const _clearError = useCallback(() => {
    // 暫時Comment掉，Await實現
  }, []);

  // Initialize
  const _initialize = useCallback(async () => {
    try {
      await fetchConfig();
      await fetchStats();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('InitializeFailed:', error);
    }
  }, [fetchConfig, fetchStats]);

  // Get推薦
  const _fetchRecommendations = useCallback(
    async (userId: string, options?: unknown) => {
      try {
        setLoading(prev => ({ ...prev, recommendations: true }));
        // 模擬Get推薦
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Get推薦Failed:', error);
      } finally {
        setLoading(prev => ({ ...prev, recommendations: false }));
      }
    },
    []
  );

  // Get相似Content
  const _fetchSimilarContent = useCallback(
    async (contentId: string, options?: unknown) => {
      try {
        setLoading(prev => ({ ...prev, similarContent: true }));
        // 模擬Get相似Content
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Get相似內容Failed:', error);
      } finally {
        setLoading(prev => ({ ...prev, similarContent: false }));
      }
    },
    []
  );

  // Reset
  const _reset = useCallback(() => {
    setSimilarContent([]);
    setPerformanceMetrics(null);
    setLastUpdated(null);
    setFiltersState({});
    setOptionsState({});
    setPaginationState({ page: 1, pageSize: 10, total: 0 });
  }, []);

  // SettingsFilter器
  const _setFilters = useCallback((newFilters: unknown) => {
    setFiltersState(newFilters);
  }, []);

  // SettingsOptions
  const _setOptions = useCallback((newOptions: unknown) => {
    setOptionsState(newOptions);
  }, []);

  // SettingsPaginate
  const _setPagination = useCallback((newPagination: unknown) => {
    setPaginationState(newPagination);
  }, []);

  // 快速OperationMethod
  const _getRecommendationsForUser = useCallback(
    (userId: string) => {
      return fetchRecommendations(userId);
    },
    [fetchRecommendations]
  );

  const _getSimilarForContent = useCallback(
    (contentId: string) => {
      return fetchSimilarContent(contentId);
    },
    [fetchSimilarContent]
  );

  const _recordView = useCallback(
    (userId: string, contentId: string) => {
      return recordInteraction(userId, contentId, {
        type: 'view',
        timestamp: new Date(),
      });
    },
    [recordInteraction]
  );

  const _recordLike = useCallback(
    (userId: string, contentId: string) => {
      return recordInteraction(userId, contentId, {
        type: 'like',
        timestamp: new Date(),
      });
    },
    [recordInteraction]
  );

  const _recordShare = useCallback(
    (userId: string, contentId: string) => {
      return recordInteraction(userId, contentId, {
        type: 'share',
        timestamp: new Date(),
      });
    },
    [recordInteraction]
  );

  const _recordBookmark = useCallback(
    (userId: string, contentId: string) => {
      return recordInteraction(userId, contentId, {
        type: 'bookmark',
        timestamp: new Date(),
      });
    },
    [recordInteraction]
  );

  const _recordRating = useCallback(
    (userId: string, contentId: string, rating: number) => {
      return recordInteraction(userId, contentId, {
        type: 'rating',
        value: rating,
        timestamp: new Date(),
      });
    },
    [recordInteraction]
  );

  const _updateUserPreferences = useCallback(
    (userId: string, preferences: Partial<UserPreference>) => {
      return updatePreference(userId, preferences);
    },
    [updatePreference]
  );

  const _goToPage = useCallback((page: number) => {
    setPaginationState(prev => ({ ...prev, page }));
  }, []);

  const _setPageSize = useCallback((pageSize: number) => {
    setPaginationState(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const _clearAllErrors = useCallback(() => {
    clearError();
  }, [clearError]);

  const _refresh = useCallback(() => {
    initialize();
  }, [initialize]);

  return {
    // Status
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

    // 計算Property
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

    // OperationMethod
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

    // 快速Operation
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
