import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../../../core/utils/logger';
import type {
  CurrencyManager,
  CurrencyTools,
  CurrencyConfig,
  CurrencyState,
  CurrencyInfo,
  ExchangeRate,
  CurrencyConversion,
  CurrencyConversionRequest,
  CurrencyConversionResponse,
  ExchangeRateRequest,
  ExchangeRateResponse,
  CurrencyUpdateResponse,
  CurrencyStats,
  CurrencyEvent,
} from '../types/currency';
import {
  DEFAULT_CURRENCY_CONFIG,
  DEFAULT_CURRENCY_STATE,
} from '../types/currency';

class CurrencyService implements CurrencyManager, CurrencyTools {
  private static instance: CurrencyService;
  private config: CurrencyConfig;
  private state: CurrencyState;
  private readonly eventListeners: Map<
    CurrencyEvent['type'],
    Set<(event: CurrencyEvent) => void>
  >;
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly cache: Map<string, { data: unknown; timestamp: number }> =
    new Map();
  private apiCallCount = 0;
  private totalApiResponseTime = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  private constructor() {
    this.config = { ...DEFAULT_CURRENCY_CONFIG };
    this.state = { ...DEFAULT_CURRENCY_STATE };
    this.eventListeners = new Map();
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  async initialize(config?: Partial<CurrencyConfig>): Promise<void> {
    try {
      logger.info('初始化多幣種服務');

      // 合併配置
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // 從存儲中恢復狀態
      await this.loadState();

      // 初始化匯率
      await this.updateExchangeRates();

      // 設置自動更新
      if (this.config.autoUpdate) {
        this.startAutoUpdate();
      }

      this.state.isInitialized = true;
      this.emitEvent('currency_changed', {
        currency: this.state.currentCurrency,
      });

      logger.info('多幣種服務初始化完成');
    } catch (error) {
      logger.error('多幣種服務初始化失敗:', error);
      throw error;
    }
  }

  getCurrentCurrency(): string {
    return this.state.currentCurrency;
  }

  getAvailableCurrencies(): Record<string, CurrencyInfo> {
    return this.state.availableCurrencies;
  }

  async changeCurrency(currency: string): Promise<CurrencyUpdateResponse> {
    try {
      if (!this.isCurrencySupported(currency)) {
        return {
          success: false,
          error: `不支持的貨幣: ${currency}`,
          timestamp: new Date(),
        };
      }

      const _oldCurrency = this.state.currentCurrency;
      this.state.currentCurrency = currency;

      // 保存到存儲
      await this.saveState();

      // 發送事件
      this.emitEvent('currency_changed', { currency });

      logger.info(`貨幣已更改: ${oldCurrency} -> ${currency}`);

      return {
        success: true,
        currency: this.state.availableCurrencies[currency],
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('更改貨幣失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: new Date(),
      };
    }
  }

  async convertCurrency(
    request: CurrencyConversionRequest
  ): Promise<CurrencyConversionResponse> {
    try {
      const _startTime = Date.now();

      // 驗證請求
      if (!this.validateAmount(request.amount)) {
        return {
          success: false,
          error: '無效的金額',
          timestamp: new Date(),
        };
      }

      if (
        !this.isCurrencySupported(request.fromCurrency) ||
        !this.isCurrencySupported(request.toCurrency)
      ) {
        return {
          success: false,
          error: '不支持的貨幣',
          timestamp: new Date(),
        };
      }

      // 獲取匯率
      const _rateResponse = await this.getExchangeRate({
        fromCurrency: request.fromCurrency,
        toCurrency: request.toCurrency,
      });

      if (!rateResponse.success || !rateResponse.rate) {
        return {
          success: false,
          error: '無法獲取匯率',
          timestamp: new Date(),
        };
      }

      const { rate } = rateResponse.rate;
      let convertedAmount = request.amount * rate;

      // 計算手續費
      let fees = 0;
      if (request.includeFees) {
        fees = this.calculateConversionFee(request.amount, rate);
        convertedAmount += fees;
      }

      // 應用加價
      let markup = 0;
      if (request.applyMarkup) {
        markup = this.applyMarkup(convertedAmount, 0.02); // 2% 加價
        convertedAmount += markup;
      }

      // 四捨五入
      const _targetCurrency =
        this.state.availableCurrencies[request.toCurrency];
      convertedAmount = this.roundCurrency(
        convertedAmount,
        request.toCurrency,
        this.state.userPreferences.roundingMode
      );

      const conversion: CurrencyConversion = {
        fromCurrency: request.fromCurrency,
        toCurrency: request.toCurrency,
        amount: request.amount,
        convertedAmount,
        rate,
        timestamp: new Date(),
        fees,
        markup,
      };

      // 添加到歷史記錄
      this.state.conversionHistory.push(conversion);
      if (this.state.conversionHistory.length > 100) {
        this.state.conversionHistory = this.state.conversionHistory.slice(-100);
      }

      // 更新統計
      this.apiCallCount++;
      this.totalApiResponseTime += Date.now() - startTime;

      // 發送事件
      this.emitEvent('conversion_completed', { conversion });

      logger.info(
        `貨幣轉換完成: ${request.amount} ${request.fromCurrency} -> ${convertedAmount} ${request.toCurrency}`
      );

      return {
        success: true,
        conversion,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('貨幣轉換失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: new Date(),
      };
    }
  }

  async getExchangeRate(
    request: ExchangeRateRequest
  ): Promise<ExchangeRateResponse> {
    try {
      const _cacheKey = `${request.fromCurrency}_${request.toCurrency}`;

      // 檢查緩存
      const _cached = this.cache.get(cacheKey);
      if (
        cached &&
        !request.forceUpdate &&
        Date.now() - cached.timestamp < this.config.cacheExpiry
      ) {
        this.cacheHits++;
        return {
          success: true,
          rate: cached.data,
          timestamp: new Date(),
        };
      }

      this.cacheMisses++;

      // 檢查是否為相同貨幣
      if (request.fromCurrency === request.toCurrency) {
        const rate: ExchangeRate = {
          fromCurrency: request.fromCurrency,
          toCurrency: request.toCurrency,
          rate: 1,
          lastUpdated: new Date(),
          source: 'internal',
          isRealtime: true,
          confidence: 1,
        };

        this.cache.set(cacheKey, { data: rate, timestamp: Date.now() });
        return {
          success: true,
          rate,
          timestamp: new Date(),
        };
      }

      // 嘗試從 API 獲取匯率
      let rate: ExchangeRate | undefined;

      try {
        rate = await this.fetchExchangeRateFromAPI(
          request.fromCurrency,
          request.toCurrency
        );
      } catch (apiError) {
        logger.warn('API 獲取匯率失敗，使用備用匯率:', apiError);

        // 使用備用匯率
        const _fallbackKey = `${request.fromCurrency}/${request.toCurrency}`;
        const _fallbackRate = this.config.fallbackRates[fallbackKey];

        if (fallbackRate) {
          rate = {
            fromCurrency: request.fromCurrency,
            toCurrency: request.toCurrency,
            rate: fallbackRate,
            lastUpdated: new Date(),
            source: 'fallback',
            isRealtime: false,
            confidence: 0.8,
          };
        }
      }

      if (!rate) {
        return {
          success: false,
          error: '無法獲取匯率',
          timestamp: new Date(),
        };
      }

      // 緩存匯率
      this.cache.set(cacheKey, { data: rate, timestamp: Date.now() });

      // 更新狀態
      this.state.exchangeRates[cacheKey] = rate;
      this.state.lastUpdated = new Date();

      return {
        success: true,
        rate,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('獲取匯率失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: new Date(),
      };
    }
  }

  async updateExchangeRates(): Promise<void> {
    try {
      logger.info('開始更新匯率');

      const _currencies = Object.keys(this.state.availableCurrencies);
      const promises: Promise<void>[] = [];

      for (const fromCurrency of currencies) {
        for (const toCurrency of currencies) {
          if (fromCurrency !== toCurrency) {
            promises.push(
              this.getExchangeRate({
                fromCurrency,
                toCurrency,
                forceUpdate: true,
              }).then(() => {})
            );
          }
        }
      }

      await Promise.allSettled(promises);
      logger.info('匯率更新完成');

      this.emitEvent('rate_updated', {});
    } catch (error) {
      logger.error('更新匯率失敗:', error);
      this.emitEvent('error_occurred', {
        error: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  getStats(): CurrencyStats {
    const _totalConversions = this.state.conversionHistory.length;
    const _mostUsedCurrency = this.getMostUsedCurrency();
    const _averageConversionAmount = this.calculateAverageConversionAmount();
    const _lastConversionDate =
      totalConversions > 0
        ? this.state.conversionHistory[totalConversions - 1].timestamp
        : null;
    const _conversionAccuracy = this.calculateConversionAccuracy();
    const _apiResponseTime =
      this.apiCallCount > 0 ? this.totalApiResponseTime / this.apiCallCount : 0;
    const _cacheHitRate =
      this.cacheHits + this.cacheMisses > 0
        ? this.cacheHits / (this.cacheHits + this.cacheMisses)
        : 0;

    return {
      totalConversions,
      mostUsedCurrency,
      averageConversionAmount,
      lastConversionDate,
      conversionAccuracy,
      apiResponseTime,
      cacheHitRate,
    };
  }

  on(
    event: CurrencyEvent['type'],
    callback: (event: CurrencyEvent) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  off(
    event: CurrencyEvent['type'],
    callback: (event: CurrencyEvent) => void
  ): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // CurrencyTools 實現
  formatCurrency(
    amount: number,
    currency?: string,
    options?: Intl.NumberFormatOptions
  ): string {
    const _targetCurrency = currency || this.state.currentCurrency;
    const _currencyInfo = this.state.availableCurrencies[targetCurrency];

    if (!currencyInfo) {
      return `${amount}`;
    }

    const _formatter = this.createCurrencyFormatter(targetCurrency, options);
    return formatter.format(amount);
  }

  parseCurrency(value: string, currency?: string): number {
    const _targetCurrency = currency || this.state.currentCurrency;
    const _currencyInfo = this.state.availableCurrencies[targetCurrency];

    if (!currencyInfo) {
      return parseFloat(value) || 0;
    }

    // 移除貨幣符號和空格
    const _cleanedValue = this.sanitizeCurrencyInput(value);

    // 根據地區解析數字
    const _locale = this.getCurrencyLocale(targetCurrency);
    const _formatter = new Intl.NumberFormat(locale);

    // 簡單的數字解析（實際應用中可能需要更複雜的邏輯）
    return parseFloat(cleanedValue) || 0;
  }

  validateCurrencyCode(code: string): boolean {
    return /^[A-Z]{3}$/.test(code) && this.isCurrencySupported(code);
  }

  normalizeCurrencyCode(code: string): string {
    return code.toUpperCase().trim();
  }

  getCurrencySymbol(currency: string): string {
    const _currencyInfo = this.state.availableCurrencies[currency];
    return currencyInfo?.symbol || currency;
  }

  getCurrencyName(currency: string): string {
    const _currencyInfo = this.state.availableCurrencies[currency];
    return currencyInfo?.name || currency;
  }

  isCurrencySupported(currency: string): boolean {
    return currency in this.state.availableCurrencies;
  }

  calculateConversionFee(amount: number, rate: number): number {
    // 簡單的固定手續費計算
    return Math.max(amount * 0.001, 1); // 0.1% 或最低 1 單位
  }

  applyMarkup(amount: number, markup: number): number {
    return amount * markup;
  }

  roundCurrency(
    amount: number,
    currency: string,
    mode: 'round' | 'floor' | 'ceil' = 'round'
  ): number {
    const _currencyInfo = this.state.availableCurrencies[currency];
    if (!currencyInfo) return amount;

    const _factor = 10 ** currencyInfo.decimalPlaces;

    switch (mode) {
      case 'floor':
        return Math.floor(amount * factor) / factor;
      case 'ceil':
        return Math.ceil(amount * factor) / factor;
      default:
        return Math.round(amount * factor) / factor;
    }
  }

  validateAmount(amount: number): boolean {
    return !isNaN(amount) && isFinite(amount) && amount >= 0;
  }

  sanitizeCurrencyInput(input: string): string {
    return input.replace(/[^\d.,-]/g, '').trim();
  }

  createCurrencyFormatter(
    currency: string,
    options?: Intl.NumberFormatOptions
  ): Intl.NumberFormat {
    const _currencyInfo = this.state.availableCurrencies[currency];
    const _locale = this.getCurrencyLocale(currency);

    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: currencyInfo?.decimalPlaces || 2,
      maximumFractionDigits: currencyInfo?.decimalPlaces || 2,
    };

    return new Intl.NumberFormat(locale, { ...defaultOptions, ...options });
  }

  getCurrencyLocale(currency: string): string {
    const _currencyInfo = this.state.availableCurrencies[currency];
    return currencyInfo?.locale || 'en-US';
  }

  compareCurrencies(currency1: string, currency2: string): number {
    const _info1 = this.state.availableCurrencies[currency1];
    const _info2 = this.state.availableCurrencies[currency2];

    if (!info1 || !info2) return 0;

    return info1.name.localeCompare(info2.name);
  }

  estimateConversion(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number {
    const _fallbackKey = `${fromCurrency}/${toCurrency}`;
    const _fallbackRate = this.config.fallbackRates[fallbackKey];

    if (fallbackRate) {
      return this.roundCurrency(amount * fallbackRate, toCurrency);
    }

    return amount; // 如果沒有匯率，返回原金額
  }

  // 私有方法
  private async loadState(): Promise<void> {
    try {
      const _stored = await AsyncStorage.getItem('currency_state');
      if (stored) {
        const _parsed = JSON.parse(stored);
        this.state = { ...this.state, ...parsed };

        // 恢復日期對象
        if (this.state.lastUpdated) {
          this.state.lastUpdated = new Date(this.state.lastUpdated);
        }
        this.state.conversionHistory = this.state.conversionHistory.map(
          conv => ({
            ...conv,
            timestamp: new Date(conv.timestamp),
          })
        );
      }
    } catch (error) {
      logger.warn('無法載入貨幣狀態:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem('currency_state', JSON.stringify(this.state));
    } catch (error) {
      logger.error('無法保存貨幣狀態:', error);
    }
  }

  private startAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateExchangeRates();
    }, this.config.exchangeRateUpdateInterval);
  }

  private async fetchExchangeRateFromAPI(
    fromCurrency: string,
    toCurrency: string
  ): Promise<ExchangeRate> {
    const _url = `${this.config.apiEndpoints.exchangeRate}${fromCurrency}`;

    const _controller = new AbortController();
    const _timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    try {
      const _response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const _data = await response.json();

      if (!data.rates?.[toCurrency]) {
        throw new Error('無效的匯率數據');
      }

      return {
        fromCurrency,
        toCurrency,
        rate: data.rates[toCurrency],
        lastUpdated: new Date(data.time_last_update_unix * 1000),
        source: 'api',
        isRealtime: true,
        confidence: 0.95,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private emitEvent(
    type: CurrencyEvent['type'],
    data: CurrencyEvent['data']
  ): void {
    const event: CurrencyEvent = {
      type,
      data,
      timestamp: new Date(),
    };

    const _listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          logger.error('事件回調執行失敗:', error);
        }
      });
    }
  }

  private getMostUsedCurrency(): string {
    const _usage = new Map<string, number>();

    this.state.conversionHistory.forEach(conv => {
      usage.set(conv.toCurrency, (usage.get(conv.toCurrency) || 0) + 1);
    });

    let mostUsed = this.state.currentCurrency;
    let maxCount = 0;

    usage.forEach((count, currency) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = currency;
      }
    });

    return mostUsed;
  }

  private calculateAverageConversionAmount(): number {
    if (this.state.conversionHistory.length === 0) return 0;

    const _total = this.state.conversionHistory.reduce(
      (sum, conv) => sum + conv.amount,
      0
    );
    return total / this.state.conversionHistory.length;
  }

  private calculateConversionAccuracy(): number {
    // 簡單的準確率計算，基於 API 響應成功率
    const _totalRequests = this.apiCallCount;
    const _successfulRequests = this.state.conversionHistory.length;

    return totalRequests > 0 ? successfulRequests / totalRequests : 1;
  }
}

export const _currencyService = CurrencyService.getInstance();
export default currencyService;
