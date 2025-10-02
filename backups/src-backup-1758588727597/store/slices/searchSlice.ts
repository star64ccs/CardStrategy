import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { FullTextSearchService } from '../../features/search/services/fullTextSearchService';
import type {
  SearchConfig,
  SearchFilters,
  SearchIndex,
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchStats,
  SortOption,
} from '../../features/search/types/search';

// 搜索狀態接口
interface SearchState {
  // 搜索結果
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  // 搜索查詢
  currentQuery: string;
  currentFilters: SearchFilters;
  currentSortBy: SortOption;

  // 搜索響應時間
  searchTime: number;

  // 搜索建議
  suggestions: string[];

  // 搜索分面
  facets: unknown;

  // 加載狀態
  isLoading: boolean;
  isInitializing: boolean;

  // 錯誤狀態
  error: string | null;

  // 搜索歷史
  searchHistory: unknown[];

  // 搜索統計
  searchStats: SearchStats | null;

  // 搜索索引
  searchIndexes: SearchIndex[];

  // 搜索配置
  searchConfig: SearchConfig | null;

  // 最近搜索
  recentSearches: string[];

  // 熱門搜索
  popularSearches: unknown[];

  // 搜索偏好
  searchPreferences: {
    autoSuggest: boolean;
    searchHistory: boolean;
    personalizedResults: boolean;
    language: string;
    currency: string;
  };
}

// 初始狀態
const initialState: SearchState = {
  results: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  currentQuery: '',
  currentFilters: {},
  currentSortBy: { field: 'score', direction: 'desc' },
  searchTime: 0,
  suggestions: [],
  facets: null,
  isLoading: false,
  isInitializing: false,
  error: null,
  searchHistory: [],
  searchStats: null,
  searchIndexes: [],
  searchConfig: null,
  recentSearches: [],
  popularSearches: [],
  searchPreferences: {
    autoSuggest: true,
    searchHistory: true,
    personalizedResults: true,
    language: 'en',
    currency: 'USD',
  },
};

// 異步 Thunk Actions
export const initializeSearchService = createAsyncThunk(
  'search/initializeService',
  async (_, { rejectWithValue }) => {
    try {
      const searchService = FullTextSearchService.getInstance();
      const result = await searchService.initialize();

      if (!result) {
        throw new Error('搜索服務初始化失敗');
      }

      return {
        config: searchService.getConfig(),
        indexes: await searchService.getSearchIndexes(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '初始化失敗'
      );
    }
  }
);

export const performSearch = createAsyncThunk(
  'search/performSearch',
  async (query: SearchQuery, { rejectWithValue }) => {
    try {
      const searchService = FullTextSearchService.getInstance();

      if (!searchService.getInitializationStatus()) {
        throw new Error('搜索服務未初始化');
      }

      const response = await searchService.search(query);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '搜索失敗'
      );
    }
  }
);

export const getSearchStats = createAsyncThunk(
  'search/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const searchService = FullTextSearchService.getInstance();
      const stats = await searchService.getSearchStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取統計失敗'
      );
    }
  }
);

export const updateSearchIndex = createAsyncThunk(
  'search/updateIndex',
  async (indexName: string, { rejectWithValue }) => {
    try {
      const searchService = FullTextSearchService.getInstance();
      const result = await searchService.updateSearchIndex(indexName);

      if (!result) {
        throw new Error('索引更新失敗');
      }

      return { indexName, success: true };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '索引更新失敗'
      );
    }
  }
);

// 搜索 Slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // 設置搜索查詢
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
    },

    // 設置搜索過濾器
    setSearchFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.currentFilters = action.payload;
    },

    // 更新搜索過濾器
    updateSearchFilters: (
      state,
      action: PayloadAction<Partial<SearchFilters>>
    ) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    },

    // 設置排序選項
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.currentSortBy = action.payload;
    },

    // 設置頁碼
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },

    // 設置每頁數量
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },

    // 清除搜索結果
    clearSearchResults: state => {
      state.results = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 0;
      state.searchTime = 0;
      state.suggestions = [];
      state.facets = null;
    },

    // 清除搜索查詢
    clearSearchQuery: state => {
      state.currentQuery = '';
      state.currentFilters = {};
      state.currentSortBy = { field: 'score', direction: 'desc' };
    },

    // 添加搜索歷史
    addSearchHistory: (state, action: PayloadAction<any>) => {
      state.searchHistory.unshift(action.payload);
      // 限制歷史記錄數量
      if (state.searchHistory.length > 50) {
        state.searchHistory = state.searchHistory.slice(0, 50);
      }
    },

    // 清除搜索歷史
    clearSearchHistory: state => {
      state.searchHistory = [];
    },

    // 添加最近搜索
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query);
        // 限制最近搜索數量
        if (state.recentSearches.length > 10) {
          state.recentSearches = state.recentSearches.slice(0, 10);
        }
      }
    },

    // 清除最近搜索
    clearRecentSearches: state => {
      state.recentSearches = [];
    },

    // 設置熱門搜索
    setPopularSearches: (state, action: PayloadAction<any[]>) => {
      state.popularSearches = action.payload;
    },

    // 更新搜索偏好
    updateSearchPreferences: (
      state,
      action: PayloadAction<Partial<SearchState['searchPreferences']>>
    ) => {
      state.searchPreferences = {
        ...state.searchPreferences,
        ...action.payload,
      };
    },

    // 設置搜索建議
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },

    // 清除搜索建議
    clearSuggestions: state => {
      state.suggestions = [];
    },

    // 設置錯誤
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 清除錯誤
    clearError: state => {
      state.error = null;
    },

    // 重置搜索狀態
    resetSearchState: state => {
      return { ...initialState, searchPreferences: state.searchPreferences };
    },
  },
  extraReducers: builder => {
    builder
      // 初始化搜索服務
      .addCase(initializeSearchService.pending, state => {
        state.isInitializing = true;
        state.error = null;
      })
      .addCase(initializeSearchService.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.searchConfig = action.payload.config;
        state.searchIndexes = action.payload.indexes;
      })
      .addCase(initializeSearchService.rejected, (state, action) => {
        state.isInitializing = false;
        state.error = action.payload as string;
      })

      // 執行搜索
      .addCase(performSearch.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        performSearch.fulfilled,
        (state, action: PayloadAction<SearchResponse>) => {
          state.isLoading = false;
          state.results = action.payload.results;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.limit = action.payload.limit;
          state.totalPages = action.payload.totalPages;
          state.searchTime = action.payload.searchTime;
          state.suggestions = action.payload.suggestions || [];
          state.facets = action.payload.facets;

          // 更新當前查詢和過濾器
          state.currentQuery = action.payload.query;
          state.currentFilters = action.payload.filters;
          state.currentSortBy = action.payload.sortBy;

          // 添加到最近搜索
          if (action.payload.query.trim()) {
            state.recentSearches = state.recentSearches.filter(
              q => q !== action.payload.query
            );
            state.recentSearches.unshift(action.payload.query);
            if (state.recentSearches.length > 10) {
              state.recentSearches = state.recentSearches.slice(0, 10);
            }
          }
        }
      )
      .addCase(performSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // 獲取搜索統計
      .addCase(getSearchStats.pending, state => {
        state.error = null;
      })
      .addCase(
        getSearchStats.fulfilled,
        (state, action: PayloadAction<SearchStats>) => {
          state.searchStats = action.payload;
          state.popularSearches = action.payload.popularQueries;
        }
      )
      .addCase(getSearchStats.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // 更新搜索索引
      .addCase(updateSearchIndex.pending, state => {
        state.error = null;
      })
      .addCase(updateSearchIndex.fulfilled, (state, action) => {
        // 更新索引狀態
        const { indexName } = action.payload;
        const index = state.searchIndexes.find(idx => idx.id === indexName);
        if (index) {
          index.lastUpdated = new Date();
        }
      })
      .addCase(updateSearchIndex.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// 導出 actions
export const {
  setSearchQuery,
  setSearchFilters,
  updateSearchFilters,
  setSortBy,
  setPage,
  setLimit,
  clearSearchResults,
  clearSearchQuery,
  addSearchHistory,
  clearSearchHistory,
  addRecentSearch,
  clearRecentSearches,
  setPopularSearches,
  updateSearchPreferences,
  setSuggestions,
  clearSuggestions,
  setError,
  clearError,
  resetSearchState,
} = searchSlice.actions;

// 導出 selectors
export const selectSearchResults = (state: { search: SearchState }) =>
  state.search.results;
export const selectSearchTotal = (state: { search: SearchState }) =>
  state.search.total;
export const selectSearchPage = (state: { search: SearchState }) =>
  state.search.page;
export const selectSearchLimit = (state: { search: SearchState }) =>
  state.search.limit;
export const selectSearchTotalPages = (state: { search: SearchState }) =>
  state.search.totalPages;
export const selectCurrentQuery = (state: { search: SearchState }) =>
  state.search.currentQuery;
export const selectCurrentFilters = (state: { search: SearchState }) =>
  state.search.currentFilters;
export const selectCurrentSortBy = (state: { search: SearchState }) =>
  state.search.currentSortBy;
export const selectSearchTime = (state: { search: SearchState }) =>
  state.search.searchTime;
export const selectSearchSuggestions = (state: { search: SearchState }) =>
  state.search.suggestions;
export const selectSearchFacets = (state: { search: SearchState }) =>
  state.search.facets;
export const selectIsSearchLoading = (state: { search: SearchState }) =>
  state.search.isLoading;
export const selectIsSearchInitializing = (state: { search: SearchState }) =>
  state.search.isInitializing;
export const selectSearchError = (state: { search: SearchState }) =>
  state.search.error;
export const selectSearchHistory = (state: { search: SearchState }) =>
  state.search.searchHistory;
export const selectSearchStats = (state: { search: SearchState }) =>
  state.search.searchStats;
export const selectSearchIndexes = (state: { search: SearchState }) =>
  state.search.searchIndexes;
export const selectSearchConfig = (state: { search: SearchState }) =>
  state.search.searchConfig;
export const selectRecentSearches = (state: { search: SearchState }) =>
  state.search.recentSearches;
export const selectPopularSearches = (state: { search: SearchState }) =>
  state.search.popularSearches;
export const selectSearchPreferences = (state: { search: SearchState }) =>
  state.search.searchPreferences;

// 導出 reducer
export default searchSlice.reducer;
