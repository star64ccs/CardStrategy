import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { logger } from '@/utils/logger';

// 語言資源
import zhTW from './locales/zh-TW.json';
import enUS from './locales/en-US.json';
import jaJP from './locales/ja-JP.json';

// 支援的語言
export const supportedLanguages = {
  'zh-TW': {
    name: '繁體中文',
    nativeName: '繁體中文',
    flag: '🇹🇼',
  },
  'en-US': {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  'ja-JP': {
    name: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵',
  },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

// 語言檢測
const getLanguageFromStorage = async (): Promise<SupportedLanguage> => {
  try {
    const storedLanguage = await AsyncStorage.getItem('userLanguage');
    if (storedLanguage && storedLanguage in supportedLanguages) {
      return storedLanguage as SupportedLanguage;
    }
  } catch (error) {
    logger.warn('Failed to get language from storage:', { error });
  }

  // 使用系統語言
  const [systemLanguage] = Localization.getLocales();
  const languageTag = systemLanguage?.languageTag || 'zh-TW';
  const [languageCode] = languageTag.split('-');

  // 映射系統語言到支援的語言
  const languageMap: Record<string, SupportedLanguage> = {
    zh: 'zh-TW',
    en: 'en-US',
    ja: 'ja-JP',
  };

  return languageMap[languageCode as keyof typeof languageMap] || 'en-US';
};

// 語言資源
const resources = {
  'zh-TW': {
    translation: zhTW,
  },
  'en-US': {
    translation: enUS,
  },
  'ja-JP': {
    translation: jaJP,
  },
};

// i18n 配置
i18n.use(initReactI18next).init({
  resources,
  lng: 'en-US', // 默認語言，會在初始化時更新
  fallbackLng: 'en-US',
  debug: __DEV__,

  interpolation: {
    escapeValue: false, // React 已經處理了 XSS
  },

  react: {
    useSuspense: false,
  },

  // 命名空間
  ns: ['translation'],
  defaultNS: 'translation',

  // 檢測選項
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
});

// 初始化語言
const initializeLanguage = async (): Promise<void> => {
  try {
    const language = await getLanguageFromStorage();
    await i18n.changeLanguage(language);
  } catch (error) {
    logger.error('Failed to initialize language:', { error });
  }
};

// 語言切換
export const changeLanguage = async (
  language: SupportedLanguage
): Promise<void> => {
  try {
    await AsyncStorage.setItem('userLanguage', language);
    await i18n.changeLanguage(language);
  } catch (error) {
    logger.error('Failed to change language:', { error });
  }
};

// 獲取當前語言
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language as SupportedLanguage) || 'en-US';
};

// 獲取語言信息
export const getLanguageInfo = (language: SupportedLanguage) => {
  return supportedLanguages[language];
};

// 格式化數字
export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => {
  const language = getCurrentLanguage();
  return new Intl.NumberFormat(language, options).format(value);
};

// 格式化貨幣
export const formatCurrency = (value: number, currency = 'TWD'): string => {
  const language = getCurrentLanguage();
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
  }).format(value);
};

// 格式化日期
export const formatDate = (
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const language = getCurrentLanguage();
  return new Intl.DateTimeFormat(language, options).format(date);
};

// 格式化相對時間
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const language = getCurrentLanguage();
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  }
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
};

// 語言映射
const languageMap: Record<string, string> = {
  zh: 'zh-TW',
  en: 'en-US',
  ja: 'ja-JP',
};

// 獲取語言代碼
export const getLanguageCode = (): string => {
  const [locale] = Localization.getLocales();
  const languageCode = locale?.languageTag?.split('-')[0] || 'en';
  return languageMap[languageCode as keyof typeof languageMap] || 'en-US';
};

// 初始化
initializeLanguage();

export default i18n;
