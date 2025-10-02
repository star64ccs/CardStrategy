import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { HybridRecommendationService } from '../../features/recommendation/services/hybridRecommendationService';
import type {
  GetHybridRecommendationsRequest,
  HybridAlgorithm,
  HybridFilters,
  HybridOptions,
  HybridRecommendation,
  HybridRecommendationConfig,
  HybridRecommendationEvent,
  HybridRecommendationStats,
  HybridWeights,
  RecommendationContext,
} from '../../features/recommendation/types/hybridRecommendation';

// StatusInterface
export interface HybridRecommendationState {
  // 推薦Data
  recommendations: HybridRecommendation[];
  total: number;

  // Configure
  config: HybridRecommendationConfig | null;

  // StatisticsInformation
  stats: HybridRecommendationStats | null;

  // Filter器和Options
  filters: HybridFilters | null;
  options: HybridOptions | null;

  // Paginate
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // 加載Status
  loading: {
    recommendations: boolean;
    config: boolean;
    stats: boolean;
  };

  // ErrorStatus
  error: {
    recommendations: string | null;
    config: string | null;
    stats: string | null;
  };

  // Event監聽器
  eventListeners: Map<string, (event: HybridRecommendationEvent) => void>;
}

// 初始Status
const initialState: HybridRecommendationState = {
  recommendations: [],
  total: 0,
  config: null,
  stats: null,
  filters: null,
  options: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  loading: {
    recommendations: false,
    config: false,
    stats: false,
  },
  error: {
    recommendations: null,
    config: null,
    stats: null,
  },
  eventListeners: new Map(),
};

// Async Thunks

/**
 * Initialize混合推薦系統
 */
export const _initializeHybridRecommendation = createAsyncThunk(
  'hybridRecommendation/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const _service = HybridRecommendationService.getInstance();
      await service.initialize();

      const _config = service.getConfig();
      const _stats = service.getStats();

      return { config, stats };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to initialize hybrid recommendation'
      );
    }
  }
);

/**
 * Get混合推薦
 */
export const _getHybridRecommendations = createAsyncThunk(
  'hybridRecommendation/getRecommendations',
  async (request: GetHybridRecommendationsRequest, { rejectWithValue }) => {
    try {
      const _service = HybridRecommendationService.getInstance();
      const _response = await service.getRecommendations(request);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to get hybrid recommendations'
      );
    }
  }
);

/**
 * Record推薦點擊
 */
export const _recordRecommendationClick = createAsyncThunk(
  'hybridRecommendation/recordClick',
  async (
    {
      userId,
      recommendation,
    }: { userId: string; recommendation: HybridRecommendation },
    { rejectWithValue }
  ) => {
    try {
      const _service = HybridRecommendationService.getInstance();
      await service.recordClick(userId, recommendation);
      return { userId, recommendation };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to record recommendation click'
      );
    }
  }
);

/**
 * Record推薦評分
 */
export const _recordRecommendationRating = createAsyncThunk(
  'hybridRecommendation/recordRating',
  async (
    {
      userId,
      recommendation,
      rating,
    }: { userId: string; recommendation: HybridRecommendation; rating: number },
    { rejectWithValue }
  ) => {
    try {
      const _service = HybridRecommendationService.getInstance();
      await service.recordRating(userId, recommendation, rating);
      return { userId, recommendation, rating };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to record recommendation rating'
      );
    }
  }
);

/**
 * GetConfigure
 */
export const _getHybridRecommendationConfig = createAsyncThunk(
  'hybridRecommendation/getConfig',
  async (_, { rejectWithValue }) => {
    try {
      const _service = HybridRecommendationService.getInstance();
      const _config = service.getConfig();
      return config;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to get config'
      );
    }
  }
);

/**
 * UpdateConfigure
 */
export const _updateHybridRecommendationConfig = createAsyncThunk(
  'hybridRecommendation/updateConfig',
  async (config: Partial<HybridRecommendationConfig>, { rejectWithValue }) => {
    try {
      const _service = HybridRecommendationService.getInstance();
      service.updateConfig(config);
      return service.getConfig();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update config'
      );
    }
  }
);

/**
 * GetStatisticsInformation
 */
export const _getHybridRecommendationStats = createAsyncThunk(
  'hybridRecommendation/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const _service = HybridRecommendationService.getInstance();
      const _stats = service.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to get stats'
      );
    }
  }
);

// Slice
const _hybridRecommendationSlice = createSlice({
  name: 'hybridRecommendation',
  initialState,
  reducers: {
    // ResetStatus
    resetHybridRecommendation: state => {
      state.recommendations = [];
      state.total = 0;
      state.config = null;
      state.stats = null;
      state.filters = null;
      state.options = null;
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
      };
      state.loading = {
        recommendations: false,
        config: false,
        stats: false,
      };
      state.error = {
        recommendations: null,
        config: null,
        stats: null,
      };
    },

    // SettingsFilter器
    setFilters: (state, action: PayloadAction<HybridFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset到第一頁
    },

    // SettingsOptions
    setOptions: (state, action: PayloadAction<HybridOptions>) => {
      state.options = action.payload;
    },

    // SettingsPaginate
    setPagination: (
      state,
      action: PayloadAction<{ page: number; limit: number }>
    ) => {
      state.pagination.page = action.payload.page;
      state.pagination.limit = action.payload.limit;
    },

    // ClearError
    clearError: (
      state,
      action: PayloadAction<'recommendations' | 'config' | 'stats'>
    ) => {
      state.error[action.payload] = null;
    },

    // AddEvent監聽器
    addEventListener: (
      state,
      action: PayloadAction<{
        eventType: string;
        listener: (event: HybridRecommendationEvent) => void;
      }>
    ) => {
      // Event監聽器功能暫時不可用
      state.eventListeners.set(
        action.payload.eventType,
        action.payload.listener
      );
    },

    // RemoveEvent監聽器
    removeEventListener: (state, action: PayloadAction<string>) => {
      // Event監聽器功能暫時不可用
      state.eventListeners.delete(action.payload);
    },

    // Update推薦算法
    updateAlgorithm: (state, action: PayloadAction<HybridAlgorithm>) => {
      if (state.config) {
        state.config.algorithm = action.payload;
      }
    },

    // Update權重
    updateWeights: (state, action: PayloadAction<Partial<HybridWeights>>) => {
      if (state.config) {
        state.config.weights = { ...state.config.weights, ...action.payload };
      }
    },

    // Update上下文
    updateContext: (state, action: PayloadAction<RecommendationContext>) => {
      // 可以Storage當前上下文用於後續Request
    },
  },
  extraReducers: builder => {
    builder
      // Initialize
      .addCase(initializeHybridRecommendation.pending, state => {
        state.loading.config = true;
        state.loading.stats = true;
        state.error.config = null;
        state.error.stats = null;
      })
      .addCase(initializeHybridRecommendation.fulfilled, (state, action) => {
        state.loading.config = false;
        state.loading.stats = false;
        state.config = action.payload.config;
        state.stats = action.payload.stats;
      })
      .addCase(initializeHybridRecommendation.rejected, (state, action) => {
        state.loading.config = false;
        state.loading.stats = false;
        state.error.config = action.payload as string;
        state.error.stats = action.payload as string;
      })

      // Get推薦
      .addCase(getHybridRecommendations.pending, state => {
        state.loading.recommendations = true;
        state.error.recommendations = null;
      })
      .addCase(getHybridRecommendations.fulfilled, (state, action) => {
        state.loading.recommendations = false;
        state.recommendations = action.payload.recommendations;
        state.total = action.payload.total;
        state.pagination.total = action.payload.total;

        // UpdateStatisticsInformation
        if (action.payload.performance) {
          if (state.stats) {
            state.stats.performanceMetrics = action.payload.performance;
          }
        }
      })
      .addCase(getHybridRecommendations.rejected, (state, action) => {
        state.loading.recommendations = false;
        state.error.recommendations = action.payload as string;
      })

      // Record點擊
      .addCase(recordRecommendationClick.fulfilled, (state, action) => {
        // 可以UpdateStatisticsInformation或推薦Status
        if (state.stats) {
          state.stats.userEngagement.clickThroughRate =
            (state.stats.userEngagement.clickThroughRate + 1) / 2;
        }
      })

      // Record評分
      .addCase(recordRecommendationRating.fulfilled, (state, action) => {
        // 可以UpdateStatisticsInformation或推薦Status
        if (state.stats) {
          state.stats.userEngagement.satisfactionScore =
            (state.stats.userEngagement.satisfactionScore +
              action.payload.rating) /
            2;
        }
      })

      // GetConfigure
      .addCase(getHybridRecommendationConfig.pending, state => {
        state.loading.config = true;
        state.error.config = null;
      })
      .addCase(getHybridRecommendationConfig.fulfilled, (state, action) => {
        state.loading.config = false;
        state.config = action.payload;
      })
      .addCase(getHybridRecommendationConfig.rejected, (state, action) => {
        state.loading.config = false;
        state.error.config = action.payload as string;
      })

      // UpdateConfigure
      .addCase(updateHybridRecommendationConfig.pending, state => {
        state.loading.config = true;
        state.error.config = null;
      })
      .addCase(updateHybridRecommendationConfig.fulfilled, (state, action) => {
        state.loading.config = false;
        state.config = action.payload;
      })
      .addCase(updateHybridRecommendationConfig.rejected, (state, action) => {
        state.loading.config = false;
        state.error.config = action.payload as string;
      })

      // GetStatistics
      .addCase(getHybridRecommendationStats.pending, state => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(getHybridRecommendationStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(getHybridRecommendationStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload as string;
      });
  },
});

// Export actions
export const {
  resetHybridRecommendation,
  setFilters,
  setOptions,
  setPagination,
  clearError,
  addEventListener,
  removeEventListener,
  updateAlgorithm,
  updateWeights,
  updateContext,
} = hybridRecommendationSlice.actions;

// Select器
export const _selectHybridRecommendations = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.recommendations;

export const _selectHybridRecommendationTotal = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.total;

export const _selectHybridRecommendationConfig = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.config;

export const _selectHybridRecommendationStats = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats;

export const _selectHybridRecommendationFilters = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.filters;

export const _selectHybridRecommendationOptions = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.options;

export const _selectHybridRecommendationPagination = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.pagination;

export const _selectHybridRecommendationLoading = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.loading;

export const _selectHybridRecommendationError = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.error;

// 計算Select器
export const _selectHybridRecommendationIsLoading = (state: {
  hybridRecommendation: HybridRecommendationState;
}) =>
  Object.values(state.hybridRecommendation.loading).some(loading => loading);

export const _selectHybridRecommendationHasError = (state: {
  hybridRecommendation: HybridRecommendationState;
}) =>
  Object.values(state.hybridRecommendation.error).some(error => error !== null);

export const _selectHybridRecommendationIsInitialized = (state: {
  hybridRecommendation: HybridRecommendationState;
}) =>
  state.hybridRecommendation.config !== null &&
  state.hybridRecommendation.stats !== null;

export const _selectHybridRecommendationPerformance = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.performanceMetrics;

export const _selectHybridRecommendationUserEngagement = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.userEngagement;

export const _selectHybridRecommendationCacheStats = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.cacheStats;

export const _selectHybridRecommendationAlgorithmDistribution = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.algorithmDistribution;

export const _selectHybridRecommendationFactorDistribution = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.factorDistribution;

export const _selectHybridRecommendationReasonDistribution = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.reasonDistribution;

// Export reducer
export default hybridRecommendationSlice.reducer;
