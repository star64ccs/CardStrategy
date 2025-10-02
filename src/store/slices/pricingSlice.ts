import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import PricingService from '../../features/market/services/pricingService';
import type {
  MarketPrice,
  PriceHistory,
  PriceAlert,
  MarketAnalysis,
  PriceRequest,
  PriceStats,
} from '../../features/market/types/pricing';
import {
  PriceResponse,
  PriceTrend,
  MarketStatus,
  PriceAlertType,
} from '../../features/market/types/pricing';

// StatusInterface
interface PricingState {
  currentPrice: MarketPrice | null;
  priceHistory: PriceHistory | null;
  marketAnalysis: MarketAnalysis | null;
  userAlerts: PriceAlert[];
  marketStats: PriceStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectedCardId: string | null;
  selectedPeriod: string;
  alertForm: {
    cardId: string;
    type: PriceAlertType;
    threshold: number;
    isActive: boolean;
  };
}

// 初始Status
const initialState: PricingState = {
  currentPrice: null,
  priceHistory: null,
  marketAnalysis: null,
  userAlerts: [],
  marketStats: null,
  loading: false,
  error: null,
  lastUpdated: null,
  selectedCardId: null,
  selectedPeriod: '30d',
  alertForm: {
    cardId: '',
    type: PriceAlertType.ABOVE,
    threshold: 0,
    isActive: true,
  },
};

// Async Action Creators
export const _initializePricingService = createAsyncThunk(
  'pricing/initialize',
  async (config?: unknown) => {
    const _service = PricingService.getInstance();
    await service.initialize(config);
    return { success: true };
  }
);

export const _fetchCurrentPrice = createAsyncThunk(
  'pricing/fetchCurrentPrice',
  async (request: PriceRequest) => {
    const _service = PricingService.getInstance();
    const _response = await service.getCurrentPrice(request);
    return response;
  }
);

export const _fetchPriceHistory = createAsyncThunk(
  'pricing/fetchPriceHistory',
  async ({ cardId, period }: { cardId: string; period: string }) => {
    const _service = PricingService.getInstance();
    const _history = await service.getPriceHistory(cardId, period);
    return history;
  }
);

export const _createPriceAlert = createAsyncThunk(
  'pricing/createAlert',
  async (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const _service = PricingService.getInstance();
    const _newAlert = await service.createPriceAlert(alert);
    return newAlert;
  }
);

export const _fetchUserAlerts = createAsyncThunk(
  'pricing/fetchUserAlerts',
  async (cardId?: string) => {
    const _service = PricingService.getInstance();
    const _alerts = await service.getUserAlerts(cardId);
    return alerts;
  }
);

export const _updateAlertStatus = createAsyncThunk(
  'pricing/updateAlertStatus',
  async ({ alertId, isActive }: { alertId: string; isActive: boolean }) => {
    const _service = PricingService.getInstance();
    await service.updateAlertStatus(alertId, isActive);
    return { alertId, isActive };
  }
);

export const _deletePriceAlert = createAsyncThunk(
  'pricing/deleteAlert',
  async (alertId: string) => {
    const _service = PricingService.getInstance();
    await service.deleteAlert(alertId);
    return alertId;
  }
);

export const _fetchMarketStats = createAsyncThunk(
  'pricing/fetchMarketStats',
  async () => {
    const _service = PricingService.getInstance();
    const _stats = await service.getMarketStats();
    return stats;
  }
);

export const _generateMarketAnalysis = createAsyncThunk(
  'pricing/generateAnalysis',
  async (cardId: string) => {
    const _service = PricingService.getInstance();
    const _analysis = await service.generateMarketAnalysis(cardId);
    return analysis;
  }
);

// Slice
const _pricingSlice = createSlice({
  name: 'pricing',
  initialState,
  reducers: {
    setSelectedCardId: (state, action: PayloadAction<string>) => {
      state.selectedCardId = action.payload;
    },
    setSelectedPeriod: (state, action: PayloadAction<string>) => {
      state.selectedPeriod = action.payload;
    },
    updateAlertForm: (
      state,
      action: PayloadAction<Partial<PricingState['alertForm']>>
    ) => {
      state.alertForm = { ...state.alertForm, ...action.payload };
    },
    resetAlertForm: state => {
      state.alertForm = initialState.alertForm;
    },
    clearError: state => {
      state.error = null;
    },
    clearCurrentPrice: state => {
      state.currentPrice = null;
    },
    clearPriceHistory: state => {
      state.priceHistory = null;
    },
    clearMarketAnalysis: state => {
      state.marketAnalysis = null;
    },
  },
  extraReducers: builder => {
    // initializePricingService
    builder
      .addCase(initializePricingService.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializePricingService.fulfilled, state => {
        state.loading = false;
      })
      .addCase(initializePricingService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'InitializeFailed';
      });

    // fetchCurrentPrice
    builder
      .addCase(fetchCurrentPrice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentPrice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.currentPrice = action.payload.data;
          state.lastUpdated = new Date().toISOString();

          if (action.payload.history) {
            state.priceHistory = action.payload.history;
          }

          if (action.payload.analysis) {
            state.marketAnalysis = action.payload.analysis;
          }

          if (action.payload.alerts) {
            state.userAlerts = action.payload.alerts;
          }
        } else {
          state.error = action.payload.error || 'Get價格Failed';
        }
      })
      .addCase(fetchCurrentPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Get價格Failed';
      });

    // fetchPriceHistory
    builder
      .addCase(fetchPriceHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPriceHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.priceHistory = action.payload;
      })
      .addCase(fetchPriceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Get歷史數據Failed';
      });

    // createPriceAlert
    builder
      .addCase(createPriceAlert.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPriceAlert.fulfilled, (state, action) => {
        state.loading = false;
        state.userAlerts.push(action.payload);
        state.alertForm = initialState.alertForm;
      })
      .addCase(createPriceAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Create警報Failed';
      });

    // fetchUserAlerts
    builder
      .addCase(fetchUserAlerts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.userAlerts = action.payload;
      })
      .addCase(fetchUserAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Get警報Failed';
      });

    // updateAlertStatus
    builder
      .addCase(updateAlertStatus.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAlertStatus.fulfilled, (state, action) => {
        state.loading = false;
        const _alert = state.userAlerts.find(
          a => a.id === action.payload.alertId
        );
        if (alert) {
          alert.isActive = action.payload.isActive;
        }
      })
      .addCase(updateAlertStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Update警報狀態Failed';
      });

    // deletePriceAlert
    builder
      .addCase(deletePriceAlert.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePriceAlert.fulfilled, (state, action) => {
        state.loading = false;
        state.userAlerts = state.userAlerts.filter(
          a => a.id !== action.payload
        );
      })
      .addCase(deletePriceAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Delete警報Failed';
      });

    // fetchMarketStats
    builder
      .addCase(fetchMarketStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketStats.fulfilled, (state, action) => {
        state.loading = false;
        state.marketStats = action.payload;
      })
      .addCase(fetchMarketStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Get市場統計Failed';
      });

    // generateMarketAnalysis
    builder
      .addCase(generateMarketAnalysis.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateMarketAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.marketAnalysis = action.payload;
      })
      .addCase(generateMarketAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '生成市場分析Failed';
      });
  },
});

// Actions
export const {
  setSelectedCardId,
  setSelectedPeriod,
  updateAlertForm,
  resetAlertForm,
  clearError,
  clearCurrentPrice,
  clearPriceHistory,
  clearMarketAnalysis,
} = pricingSlice.actions;

// Selectors
export const _selectCurrentPrice = (state: { pricing: PricingState }) =>
  state.pricing.currentPrice;
export const _selectPriceHistory = (state: { pricing: PricingState }) =>
  state.pricing.priceHistory;
export const _selectMarketAnalysis = (state: { pricing: PricingState }) =>
  state.pricing.marketAnalysis;
export const _selectUserAlerts = (state: { pricing: PricingState }) =>
  state.pricing.userAlerts;
export const _selectMarketStats = (state: { pricing: PricingState }) =>
  state.pricing.marketStats;
export const _selectPricingLoading = (state: { pricing: PricingState }) =>
  state.pricing.loading;
export const _selectPricingError = (state: { pricing: PricingState }) =>
  state.pricing.error;
export const _selectLastUpdated = (state: { pricing: PricingState }) =>
  state.pricing.lastUpdated;
export const _selectSelectedCardId = (state: { pricing: PricingState }) =>
  state.pricing.selectedCardId;
export const _selectSelectedPeriod = (state: { pricing: PricingState }) =>
  state.pricing.selectedPeriod;
export const _selectAlertForm = (state: { pricing: PricingState }) =>
  state.pricing.alertForm;

export default pricingSlice.reducer;
