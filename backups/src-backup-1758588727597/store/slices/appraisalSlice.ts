import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { appraisalService } from '../../features/cards/services/appraisalService';
import type {
  AppraisalRequest,
  AppraisalOptions,
  AppraisalError,
  AppraisalState,
} from '../../features/cards/types/appraisal';
import {
  AppraisalResult,
  AppraisalHistory,
  AppraisalStats,
} from '../../features/cards/types/appraisal';

const initialState: AppraisalState = {
  currentAppraisal: null,
  history: [],
  stats: null,
  options: {
    method: 'hybrid',
    includeImages: true,
    detailedAnalysis: true,
    marketComparison: true,
    preservationTips: true,
  },
  status: 'pending',
  error: null,
  loading: false,
};

// Async thunks
export const performAppraisal = createAsyncThunk(
  'appraisal/performAppraisal',
  async (request: AppraisalRequest, { rejectWithValue }) => {
    try {
      const result = await appraisalService.performAppraisal(request);
      return result;
    } catch (error) {
      return rejectWithValue(error as AppraisalError);
    }
  }
);

export const getAppraisalHistory = createAsyncThunk(
  'appraisal/getAppraisalHistory',
  async (cardId: string, { rejectWithValue }) => {
    try {
      const history = await appraisalService.getAppraisalHistory(cardId);
      return history;
    } catch (error) {
      return rejectWithValue(error as AppraisalError);
    }
  }
);

export const getAppraisalStats = createAsyncThunk(
  'appraisal/getAppraisalStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await appraisalService.getAppraisalStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error as AppraisalError);
    }
  }
);

export const getAppraisalOptions = createAsyncThunk(
  'appraisal/getAppraisalOptions',
  async (_, { rejectWithValue }) => {
    try {
      const options = await appraisalService.getAppraisalOptions();
      return options;
    } catch (error) {
      return rejectWithValue(error as AppraisalError);
    }
  }
);

const appraisalSlice = createSlice({
  name: 'appraisal',
  initialState,
  reducers: {
    clearCurrentAppraisal: state => {
      state.currentAppraisal = null;
      state.status = 'pending';
      state.error = null;
    },
    setAppraisalOptions: (
      state,
      action: PayloadAction<Partial<AppraisalOptions>>
    ) => {
      state.options = { ...state.options, ...action.payload };
    },
    clearError: state => {
      state.error = null;
    },
    resetAppraisalState: state => {
      return initialState;
    },
  },
  extraReducers: builder => {
    // performAppraisal
    builder
      .addCase(performAppraisal.pending, state => {
        state.loading = true;
        state.status = 'processing';
        state.error = null;
      })
      .addCase(performAppraisal.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'completed';
        state.currentAppraisal = action.payload;
        state.error = null;
      })
      .addCase(performAppraisal.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload as AppraisalError;
      });

    // getAppraisalHistory
    builder
      .addCase(getAppraisalHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppraisalHistory.fulfilled, (state, action) => {
        state.loading = false;
        // 更新或添加歷史記錄
        const existingIndex = state.history.findIndex(
          h => h.cardId === action.payload.cardId
        );
        if (existingIndex >= 0) {
          state.history[existingIndex] = action.payload;
        } else {
          state.history.push(action.payload);
        }
        state.error = null;
      })
      .addCase(getAppraisalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppraisalError;
      });

    // getAppraisalStats
    builder
      .addCase(getAppraisalStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppraisalStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(getAppraisalStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppraisalError;
      });

    // getAppraisalOptions
    builder
      .addCase(getAppraisalOptions.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppraisalOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.options = action.payload;
        state.error = null;
      })
      .addCase(getAppraisalOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppraisalError;
      });
  },
});

export const {
  clearCurrentAppraisal,
  setAppraisalOptions,
  clearError,
  resetAppraisalState,
} = appraisalSlice.actions;

// Selectors
export const selectCurrentAppraisal = (state: { appraisal: AppraisalState }) =>
  state.appraisal.currentAppraisal;

export const selectAppraisalHistory = (state: { appraisal: AppraisalState }) =>
  state.appraisal.history;

export const selectAppraisalStats = (state: { appraisal: AppraisalState }) =>
  state.appraisal.stats;

export const selectAppraisalOptions = (state: { appraisal: AppraisalState }) =>
  state.appraisal.options;

export const selectAppraisalStatus = (state: { appraisal: AppraisalState }) =>
  state.appraisal.status;

export const selectAppraisalError = (state: { appraisal: AppraisalState }) =>
  state.appraisal.error;

export const selectAppraisalLoading = (state: { appraisal: AppraisalState }) =>
  state.appraisal.loading;

export default appraisalSlice.reducer;
