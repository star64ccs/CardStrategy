import { priceDataService } from '../../../services/priceDataService';
import { apiService } from '../../../services/apiService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('PriceDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHistoricalPrices', () => {
    const mockCardId = 'card-123';
    const mockPlatforms = ['EBAY', 'TCGPLAYER', 'CARDMARKET'] as const;
    const mockTimeRange = {
      start: '2024-01-01T00:00:00Z',
      end: '2024-01-31T23:59:59Z'
    };

    const mockHistoricalData = [
      {
        cardId: mockCardId,
        cardName: '火球術',
        platform: 'EBAY' as const,
        priceHistory: [
          {
            platform: 'EBAY' as const,
            price: 100,
            currency: 'USD',
            date: '2024-01-15T00:00:00Z',
            condition: 'mint',
            source: 'api' as const,
            confidence: 0.95,
            metadata: {
              listingId: 'listing-123',
              seller: 'seller1',
              location: 'US',
              shipping: 5,
              auction: false,
              buyNow: true
            }
          }
        ],
        statistics: {
          averagePrice: 100,
          medianPrice: 100,
          minPrice: 90,
          maxPrice: 110,
          priceVolatility: 0.1,
          totalListings: 10,
          lastUpdated: '2024-01-31T00:00:00Z'
        },
        trends: {
          direction: 'rising' as const,
          changePercentage: 5.5,
          changePeriod: '30d'
        }
      }
    ];

    it('應該成功獲取歷史價格數據', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockHistoricalData,
        message: '歷史價格數據獲取成功'
      });

      const result = await priceDataService.getHistoricalPrices(mockCardId, mockPlatforms, mockTimeRange);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHistoricalData);
      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        { cardId: mockCardId, platforms: mockPlatforms, timeRange: mockTimeRange }
      );
    });

    it('應該使用默認參數', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockHistoricalData,
        message: '歷史價格數據獲取成功'
      });

      await priceDataService.getHistoricalPrices(mockCardId);

      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cardId: mockCardId,
          platforms: ['EBAY', 'TCGPLAYER', 'CARDMARKET', 'PRICE_CHARTING']
        })
      );
    });

    it('應該處理空卡牌 ID', async () => {
      await expect(priceDataService.getHistoricalPrices('')).rejects.toThrow();
    });

    it('應該處理無效的平台', async () => {
      const invalidPlatforms = ['INVALID_PLATFORM'] as any;

      await expect(priceDataService.getHistoricalPrices(mockCardId, invalidPlatforms)).rejects.toThrow();
    });

    it('應該處理無效的時間範圍', async () => {
      const invalidTimeRange = {
        start: 'invalid-date',
        end: 'invalid-date'
      };

      await expect(priceDataService.getHistoricalPrices(mockCardId, mockPlatforms, invalidTimeRange)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('API 錯誤'));

      await expect(priceDataService.getHistoricalPrices(mockCardId, mockPlatforms, mockTimeRange)).rejects.toThrow('API 錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getGradingAgencyData', () => {
    const mockCardId = 'card-123';
    const mockAgencies = ['PSA', 'BGS', 'CGC'] as const;

    const mockGradingData = [
      {
        agency: 'PSA' as const,
        cardId: mockCardId,
        cardName: '火球術',
        distribution: {
          totalGraded: 1000,
          gradeDistribution: {
            '10': 150,
            '9': 300,
            '8': 400,
            '7': 150
          },
          populationReport: {
            '10': {
              count: 150,
              percentage: 15,
              lastUpdated: '2024-01-31T00:00:00Z'
            }
          },
          recentGrades: [
            {
              date: '2024-01-30T00:00:00Z',
              grade: '10',
              count: 5
            }
          ]
        },
        marketImpact: {
          averagePriceByGrade: {
            '10': 500,
            '9': 300,
            '8': 200,
            '7': 100
          },
          premiumByGrade: {
            '10': 400,
            '9': 200,
            '8': 100,
            '7': 0
          }
        },
        lastUpdated: '2024-01-31T00:00:00Z'
      }
    ];

    it('應該成功獲取鑑定機構數據', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockGradingData,
        message: '鑑定機構數據獲取成功'
      });

      const result = await priceDataService.getGradingAgencyData(mockCardId, mockAgencies);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGradingData);
      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        { cardId: mockCardId, agencies: mockAgencies }
      );
    });

    it('應該使用默認鑑定機構', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockGradingData,
        message: '鑑定機構數據獲取成功'
      });

      await priceDataService.getGradingAgencyData(mockCardId);

      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        { cardId: mockCardId, agencies: ['PSA', 'BGS', 'CGC'] }
      );
    });

    it('應該處理空卡牌 ID', async () => {
      await expect(priceDataService.getGradingAgencyData('')).rejects.toThrow();
    });

    it('應該處理無效的鑑定機構', async () => {
      const invalidAgencies = ['INVALID_AGENCY'] as any;

      await expect(priceDataService.getGradingAgencyData(mockCardId, invalidAgencies)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('API 錯誤'));

      await expect(priceDataService.getGradingAgencyData(mockCardId, mockAgencies)).rejects.toThrow('API 錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getRecommendedPlatforms', () => {
    const mockRecommendedPlatforms = {
      pricePlatforms: [
        {
          platform: 'EBAY' as const,
          reliability: 0.95,
          dataQuality: 0.9,
          updateFrequency: 'real-time',
          coverage: 'global',
          description: '全球最大的拍賣平台'
        },
        {
          platform: 'TCGPLAYER' as const,
          reliability: 0.9,
          dataQuality: 0.95,
          updateFrequency: 'daily',
          coverage: 'US-focused',
          description: '專業的集換式卡牌平台'
        }
      ],
      gradingAgencies: [
        {
          agency: 'PSA' as const,
          reliability: 0.98,
          dataQuality: 0.95,
          updateFrequency: 'weekly',
          coverage: 'global',
          description: '最權威的鑑定機構'
        }
      ]
    };

    it('應該成功獲取平台推薦', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockRecommendedPlatforms,
        message: '平台推薦獲取成功'
      });

      const result = await priceDataService.getRecommendedPlatforms();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRecommendedPlatforms);
      expect(mockApiService.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('API 錯誤'));

      await expect(priceDataService.getRecommendedPlatforms()).rejects.toThrow('API 錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('checkPlatformStatus', () => {
    const mockPlatforms = ['EBAY', 'TCGPLAYER', 'CARDMARKET'] as const;

    const mockPlatformStatus = {
      'EBAY': {
        status: 'online' as const,
        lastCheck: '2024-01-31T00:00:00Z',
        responseTime: 150,
        error: undefined
      },
      'TCGPLAYER': {
        status: 'limited' as const,
        lastCheck: '2024-01-31T00:00:00Z',
        responseTime: 500,
        error: 'Rate limit exceeded'
      },
      'CARDMARKET': {
        status: 'offline' as const,
        lastCheck: '2024-01-31T00:00:00Z',
        responseTime: 0,
        error: 'Service unavailable'
      }
    };

    it('應該成功檢查平台狀態', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockPlatformStatus,
        message: '平台狀態檢查成功'
      });

      const result = await priceDataService.checkPlatformStatus(mockPlatforms);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlatformStatus);
      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        { platforms: mockPlatforms }
      );
    });

    it('應該處理空平台列表', async () => {
      await expect(priceDataService.checkPlatformStatus([])).rejects.toThrow();
    });

    it('應該處理無效的平台', async () => {
      const invalidPlatforms = ['INVALID_PLATFORM'] as any;

      await expect(priceDataService.checkPlatformStatus(invalidPlatforms)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('API 錯誤'));

      await expect(priceDataService.checkPlatformStatus(mockPlatforms)).rejects.toThrow('API 錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getPlatformConfig', () => {
    it('應該成功獲取平台配置', () => {
      const config = priceDataService.getPlatformConfig('EBAY');

      expect(config).toBeDefined();
      expect(config?.name).toBe('EBAY');
      expect(config?.baseUrl).toBe('https://www.ebay.com');
      expect(config?.hasApi).toBe(true);
      expect(config?.rateLimit).toBeDefined();
      expect(config?.scrapingRules).toBeDefined();
    });

    it('應該處理不存在的平台', () => {
      const config = priceDataService.getPlatformConfig('INVALID_PLATFORM' as any);

      expect(config).toBeUndefined();
    });

    it('應該返回所有支持的平台配置', () => {
      const configs = priceDataService.getAllPlatformConfigs();

      expect(configs).toHaveLength(9); // 總共9個平台
      expect(configs.map(c => c.name)).toContain('EBAY');
      expect(configs.map(c => c.name)).toContain('TCGPLAYER');
      expect(configs.map(c => c.name)).toContain('CARDMARKET');
      expect(configs.map(c => c.name)).toContain('PSA');
      expect(configs.map(c => c.name)).toContain('BGS');
      expect(configs.map(c => c.name)).toContain('CGC');
    });

    it('應該包含正確的配置結構', () => {
      const ebayConfig = priceDataService.getPlatformConfig('EBAY');

      expect(ebayConfig).toMatchObject({
        name: 'EBAY',
        baseUrl: 'https://www.ebay.com',
        hasApi: true,
        rateLimit: {
          requestsPerMinute: 20,
          requestsPerHour: 200
        },
        scrapingRules: {
          allowedPaths: ['/itm/*', '/sch/*'],
          disallowedPaths: ['/usr/*', '/cart/*', '/checkout/*'],
          delayBetweenRequests: 1500,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)'
        }
      });
    });

    it('應該包含正確的鑑定機構配置', () => {
      const psaConfig = priceDataService.getPlatformConfig('PSA');

      expect(psaConfig).toMatchObject({
        name: 'PSA',
        baseUrl: 'https://www.psacard.com',
        hasApi: false,
        rateLimit: {
          requestsPerMinute: 5,
          requestsPerHour: 50
        },
        scrapingRules: {
          allowedPaths: ['/pop/*', '/cert/*'],
          disallowedPaths: ['/account/*', '/cart/*', '/checkout/*'],
          delayBetweenRequests: 4000,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)'
        }
      });
    });
  });

  describe('平台配置驗證', () => {
    it('應該包含所有必要的平台', () => {
      const configs = priceDataService.getAllPlatformConfigs();
      const platformNames = configs.map(c => c.name);

      expect(platformNames).toContain('SNKR');
      expect(platformNames).toContain('MERCARI');
      expect(platformNames).toContain('EBAY');
      expect(platformNames).toContain('TCGPLAYER');
      expect(platformNames).toContain('CARDMARKET');
      expect(platformNames).toContain('PRICE_CHARTING');
      expect(platformNames).toContain('PSA');
      expect(platformNames).toContain('BGS');
      expect(platformNames).toContain('CGC');
    });

    it('應該包含正確的 API 配置', () => {
      const apiPlatforms = ['EBAY', 'TCGPLAYER', 'CARDMARKET'];

      apiPlatforms.forEach(platform => {
        const config = priceDataService.getPlatformConfig(platform as any);
        expect(config?.hasApi).toBe(true);
      });
    });

    it('應該包含正確的非 API 平台配置', () => {
      const nonApiPlatforms = ['SNKR', 'MERCARI', 'PRICE_CHARTING', 'PSA', 'BGS', 'CGC'];

      nonApiPlatforms.forEach(platform => {
        const config = priceDataService.getPlatformConfig(platform as any);
        expect(config?.hasApi).toBe(false);
      });
    });

    it('應該包含合理的速率限制配置', () => {
      const configs = priceDataService.getAllPlatformConfigs();

      configs.forEach(config => {
        expect(config.rateLimit.requestsPerMinute).toBeGreaterThan(0);
        expect(config.rateLimit.requestsPerHour).toBeGreaterThan(0);
        expect(config.rateLimit.requestsPerHour).toBeGreaterThanOrEqual(config.rateLimit.requestsPerMinute);
      });
    });

    it('應該包含合理的延遲配置', () => {
      const configs = priceDataService.getAllPlatformConfigs();

      configs.forEach(config => {
        expect(config.scrapingRules.delayBetweenRequests).toBeGreaterThan(0);
        expect(config.scrapingRules.userAgent).toContain('CardStrategy-Bot');
      });
    });
  });
});
