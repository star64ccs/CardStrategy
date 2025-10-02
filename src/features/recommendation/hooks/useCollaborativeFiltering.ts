// 協同Filter推薦系統 React Hook
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

export const _useCollaborativeFiltering = () => {
  const _dispatch = useAppDispatch();

  // StatusSelect
  const _state = useSelector(selectCollaborativeFiltering);
  const _recommendations = useSelector(selectRecommendations);
  const _allRecommendations = useSelector(selectAllRecommendations);
  const _selectedRecommendation = useSelector(selectSelectedRecommendation);
  const _similarUsers = useSelector(selectSimilarUsers);
  const _allSimilarUsers = useSelector(selectAllSimilarUsers);
  const _selectedSimilarUser = useSelector(selectSelectedSimilarUser);
  const _similarItems = useSelector(selectSimilarItems);
  const _allSimilarItems = useSelector(selectAllSimilarItems);
  const _selectedSimilarItem = useSelector(selectSelectedSimilarItem);
  const _performance = useSelector(selectPerformance);
  const _statistics = useSelector(selectStatistics);
  const _currentAlgorithm = useSelector(selectCurrentAlgorithm);
  const _currentSimilarityMethod = useSelector(selectCurrentSimilarityMethod);
  const _filterOptions = useSelector(selectFilterOptions);
  const _pagination = useSelector(selectPagination);
  const _loading = useSelector(selectLoading);
  const _error = useSelector(selectError);
  const _isInitialized = useSelector(selectIsInitialized);
  const _isInitializing = useSelector(selectIsInitializing);

  // 計算Property
  const _hasRecommendations = useSelector(selectHasRecommendations);
  const _recommendationCount = useSelector(selectRecommendationCount);
  const _hasSimilarUsers = useSelector(selectHasSimilarUsers);
  const _similarUserCount = useSelector(selectSimilarUserCount);
  const _hasSimilarItems = useSelector(selectHasSimilarItems);
  const _similarItemCount = useSelector(selectSimilarItemCount);
  const _hasPerformance = useSelector(selectHasPerformance);
  const _hasStatistics = useSelector(selectHasStatistics);
  const _isLoading = useSelector(selectIsLoading);
  const _hasError = useSelector(selectHasError);
  const _canGetRecommendations = useSelector(selectCanGetRecommendations);
  const _canGetSimilarUsers = useSelector(selectCanGetSimilarUsers);
  const _canGetSimilarItems = useSelector(selectCanGetSimilarItems);
  const _canUpdateRating = useSelector(selectCanUpdateRating);
  const _canUpdateBehavior = useSelector(selectCanUpdateBehavior);

  // Initialize
  const _initialize = useCallback(async () => {
    if (!isInitialized && !isInitializing) {
      await (dispatch(initializeCollaborativeFiltering()) as any).unwrap();
    }
  }, [dispatch, isInitialized, isInitializing]);

  // Get推薦
  const _fetchRecommendations = useCallback(
    async (request: GetRecommendationsRequest) => {
      if (canGetRecommendations) {
        await (dispatch(getRecommendations(request)) as any).unwrap();
      }
    },
    [dispatch, canGetRecommendations]
  );

  // Get相似User
  const _fetchSimilarUsers = useCallback(
    async (request: GetSimilarUsersRequest) => {
      if (canGetSimilarUsers) {
        await (dispatch(getSimilarUsers(request)) as any).unwrap();
      }
    },
    [dispatch, canGetSimilarUsers]
  );

  // Get相似項目
  const _fetchSimilarItems = useCallback(
    async (request: GetSimilarItemsRequest) => {
      if (canGetSimilarItems) {
        await (dispatch(getSimilarItems(request)) as any).unwrap();
      }
    },
    [dispatch, canGetSimilarItems]
  );

  // Update評分
  const _rateItem = useCallback(
    async (request: UpdateRatingRequest) => {
      if (canUpdateRating) {
        await (dispatch(updateRating(request)) as any).unwrap();
      }
    },
    [dispatch, canUpdateRating]
  );

  // UpdateUserRow為
  const _trackBehavior = useCallback(
    async (request: UpdateUserBehaviorRequest) => {
      if (canUpdateBehavior) {
        await (dispatch(updateUserBehavior(request)) as any).unwrap();
      }
    },
    [dispatch, canUpdateBehavior]
  );

  // Get模型性能
  const _fetchModelPerformance = useCallback(async () => {
    if (isInitialized) {
      await (dispatch(getModelPerformance()) as any).unwrap();
    }
  }, [dispatch, isInitialized]);

  // Settings當前推薦
  const _setRecommendations = useCallback(
    (recommendations: unknown[]) => {
      dispatch(setCurrentRecommendations(recommendations));
    },
    [dispatch]
  );

  // Select推薦
  const _selectRecommendation = useCallback(
    (itemId: string | null) => {
      dispatch(setSelectedRecommendationId(itemId));
    },
    [dispatch]
  );

  // Settings當前相似User
  const _setSimilarUsers = useCallback(
    (users: unknown[]) => {
      dispatch(setCurrentSimilarUsers(users));
    },
    [dispatch]
  );

  // Select相似User
  const _selectSimilarUser = useCallback(
    (userId: string | null) => {
      dispatch(setSelectedSimilarUserId(userId));
    },
    [dispatch]
  );

  // Settings當前相似項目
  const _setSimilarItems = useCallback(
    (items: unknown[]) => {
      dispatch(setCurrentSimilarItems(items));
    },
    [dispatch]
  );

  // Select相似項目
  const _selectSimilarItem = useCallback(
    (itemId: string | null) => {
      dispatch(setSelectedSimilarItemId(itemId));
    },
    [dispatch]
  );

  // Settings算法
  const _setAlgorithm = useCallback(
    (algorithm: RecommendationAlgorithm) => {
      dispatch(setCurrentAlgorithm(algorithm));
    },
    [dispatch]
  );

  // Settings相似度Method
  const _setSimilarityMethod = useCallback(
    (method: SimilarityMethod) => {
      dispatch(setCurrentSimilarityMethod(method));
    },
    [dispatch]
  );

  // SettingsFilterOptions
  const _setFilters = useCallback(
    (options: Partial<typeof filterOptions>) => {
      dispatch(setFilterOptions(options));
    },
    [dispatch]
  );

  // SettingsPaginate
  const _setPaginationData = useCallback(
    (data: Partial<typeof pagination>) => {
      dispatch(setPagination(data));
    },
    [dispatch]
  );

  // Settings加載Status
  const _setLoadingState = useCallback(
    (key: keyof typeof loading, value: boolean) => {
      dispatch(setLoading({ key, value }));
    },
    [dispatch]
  );

  // SettingsError
  const _setErrorState = useCallback(
    (key: keyof typeof error, value: string | null) => {
      dispatch(setError({ key, value }));
    },
    [dispatch]
  );

  // ClearError
  const _clearErrorState = useCallback(
    (key: keyof typeof error) => {
      dispatch(clearError(key));
    },
    [dispatch]
  );

  // ResetStatus
  const _reset = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  // 快速OperationMethod
  const _quickGetRecommendations = useCallback(
    async (userId: string, limit = 10) => {
      await fetchRecommendations({
        userId,
        limit,
        algorithm: currentAlgorithm,
      });
    },
    [fetchRecommendations, currentAlgorithm]
  );

  const _quickGetSimilarUsers = useCallback(
    async (userId: string, limit = 10) => {
      await fetchSimilarUsers({
        userId,
        limit,
        method: currentSimilarityMethod,
      });
    },
    [fetchSimilarUsers, currentSimilarityMethod]
  );

  const _quickGetSimilarItems = useCallback(
    async (itemId: string, limit = 10) => {
      await fetchSimilarItems({
        itemId,
        limit,
        method: currentSimilarityMethod,
      });
    },
    [fetchSimilarItems, currentSimilarityMethod]
  );

  const _quickRate = useCallback(
    async (userId: string, itemId: string, rating: number) => {
      await rateItem({
        userId,
        itemId,
        rating,
      });
    },
    [rateItem]
  );

  const _quickTrackView = useCallback(
    async (userId: string, itemId: string) => {
      await trackBehavior({
        userId,
        itemId,
        action: UserAction.VIEW,
      });
    },
    [trackBehavior]
  );

  const _quickTrackLike = useCallback(
    async (userId: string, itemId: string) => {
      await trackBehavior({
        userId,
        itemId,
        action: UserAction.LIKE,
      });
    },
    [trackBehavior]
  );

  const _quickTrackPurchase = useCallback(
    async (userId: string, itemId: string) => {
      await trackBehavior({
        userId,
        itemId,
        action: UserAction.PURCHASE,
      });
    },
    [trackBehavior]
  );

  // 計算Property
  const _memoizedState = useMemo(
    () => ({
      // 基礎Status
      isInitialized,
      isInitializing,
      isLoading,
      hasError,

      // 推薦相Off
      recommendations,
      allRecommendations,
      selectedRecommendation,
      hasRecommendations,
      recommendationCount,

      // 相似User相Off
      similarUsers,
      allSimilarUsers,
      selectedSimilarUser,
      hasSimilarUsers,
      similarUserCount,

      // 相似項目相Off
      similarItems,
      allSimilarItems,
      selectedSimilarItem,
      hasSimilarItems,
      similarItemCount,

      // 性能相Off
      performance,
      statistics,
      hasPerformance,
      hasStatistics,

      // Configure相Off
      currentAlgorithm,
      currentSimilarityMethod,
      filterOptions,
      pagination,

      // 加載Status
      loading,

      // ErrorStatus
      error,

      // 能力Check
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

  // AutoInitialize
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initialize();
    }
  }, [isInitialized, isInitializing, initialize]);

  // 定期Update性能指標
  useEffect(() => {
    if (isInitialized && !hasPerformance) {
      fetchModelPerformance();
    }
  }, [isInitialized, hasPerformance, fetchModelPerformance]);

  return {
    // Status
    ...memoizedState,

    // 核心Operation
    initialize,
    fetchRecommendations,
    fetchSimilarUsers,
    fetchSimilarItems,
    rateItem,
    trackBehavior,
    fetchModelPerformance,

    // StatusManage
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

    // 快速Operation
    quickGetRecommendations,
    quickGetSimilarUsers,
    quickGetSimilarItems,
    quickRate,
    quickTrackView,
    quickTrackLike,
    quickTrackPurchase,

    // ToolMethod
    getRecommendationsByCategory: useCallback(
      (category: string) => {
        return (recommendations as any[]).filter((r: unknown) => {
          // 這裡需要Root據實際項目結構來Filter
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
