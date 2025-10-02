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

export const _useIntelligentSearch = () => {
  const _dispatch = useAppDispatch();
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

  // 執Row智能Search
  const _search = useCallback(
    async (
      searchQuery: IntelligentSearchQuery
    ): Promise<IntelligentSearchResponse> => {
      try {
        const _response = await (
          dispatch(performIntelligentSearch(searchQuery)) as any
        ).unwrap();
        return response;
      } catch (error) {
        console.error('智能搜索Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // GetSearch建議
  const _getSuggestions = useCallback(
    async (
      query: string,
      context?: SearchContext
    ): Promise<AutoCompleteOption[]> => {
      try {
        const _suggestions = await (
          dispatch(getIntelligentSearchSuggestions({ query, context })) as any
        ).unwrap();
        return suggestions;
      } catch (error) {
        console.error('Get搜索建議Failed:', error);
        return [];
      }
    },
    [dispatch]
  );

  // GetSearch歷史
  const _getSearchHistory = useCallback(
    async (userId: string): Promise<SearchHistoryItem[]> => {
      try {
        const _history = await (
          dispatch(getIntelligentSearchHistory(userId)) as any
        ).unwrap();
        return history;
      } catch (error) {
        console.error('Get搜索歷史Failed:', error);
        return [];
      }
    },
    [dispatch]
  );

  // SaveSearch歷史
  const _saveSearchHistory = useCallback(
    async (userId: string, query: string, results: string[]): Promise<void> => {
      try {
        await (
          dispatch(
            saveIntelligentSearchHistory({ userId, query, results })
          ) as any
        ).unwrap();
      } catch (error) {
        console.error('保存搜索歷史Failed:', error);
      }
    },
    [dispatch]
  );

  // Get熱門Search
  const _getPopularSearches = useCallback(
    async (category?: string): Promise<PopularSearchItem[]> => {
      try {
        const _popular = await (
          dispatch(getIntelligentPopularSearches(category)) as any
        ).unwrap();
        return popular;
      } catch (error) {
        console.error('Get熱門搜索Failed:', error);
        return [];
      }
    },
    [dispatch]
  );

  // Get相OffSearch
  const _getRelatedSearches = useCallback(
    async (query: string): Promise<RelatedSearchItem[]> => {
      try {
        const _related = await (
          dispatch(getIntelligentRelatedSearches(query)) as any
        ).unwrap();
        return related;
      } catch (error) {
        console.error('Get相關搜索Failed:', error);
        return [];
      }
    },
    [dispatch]
  );

  // AnalysisQuery
  const _analyzeQuery = useCallback(
    async (query: string): Promise<QueryAnalysis> => {
      try {
        const _analysis = await (
          dispatch(analyzeIntelligentQuery(query)) as any
        ).unwrap();
        return analysis;
      } catch (error) {
        console.error('分析查詢Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // UpdateUserPreferences
  const _updateUserPreferences = useCallback(
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
        console.error('Update用戶偏好Failed:', error);
      }
    },
    [dispatch]
  );

  // GetUserPreferences
  const _getUserPreferences = useCallback(
    async (userId: string): Promise<UserSearchPreferences> => {
      try {
        const _preferences = await (
          dispatch(getIntelligentUserPreferences(userId)) as any
        ).unwrap();
        return preferences;
      } catch (error) {
        console.error('Get用戶偏好Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // GetSearchStatistics
  const _getSearchStats =
    useCallback(async (): Promise<IntelligentSearchStats> => {
      try {
        const _stats = await (
          dispatch(getIntelligentSearchStats()) as any
        ).unwrap();
        return stats;
      } catch (error) {
        console.error('Get搜索統計Failed:', error);
        throw error;
      }
    }, [dispatch]);

  // ClearSearch歷史
  const _clearSearchHistory = useCallback(
    async (userId: string): Promise<void> => {
      try {
        await (dispatch(clearIntelligentSearchHistory(userId)) as any).unwrap();
      } catch (error) {
        console.error('清除搜索歷史Failed:', error);
      }
    },
    [dispatch]
  );

  // AutoGet建議
  useEffect(() => {
    if (currentQuery && currentQuery.length >= 2) {
      getSuggestions(currentQuery, currentContext);
    }
  }, [currentQuery, currentContext, getSuggestions]);

  // SettingsSearch上下文
  const _handleSetContext = useCallback((context: SearchContext) => {
    // 暫時Comment掉，Await slice 實現
  }, []);

  // SettingsSearchFilter器
  const _handleSetFilters = useCallback((filters: unknown) => {
    // 暫時Comment掉，Await slice 實現
  }, []);

  // UpdateSearchFilter器
  const _handleUpdateFilters = useCallback((filters: unknown) => {
    // 暫時Comment掉，Await slice 實現
  }, []);

  // ClearSearch結果
  const _handleClearResults = useCallback(() => {
    // 暫時Comment掉，Await slice 實現
  }, []);

  // ClearSearchQuery
  const _handleClearQuery = useCallback(() => {
    // 暫時Comment掉，Await slice 實現
  }, []);

  // ClearError
  const _handleClearError = useCallback(() => {
    // 暫時Comment掉，Await slice 實現
  }, []);

  // ResetStatus
  const _handleReset = useCallback(() => {
    // 暫時Comment掉，Await slice 實現
  }, []);

  // UpdateConfigure
  const _updateConfig = useCallback((newConfig: Partial<any>) => {
    // 暫時Comment掉，Await slice 實現
  }, []);

  return {
    // Status
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

    // OperationMethod
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

    // EventHandle器
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

// 簡化的智能Search Hook
export const _useSimpleIntelligentSearch = () => {
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

// 智能Search建議 Hook
export const _useIntelligentSearchSuggestions = () => {
  const _dispatch = useAppDispatch();
  const { suggestions, isSuggestionsLoading } = useSelector(
    (state: unknown) => state.intelligentSearch
  );

  const _getSuggestions = useCallback(
    async (
      query: string,
      context?: SearchContext
    ): Promise<AutoCompleteOption[]> => {
      try {
        const _result = await (
          dispatch(getIntelligentSearchSuggestions({ query, context })) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('Get智能搜索建議Failed:', error);
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

// 智能Search歷史 Hook
export const _useIntelligentSearchHistory = () => {
  const _dispatch = useAppDispatch();
  const { searchHistory, recentSearches } = useSelector(
    (state: unknown) => state.intelligentSearch
  );

  const _getSearchHistory = useCallback(
    async (userId: string): Promise<SearchHistoryItem[]> => {
      try {
        const _history = await (
          dispatch(getIntelligentSearchHistory(userId)) as any
        ).unwrap();
        return history;
      } catch (error) {
        console.error('Get智能搜索歷史Failed:', error);
        return [];
      }
    },
    [dispatch]
  );

  const _saveSearchHistory = useCallback(
    async (userId: string, query: string, results: string[]): Promise<void> => {
      try {
        await (
          dispatch(
            saveIntelligentSearchHistory({ userId, query, results })
          ) as any
        ).unwrap();
      } catch (error) {
        console.error('保存智能搜索歷史Failed:', error);
      }
    },
    [dispatch]
  );

  const _clearSearchHistory = useCallback(
    async (userId: string): Promise<void> => {
      try {
        await (dispatch(clearIntelligentSearchHistory(userId)) as any).unwrap();
      } catch (error) {
        console.error('清除智能搜索歷史Failed:', error);
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

// 智能SearchPreferences Hook
export const _useIntelligentSearchPreferences = () => {
  const _dispatch = useAppDispatch();
  const { currentPreferences, userPreferences, config } = useSelector(
    (state: unknown) => state.intelligentSearch
  );

  const _updateUserPreferences = useCallback(
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
        console.error('Update智能搜索用戶偏好Failed:', error);
      }
    },
    [dispatch]
  );

  const _getUserPreferences = useCallback(
    async (userId: string): Promise<UserSearchPreferences> => {
      try {
        const _preferences = await (
          dispatch(getIntelligentUserPreferences(userId)) as any
        ).unwrap();
        return preferences;
      } catch (error) {
        console.error('Get智能搜索用戶偏好Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _updateConfig = useCallback((newConfig: Partial<any>) => {
    // 暫時Comment掉，Await slice 實現
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

// 智能SearchStatistics Hook
export const _useIntelligentSearchStats = () => {
  const _dispatch = useAppDispatch();
  const { searchStats, responseTime, cacheHit, totalResults } = useSelector(
    (state: unknown) => state.intelligentSearch
  );

  const _getSearchStats =
    useCallback(async (): Promise<IntelligentSearchStats> => {
      try {
        const _stats = await (
          dispatch(getIntelligentSearchStats()) as any
        ).unwrap();
        return stats;
      } catch (error) {
        console.error('Get智能搜索統計Failed:', error);
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
