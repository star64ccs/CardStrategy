import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { currencyService } from '../../features/currency/services/currencyService';
import type {
  CurrencyState,
  CurrencyInfo,
  ExchangeRate,
  CurrencyConversion,
  CurrencyConversionRequest,
  ExchangeRateRequest,
  CurrencyEvent,
} from '../../features/currency/types/currency';
import {
  CurrencyUpdateRequest,
  CurrencyStats,
  DEFAULT_CURRENCY_STATE,
} from '../../features/currency/types/currency';

// 異步 Thunk Actions
export const _initializeCurrency = createAsyncThunk(
  'currency/initialize',
  async (_, { rejectWithValue }) => {
    try {
      await currencyService.initialize();
      return {
        currentCurrency: currencyService.getCurrentCurrency(),
        availableCurrencies: currencyService.getAvailableCurrencies(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '初始化失敗'
      );
    }
  }
);

export const _changeCurrency = createAsyncThunk(
  'currency/changeCurrency',
  async (currency: string, { rejectWithValue }) => {
    try {
      const _response = await currencyService.changeCurrency(currency);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '更改貨幣失敗'
      );
    }
  }
);

export const _convertCurrency = createAsyncThunk(
  'currency/convertCurrency',
  async (request: CurrencyConversionRequest, { rejectWithValue }) => {
    try {
      const _response = await currencyService.convertCurrency(request);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '貨幣轉換失敗'
      );
    }
  }
);

export const _getExchangeRate = createAsyncThunk(
  'currency/getExchangeRate',
  async (request: ExchangeRateRequest, { rejectWithValue }) => {
    try {
      const _response = await currencyService.getExchangeRate(request);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取匯率失敗'
      );
    }
  }
);

export const _updateExchangeRates = createAsyncThunk(
  'currency/updateExchangeRates',
  async (_, { rejectWithValue }) => {
    try {
      await currencyService.updateExchangeRates();
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '更新匯率失敗'
      );
    }
  }
);

export const _getCurrencyStats = createAsyncThunk(
  'currency/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const _stats = currencyService.getStats();
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取統計失敗'
      );
    }
  }
);

// 創建 Slice
const _currencySlice = createSlice({
  name: 'currency',
  initialState: DEFAULT_CURRENCY_STATE,
  reducers: {
    setCurrentCurrency: (state, action: PayloadAction<string>) => {
      state.currentCurrency = action.payload;
    },
    setAvailableCurrencies: (
      state,
      action: PayloadAction<Record<string, CurrencyInfo>>
    ) => {
      state.availableCurrencies = action.payload;
    },
    setExchangeRate: (
      state,
      action: PayloadAction<{ key: string; rate: ExchangeRate }>
    ) => {
      state.exchangeRates[action.payload.key] = action.payload.rate;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    addConversion: (state, action: PayloadAction<CurrencyConversion>) => {
      state.conversionHistory.push(action.payload);
      if (state.conversionHistory.length > 100) {
        state.conversionHistory = state.conversionHistory.slice(-100);
      }
    },
    updateUserPreferences: (
      state,
      action: PayloadAction<Partial<CurrencyState['userPreferences']>>
    ) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload };
    },
    addEvent: (state, action: PayloadAction<CurrencyEvent>) => {
      // 可以選擇將事件存儲在狀態中
      state.lastUpdated = action.payload.timestamp;
    },
    reset: state => {
      return { ...DEFAULT_CURRENCY_STATE };
    },
  },
  extraReducers: builder => {
    // initializeCurrency
    builder
      .addCase(initializeCurrency.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeCurrency.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.currentCurrency = action.payload.currentCurrency;
        state.availableCurrencies = action.payload.availableCurrencies;
        state.lastUpdated = new Date();
      })
      .addCase(initializeCurrency.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // changeCurrency
    builder
      .addCase(changeCurrency.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeCurrency.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.currency) {
          state.currentCurrency = action.payload.currency.code;
        }
        state.lastUpdated = action.payload.timestamp;
      })
      .addCase(changeCurrency.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // convertCurrency
    builder
      .addCase(convertCurrency.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(convertCurrency.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.conversion) {
          state.conversionHistory.push(action.payload.conversion);
          if (state.conversionHistory.length > 100) {
            state.conversionHistory = state.conversionHistory.slice(-100);
          }
        }
        state.lastUpdated = action.payload.timestamp;
      })
      .addCase(convertCurrency.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getExchangeRate
    builder
      .addCase(getExchangeRate.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getExchangeRate.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.rate) {
          const _key = `${action.payload.rate.fromCurrency}_${action.payload.rate.toCurrency}`;
          state.exchangeRates[key] = action.payload.rate;
        }
        state.lastUpdated = action.payload.timestamp;
      })
      .addCase(getExchangeRate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateExchangeRates
    builder
      .addCase(updateExchangeRates.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExchangeRates.fulfilled, state => {
        state.isLoading = false;
        state.lastUpdated = new Date();
      })
      .addCase(updateExchangeRates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // getCurrencyStats
    builder
      .addCase(getCurrencyStats.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrencyStats.fulfilled, state => {
        state.isLoading = false;
        // 統計數據可以通過 selector 從 service 獲取，不需要存儲在狀態中
      })
      .addCase(getCurrencyStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 導出 Actions
export const {
  setCurrentCurrency,
  setAvailableCurrencies,
  setExchangeRate,
  setLoading,
  setError,
  clearError,
  addConversion,
  updateUserPreferences,
  addEvent,
  reset,
} = currencySlice.actions;

// 導出 Selectors
export const _selectCurrentCurrency = (state: { currency: CurrencyState }) =>
  state.currency.currentCurrency;
export const _selectAvailableCurrencies = (state: {
  currency: CurrencyState;
}) => state.currency.availableCurrencies;
export const _selectExchangeRates = (state: { currency: CurrencyState }) =>
  state.currency.exchangeRates;
export const _selectIsLoading = (state: { currency: CurrencyState }) =>
  state.currency.isLoading;
export const _selectError = (state: { currency: CurrencyState }) =>
  state.currency.error;
export const _selectLastUpdated = (state: { currency: CurrencyState }) =>
  state.currency.lastUpdated;
export const _selectIsInitialized = (state: { currency: CurrencyState }) =>
  state.currency.isInitialized;
export const _selectConversionHistory = (state: { currency: CurrencyState }) =>
  state.currency.conversionHistory;
export const _selectUserPreferences = (state: { currency: CurrencyState }) =>
  state.currency.userPreferences;

// 計算選擇器
export const _selectCurrentCurrencyInfo = (state: {
  currency: CurrencyState;
}) => {
  const { currentCurrency, availableCurrencies } = state.currency;
  return availableCurrencies[currentCurrency];
};

export const _selectSupportedCurrencyCodes = (state: {
  currency: CurrencyState;
}) => {
  return Object.keys(state.currency.availableCurrencies);
};

export const _selectActiveCurrencies = (state: { currency: CurrencyState }) => {
  const { availableCurrencies } = state.currency;
  return Object.values(availableCurrencies).filter(
    currency => currency.isActive
  );
};

export const _selectCurrencyCount = (state: { currency: CurrencyState }) => {
  return Object.keys(state.currency.availableCurrencies).length;
};

export const _selectActiveCurrencyCount = (state: {
  currency: CurrencyState;
}) => {
  return Object.values(state.currency.availableCurrencies).filter(
    currency => currency.isActive
  ).length;
};

export const _selectRecentConversions = (
  state: { currency: CurrencyState },
  limit = 10
) => {
  return state.currency.conversionHistory.slice(-limit).reverse();
};

export const _selectConversionStats = (state: { currency: CurrencyState }) => {
  const { conversionHistory } = state.currency;
  if (conversionHistory.length === 0) {
    return {
      totalConversions: 0,
      totalAmount: 0,
      averageAmount: 0,
      mostUsedFromCurrency: '',
      mostUsedToCurrency: '',
    };
  }

  const _totalConversions = conversionHistory.length;
  const _totalAmount = conversionHistory.reduce(
    (sum, conv) => sum + conv.amount,
    0
  );
  const _averageAmount = totalAmount / totalConversions;

  // 計算最常用的貨幣
  const _fromCurrencyCount = new Map<string, number>();
  const _toCurrencyCount = new Map<string, number>();

  conversionHistory.forEach(conv => {
    fromCurrencyCount.set(
      conv.fromCurrency,
      (fromCurrencyCount.get(conv.fromCurrency) || 0) + 1
    );
    toCurrencyCount.set(
      conv.toCurrency,
      (toCurrencyCount.get(conv.toCurrency) || 0) + 1
    );
  });

  const _mostUsedFromCurrency =
    Array.from(fromCurrencyCount.entries()).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || '';
  const _mostUsedToCurrency =
    Array.from(toCurrencyCount.entries()).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || '';

  return {
    totalConversions,
    totalAmount,
    averageAmount,
    mostUsedFromCurrency,
    mostUsedToCurrency,
  };
};

export default currencySlice.reducer;
