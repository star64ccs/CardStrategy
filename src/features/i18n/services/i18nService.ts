import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { logger } from '../../../core/utils/logger';

// 語言資源
import enUS from '../../../i18n/locales/en-US.json';
import jaJP from '../../../i18n/locales/ja-JP.json';
import zhTW from '../../../i18n/locales/zh-TW.json';
import { DEFAULT_I18N_CONFIG, DEFAULT_LANGUAGES } from '../types/i18n';
import type {
  I18nConfig,
  I18nEvent,
  I18nManager,
  I18nState,
  I18nTools,
  LanguageChangeResponse,
  LanguageInfo,
  TranslationRequest,
  TranslationStats,
} from '../types/i18n';

class I18nService implements I18nManager, I18nTools {
  private static instance: I18nService;
  private config: I18nConfig;
  private readonly state: I18nState;
  private readonly eventListeners: Map<
    I18nEvent['type'],
    Set<(event: I18nEvent) => void>
  >;
  private readonly formatters: {
    number: Map<string, Intl.NumberFormat>;
    date: Map<string, Intl.DateTimeFormat>;
    relativeTime: Map<string, Intl.RelativeTimeFormat>;
  };
  private readonly missingTranslations: {
    key: string;
    namespace: string;
    language: string;
  }[];

  private constructor() {
    this.config = {
      ...DEFAULT_I18N_CONFIG,
      supportedLanguages: { ...DEFAULT_LANGUAGES },
    };
    this.state = {
      currentLanguage: this.config.defaultLanguage,
      availableLanguages: { ...DEFAULT_LANGUAGES },
      isInitialized: false,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
    };
    this.eventListeners = new Map();
    this.formatters = {
      number: new Map(),
      date: new Map(),
      relativeTime: new Map(),
    };
    this.missingTranslations = [];
  }

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  // 初始化
  async initialize(config?: Partial<I18nConfig>): Promise<void> {
    try {
      this.state.isLoading = true;
      this.emitEvent('initialized', { language: this.state.currentLanguage });

      // 合併配置
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // 初始化 i18next
      const _resources = {
        'zh-TW': { translation: zhTW },
        'en-US': { translation: enUS },
        'ja-JP': { translation: jaJP },
      };

      await i18n.use(initReactI18next).init({
        resources,
        lng: this.config.defaultLanguage,
        fallbackLng: this.config.fallbackLanguage,
        debug: this.config.debug,
        interpolation: {
          escapeValue: this.config.interpolation.escapeValue,
        },
        react: {
          useSuspense: false,
        },
        ns: ['translation'],
        defaultNS: 'translation',
      });

      // 檢測語言
      if (this.config.autoDetect) {
        const _detectedLanguage = await this.detectLanguage();
        await this.changeLanguage(detectedLanguage);
      } else {
        // 從存儲中讀取語言設置
        const _storedLanguage = await this.getStoredLanguage();
        if (storedLanguage && this.isLanguageSupported(storedLanguage)) {
          await this.changeLanguage(storedLanguage);
        }
      }

      this.state.isInitialized = true;
      this.state.isLoading = false;
      this.emitEvent('initialized', { language: this.state.currentLanguage });

      logger.info('I18nService initialized successfully', {
        currentLanguage: this.state.currentLanguage,
        availableLanguages: Object.keys(this.state.availableLanguages),
      });
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : 'Unknown error';
      this.state.isLoading = false;
      this.emitEvent('error', { error: this.state.error });
      logger.error('Failed to initialize I18nService:', { error });
      throw error;
    }
  }

  // 語言管理
  getCurrentLanguage(): string {
    return this.state.currentLanguage;
  }

  getAvailableLanguages(): Record<string, LanguageInfo> {
    return { ...this.state.availableLanguages };
  }

  async changeLanguage(language: string): Promise<LanguageChangeResponse> {
    try {
      if (!this.isLanguageSupported(language)) {
        throw new Error(`Language ${language} is not supported`);
      }

      const _previousLanguage = this.state.currentLanguage;

      // 切換語言
      await i18n.changeLanguage(language);
      this.state.currentLanguage = language;
      this.state.lastUpdated = new Date();

      // 持久化語言設置
      if (this.config.persistLanguage) {
        await AsyncStorage.setItem('userLanguage', language);
      }

      // 清除格式化器緩存
      this.formatters.number.clear();
      this.formatters.date.clear();
      this.formatters.relativeTime.clear();

      this.emitEvent('languageChanged', {
        language,
        key: previousLanguage,
      });

      logger.info('Language changed successfully', {
        from: previousLanguage,
        to: language,
      });

      return {
        success: true,
        previousLanguage,
        newLanguage: language,
        message: `Language changed to ${language}`,
      };
    } catch (error) {
      const _errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.emitEvent('error', { error: errorMessage });
      logger.error('Failed to change language:', { error, language });

      return {
        success: false,
        previousLanguage: this.state.currentLanguage,
        newLanguage: language,
        message: 'Failed to change language',
        error: errorMessage,
      };
    }
  }

  async detectLanguage(): Promise<string> {
    try {
      // 從存儲中讀取
      const _storedLanguage = await this.getStoredLanguage();
      if (storedLanguage && this.isLanguageSupported(storedLanguage)) {
        return storedLanguage;
      }

      // 使用系統語言
      const [systemLocale] = Localization.getLocales();
      const _languageCode = this.getLanguageFromLocale(
        systemLocale?.languageTag || 'en-US'
      );

      if (this.isLanguageSupported(languageCode)) {
        return languageCode;
      }

      // 回退到默認語言
      return this.config.defaultLanguage;
    } catch (error) {
      logger.warn('Failed to detect language, using default:', { error });
      return this.config.defaultLanguage;
    }
  }

  // 翻譯功能
  translate(key: string, options?: TranslationRequest['options']): string {
    try {
      const _result = i18n.t(key, {
        ...options,
        defaultValue: options?.defaultValue || key,
      });

      // 檢查是否為默認值（翻譯缺失）
      if (result === key || result === options?.defaultValue) {
        this.recordMissingTranslation(key, 'translation');
        this.emitEvent('translationMissing', { key, namespace: 'translation' });
      }

      return result;
    } catch (error) {
      logger.error('Translation error:', { error, key, options });
      return options?.defaultValue || key;
    }
  }

  translateWithNamespace(
    namespace: string,
    key: string,
    options?: TranslationRequest['options']
  ): string {
    try {
      const _result = i18n.t(key, {
        ns: namespace,
        ...options,
        defaultValue: options?.defaultValue || key,
      });

      if (result === key || result === options?.defaultValue) {
        this.recordMissingTranslation(key, namespace);
        this.emitEvent('translationMissing', { key, namespace });
      }

      return result;
    } catch (error) {
      logger.error('Translation with namespace error:', {
        error,
        namespace,
        key,
        options,
      });
      return options?.defaultValue || key;
    }
  }

  hasTranslation(key: string, namespace?: string): boolean {
    try {
      const _result = i18n.t(key, { ns: namespace, returnObjects: true });
      return typeof result === 'string' && result !== key;
    } catch {
      return false;
    }
  }

  // 格式化功能
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    const _language = this.state.currentLanguage;
    const _cacheKey = `${language}-${JSON.stringify(options)}`;

    if (!this.formatters.number.has(cacheKey)) {
      this.formatters.number.set(
        cacheKey,
        new Intl.NumberFormat(language, options)
      );
    }

    return this.formatters.number.get(cacheKey).format(value);
  }

  formatCurrency(
    value: number,
    currency?: string,
    options?: Intl.NumberFormatOptions
  ): string {
    const _language = this.state.currentLanguage;
    const _defaultCurrency =
      this.state.availableLanguages[language]?.numberFormat.currency || 'USD';
    const _currencyCode = currency || defaultCurrency;

    return this.formatNumber(value, {
      style: 'currency',
      currency: currencyCode,
      ...options,
    });
  }

  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const _language = this.state.currentLanguage;
    const _cacheKey = `${language}-${JSON.stringify(options)}`;

    if (!this.formatters.date.has(cacheKey)) {
      this.formatters.date.set(
        cacheKey,
        new Intl.DateTimeFormat(language, options)
      );
    }

    return this.formatters.date.get(cacheKey).format(date);
  }

  formatRelativeTime(date: Date): string {
    const _language = this.state.currentLanguage;
    const _now = new Date();
    const _diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (!this.formatters.relativeTime.has(language)) {
      this.formatters.relativeTime.set(
        language,
        new Intl.RelativeTimeFormat(language, { numeric: 'auto' })
      );
    }

    const _rtf = this.formatters.relativeTime.get(language)!;

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
  }

  formatPlural(count: number, singular: string, plural: string): string {
    const _language = this.state.currentLanguage;
    const _rtf = new Intl.PluralRules(language);
    const _rule = rtf.select(count);
    return rule === 'one' ? singular : plural;
  }

  // 統計和監控
  getStats(): TranslationStats {
    const _languages = Object.keys(this.state.availableLanguages);
    const stats: TranslationStats = {
      totalKeys: 0,
      translatedKeys: 0,
      missingKeys: this.missingTranslations.length,
      completionRate: 0,
      lastUpdated: this.state.lastUpdated,
      languages: {},
    };

    languages.forEach(lang => {
      const _missingForLang = this.missingTranslations.filter(
        t => t.language === lang
      ).length;
      const _totalForLang = 1000; // 估算總鍵數
      const _translatedForLang = totalForLang - missingForLang;

      stats.languages[lang] = {
        keys: totalForLang,
        missing: missingForLang,
        completionRate: (translatedForLang / totalForLang) * 100,
      };

      stats.totalKeys += totalForLang;
      stats.translatedKeys += translatedForLang;
    });

    stats.completionRate =
      stats.totalKeys > 0 ? (stats.translatedKeys / stats.totalKeys) * 100 : 0;

    return stats;
  }

  getMissingTranslations(): {
    key: string;
    namespace: string;
    language: string;
  }[] {
    return [...this.missingTranslations];
  }

  // 事件管理
  on(event: I18nEvent['type'], callback: (event: I18nEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  off(event: I18nEvent['type'], callback: (event: I18nEvent) => void): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // 工具方法
  isRTL(): boolean {
    const _language = this.state.availableLanguages[this.state.currentLanguage];
    return language?.direction === 'rtl';
  }

  getDirection(): 'ltr' | 'rtl' {
    const _language = this.state.availableLanguages[this.state.currentLanguage];
    return language?.direction || 'ltr';
  }

  getDateFormat(): string {
    const _language = this.state.availableLanguages[this.state.currentLanguage];
    return language?.dateFormat || 'YYYY/MM/DD';
  }

  getTimeFormat(): string {
    const _language = this.state.availableLanguages[this.state.currentLanguage];
    return language?.timeFormat || 'HH:mm:ss';
  }

  getNumberFormat(): LanguageInfo['numberFormat'] {
    const _language = this.state.availableLanguages[this.state.currentLanguage];
    return (
      language?.numberFormat || {
        decimal: '.',
        thousands: ',',
        currency: 'USD',
      }
    );
  }

  // I18nTools 實現
  createTranslationKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }

  parseTranslationKey(fullKey: string): { namespace: string; key: string } {
    const _parts = fullKey.split(':');
    if (parts.length === 2) {
      return { namespace: parts[0], key: parts[1] };
    }
    return { namespace: 'translation', key: fullKey };
  }

  validateTranslationKey(key: string): boolean {
    return typeof key === 'string' && key.length > 0 && !key.includes(' ');
  }

  createNumberFormatter(options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    return new Intl.NumberFormat(this.state.currentLanguage, options);
  }

  createDateFormatter(
    options?: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(this.state.currentLanguage, options);
  }

  createRelativeTimeFormatter(): Intl.RelativeTimeFormat {
    return new Intl.RelativeTimeFormat(this.state.currentLanguage, {
      numeric: 'auto',
    });
  }

  normalizeLanguageCode(code: string): string {
    return code.toLowerCase().replace('_', '-');
  }

  getLanguageFromLocale(locale: string): string {
    const [language] = locale.split('-');
    const languageMap: Record<string, string> = {
      zh: 'zh-TW',
      en: 'en-US',
      ja: 'ja-JP',
    };
    return languageMap[language] || 'en-US';
  }

  getRegionFromLocale(locale: string): string {
    const _parts = locale.split('-');
    return parts.length > 1 ? parts[1] : '';
  }

  isLanguageSupported(code: string): boolean {
    return code in this.state.availableLanguages;
  }

  truncateText(text: string, maxLength: number, suffix = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  capitalizeText(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  normalizeText(text: string): string {
    return text.trim().toLowerCase();
  }

  validateLanguageCode(code: string): boolean {
    return /^[a-z]{2}(-[A-Z]{2})?$/.test(code);
  }

  validateTranslationData(data: unknown): boolean {
    return typeof data === 'object' && data !== null;
  }

  validateConfig(config: I18nConfig): string[] {
    const errors: string[] = [];

    if (!config.defaultLanguage) {
      errors.push('Default language is required');
    }

    if (!config.fallbackLanguage) {
      errors.push('Fallback language is required');
    }

    if (Object.keys(config.supportedLanguages).length === 0) {
      errors.push('At least one supported language is required');
    }

    return errors;
  }

  // 私有方法
  private async getStoredLanguage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('userLanguage');
    } catch (error) {
      logger.warn('Failed to get stored language:', { error });
      return null;
    }
  }

  private recordMissingTranslation(key: string, namespace: string): void {
    const _existing = this.missingTranslations.find(
      t =>
        t.key === key &&
        t.namespace === namespace &&
        t.language === this.state.currentLanguage
    );

    if (!existing) {
      this.missingTranslations.push({
        key,
        namespace,
        language: this.state.currentLanguage,
      });
    }
  }

  private emitEvent(type: I18nEvent['type'], data: I18nEvent['data']): void {
    const event: I18nEvent = {
      type,
      timestamp: new Date(),
      data,
    };

    const _listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          logger.error('Error in event listener:', { error, event });
        }
      });
    }
  }
}

// 導出單例實例
export const _i18nService = I18nService.getInstance();
export default i18nService;
