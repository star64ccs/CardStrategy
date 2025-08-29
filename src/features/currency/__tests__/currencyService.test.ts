// 多幣種服務測試
import { currencyService } from '../services/currencyService';
import type {
  CurrencyConversionRequest,
  ExchangeRateRequest,
} from '../types/currency';
import {
  CurrencyInfo,
  ExchangeRate,
  CurrencyConversion,
  DEFAULT_CURRENCY_CONFIG,
} from '../types/currency';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('CurrencyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 重置 singleton 實例
    (currencyService as any).instance = null;
  });

  describe('Singleton Pattern', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = currencyService;
      const _instance2 = currencyService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該成功初始化服務', async () => {
      const _mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rates: { USD: 0.0317, EUR: 0.0292 },
          time_last_update_unix: Math.floor(Date.now() / 1000),
        }),
      } as Response);

      await expect(currencyService.initialize()).resolves.not.toThrow();
      expect(currencyService.getCurrentCurrency()).toBe('TWD');
    });

    it('應該使用自定義配置初始化', async () => {
      const _customConfig = {
        defaultCurrency: 'USD',
        supportedCurrencies: {
          USD: {
            code: 'USD',
            name: '美元',
            symbol: '$',
            decimalPlaces: 2,
            position: 'before' as const,
            isDefault: true,
            isActive: true,
          },
        },
      };

      // 重置實例以測試自定義配置
      (currencyService as any).instance = null;
      await currencyService.initialize(customConfig);
      // 由於 singleton 模式，我們需要檢查配置是否正確應用
      expect(currencyService.getAvailableCurrencies()).toHaveProperty('USD');
    });
  });

  describe('貨幣管理', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該獲取當前貨幣', () => {
      expect(currencyService.getCurrentCurrency()).toBe('TWD');
    });

    it('應該獲取可用貨幣', () => {
      const _currencies = currencyService.getAvailableCurrencies();
      expect(currencies).toHaveProperty('TWD');
      expect(currencies).toHaveProperty('USD');
      expect(currencies).toHaveProperty('EUR');
    });

    it('應該成功更改貨幣', async () => {
      const _result = await currencyService.changeCurrency('USD');
      expect(result.success).toBe(true);
      expect(result.currency?.code).toBe('USD');
      expect(currencyService.getCurrentCurrency()).toBe('USD');
    });

    it('應該拒絕不支持的貨幣', async () => {
      const _result = await currencyService.changeCurrency('INVALID');
      expect(result.success).toBe(false);
      expect(result.error).toContain('不支持的貨幣');
    });
  });

  describe('貨幣轉換', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該成功轉換相同貨幣', async () => {
      const request: CurrencyConversionRequest = {
        fromCurrency: 'TWD',
        toCurrency: 'TWD',
        amount: 100,
      };

      const _result = await currencyService.convertCurrency(request);
      expect(result.success).toBe(true);
      expect(result.conversion?.convertedAmount).toBe(100);
      expect(result.conversion?.rate).toBe(1);
    });

    it('應該拒絕無效金額', async () => {
      const request: CurrencyConversionRequest = {
        fromCurrency: 'TWD',
        toCurrency: 'USD',
        amount: -100,
      };

      const _result = await currencyService.convertCurrency(request);
      expect(result.success).toBe(false);
      expect(result.error).toContain('無效的金額');
    });

    it('應該拒絕不支持的貨幣', async () => {
      const request: CurrencyConversionRequest = {
        fromCurrency: 'INVALID',
        toCurrency: 'USD',
        amount: 100,
      };

      const _result = await currencyService.convertCurrency(request);
      expect(result.success).toBe(false);
      expect(result.error).toContain('不支持的貨幣');
    });
  });

  describe('匯率管理', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該獲取相同貨幣的匯率', async () => {
      const request: ExchangeRateRequest = {
        fromCurrency: 'TWD',
        toCurrency: 'TWD',
      };

      const _result = await currencyService.getExchangeRate(request);
      expect(result.success).toBe(true);
      expect(result.rate?.rate).toBe(1);
    });

    it('應該使用備用匯率當 API 失敗', async () => {
      const _mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const request: ExchangeRateRequest = {
        fromCurrency: 'USD',
        toCurrency: 'TWD',
      };

      const _result = await currencyService.getExchangeRate(request);
      expect(result.success).toBe(true);
      expect(result.rate?.source).toBe('fallback');
    });
  });

  describe('格式化功能', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該正確格式化貨幣', () => {
      const _formatted = currencyService.formatCurrency(1234.56, 'TWD');
      // 檢查格式化結果是字符串且包含數字
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/\d/);
    });

    it('應該解析貨幣字符串', () => {
      const _parsed = currencyService.parseCurrency('1234.56', 'TWD');
      expect(parsed).toBe(1234.56);
    });

    it('應該獲取貨幣符號', () => {
      const _symbol = currencyService.getCurrencySymbol('TWD');
      expect(symbol).toBe('NT$');
    });

    it('應該獲取貨幣名稱', () => {
      const _name = currencyService.getCurrencyName('TWD');
      expect(name).toBe('新台幣');
    });
  });

  describe('驗證功能', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該驗證有效的貨幣代碼', () => {
      expect(currencyService.validateCurrencyCode('TWD')).toBe(true);
      expect(currencyService.validateCurrencyCode('USD')).toBe(true);
    });

    it('應該拒絕無效的貨幣代碼', () => {
      expect(currencyService.validateCurrencyCode('INVALID')).toBe(false);
      expect(currencyService.validateCurrencyCode('')).toBe(false);
    });

    it('應該檢查貨幣是否支持', () => {
      expect(currencyService.isCurrencySupported('TWD')).toBe(true);
      expect(currencyService.isCurrencySupported('INVALID')).toBe(false);
    });

    it('應該驗證金額', () => {
      expect(currencyService.validateAmount(100)).toBe(true);
      expect(currencyService.validateAmount(0)).toBe(true);
      expect(currencyService.validateAmount(-100)).toBe(false);
      expect(currencyService.validateAmount(NaN)).toBe(false);
    });
  });

  describe('工具功能', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該計算轉換手續費', () => {
      const _fee = currencyService.calculateConversionFee(1000, 1.5);
      expect(fee).toBeGreaterThan(0);
    });

    it('應該應用加價', () => {
      const _result = currencyService.applyMarkup(100, 0.1);
      expect(result).toBe(10);
    });

    it('應該四捨五入貨幣', () => {
      const _rounded = currencyService.roundCurrency(123.456, 'TWD', 'round');
      expect(rounded).toBe(123);
    });

    it('應該清理貨幣輸入', () => {
      const _cleaned = currencyService.sanitizeCurrencyInput('NT$1,234.56');
      expect(cleaned).toBe('1,234.56');
    });

    it('應該比較貨幣', () => {
      const _result = currencyService.compareCurrencies('TWD', 'USD');
      expect(typeof result).toBe('number');
    });

    it('應該估算轉換', () => {
      const _estimated = currencyService.estimateConversion(100, 'USD', 'TWD');
      expect(estimated).toBeGreaterThan(0);
    });
  });

  describe('統計功能', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該獲取統計信息', () => {
      const _stats = currencyService.getStats();
      expect(stats).toHaveProperty('totalConversions');
      expect(stats).toHaveProperty('mostUsedCurrency');
      expect(stats).toHaveProperty('averageConversionAmount');
      expect(stats).toHaveProperty('conversionAccuracy');
      expect(stats).toHaveProperty('apiResponseTime');
      expect(stats).toHaveProperty('cacheHitRate');
    });
  });

  describe('事件系統', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該註冊和觸發事件', async () => {
      const _mockCallback = jest.fn();

      currencyService.on('currency_changed', mockCallback);
      await currencyService.changeCurrency('USD');

      expect(mockCallback).toHaveBeenCalled();
    });

    it('應該移除事件監聽器', () => {
      const _mockCallback = jest.fn();

      currencyService.on('currency_changed', mockCallback);
      currencyService.off('currency_changed', mockCallback);
      currencyService.changeCurrency('USD');

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('錯誤處理', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該處理 API 錯誤', async () => {
      const _mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      const request: ExchangeRateRequest = {
        fromCurrency: 'USD',
        toCurrency: 'TWD',
      };

      const _result = await currencyService.getExchangeRate(request);
      expect(result.success).toBe(true); // 應該使用備用匯率
    });

    it('應該處理無效的 API 響應', async () => {
      const _mockFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      } as Response);

      const request: ExchangeRateRequest = {
        fromCurrency: 'USD',
        toCurrency: 'TWD',
      };

      const _result = await currencyService.getExchangeRate(request);
      expect(result.success).toBe(true); // 應該使用備用匯率
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該快速格式化貨幣', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        currencyService.formatCurrency(Math.random() * 10000, 'TWD');
      }

      const _endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // 應該在 100ms 內完成
    });

    it('應該快速驗證貨幣代碼', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        currencyService.validateCurrencyCode('TWD');
      }

      const _endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(50); // 應該在 50ms 內完成
    });
  });

  describe('邊界條件', () => {
    beforeEach(async () => {
      await currencyService.initialize();
    });

    it('應該處理極大金額', () => {
      const _largeAmount = Number.MAX_SAFE_INTEGER;
      const _formatted = currencyService.formatCurrency(largeAmount, 'TWD');
      expect(formatted).toBeDefined();
    });

    it('應該處理極小金額', () => {
      const _smallAmount = Number.MIN_VALUE;
      const _formatted = currencyService.formatCurrency(smallAmount, 'TWD');
      expect(formatted).toBeDefined();
    });

    it('應該處理零金額', () => {
      const _formatted = currencyService.formatCurrency(0, 'TWD');
      expect(formatted).toBeDefined();
    });

    it('應該處理空字符串輸入', () => {
      const _cleaned = currencyService.sanitizeCurrencyInput('');
      expect(cleaned).toBe('');
    });

    it('應該處理特殊字符輸入', () => {
      const _cleaned = currencyService.sanitizeCurrencyInput('!@#$%^&*()');
      expect(cleaned).toBe('');
    });
  });
});
