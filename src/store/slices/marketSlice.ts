import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type { MarketState } from '../../core/types';
import { marketService } from '../../shared/services/marketService';

// Async thunks
export const _fetchMarketData = createAsyncThunk(
  'market/fetchMarketData',
  async (cardId: string, { rejectWithValue }) => {
    try {
      const _response = await marketService.getMarketData(cardId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Get市場數據Failed');
    }
  }
);

export const _fetchPriceHistory = createAsyncThunk(
  'market/fetchPriceHistory',
  async (
    {
      cardId,
      period,
    }: { cardId: string; period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' },
    { rejectWithValue }
  ) => {
    try {
      const _response = await marketService.getPriceHistory(cardId, period);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Get價格歷史Failed');
    }
  }
);

export const _fetchMarketTrends = createAsyncThunk(
  'market/fetchMarketTrends',
  async (_, { rejectWithValue }) => {
    try {
      const _response = await marketService.getMarketTrends();
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Get市場趨勢Failed');
    }
  }
);

// Initial state
const initialState: MarketState = {
  marketData: null,
  priceHistory: [],
  marketTrends: [],
  isLoading: false,
  error: null,
};

// Market slice
const _marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearMarketData: state => {
      state.marketData = null;
      state.priceHistory = [];
    },
  },
  extraReducers: builder => {
    // Fetch Market Data
    builder
      .addCase(fetchMarketData.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.marketData = [action.payload];
        state.error = null;
      })
      .addCase(fetchMarketData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Price History
    builder
      .addCase(fetchPriceHistory.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPriceHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        // 將Single PriceHistory ObjectConvert為Array
        state.priceHistory = [action.payload];
        state.error = null;
      })
      .addCase(fetchPriceHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Market Trends
    builder
      .addCase(fetchMarketTrends.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        // 將市場趨勢DataConvert為 MarketTrend Array格式
        const marketTrends: unknown[] = [];
        if (action.payload.trendingUp) {
          action.payload.trendingUp.forEach((cardId: string) => {
            marketTrends.push({
              cardId,
              trend: 'rising' as const,
              changePercentage: 0,
              volume: 0,
              confidence: 0,
              timeframe: '24h',
            });
          });
        }
        if (action.payload.trendingDown) {
          action.payload.trendingDown.forEach((cardId: string) => {
            marketTrends.push({
              cardId,
              trend: 'falling' as const,
              changePercentage: 0,
              volume: 0,
              confidence: 0,
              timeframe: '24h',
            });
          });
        }
        if (action.payload.stable) {
          action.payload.stable.forEach((cardId: string) => {
            marketTrends.push({
              cardId,
              trend: 'stable' as const,
              changePercentage: 0,
              volume: 0,
              confidence: 0,
              timeframe: '24h',
            });
          });
        }
        state.marketTrends = marketTrends;
        state.error = null;
      })
      .addCase(fetchMarketTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearMarketData } = marketSlice.actions;
export default marketSlice.reducer;
