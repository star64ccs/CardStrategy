// 國際化類型定義

// 支持的語言
export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
}

// 語言配置
export interface I18nConfig {
  defaultLanguage: string;
  supportedLanguages: Record<string, LanguageInfo>;
  fallbackLanguage: string;
  autoDetect: boolean;
  persistLanguage: boolean;
  loadPath: string;
  debug: boolean;
  interpolation: {
    escapeValue: boolean;
    prefix: string;
    suffix: string;
  };
  pluralSeparator: string;
  contextSeparator: string;
  keySeparator: string;
}

// 國際化狀態
export interface I18nState {
  currentLanguage: string;
  availableLanguages: Record<string, LanguageInfo>;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date;
}

// 翻譯請求
export interface TranslationRequest {
  key: string;
  namespace?: string;
  options?: {
    count?: number;
    context?: string;
    interpolation?: Record<string, any>;
    defaultValue?: string;
  };
}

// 翻譯響應
export interface TranslationResponse {
  text: string;
  key: string;
  namespace: string;
  language: string;
  interpolated: boolean;
  pluralized: boolean;
}

// 語言切換請求
export interface LanguageChangeRequest {
  language: string;
  persist?: boolean;
  reload?: boolean;
}

// 語言切換響應
export interface LanguageChangeResponse {
  success: boolean;
  previousLanguage: string;
  newLanguage: string;
  message: string;
  error?: string;
}

// 翻譯統計
export interface TranslationStats {
  totalKeys: number;
  translatedKeys: number;
  missingKeys: number;
  completionRate: number;
  lastUpdated: Date;
  languages: Record<
    string,
    {
      keys: number;
      missing: number;
      completionRate: number;
    }
  >;
}

// 國際化事件
export interface I18nEvent {
  type:
    | 'languageChanged'
    | 'translationLoaded'
    | 'translationMissing'
    | 'initialized'
    | 'error';
  timestamp: Date;
  data: {
    language?: string;
    key?: string;
    namespace?: string;
    error?: string;
  };
}

// 國際化管理器接口
export interface I18nManager {
  // 初始化
  initialize(config?: Partial<I18nConfig>): Promise<void>;

  // 語言管理
  getCurrentLanguage(): string;
  getAvailableLanguages(): Record<string, LanguageInfo>;
  changeLanguage(language: string): Promise<LanguageChangeResponse>;
  detectLanguage(): Promise<string>;

  // 翻譯功能
  translate(key: string, options?: TranslationRequest['options']): string;
  translateWithNamespace(
    namespace: string,
    key: string,
    options?: TranslationRequest['options']
  ): string;
  hasTranslation(key: string, namespace?: string): boolean;

  // 格式化功能
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
  formatCurrency(
    value: number,
    currency?: string,
    options?: Intl.NumberFormatOptions
  ): string;
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string;
  formatRelativeTime(date: Date): string;
  formatPlural(count: number, singular: string, plural: string): string;

  // 統計和監控
  getStats(): TranslationStats;
  getMissingTranslations(): {
    key: string;
    namespace: string;
    language: string;
  }[];

  // 事件管理
  on(event: I18nEvent['type'], callback: (event: I18nEvent) => void): void;
  off(event: I18nEvent['type'], callback: (event: I18nEvent) => void): void;

  // 工具方法
  isRTL(): boolean;
  getDirection(): 'ltr' | 'rtl';
  getDateFormat(): string;
  getTimeFormat(): string;
  getNumberFormat(): LanguageInfo['numberFormat'];
}

// 國際化工具接口
export interface I18nTools {
  // 翻譯工具
  createTranslationKey(namespace: string, key: string): string;
  parseTranslationKey(fullKey: string): { namespace: string; key: string };
  validateTranslationKey(key: string): boolean;

  // 格式化工具
  createNumberFormatter(options?: Intl.NumberFormatOptions): Intl.NumberFormat;
  createDateFormatter(
    options?: Intl.DateTimeFormatOptions
  ): Intl.DateTimeFormat;
  createRelativeTimeFormatter(): Intl.RelativeTimeFormat;

  // 語言工具
  normalizeLanguageCode(code: string): string;
  getLanguageFromLocale(locale: string): string;
  getRegionFromLocale(locale: string): string;
  isLanguageSupported(code: string): boolean;

  // 文本工具
  truncateText(text: string, maxLength: number, suffix?: string): string;
  capitalizeText(text: string): string;
  normalizeText(text: string): string;

  // 驗證工具
  validateLanguageCode(code: string): boolean;
  validateTranslationData(data: unknown): boolean;
  validateConfig(config: I18nConfig): string[];
}

// 國際化組件屬性
export interface I18nProps {
  children?: React.ReactNode;
  language?: string;
  namespace?: string;
  fallback?: string;
  count?: number;
  context?: string;
  interpolation?: Record<string, any>;
}

// 國際化組件狀態
export interface I18nComponentState {
  currentLanguage: string;
  isRTL: boolean;
  isLoading: boolean;
  error: string | null;
}

// 國際化動作
export interface I18nAction {
  type:
    | 'SET_LANGUAGE'
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'SET_STATS'
    | 'ADD_EVENT';
  payload: unknown;
}

// 國際化上下文
export interface I18nContextValue {
  // 狀態
  currentLanguage: string;
  availableLanguages: Record<string, LanguageInfo>;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // 方法
  changeLanguage: (language: string) => Promise<LanguageChangeResponse>;
  translate: (key: string, options?: TranslationRequest['options']) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date) => string;

  // 工具
  isRTL: () => boolean;
  getDirection: () => 'ltr' | 'rtl';
  getStats: () => TranslationStats;
}

// 默認配置
export const DEFAULT_I18N_CONFIG: I18nConfig = {
  defaultLanguage: 'zh-TW',
  fallbackLanguage: 'en-US',
  autoDetect: true,
  persistLanguage: true,
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  debug: false,
  interpolation: {
    escapeValue: false,
    prefix: '{{',
    suffix: '}}',
  },
  pluralSeparator: '_',
  contextSeparator: '_',
  keySeparator: '.',
  supportedLanguages: {},
};

// 默認語言信息
export const DEFAULT_LANGUAGES: Record<string, LanguageInfo> = {
  'zh-TW': {
    code: 'zh-TW',
    name: '繁體中文',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm:ss',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'TWD',
    },
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'USD',
    },
  },
  'ja-JP': {
    code: 'ja-JP',
    name: '日本語',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm:ss',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'JPY',
    },
  },
};
