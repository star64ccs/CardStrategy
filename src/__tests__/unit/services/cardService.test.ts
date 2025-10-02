/* global jest, describe, it, expect, beforeEach, afterEach */
import { mockApiResponse, mockApiError } from '@/__tests__/setup/test-utils';
import {
  createMockCard,
  createMockConditionAnalysis,
} from '@/__tests__/setup/test-utils';
import { CardService } from '@/services/cardService';

// Mock API service
jest.mock('@/services/apiService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock validation service
jest.mock('@/utils/validationService', () => ({
  validateApiResponse: jest.fn(() => ({ isValid: true, errors: [] })),
  validateInput: jest.fn((schema, data, context) => {
    // 對於Empty字符串或無效 UUID，ReturnVerifyFailed
    if (data === '' || (typeof data === 'string' && data.length === 0)) {
      return {
        isValid: false,
        errors: ['無效的 UUID'],
        errorMessage: '無效的 UUID',
      };
    }
    return {
      isValid: true,
      data,
      errors: [],
      errorMessage: undefined,
    };
  }),
}));

// Mock react-native-fs for image conversion
jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue('base64ImageData'),
}));

// Mock ValidationUtils directly
jest.mock('@/utils/validationUtils', () => ({
  ValidationUtils: {
    validateUUID: jest.fn((id, fieldName = 'ID') => {
      if (id === '' || (typeof id === 'string' && id.length === 0)) {
        throw new Error(`${fieldName} VerifyFailed: 無效的 UUID`);
      }
    }),
    validateEmail: jest.fn(),
    validatePassword: jest.fn(),
    validateCardId: jest.fn(),
    validateCollectionId: jest.fn(),
    validateUserId: jest.fn(),
    validatePrice: jest.fn(),
    validateQuantity: jest.fn(),
    validatePercentage: jest.fn(),
    validateDateRange: jest.fn(),
    validatePagination: jest.fn(),
    validateSearchParams: jest.fn(),
    validateFile: jest.fn(),
    validateCardCondition: jest.fn(),
    validateInvestmentType: jest.fn(),
    validateTimeframe: jest.fn(),
    validateUUIDs: jest.fn(),
    validateRequiredFields: jest.fn(),
    validateFieldTypes: jest.fn(),
    createCustomSchema: jest.fn(),
  },
}));

describe('CardService', () => {
  let cardService: CardService;
  let mockApiService: unknown;
  let mockLogger: unknown;
  let mockValidationService: unknown;

  beforeEach(() => {
    cardService = new CardService();
    mockApiService = require('@/services/apiService').apiService;
    mockLogger = require('@/utils/logger').logger;
    mockValidationService = require('@/utils/validationService');

    jest.clearAllMocks();
  });

  describe('getCards', () => {
    it('應該SuccessGet卡片列表', async () => {
      const _mockCards = [
        createMockCard(),
        createMockCard({ id: '2', name: 'Test Card 2' }),
      ];
      const _mockResponse = {
        data: mockApiResponse({
          cards: mockCards,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        }),
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await cardService.getCards({ page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data.cards).toHaveLength(2);
      expect(mockApiService.get).toHaveBeenCalledWith('/cards', {
        params: { page: 1, limit: 10 },
      });
    });
  });

  describe('getCardById', () => {
    it('應該SuccessGet單張卡片', async () => {
      const _mockCard = createMockCard();
      const _mockResponse = {
        data: mockApiResponse(mockCard),
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await cardService.getCardDetail('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCard);
      expect(mockApiService.get).toHaveBeenCalledWith('/cards/1');
    });

    it('應該驗證卡片ID', async () => {
      // Manual調用 validateUUID 使其ThrowError
      const { ValidationUtils } = require('@/utils/validationUtils');
      ValidationUtils.validateUUID.mockImplementation(
        (id, fieldName = 'ID') => {
          if (id === '' || (typeof id === 'string' && id.length === 0)) {
            throw new Error(`${fieldName} VerifyFailed: 無效的 UUID`);
          }
        }
      );

      await expect(cardService.getCardDetail('')).rejects.toThrow(
        '卡片 ID VerifyFailed'
      );
    });
  });

  describe('searchCards', () => {
    it('應該Success搜索卡片', async () => {
      const _mockCards = [createMockCard()];
      const _mockResponse = {
        data: mockApiResponse({
          cards: mockCards,
          total: 1,
        }),
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await cardService.searchCards('test');

      expect(result.success).toBe(true);
      expect(result.data.cards).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith('/cards/search', {
        params: { query: 'test' },
      });
    });

    it('應該處理空搜索查詢', async () => {
      await expect(cardService.searchCards('')).rejects.toThrow(
        '搜索查詢不能為空'
      );
    });
  });

  describe('getCardRecommendations', () => {
    it('應該SuccessGet卡片推薦', async () => {
      const _mockCards = [createMockCard()];
      const _mockResponse = {
        data: mockApiResponse({
          recommendations: mockCards,
        }),
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result = await cardService.getRecommendations('1');

      expect(result.success).toBe(true);
      expect(result.data.recommendations).toHaveLength(1);
      expect(mockApiService.get).toHaveBeenCalledWith(
        '/cards/recommendations',
        {
          params: { userId: '1' },
        }
      );
    });
  });

  describe('recognizeCard', () => {
    it('應該Success識別卡片', async () => {
      const _mockCard = createMockCard();
      const _mockResponse = {
        data: mockApiResponse({
          recognizedCard: mockCard,
          confidence: 0.95,
        }),
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const _imageUri = 'file://test-image.jpg';
      const _result = await cardService.recognizeCard(imageUri);

      expect(result.success).toBe(true);
      expect(result.data.recognizedCard).toEqual(mockCard);
      expect(result.data.confidence).toBe(0.95);
      expect(mockApiService.post).toHaveBeenCalledWith('/cards/recognize', {
        imageData: expect.any(String),
        options: expect.any(Object),
      });
    });

    it('應該Handle圖片轉換Error', async () => {
      const _imageUri = 'invalid-uri';

      await expect(cardService.recognizeCard(imageUri)).rejects.toThrow();
    });
  });

  describe('verifyCard', () => {
    it('應該SuccessVerify卡片', async () => {
      const _mockResponse = {
        data: mockApiResponse({
          isAuthentic: true,
          confidence: 0.98,
          verificationDetails: {
            hologram: true,
            printQuality: 'excellent',
            material: 'authentic',
          },
        }),
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const _imageUri = 'file://test-image.jpg';
      const _result = await cardService.verifyCard('1', imageUri);

      expect(result.success).toBe(true);
      expect(result.data.isAuthentic).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith('/cards/1/verify', {
        cardId: '1',
        imageData: expect.any(String),
      });
    });
  });

  describe('analyzeCondition', () => {
    it('應該Success分析卡片條件', async () => {
      const _mockAnalysis = createMockConditionAnalysis();
      const _mockResponse = {
        data: mockApiResponse(mockAnalysis),
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const _result = await cardService.analyzeCardCondition('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAnalysis);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/cards/1/analyze-condition',
        {
          cardId: '1',
          analysisOptions: {
            includeDetailedFactors: true,
            includeDamageAssessment: true,
            includeMarketImpact: true,
            includePreservationTips: true,
            confidenceThreshold: 0.8,
          },
        }
      );
    });

    it('應該處理帶圖片的條件分析', async () => {
      const _mockAnalysis = createMockConditionAnalysis();
      const _mockResponse = {
        data: mockApiResponse(mockAnalysis),
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const _imageUri = 'file://test-image.jpg';
      const _result = await cardService.analyzeCardCondition('1', imageUri);

      expect(result.success).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/cards/1/analyze-condition',
        {
          cardId: '1',
          imageData: expect.any(String),
          analysisOptions: expect.any(Object),
        }
      );
    });

    it('應該驗證卡片ID', async () => {
      // Manual調用 validateUUID 使其ThrowError
      const { ValidationUtils } = require('@/utils/validationUtils');
      ValidationUtils.validateUUID.mockImplementation(
        (id, fieldName = 'ID') => {
          if (id === '' || (typeof id === 'string' && id.length === 0)) {
            throw new Error(`${fieldName} VerifyFailed: 無效的 UUID`);
          }
        }
      );

      await expect(cardService.analyzeCardCondition('')).rejects.toThrow(
        '卡片 ID VerifyFailed'
      );
    });
  });

  describe('error handling', () => {
    it('應該HandleAPI響應VerifyFailed', async () => {
      // 模擬 apiService.get ThrowError而不YesReturnResponse
      const _validationError = new Error('Server響應數據格式Error');
      mockApiService.get.mockRejectedValue(validationError);

      await expect(cardService.getCards()).rejects.toThrow(
        'Server響應數據格式Error'
      );
    });

    it('應該Handle網絡Error', async () => {
      const _networkError = new Error('Network error');
      mockApiService.get.mockRejectedValue(networkError);

      await expect(cardService.getCards()).rejects.toThrow('Network error');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('應該HandleAPIError', async () => {
      const _apiError = new Error('Get卡片Failed');
      mockApiService.get.mockRejectedValue(apiError);

      await expect(cardService.getCards()).rejects.toThrow('Get卡片Failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
