import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { IntelligentSearchService } from '../../features/search/services/intelligentSearchService';
import type {
  AutoCompleteOption,
  IntelligentSearchConfig,
  IntelligentSearchFilters,
  IntelligentSearchQuery,
  IntelligentSearchResult,
  IntelligentSearchStats,
  PopularSearchItem,
  QueryAnalysis,
  RelatedSearchItem,
  SearchContext,
  SearchHistoryItem,
  UserSearchPreferences,
} from '../../features/search/types/intelligentSearch';

// 智能SearchStatusInterface
interface IntelligentSearchState {
  // ServiceStatus
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // 當前SearchStatus
  currentQuery: string;
  currentContext?: SearchContext;
  currentPreferences?: UserSearchPreferences;
  currentFilters?: IntelligentSearchFilters;

  // Search結果
  results: IntelligentSearchResult[];
  suggestions: AutoCompleteOption[];
  semanticMatches: unknown[];
  autoComplete: AutoCompleteOption[];
  searchHistory: SearchHistoryItem[];
  popularSearches: PopularSearchItem[];
  relatedSearches: RelatedSearchItem[];

  // SearchStatistics和Analysis
  searchStats: IntelligentSearchStats;
  queryAnalysis: QueryAnalysis | null;
  personalizationScore: number;

  // ResponseInformation
  responseTime: number;
  cacheHit: boolean;
  totalResults: number;

  // Configure
  config: IntelligentSearchConfig;

  // UserPreferences
  userPreferences: Map<string, UserSearchPreferences>;

  // Search歷史
  searchHistoryMap: Map<string, SearchHistoryItem[]>;

  // 最近Search
  recentSearches: string[];

  // 熱門Search
  popularSearchesList: PopularSearchItem[];

  // 相OffSearch
  relatedSearchesList: RelatedSearchItem[];

  // AutoComplete
  autoCompleteOptions: AutoCompleteOption[];

  // 語義匹配
  semanticMatchesList: unknown[];

  // Search建議
  searchSuggestions: AutoCompleteOption[];

  // SearchStatistics
  searchStatistics: IntelligentSearchStats;

  // QueryAnalysis
  queryAnalysisData: QueryAnalysis | null;

  // 個性化分數
  personalizationScores: Map<string, number>;

  // ResponseTime
  responseTimes: number[];

  // Cache命中
  cacheHits: boolean[];

  // 總結果數
  totalResultsCount: number;
}

// 初始Status
const initialState: IntelligentSearchState = {
  isInitialized: false,
  isLoading: false,
  error: null,

  currentQuery: '',
  currentContext: undefined,
  currentPreferences: undefined,
  currentFilters: undefined,

  results: [],
  suggestions: [],
  semanticMatches: [],
  autoComplete: [],
  searchHistory: [],
  popularSearches: [],
  relatedSearches: [],

  searchStats: {
    totalQueries: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    semanticUsageRate: 0,
    personalizationUsageRate: 0,
    userSatisfactionScore: 0,
    topQueries: [],
    searchTrends: [],
    categoryDistribution: [],
    timeDistribution: [],
  },
  queryAnalysis: null,
  personalizationScore: 0,

  responseTime: 0,
  cacheHit: false,
  totalResults: 0,

  config: {
    semanticSearchEnabled: true,
    personalizationEnabled: true,
    autoCompleteEnabled: true,
    searchHistoryEnabled: true,
    suggestionsEnabled: true,
    cacheEnabled: true,
    maxSuggestions: 10,
    maxHistoryItems: 50,
    maxResults: 100,
    semanticThreshold: 0.7,
    relevanceThreshold: 0.5,
    cacheTTL: 300000,
    personalizationWeight: 0.3,
    popularityWeight: 0.2,
    recencyWeight: 0.1,
    semanticWeight: 0.4,
  },

  userPreferences: new Map(),
  searchHistoryMap: new Map(),
  recentSearches: [],
  popularSearchesList: [],
  relatedSearchesList: [],
  autoCompleteOptions: [],
  semanticMatchesList: [],
  searchSuggestions: [],
  searchStatistics: {
    totalQueries: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    semanticUsageRate: 0,
    personalizationUsageRate: 0,
    userSatisfactionScore: 0,
    topQueries: [],
    searchTrends: [],
    categoryDistribution: [],
    timeDistribution: [],
  },
  queryAnalysisData: null,
  personalizationScores: new Map(),
  responseTimes: [],
  cacheHits: [],
  totalResultsCount: 0,
};

// Async Thunk Actions
export const _initializeIntelligentSearchService = createAsyncThunk(
  'intelligentSearch/initialize',
  async () => {
    const _service = IntelligentSearchService.getInstance();
    const _success = await service.initialize();
    if (!success) {
      throw new Error('智能搜索ServiceInitializeFailed');
    }
    return service.getConfig();
  }
);

export const _performIntelligentSearch = createAsyncThunk(
  'intelligentSearch/search',
  async (query: IntelligentSearchQuery) => {
    const _service = IntelligentSearchService.getInstance();
    if (!service.getInitializationStatus()) {
      throw new Error('智能搜索Service尚未Initialize');
    }
    return service.search(query);
  }
);

export const _getIntelligentSearchSuggestions = createAsyncThunk(
  'intelligentSearch/getSuggestions',
  async ({ query, context }: { query: string; context?: SearchContext }) => {
    const _service = IntelligentSearchService.getInstance();
    return service.getSuggestions(query, context);
  }
);

export const _getIntelligentSearchHistory = createAsyncThunk(
  'intelligentSearch/getSearchHistory',
  async (userId: string) => {
    const _service = IntelligentSearchService.getInstance();
    return service.getSearchHistory(userId);
  }
);

export const _saveIntelligentSearchHistory = createAsyncThunk(
  'intelligentSearch/saveSearchHistory',
  async ({
    userId,
    query,
    results,
  }: {
    userId: string;
    query: string;
    results: string[];
  }) => {
    const _service = IntelligentSearchService.getInstance();
    await service.saveSearchHistory(userId, query, results);
    return { userId, query, results };
  }
);

export const _getIntelligentPopularSearches = createAsyncThunk(
  'intelligentSearch/getPopularSearches',
  async (category?: string) => {
    const _service = IntelligentSearchService.getInstance();
    return service.getPopularSearches(category);
  }
);

export const _getIntelligentRelatedSearches = createAsyncThunk(
  'intelligentSearch/getRelatedSearches',
  async (query: string) => {
    const _service = IntelligentSearchService.getInstance();
    return service.getRelatedSearches(query);
  }
);

export const _analyzeIntelligentQuery = createAsyncThunk(
  'intelligentSearch/analyzeQuery',
  async (query: string) => {
    const _service = IntelligentSearchService.getInstance();
    return service.analyzeQuery(query);
  }
);

export const _updateIntelligentUserPreferences = createAsyncThunk(
  'intelligentSearch/updateUserPreferences',
  async ({
    userId,
    preferences,
  }: {
    userId: string;
    preferences: UserSearchPreferences;
  }) => {
    const _service = IntelligentSearchService.getInstance();
    await service.updateUserPreferences(userId, preferences);
    return { userId, preferences };
  }
);

export const _getIntelligentUserPreferences = createAsyncThunk(
  'intelligentSearch/getUserPreferences',
  async (userId: string) => {
    const _service = IntelligentSearchService.getInstance();
    return service.getUserPreferences(userId);
  }
);

export const _getIntelligentSearchStats = createAsyncThunk(
  'intelligentSearch/getSearchStats',
  async () => {
    const _service = IntelligentSearchService.getInstance();
    return service.getSearchStats();
  }
);

export const _clearIntelligentSearchHistory = createAsyncThunk(
  'intelligentSearch/clearSearchHistory',
  async (userId: string) => {
    const _service = IntelligentSearchService.getInstance();
    await service.clearSearchHistory(userId);
    return userId;
  }
);

// Slice
const _intelligentSearchSlice = createSlice({
  name: 'intelligentSearch',
  initialState,
  reducers: {
    // 基本StatusManage
    setCurrentQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
    },

    setCurrentContext: (state, action: PayloadAction<SearchContext>) => {
      state.currentContext = action.payload;
    },

    setCurrentPreferences: (
      state,
      action: PayloadAction<UserSearchPreferences>
    ) => {
      state.currentPreferences = action.payload;
    },

    setCurrentFilters: (
      state,
      action: PayloadAction<IntelligentSearchFilters>
    ) => {
      state.currentFilters = action.payload;
    },

    updateCurrentFilters: (
      state,
      action: PayloadAction<Partial<IntelligentSearchFilters>>
    ) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload };
    },

    // 結果Manage
    clearIntelligentSearchResults: state => {
      state.results = [];
      state.suggestions = [];
      state.semanticMatches = [];
      state.autoComplete = [];
      state.relatedSearches = [];
      state.totalResults = 0;
    },

    clearIntelligentSearchQuery: state => {
      state.currentQuery = '';
      state.currentContext = undefined;
      state.currentFilters = undefined;
    },

    // Search歷史Manage
    addIntelligentSearchHistory: (
      state,
      action: PayloadAction<SearchHistoryItem>
    ) => {
      state.searchHistory.unshift(action.payload);
      if (state.searchHistory.length > state.config.maxHistoryItems) {
        state.searchHistory.splice(state.config.maxHistoryItems);
      }
    },

    clearIntelligentSearchHistory: state => {
      state.searchHistory = [];
    },

    // 最近SearchManage
    addIntelligentRecentSearch: (state, action: PayloadAction<string>) => {
      const _query = action.payload;
      state.recentSearches = state.recentSearches.filter(q => q !== query);
      state.recentSearches.unshift(query);
      if (state.recentSearches.length > 10) {
        state.recentSearches.splice(10);
      }
    },

    clearIntelligentRecentSearches: state => {
      state.recentSearches = [];
    },

    // 熱門SearchManage
    setIntelligentPopularSearches: (
      state,
      action: PayloadAction<PopularSearchItem[]>
    ) => {
      state.popularSearches = action.payload;
    },

    // 相OffSearchManage
    setIntelligentRelatedSearches: (
      state,
      action: PayloadAction<RelatedSearchItem[]>
    ) => {
      state.relatedSearches = action.payload;
    },

    // AutoCompleteManage
    setIntelligentAutoComplete: (
      state,
      action: PayloadAction<AutoCompleteOption[]>
    ) => {
      state.autoComplete = action.payload;
    },

    clearIntelligentAutoComplete: state => {
      state.autoComplete = [];
    },

    // 語義匹配Manage
    setIntelligentSemanticMatches: (state, action: PayloadAction<any[]>) => {
      state.semanticMatches = action.payload;
    },

    // Search建議Manage
    setIntelligentSearchSuggestions: (
      state,
      action: PayloadAction<AutoCompleteOption[]>
    ) => {
      state.suggestions = action.payload;
    },

    clearIntelligentSearchSuggestions: state => {
      state.suggestions = [];
    },

    // UserPreferencesManage
    updateIntelligentUserPreferences: (
      state,
      action: PayloadAction<{
        userId: string;
        preferences: UserSearchPreferences;
      }>
    ) => {
      const { userId, preferences } = action.payload;
      state.userPreferences.set(userId, preferences);
    },

    // ConfigureManage
    updateIntelligentSearchConfig: (
      state,
      action: PayloadAction<Partial<IntelligentSearchConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },

    // ErrorManage
    setIntelligentSearchError: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.error = action.payload;
    },

    clearIntelligentSearchError: state => {
      state.error = null;
    },

    // ResetStatus
    resetIntelligentSearchState: state => {
      return {
        ...initialState,
        config: state.config,
        userPreferences: state.userPreferences,
        searchHistoryMap: state.searchHistoryMap,
      };
    },

    // 個性化分數Manage
    setIntelligentPersonalizationScore: (
      state,
      action: PayloadAction<{ userId: string; score: number }>
    ) => {
      const { userId, score } = action.payload;
      state.personalizationScores.set(userId, score);
    },

    // ResponseTimeManage
    addIntelligentResponseTime: (state, action: PayloadAction<number>) => {
      state.responseTimes.push(action.payload);
      if (state.responseTimes.length > 100) {
        state.responseTimes.shift();
      }
    },

    // Cache命中Manage
    addIntelligentCacheHit: (state, action: PayloadAction<boolean>) => {
      state.cacheHits.push(action.payload);
      if (state.cacheHits.length > 100) {
        state.cacheHits.shift();
      }
    },

    // 總結果數Manage
    setIntelligentTotalResults: (state, action: PayloadAction<number>) => {
      state.totalResults = action.payload;
    },
  },
  extraReducers: builder => {
    // InitializeService
    builder
      .addCase(initializeIntelligentSearchService.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        initializeIntelligentSearchService.fulfilled,
        (state, action) => {
          state.isLoading = false;
          state.isInitialized = true;
          state.config = action.payload;
        }
      )
      .addCase(initializeIntelligentSearchService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'InitializeFailed';
      });

    // 執RowSearch
    builder
      .addCase(performIntelligentSearch.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performIntelligentSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        const _response = action.payload;
        state.results = response.results;
        state.suggestions = response.suggestions.map(suggestion => ({
          text: suggestion.text,
          type: 'suggestion' as const,
          relevance: suggestion.score || 0,
          category: suggestion.metadata?.category,
          icon: suggestion.metadata?.icon,
        }));
        state.semanticMatches = response.semanticMatches;
        state.autoComplete = response.autoComplete;
        state.searchHistory = response.searchHistory;
        state.popularSearches = response.popularSearches;
        state.relatedSearches = response.relatedSearches;
        state.searchStats = response.searchStats;
        state.queryAnalysis = response.queryAnalysis;
        state.personalizationScore = response.personalizationScore;
        state.responseTime = response.responseTime;
        state.cacheHit = response.cacheHit;
        state.totalResults = response.results.length;
      })
      .addCase(performIntelligentSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '搜索Failed';
      });

    // Get建議
    builder.addCase(
      getIntelligentSearchSuggestions.fulfilled,
      (state, action) => {
        state.suggestions = action.payload;
      }
    );

    // GetSearch歷史
    builder.addCase(getIntelligentSearchHistory.fulfilled, (state, action) => {
      state.searchHistory = action.payload;
    });

    // SaveSearch歷史
    builder.addCase(saveIntelligentSearchHistory.fulfilled, (state, action) => {
      const { userId, query, results } = action.payload;
      const historyItem: SearchHistoryItem = {
        query,
        timestamp: Date.now(),
        resultCount: results.length,
        clickedResults: [],
        success: results.length > 0,
      };
      state.searchHistory.unshift(historyItem);
    });

    // Get熱門Search
    builder.addCase(
      getIntelligentPopularSearches.fulfilled,
      (state, action) => {
        state.popularSearches = action.payload;
      }
    );

    // Get相OffSearch
    builder.addCase(
      getIntelligentRelatedSearches.fulfilled,
      (state, action) => {
        state.relatedSearches = action.payload;
      }
    );

    // AnalysisQuery
    builder.addCase(analyzeIntelligentQuery.fulfilled, (state, action) => {
      state.queryAnalysis = action.payload;
    });

    // UpdateUserPreferences
    builder.addCase(
      updateIntelligentUserPreferences.fulfilled,
      (state, action) => {
        const { userId, preferences } = action.payload;
        state.userPreferences.set(userId, preferences);
      }
    );

    // GetUserPreferences
    builder.addCase(
      getIntelligentUserPreferences.fulfilled,
      (state, action) => {
        // 這裡需要知道Yes哪個User的Preferences，暫時Storage在當前Preferences中
        state.currentPreferences = action.payload;
      }
    );

    // GetSearchStatistics
    builder.addCase(getIntelligentSearchStats.fulfilled, (state, action) => {
      state.searchStats = action.payload;
    });

    // ClearSearch歷史
    builder.addCase(clearIntelligentSearchHistory.fulfilled, state => {
      state.searchHistory = [];
    });
  },
});

// Export actions
export const {
  setCurrentQuery,
  setCurrentContext,
  setCurrentPreferences,
  setCurrentFilters,
  updateCurrentFilters,
  clearIntelligentSearchResults,
  clearIntelligentSearchQuery,
  addIntelligentSearchHistory,
  addIntelligentRecentSearch,
  clearIntelligentRecentSearches,
  setIntelligentPopularSearches,
  setIntelligentRelatedSearches,
  setIntelligentAutoComplete,
  clearIntelligentAutoComplete,
  setIntelligentSemanticMatches,
  setIntelligentSearchSuggestions,
  clearIntelligentSearchSuggestions,
  updateIntelligentSearchConfig,
  setIntelligentSearchError,
  clearIntelligentSearchError,
  resetIntelligentSearchState,
  setIntelligentPersonalizationScore,
  addIntelligentResponseTime,
  addIntelligentCacheHit,
  setIntelligentTotalResults,
} = intelligentSearchSlice.actions;

// Export reducer
export default intelligentSearchSlice.reducer;
