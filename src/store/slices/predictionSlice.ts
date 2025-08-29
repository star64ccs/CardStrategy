import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { predictionService } from '../../features/ai/services/predictionService';
import type {
  PredictionRequest,
  PredictionResult,
  PredictionOptions,
  PredictionError,
  PredictionState,
} from '../../features/ai/types/prediction';
import {
  PredictionStats,
  PredictionHistory,
} from '../../features/ai/types/prediction';

// 初始狀態
const initialState: PredictionState = {
  currentPrediction: null,
  predictionHistory: [],
  predictionStats: null,
  loading: false,
  error: null,
  options: {
    algorithm: 'ensemble' as any,
    includeSeasonality: true,
    includeExternalFactors: true,
    sensitivityAnalysis: true,
    scenarioAnalysis: true,
    updateFrequency: 'daily' as any,
  },
};

// 異步 Action
export const _performPrediction = createAsyncThunk(
  'prediction/performPrediction',
  async (request: PredictionRequest, { rejectWithValue }) => {
    try {
      const _result = await predictionService.performPrediction(request);
      return result;
    } catch (error) {
      return rejectWithValue({
        code: 'PREDICTION_FAILED',
        message: error instanceof Error ? error.message : '預測失敗',
        details: error,
        timestamp: new Date(),
      } as PredictionError);
    }
  }
);

export const _getPredictionHistory = createAsyncThunk(
  'prediction/getPredictionHistory',
  async (cardId: string, { rejectWithValue }) => {
    try {
      const _history = await predictionService.getPredictionHistory(cardId);
      return history;
    } catch (error) {
      return rejectWithValue({
        code: 'HISTORY_FETCH_FAILED',
        message: error instanceof Error ? error.message : '獲取預測歷史失敗',
        details: error,
        timestamp: new Date(),
      } as PredictionError);
    }
  }
);

export const _getPredictionStats = createAsyncThunk(
  'prediction/getPredictionStats',
  async (_, { rejectWithValue }) => {
    try {
      const _stats = await predictionService.getPredictionStats();
      return stats;
    } catch (error) {
      return rejectWithValue({
        code: 'STATS_FETCH_FAILED',
        message: error instanceof Error ? error.message : '獲取預測統計失敗',
        details: error,
        timestamp: new Date(),
      } as PredictionError);
    }
  }
);

export const _getPredictionOptions = createAsyncThunk(
  'prediction/getPredictionOptions',
  async (_, { rejectWithValue }) => {
    try {
      const _options = await predictionService.getPredictionOptions();
      return options;
    } catch (error) {
      return rejectWithValue({
        code: 'OPTIONS_FETCH_FAILED',
        message: error instanceof Error ? error.message : '獲取預測選項失敗',
        details: error,
        timestamp: new Date(),
      } as PredictionError);
    }
  }
);

// Slice
const _predictionSlice = createSlice({
  name: 'prediction',
  initialState,
  reducers: {
    clearCurrentPrediction: state => {
      state.currentPrediction = null;
    },
    setPredictionOptions: (
      state,
      action: PayloadAction<Partial<PredictionOptions>>
    ) => {
      state.options = { ...state.options, ...action.payload };
    },
    clearError: state => {
      state.error = null;
    },
    resetPredictionState: state => {
      state.currentPrediction = null;
      state.predictionHistory = [];
      state.predictionStats = null;
      state.error = null;
    },
    addPredictionToHistory: (
      state,
      action: PayloadAction<PredictionResult>
    ) => {
      const _existingHistory = state.predictionHistory.find(
        history => history.cardId === action.payload.cardId
      );

      if (existingHistory) {
        existingHistory.predictions.push(action.payload);
        existingHistory.totalPredictions++;
      } else {
        state.predictionHistory.push({
          id: `history_${action.payload.cardId}`,
          cardId: action.payload.cardId,
          predictions: [action.payload],
          accuracy: 0,
          totalPredictions: 1,
          successfulPredictions: 0,
          averageReturn: 0,
          bestPrediction: action.payload,
          worstPrediction: action.payload,
        });
      }
    },
  },
  extraReducers: builder => {
    // performPrediction
    builder
      .addCase(performPrediction.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performPrediction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrediction = action.payload;
        state.error = null;
      })
      .addCase(performPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as PredictionError;
      });

    // getPredictionHistory
    builder
      .addCase(getPredictionHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPredictionHistory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const _existingIndex = state.predictionHistory.findIndex(
            history => history.cardId === action.payload.cardId
          );
          if (existingIndex >= 0) {
            state.predictionHistory[existingIndex] = action.payload;
          } else {
            state.predictionHistory.push(action.payload);
          }
        }
        state.error = null;
      })
      .addCase(getPredictionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as PredictionError;
      });

    // getPredictionStats
    builder
      .addCase(getPredictionStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPredictionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.predictionStats = action.payload;
        state.error = null;
      })
      .addCase(getPredictionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as PredictionError;
      });

    // getPredictionOptions
    builder
      .addCase(getPredictionOptions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPredictionOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.options = action.payload;
        state.error = null;
      })
      .addCase(getPredictionOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as PredictionError;
      });
  },
});

// Actions
export const {
  clearCurrentPrediction,
  setPredictionOptions,
  clearError,
  resetPredictionState,
  addPredictionToHistory,
} = predictionSlice.actions;

// Selectors
export const _selectCurrentPrediction = (state: {
  prediction: PredictionState;
}) => state.prediction.currentPrediction;

export const _selectPredictionHistory = (state: {
  prediction: PredictionState;
}) => state.prediction.predictionHistory;

export const _selectPredictionStats = (state: { prediction: PredictionState }) =>
  state.prediction.predictionStats;

export const _selectPredictionLoading = (state: {
  prediction: PredictionState;
}) => state.prediction.loading;

export const _selectPredictionError = (state: { prediction: PredictionState }) =>
  state.prediction.error;

export const _selectPredictionOptions = (state: {
  prediction: PredictionState;
}) => state.prediction.options;

export const _selectPredictionHistoryByCardId = (
  state: { prediction: PredictionState },
  cardId: string
) =>
  state.prediction.predictionHistory.find(history => history.cardId === cardId);

export const _selectPredictionAccuracy = (state: {
  prediction: PredictionState;
}) => state.prediction.predictionStats?.averageAccuracy || 0;

export const _selectTotalPredictions = (state: {
  prediction: PredictionState;
}) => state.prediction.predictionStats?.totalPredictions || 0;

export const _selectTopPerformingCards = (state: {
  prediction: PredictionState;
}) => state.prediction.predictionStats?.topPerformingCards || [];

export const _selectRecentPredictions = (state: {
  prediction: PredictionState;
}) => state.prediction.predictionStats?.recentPredictions || [];

export const _selectModelPerformance = (state: {
  prediction: PredictionState;
}) => state.prediction.predictionStats?.modelPerformance;

// Reducer
export default predictionSlice.reducer;
