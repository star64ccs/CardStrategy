// 協同Filter推薦系統 Redux Slice
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { CollaborativeFilteringService } from '../../features/recommendation/services/collaborativeFilteringService';
import type {
  DataStatistics,
  GetRecommendationsRequest,
  GetSimilarItemsRequest,
  GetSimilarUsersRequest,
  ModelPerformance,
  Recommendation,
  SimilarityScore,
  UpdateRatingRequest,
  UpdateUserBehaviorRequest,
} from '../../features/recommendation/types/collaborativeFiltering';
import {
  RecommendationAlgorithm,
  SimilarityMethod,
} from '../../features/recommendation/types/collaborativeFiltering';

// StatusInterface
export interface CollaborativeFilteringState {
  // 推薦相Off
  recommendations: Recommendation[];
  currentRecommendations: Recommendation[];
  selectedRecommendationId: string | null;

  // 相似User相Off
  similarUsers: SimilarityScore[];
  currentSimilarUsers: SimilarityScore[];
  selectedSimilarUserId: string | null;

  // 相似項目相Off
  similarItems: {
    itemId: string;
    similarityScore: number;
    commonRatings: number;
  }[];
  currentSimilarItems: {
    itemId: string;
    similarityScore: number;
    commonRatings: number;
  }[];
  selectedSimilarItemId: string | null;

  // 模型性能
  performance: ModelPerformance | null;
  statistics: DataStatistics | null;

  // Configure
  currentAlgorithm: RecommendationAlgorithm;
  currentSimilarityMethod: SimilarityMethod;

  // FilterOptions
  filterOptions: {
    categories: string[];
    minRating: number;
    maxRating: number;
    minSimilarity: number;
    maxSimilarity: number;
  };

  // Paginate
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
  };

  // 加載Status
  loading: {
    recommendations: boolean;
    similarUsers: boolean;
    similarItems: boolean;
    performance: boolean;
    rating: boolean;
    behavior: boolean;
  };

  // ErrorStatus
  error: {
    recommendations: string | null;
    similarUsers: string | null;
    similarItems: string | null;
    performance: string | null;
    rating: string | null;
    behavior: string | null;
  };

  // InitializeStatus
  isInitialized: boolean;
  isInitializing: boolean;
}

// 初始Status
const initialState: CollaborativeFilteringState = {
  recommendations: [],
  currentRecommendations: [],
  selectedRecommendationId: null,

  similarUsers: [],
  currentSimilarUsers: [],
  selectedSimilarUserId: null,

  similarItems: [],
  currentSimilarItems: [],
  selectedSimilarItemId: null,

  performance: null,
  statistics: null,

  currentAlgorithm: RecommendationAlgorithm.USER_BASED,
  currentSimilarityMethod: SimilarityMethod.PEARSON,

  filterOptions: {
    categories: [],
    minRating: 1,
    maxRating: 5,
    minSimilarity: 0.1,
    maxSimilarity: 1.0,
  },

  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    hasMore: false,
  },

  loading: {
    recommendations: false,
    similarUsers: false,
    similarItems: false,
    performance: false,
    rating: false,
    behavior: false,
  },

  error: {
    recommendations: null,
    similarUsers: null,
    similarItems: null,
    performance: null,
    rating: null,
    behavior: null,
  },

  isInitialized: false,
  isInitializing: false,
};

// Async Thunk Actions

// Initialize協同FilterService
export const _initializeCollaborativeFiltering = createAsyncThunk(
  'collaborativeFiltering/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const _service = CollaborativeFilteringService.getInstance();
      await service.initialize();
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'InitializeFailed'
      );
    }
  }
);

// Get推薦
export const _getRecommendations = createAsyncThunk(
  'collaborativeFiltering/getRecommendations',
  async (request: GetRecommendationsRequest, { rejectWithValue }) => {
    try {
      const _service = CollaborativeFilteringService.getInstance();
      const _response = await service.getRecommendations(request);

      if (!response.success) {
        throw new Error(response.error || 'Get推薦Failed');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Get推薦Failed'
      );
    }
  }
);

// Get相似User
export const _getSimilarUsers = createAsyncThunk(
  'collaborativeFiltering/getSimilarUsers',
  async (request: GetSimilarUsersRequest, { rejectWithValue }) => {
    try {
      const _service = CollaborativeFilteringService.getInstance();
      const _response = await service.getSimilarUsers(request);

      if (!response.success) {
        throw new Error(response.error || 'Get相似用戶Failed');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Get相似用戶Failed'
      );
    }
  }
);

// Get相似項目
export const _getSimilarItems = createAsyncThunk(
  'collaborativeFiltering/getSimilarItems',
  async (request: GetSimilarItemsRequest, { rejectWithValue }) => {
    try {
      const _service = CollaborativeFilteringService.getInstance();
      const _response = await service.getSimilarItems(request);

      if (!response.success) {
        throw new Error(response.error || 'Get相似項目Failed');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Get相似項目Failed'
      );
    }
  }
);

// Update評分
export const _updateRating = createAsyncThunk(
  'collaborativeFiltering/updateRating',
  async (request: UpdateRatingRequest, { rejectWithValue }) => {
    try {
      const _service = CollaborativeFilteringService.getInstance();
      await service.updateRating(request);
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Update評分Failed'
      );
    }
  }
);

// UpdateUserRow為
export const _updateUserBehavior = createAsyncThunk(
  'collaborativeFiltering/updateUserBehavior',
  async (request: UpdateUserBehaviorRequest, { rejectWithValue }) => {
    try {
      const _service = CollaborativeFilteringService.getInstance();
      await service.updateUserBehavior(request);
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Update用戶行為Failed'
      );
    }
  }
);

// Get模型性能
export const _getModelPerformance = createAsyncThunk(
  'collaborativeFiltering/getModelPerformance',
  async (_, { rejectWithValue }) => {
    try {
      const _service = CollaborativeFilteringService.getInstance();
      const _response = await service.getModelPerformance();

      if (!response.success) {
        throw new Error(response.error || 'Get模型性能Failed');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Get模型性能Failed'
      );
    }
  }
);

// Slice
const _collaborativeFilteringSlice = createSlice({
  name: 'collaborativeFiltering',
  initialState,
  reducers: {
    // 推薦相Off
    setCurrentRecommendations: (
      state,
      action: PayloadAction<Recommendation[]>
    ) => {
      state.currentRecommendations = action.payload;
    },

    setSelectedRecommendationId: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.selectedRecommendationId = action.payload;
    },

    addRecommendation: (state, action: PayloadAction<Recommendation>) => {
      state.recommendations.push(action.payload);
    },

    updateRecommendation: (state, action: PayloadAction<Recommendation>) => {
      const _index = state.recommendations.findIndex(
        r => r.itemId === action.payload.itemId
      );
      if (index !== -1) {
        state.recommendations[index] = action.payload;
      }
    },

    removeRecommendation: (state, action: PayloadAction<string>) => {
      state.recommendations = state.recommendations.filter(
        r => r.itemId !== action.payload
      );
    },

    // 相似User相Off
    setCurrentSimilarUsers: (
      state,
      action: PayloadAction<SimilarityScore[]>
    ) => {
      state.currentSimilarUsers = action.payload;
    },

    setSelectedSimilarUserId: (state, action: PayloadAction<string | null>) => {
      state.selectedSimilarUserId = action.payload;
    },

    addSimilarUser: (state, action: PayloadAction<SimilarityScore>) => {
      state.similarUsers.push(action.payload);
    },

    updateSimilarUser: (state, action: PayloadAction<SimilarityScore>) => {
      const _index = state.similarUsers.findIndex(
        u => u.targetUserId === action.payload.targetUserId
      );
      if (index !== -1) {
        state.similarUsers[index] = action.payload;
      }
    },

    removeSimilarUser: (state, action: PayloadAction<string>) => {
      state.similarUsers = state.similarUsers.filter(
        u => u.targetUserId !== action.payload
      );
    },

    // 相似項目相Off
    setCurrentSimilarItems: (
      state,
      action: PayloadAction<
        {
          itemId: string;
          similarityScore: number;
          commonRatings: number;
        }[]
      >
    ) => {
      state.currentSimilarItems = action.payload;
    },

    setSelectedSimilarItemId: (state, action: PayloadAction<string | null>) => {
      state.selectedSimilarItemId = action.payload;
    },

    addSimilarItem: (
      state,
      action: PayloadAction<{
        itemId: string;
        similarityScore: number;
        commonRatings: number;
      }>
    ) => {
      state.similarItems.push(action.payload);
    },

    updateSimilarItem: (
      state,
      action: PayloadAction<{
        itemId: string;
        similarityScore: number;
        commonRatings: number;
      }>
    ) => {
      const _index = state.similarItems.findIndex(
        i => i.itemId === action.payload.itemId
      );
      if (index !== -1) {
        state.similarItems[index] = action.payload;
      }
    },

    removeSimilarItem: (state, action: PayloadAction<string>) => {
      state.similarItems = state.similarItems.filter(
        i => i.itemId !== action.payload
      );
    },

    // Configure相Off
    setCurrentAlgorithm: (
      state,
      action: PayloadAction<RecommendationAlgorithm>
    ) => {
      state.currentAlgorithm = action.payload;
    },

    setCurrentSimilarityMethod: (
      state,
      action: PayloadAction<SimilarityMethod>
    ) => {
      state.currentSimilarityMethod = action.payload;
    },

    // FilterOptions
    setFilterOptions: (
      state,
      action: PayloadAction<
        Partial<CollaborativeFilteringState['filterOptions']>
      >
    ) => {
      state.filterOptions = { ...state.filterOptions, ...action.payload };
    },

    // Paginate
    setPagination: (
      state,
      action: PayloadAction<Partial<CollaborativeFilteringState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // 加載Status
    setLoading: (
      state,
      action: PayloadAction<{
        key: keyof CollaborativeFilteringState['loading'];
        value: boolean;
      }>
    ) => {
      state.loading[action.payload.key] = action.payload.value;
    },

    // ErrorStatus
    setError: (
      state,
      action: PayloadAction<{
        key: keyof CollaborativeFilteringState['error'];
        value: string | null;
      }>
    ) => {
      state.error[action.payload.key] = action.payload.value;
    },

    // ClearError
    clearError: (
      state,
      action: PayloadAction<keyof CollaborativeFilteringState['error']>
    ) => {
      state.error[action.payload] = null;
    },

    // ResetStatus
    resetState: state => {
      return { ...initialState };
    },
  },
  extraReducers: builder => {
    builder
      // Initialize
      .addCase(initializeCollaborativeFiltering.pending, state => {
        state.isInitializing = true;
        // state.error.isInitialized = null; // 暫時Comment掉，Await實現
      })
      .addCase(initializeCollaborativeFiltering.fulfilled, state => {
        state.isInitialized = true;
        state.isInitializing = false;
      })
      .addCase(initializeCollaborativeFiltering.rejected, (state, action) => {
        state.isInitialized = false;
        state.isInitializing = false;
        // state.error.isInitialized = action.payload as string; // 暫時Comment掉，Await實現
      })

      // Get推薦
      .addCase(getRecommendations.pending, state => {
        state.loading.recommendations = true;
        state.error.recommendations = null;
      })
      .addCase(getRecommendations.fulfilled, (state, action) => {
        state.loading.recommendations = false;
        state.currentRecommendations = action.payload?.recommendations || [];
        state.pagination.totalCount = action.payload?.totalCount || 0;
        state.pagination.hasMore = action.payload?.hasMore || false;
      })
      .addCase(getRecommendations.rejected, (state, action) => {
        state.loading.recommendations = false;
        state.error.recommendations = action.payload as string;
      })

      // Get相似User
      .addCase(getSimilarUsers.pending, state => {
        state.loading.similarUsers = true;
        state.error.similarUsers = null;
      })
      .addCase(getSimilarUsers.fulfilled, (state, action) => {
        state.loading.similarUsers = false;
        state.currentSimilarUsers = action.payload?.similarUsers || [];
      })
      .addCase(getSimilarUsers.rejected, (state, action) => {
        state.loading.similarUsers = false;
        state.error.similarUsers = action.payload as string;
      })

      // Get相似項目
      .addCase(getSimilarItems.pending, state => {
        state.loading.similarItems = true;
        state.error.similarItems = null;
      })
      .addCase(getSimilarItems.fulfilled, (state, action) => {
        state.loading.similarItems = false;
        state.currentSimilarItems = action.payload?.similarItems || [];
      })
      .addCase(getSimilarItems.rejected, (state, action) => {
        state.loading.similarItems = false;
        state.error.similarItems = action.payload as string;
      })

      // Update評分
      .addCase(updateRating.pending, state => {
        state.loading.rating = true;
        state.error.rating = null;
      })
      .addCase(updateRating.fulfilled, state => {
        state.loading.rating = false;
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.loading.rating = false;
        state.error.rating = action.payload as string;
      })

      // UpdateUserRow為
      .addCase(updateUserBehavior.pending, state => {
        state.loading.behavior = true;
        state.error.behavior = null;
      })
      .addCase(updateUserBehavior.fulfilled, state => {
        state.loading.behavior = false;
      })
      .addCase(updateUserBehavior.rejected, (state, action) => {
        state.loading.behavior = false;
        state.error.behavior = action.payload as string;
      })

      // Get模型性能
      .addCase(getModelPerformance.pending, state => {
        state.loading.performance = true;
        state.error.performance = null;
      })
      .addCase(getModelPerformance.fulfilled, (state, action) => {
        state.loading.performance = false;
        state.performance = action.payload?.performance || null;
        state.statistics = action.payload?.statistics || null;
      })
      .addCase(getModelPerformance.rejected, (state, action) => {
        state.loading.performance = false;
        state.error.performance = action.payload as string;
      });
  },
});

// Actions
export const {
  setCurrentRecommendations,
  setSelectedRecommendationId,
  addRecommendation,
  updateRecommendation,
  removeRecommendation,
  setCurrentSimilarUsers,
  setSelectedSimilarUserId,
  addSimilarUser,
  updateSimilarUser,
  removeSimilarUser,
  setCurrentSimilarItems,
  setSelectedSimilarItemId,
  addSimilarItem,
  updateSimilarItem,
  removeSimilarItem,
  setCurrentAlgorithm,
  setCurrentSimilarityMethod,
  setFilterOptions,
  setPagination,
  setLoading,
  setError,
  clearError,
  resetState,
} = collaborativeFilteringSlice.actions;

// Selectors
export const _selectCollaborativeFiltering = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering;

export const _selectRecommendations = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentRecommendations;
export const _selectAllRecommendations = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.recommendations;
export const _selectSelectedRecommendation = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => {
  const { currentRecommendations, selectedRecommendationId } =
    state.collaborativeFiltering;
  return selectedRecommendationId
    ? currentRecommendations.find(r => r.itemId === selectedRecommendationId)
    : null;
};

export const _selectSimilarUsers = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentSimilarUsers;
export const _selectAllSimilarUsers = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.similarUsers;
export const _selectSelectedSimilarUser = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => {
  const { currentSimilarUsers, selectedSimilarUserId } =
    state.collaborativeFiltering;
  return selectedSimilarUserId
    ? currentSimilarUsers.find(u => u.targetUserId === selectedSimilarUserId)
    : null;
};

export const _selectSimilarItems = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentSimilarItems;
export const _selectAllSimilarItems = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.similarItems;
export const _selectSelectedSimilarItem = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => {
  const { currentSimilarItems, selectedSimilarItemId } =
    state.collaborativeFiltering;
  return selectedSimilarItemId
    ? currentSimilarItems.find(i => i.itemId === selectedSimilarItemId)
    : null;
};

export const _selectPerformance = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.performance;
export const _selectStatistics = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.statistics;

export const _selectCurrentAlgorithm = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentAlgorithm;
export const _selectCurrentSimilarityMethod = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentSimilarityMethod;

export const _selectFilterOptions = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.filterOptions;
export const _selectPagination = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.pagination;

export const _selectLoading = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.loading;
export const _selectError = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.error;

export const _selectIsInitialized = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.isInitialized;
export const _selectIsInitializing = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.isInitializing;

// 計算Select器
export const _selectHasRecommendations = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentRecommendations.length > 0;

export const _selectRecommendationCount = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentRecommendations.length;

export const _selectHasSimilarUsers = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentSimilarUsers.length > 0;

export const _selectSimilarUserCount = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentSimilarUsers.length;

export const _selectHasSimilarItems = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentSimilarItems.length > 0;

export const _selectSimilarItemCount = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.currentSimilarItems.length;

export const _selectHasPerformance = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.performance !== null;

export const _selectHasStatistics = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) => state.collaborativeFiltering.statistics !== null;

export const _selectIsLoading = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) =>
  Object.values(state.collaborativeFiltering.loading).some(loading => loading);

export const _selectHasError = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) =>
  Object.values(state.collaborativeFiltering.error).some(
    error => error !== null
  );

export const _selectCanGetRecommendations = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) =>
  state.collaborativeFiltering.isInitialized &&
  !state.collaborativeFiltering.loading.recommendations;

export const _selectCanGetSimilarUsers = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) =>
  state.collaborativeFiltering.isInitialized &&
  !state.collaborativeFiltering.loading.similarUsers;

export const _selectCanGetSimilarItems = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) =>
  state.collaborativeFiltering.isInitialized &&
  !state.collaborativeFiltering.loading.similarItems;

export const _selectCanUpdateRating = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) =>
  state.collaborativeFiltering.isInitialized &&
  !state.collaborativeFiltering.loading.rating;

export const _selectCanUpdateBehavior = (state: {
  collaborativeFiltering: CollaborativeFilteringState;
}) =>
  state.collaborativeFiltering.isInitialized &&
  !state.collaborativeFiltering.loading.behavior;

// Reducer
export default collaborativeFilteringSlice.reducer;
