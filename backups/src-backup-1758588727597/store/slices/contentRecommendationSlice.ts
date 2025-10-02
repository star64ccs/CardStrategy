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

// 狀態接口
export interface ContentRecommendationState {
  // 推薦數據
  recommendations: ContentRecommendation[];
  similarContent: ContentSimilarity[];

  // 配置和統計
  config: ContentRecommendationConfig | null;
  stats: ContentRecommendationStats | null;

  // 過濾器和選項
  filters: ContentFilters;
  options: RecommendationOptions;

  // 分頁
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
  };

  // 加載狀態
  loading: {
    recommendations: boolean;
    similarContent: boolean;
    config: boolean;
    stats: boolean;
  };

  // 錯誤狀態
  error: {
    recommendations: string | null;
    similarContent: string | null;
    config: string | null;
    stats: string | null;
  };

  // 性能指標
  performanceMetrics: PerformanceMetrics | null;

  // 最後更新時間
  lastUpdated: Date | null;
}

// 初始狀態
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

// 異步 Thunk Actions
export const initializeContentRecommendation = createAsyncThunk(
  'contentRecommendation/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const service = ContentRecommendationService.getInstance();
      await service.initialize();
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '初始化失敗'
      );
    }
  }
);

export const getContentRecommendations = createAsyncThunk(
  'contentRecommendation/getRecommendations',
  async (request: GetContentRecommendationsRequest, { rejectWithValue }) => {
    try {
      const service = ContentRecommendationService.getInstance();
      const response = await service.getContentRecommendations(request);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取推薦失敗'
      );
    }
  }
);

export const getSimilarContent = createAsyncThunk(
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
      const service = ContentRecommendationService.getInstance();
      const similarities = await service.getSimilarContent(
        contentId,
        limit,
        similarityMethod
      );
      return similarities;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取相似內容失敗'
      );
    }
  }
);

export const updateUserPreference = createAsyncThunk(
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
      const service = ContentRecommendationService.getInstance();
      await service.updateUserPreference(userId, preference);
      return { userId, preference };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '更新用戶偏好失敗'
      );
    }
  }
);

export const recordUserInteraction = createAsyncThunk(
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
      const service = ContentRecommendationService.getInstance();
      await service.recordUserInteraction(userId, contentId, interaction);
      return { userId, contentId, interaction };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '記錄用戶互動失敗'
      );
    }
  }
);

export const getContentRecommendationConfig = createAsyncThunk(
  'contentRecommendation/getConfig',
  async (_, { rejectWithValue }) => {
    try {
      const service = ContentRecommendationService.getInstance();
      const config = service.getConfig();
      return config;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取配置失敗'
      );
    }
  }
);

export const updateContentRecommendationConfig = createAsyncThunk(
  'contentRecommendation/updateConfig',
  async (config: Partial<ContentRecommendationConfig>, { rejectWithValue }) => {
    try {
      const service = ContentRecommendationService.getInstance();
      service.updateConfig(config);
      return config;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '更新配置失敗'
      );
    }
  }
);

export const getContentRecommendationStats = createAsyncThunk(
  'contentRecommendation/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const service = ContentRecommendationService.getInstance();
      const stats = service.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取統計失敗'
      );
    }
  }
);

// Slice
const contentRecommendationSlice = createSlice({
  name: 'contentRecommendation',
  initialState,
  reducers: {
    // 重置狀態
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

    // 設置過濾器
    setFilters: (state, action: PayloadAction<ContentFilters>) => {
      state.filters = action.payload;
    },

    // 設置選項
    setOptions: (state, action: PayloadAction<RecommendationOptions>) => {
      state.options = action.payload;
    },

    // 設置分頁
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

    // 清除錯誤
    clearError: (
      state,
      action: PayloadAction<keyof ContentRecommendationState['error']>
    ) => {
      state.error[action.payload] = null;
    },

    // 添加事件監聽器
    addEventListener: (
      state,
      action: PayloadAction<{ event: string; listener: Function }>
    ) => {
      const service = ContentRecommendationService.getInstance();
      service.addEventListener(action.payload.event, action.payload.listener);
    },

    // 移除事件監聽器
    removeEventListener: (
      state,
      action: PayloadAction<{ event: string; listener: Function }>
    ) => {
      const service = ContentRecommendationService.getInstance();
      service.removeEventListener(
        action.payload.event,
        action.payload.listener
      );
    },
  },
  extraReducers: builder => {
    // 初始化
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

    // 獲取推薦
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

    // 獲取相似內容
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

    // 更新用戶偏好
    builder
      .addCase(updateUserPreference.fulfilled, state => {
        state.lastUpdated = new Date();
      })
      .addCase(updateUserPreference.rejected, (state, action) => {
        state.error.recommendations = action.payload as string;
      });

    // 記錄用戶互動
    builder
      .addCase(recordUserInteraction.fulfilled, state => {
        state.lastUpdated = new Date();
      })
      .addCase(recordUserInteraction.rejected, (state, action) => {
        state.error.recommendations = action.payload as string;
      });

    // 獲取配置
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

    // 更新配置
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

    // 獲取統計
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
export const selectContentRecommendations = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.recommendations;

export const selectSimilarContent = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.similarContent;

export const selectContentRecommendationConfig = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.config;

export const selectContentRecommendationStats = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.stats;

export const selectContentRecommendationFilters = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.filters;

export const selectContentRecommendationOptions = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.options;

export const selectContentRecommendationPagination = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.pagination;

export const selectContentRecommendationLoading = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.loading;

export const selectContentRecommendationError = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.error;

export const selectContentRecommendationPerformanceMetrics = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.performanceMetrics;

export const selectContentRecommendationLastUpdated = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.lastUpdated;

// 計算選擇器
export const selectContentRecommendationIsLoading = (state: {
  contentRecommendation: ContentRecommendationState;
}) =>
  Object.values(state.contentRecommendation.loading).some(loading => loading);

export const selectContentRecommendationHasError = (state: {
  contentRecommendation: ContentRecommendationState;
}) =>
  Object.values(state.contentRecommendation.error).some(
    error => error !== null
  );

export const selectContentRecommendationTotalPages = (state: {
  contentRecommendation: ContentRecommendationState;
}) => {
  const { totalCount, pageSize } = state.contentRecommendation.pagination;
  return Math.ceil(totalCount / pageSize);
};

export const selectContentRecommendationRecommendationCount = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.recommendations.length;

export const selectContentRecommendationSimilarContentCount = (state: {
  contentRecommendation: ContentRecommendationState;
}) => state.contentRecommendation.similarContent.length;

// Reducer
export default contentRecommendationSlice.reducer;
