import { MarketService } from '@/services/marketService';
import { mockApiResponse, mockApiError } from '@/__tests__/setup/test-utils';

// Mock API service
jest.mock('@/services/apiService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock validation service
jest.mock('@/utils/validationService', () => ({
  validateApiResponse: jest.fn(() => ({ isValid: true, errors: [] })),
  validateInput: jest.fn(() => ({ isValid: true, errors: [] }))
}));

describe('MarketService', () => {
  let marketService: MarketService;
  let mockApiService: any;
  let mockLogger: any;
  let mockValidationService: any;

  beforeEach(() => {
    marketService = new MarketService();
    mockApiService = require('@/services/apiService').apiService;
    mockLogger = require('@/utils/logger').logger;
    mockValidationService = require('@/utils/validationService');

    jest.clearAllMocks();
  });

  describe('getMarketData', () => {
    it('應該成功獲取市場數據', async () => {
      const mockMarketData = {
        totalCards: 1000,
        totalValue: 50000,
        averagePrice: 50,
        trendingCards: [
          { id: '1', name: '熱門卡片1', priceChange: 15.5 },
          { id: '2', name: '熱門卡片2', priceChange: -8.2 }
        ],
        marketTrend: {
          daily: [{ date: '2024-01-01', value: 50000 }],
          weekly: [{ week: '2024-W01', value: 350000 }],
          monthly: [{ month: '2024-01', value: 1500000 }]
        }
      };
      const mockResponse = mockApiResponse(mockMarketData);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await marketService.getMarketData();

      expect(result.success).toBe(true);
      expect(result.data.totalCards).toBe(1000);
      expect(result.data.trendingCards).toHaveLength(2);
      expect(mockApiService.get).toHaveBeenCalledWith('/market/data');
    });

    it('應該處理獲取市場數據錯誤', async () => {
      const mockError = mockApiError('獲取市場數據失敗');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(marketService.getMarketData()).rejects.toThrow('獲取市場數據失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getCardPriceHistory', () => {
    it('應該成功獲取卡片價格歷史', async () => {
      const cardId = '1';
      const mockPriceHistory = {
        cardId: '1',
        cardName: '測試卡片',
        prices: [
          { date: '2024-01-01', price: 100, platform: 'ebay' },
          { date: '2024-01-02', price: 105, platform: 'ebay' },
          { date: '2024-01-03', price: 98, platform: 'ebay' }
        ],
        averagePrice: 101,
        priceChange: 5.0,
        volatility: 3.2
      };
      const mockResponse = mockApiResponse(mockPriceHistory);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await marketService.getCardPriceHistory(cardId);

      expect(result.success).toBe(true);
      expect(result.data.cardId).toBe('1');
      expect(result.data.prices).toHaveLength(3);
      expect(mockApiService.get).toHaveBeenCalledWith(`/market/cards/${cardId}/price-history`);
    });

    it('應該處理獲取價格歷史錯誤', async () => {
      const cardId = '999';
      const mockError = mockApiError('卡片不存在');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(marketService.getCardPriceHistory(cardId)).rejects.toThrow('卡片不存在');
    });
  });

  describe('getMarketTrends', () => {
    it('應該成功獲取市場趨勢', async () => {
      const mockTrends = {
        topGainers: [
          { id: '1', name: '上漲卡片1', priceChange: 25.5 },
          { id: '2', name: '上漲卡片2', priceChange: 18.2 }
        ],
        topLosers: [
          { id: '3', name: '下跌卡片1', priceChange: -12.5 },
          { id: '4', name: '下跌卡片2', priceChange: -8.7 }
        ],
        mostTraded: [
          { id: '5', name: '交易量最高1', volume: 150 },
          { id: '6', name: '交易量最高2', volume: 120 }
        ]
      };
      const mockResponse = mockApiResponse(mockTrends);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await marketService.getMarketTrends();

      expect(result.success).toBe(true);
      expect(result.data.topGainers).toHaveLength(2);
      expect(result.data.topLosers).toHaveLength(2);
      expect(result.data.mostTraded).toHaveLength(2);
      expect(mockApiService.get).toHaveBeenCalledWith('/market/trends');
    });

    it('應該處理獲取市場趨勢錯誤', async () => {
      const mockError = mockApiError('獲取市場趨勢失敗');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(marketService.getMarketTrends()).rejects.toThrow('獲取市場趨勢失敗');
    });
  });

  describe('getPriceAlerts', () => {
    it('應該成功獲取價格警報', async () => {
      const mockAlerts = [
        {
          id: '1',
          cardId: '1',
          cardName: '測試卡片',
          targetPrice: 100,
          currentPrice: 95,
          condition: 'below',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          cardId: '2',
          cardName: '測試卡片2',
          targetPrice: 200,
          currentPrice: 210,
          condition: 'above',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      const mockResponse = mockApiResponse(mockAlerts);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await marketService.getPriceAlerts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockApiService.get).toHaveBeenCalledWith('/market/price-alerts');
    });

    it('應該處理獲取價格警報錯誤', async () => {
      const mockError = mockApiError('獲取價格警報失敗');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(marketService.getPriceAlerts()).rejects.toThrow('獲取價格警報失敗');
    });
  });

  describe('createPriceAlert', () => {
    it('應該成功創建價格警報', async () => {
      const alertData = {
        cardId: '1',
        targetPrice: 100,
        condition: 'below' as const
      };
      const mockResponse = mockApiResponse({
        id: '1',
        ...alertData,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await marketService.createPriceAlert(alertData);

      expect(result.success).toBe(true);
      expect(result.data.cardId).toBe('1');
      expect(result.data.targetPrice).toBe(100);
      expect(mockApiService.post).toHaveBeenCalledWith('/market/price-alerts', alertData);
    });

    it('應該處理創建價格警報錯誤', async () => {
      const alertData = {
        cardId: '1',
        targetPrice: -10,
        condition: 'below' as const
      };
      const mockError = mockApiError('目標價格必須大於0');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(marketService.createPriceAlert(alertData)).rejects.toThrow('目標價格必須大於0');
    });
  });

  describe('getMarketAnalysis', () => {
    it('應該成功獲取市場分析', async () => {
      const mockAnalysis = {
        marketCap: 5000000,
        totalVolume: 250000,
        averagePrice: 50,
        priceDistribution: {
          '0-10': 200,
          '10-50': 500,
          '50-100': 200,
          '100+': 100
        },
        topCategories: [
          { name: '遊戲王', volume: 100000 },
          { name: '寶可夢', volume: 80000 },
          { name: '魔法風雲會', volume: 70000 }
        ],
        marketSentiment: {
          bullish: 60,
          bearish: 25,
          neutral: 15
        }
      };
      const mockResponse = mockApiResponse(mockAnalysis);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await marketService.getMarketAnalysis();

      expect(result.success).toBe(true);
      expect(result.data.marketCap).toBe(5000000);
      expect(result.data.topCategories).toHaveLength(3);
      expect(mockApiService.get).toHaveBeenCalledWith('/market/analysis');
    });

    it('應該處理獲取市場分析錯誤', async () => {
      const mockError = mockApiError('獲取市場分析失敗');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(marketService.getMarketAnalysis()).rejects.toThrow('獲取市場分析失敗');
    });
  });

  describe('getPlatformPrices', () => {
    it('應該成功獲取平台價格', async () => {
      const cardId = '1';
      const mockPlatformPrices = {
        cardId: '1',
        cardName: '測試卡片',
        platforms: [
          {
            name: 'ebay',
            price: 100,
            shipping: 5,
            totalPrice: 105,
            condition: 'NM',
            lastUpdated: new Date().toISOString()
          },
          {
            name: 'tcgplayer',
            price: 95,
            shipping: 3,
            totalPrice: 98,
            condition: 'NM',
            lastUpdated: new Date().toISOString()
          }
        ],
        bestPrice: {
          platform: 'tcgplayer',
          price: 98,
          condition: 'NM'
        }
      };
      const mockResponse = mockApiResponse(mockPlatformPrices);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await marketService.getPlatformPrices(cardId);

      expect(result.success).toBe(true);
      expect(result.data.platforms).toHaveLength(2);
      expect(result.data.bestPrice.platform).toBe('tcgplayer');
      expect(mockApiService.get).toHaveBeenCalledWith(`/market/cards/${cardId}/platform-prices`);
    });

    it('應該處理獲取平台價格錯誤', async () => {
      const cardId = '999';
      const mockError = mockApiError('卡片不存在');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(marketService.getPlatformPrices(cardId)).rejects.toThrow('卡片不存在');
    });
  });

  describe('getMarketNews', () => {
    it('應該成功獲取市場新聞', async () => {
      const mockNews = [
        {
          id: '1',
          title: '市場新聞標題1',
          content: '市場新聞內容1',
          source: 'TCG新聞',
          publishedAt: new Date().toISOString(),
          impact: 'positive' as const
        },
        {
          id: '2',
          title: '市場新聞標題2',
          content: '市場新聞內容2',
          source: '遊戲新聞',
          publishedAt: new Date().toISOString(),
          impact: 'neutral' as const
        }
      ];
      const mockResponse = mockApiResponse(mockNews);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await marketService.getMarketNews();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockApiService.get).toHaveBeenCalledWith('/market/news');
    });

    it('應該處理獲取市場新聞錯誤', async () => {
      const mockError = mockApiError('獲取市場新聞失敗');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(marketService.getMarketNews()).rejects.toThrow('獲取市場新聞失敗');
    });
  });

  describe('getMarketPredictions', () => {
    it('應該成功獲取市場預測', async () => {
      const mockPredictions = {
        shortTerm: [
          {
            cardId: '1',
            cardName: '預測卡片1',
            currentPrice: 100,
            predictedPrice: 110,
            confidence: 0.85,
            timeframe: '7d'
          }
        ],
        longTerm: [
          {
            cardId: '2',
            cardName: '預測卡片2',
            currentPrice: 200,
            predictedPrice: 250,
            confidence: 0.75,
            timeframe: '30d'
          }
        ],
        factors: {
          marketTrend: 'bullish',
          seasonality: 'high',
          events: ['新系列發布', '比賽活動']
        }
      };
      const mockResponse = mockApiResponse(mockPredictions);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await marketService.getMarketPredictions();

      expect(result.success).toBe(true);
      expect(result.data.shortTerm).toHaveLength(1);
      expect(result.data.longTerm).toHaveLength(1);
      expect(result.data.factors.marketTrend).toBe('bullish');
      expect(mockApiService.get).toHaveBeenCalledWith('/market/predictions');
    });

    it('應該處理獲取市場預測錯誤', async () => {
      const mockError = mockApiError('獲取市場預測失敗');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(marketService.getMarketPredictions()).rejects.toThrow('獲取市場預測失敗');
    });
  });
});
