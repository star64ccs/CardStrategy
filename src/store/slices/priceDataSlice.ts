import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { logger } from '../../core/utils/logger';
import type {
  PriceHistory,
  MarketStats,
  PriceAlert,
} from '../../shared/services/priceDataService';
import {
  PriceDataService,
  PriceData,
} from '../../shared/services/priceDataService';
import type {
  PricePlatform,
  GradingAgency,
  HistoricalPriceData,
  GradingAgencyData,
} from '../../types/priceData';

// CreateServiceInstance
const _priceDataService = new PriceDataService();

// 價格DataStatusClass型
export interface PriceDataState {
  // 歷史價格Data
  historicalPrices: {
    [cardId: string]: {
      [platform: string]: PriceHistory;
    };
  };

  // 評級Data
  gradingData: {
    [cardId: string]: {
      [agency: string]: GradingAgencyData;
    };
  };

  // 推薦平台
  recommendedPlatforms: PricePlatform[] | null;

  // 平台Status
  platformStatus: {
    [platformId: string]: {
      isActive: boolean;
      lastUpdate: Date;
      reliability: number;
    };
  };

  // 價格Alert
  priceAlerts: PriceAlert[];

  // 市場Statistics
  marketStats: {
    [cardId: string]: MarketStats;
  };

  // 加載Status
  isLoading: boolean;
  isUpdating: boolean;

  // ErrorStatus
  error: string | null;

  // Filter器和Settings
  filters: {
    timeRange: {
      start: string;
      end: string;
    };
    minConfidence: number;
  };

  // Paginate
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// 初始Status
const initialState: PriceDataState = {
  historicalPrices: {},
  gradingData: {},
  recommendedPlatforms: null,
  platformStatus: {},
  priceAlerts: [],
  marketStats: {},
  isLoading: false,
  isUpdating: false,
  error: null,
  filters: {
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
    minConfidence: 0.7,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// Async Thunk Actions

// Get歷史價格Data
export const _fetchHistoricalPrices = createAsyncThunk(
  'priceData/fetchHistoricalPrices',
  async (
    params: {
      cardId: string;
      platforms?: PricePlatform[];
      timeRange?: { start: string; end: string };
    },
    { rejectWithValue }
  ) => {
    try {
      const _response = await priceDataService.getHistoricalPrices(
        params.cardId,
        params.platforms,
        params.timeRange
      );
      return response.data;
    } catch (error: unknown) {
      logger.error('❌ Fetch historical prices failed:', {
        error: error.message,
      });
      return rejectWithValue(error.message || 'Get歷史價格數據Failed');
    }
  }
);

// Get鑑定機構Data
export const _fetchGradingAgencyData = createAsyncThunk(
  'priceData/fetchGradingAgencyData',
  async (
    params: {
      cardId: string;
      agencies?: GradingAgency[];
    },
    { rejectWithValue }
  ) => {
    try {
      const _response = await priceDataService.getGradingAgencyData(
        params.cardId,
        params.agencies
      );
      return response.data;
    } catch (error: unknown) {
      logger.error('❌ Fetch grading agency data failed:', {
        error: error.message,
      });
      return rejectWithValue(error.message || 'Get鑑定機構數據Failed');
    }
  }
);

// Get平台推薦
export const _fetchRecommendedPlatforms = createAsyncThunk(
  'priceData/fetchRecommendedPlatforms',
  async (_, { rejectWithValue }) => {
    try {
      const _response = await priceDataService.getRecommendedPlatforms();
      return response.data;
    } catch (error: unknown) {
      logger.error('❌ Fetch recommended platforms failed:', {
        error: error.message,
      });
      return rejectWithValue(error.message || 'Get平台推薦Failed');
    }
  }
);

// Check平台Status
export const _checkPlatformStatus = createAsyncThunk(
  'priceData/checkPlatformStatus',
  async (platforms: PricePlatform[], { rejectWithValue }) => {
    try {
      const _response = await priceDataService.checkPlatformStatus(platforms);
      return response.data;
    } catch (error: unknown) {
      logger.error('❌ Check platform status failed:', {
        error: error.message,
      });
      return rejectWithValue(error.message || 'Check平台狀態Failed');
    }
  }
);

// BatchGet價格Data
export const _fetchBatchPriceData = createAsyncThunk(
  'priceData/fetchBatchPriceData',
  async (
    params: {
      cardIds: string[];
      platforms?: PricePlatform[];
      agencies?: GradingAgency[];
      timeRange?: { start: string; end: string };
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const _results = {
        historicalPrices: [] as HistoricalPriceData[],
        gradingData: [] as GradingAgencyData[],
      };

      // ParallelGet歷史價格Data
      const _historicalPromises = params.cardIds.map(cardId =>
        priceDataService
          .getHistoricalPrices(cardId, params.platforms, params.timeRange)
          .catch((error: unknown) => {
            logger.error(
              `❌ Failed to fetch historical prices for card ${cardId}:`,
              { error: error.message }
            );
            return null;
          })
      );

      // ParallelGet鑑定機構Data
      const _gradingPromises = params.cardIds.map(cardId =>
        priceDataService
          .getGradingAgencyData(cardId, params.agencies)
          .catch((error: unknown) => {
            logger.error(
              `❌ Failed to fetch grading data for card ${cardId}:`,
              { error: error.message }
            );
            return null;
          })
      );

      const [historicalResults, gradingResults] = await Promise.all([
        Promise.all(historicalPromises),
        Promise.all(gradingPromises),
      ]);

      // Handle歷史價格結果
      historicalResults.forEach((result: unknown, index: number) => {
        if (result?.data) {
          results.historicalPrices.push(...result.data);
        }
      });

      // Handle鑑定機構結果
      gradingResults.forEach((result: unknown, index: number) => {
        if (result?.data) {
          results.gradingData.push(...result.data);
        }
      });

      return results;
    } catch (error: unknown) {
      const _errorMessage =
        error instanceof Error ? error.message : '批量Get價格數據Failed';
      logger.error('❌ Fetch batch price data failed:', {
        error: errorMessage,
      });
      return rejectWithValue(errorMessage);
    }
  }
);

// 價格Data Slice
const _priceDataSlice = createSlice({
  name: 'priceData',
  initialState,
  reducers: {
    // ClearError
    clearError: state => {
      state.error = null;
    },

    // SettingsFilter器
    setFilters: (
      state,
      action: PayloadAction<Partial<PriceDataState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // ClearFilter器
    clearFilters: state => {
      state.filters = initialState.filters;
    },

    // SettingsPaginate
    setPagination: (
      state,
      action: PayloadAction<Partial<PriceDataState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // ClearSpecific卡牌的Data
    clearCardData: (state, action: PayloadAction<string>) => {
      const _cardId = action.payload;
      delete state.historicalPrices[cardId];
      delete state.gradingData[cardId];
    },

    // Clear所有Data
    clearAllData: state => {
      state.historicalPrices = {};
      state.gradingData = {};
      state.recommendedPlatforms = null;
      state.platformStatus = {};
    },

    // Update歷史價格Data
    updateHistoricalPrices: (
      state,
      action: PayloadAction<HistoricalPriceData[]>
    ) => {
      action.payload.forEach((data: unknown) => {
        if (!state.historicalPrices[data.cardId]) {
          state.historicalPrices[data.cardId] = {};
        }
        // Convert HistoricalPriceData 為 PriceHistory 格式
        state.historicalPrices[data.cardId][data.platform] = {
          cardId: data.cardId,
          prices: [
            {
              price: data.price,
              timestamp: new Date(data.date),
              volume: data.volume,
            },
          ],
          period: '1m',
        };
      });
    },

    // Update鑑定機構Data
    updateGradingData: (state, action: PayloadAction<GradingAgencyData[]>) => {
      action.payload.forEach(data => {
        if (!state.gradingData[data.cardId]) {
          state.gradingData[data.cardId] = {};
        }
        state.gradingData[data.cardId][data.agency] = data;
      });
    },

    // Settings平台Status
    setPlatformStatus: (
      state,
      action: PayloadAction<{
        [platform: string]: {
          status: 'online' | 'offline' | 'limited';
          lastCheck: string;
          responseTime: number;
          error?: string;
        };
      }>
    ) => {
      // Convert平台Status格式
      const convertedStatus: unknown = {};
      Object.entries(action.payload).forEach(([platform, status]) => {
        convertedStatus[platform] = {
          isActive: status.status === 'online',
          lastUpdate: new Date(status.lastCheck),
          reliability:
            status.status === 'online'
              ? 1.0
              : status.status === 'limited'
                ? 0.5
                : 0.0,
        };
      });
      state.platformStatus = { ...state.platformStatus, ...convertedStatus };
    },
  },
  extraReducers: builder => {
    // Fetch Historical Prices
    builder
      .addCase(fetchHistoricalPrices.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHistoricalPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        // 將Data組織到Status中
        action.payload.forEach((data: unknown) => {
          if (!state.historicalPrices[data.cardId]) {
            state.historicalPrices[data.cardId] = {};
          }
          // Convert HistoricalPriceData 為 PriceHistory 格式
          state.historicalPrices[data.cardId][data.platform] = {
            cardId: data.cardId,
            prices: [
              {
                price: data.price,
                timestamp: new Date(data.date),
                volume: data.volume,
              },
            ],
            period: '1m',
          };
        });
        state.error = null;
      })
      .addCase(fetchHistoricalPrices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Grading Agency Data
    builder
      .addCase(fetchGradingAgencyData.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGradingAgencyData.fulfilled, (state, action) => {
        state.isLoading = false;
        // 將Data組織到Status中
        action.payload.forEach((data: unknown) => {
          if (!state.gradingData[data.cardId]) {
            state.gradingData[data.cardId] = {};
          }
          state.gradingData[data.cardId][data.agency] = data;
        });
        state.error = null;
      })
      .addCase(fetchGradingAgencyData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Recommended Platforms
    builder
      .addCase(fetchRecommendedPlatforms.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedPlatforms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendedPlatforms = action.payload;
        state.error = null;
      })
      .addCase(fetchRecommendedPlatforms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check Platform Status
    builder
      .addCase(checkPlatformStatus.pending, state => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(checkPlatformStatus.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.platformStatus = { ...state.platformStatus, ...action.payload };
        state.error = null;
      })
      .addCase(checkPlatformStatus.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch Batch Price Data
    builder
      .addCase(fetchBatchPriceData.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBatchPriceData.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle歷史價格Data
        action.payload.historicalPrices.forEach((data: unknown) => {
          if (!state.historicalPrices[data.cardId]) {
            state.historicalPrices[data.cardId] = {};
          }
          state.historicalPrices[data.cardId][data.platform] = data;
        });
        // Handle鑑定機構Data
        action.payload.gradingData.forEach((data: unknown) => {
          if (!state.gradingData[data.cardId]) {
            state.gradingData[data.cardId] = {};
          }
          state.gradingData[data.cardId][data.agency] = data;
        });
        state.error = null;
      })
      .addCase(fetchBatchPriceData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  clearCardData,
  clearAllData,
  updateHistoricalPrices,
  updateGradingData,
  setPlatformStatus,
} = priceDataSlice.actions;

// Export reducer
export default priceDataSlice.reducer;

// ExportSelect器
export const _selectPriceData = (state: { priceData: PriceDataState }) =>
  state.priceData;
export const _selectHistoricalPrices = (state: { priceData: PriceDataState }) =>
  state.priceData.historicalPrices;
export const _selectGradingData = (state: { priceData: PriceDataState }) =>
  state.priceData.gradingData;
export const _selectRecommendedPlatforms = (state: {
  priceData: PriceDataState;
}) => state.priceData.recommendedPlatforms;
export const _selectPlatformStatus = (state: { priceData: PriceDataState }) =>
  state.priceData.platformStatus;
export const _selectFilters = (state: { priceData: PriceDataState }) =>
  state.priceData.filters;
export const _selectPagination = (state: { priceData: PriceDataState }) =>
  state.priceData.pagination;
export const _selectIsLoading = (state: { priceData: PriceDataState }) =>
  state.priceData.isLoading;
export const _selectIsUpdating = (state: { priceData: PriceDataState }) =>
  state.priceData.isUpdating;
export const _selectError = (state: { priceData: PriceDataState }) =>
  state.priceData.error;
