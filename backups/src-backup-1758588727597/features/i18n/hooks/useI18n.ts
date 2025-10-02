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
export const useI18n = (): I18nContextValue => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  // 從 Redux store 獲取狀態
  const currentLanguage = useSelector(selectCurrentLanguage);
  const availableLanguages = useSelector(selectAvailableLanguages);
  const isInitialized = useSelector(selectIsInitialized);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isRTLValue = useSelector(selectIsRTL);
  const languageCount = useSelector(selectLanguageCount);
  const lastUpdated = useSelector(selectLastUpdated);
  const currentLanguageInfo = useSelector(selectCurrentLanguageInfo);

  // 初始化 i18n 服務
  const initialize = useCallback(
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
  const changeLanguageHandler = useCallback(
    async (language: string): Promise<LanguageChangeResponse> => {
      try {
        const request: LanguageChangeRequest = {
          language,
          persist: true,
        };
        const result = await (
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
  const detectLanguageHandler = useCallback(async () => {
    try {
      const result = await (dispatch(detectLanguage()) as any).unwrap();
      return result;
    } catch (error) {
      console.error('檢測語言失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 翻譯文本
  const translateTextHandler = useCallback(
    async (request: TranslationRequest) => {
      try {
        const result = await (
          dispatch(translateText(request)) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('翻譯文本失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取翻譯統計
  const getTranslationStatsHandler =
    useCallback(async (): Promise<TranslationStats> => {
      try {
        const result = await (dispatch(getTranslationStats()) as any).unwrap();
        return result;
      } catch (error) {
        console.error('獲取翻譯統計失敗:', error);
        throw error;
      }
    }, [dispatch]);

  // 格式化日期
  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions) => {
      return new Intl.DateTimeFormat(currentLanguage, options).format(date);
    },
    [currentLanguage]
  );

  // 格式化數字
  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(currentLanguage, options).format(number);
    },
    [currentLanguage]
  );

  // 格式化貨幣
  const formatCurrency = useCallback(
    (amount: number, currency?: string) => {
      const currencyCode = currency || 'USD';
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    },
    [currentLanguage]
  );

  // 格式化相對時間
  const formatRelativeTime = useCallback(
    (date: Date) => {
      const now = new Date();
      const diffInSeconds = Math.floor(
        (now.getTime() - date.getTime()) / 1000
      );

      if (diffInSeconds < 60) {
        return t('time.justNow');
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return t('time.minutesAgo', { count: minutes });
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return t('time.hoursAgo', { count: hours });
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return t('time.daysAgo', { count: days });
      }
    },
    [t]
  );

  // 翻譯函數
  const translate = useCallback(
    (key: string, options?: TranslationRequest['options']) => {
      return t(key, options);
    },
    [t]
  );

  // 工具函數
  const isRTL = useCallback((): boolean => {
    return isRTLValue;
  }, [isRTLValue]);

  const getDirection = useCallback((): 'ltr' | 'rtl' => {
    return isRTLValue ? 'rtl' : 'ltr';
  }, [isRTLValue]);

  const getStats = useCallback((): TranslationStats => {
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
export const useLanguage = () => {
  const dispatch = useAppDispatch();
  const currentLanguage = useSelector(selectCurrentLanguage);
  const availableLanguages = useSelector(selectAvailableLanguages);
  const isRTL = useSelector(selectIsRTL);
  const currentLanguageInfo = useSelector(selectCurrentLanguageInfo);

  const changeLanguageHandler = useCallback(
    async (language: string): Promise<LanguageChangeResponse> => {
      try {
        const request: LanguageChangeRequest = {
          language,
          persist: true,
        };
        const result = await (
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

  const detectLanguageHandler = useCallback(async (): Promise<any> => {
    try {
      const result = await (dispatch(detectLanguage()) as any).unwrap();
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
export const useI18nTranslation = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const translateTextHandler = useCallback(
    async (request: TranslationRequest): Promise<any> => {
      try {
        const result = await (
          dispatch(translateText(request)) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('翻譯文本失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getTranslationStatsHandler2 =
    useCallback(async (): Promise<TranslationStats> => {
      try {
        const result = await (dispatch(getTranslationStats()) as any).unwrap();
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
export const useFormatting = () => {
  const currentLanguage = useSelector(selectCurrentLanguage);

  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions) => {
      return new Intl.DateTimeFormat(currentLanguage, options).format(date);
    },
    [currentLanguage]
  );

  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(currentLanguage, options).format(number);
    },
    [currentLanguage]
  );

  const formatCurrency = useCallback(
    (amount: number, currency?: string) => {
      const currencyCode = currency || 'USD';
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    },
    [currentLanguage]
  );

  const formatRelativeTime = useCallback((date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '剛剛';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} 分鐘前`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} 小時前`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
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
export const useI18nStats = () => {
  const dispatch = useAppDispatch();
  const languageCount = useSelector(selectLanguageCount);
  const lastUpdated = useSelector(selectLastUpdated);

  const getTranslationStatsHandler =
    useCallback(async (): Promise<TranslationStats> => {
      try {
        const result = await (dispatch(getTranslationStats()) as any).unwrap();
        return result;
      } catch (error) {
        console.error('獲取翻譯統計失敗:', error);
        throw error;
      }
    }, [dispatch]);

  const getMissingTranslations = useCallback(async () => {
    try {
      const stats = await (dispatch(getTranslationStats()) as any).unwrap();
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
export const useI18nTools = () => {
  const dispatch = useAppDispatch();

  const initialize = useCallback(
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
export const useI18nInitialization = () => {
  const dispatch = useAppDispatch();
  const isInitialized = useSelector(selectIsInitialized);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const initialize = useCallback(
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
