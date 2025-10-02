import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  changeCurrency,
  convertCurrency,
  getCurrencyStats,
  getExchangeRate,
  initializeCurrency,
  selectActiveCurrencyCount,
  selectAvailableCurrencies,
  selectConversionHistory,
  selectConversionStats,
  selectCurrencyCount,
  selectCurrentCurrency,
  selectError,
  selectIsInitialized,
  selectIsLoading,
  selectLastUpdated,
  selectRecentConversions,
  updateExchangeRates,
} from '../../../store/slices/currencySlice';
import { currencyService } from '../services/currencyService';
import type {
  CurrencyContextValue,
  CurrencyConversionRequest,
  CurrencyEvent,
} from '../types/currency';

// 主要的貨幣 Hook
export const _useCurrency = (): CurrencyContextValue => {
  const _dispatch = useAppDispatch();
  const _currentCurrency = useSelector(selectCurrentCurrency);
  const _availableCurrencies = useSelector(selectAvailableCurrencies);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);
  const _isInitialized = useSelector(selectIsInitialized);

  // Initialize
  useEffect(() => {
    if (!isInitialized) {
      (dispatch(initializeCurrency()) as any).unwrap();
    }
  }, [dispatch, isInitialized]);

  // 貨幣Convert
  const _convertCurrencyHandler = useCallback(
    async (request: CurrencyConversionRequest): Promise<any> => {
      const _result = await (
        dispatch(convertCurrency(request)) as any
      ).unwrap();
      return result;
    },
    [dispatch]
  );

  // Format貨幣
  const _formatCurrency = useCallback(
    (amount: number, currency?: string) => {
      return currencyService.formatCurrency(
        amount,
        currency || currentCurrency
      );
    },
    [currentCurrency]
  );

  // 更改貨幣
  const _changeCurrencyHandler = useCallback(
    async (currency: string): Promise<any> => {
      const _result = await (
        dispatch(changeCurrency(currency)) as any
      ).unwrap();
      return result;
    },
    [dispatch]
  );

  // GetStatistics
  const _stats = useMemo(() => {
    return currencyService.getStats();
  }, [currentCurrency, availableCurrencies]);

  return {
    currentCurrency,
    availableCurrencies,
    convertCurrency: convertCurrencyHandler,
    formatCurrency,
    changeCurrency: changeCurrencyHandler,
    isLoading,
    error,
    stats,
  };
};

// 貨幣Manage Hook
export const _useCurrencyManagement = () => {
  const _dispatch = useAppDispatch();
  const _currentCurrency = useSelector(selectCurrentCurrency);
  const _availableCurrencies = useSelector(selectAvailableCurrencies);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);
  const _isInitialized = useSelector(selectIsInitialized);
  const _lastUpdated = useSelector(selectLastUpdated);

  // 更改貨幣
  const _changeCurrencyHandler2 = useCallback(
    async (currency: string): Promise<any> => {
      const _result = await (
        dispatch(changeCurrency(currency)) as any
      ).unwrap();
      return result;
    },
    [dispatch]
  );

  // Update匯率
  const _updateRates = useCallback(async () => {
    await (dispatch(updateExchangeRates()) as any).unwrap();
  }, [dispatch]);

  // Get匯率
  const _getRate = useCallback(
    async (fromCurrency: string, toCurrency: string, forceUpdate?: boolean) => {
      const _result = await (
        dispatch(
          getExchangeRate({ fromCurrency, toCurrency, forceUpdate })
        ) as any
      ).unwrap();
      return result;
    },
    [dispatch]
  );

  // GetStatistics
  const _getStats = useCallback(async () => {
    const _result = await (dispatch(getCurrencyStats()) as any).unwrap();
    return result;
  }, [dispatch]);

  return {
    currentCurrency,
    availableCurrencies,
    isLoading,
    error,
    isInitialized,
    lastUpdated,
    changeCurrency: changeCurrencyHandler2,
    updateRates,
    getRate,
    getStats,
  };
};

// 貨幣Convert Hook
export const _useCurrencyConversion = () => {
  const _dispatch = useAppDispatch();
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);
  const _conversionHistory = useSelector(selectConversionHistory);
  const _recentConversions = useSelector(selectRecentConversions);

  // 執RowConvert
  const _convert = useCallback(
    async (request: CurrencyConversionRequest) => {
      const _result = await (
        dispatch(convertCurrency(request)) as any
      ).unwrap();
      return result;
    },
    [dispatch]
  );

  // 快速Convert（使用當前貨幣）
  const _quickConvert = useCallback(
    async (
      amount: number,
      fromCurrency: string,
      toCurrency: string,
      includeFees = false
    ) => {
      return convert({
        fromCurrency,
        toCurrency,
        amount,
        includeFees,
      });
    },
    [convert]
  );

  // 估算Convert
  const _estimateConversion = useCallback(
    (amount: number, fromCurrency: string, toCurrency: string) => {
      return currencyService.estimateConversion(
        amount,
        fromCurrency,
        toCurrency
      );
    },
    []
  );

  return {
    convert,
    quickConvert,
    estimateConversion,
    isLoading,
    error,
    conversionHistory,
    recentConversions,
  };
};

// 貨幣Format Hook
export const _useCurrencyFormatting = () => {
  const _currentCurrency = useSelector(selectCurrentCurrency);
  const _availableCurrencies = useSelector(selectAvailableCurrencies);

  // Format貨幣
  const _formatCurrency = useCallback(
    (amount: number, currency?: string, options?: Intl.NumberFormatOptions) => {
      return currencyService.formatCurrency(
        amount,
        currency || currentCurrency,
        options
      );
    },
    [currentCurrency]
  );

  // Parse貨幣
  const _parseCurrency = useCallback(
    (value: string, currency?: string) => {
      return currencyService.parseCurrency(value, currency || currentCurrency);
    },
    [currentCurrency]
  );

  // Get貨幣符號
  const _getCurrencySymbol = useCallback(
    (currency?: string) => {
      return currencyService.getCurrencySymbol(currency || currentCurrency);
    },
    [currentCurrency]
  );

  // Get貨幣名稱
  const _getCurrencyName = useCallback(
    (currency?: string) => {
      return currencyService.getCurrencyName(currency || currentCurrency);
    },
    [currentCurrency]
  );

  // CreateFormat器
  const _createFormatter = useCallback(
    (currency?: string, options?: Intl.NumberFormatOptions) => {
      return currencyService.createCurrencyFormatter(
        currency || currentCurrency,
        options
      );
    },
    [currentCurrency]
  );

  return {
    formatCurrency,
    parseCurrency,
    getCurrencySymbol,
    getCurrencyName,
    createFormatter,
    currentCurrency,
    availableCurrencies,
  };
};

// 貨幣Statistics Hook
export const _useCurrencyStats = () => {
  const _conversionHistory = useSelector(selectConversionHistory);
  const _conversionStats = useSelector(selectConversionStats);
  const _currencyCount = useSelector(selectCurrencyCount);
  const _activeCurrencyCount = useSelector(selectActiveCurrencyCount);

  // GetServiceStatistics
  const _getServiceStats = useCallback(() => {
    return currencyService.getStats();
  }, []);

  // 計算ConvertStatistics
  const _calculateConversionStats = useMemo(() => {
    return conversionStats;
  }, [conversionStats]);

  // Get最常用的貨幣
  const _getMostUsedCurrencies = useCallback(() => {
    const _usage = new Map<string, number>();

    conversionHistory.forEach(conv => {
      usage.set(conv.toCurrency, (usage.get(conv.toCurrency) || 0) + 1);
    });

    return Array.from(usage.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([currency, count]) => ({ currency, count }));
  }, [conversionHistory]);

  // GetConvert趨勢
  const _getConversionTrend = useCallback(
    (days = 7) => {
      const _now = new Date();
      const _cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const _recentConversions = conversionHistory.filter(
        conv => conv.timestamp >= cutoff
      );

      const _dailyStats = new Map<string, { count: number; total: number }>();

      recentConversions.forEach(conv => {
        const _date = conv.timestamp.toISOString().split('T')[0];
        const _current = dailyStats.get(date) || { count: 0, total: 0 };
        dailyStats.set(date, {
          count: current.count + 1,
          total: current.total + conv.amount,
        });
      });

      return Array.from(dailyStats.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, stats]) => ({
          date,
          count: stats.count,
          total: stats.total,
          average: stats.total / stats.count,
        }));
    },
    [conversionHistory]
  );

  return {
    getServiceStats,
    calculateConversionStats,
    getMostUsedCurrencies,
    getConversionTrend,
    conversionHistory,
    currencyCount,
    activeCurrencyCount,
  };
};

// 貨幣Tool Hook
export const _useCurrencyTools = () => {
  // Verify貨幣代碼
  const _validateCurrencyCode = useCallback((code: string) => {
    return currencyService.validateCurrencyCode(code);
  }, []);

  // Standard化貨幣代碼
  const _normalizeCurrencyCode = useCallback((code: string) => {
    return currencyService.normalizeCurrencyCode(code);
  }, []);

  // Check貨幣YesNoSupport
  const _isCurrencySupported = useCallback((currency: string) => {
    return currencyService.isCurrencySupported(currency);
  }, []);

  // 計算Convert手續費
  const _calculateConversionFee = useCallback(
    (amount: number, rate: number) => {
      return currencyService.calculateConversionFee(amount, rate);
    },
    []
  );

  // Apply加價
  const _applyMarkup = useCallback((amount: number, markup: number) => {
    return currencyService.applyMarkup(amount, markup);
  }, []);

  // 四捨五入貨幣
  const _roundCurrency = useCallback(
    (amount: number, currency: string, mode?: 'round' | 'floor' | 'ceil') => {
      return currencyService.roundCurrency(amount, currency, mode);
    },
    []
  );

  // Verify金額
  const _validateAmount = useCallback((amount: number) => {
    return currencyService.validateAmount(amount);
  }, []);

  // 清理貨幣Input
  const _sanitizeCurrencyInput = useCallback((input: string) => {
    return currencyService.sanitizeCurrencyInput(input);
  }, []);

  // 比較貨幣
  const _compareCurrencies = useCallback(
    (currency1: string, currency2: string) => {
      return currencyService.compareCurrencies(currency1, currency2);
    },
    []
  );

  return {
    validateCurrencyCode,
    normalizeCurrencyCode,
    isCurrencySupported,
    calculateConversionFee,
    applyMarkup,
    roundCurrency,
    validateAmount,
    sanitizeCurrencyInput,
    compareCurrencies,
  };
};

// 貨幣Event Hook
export const _useCurrencyEvents = () => {
  useEffect(() => {
    const _handleCurrencyChanged = (event: CurrencyEvent) => {
      console.log('貨幣已更改:', event.data.currency);
    };

    const _handleRateUpdated = (event: CurrencyEvent) => {
      console.log('匯率已更新:', event.data.rate);
    };

    const _handleConversionCompleted = (event: CurrencyEvent) => {
      console.log('轉換完成:', event.data.conversion);
    };

    const _handleErrorOccurred = (event: CurrencyEvent) => {
      console.error('貨幣Error:', event.data.error);
    };

    // RegisterEvent監聽器
    currencyService.on('currency_changed', handleCurrencyChanged);
    currencyService.on('rate_updated', handleRateUpdated);
    currencyService.on('conversion_completed', handleConversionCompleted);
    currencyService.on('error_occurred', handleErrorOccurred);

    // 清理Event監聽器
    return () => {
      currencyService.off('currency_changed', handleCurrencyChanged);
      currencyService.off('rate_updated', handleRateUpdated);
      currencyService.off('conversion_completed', handleConversionCompleted);
      currencyService.off('error_occurred', handleErrorOccurred);
    };
  }, []);

  // Manual觸發Event監聽器Register
  const _addEventListener = useCallback(
    (
      event: CurrencyEvent['type'],
      callback: (event: CurrencyEvent) => void
    ) => {
      currencyService.on(event, callback);
    },
    []
  );

  const _removeEventListener = useCallback(
    (
      event: CurrencyEvent['type'],
      callback: (event: CurrencyEvent) => void
    ) => {
      currencyService.off(event, callback);
    },
    []
  );

  return {
    addEventListener,
    removeEventListener,
  };
};

// 貨幣Initialize Hook
export const _useCurrencyInitialization = () => {
  const _dispatch = useAppDispatch();
  const _isInitialized = useSelector(selectIsInitialized);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);

  // Initialize
  const _initialize = useCallback(async () => {
    if (!isInitialized) {
      await (dispatch(initializeCurrency()) as any).unwrap();
    }
  }, [dispatch, isInitialized]);

  // ReInitialize
  const _reinitialize = useCallback(async () => {
    await (dispatch(initializeCurrency()) as any).unwrap();
  }, [dispatch]);

  return {
    initialize,
    reinitialize,
    isInitialized,
    isLoading,
    error,
  };
};

// DefaultExport
export default useCurrency;
