/* global jest, describe, it, expect, beforeEach, afterEach */
import { aiService } from '../../../services/aiService';
import { apiService } from '../../../services/apiService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');
jest.mock('../../../utils/validationService');
jest.mock('../../../utils/validationSchemas');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCardAnalysis', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';
    const mockAnalysis = {
      cardId: mockCardId,
      rating: 'A+' as const,
      confidence: 0.95,
      factors: {
        technical: 0.8,
        fundamental: 0.9,
        market: 0.7,
        sentiment: 0.85,
      },
      recommendations: ['建議持有', '關注市場動態'],
      riskLevel: 'low' as const,
      priceTarget: {
        short: 100,
        medium: 120,
        long: 150,
      },
      summary: '這是一張具有良好投資潛力的卡片',
    };

    it('應該成功獲取卡片 AI 分析', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockAnalysis,
        message: '分析成功',
      });

      const result = await aiService.getCardAnalysis(mockCardId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAnalysis);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        cardId: mockCardId,
      });
    });

    it('應該處理無效的卡牌 ID', async () => {
      const invalidCardId = 'invalid-id';

      await expect(aiService.getCardAnalysis(invalidCardId)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('API 錯誤'));

      await expect(aiService.getCardAnalysis(mockCardId)).rejects.toThrow(
        'API 錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getPricePrediction', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';
    const mockPrediction = {
      cardId: mockCardId,
      timeframe: '7d' as const,
      predictedPrice: 150.5,
      confidence: 0.85,
      factors: ['市場需求增加', '供應減少'],
      riskAssessment: '中等風險',
      trend: 'up' as const,
    };

    it('應該成功獲取價格預測', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockPrediction,
        message: '預測成功',
      });

      const result = await aiService.getPricePrediction(mockCardId, '7d');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPrediction);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        cardId: mockCardId,
        timeframe: '7d',
      });
    });

    it('應該處理無效的時間框架', async () => {
      await expect(
        aiService.getPricePrediction(mockCardId, 'invalid' as any)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('預測服務錯誤'));

      await expect(
        aiService.getPricePrediction(mockCardId, '7d')
      ).rejects.toThrow('預測服務錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getInvestmentRecommendation', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';
    const mockRecommendation = {
      cardId: mockCardId,
      action: 'buy' as const,
      confidence: 0.9,
      reasoning: ['價格處於低位', '基本面良好'],
      priceTarget: 200,
      timeframe: '3個月',
      riskLevel: 'medium' as const,
    };

    it('應該成功獲取投資建議', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockRecommendation,
        message: '建議生成成功',
      });

      const result = await aiService.getInvestmentRecommendation(mockCardId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRecommendation);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        cardId: mockCardId,
      });
    });

    it('應該處理無效的卡牌 ID', async () => {
      const invalidCardId = 'invalid-id';

      await expect(
        aiService.getInvestmentRecommendation(invalidCardId)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('建議服務錯誤'));

      await expect(
        aiService.getInvestmentRecommendation(mockCardId)
      ).rejects.toThrow('建議服務錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('sendChatMessage', () => {
    const mockMessage = '這張卡片的投資價值如何？';
    const mockSessionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockChatMessage = {
      id: 'msg-123',
      role: 'assistant' as const,
      content: '根據分析，這張卡片具有不錯的投資潛力...',
      timestamp: '2024-01-01T00:00:00Z',
    };

    it('應該成功發送聊天消息', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockChatMessage,
        message: '消息發送成功',
      });

      const result = await aiService.sendChatMessage(
        mockMessage,
        mockSessionId
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockChatMessage);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        message: mockMessage,
        sessionId: mockSessionId,
      });
    });

    it('應該處理空消息', async () => {
      await expect(aiService.sendChatMessage('')).rejects.toThrow();
    });

    it('應該處理過長的消息', async () => {
      const longMessage = 'a'.repeat(1001);
      await expect(aiService.sendChatMessage(longMessage)).rejects.toThrow();
    });

    it('應該處理無效的會話 ID', async () => {
      const invalidSessionId = 'invalid-id';
      await expect(
        aiService.sendChatMessage(mockMessage, invalidSessionId)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('聊天服務錯誤'));

      await expect(aiService.sendChatMessage(mockMessage)).rejects.toThrow(
        '聊天服務錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getChatSessions', () => {
    const mockSessions = [
      {
        id: 'session-1',
        title: '投資諮詢',
        messages: [
          {
            id: 'msg-1',
            role: 'user' as const,
            content: '這張卡片值得投資嗎？',
            timestamp: '2024-01-01T00:00:00Z',
          },
          {
            id: 'msg-2',
            role: 'assistant' as const,
            content: '根據分析...',
            timestamp: '2024-01-01T00:01:00Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:01:00Z',
      },
    ];

    it('應該成功獲取聊天會話列表', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockSessions,
        message: '會話列表獲取成功',
      });

      const result = await aiService.getChatSessions();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSessions);
      expect(mockApiService.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('應該處理空會話列表', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: [],
        message: '沒有會話',
      });

      const result = await aiService.getChatSessions();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('會話服務錯誤'));

      await expect(aiService.getChatSessions()).rejects.toThrow('會話服務錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
