import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  changeLanguage,
  detectLanguage,
  getTranslationStats,
  initializeI18n,
  selectAvailableLanguages,
  selectCurrentLanguage,
  selectCurrentLanguageInfo,
  selectError,
  selectIsInitialized,
  selectIsLoading,
  selectIsRTL,
  selectLanguageCount,
  selectLastUpdated,
  translateText,
} from '../../../store/slices/i18nSlice';
import type {
  I18nContextValue,
  LanguageChangeRequest,
  LanguageChangeResponse,
  TranslationRequest,
  TranslationStats,
} from '../types/i18n';

// 主要國際化 Hook
export const _useI18n = (): I18nContextValue => {
  const _dispatch = useAppDispatch();
  const { t } = useTranslation();

  // 從 Redux store 獲取狀態
  const _currentLanguage = useSelector(selectCurrentLanguage);
  const _availableLanguages = useSelector(selectAvailableLanguages);
  const _isInitialized = useSelector(selectIsInitialized);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);
  const _isRTLValue = useSelector(selectIsRTL);
  const _languageCount = useSelector(selectLanguageCount);
  const _lastUpdated = useSelector(selectLastUpdated);
  const _currentLanguageInfo = useSelector(selectCurrentLanguageInfo);

  // 初始化 i18n 服務
  const _initialize = useCallback(
    async (config?: unknown) => {
      try {
        await (dispatch(initializeI18n(config)) as any).unwrap();
      } catch (error) {
        console.error('初始化 i18n 失敗:', error);
      }
    },
    [dispatch]
  );

  // 切換語言
  const _changeLanguageHandler = useCallback(
    async (language: string): Promise<LanguageChangeResponse> => {
      try {
        const request: LanguageChangeRequest = {
          language,
          persist: true,
        };
        const _result = await (
          dispatch(changeLanguage(request)) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('切換語言失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 檢測語言
  const _detectLanguageHandler = useCallback(async () => {
    try {
      const _result = await (dispatch(detectLanguage()) as any).unwrap();
      return result;
    } catch (error) {
      console.error('檢測語言失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 翻譯文本
  const _translateTextHandler = useCallback(
    async (request: TranslationRequest) => {
      try {
        const _result = await (dispatch(translateText(request)) as any).unwrap();
        return result;
      } catch (error) {
        console.error('翻譯文本失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取翻譯統計
  const _getTranslationStatsHandler =
    useCallback(async (): Promise<TranslationStats> => {
      try {
        const _result = await (dispatch(getTranslationStats()) as any).unwrap();
        return result;
      } catch (error) {
        console.error('獲取翻譯統計失敗:', error);
        throw error;
      }
    }, [dispatch]);

  // 格式化日期
  const _formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions) => {
      return new Intl.DateTimeFormat(currentLanguage, options).format(date);
    },
    [currentLanguage]
  );

  // 格式化數字
  const _formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(currentLanguage, options).format(number);
    },
    [currentLanguage]
  );

  // 格式化貨幣
  const _formatCurrency = useCallback(
    (amount: number, currency?: string) => {
      const _currencyCode = currency || 'USD';
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    },
    [currentLanguage]
  );

  // 格式化相對時間
  const _formatRelativeTime = useCallback(
    (date: Date) => {
      const _now = new Date();
      const _diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return t('time.justNow');
      } else if (diffInSeconds < 3600) {
        const _minutes = Math.floor(diffInSeconds / 60);
        return t('time.minutesAgo', { count: minutes });
      } else if (diffInSeconds < 86400) {
        const _hours = Math.floor(diffInSeconds / 3600);
        return t('time.hoursAgo', { count: hours });
      } else {
        const _days = Math.floor(diffInSeconds / 86400);
        return t('time.daysAgo', { count: days });
      }
    },
    [t]
  );

  // 翻譯函數
  const _translate = useCallback(
    (key: string, options?: TranslationRequest['options']) => {
      return t(key, options);
    },
    [t]
  );

  // 工具函數
  const _isRTL = useCallback((): boolean => {
    return isRTLValue;
  }, [isRTLValue]);

  const _getDirection = useCallback((): 'ltr' | 'rtl' => {
    return isRTLValue ? 'rtl' : 'ltr';
  }, [isRTLValue]);

  const _getStats = useCallback((): TranslationStats => {
    return {
      totalKeys: 0,
      translatedKeys: 0,
      missingKeys: 0,
      completionRate: 0,
      lastUpdated: lastUpdated || new Date(),
      languages: {},
    };
  }, [lastUpdated]);

  // 自動初始化
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    // 狀態
    currentLanguage,
    availableLanguages,
    isInitialized,
    isLoading,
    error,

    // 方法
    changeLanguage: changeLanguageHandler,
    translate,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,

    // 工具
    isRTL,
    getDirection,
    getStats,
  };
};

// 語言管理 Hook
export const _useLanguage = () => {
  const _dispatch = useAppDispatch();
  const _currentLanguage = useSelector(selectCurrentLanguage);
  const _availableLanguages = useSelector(selectAvailableLanguages);
  const _isRTL = useSelector(selectIsRTL);
  const _currentLanguageInfo = useSelector(selectCurrentLanguageInfo);

  const _changeLanguageHandler = useCallback(
    async (language: string): Promise<LanguageChangeResponse> => {
      try {
        const request: LanguageChangeRequest = {
          language,
          persist: true,
        };
        const _result = await (
          dispatch(changeLanguage(request)) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('切換語言失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _detectLanguageHandler = useCallback(async (): Promise<any> => {
    try {
      const _result = await (dispatch(detectLanguage()) as any).unwrap();
      return result;
    } catch (error) {
      console.error('檢測語言失敗:', error);
      throw error;
    }
  }, [dispatch]);

  return {
    currentLanguage,
    availableLanguages,
    isRTL,
    currentLanguageInfo,
    changeLanguage: changeLanguageHandler,
    detectLanguage: detectLanguageHandler,
  };
};

// 翻譯 Hook
export const _useI18nTranslation = () => {
  const _dispatch = useAppDispatch();
  const { t } = useTranslation();

  const _translateTextHandler = useCallback(
    async (request: TranslationRequest): Promise<any> => {
      try {
        const _result = await (dispatch(translateText(request)) as any).unwrap();
        return result;
      } catch (error) {
        console.error('翻譯文本失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _getTranslationStatsHandler2 =
    useCallback(async (): Promise<TranslationStats> => {
      try {
        const _result = await (dispatch(getTranslationStats()) as any).unwrap();
        return result;
      } catch (error) {
        console.error('獲取翻譯統計失敗:', error);
        throw error;
      }
    }, [dispatch]);

  return {
    t,
    translateText: translateTextHandler,
    getTranslationStats: getTranslationStatsHandler2,
  };
};

// 格式化 Hook
export const _useFormatting = () => {
  const _currentLanguage = useSelector(selectCurrentLanguage);

  const _formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions) => {
      return new Intl.DateTimeFormat(currentLanguage, options).format(date);
    },
    [currentLanguage]
  );

  const _formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(currentLanguage, options).format(number);
    },
    [currentLanguage]
  );

  const _formatCurrency = useCallback(
    (amount: number, currency?: string) => {
      const _currencyCode = currency || 'USD';
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    },
    [currentLanguage]
  );

  const _formatRelativeTime = useCallback((date: Date) => {
    const _now = new Date();
    const _diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '剛剛';
    } else if (diffInSeconds < 3600) {
      const _minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} 分鐘前`;
    } else if (diffInSeconds < 86400) {
      const _hours = Math.floor(diffInSeconds / 3600);
      return `${hours} 小時前`;
    } else {
      const _days = Math.floor(diffInSeconds / 86400);
      return `${days} 天前`;
    }
  }, []);

  return {
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
  };
};

// 統計 Hook
export const _useI18nStats = () => {
  const _dispatch = useAppDispatch();
  const _languageCount = useSelector(selectLanguageCount);
  const _lastUpdated = useSelector(selectLastUpdated);

  const _getTranslationStatsHandler =
    useCallback(async (): Promise<TranslationStats> => {
      try {
        const _result = await (dispatch(getTranslationStats()) as any).unwrap();
        return result;
      } catch (error) {
        console.error('獲取翻譯統計失敗:', error);
        throw error;
      }
    }, [dispatch]);

  const _getMissingTranslations = useCallback(async () => {
    try {
      const _stats = await (dispatch(getTranslationStats()) as any).unwrap();
      return stats?.missingKeys || 0;
    } catch (error) {
      console.error('獲取缺失翻譯失敗:', error);
      return 0;
    }
  }, [dispatch]);

  return {
    languageCount,
    lastUpdated,
    getTranslationStats: getTranslationStatsHandler,
    getMissingTranslations,
  };
};

// 工具 Hook
export const _useI18nTools = () => {
  const _dispatch = useAppDispatch();

  const _initialize = useCallback(
    async (config?: unknown) => {
      try {
        await (dispatch(initializeI18n(config)) as any).unwrap();
      } catch (error) {
        console.error('初始化 i18n 失敗:', error);
      }
    },
    [dispatch]
  );

  return {
    initialize,
  };
};

// 初始化 Hook
export const _useI18nInitialization = () => {
  const _dispatch = useAppDispatch();
  const _isInitialized = useSelector(selectIsInitialized);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);

  const _initialize = useCallback(
    async (config?: unknown) => {
      try {
        await (dispatch(initializeI18n(config)) as any).unwrap();
      } catch (error) {
        console.error('初始化 i18n 失敗:', error);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    isInitialized,
    isLoading,
    error,
    initialize,
  };
};
