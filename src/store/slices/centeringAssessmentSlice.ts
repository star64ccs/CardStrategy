import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { logger } from '../../core/utils/logger';
import { centeringAssessmentService } from '../../features/cards/services/centeringAssessmentService';
import type {
  CenteringAssessmentState,
  CenteringAssessmentRequest,
  CenteringAssessmentError,
  CenteringAssessmentOptions,
} from '../../features/cards/types/centering';
import {
  CenteringAssessmentResult,
  CenteringAssessmentHistory,
  CenteringAssessmentStats,
} from '../../features/cards/types/centering';
import type { RootState } from '../index';

// 異步 Thunk Actions
export const _initializeCenteringAssessment = createAsyncThunk(
  'centeringAssessment/initialize',
  async (_, { rejectWithValue }) => {
    try {
      await centeringAssessmentService.initialize();
      const _options = await centeringAssessmentService.getAssessmentOptions();
      return options;
    } catch (error: unknown) {
      logger.error('初始化置中評估失敗:', error);
      return rejectWithValue(error.message || '初始化置中評估失敗');
    }
  }
);

export const _assessCentering = createAsyncThunk(
  'centeringAssessment/assessCentering',
  async (request: CenteringAssessmentRequest, { rejectWithValue }) => {
    try {
      const _result = await centeringAssessmentService.assessCentering(request);
      return result;
    } catch (error: unknown) {
      logger.error('置中評估失敗:', error);
      return rejectWithValue(error as CenteringAssessmentError);
    }
  }
);

export const _getAssessmentHistory = createAsyncThunk(
  'centeringAssessment/getHistory',
  async (
    { userId, limit }: { userId: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const _history = await centeringAssessmentService.getAssessmentHistory(
        userId,
        limit
      );
      return history;
    } catch (error: unknown) {
      logger.error('獲取評估歷史失敗:', error);
      return rejectWithValue(error.message || '獲取評估歷史失敗');
    }
  }
);

export const _getAssessmentStats = createAsyncThunk(
  'centeringAssessment/getStats',
  async (userId: string, { rejectWithValue }) => {
    try {
      const _stats =
        await centeringAssessmentService.getAssessmentStats(userId);
      return stats;
    } catch (error: unknown) {
      logger.error('獲取評估統計失敗:', error);
      return rejectWithValue(error.message || '獲取評估統計失敗');
    }
  }
);

// 初始狀態
const initialState: CenteringAssessmentState = {
  isAssessing: false,
  assessmentResult: null,
  assessmentError: null,
  assessmentHistory: [],
  assessmentStats: null,
  currentImage: null,
  isLoadingHistory: false,
  historyError: null,
  isLoadingStats: false,
  statsError: null,
  assessmentOptions: {
    enableDetailedAnalysis: true,
    includeRecommendations: true,
    assessmentMode: 'standard',
    focusAreas: ['centering', 'edges', 'corners', 'surface'],
    qualityThreshold: 0.7,
  },
  isOptionsLoading: false,
  optionsError: null,
};

// Slice 定義
const _centeringAssessmentSlice = createSlice({
  name: 'centeringAssessment',
  initialState,
  reducers: {
    clearAssessmentError: state => {
      state.assessmentError = null;
    },
    clearHistoryError: state => {
      state.historyError = null;
    },
    clearStatsError: state => {
      state.statsError = null;
    },
    clearOptionsError: state => {
      state.optionsError = null;
    },
    setCurrentAssessmentImage: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.currentImage = action.payload;
    },
    clearAssessmentResult: state => {
      state.assessmentResult = null;
    },
    updateAssessmentOptions: (
      state,
      action: PayloadAction<Partial<CenteringAssessmentOptions>>
    ) => {
      state.assessmentOptions = {
        ...state.assessmentOptions,
        ...action.payload,
      };
    },
  },
  extraReducers: builder => {
    // initializeCenteringAssessment
    builder
      .addCase(initializeCenteringAssessment.pending, state => {
        state.isOptionsLoading = true;
        state.optionsError = null;
      })
      .addCase(initializeCenteringAssessment.fulfilled, (state, action) => {
        state.isOptionsLoading = false;
        state.assessmentOptions = action.payload;
      })
      .addCase(initializeCenteringAssessment.rejected, (state, action) => {
        state.isOptionsLoading = false;
        state.optionsError = action.payload as string;
      });

    // assessCentering
    builder
      .addCase(assessCentering.pending, state => {
        state.isAssessing = true;
        state.assessmentError = null;
      })
      .addCase(assessCentering.fulfilled, (state, action) => {
        state.isAssessing = false;
        state.assessmentResult = action.payload;
      })
      .addCase(assessCentering.rejected, (state, action) => {
        state.isAssessing = false;
        state.assessmentError = action.payload as CenteringAssessmentError;
      });

    // getAssessmentHistory
    builder
      .addCase(getAssessmentHistory.pending, state => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(getAssessmentHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.assessmentHistory = action.payload;
      })
      .addCase(getAssessmentHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = action.payload as string;
      });

    // getAssessmentStats
    builder
      .addCase(getAssessmentStats.pending, state => {
        state.isLoadingStats = true;
        state.statsError = null;
      })
      .addCase(getAssessmentStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.assessmentStats = action.payload;
      })
      .addCase(getAssessmentStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.statsError = action.payload as string;
      });
  },
});

// Actions
export const {
  clearAssessmentError,
  clearHistoryError,
  clearStatsError,
  clearOptionsError,
  setCurrentAssessmentImage,
  clearAssessmentResult,
  updateAssessmentOptions,
} = centeringAssessmentSlice.actions;

// Selectors
export const _selectIsAssessing = (state: RootState) =>
  state.centeringAssessment.isAssessing;
export const _selectAssessmentResult = (state: RootState) =>
  state.centeringAssessment.assessmentResult;
export const _selectAssessmentError = (state: RootState) =>
  state.centeringAssessment.assessmentError;
export const _selectAssessmentHistory = (state: RootState) =>
  state.centeringAssessment.assessmentHistory;
export const _selectAssessmentStats = (state: RootState) =>
  state.centeringAssessment.assessmentStats;
export const _selectCurrentImage = (state: RootState) =>
  state.centeringAssessment.currentImage;
export const _selectIsLoadingHistory = (state: RootState) =>
  state.centeringAssessment.isLoadingHistory;
export const _selectHistoryError = (state: RootState) =>
  state.centeringAssessment.historyError;
export const _selectIsLoadingStats = (state: RootState) =>
  state.centeringAssessment.isLoadingStats;
export const _selectStatsError = (state: RootState) =>
  state.centeringAssessment.statsError;
export const _selectAssessmentOptions = (state: RootState) =>
  state.centeringAssessment.assessmentOptions;
export const _selectIsOptionsLoading = (state: RootState) =>
  state.centeringAssessment.isOptionsLoading;
export const _selectOptionsError = (state: RootState) =>
  state.centeringAssessment.optionsError;

export default centeringAssessmentSlice.reducer;
