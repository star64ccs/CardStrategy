// 協同過濾推薦系統 React Hook
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  clearError,
  getModelPerformance,
  getRecommendations,
  getSimilarItems,
  getSimilarUsers,
  // Actions
  initializeCollaborativeFiltering,
  resetState,
  selectAllRecommendations,
  selectAllSimilarItems,
  selectAllSimilarUsers,
  selectCanGetRecommendations,
  selectCanGetSimilarItems,
  selectCanGetSimilarUsers,
  selectCanUpdateBehavior,
  selectCanUpdateRating,
  // Selectors
  selectCollaborativeFiltering,
  selectCurrentAlgorithm,
  selectCurrentSimilarityMethod,
  selectError,
  selectFilterOptions,
  selectHasError,
  selectHasPerformance,
  selectHasRecommendations,
  selectHasSimilarItems,
  selectHasSimilarUsers,
  selectHasStatistics,
  selectIsInitialized,
  selectIsInitializing,
  selectIsLoading,
  selectLoading,
  selectPagination,
  selectPerformance,
  selectRecommendationCount,
  selectRecommendations,
  selectSelectedRecommendation,
  selectSelectedSimilarItem,
  selectSelectedSimilarUser,
  selectSimilarItemCount,
  selectSimilarItems,
  selectSimilarUserCount,
  selectSimilarUsers,
  selectStatistics,
  setCurrentAlgorithm,
  setCurrentRecommendations,
  setCurrentSimilarItems,
  setCurrentSimilarityMethod,
  setCurrentSimilarUsers,
  setError,
  setFilterOptions,
  setLoading,
  setPagination,
  setSelectedRecommendationId,
  setSelectedSimilarItemId,
  setSelectedSimilarUserId,
  updateRating,
  updateUserBehavior,
} from '../../../store/slices/collaborativeFilteringSlice';
import type {
  GetRecommendationsRequest,
  GetSimilarItemsRequest,
  GetSimilarUsersRequest,
  RecommendationAlgorithm,
  SimilarityMethod,
  UpdateRatingRequest,
  UpdateUserBehaviorRequest,
} from '../types/collaborativeFiltering';
import { UserAction } from '../types/collaborativeFiltering';

export const useCollaborativeFiltering = () => {
  const dispatch = useAppDispatch();

  // 狀態選擇
  const state = useSelector(selectCollaborativeFiltering);
  const recommendations = useSelector(selectRecommendations);
  const allRecommendations = useSelector(selectAllRecommendations);
  const selectedRecommendation = useSelector(selectSelectedRecommendation);
  const similarUsers = useSelector(selectSimilarUsers);
  const allSimilarUsers = useSelector(selectAllSimilarUsers);
  const selectedSimilarUser = useSelector(selectSelectedSimilarUser);
  const similarItems = useSelector(selectSimilarItems);
  const allSimilarItems = useSelector(selectAllSimilarItems);
  const selectedSimilarItem = useSelector(selectSelectedSimilarItem);
  const performance = useSelector(selectPerformance);
  const statistics = useSelector(selectStatistics);
  const currentAlgorithm = useSelector(selectCurrentAlgorithm);
  const currentSimilarityMethod = useSelector(selectCurrentSimilarityMethod);
  const filterOptions = useSelector(selectFilterOptions);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const isInitialized = useSelector(selectIsInitialized);
  const isInitializing = useSelector(selectIsInitializing);

  // 計算屬性
  const hasRecommendations = useSelector(selectHasRecommendations);
  const recommendationCount = useSelector(selectRecommendationCount);
  const hasSimilarUsers = useSelector(selectHasSimilarUsers);
  const similarUserCount = useSelector(selectSimilarUserCount);
  const hasSimilarItems = useSelector(selectHasSimilarItems);
  const similarItemCount = useSelector(selectSimilarItemCount);
  const hasPerformance = useSelector(selectHasPerformance);
  const hasStatistics = useSelector(selectHasStatistics);
  const isLoading = useSelector(selectIsLoading);
  const hasError = useSelector(selectHasError);
  const canGetRecommendations = useSelector(selectCanGetRecommendations);
  const canGetSimilarUsers = useSelector(selectCanGetSimilarUsers);
  const canGetSimilarItems = useSelector(selectCanGetSimilarItems);
  const canUpdateRating = useSelector(selectCanUpdateRating);
  const canUpdateBehavior = useSelector(selectCanUpdateBehavior);

  // 初始化
  const initialize = useCallback(async () => {
    if (!isInitialized && !isInitializing) {
      await (dispatch(initializeCollaborativeFiltering()) as any).unwrap();
    }
  }, [dispatch, isInitialized, isInitializing]);

  // 獲取推薦
  const fetchRecommendations = useCallback(
    async (request: GetRecommendationsRequest) => {
      if (canGetRecommendations) {
        await (dispatch(getRecommendations(request)) as any).unwrap();
      }
    },
    [dispatch, canGetRecommendations]
  );

  // 獲取相似用戶
  const fetchSimilarUsers = useCallback(
    async (request: GetSimilarUsersRequest) => {
      if (canGetSimilarUsers) {
        await (dispatch(getSimilarUsers(request)) as any).unwrap();
      }
    },
    [dispatch, canGetSimilarUsers]
  );

  // 獲取相似項目
  const fetchSimilarItems = useCallback(
    async (request: GetSimilarItemsRequest) => {
      if (canGetSimilarItems) {
        await (dispatch(getSimilarItems(request)) as any).unwrap();
      }
    },
    [dispatch, canGetSimilarItems]
  );

  // 更新評分
  const rateItem = useCallback(
    async (request: UpdateRatingRequest) => {
      if (canUpdateRating) {
        await (dispatch(updateRating(request)) as any).unwrap();
      }
    },
    [dispatch, canUpdateRating]
  );

  // 更新用戶行為
  const trackBehavior = useCallback(
    async (request: UpdateUserBehaviorRequest) => {
      if (canUpdateBehavior) {
        await (dispatch(updateUserBehavior(request)) as any).unwrap();
      }
    },
    [dispatch, canUpdateBehavior]
  );

  // 獲取模型性能
  const fetchModelPerformance = useCallback(async () => {
    if (isInitialized) {
      await (dispatch(getModelPerformance()) as any).unwrap();
    }
  }, [dispatch, isInitialized]);

  // 設置當前推薦
  const setRecommendations = useCallback(
    (recommendations: unknown[]) => {
      dispatch(setCurrentRecommendations(recommendations));
    },
    [dispatch]
  );

  // 選擇推薦
  const selectRecommendation = useCallback(
    (itemId: string | null) => {
      dispatch(setSelectedRecommendationId(itemId));
    },
    [dispatch]
  );

  // 設置當前相似用戶
  const setSimilarUsers = useCallback(
    (users: unknown[]) => {
      dispatch(setCurrentSimilarUsers(users));
    },
    [dispatch]
  );

  // 選擇相似用戶
  const selectSimilarUser = useCallback(
    (userId: string | null) => {
      dispatch(setSelectedSimilarUserId(userId));
    },
    [dispatch]
  );

  // 設置當前相似項目
  const setSimilarItems = useCallback(
    (items: unknown[]) => {
      dispatch(setCurrentSimilarItems(items));
    },
    [dispatch]
  );

  // 選擇相似項目
  const selectSimilarItem = useCallback(
    (itemId: string | null) => {
      dispatch(setSelectedSimilarItemId(itemId));
    },
    [dispatch]
  );

  // 設置算法
  const setAlgorithm = useCallback(
    (algorithm: RecommendationAlgorithm) => {
      dispatch(setCurrentAlgorithm(algorithm));
    },
    [dispatch]
  );

  // 設置相似度方法
  const setSimilarityMethod = useCallback(
    (method: SimilarityMethod) => {
      dispatch(setCurrentSimilarityMethod(method));
    },
    [dispatch]
  );

  // 設置過濾選項
  const setFilters = useCallback(
    (options: Partial<typeof filterOptions>) => {
      dispatch(setFilterOptions(options));
    },
    [dispatch]
  );

  // 設置分頁
  const setPaginationData = useCallback(
    (data: Partial<typeof pagination>) => {
      dispatch(setPagination(data));
    },
    [dispatch]
  );

  // 設置加載狀態
  const setLoadingState = useCallback(
    (key: keyof typeof loading, value: boolean) => {
      dispatch(setLoading({ key, value }));
    },
    [dispatch]
  );

  // 設置錯誤
  const setErrorState = useCallback(
    (key: keyof typeof error, value: string | null) => {
      dispatch(setError({ key, value }));
    },
    [dispatch]
  );

  // 清除錯誤
  const clearErrorState = useCallback(
    (key: keyof typeof error) => {
      dispatch(clearError(key));
    },
    [dispatch]
  );

  // 重置狀態
  const reset = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  // 快速操作方法
  const quickGetRecommendations = useCallback(
    async (userId: string, limit = 10) => {
      await fetchRecommendations({
        userId,
        limit,
        algorithm: currentAlgorithm,
      });
    },
    [fetchRecommendations, currentAlgorithm]
  );

  const quickGetSimilarUsers = useCallback(
    async (userId: string, limit = 10) => {
      await fetchSimilarUsers({
        userId,
        limit,
        method: currentSimilarityMethod,
      });
    },
    [fetchSimilarUsers, currentSimilarityMethod]
  );

  const quickGetSimilarItems = useCallback(
    async (itemId: string, limit = 10) => {
      await fetchSimilarItems({
        itemId,
        limit,
        method: currentSimilarityMethod,
      });
    },
    [fetchSimilarItems, currentSimilarityMethod]
  );

  const quickRate = useCallback(
    async (userId: string, itemId: string, rating: number) => {
      await rateItem({
        userId,
        itemId,
        rating,
      });
    },
    [rateItem]
  );

  const quickTrackView = useCallback(
    async (userId: string, itemId: string) => {
      await trackBehavior({
        userId,
        itemId,
        action: UserAction.VIEW,
      });
    },
    [trackBehavior]
  );

  const quickTrackLike = useCallback(
    async (userId: string, itemId: string) => {
      await trackBehavior({
        userId,
        itemId,
        action: UserAction.LIKE,
      });
    },
    [trackBehavior]
  );

  const quickTrackPurchase = useCallback(
    async (userId: string, itemId: string) => {
      await trackBehavior({
        userId,
        itemId,
        action: UserAction.PURCHASE,
      });
    },
    [trackBehavior]
  );

  // 計算屬性
  const memoizedState = useMemo(
    () => ({
      // 基礎狀態
      isInitialized,
      isInitializing,
      isLoading,
      hasError,

      // 推薦相關
      recommendations,
      allRecommendations,
      selectedRecommendation,
      hasRecommendations,
      recommendationCount,

      // 相似用戶相關
      similarUsers,
      allSimilarUsers,
      selectedSimilarUser,
      hasSimilarUsers,
      similarUserCount,

      // 相似項目相關
      similarItems,
      allSimilarItems,
      selectedSimilarItem,
      hasSimilarItems,
      similarItemCount,

      // 性能相關
      performance,
      statistics,
      hasPerformance,
      hasStatistics,

      // 配置相關
      currentAlgorithm,
      currentSimilarityMethod,
      filterOptions,
      pagination,

      // 加載狀態
      loading,

      // 錯誤狀態
      error,

      // 能力檢查
      canGetRecommendations,
      canGetSimilarUsers,
      canGetSimilarItems,
      canUpdateRating,
      canUpdateBehavior,
    }),
    [
      isInitialized,
      isInitializing,
      isLoading,
      hasError,
      recommendations,
      allRecommendations,
      selectedRecommendation,
      hasRecommendations,
      recommendationCount,
      similarUsers,
      allSimilarUsers,
      selectedSimilarUser,
      hasSimilarUsers,
      similarUserCount,
      similarItems,
      allSimilarItems,
      selectedSimilarItem,
      hasSimilarItems,
      similarItemCount,
      performance,
      statistics,
      hasPerformance,
      hasStatistics,
      currentAlgorithm,
      currentSimilarityMethod,
      filterOptions,
      pagination,
      loading,
      error,
      canGetRecommendations,
      canGetSimilarUsers,
      canGetSimilarItems,
      canUpdateRating,
      canUpdateBehavior,
    ]
  );

  // 自動初始化
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initialize();
    }
  }, [isInitialized, isInitializing, initialize]);

  // 定期更新性能指標
  useEffect(() => {
    if (isInitialized && !hasPerformance) {
      fetchModelPerformance();
    }
  }, [isInitialized, hasPerformance, fetchModelPerformance]);

  return {
    // 狀態
    ...memoizedState,

    // 核心操作
    initialize,
    fetchRecommendations,
    fetchSimilarUsers,
    fetchSimilarItems,
    rateItem,
    trackBehavior,
    fetchModelPerformance,

    // 狀態管理
    setRecommendations,
    selectRecommendation,
    setSimilarUsers,
    selectSimilarUser,
    setSimilarItems,
    selectSimilarItem,
    setAlgorithm,
    setSimilarityMethod,
    setFilters,
    setPaginationData,
    setLoadingState,
    setErrorState,
    clearErrorState,
    reset,

    // 快速操作
    quickGetRecommendations,
    quickGetSimilarUsers,
    quickGetSimilarItems,
    quickRate,
    quickTrackView,
    quickTrackLike,
    quickTrackPurchase,

    // 工具方法
    getRecommendationsByCategory: useCallback(
      (category: string) => {
        return (recommendations as any[]).filter((r: unknown) => {
          // 這裡需要根據實際項目結構來過濾
          return true; // 簡化實現
        });
      },
      [recommendations]
    ),

    getRecommendationsByScore: useCallback(
      (minScore: number, maxScore: number) => {
        return (recommendations as any[]).filter(
          (r: unknown) => r.score >= minScore && r.score <= maxScore
        );
      },
      [recommendations]
    ),

    getSimilarUsersByScore: useCallback(
      (minScore: number, maxScore: number) => {
        return (similarUsers as any[]).filter(
          (u: unknown) => u.score >= minScore && u.score <= maxScore
        );
      },
      [similarUsers]
    ),

    getSimilarItemsByScore: useCallback(
      (minScore: number, maxScore: number) => {
        return (similarItems as any[]).filter(
          (i: unknown) =>
            i.similarityScore >= minScore && i.similarityScore <= maxScore
        );
      },
      [similarItems]
    ),
  };
};
