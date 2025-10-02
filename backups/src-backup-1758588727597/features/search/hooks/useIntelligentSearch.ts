import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  analyzeIntelligentQuery,
  clearIntelligentSearchHistory,
  getIntelligentPopularSearches,
  getIntelligentRelatedSearches,
  getIntelligentSearchHistory,
  getIntelligentSearchStats,
  getIntelligentSearchSuggestions,
  getIntelligentUserPreferences,
  performIntelligentSearch,
  saveIntelligentSearchHistory,
  updateIntelligentUserPreferences,
} from '../../../store/slices/intelligentSearchSlice';
import type {
  AutoCompleteOption,
  IntelligentSearchQuery,
  IntelligentSearchResponse,
  IntelligentSearchStats,
  PopularSearchItem,
  QueryAnalysis,
  RelatedSearchItem,
  SearchContext,
  SearchHistoryItem,
  UserSearchPreferences,
} from '../types/intelligentSearch';

export const useIntelligentSearch = () => {
  const dispatch = useAppDispatch();
  const {
    results,
    suggestions,
    searchHistory,
    popularSearches,
    relatedSearches,
    queryAnalysis,
    userPreferences,
    config,
    isLoading,
    error,
  } = useSelector((state: unknown) => state.intelligentSearch || {});

  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [currentContext, setCurrentContext] = useState<
    SearchContext | undefined
  >();

  // 執行智能搜索
  const search = useCallback(
    async (
      searchQuery: IntelligentSearchQuery
    ): Promise<IntelligentSearchResponse> => {
      try {
        const response = await (
          dispatch(performIntelligentSearch(searchQuery)) as any
        ).unwrap();
        return response;
      } catch (error) {
        console.error('智能搜索失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取搜索建議
  const getSuggestions = useCallback(
    async (
      query: string,
      context?: SearchContext
    ): Promise<AutoCompleteOption[]> => {
      try {
        const suggestions = await (
          dispatch(getIntelligentSearchSuggestions({ query, context })) as any
        ).unwrap();
        return suggestions;
      } catch (error) {
        console.error('獲取搜索建議失敗:', error);
        return [];
      }
    },
    [dispatch]
  );

  // 獲取搜索歷史
  const getSearchHistory = useCallback(
    async (userId: string): Promise<SearchHistoryItem[]> => {
      try {
        const history = await (
          dispatch(getIntelligentSearchHistory(userId)) as any
        ).unwrap();
        return history;
      } catch (error) {
        console.error('獲取搜索歷史失敗:', error);
        return [];
      }
    },
    [dispatch]
  );

  // 保存搜索歷史
  const saveSearchHistory = useCallback(
    async (userId: string, query: string, results: string[]): Promise<void> => {
      try {
        await (
          dispatch(
            saveIntelligentSearchHistory({ userId, query, results })
          ) as any
        ).unwrap();
      } catch (error) {
        console.error('保存搜索歷史失敗:', error);
      }
    },
    [dispatch]
  );

  // 獲取熱門搜索
  const getPopularSearches = useCallback(
    async (category?: string): Promise<PopularSearchItem[]> => {
      try {
        const popular = await (
          dispatch(getIntelligentPopularSearches(category)) as any
        ).unwrap();
        return popular;
      } catch (error) {
        console.error('獲取熱門搜索失敗:', error);
        return [];
      }
    },
    [dispatch]
  );

  // 獲取相關搜索
  const getRelatedSearches = useCallback(
    async (query: string): Promise<RelatedSearchItem[]> => {
      try {
        const related = await (
          dispatch(getIntelligentRelatedSearches(query)) as any
        ).unwrap();
        return related;
      } catch (error) {
        console.error('獲取相關搜索失敗:', error);
        return [];
      }
    },
    [dispatch]
  );

  // 分析查詢
  const analyzeQuery = useCallback(
    async (query: string): Promise<QueryAnalysis> => {
      try {
        const analysis = await (
          dispatch(analyzeIntelligentQuery(query)) as any
        ).unwrap();
        return analysis;
      } catch (error) {
        console.error('分析查詢失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 更新用戶偏好
  const updateUserPreferences = useCallback(
    async (
      userId: string,
      preferences: UserSearchPreferences
    ): Promise<void> => {
      try {
        await (
          dispatch(
            updateIntelligentUserPreferences({ userId, preferences })
          ) as any
        ).unwrap();
      } catch (error) {
        console.error('更新用戶偏好失敗:', error);
      }
    },
    [dispatch]
  );

  // 獲取用戶偏好
  const getUserPreferences = useCallback(
    async (userId: string): Promise<UserSearchPreferences> => {
      try {
        const preferences = await (
          dispatch(getIntelligentUserPreferences(userId)) as any
        ).unwrap();
        return preferences;
      } catch (error) {
        console.error('獲取用戶偏好失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取搜索統計
  const getSearchStats =
    useCallback(async (): Promise<IntelligentSearchStats> => {
      try {
        const stats = await (
          dispatch(getIntelligentSearchStats()) as any
        ).unwrap();
        return stats;
      } catch (error) {
        console.error('獲取搜索統計失敗:', error);
        throw error;
      }
    }, [dispatch]);

  // 清除搜索歷史
  const clearSearchHistory = useCallback(
    async (userId: string): Promise<void> => {
      try {
        await (dispatch(clearIntelligentSearchHistory(userId)) as any).unwrap();
      } catch (error) {
        console.error('清除搜索歷史失敗:', error);
      }
    },
    [dispatch]
  );

  // 自動獲取建議
  useEffect(() => {
    if (currentQuery && currentQuery.length >= 2) {
      getSuggestions(currentQuery, currentContext);
    }
  }, [currentQuery, currentContext, getSuggestions]);

  // 設置搜索上下文
  const handleSetContext = useCallback((context: SearchContext) => {
    // 暫時註釋掉，等待 slice 實現
  }, []);

  // 設置搜索過濾器
  const handleSetFilters = useCallback((filters: unknown) => {
    // 暫時註釋掉，等待 slice 實現
  }, []);

  // 更新搜索過濾器
  const handleUpdateFilters = useCallback((filters: unknown) => {
    // 暫時註釋掉，等待 slice 實現
  }, []);

  // 清除搜索結果
  const handleClearResults = useCallback(() => {
    // 暫時註釋掉，等待 slice 實現
  }, []);

  // 清除搜索查詢
  const handleClearQuery = useCallback(() => {
    // 暫時註釋掉，等待 slice 實現
  }, []);

  // 清除錯誤
  const handleClearError = useCallback(() => {
    // 暫時註釋掉，等待 slice 實現
  }, []);

  // 重置狀態
  const handleReset = useCallback(() => {
    // 暫時註釋掉，等待 slice 實現
  }, []);

  // 更新配置
  const updateConfig = useCallback((newConfig: Partial<any>) => {
    // 暫時註釋掉，等待 slice 實現
  }, []);

  return {
    // 狀態
    results,
    suggestions,
    searchHistory,
    popularSearches,
    relatedSearches,
    queryAnalysis,
    userPreferences,
    config,
    isLoading,
    error,
    currentQuery,
    currentContext,

    // 操作方法
    search,
    getSuggestions,
    getSearchHistory,
    saveSearchHistory,
    getPopularSearches,
    getRelatedSearches,
    analyzeQuery,
    updateUserPreferences,
    getUserPreferences,
    getSearchStats,
    clearSearchHistory,

    // 事件處理器
    setCurrentQuery,
    setCurrentContext: handleSetContext,
    setFilters: handleSetFilters,
    updateFilters: handleUpdateFilters,
    clearResults: handleClearResults,
    clearQuery: handleClearQuery,
    clearError: handleClearError,
    reset: handleReset,
    updateConfig,
  };
};

// 簡化的智能搜索 Hook
export const useSimpleIntelligentSearch = () => {
  const { results, suggestions, isLoading, error, search, getSuggestions } =
    useIntelligentSearch();

  return {
    results,
    suggestions,
    isLoading,
    error,
    search,
    getSuggestions,
  };
};

// 智能搜索建議 Hook
export const useIntelligentSearchSuggestions = () => {
  const dispatch = useAppDispatch();
  const { suggestions, isSuggestionsLoading } = useSelector(
    (state: unknown) => state.intelligentSearch
  );

  const getSuggestions = useCallback(
    async (
      query: string,
      context?: SearchContext
    ): Promise<AutoCompleteOption[]> => {
      try {
        const result = await (
          dispatch(getIntelligentSearchSuggestions({ query, context })) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('獲取智能搜索建議失敗:', error);
        return [];
      }
    },
    [dispatch]
  );

  return {
    suggestions,
    isSuggestionsLoading,
    getSuggestions,
  };
};

// 智能搜索歷史 Hook
export const useIntelligentSearchHistory = () => {
  const dispatch = useAppDispatch();
  const { searchHistory, recentSearches } = useSelector(
    (state: unknown) => state.intelligentSearch
  );

  const getSearchHistory = useCallback(
    async (userId: string): Promise<SearchHistoryItem[]> => {
      try {
        const history = await (
          dispatch(getIntelligentSearchHistory(userId)) as any
        ).unwrap();
        return history;
      } catch (error) {
        console.error('獲取智能搜索歷史失敗:', error);
        return [];
      }
    },
    [dispatch]
  );

  const saveSearchHistory = useCallback(
    async (userId: string, query: string, results: string[]): Promise<void> => {
      try {
        await (
          dispatch(
            saveIntelligentSearchHistory({ userId, query, results })
          ) as any
        ).unwrap();
      } catch (error) {
        console.error('保存智能搜索歷史失敗:', error);
      }
    },
    [dispatch]
  );

  const clearSearchHistory = useCallback(
    async (userId: string): Promise<void> => {
      try {
        await (dispatch(clearIntelligentSearchHistory(userId)) as any).unwrap();
      } catch (error) {
        console.error('清除智能搜索歷史失敗:', error);
      }
    },
    [dispatch]
  );

  return {
    searchHistory,
    recentSearches,
    getSearchHistory,
    saveSearchHistory,
    clearSearchHistory,
  };
};

// 智能搜索偏好 Hook
export const useIntelligentSearchPreferences = () => {
  const dispatch = useAppDispatch();
  const { currentPreferences, userPreferences, config } = useSelector(
    (state: unknown) => state.intelligentSearch
  );

  const updateUserPreferences = useCallback(
    async (
      userId: string,
      preferences: UserSearchPreferences
    ): Promise<void> => {
      try {
        await (
          dispatch(
            updateIntelligentUserPreferences({ userId, preferences })
          ) as any
        ).unwrap();
      } catch (error) {
        console.error('更新智能搜索用戶偏好失敗:', error);
      }
    },
    [dispatch]
  );

  const getUserPreferences = useCallback(
    async (userId: string): Promise<UserSearchPreferences> => {
      try {
        const preferences = await (
          dispatch(getIntelligentUserPreferences(userId)) as any
        ).unwrap();
        return preferences;
      } catch (error) {
        console.error('獲取智能搜索用戶偏好失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateConfig = useCallback((newConfig: Partial<any>) => {
    // 暫時註釋掉，等待 slice 實現
  }, []);

  return {
    currentPreferences,
    userPreferences,
    config,
    updateUserPreferences,
    getUserPreferences,
    updateConfig,
  };
};

// 智能搜索統計 Hook
export const useIntelligentSearchStats = () => {
  const dispatch = useAppDispatch();
  const { searchStats, responseTime, cacheHit, totalResults } = useSelector(
    (state: unknown) => state.intelligentSearch
  );

  const getSearchStats =
    useCallback(async (): Promise<IntelligentSearchStats> => {
      try {
        const stats = await (
          dispatch(getIntelligentSearchStats()) as any
        ).unwrap();
        return stats;
      } catch (error) {
        console.error('獲取智能搜索統計失敗:', error);
        throw error;
      }
    }, [dispatch]);

  return {
    searchStats,
    responseTime,
    cacheHit,
    totalResults,
    getSearchStats,
  };
};
