import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { logger } from '../../core/utils/logger';
import { authenticityCheckService } from '../../features/cards/services/authenticityCheckService';
import type {
  AuthenticityCheckState,
  AuthenticityCheckRequest,
  AuthenticityCheckError,
  AuthenticityCheckOptions,
} from '../../features/cards/types/authenticity';
import {
  AuthenticityCheckResult,
  AuthenticityCheckHistory,
  AuthenticityCheckStats,
} from '../../features/cards/types/authenticity';
import type { RootState } from '../index';

// Async Thunk Actions
export const _initializeAuthenticityCheck = createAsyncThunk(
  'authenticityCheck/initialize',
  async (_, { rejectWithValue }) => {
    try {
      await authenticityCheckService.initialize();
      const _options = await authenticityCheckService.getCheckOptions();
      return options;
    } catch (error: unknown) {
      logger.error('Initialize防偽CheckFailed:', error);
      return rejectWithValue(error.message || 'Initialize防偽CheckFailed');
    }
  }
);

export const _checkAuthenticity = createAsyncThunk(
  'authenticityCheck/checkAuthenticity',
  async (request: AuthenticityCheckRequest, { rejectWithValue }) => {
    try {
      const _result = await authenticityCheckService.checkAuthenticity(request);
      return result;
    } catch (error: unknown) {
      logger.error('防偽CheckFailed:', error);
      return rejectWithValue(error as AuthenticityCheckError);
    }
  }
);

export const _getCheckHistory = createAsyncThunk(
  'authenticityCheck/getHistory',
  async (
    { userId, limit }: { userId: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const _history = await authenticityCheckService.getCheckHistory(
        userId,
        limit
      );
      return history;
    } catch (error: unknown) {
      logger.error('GetCheck歷史Failed:', error);
      return rejectWithValue(error.message || 'GetCheck歷史Failed');
    }
  }
);

export const _getCheckStats = createAsyncThunk(
  'authenticityCheck/getStats',
  async (userId: string, { rejectWithValue }) => {
    try {
      const _stats = await authenticityCheckService.getCheckStats(userId);
      return stats;
    } catch (error: unknown) {
      logger.error('GetCheck統計Failed:', error);
      return rejectWithValue(error.message || 'GetCheck統計Failed');
    }
  }
);

// 初始Status
const initialState: AuthenticityCheckState = {
  isChecking: false,
  checkResult: null,
  checkError: null,
  checkHistory: [],
  checkStats: null,
  currentImage: null,
  isLoadingHistory: false,
  historyError: null,
  isLoadingStats: false,
  statsError: null,
  checkOptions: {
    enableDetailedAnalysis: true,
    includeSecurityFeatures: true,
    checkMode: 'standard',
    focusAreas: [
      'printing',
      'colors',
      'text',
      'security_features',
      'materials',
    ],
    qualityThreshold: 0.8,
    enableComparison: false,
  },
  isOptionsLoading: false,
  optionsError: null,
};

// Slice 定義
const _authenticityCheckSlice = createSlice({
  name: 'authenticityCheck',
  initialState,
  reducers: {
    clearCheckError: state => {
      state.checkError = null;
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
    setCurrentCheckImage: (state, action: PayloadAction<string | null>) => {
      state.currentImage = action.payload;
    },
    clearCheckResult: state => {
      state.checkResult = null;
    },
    updateCheckOptions: (
      state,
      action: PayloadAction<Partial<AuthenticityCheckOptions>>
    ) => {
      state.checkOptions = { ...state.checkOptions, ...action.payload };
    },
  },
  extraReducers: builder => {
    // initializeAuthenticityCheck
    builder
      .addCase(initializeAuthenticityCheck.pending, state => {
        state.isOptionsLoading = true;
        state.optionsError = null;
      })
      .addCase(initializeAuthenticityCheck.fulfilled, (state, action) => {
        state.isOptionsLoading = false;
        state.checkOptions = action.payload;
      })
      .addCase(initializeAuthenticityCheck.rejected, (state, action) => {
        state.isOptionsLoading = false;
        state.optionsError = action.payload as string;
      });

    // checkAuthenticity
    builder
      .addCase(checkAuthenticity.pending, state => {
        state.isChecking = true;
        state.checkError = null;
      })
      .addCase(checkAuthenticity.fulfilled, (state, action) => {
        state.isChecking = false;
        state.checkResult = action.payload;
      })
      .addCase(checkAuthenticity.rejected, (state, action) => {
        state.isChecking = false;
        state.checkError = action.payload as AuthenticityCheckError;
      });

    // getCheckHistory
    builder
      .addCase(getCheckHistory.pending, state => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(getCheckHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.checkHistory = action.payload;
      })
      .addCase(getCheckHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = action.payload as string;
      });

    // getCheckStats
    builder
      .addCase(getCheckStats.pending, state => {
        state.isLoadingStats = true;
        state.statsError = null;
      })
      .addCase(getCheckStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.checkStats = action.payload;
      })
      .addCase(getCheckStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.statsError = action.payload as string;
      });
  },
});

// Actions
export const {
  clearCheckError,
  clearHistoryError,
  clearStatsError,
  clearOptionsError,
  setCurrentCheckImage,
  clearCheckResult,
  updateCheckOptions,
} = authenticityCheckSlice.actions;

// Selectors
export const _selectIsChecking = (state: RootState) =>
  state.authenticityCheck.isChecking;
export const _selectCheckResult = (state: RootState) =>
  state.authenticityCheck.checkResult;
export const _selectCheckError = (state: RootState) =>
  state.authenticityCheck.checkError;
export const _selectCheckHistory = (state: RootState) =>
  state.authenticityCheck.checkHistory;
export const _selectCheckStats = (state: RootState) =>
  state.authenticityCheck.checkStats;
export const _selectCurrentImage = (state: RootState) =>
  state.authenticityCheck.currentImage;
export const _selectIsLoadingHistory = (state: RootState) =>
  state.authenticityCheck.isLoadingHistory;
export const _selectHistoryError = (state: RootState) =>
  state.authenticityCheck.historyError;
export const _selectIsLoadingStats = (state: RootState) =>
  state.authenticityCheck.isLoadingStats;
export const _selectStatsError = (state: RootState) =>
  state.authenticityCheck.statsError;
export const _selectCheckOptions = (state: RootState) =>
  state.authenticityCheck.checkOptions;
export const _selectIsOptionsLoading = (state: RootState) =>
  state.authenticityCheck.isOptionsLoading;
export const _selectOptionsError = (state: RootState) =>
  state.authenticityCheck.optionsError;

export default authenticityCheckSlice.reducer;
