import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { FullTextSearchService } from '../../features/search/services/fullTextSearchService';
import type {
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchFilters,
  SortOption,
  SearchStats,
  SearchIndex,
  SearchConfig,
} from '../../features/search/types/search';
import { SearchError } from '../../features/search/types/search';

// SearchStatusInterface
interface SearchState {
  // Search結果
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  // SearchQuery
  currentQuery: string;
  currentFilters: SearchFilters;
  currentSortBy: SortOption;

  // SearchResponseTime
  searchTime: number;

  // Search建議
  suggestions: string[];

  // Search分面
  facets: unknown;

  // 加載Status
  isLoading: boolean;
  isInitializing: boolean;

  // ErrorStatus
  error: string | null;

  // Search歷史
  searchHistory: unknown[];

  // SearchStatistics
  searchStats: SearchStats | null;

  // SearchIndex
  searchIndexes: SearchIndex[];

  // SearchConfigure
  searchConfig: SearchConfig | null;

  // 最近Search
  recentSearches: string[];

  // 熱門Search
  popularSearches: unknown[];

  // SearchPreferences
  searchPreferences: {
    autoSuggest: boolean;
    searchHistory: boolean;
    personalizedResults: boolean;
    language: string;
    currency: string;
  };
}

// 初始Status
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

// Async Thunk Actions
export const _initializeSearchService = createAsyncThunk(
  'search/initializeService',
  async (_, { rejectWithValue }) => {
    try {
      const _searchService = FullTextSearchService.getInstance();
      const _result = await searchService.initialize();

      if (!result) {
        throw new Error('搜索ServiceInitializeFailed');
      }

      return {
        config: searchService.getConfig(),
        indexes: await searchService.getSearchIndexes(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'InitializeFailed'
      );
    }
  }
);

export const _performSearch = createAsyncThunk(
  'search/performSearch',
  async (query: SearchQuery, { rejectWithValue }) => {
    try {
      const _searchService = FullTextSearchService.getInstance();

      if (!searchService.getInitializationStatus()) {
        throw new Error('搜索Service未Initialize');
      }

      const _response = await searchService.search(query);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '搜索Failed'
      );
    }
  }
);

export const _getSearchStats = createAsyncThunk(
  'search/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const _searchService = FullTextSearchService.getInstance();
      const _stats = await searchService.getSearchStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Get統計Failed'
      );
    }
  }
);

export const _updateSearchIndex = createAsyncThunk(
  'search/updateIndex',
  async (indexName: string, { rejectWithValue }) => {
    try {
      const _searchService = FullTextSearchService.getInstance();
      const _result = await searchService.updateSearchIndex(indexName);

      if (!result) {
        throw new Error('索引UpdateFailed');
      }

      return { indexName, success: true };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '索引UpdateFailed'
      );
    }
  }
);

// Search Slice
const _searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // SettingsSearchQuery
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
    },

    // SettingsSearchFilter器
    setSearchFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.currentFilters = action.payload;
    },

    // UpdateSearchFilter器
    updateSearchFilters: (
      state,
      action: PayloadAction<Partial<SearchFilters>>
    ) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    },

    // SettingsSortOptions
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.currentSortBy = action.payload;
    },

    // Settings頁碼
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },

    // Settings每頁數量
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },

    // ClearSearch結果
    clearSearchResults: state => {
      state.results = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 0;
      state.searchTime = 0;
      state.suggestions = [];
      state.facets = null;
    },

    // ClearSearchQuery
    clearSearchQuery: state => {
      state.currentQuery = '';
      state.currentFilters = {};
      state.currentSortBy = { field: 'score', direction: 'desc' };
    },

    // AddSearch歷史
    addSearchHistory: (state, action: PayloadAction<any>) => {
      state.searchHistory.unshift(action.payload);
      // Limit歷史Record數量
      if (state.searchHistory.length > 50) {
        state.searchHistory = state.searchHistory.slice(0, 50);
      }
    },

    // ClearSearch歷史
    clearSearchHistory: state => {
      state.searchHistory = [];
    },

    // Add最近Search
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const _query = action.payload.trim();
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query);
        // Limit最近Search數量
        if (state.recentSearches.length > 10) {
          state.recentSearches = state.recentSearches.slice(0, 10);
        }
      }
    },

    // Clear最近Search
    clearRecentSearches: state => {
      state.recentSearches = [];
    },

    // Settings熱門Search
    setPopularSearches: (state, action: PayloadAction<any[]>) => {
      state.popularSearches = action.payload;
    },

    // UpdateSearchPreferences
    updateSearchPreferences: (
      state,
      action: PayloadAction<Partial<SearchState['searchPreferences']>>
    ) => {
      state.searchPreferences = {
        ...state.searchPreferences,
        ...action.payload,
      };
    },

    // SettingsSearch建議
    setSuggestions: (state, action: PayloadAction<string[]>) => {
      state.suggestions = action.payload;
    },

    // ClearSearch建議
    clearSuggestions: state => {
      state.suggestions = [];
    },

    // SettingsError
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // ClearError
    clearError: state => {
      state.error = null;
    },

    // ResetSearchStatus
    resetSearchState: state => {
      return { ...initialState, searchPreferences: state.searchPreferences };
    },
  },
  extraReducers: builder => {
    builder
      // InitializeSearchService
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

      // 執RowSearch
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

          // Update當前Query和Filter器
          state.currentQuery = action.payload.query;
          state.currentFilters = action.payload.filters;
          state.currentSortBy = action.payload.sortBy;

          // Add到最近Search
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

      // GetSearchStatistics
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

      // UpdateSearchIndex
      .addCase(updateSearchIndex.pending, state => {
        state.error = null;
      })
      .addCase(updateSearchIndex.fulfilled, (state, action) => {
        // UpdateIndexStatus
        const { indexName } = action.payload;
        const _index = state.searchIndexes.find(idx => idx.id === indexName);
        if (index) {
          index.lastUpdated = new Date();
        }
      })
      .addCase(updateSearchIndex.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
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

// Export selectors
export const _selectSearchResults = (state: { search: SearchState }) =>
  state.search.results;
export const _selectSearchTotal = (state: { search: SearchState }) =>
  state.search.total;
export const _selectSearchPage = (state: { search: SearchState }) =>
  state.search.page;
export const _selectSearchLimit = (state: { search: SearchState }) =>
  state.search.limit;
export const _selectSearchTotalPages = (state: { search: SearchState }) =>
  state.search.totalPages;
export const _selectCurrentQuery = (state: { search: SearchState }) =>
  state.search.currentQuery;
export const _selectCurrentFilters = (state: { search: SearchState }) =>
  state.search.currentFilters;
export const _selectCurrentSortBy = (state: { search: SearchState }) =>
  state.search.currentSortBy;
export const _selectSearchTime = (state: { search: SearchState }) =>
  state.search.searchTime;
export const _selectSearchSuggestions = (state: { search: SearchState }) =>
  state.search.suggestions;
export const _selectSearchFacets = (state: { search: SearchState }) =>
  state.search.facets;
export const _selectIsSearchLoading = (state: { search: SearchState }) =>
  state.search.isLoading;
export const _selectIsSearchInitializing = (state: { search: SearchState }) =>
  state.search.isInitializing;
export const _selectSearchError = (state: { search: SearchState }) =>
  state.search.error;
export const _selectSearchHistory = (state: { search: SearchState }) =>
  state.search.searchHistory;
export const _selectSearchStats = (state: { search: SearchState }) =>
  state.search.searchStats;
export const _selectSearchIndexes = (state: { search: SearchState }) =>
  state.search.searchIndexes;
export const _selectSearchConfig = (state: { search: SearchState }) =>
  state.search.searchConfig;
export const _selectRecentSearches = (state: { search: SearchState }) =>
  state.search.recentSearches;
export const _selectPopularSearches = (state: { search: SearchState }) =>
  state.search.popularSearches;
export const _selectSearchPreferences = (state: { search: SearchState }) =>
  state.search.searchPreferences;

// Export reducer
export default searchSlice.reducer;
