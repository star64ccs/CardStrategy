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

// 創建服務實例
const _priceDataService = new PriceDataService();

// 價格數據狀態類型
export interface PriceDataState {
  // 歷史價格數據
  historicalPrices: {
    [cardId: string]: {
      [platform: string]: PriceHistory;
    };
  };

  // 評級數據
  gradingData: {
    [cardId: string]: {
      [agency: string]: GradingAgencyData;
    };
  };

  // 推薦平台
  recommendedPlatforms: PricePlatform[] | null;

  // 平台狀態
  platformStatus: {
    [platformId: string]: {
      isActive: boolean;
      lastUpdate: Date;
      reliability: number;
    };
  };

  // 價格警報
  priceAlerts: PriceAlert[];

  // 市場統計
  marketStats: {
    [cardId: string]: MarketStats;
  };

  // 加載狀態
  isLoading: boolean;
  isUpdating: boolean;

  // 錯誤狀態
  error: string | null;

  // 過濾器和設置
  filters: {
    timeRange: {
      start: string;
      end: string;
    };
    minConfidence: number;
  };

  // 分頁
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// 初始狀態
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

// 異步 Thunk Actions

// 獲取歷史價格數據
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
      return rejectWithValue(error.message || '獲取歷史價格數據失敗');
    }
  }
);

// 獲取鑑定機構數據
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
      return rejectWithValue(error.message || '獲取鑑定機構數據失敗');
    }
  }
);

// 獲取平台推薦
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
      return rejectWithValue(error.message || '獲取平台推薦失敗');
    }
  }
);

// 檢查平台狀態
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
      return rejectWithValue(error.message || '檢查平台狀態失敗');
    }
  }
);

// 批量獲取價格數據
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

      // 並行獲取歷史價格數據
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

      // 並行獲取鑑定機構數據
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

      // 處理歷史價格結果
      historicalResults.forEach((result: unknown, index: number) => {
        if (result?.data) {
          results.historicalPrices.push(...result.data);
        }
      });

      // 處理鑑定機構結果
      gradingResults.forEach((result: unknown, index: number) => {
        if (result?.data) {
          results.gradingData.push(...result.data);
        }
      });

      return results;
    } catch (error: unknown) {
      const _errorMessage =
        error instanceof Error ? error.message : '批量獲取價格數據失敗';
      logger.error('❌ Fetch batch price data failed:', {
        error: errorMessage,
      });
      return rejectWithValue(errorMessage);
    }
  }
);

// 價格數據 Slice
const _priceDataSlice = createSlice({
  name: 'priceData',
  initialState,
  reducers: {
    // 清除錯誤
    clearError: state => {
      state.error = null;
    },

    // 設置過濾器
    setFilters: (
      state,
      action: PayloadAction<Partial<PriceDataState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // 清除過濾器
    clearFilters: state => {
      state.filters = initialState.filters;
    },

    // 設置分頁
    setPagination: (
      state,
      action: PayloadAction<Partial<PriceDataState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // 清除特定卡牌的數據
    clearCardData: (state, action: PayloadAction<string>) => {
      const _cardId = action.payload;
      delete state.historicalPrices[cardId];
      delete state.gradingData[cardId];
    },

    // 清除所有數據
    clearAllData: state => {
      state.historicalPrices = {};
      state.gradingData = {};
      state.recommendedPlatforms = null;
      state.platformStatus = {};
    },

    // 更新歷史價格數據
    updateHistoricalPrices: (
      state,
      action: PayloadAction<HistoricalPriceData[]>
    ) => {
      action.payload.forEach((data: unknown) => {
        if (!state.historicalPrices[data.cardId]) {
          state.historicalPrices[data.cardId] = {};
        }
        // 轉換 HistoricalPriceData 為 PriceHistory 格式
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

    // 更新鑑定機構數據
    updateGradingData: (state, action: PayloadAction<GradingAgencyData[]>) => {
      action.payload.forEach(data => {
        if (!state.gradingData[data.cardId]) {
          state.gradingData[data.cardId] = {};
        }
        state.gradingData[data.cardId][data.agency] = data;
      });
    },

    // 設置平台狀態
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
      // 轉換平台狀態格式
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
        // 將數據組織到狀態中
        action.payload.forEach((data: unknown) => {
          if (!state.historicalPrices[data.cardId]) {
            state.historicalPrices[data.cardId] = {};
          }
          // 轉換 HistoricalPriceData 為 PriceHistory 格式
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
        // 將數據組織到狀態中
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
        // 處理歷史價格數據
        action.payload.historicalPrices.forEach((data: unknown) => {
          if (!state.historicalPrices[data.cardId]) {
            state.historicalPrices[data.cardId] = {};
          }
          state.historicalPrices[data.cardId][data.platform] = data;
        });
        // 處理鑑定機構數據
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

// 導出 actions
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

// 導出 reducer
export default priceDataSlice.reducer;

// 導出選擇器
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
