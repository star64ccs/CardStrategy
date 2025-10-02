import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch } from '../../../store';
import {
  addSearchHistory,
  clearError,
  clearRecentSearches,
  clearSearchHistory,
  clearSearchQuery,
  clearSearchResults,
  clearSuggestions,
  getSearchStats,
  initializeSearchService,
  performSearch,
  resetSearchState,
  selectCurrentFilters,
  selectCurrentQuery,
  selectCurrentSortBy,
  selectIsSearchInitializing,
  selectIsSearchLoading,
  selectPopularSearches,
  selectRecentSearches,
  selectSearchConfig,
  selectSearchError,
  selectSearchFacets,
  selectSearchHistory,
  selectSearchIndexes,
  selectSearchLimit,
  selectSearchPage,
  selectSearchPreferences,
  selectSearchResults,
  selectSearchStats,
  selectSearchSuggestions,
  selectSearchTime,
  selectSearchTotal,
  selectSearchTotalPages,
  setError,
  setLimit,
  setPage,
  setSearchFilters,
  setSearchQuery,
  setSortBy,
  setSuggestions,
  updateSearchFilters,
  updateSearchIndex,
} from '../../../store/slices/searchSlice';
import type { SearchFilters, SearchQuery, SortOption } from '../types/search';

export const useSearch = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 從 Redux store 獲取狀態
  const results = useSelector(selectSearchResults);
  const total = useSelector(selectSearchTotal);
  const page = useSelector(selectSearchPage);
  const limit = useSelector(selectSearchLimit);
  const totalPages = useSelector(selectSearchTotalPages);
  const currentQuery = useSelector(selectCurrentQuery);
  const currentFilters = useSelector(selectCurrentFilters);
  const currentSortBy = useSelector(selectCurrentSortBy);
  const searchTime = useSelector(selectSearchTime);
  const suggestions = useSelector(selectSearchSuggestions);
  const facets = useSelector(selectSearchFacets);
  const isLoading = useSelector(selectIsSearchLoading);
  const isInitializing = useSelector(selectIsSearchInitializing);
  const error = useSelector(selectSearchError);
  const searchHistory = useSelector(selectSearchHistory);
  const searchStats = useSelector(selectSearchStats);
  const searchIndexes = useSelector(selectSearchIndexes);
  const searchConfig = useSelector(selectSearchConfig);
  const recentSearches = useSelector(selectRecentSearches);
  const popularSearches = useSelector(selectPopularSearches);
  const searchPreferences = useSelector(selectSearchPreferences);

  // 本地狀態
  const [debouncedQuery, setDebouncedQuery] = useState(currentQuery);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化搜索服務
  const initialize = useCallback(async () => {
    try {
      const result = await dispatch(initializeSearchService()).unwrap();
      setIsInitialized(true);
      return result;
    } catch (error) {
      console.error('搜索服務初始化失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 執行搜索
  const search = useCallback(
    async (query: SearchQuery) => {
      try {
        const response = await dispatch(performSearch(query)).unwrap();

        // 記錄搜索歷史
        dispatch(
          addSearchHistory({
            query: query.query,
            filters: query.filters,
            resultsCount: response.total,
            searchTime: response.searchTime,
            timestamp: new Date(),
          })
        );

        return response;
      } catch (error) {
        console.error('搜索執行失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 簡單搜索（只提供查詢字符串）
  const simpleSearch = useCallback(
    async (
      queryString: string,
      options?: {
        filters?: SearchFilters;
        sortBy?: SortOption;
        page?: number;
        limit?: number;
      }
    ) => {
      const searchQuery: SearchQuery = {
        query: queryString,
        filters: options?.filters || currentFilters,
        sortBy: options?.sortBy || currentSortBy,
        page: options?.page || 1,
        limit: options?.limit || limit,
      };

      return search(searchQuery);
    },
    [search, currentFilters, currentSortBy, limit]
  );

  // 設置搜索查詢
  const setQuery = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
      setDebouncedQuery(query);
    },
    [dispatch]
  );

  // 設置搜索過濾器
  const setFilters = useCallback(
    (filters: SearchFilters) => {
      dispatch(setSearchFilters(filters));
    },
    [dispatch]
  );

  // 更新搜索過濾器
  const updateFilters = useCallback(
    (filters: Partial<SearchFilters>) => {
      dispatch(updateSearchFilters(filters));
    },
    [dispatch]
  );

  // 設置排序選項
  const setSort = useCallback(
    (sortBy: SortOption) => {
      dispatch(setSortBy(sortBy));
    },
    [dispatch]
  );

  // 設置頁碼
  const setPageNumber = useCallback(
    (pageNumber: number) => {
      dispatch(setPage(pageNumber));
    },
    [dispatch]
  );

  // 設置每頁數量
  const setLimitCount = useCallback(
    (limitCount: number) => {
      dispatch(setLimit(limitCount));
    },
    [dispatch]
  );

  // 清除搜索結果
  const clearResults = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  // 清除搜索查詢
  const clearQuery = useCallback(() => {
    dispatch(clearSearchQuery());
    setDebouncedQuery('');
  }, [dispatch]);

  // 清除搜索歷史
  const clearHistory = useCallback(() => {
    dispatch(clearSearchHistory());
  }, [dispatch]);

  // 清除最近搜索
  const clearRecent = useCallback(() => {
    dispatch(clearRecentSearches());
  }, [dispatch]);

  // 設置搜索建議
  const setSearchSuggestions = useCallback(
    (suggestions: string[]) => {
      dispatch(setSuggestions(suggestions));
    },
    [dispatch]
  );

  // 清除搜索建議
  const clearSearchSuggestions = useCallback(() => {
    dispatch(clearSuggestions());
  }, [dispatch]);

  // 設置錯誤
  const setSearchError = useCallback(
    (errorMessage: string | null) => {
      dispatch(setError(errorMessage));
    },
    [dispatch]
  );

  // 清除錯誤
  const clearSearchError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 重置搜索狀態
  const reset = useCallback(() => {
    dispatch(resetSearchState());
    setDebouncedQuery('');
  }, [dispatch]);

  // 獲取搜索統計
  const getStats = useCallback(async () => {
    try {
      const stats = await dispatch(getSearchStats()).unwrap();
      return stats;
    } catch (error) {
      console.error('獲取搜索統計失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 更新搜索索引
  const updateIndex = useCallback(
    async (indexName: string) => {
      try {
        const result = await dispatch(updateSearchIndex(indexName)).unwrap();
        return result;
      } catch (error) {
        console.error('更新搜索索引失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 自動搜索（基於防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedQuery.trim() && debouncedQuery !== currentQuery) {
        simpleSearch(debouncedQuery);
      }
    }, 500); // 500ms 防抖

    return () => clearTimeout(timer);
  }, [debouncedQuery, currentQuery, simpleSearch]);

  // 計算分頁信息
  const paginationInfo = useMemo(() => {
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, total);

    return {
      startIndex,
      endIndex,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      pageNumbers: Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i));
        return pageNum;
      }).filter((num, index, arr) => arr.indexOf(num) === index),
    };
  }, [page, limit, total, totalPages]);

  // 計算搜索摘要
  const searchSummary = useMemo(() => {
    if (total === 0) return null;

    return {
      totalResults: total,
      searchTime,
      query: currentQuery,
      filters: currentFilters,
      sortBy: currentSortBy,
      pagination: paginationInfo,
    };
  }, [
    total,
    searchTime,
    currentQuery,
    currentFilters,
    currentSortBy,
    paginationInfo,
  ]);

  // 檢查是否有活躍的過濾器
  const hasActiveFilters = useMemo(() => {
    return Object.keys(currentFilters).length > 0;
  }, [currentFilters]);

  // 檢查是否有搜索結果
  const hasResults = useMemo(() => {
    return results.length > 0;
  }, [results]);

  // 檢查是否正在加載
  const isSearching = useMemo(() => {
    return isLoading || isInitializing;
  }, [isLoading, isInitializing]);

  // 獲取結果統計
  const resultsStats = useMemo(() => {
    if (!hasResults) return null;

    const priceStats = results.reduce(
      (acc, result) => {
        const price = result.price || 0;
        acc.total += price;
        acc.min = Math.min(acc.min, price);
        acc.max = Math.max(acc.max, price);
        return acc;
      },
      { total: 0, min: Infinity, max: -Infinity }
    );

    const conditionStats = results.reduce(
      (acc, result) => {
        const condition = result.condition || 'unknown';
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const rarityStats = results.reduce(
      (acc, result) => {
        const rarity = result.rarity || 'unknown';
        acc[rarity] = (acc[rarity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      averagePrice: priceStats.total / results.length,
      minPrice: priceStats.min === Infinity ? 0 : priceStats.min,
      maxPrice: priceStats.max === -Infinity ? 0 : priceStats.max,
      conditionDistribution: conditionStats,
      rarityDistribution: rarityStats,
    };
  }, [results, hasResults]);

  // 導出所有功能
  return {
    // 狀態
    results,
    total,
    page,
    limit,
    totalPages,
    currentQuery,
    currentFilters,
    currentSortBy,
    searchTime,
    suggestions,
    facets,
    isLoading,
    isInitializing,
    error,
    searchHistory,
    searchStats,
    searchIndexes,
    searchConfig,
    recentSearches,
    popularSearches,
    searchPreferences,
    isInitialized,

    // 計算屬性
    paginationInfo,
    searchSummary,
    hasActiveFilters,
    hasResults,
    isSearching,
    resultsStats,

    // 操作方法
    initialize,
    search,
    simpleSearch,
    setQuery,
    setFilters,
    updateFilters,
    setSort,
    setPageNumber,
    setLimitCount,
    clearResults,
    clearQuery,
    clearHistory,
    clearRecent,
    setSearchSuggestions,
    clearSearchSuggestions,
    setSearchError,
    clearSearchError,
    reset,
    getStats,
    updateIndex,
  };
};

// 專門用於搜索建議的 Hook
export const useSearchSuggestions = () => {
  const dispatch = useDispatch();
  const suggestions = useSelector(selectSearchSuggestions);
  const recentSearches = useSelector(selectRecentSearches);
  const popularSearches = useSelector(selectPopularSearches);
  const searchPreferences = useSelector(selectSearchPreferences);

  const getSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim() || !searchPreferences.autoSuggest) {
        return [];
      }

      // 基於最近搜索和熱門搜索生成建議
      const allSuggestions = [
        ...recentSearches.filter(q =>
          q.toLowerCase().includes(query.toLowerCase())
        ),
        ...popularSearches
          .map(p => p.query)
          .filter(q => q.toLowerCase().includes(query.toLowerCase())),
      ];

      // 去重並限制數量
      const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, 5);

      dispatch(setSuggestions(uniqueSuggestions));
      return uniqueSuggestions;
    },
    [dispatch, recentSearches, popularSearches, searchPreferences.autoSuggest]
  );

  const clearSuggestionsList = useCallback(() => {
    dispatch(clearSuggestions());
  }, [dispatch]);

  return {
    suggestions,
    getSuggestions,
    clearSuggestions: clearSuggestionsList,
  };
};

// 專門用於搜索過濾器的 Hook
export const useSearchFilters = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentFilters = useSelector(selectCurrentFilters);
  const facets = useSelector(selectSearchFacets);

  const setFilters = useCallback(
    (filters: SearchFilters) => {
      dispatch(setSearchFilters(filters));
    },
    [dispatch]
  );

  const updateFilters = useCallback(
    (filters: Partial<SearchFilters>) => {
      dispatch(updateSearchFilters(filters));
    },
    [dispatch]
  );

  const clearFilters = useCallback(() => {
    dispatch(setSearchFilters({}));
  }, [dispatch]);

  const toggleFilter = useCallback(
    (filterType: keyof SearchFilters, value: unknown) => {
      const currentValue = currentFilters[filterType];

      if (Array.isArray(currentValue)) {
        const newValue = (currentValue as any[]).includes(value)
          ? currentValue.filter((v: unknown) => v !== value)
          : [...currentValue, value];

        updateFilters({ [filterType]: newValue });
      } else {
        updateFilters({ [filterType]: value });
      }
    },
    [currentFilters, updateFilters]
  );

  return {
    currentFilters,
    facets,
    setFilters,
    updateFilters,
    clearFilters,
    toggleFilter,
  };
};

// 專門用於搜索排序的 Hook
export const useSearchSorting = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentSortBy = useSelector(selectCurrentSortBy);

  const setSort = useCallback(
    (sortBy: SortOption) => {
      dispatch(setSortBy(sortBy));
    },
    [dispatch]
  );

  const toggleSortDirection = useCallback(() => {
    const newDirection = currentSortBy.direction === 'asc' ? 'desc' : 'asc';
    dispatch(setSortBy({ ...currentSortBy, direction: newDirection }));
  }, [dispatch, currentSortBy]);

  const sortOptions = useMemo(
    () => [
      { field: 'score', label: '相關性', direction: 'desc' as const },
      { field: 'price', label: '價格', direction: 'asc' as const },
      { field: 'title', label: '標題', direction: 'asc' as const },
      { field: 'year', label: '年份', direction: 'desc' as const },
      { field: 'createdAt', label: '創建時間', direction: 'desc' as const },
    ],
    []
  );

  return {
    currentSortBy,
    setSort,
    toggleSortDirection,
    sortOptions,
  };
};
