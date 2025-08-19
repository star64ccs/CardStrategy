import { CardService } from '@/services/cardService';
import { mockApiResponse, mockApiError } from '@/__tests__/setup/test-utils';
import { createMockCard, createMockConditionAnalysis } from '@/__tests__/setup/test-utils';

// Mock API service
jest.mock('@/services/apiService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
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

describe('CardService', () => {
  let cardService: CardService;
  let mockApiService: any;
  let mockLogger: any;
  let mockValidationService: any;

  beforeEach(() => {
    cardService = new CardService();
    mockApiService = require('@/services/apiService').apiService;
    mockLogger = require('@/utils/logger').logger;
    mockValidationService = require('@/utils/validationService');

    jest.clearAllMocks();
  });

  describe('getCards', () => {
    it('應該成功獲取卡片列表', async () => {
      const mockCards = [createMockCard(), createMockCard({ id: '2', name: 'Test Card 2' })];
      const mockResponse = mockApiResponse({
        cards: mockCards,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      });

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await cardService.getCards({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.cards).toHaveLength(2);
      expect(mockApiService.get).toHaveBeenCalledWith('/cards', {
        params: { page: 1, limit: 10 }
      });
    });

    it('應該處理API錯誤', async () => {
      const mockError = mockApiError('獲取卡片失敗');
      mockApiService.get.mockRejectedValue(mockError);

      await expect(cardService.getCards()).rejects.toThrow('獲取卡片失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getCardById', () => {
    it('應該成功獲取單張卡片', async () => {
      const mockCard = createMockCard();
      const mockResponse = mockApiResponse(mockCard);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await cardService.getCardById('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCard);
      expect(mockApiService.get).toHaveBeenCalledWith('/cards/1');
    });

    it('應該驗證卡片ID', async () => {
      mockValidationService.validateInput.mockReturnValue({
        isValid: false,
        errors: ['無效的卡片 ID']
      });

      await expect(cardService.getCardById('')).rejects.toThrow('無效的卡片 ID');
    });
  });

  describe('searchCards', () => {
    it('應該成功搜索卡片', async () => {
      const mockCards = [createMockCard()];
      const mockResponse = mockApiResponse({
        cards: mockCards,
        total: 1
      });

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await cardService.searchCards('test');

      expect(result.success).toBe(true);
      expect(result.data.cards).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith('/cards/search', {
        params: { query: 'test' }
      });
    });

    it('應該處理空搜索查詢', async () => {
      await expect(cardService.searchCards('')).rejects.toThrow('搜索查詢不能為空');
    });
  });

  describe('getCardRecommendations', () => {
    it('應該成功獲取卡片推薦', async () => {
      const mockCards = [createMockCard()];
      const mockResponse = mockApiResponse({
        recommendations: mockCards
      });

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await cardService.getCardRecommendations('1');

      expect(result.success).toBe(true);
      expect(result.data.recommendations).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith('/cards/recommendations', {
        params: { cardId: '1' }
      });
    });
  });

  describe('recognizeCard', () => {
    it('應該成功識別卡片', async () => {
      const mockCard = createMockCard();
      const mockResponse = mockApiResponse({
        recognizedCard: mockCard,
        confidence: 0.95
      });

      mockApiService.post.mockResolvedValue(mockResponse);

      const imageUri = 'file://test-image.jpg';
      const result = await cardService.recognizeCard(imageUri);

      expect(result.success).toBe(true);
      expect(result.data.recognizedCard).toEqual(mockCard);
      expect(result.data.confidence).toBe(0.95);
      expect(mockApiService.post).toHaveBeenCalledWith('/cards/recognize', {
        imageData: expect.any(String)
      });
    });

    it('應該處理圖片轉換錯誤', async () => {
      const imageUri = 'invalid-uri';

      await expect(cardService.recognizeCard(imageUri)).rejects.toThrow();
    });
  });

  describe('verifyCard', () => {
    it('應該成功驗證卡片', async () => {
      const mockResponse = mockApiResponse({
        isAuthentic: true,
        confidence: 0.98,
        verificationDetails: {
          hologram: true,
          printQuality: 'excellent',
          material: 'authentic'
        }
      });

      mockApiService.post.mockResolvedValue(mockResponse);

      const imageUri = 'file://test-image.jpg';
      const result = await cardService.verifyCard('1', imageUri);

      expect(result.success).toBe(true);
      expect(result.data.isAuthentic).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith('/cards/1/verify', {
        imageData: expect.any(String)
      });
    });
  });

  describe('analyzeCondition', () => {
    it('應該成功分析卡片條件', async () => {
      const mockAnalysis = createMockConditionAnalysis();
      const mockResponse = mockApiResponse(mockAnalysis);

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await cardService.analyzeCondition('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAnalysis);
      expect(mockApiService.post).toHaveBeenCalledWith('/cards/1/analyze-condition', {
        cardId: '1',
        analysisOptions: {
          includeDetailedFactors: true,
          includeDamageAssessment: true,
          includeMarketImpact: true,
          includePreservationTips: true,
          confidenceThreshold: 0.8
        }
      });
    });

    it('應該處理帶圖片的條件分析', async () => {
      const mockAnalysis = createMockConditionAnalysis();
      const mockResponse = mockApiResponse(mockAnalysis);

      mockApiService.post.mockResolvedValue(mockResponse);

      const imageUri = 'file://test-image.jpg';
      const result = await cardService.analyzeCondition('1', imageUri);

      expect(result.success).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith('/cards/1/analyze-condition', {
        cardId: '1',
        imageData: expect.any(String),
        analysisOptions: expect.any(Object)
      });
    });

    it('應該驗證卡片ID', async () => {
      await expect(cardService.analyzeCondition('')).rejects.toThrow('無效的卡片 ID');
    });
  });

  describe('error handling', () => {
    it('應該處理API響應驗證失敗', async () => {
      mockValidationService.validateApiResponse.mockReturnValue({
        isValid: false,
        errors: ['響應數據格式錯誤']
      });

      const mockResponse = mockApiResponse({});
      mockApiService.get.mockResolvedValue(mockResponse);

      await expect(cardService.getCards()).rejects.toThrow('服務器響應數據格式錯誤');
    });

    it('應該處理網絡錯誤', async () => {
      const networkError = new Error('Network error');
      mockApiService.get.mockRejectedValue(networkError);

      await expect(cardService.getCards()).rejects.toThrow('Network error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
