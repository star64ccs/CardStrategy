import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import ContentRecommendationService from '../../features/recommendation/services/contentRecommendationService';
import type {
  ContentRecommendation,
  ContentSimilarity,
  GetContentRecommendationsRequest,
  GetContentRecommendationsResponse,
  ContentRecommendationConfig,
  ContentRecommendationStats,
  UserPreference,
  ContentFilters,
  RecommendationOptions,
  PerformanceMetrics,
} from '../../features/recommendation/types/contentRecommendation';

// StatusInterface
export interface ContentRecommendationState {
  // 推薦Data
  recommendations: ContentRecommendation[];
  similarContent: ContentSimilarity[];

  // Configure和Statistics
  config: ContentRecommendationConfig | null;
  stats: ContentRecommendationStats | null;

  // Filter器和Options
  filters: ContentFilters;
  options: RecommendationOptions;

  // Paginate
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
  };

  // 加載Status
  loading: {
    recommendations: boolean;
    similarContent: boolean;
    config: boolean;
    stats: boolean;
  };

  // ErrorStatus
  error: {
    recommendations: string | null;
    similarContent: string | null;
    config: string | null;
    stats: string | null;
  };

  // 性能指標
  performanceMetrics: PerformanceMetrics | null;

  // 最後UpdateTime
  lastUpdated: Date | null;
}

// 初始Status
const initialState: ContentRecommendationState = {
  recommendations: [],
  similarContent: [],
  config: null,
  stats: null,
  filters: {},
  options: {},
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
  },
  loading: {
    recommendations: false,
    similarContent: false,
    config: false,
    stats: false,
  },
  error: {
    recommendations: null,
    similarContent: null,
    config: null,
    stats: null,
  },
  performanceMetrics: null,
  lastUpdated: null,
};

// Async Thunk Actions
export const _initializeContentRecommendation = createAsyncThunk(
  'contentRecommendation/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const _service = ContentRecommendationService.getInstance();
      await service.initialize();
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'InitializeFailed'
      );
    }
  }
);

export const _getContentRecommendations = createAsyncThunk(
  'contentRecommendation/getRecommendations',
  async (request: GetContentRecommendationsRequest, { rejectWithValue }) => {
    try {
      const _service = ContentRecommendationService.getInstance();
      const _response = await service.getContentRecommendations(request);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Get推薦Failed'
      );
    }
  }
);

export const _getSimilarContent = createAsyncThunk(
  'contentRecommendation/getSimilarContent',
  async (
    {
      contentId,
      limit,
      similarityMethod,
    }: {
      contentId: string;
      limit?: number;
      similarityMethod?: unknown;
    },
    { rejectWithValue }
  ) => {
    try {
      const _service = ContentRecommendationService.getInstance();
      const _similarities = await service.getSimilarContent(
        contentId,
        limit,
        similarityMethod
      );
      return similarities;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Get相似內容Failed'
      );
    }
  }
);

export const _updateUserPreference = createAsyncThunk(
  'contentRecommendation/updateUserPreference',
  async (
    {
      userId,
      preference,
    }: {
      userId: string;
      preference: Partial<UserPreference>;
    },
    { rejectWithValue }
  ) => {
    try {
      const _service = ContentRecommendationService.getInstance();
      await service.updateUserPreference(userId, preference);
      return { userId, preference };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Update用戶偏好Failed'
      );
    }
  }
);

export const _recordUserInteraction = createAsyncThunk(
  'contentRecommendation/recordUserInteraction',
  async (
    {
      userId,
      contentId,
      interaction,
    }: {
      userId: string;
      contentId: string;
      interaction: unknown;
    },
    { rejectWithValue }
  ) => {
    try {
      const _service = ContentRecommendationService.getInstance();
      await service.recordUserInteraction(userId, contentId, interaction);
      return { userId, contentId, interaction };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '記錄用戶互動Failed'
      );
    }
  }
);

export const _getContentRecommendationConfig = createAsyncThunk(
  'contentRecommendation/getConfig',
  async (_, { rejectWithValue }) => {
    try {
      const _service = ContentRecommendationService.getInstance();
      const _config = service.getConfig();
      return config;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'GetConfigureFailed'
      );
    }
  }
);

export const _updateContentRecommendationConfig = createAsyncThunk(
  'contentRecommendation/updateConfig',
  async (config: Partial<ContentRecommendationConfig>, { rejectWithValue }) => {
    try {
      const _service = ContentRecommendationService.getInstance();
      service.updateConfig(config);
      return config;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'UpdateConfigureFailed'
      );
    }
  }
);

export const _getContentRecommendationStats = createAsyncThunk(
  'contentRecommendation/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const _service = ContentRecommendationService.getInstance();
      const _stats = service.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Get統計Failed'
      );
    }
  }
);

// Slice
const _contentRecommendationSlice = createSlice({
  name: 'contentRecommendation',
  initialState,
  reducers: {
    // ResetStatus
    resetContentRecommendation: state => {
      state.recommendations = [];
      state.similarContent = [];
      state.error = {
        recommendations: null,
        similarContent: null,
        config: null,
        stats: null,
      };
      state.lastUpdated = null;
    },

    // SettingsFilter器
    setFilters: (state, action: PayloadAction<ContentFilters>) => {
      state.filters = action.payload;
    },

    // SettingsOptions
    setOptions: (state, action: PayloadAction<RecommendationOptions>) => {
      state.options = action.payload;
    },

    // SettingsPaginate
    setPagination: (
      state,
      action: PayloadAction<{
        currentPage: number;
        pageSize: number;
        totalCount: number;
      }>
    ) => {
      state.pagination = action.payload;
    },

    // ClearError
    clearError: (
      state,
      action: PayloadAction<keyof ContentRecommendationState['error']>
    ) => {
      state.error[action.payload] = null;
    },

    // AddEvent監聽器
    addEventListener: (
      state,
      action: PayloadAction<{ event: string; listener: Function }>
    ) => {
      const _service = ContentRecommendationService.getInstance();
      service.addEventListener(action.payload.event, action.payload.listener);
    },

    // RemoveEvent監聽器
    removeEventListener: (
      state,
      action: PayloadAction<{ event: string; listener: Function }>
    ) => {
      const _service = ContentRecommendationService.getInstance();
      service.removeEventListener(
        action.payload.event,
        action.payload.listener
      );
    },
  },
  extraReducers: builder => {
    // Initialize
    builder
      .addCase(initializeContentRecommendation.pending, state => {
        state.loading.config = true;
        state.error.config = null;
      })
      .addCase(initializeContentRecommendation.fulfilled, state => {
        state.loading.config = false;
        state.lastUpdated = new Date();
      })
      .addCase(initializeContentRecommendation.rejected, (state, action) => {
        state.loading.config = false;
        state.error.config = action.payload as string;
      });

    // Get推薦
    builder
      .addCase(getContentRecommendations.pending, state => {
        state.loading.recommendations = true;
        state.error.recommendations = null;
      })
      .addCase(
        getContentRecommendations.fulfilled,
        (state, action: PayloadAction<GetContentRecommendationsResponse>) => {
          state.loading.recommendations = false;
          state.recommendations = action.payload.recommendations;
          state.pagination.totalCount = action.payload.totalCount;
          state.performanceMetrics = action.payload.performanceMetrics;
          state.lastUpdated = new Date();
        }
      )
      .addCase(getContentRecommendations.rejected, (state, action) => {
        state.loading.recommendations = false;
        state.error.recommendations = action.payload as string;
      });

    // Get相似Content
    builder
      .addCase(getSimilarContent.pending, state => {
        state.loading.similarContent = true;
        state.error.similarContent = null;
      })
      .addCase(
        getSimilarContent.fulfilled,
        (state, action: PayloadAction<ContentSimilarity[]>) => {
          state.loading.similarContent = false;
          state.similarContent = action.payload;
          state.lastUpdated = new Date();
        }
      )
      .addCase(getSimilarContent.rejected, (state, action) => {
        state.loading.similarContent = false;
        state.error.similarContent = action.payload as string;
      });

    // UpdateUserPreferences
    builder
      .addCase(updateUserPreference.fulfilled, state => {
        state.lastUpdated = new Date();
      })
      .addCase(updateUserPreference.rejected, (state, action) => {
        state.error.recommendations = action.payload as string;
      });

    // RecordUser互動
    builder
      .addCase(recordUserInteraction.fulfilled, state => {
        state.lastUpdated = new Date();
      })
      .addCase(recordUserInteraction.rejected, (state, action) => {
        state.error.recommendations = action.payload as string;
      });

    // GetConfigure
    builder
      .addCase(getContentRecommendationConfig.pending, state => {
        state.loading.config = true;
        state.error.config = null;
      })
      .addCase(
        getContentRecommendationConfig.fulfilled,
        (state, action: PayloadAction<ContentRecommendationConfig>) => {
          state.loading.config = false;
          state.config = action.payload;
          state.lastUpdated = new Date();
        }
      )
      .addCase(getContentRecommendationConfig.rejected, (state, action) => {
        state.loading.config = false;
        state.error.config = action.payload as string;
      });

    // UpdateConfigure
    builder
      .addCase(
        updateContentRecommendationConfig.fulfilled,
        (
          state,
          action: PayloadAction<Partial<ContentRecommendationConfig>>
        ) => {
          if (state.config) {
            state.config = { ...state.config, ...action.payload };
          }
          state.lastUpdated = new Date();
        }
      )
      .addCase(updateContentRecommendationConfig.rejected, (state, action) => {
        state.error.config = action.payload as string;
      });

    // GetStatistics
    builder
      .addCase(getContentRecommendationStats.pending, state => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(
        getContentRecommendationStats.fulfilled,
        (state, action: PayloadAction<ContentRecommendationStats>) => {
          state.loading.stats = false;
          state.stats = action.payload;
          state.lastUpdated = new Date();
        }
      )
      .addCase(getContentRecommendationStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload as string;
      });
  },
});

// Actions
export const {
  resetContentRecommendation,
  setFilters,
  setOptions,
  setPagination,
  clearError,
  addEventListener,
  removeEventListener,
} = contentRecommendationSlice.actions;

// Selectors
export const _selectContentRecommendations = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.recommendations;

export const _selectSimilarContent = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.similarContent;

export const _selectContentRecommendationConfig = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.config;

export const _selectContentRecommendationStats = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.stats;

export const _selectContentRecommendationFilters = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.filters;

export const _selectContentRecommendationOptions = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.options;

export const _selectContentRecommendationPagination = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.pagination;

export const _selectContentRecommendationLoading = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.loading;

export const _selectContentRecommendationError = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.error;

export const _selectContentRecommendationPerformanceMetrics = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.performanceMetrics;

export const _selectContentRecommendationLastUpdated = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.lastUpdated;

// 計算Select器
export const _selectContentRecommendationIsLoading = (state: {
  contentRecommendation: ContentRecommendationState;
}) =>
  Object.values(state.contentRecommendation.loading).some(loading => loading);

export const _selectContentRecommendationHasError = (state: {
  contentRecommendation: ContentRecommendationState;
}) =>
  Object.values(state.contentRecommendation.error).some(
    error => error !== null
  );

export const _selectContentRecommendationTotalPages = (state: {
  contentRecommendation: ContentRecommendationState;
}) => {
  const { totalCount, pageSize } = state.contentRecommendation.pagination;
  return Math.ceil(totalCount / pageSize);
};

export const _selectContentRecommendationRecommendationCount = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.recommendations.length;

export const _selectContentRecommendationSimilarContentCount = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.similarContent.length;

// Reducer
export default contentRecommendationSlice.reducer;
