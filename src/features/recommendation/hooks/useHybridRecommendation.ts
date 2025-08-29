import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../../../store';
import {
  getHybridRecommendationConfig,
  getHybridRecommendationStats,
  getHybridRecommendations,
  initializeHybridRecommendation,
  recordRecommendationClick,
  recordRecommendationRating,
  updateHybridRecommendationConfig,
} from '../../../store/slices/hybridRecommendationSlice';
import type {
  GetHybridRecommendationsRequest,
  HybridAlgorithm,
  HybridRecommendation,
  HybridRecommendationConfig,
  HybridWeights,
} from '../types/hybridRecommendation';

export const _useHybridRecommendation = () => {
  const _dispatch = useDispatch<AppDispatch>();
  const {
    recommendations,
    config,
    stats,
    // isLoading,
    error,
  } = useSelector((state: RootState) => state.hybridRecommendation);

  // 本地狀態
  const [loading, setLoading] = useState({
    recommendations: false,
    config: false,
    stats: false,
  });
  const [filters, setFiltersState] = useState<any>({});
  const [options, setOptionsState] = useState<any>({});
  const [pagination, setPaginationState] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [performance, setPerformance] = useState<any>(null);

  // 初始化
  const _initialize = useCallback(async () => {
    try {
      await (dispatch(initializeHybridRecommendation()) as any).unwrap();
      return true;
    } catch (error) {
      console.error('混合推薦初始化失敗:', error);
      return false;
    }
  }, [dispatch]);

  // 獲取推薦
  const _getRecommendations = useCallback(
    async (request: GetHybridRecommendationsRequest) => {
      try {
        setLoading(prev => ({ ...prev, recommendations: true }));
        await (dispatch(getHybridRecommendations(request)) as any).unwrap();
        return true;
      } catch (error) {
        console.error('獲取混合推薦失敗:', error);
        return false;
      } finally {
        setLoading(prev => ({ ...prev, recommendations: false }));
      }
    },
    [dispatch]
  );

  // 記錄點擊
  const _recordClick = useCallback(
    async (userId: string, recommendation: HybridRecommendation) => {
      try {
        await (
          dispatch(recordRecommendationClick({ userId, recommendation })) as any
        ).unwrap();
        return true;
      } catch (error) {
        console.error('記錄推薦點擊失敗:', error);
        return false;
      }
    },
    [dispatch]
  );

  // 記錄評分
  const _recordRating = useCallback(
    async (
      userId: string,
      recommendation: HybridRecommendation,
      rating: number
    ) => {
      try {
        await (
          dispatch(
            recordRecommendationRating({ userId, recommendation, rating })
          ) as any
        ).unwrap();
        return true;
      } catch (error) {
        console.error('記錄推薦評分失敗:', error);
        return false;
      }
    },
    [dispatch]
  );

  // 獲取配置
  const _fetchConfig = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, config: true }));
      await (dispatch(getHybridRecommendationConfig()) as any).unwrap();
      return true;
    } catch (error) {
      console.error('獲取混合推薦配置失敗:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, config: false }));
    }
  }, [dispatch]);

  // 更新配置
  const _updateConfig = useCallback(
    async (config: Partial<HybridRecommendationConfig>) => {
      try {
        await (
          dispatch(updateHybridRecommendationConfig(config)) as any
        ).unwrap();
        return true;
      } catch (error) {
        console.error('更新混合推薦配置失敗:', error);
        return false;
      }
    },
    [dispatch]
  );

  // 獲取統計
  const _fetchStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      await (dispatch(getHybridRecommendationStats()) as any).unwrap();
      return true;
    } catch (error) {
      console.error('獲取混合推薦統計失敗:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [dispatch]);

  // 設置過濾器
  const _setFilters = useCallback((newFilters: unknown) => {
    setFiltersState(newFilters);
  }, []);

  // 設置選項
  const _setOptions = useCallback((newOptions: unknown) => {
    setOptionsState(newOptions);
  }, []);

  // 清除錯誤
  const _clearError = useCallback(() => {
    // 暫時註釋掉，等待實現
  }, []);

  // 獲取用戶推薦
  const _getRecommendationsForUser = useCallback(
    (userId: string, limit?: number) => {
      return getRecommendations({ userId, limit: limit || 10 });
    },
    [getRecommendations]
  );

  // 點擊推薦
  const _clickRecommendation = useCallback(
    (userId: string, recommendation: HybridRecommendation) => {
      return recordClick(userId, recommendation);
    },
    [recordClick]
  );

  // 評分推薦
  const _rateRecommendation = useCallback(
    (userId: string, recommendation: HybridRecommendation, rating: number) => {
      return recordRating(userId, recommendation, rating);
    },
    [recordRating]
  );

  // 設置算法
  const _setAlgorithm = useCallback(
    (algorithm: HybridAlgorithm) => {
      return updateConfig({ algorithm });
    },
    [updateConfig]
  );

  // 設置權重
  const _setWeights = useCallback(
    (weights: HybridWeights) => {
      return updateConfig({ weights });
    },
    [updateConfig]
  );

  // 按類別過濾
  const _filterByCategory = useCallback((category: string) => {
    setFiltersState((prev: unknown) => ({ ...prev, category }));
  }, []);

  // 按分數排序
  const _sortByScore = useCallback((ascending = false) => {
    setOptionsState((prev: unknown) => ({ ...prev, sortBy: 'score', ascending }));
  }, []);

  // 啟用多樣性
  const _enableDiversity = useCallback((enabled = true) => {
    setOptionsState((prev: unknown) => ({ ...prev, diversity: enabled }));
  }, []);

  // 啟用新穎性
  const _enableNovelty = useCallback((enabled = true) => {
    setOptionsState((prev: unknown) => ({ ...prev, novelty: enabled }));
  }, []);

  // 下一頁
  const _nextPage = useCallback(() => {
    setPaginationState(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  // 上一頁
  const _prevPage = useCallback(() => {
    setPaginationState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  // 刷新
  const _refresh = useCallback(() => {
    fetchConfig();
    fetchStats();
  }, [fetchConfig, fetchStats]);

  // 清除過濾器
  const _clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  // 清除選項
  const _clearOptions = useCallback(() => {
    setOptionsState({});
  }, []);

  // 重置
  const _reset = useCallback(() => {
    setFiltersState({});
    setOptionsState({});
    setPaginationState({ page: 1, pageSize: 10, total: 0 });
    setPerformance(null);
  }, []);

  // 自動初始化
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 計算屬性
  const _computedProps = useMemo(
    () => ({
      hasRecommendations: recommendations.length > 0,
      averageScore:
        recommendations.length > 0
          ? recommendations.reduce((sum, rec) => sum + rec.score, 0) /
            recommendations.length
          : 0,
      topRecommendations: recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
      recentRecommendations: recommendations
        .sort(
          (a, b) =>
            new Date((b as any).timestamp || 0).getTime() -
            new Date((a as any).timestamp || 0).getTime()
        )
        .slice(0, 5),
      total: recommendations.length,
      hasNextPage: pagination.page * pagination.pageSize < pagination.total,
      hasPrevPage: pagination.page > 1,
      totalPages: Math.ceil(pagination.total / pagination.pageSize),
      isReady: true,
    }),
    [recommendations, pagination]
  );

  const _isLoading = useMemo(
    () => Object.values(loading).some(Boolean),
    [loading]
  );

  return {
    recommendations,
    config,
    stats,
    loading,
    error,
    performance,
    isLoading,
    initialize,
    getRecommendations,
    recordClick,
    recordRating,
    fetchConfig,
    updateConfig,
    fetchStats,
    setFilters,
    setOptions,
    clearError,
    getRecommendationsForUser,
    clickRecommendation,
    rateRecommendation,
    setAlgorithm,
    setWeights,
    filterByCategory,
    sortByScore,
    enableDiversity,
    enableNovelty,
    nextPage,
    prevPage,
    refresh,
    clearFilters,
    clearOptions,
    reset,
    ...computedProps,
  };
};
