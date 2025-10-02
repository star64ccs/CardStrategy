// 多幣種SupportClass型定義
export interface CurrencyInfo {
  code: string; // 貨幣代碼 (USD, EUR, TWD, etc.)
  name: string; // 貨幣名稱
  symbol: string; // 貨幣符號 ($, €, NT$, etc.)
  decimalPlaces: number; // 小數位數
  position: 'before' | 'after'; // 符號位置
  isDefault: boolean; // YesNo為Default貨幣
  isActive: boolean; // YesNoEnable
  locale?: string; // LocaleSettings
  formatOptions?: Intl.NumberFormatOptions; // FormatOptions
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: Date;
  source: string; // 匯率來源
  isRealtime: boolean; // YesNo實時匯率
  confidence: number; // 置信度 (0-1)
}

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: Date;
  fees?: number; // Convert手續費
  markup?: number; // 加價比例
}

export interface CurrencyConfig {
  defaultCurrency: string;
  supportedCurrencies: Record<string, CurrencyInfo>;
  exchangeRateUpdateInterval: number; // Update間隔 (毫Second)
  autoUpdate: boolean; // AutoUpdate匯率
  fallbackRates: Record<string, number>; // 備用匯率
  apiEndpoints: {
    exchangeRate: string;
    currencyList: string;
  };
  cacheExpiry: number; // Cache過期Time (毫Second)
  retryAttempts: number; // Retry次數
  timeout: number; // 超時Time (毫Second)
}

export interface CurrencyState {
  currentCurrency: string;
  availableCurrencies: Record<string, CurrencyInfo>;
  exchangeRates: Record<string, ExchangeRate>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isInitialized: boolean;
  conversionHistory: CurrencyConversion[];
  userPreferences: {
    autoConvert: boolean;
    showOriginalPrice: boolean;
    decimalPlaces: number;
    roundingMode: 'round' | 'floor' | 'ceil';
  };
}

export interface CurrencyConversionRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  includeFees?: boolean;
  applyMarkup?: boolean;
}

export interface CurrencyConversionResponse {
  success: boolean;
  conversion?: CurrencyConversion;
  error?: string;
  timestamp: Date;
}

export interface ExchangeRateRequest {
  fromCurrency: string;
  toCurrency: string;
  forceUpdate?: boolean;
}

export interface ExchangeRateResponse {
  success: boolean;
  rate?: ExchangeRate;
  error?: string;
  timestamp: Date;
}

export interface CurrencyUpdateRequest {
  currency: string;
  enabled?: boolean;
  isDefault?: boolean;
}

export interface CurrencyUpdateResponse {
  success: boolean;
  currency?: CurrencyInfo;
  error?: string;
  timestamp: Date;
}

export interface CurrencyStats {
  totalConversions: number;
  mostUsedCurrency: string;
  averageConversionAmount: number;
  lastConversionDate: Date | null;
  conversionAccuracy: number; // Convert準確率
  apiResponseTime: number; // API ResponseTime
  cacheHitRate: number; // Cache命中率
}

export interface CurrencyEvent {
  type:
    | 'currency_changed'
    | 'rate_updated'
    | 'conversion_completed'
    | 'error_occurred';
  data: {
    currency?: string;
    rate?: ExchangeRate;
    conversion?: CurrencyConversion;
    error?: string;
  };
  timestamp: Date;
}

// ServiceInterface定義
export interface CurrencyManager {
  initialize(config?: Partial<CurrencyConfig>): Promise<void>;
  getCurrentCurrency(): string;
  getAvailableCurrencies(): Record<string, CurrencyInfo>;
  changeCurrency(currency: string): Promise<CurrencyUpdateResponse>;
  convertCurrency(
    request: CurrencyConversionRequest
  ): Promise<CurrencyConversionResponse>;
  getExchangeRate(request: ExchangeRateRequest): Promise<ExchangeRateResponse>;
  updateExchangeRates(): Promise<void>;
  getStats(): CurrencyStats;
  on(
    event: CurrencyEvent['type'],
    callback: (event: CurrencyEvent) => void
  ): void;
  off(
    event: CurrencyEvent['type'],
    callback: (event: CurrencyEvent) => void
  ): void;
}

export interface CurrencyTools {
  formatCurrency(
    amount: number,
    currency?: string,
    options?: Intl.NumberFormatOptions
  ): string;
  parseCurrency(value: string, currency?: string): number;
  validateCurrencyCode(code: string): boolean;
  normalizeCurrencyCode(code: string): string;
  getCurrencySymbol(currency: string): string;
  getCurrencyName(currency: string): string;
  isCurrencySupported(currency: string): boolean;
  calculateConversionFee(amount: number, rate: number): number;
  applyMarkup(amount: number, markup: number): number;
  roundCurrency(
    amount: number,
    currency: string,
    mode?: 'round' | 'floor' | 'ceil'
  ): number;
  validateAmount(amount: number): boolean;
  sanitizeCurrencyInput(input: string): string;
  createCurrencyFormatter(
    currency: string,
    options?: Intl.NumberFormatOptions
  ): Intl.NumberFormat;
  getCurrencyLocale(currency: string): string;
  compareCurrencies(currency1: string, currency2: string): number;
  estimateConversion(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number;
}

// React Component相OffClass型
export interface CurrencyProps {
  amount: number;
  currency?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  precision?: number;
  style?: 'default' | 'compact' | 'detailed';
  onPress?: () => void;
  disabled?: boolean;
}

export interface CurrencyComponentState {
  displayAmount: string;
  isConverting: boolean;
  error: string | null;
}

export interface CurrencyAction {
  type: string;
  payload?: unknown;
}

export interface CurrencyContextValue {
  currentCurrency: string;
  availableCurrencies: Record<string, CurrencyInfo>;
  convertCurrency: (
    request: CurrencyConversionRequest
  ) => Promise<CurrencyConversionResponse>;
  formatCurrency: (amount: number, currency?: string) => string;
  changeCurrency: (currency: string) => Promise<CurrencyUpdateResponse>;
  isLoading: boolean;
  error: string | null;
  stats: CurrencyStats;
}

// DefaultConfigure
export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  defaultCurrency: 'TWD',
  supportedCurrencies: {
    TWD: {
      code: 'TWD',
      name: '新台幣',
      symbol: 'NT$',
      decimalPlaces: 0,
      position: 'before',
      isDefault: true,
      isActive: true,
      locale: 'zh-TW',
    },
    USD: {
      code: 'USD',
      name: '美元',
      symbol: '$',
      decimalPlaces: 2,
      position: 'before',
      isDefault: false,
      isActive: true,
      locale: 'en-US',
    },
    EUR: {
      code: 'EUR',
      name: '歐元',
      symbol: '€',
      decimalPlaces: 2,
      position: 'before',
      isDefault: false,
      isActive: true,
      locale: 'de-DE',
    },
    JPY: {
      code: 'JPY',
      name: '日圓',
      symbol: '¥',
      decimalPlaces: 0,
      position: 'before',
      isDefault: false,
      isActive: true,
      locale: 'ja-JP',
    },
    CNY: {
      code: 'CNY',
      name: '人民幣',
      symbol: '¥',
      decimalPlaces: 2,
      position: 'before',
      isDefault: false,
      isActive: true,
      locale: 'zh-CN',
    },
    HKD: {
      code: 'HKD',
      name: '港幣',
      symbol: 'HK$',
      decimalPlaces: 2,
      position: 'before',
      isDefault: false,
      isActive: true,
      locale: 'zh-HK',
    },
    KRW: {
      code: 'KRW',
      name: '韓元',
      symbol: '₩',
      decimalPlaces: 0,
      position: 'before',
      isDefault: false,
      isActive: true,
      locale: 'ko-KR',
    },
    SGD: {
      code: 'SGD',
      name: '新加坡元',
      symbol: 'S$',
      decimalPlaces: 2,
      position: 'before',
      isDefault: false,
      isActive: true,
      locale: 'en-SG',
    },
  },
  exchangeRateUpdateInterval: 300000, // 5Minute
  autoUpdate: true,
  fallbackRates: {
    'USD/TWD': 31.5,
    'EUR/TWD': 34.2,
    'JPY/TWD': 0.21,
    'CNY/TWD': 4.35,
    'HKD/TWD': 4.02,
    'KRW/TWD': 0.024,
    'SGD/TWD': 23.1,
  },
  apiEndpoints: {
    exchangeRate: 'https://api.exchangerate-api.com/v4/latest/',
    currencyList: 'https://api.exchangerate-api.com/v4/latest/TWD',
  },
  cacheExpiry: 300000, // 5Minute
  retryAttempts: 3,
  timeout: 10000, // 10Second
};

export const DEFAULT_CURRENCY_STATE: CurrencyState = {
  currentCurrency: 'TWD',
  availableCurrencies: DEFAULT_CURRENCY_CONFIG.supportedCurrencies,
  exchangeRates: {},
  isLoading: false,
  error: null,
  lastUpdated: null,
  isInitialized: false,
  conversionHistory: [],
  userPreferences: {
    autoConvert: true,
    showOriginalPrice: false,
    decimalPlaces: 2,
    roundingMode: 'round',
  },
};
