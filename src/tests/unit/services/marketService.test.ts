import { marketService } from '../../../services/marketService';
import { apiService } from '../../../services/apiService';
import { logger } from '../../../utils/logger';
import {
  validateInput,
  validateApiResponse,
} from '../../../utils/validationService';
import {
  MarketDataEntitySchema,
  MarketTrendSchema,
} from '../../../utils/validationSchemas';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');
jest.mock('../../../utils/validationService');
jest.mock('../../../utils/validationSchemas');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockValidateInput = validateInput as jest.MockedFunction<
  typeof validateInput
>;
const mockValidateApiResponse = validateApiResponse as jest.MockedFunction<
  typeof validateApiResponse
>;

describe('MarketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMarketData', () => {
    it('應該成功獲取市場數據', async () => {
      const mockMarketData = {
        totalVolume: 1000000,
        totalTransactions: 5000,
        averagePrice: 150,
        priceChange24h: 5.2,
        priceChange7d: -2.1,
        priceChange30d: 12.5,
        topGainers: [
          {
            id: 'card-1',
            name: '卡片1',
            price: 200,
            priceChange: 15,
            volume: 1000,
            marketCap: 200000,
          },
        ],
        topLosers: [
          {
            id: 'card-2',
            name: '卡片2',
            price: 80,
            priceChange: -8,
            volume: 500,
            marketCap: 80000,
          },
        ],
        trendingCards: [
          {
            id: 'card-3',
            name: '卡片3',
            price: 120,
            priceChange: 3,
            volume: 800,
            marketCap: 120000,
          },
        ],
      };

      const mockApiResponse = {
        success: true,
        data: mockMarketData,
        message: '獲取成功',
      };

      mockApiService.get.mockResolvedValue(mockApiResponse);
      mockValidateApiResponse.mockReturnValue({
        isValid: true,
        data: mockMarketData,
      });

      const result = await marketService.getMarketData();

      expect(result).toEqual(mockApiResponse);
      expect(mockApiService.get).toHaveBeenCalledWith('/market/data');
      expect(mockValidateApiResponse).toHaveBeenCalledWith(
        MarketDataEntitySchema,
        mockMarketData
      );
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('應該處理數據驗證失敗', async () => {
      const mockApiResponse = {
        success: true,
        data: { invalid: 'data' },
        message: '獲取成功',
      };

      mockApiService.get.mockResolvedValue(mockApiResponse);
      mockValidateApiResponse.mockReturnValue({
        isValid: false,
        errorMessage: '市場數據格式錯誤',
      });

      await expect(marketService.getMarketData()).rejects.toThrow(
        '市場數據格式錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Get market data error:',
        expect.any(Object)
      );
    });

    it('應該處理 API 錯誤', async () => {
      const error = new Error('API 錯誤');
      mockApiService.get.mockRejectedValue(error);

      await expect(marketService.getMarketData()).rejects.toThrow('API 錯誤');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Get market data error:',
        { error: 'API 錯誤' }
      );
    });
  });

  describe('getMarketTrends', () => {
    it('應該成功獲取市場趨勢', async () => {
      const mockTrends = [
        {
          period: '7d' as const,
          data: [
            { timestamp: '2024-01-01T00:00:00Z', price: 100, volume: 1000 },
            { timestamp: '2024-01-02T00:00:00Z', price: 105, volume: 1200 },
          ],
        },
      ];

      const mockApiResponse = {
        success: true,
        data: mockTrends,
        message: '獲取成功',
      };

      mockValidateInput.mockReturnValue({
        isValid: true,
        data: { period: '7d' },
      });
      mockApiService.get.mockResolvedValue(mockApiResponse);
      mockValidateApiResponse.mockReturnValue({
        isValid: true,
        data: mockTrends,
      });

      const result = await marketService.getMarketTrends('7d');

      expect(result).toEqual(mockApiResponse);
      expect(mockValidateInput).toHaveBeenCalledWith(expect.any(Object), {
        period: '7d',
      });
      expect(mockApiService.get).toHaveBeenCalledWith('/market/trends', {
        period: '7d',
      });
      expect(mockValidateApiResponse).toHaveBeenCalledWith(
        expect.any(Object),
        mockTrends
      );
    });

    it('應該處理輸入驗證失敗', async () => {
      mockValidateInput.mockReturnValue({
        isValid: false,
        errorMessage: '無效的時間週期',
      });

      await expect(
        marketService.getMarketTrends('invalid' as any)
      ).rejects.toThrow('無效的時間週期');
      expect(mockApiService.get).not.toHaveBeenCalled();
    });

    it('應該處理響應驗證失敗', async () => {
      const mockApiResponse = {
        success: true,
        data: [{ invalid: 'trend' }],
        message: '獲取成功',
      };

      mockValidateInput.mockReturnValue({
        isValid: true,
        data: { period: '7d' },
      });
      mockApiService.get.mockResolvedValue(mockApiResponse);
      mockValidateApiResponse.mockReturnValue({
        isValid: false,
        errorMessage: '趨勢數據格式錯誤',
      });

      await expect(marketService.getMarketTrends('7d')).rejects.toThrow(
        '趨勢數據格式錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Get market trends error:',
        expect.any(Object)
      );
    });

    it('應該處理 API 錯誤', async () => {
      const error = new Error('API 錯誤');
      mockValidateInput.mockReturnValue({
        isValid: true,
        data: { period: '7d' },
      });
      mockApiService.get.mockRejectedValue(error);

      await expect(marketService.getMarketTrends('7d')).rejects.toThrow(
        'API 錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Get market trends error:',
        { error: 'API 錯誤' }
      );
    });

    it('應該使用默認時間週期', async () => {
      const mockTrends = [
        {
          period: '7d' as const,
          data: [
            { timestamp: '2024-01-01T00:00:00Z', price: 100, volume: 1000 },
          ],
        },
      ];

      const mockApiResponse = {
        success: true,
        data: mockTrends,
        message: '獲取成功',
      };

      mockValidateInput.mockReturnValue({
        isValid: true,
        data: { period: '7d' },
      });
      mockApiService.get.mockResolvedValue(mockApiResponse);
      mockValidateApiResponse.mockReturnValue({
        isValid: true,
        data: mockTrends,
      });

      await marketService.getMarketTrends();

      expect(mockApiService.get).toHaveBeenCalledWith('/market/trends', {
        period: '7d',
      });
    });
  });

  describe('getMarketAnalysis', () => {
    it('應該成功獲取市場分析', async () => {
      const mockAnalysis = {
        sentiment: 'bullish' as const,
        confidence: 0.75,
        factors: {
          technical: 0.8,
          fundamental: 0.7,
          social: 0.6,
        },
        recommendations: ['建議買入', '關注市場動態'],
        riskLevel: 'medium' as const,
      };

      const mockApiResponse = {
        success: true,
        data: mockAnalysis,
        message: '獲取成功',
      };

      mockApiService.get.mockResolvedValue(mockApiResponse);
      mockValidateApiResponse.mockReturnValue({
        isValid: true,
        data: mockAnalysis,
      });

      const result = await marketService.getMarketAnalysis();

      expect(result).toEqual(mockApiResponse);
      expect(mockApiService.get).toHaveBeenCalledWith('/market/analysis');
      expect(mockValidateApiResponse).toHaveBeenCalledWith(
        expect.any(Object),
        mockAnalysis
      );
    });

    it('應該處理分析數據驗證失敗', async () => {
      const mockApiResponse = {
        success: true,
        data: { invalid: 'analysis' },
        message: '獲取成功',
      };

      mockApiService.get.mockResolvedValue(mockApiResponse);
      mockValidateApiResponse.mockReturnValue({
        isValid: false,
        errorMessage: '分析數據格式錯誤',
      });

      await expect(marketService.getMarketAnalysis()).rejects.toThrow(
        '分析數據格式錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Get market analysis error:',
        expect.any(Object)
      );
    });

    it('應該處理 API 錯誤', async () => {
      const error = new Error('API 錯誤');
      mockApiService.get.mockRejectedValue(error);

      await expect(marketService.getMarketAnalysis()).rejects.toThrow(
        'API 錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Get market analysis error:',
        { error: 'API 錯誤' }
      );
    });
  });

  describe('getPricePredictions', () => {
    it('應該成功獲取價格預測', async () => {
      const cardIds = ['card-1', 'card-2'];
      const mockPredictions = [
        {
          cardId: 'card-1',
          currentPrice: 100,
          predictedPrice: 120,
          confidence: 0.8,
          timeframe: '7d' as const,
          factors: ['市場趨勢', '技術分析'],
          riskAssessment: '中等風險',
        },
        {
          cardId: 'card-2',
          currentPrice: 80,
          predictedPrice: 75,
          confidence: 0.6,
          timeframe: '7d' as const,
          factors: ['基本面分析'],
          riskAssessment: '低風險',
        },
      ];

      const mockApiResponse = {
        success: true,
        data: mockPredictions,
        message: '預測成功',
      };

      mockValidateInput.mockReturnValue({
        isValid: true,
        data: { cardIds },
      });
      mockApiService.post.mockResolvedValue(mockApiResponse);
      mockValidateApiResponse.mockReturnValue({
        isValid: true,
        data: mockPredictions,
      });

      const result = await marketService.getPricePredictions(cardIds);

      expect(result).toEqual(mockApiResponse);
      expect(mockValidateInput).toHaveBeenCalledWith(expect.any(Object), {
        cardIds,
      });
      expect(mockApiService.post).toHaveBeenCalledWith('/market/predictions', {
        cardIds,
      });
      expect(mockValidateApiResponse).toHaveBeenCalledWith(
        expect.any(Object),
        mockPredictions
      );
    });

    it('應該處理輸入驗證失敗 - 空數組', async () => {
      mockValidateInput.mockReturnValue({
        isValid: false,
        errorMessage: '至少需要一個卡牌 ID',
      });

      await expect(marketService.getPricePredictions([])).rejects.toThrow(
        '至少需要一個卡牌 ID'
      );
      expect(mockApiService.post).not.toHaveBeenCalled();
    });

    it('應該處理輸入驗證失敗 - 無效 ID', async () => {
      mockValidateInput.mockReturnValue({
        isValid: false,
        errorMessage: '無效的卡牌 ID',
      });

      await expect(
        marketService.getPricePredictions(['invalid-id'])
      ).rejects.toThrow('無效的卡牌 ID');
      expect(mockApiService.post).not.toHaveBeenCalled();
    });

    it('應該處理響應驗證失敗', async () => {
      const cardIds = ['card-1'];
      const mockApiResponse = {
        success: true,
        data: [{ invalid: 'prediction' }],
        message: '預測成功',
      };

      mockValidateInput.mockReturnValue({
        isValid: true,
        data: { cardIds },
      });
      mockApiService.post.mockResolvedValue(mockApiResponse);
      mockValidateApiResponse.mockReturnValue({
        isValid: false,
        errorMessage: '預測數據格式錯誤',
      });

      await expect(marketService.getPricePredictions(cardIds)).rejects.toThrow(
        '預測數據格式錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Get price predictions error:',
        expect.any(Object)
      );
    });

    it('應該處理 API 錯誤', async () => {
      const cardIds = ['card-1'];
      const error = new Error('API 錯誤');

      mockValidateInput.mockReturnValue({
        isValid: true,
        data: { cardIds },
      });
      mockApiService.post.mockRejectedValue(error);

      await expect(marketService.getPricePredictions(cardIds)).rejects.toThrow(
        'API 錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Get price predictions error:',
        { error: 'API 錯誤' }
      );
    });
  });
});
