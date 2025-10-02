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

// 狀態接口
export interface HybridRecommendationState {
  // 推薦數據
  recommendations: HybridRecommendation[];
  total: number;

  // 配置
  config: HybridRecommendationConfig | null;

  // 統計信息
  stats: HybridRecommendationStats | null;

  // 過濾器和選項
  filters: HybridFilters | null;
  options: HybridOptions | null;

  // 分頁
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // 加載狀態
  loading: {
    recommendations: boolean;
    config: boolean;
    stats: boolean;
  };

  // 錯誤狀態
  error: {
    recommendations: string | null;
    config: string | null;
    stats: string | null;
  };

  // 事件監聽器
  eventListeners: Map<string, (event: HybridRecommendationEvent) => void>;
}

// 初始狀態
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

// 異步 Thunks

/**
 * 初始化混合推薦系統
 */
export const initializeHybridRecommendation = createAsyncThunk(
  'hybridRecommendation/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const service = HybridRecommendationService.getInstance();
      await service.initialize();

      const config = service.getConfig();
      const stats = service.getStats();

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
 * 獲取混合推薦
 */
export const getHybridRecommendations = createAsyncThunk(
  'hybridRecommendation/getRecommendations',
  async (request: GetHybridRecommendationsRequest, { rejectWithValue }) => {
    try {
      const service = HybridRecommendationService.getInstance();
      const response = await service.getRecommendations(request);
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
 * 記錄推薦點擊
 */
export const recordRecommendationClick = createAsyncThunk(
  'hybridRecommendation/recordClick',
  async (
    {
      userId,
      recommendation,
    }: { userId: string; recommendation: HybridRecommendation },
    { rejectWithValue }
  ) => {
    try {
      const service = HybridRecommendationService.getInstance();
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
 * 記錄推薦評分
 */
export const recordRecommendationRating = createAsyncThunk(
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
      const service = HybridRecommendationService.getInstance();
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
 * 獲取配置
 */
export const getHybridRecommendationConfig = createAsyncThunk(
  'hybridRecommendation/getConfig',
  async (_, { rejectWithValue }) => {
    try {
      const service = HybridRecommendationService.getInstance();
      const config = service.getConfig();
      return config;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to get config'
      );
    }
  }
);

/**
 * 更新配置
 */
export const updateHybridRecommendationConfig = createAsyncThunk(
  'hybridRecommendation/updateConfig',
  async (config: Partial<HybridRecommendationConfig>, { rejectWithValue }) => {
    try {
      const service = HybridRecommendationService.getInstance();
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
 * 獲取統計信息
 */
export const getHybridRecommendationStats = createAsyncThunk(
  'hybridRecommendation/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const service = HybridRecommendationService.getInstance();
      const stats = service.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to get stats'
      );
    }
  }
);

// Slice
const hybridRecommendationSlice = createSlice({
  name: 'hybridRecommendation',
  initialState,
  reducers: {
    // 重置狀態
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

    // 設置過濾器
    setFilters: (state, action: PayloadAction<HybridFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1; // 重置到第一頁
    },

    // 設置選項
    setOptions: (state, action: PayloadAction<HybridOptions>) => {
      state.options = action.payload;
    },

    // 設置分頁
    setPagination: (
      state,
      action: PayloadAction<{ page: number; limit: number }>
    ) => {
      state.pagination.page = action.payload.page;
      state.pagination.limit = action.payload.limit;
    },

    // 清除錯誤
    clearError: (
      state,
      action: PayloadAction<'recommendations' | 'config' | 'stats'>
    ) => {
      state.error[action.payload] = null;
    },

    // 添加事件監聽器
    addEventListener: (
      state,
      action: PayloadAction<{
        eventType: string;
        listener: (event: HybridRecommendationEvent) => void;
      }>
    ) => {
      // 事件監聽器功能暫時不可用
      state.eventListeners.set(
        action.payload.eventType,
        action.payload.listener
      );
    },

    // 移除事件監聽器
    removeEventListener: (state, action: PayloadAction<string>) => {
      // 事件監聽器功能暫時不可用
      state.eventListeners.delete(action.payload);
    },

    // 更新推薦算法
    updateAlgorithm: (state, action: PayloadAction<HybridAlgorithm>) => {
      if (state.config) {
        state.config.algorithm = action.payload;
      }
    },

    // 更新權重
    updateWeights: (state, action: PayloadAction<Partial<HybridWeights>>) => {
      if (state.config) {
        state.config.weights = { ...state.config.weights, ...action.payload };
      }
    },

    // 更新上下文
    updateContext: (state, action: PayloadAction<RecommendationContext>) => {
      // 可以存儲當前上下文用於後續請求
    },
  },
  extraReducers: builder => {
    builder
      // 初始化
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

      // 獲取推薦
      .addCase(getHybridRecommendations.pending, state => {
        state.loading.recommendations = true;
        state.error.recommendations = null;
      })
      .addCase(getHybridRecommendations.fulfilled, (state, action) => {
        state.loading.recommendations = false;
        state.recommendations = action.payload.recommendations;
        state.total = action.payload.total;
        state.pagination.total = action.payload.total;

        // 更新統計信息
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

      // 記錄點擊
      .addCase(recordRecommendationClick.fulfilled, (state, action) => {
        // 可以更新統計信息或推薦狀態
        if (state.stats) {
          state.stats.userEngagement.clickThroughRate =
            (state.stats.userEngagement.clickThroughRate + 1) / 2;
        }
      })

      // 記錄評分
      .addCase(recordRecommendationRating.fulfilled, (state, action) => {
        // 可以更新統計信息或推薦狀態
        if (state.stats) {
          state.stats.userEngagement.satisfactionScore =
            (state.stats.userEngagement.satisfactionScore +
              action.payload.rating) /
            2;
        }
      })

      // 獲取配置
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

      // 更新配置
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

      // 獲取統計
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

// 導出 actions
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

// 選擇器
export const selectHybridRecommendations = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.recommendations;

export const selectHybridRecommendationTotal = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.total;

export const selectHybridRecommendationConfig = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.config;

export const selectHybridRecommendationStats = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats;

export const selectHybridRecommendationFilters = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.filters;

export const selectHybridRecommendationOptions = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.options;

export const selectHybridRecommendationPagination = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.pagination;

export const selectHybridRecommendationLoading = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.loading;

export const selectHybridRecommendationError = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.error;

// 計算選擇器
export const selectHybridRecommendationIsLoading = (state: {
  hybridRecommendation: HybridRecommendationState;
}) =>
  Object.values(state.hybridRecommendation.loading).some(loading => loading);

export const selectHybridRecommendationHasError = (state: {
  hybridRecommendation: HybridRecommendationState;
}) =>
  Object.values(state.hybridRecommendation.error).some(error => error !== null);

export const selectHybridRecommendationIsInitialized = (state: {
  hybridRecommendation: HybridRecommendationState;
}) =>
  state.hybridRecommendation.config !== null &&
  state.hybridRecommendation.stats !== null;

export const selectHybridRecommendationPerformance = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.performanceMetrics;

export const selectHybridRecommendationUserEngagement = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.userEngagement;

export const selectHybridRecommendationCacheStats = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.cacheStats;

export const selectHybridRecommendationAlgorithmDistribution = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.algorithmDistribution;

export const selectHybridRecommendationFactorDistribution = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.factorDistribution;

export const selectHybridRecommendationReasonDistribution = (state: {
  hybridRecommendation: HybridRecommendationState;
}) => state.hybridRecommendation.stats?.reasonDistribution;

// 導出 reducer
export default hybridRecommendationSlice.reducer;
