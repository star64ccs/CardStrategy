import { logger } from '../../../core/utils/logger';
import { cardRecognitionService } from '../services/cardRecognitionService';
import type {
  CardRecognitionRequest,
  BatchRecognitionRequest,
  UserFeedback,
  RecognitionConfig,
} from '../types/recognition';
import { CardRecognitionResponse } from '../types/recognition';

// Mock dependencies
jest.mock('../../../core/utils/logger');

const mockLogger = logger as jest.Mocked<typeof logger>;

describe('CardRecognitionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (cardRecognitionService as any).isInitialized = false;
    (cardRecognitionService as any).realtimeInterval = null;
    (cardRecognitionService as any).batchJobs.clear();
  });

  afterEach(() => {
    // Clear timers
    if ((cardRecognitionService as any).realtimeInterval) {
      clearInterval((cardRecognitionService as any).realtimeInterval);
    }
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = (
        cardRecognitionService as any
      ).constructor.getInstance();
      const instance2 = (
        cardRecognitionService as any
      ).constructor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await cardRecognitionService.initialize();

      expect((cardRecognitionService as any).isInitialized).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '初始化 CardRecognitionService'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'CardRecognitionService 初始化完成'
      );
    });

    it('should not reinitialize if already initialized', async () => {
      await cardRecognitionService.initialize();
      mockLogger.info.mockClear();

      await cardRecognitionService.initialize();

      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const originalLoadConfig = (cardRecognitionService as any).loadConfig;
      (cardRecognitionService as any).loadConfig = jest
        .fn()
        .mockRejectedValue(new Error('Config load failed'));

      await expect(cardRecognitionService.initialize()).rejects.toThrow(
        'Config load failed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'CardRecognitionService 初始化失敗:',
        expect.any(Error)
      );

      // Restore original method
      (cardRecognitionService as any).loadConfig = originalLoadConfig;
    });
  });

  describe('recognizeCard', () => {
    const mockRequest: CardRecognitionRequest = {
      imageData: `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==${'a'.repeat(10240)}`, // 確保超過10KB
      imageFormat: 'png',
      game: 'pokemon',
      language: 'zh-TW',
      region: 'TW',
      options: {
        enableMultipleCards: false,
        enableTextExtraction: true,
        enableFeatureDetection: true,
        confidenceThreshold: 0.7,
        maxResults: 5,
        timeout: 30000,
        useCache: true,
      },
    };

    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    it('should recognize card successfully', async () => {
      const result = await cardRecognitionService.recognizeCard(mockRequest);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toHaveProperty('card');
      expect(result.results[0]).toHaveProperty('confidence');
      expect(result.results[0].confidence).toBeGreaterThan(0);
      expect(result.results[0].confidence).toBeLessThanOrEqual(1);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.requestId).toBeDefined();

      expect(mockLogger.info).toHaveBeenCalledWith('開始卡牌識別:', {
        imageFormat: 'png',
        game: 'pokemon',
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        '卡牌識別完成:',
        expect.objectContaining({
          success: true,
          resultsCount: 1,
          processingTime: expect.any(Number),
        })
      );
    });

    it('should validate request parameters', async () => {
      const invalidRequest = { ...mockRequest, imageData: '' };

      const result = await cardRecognitionService.recognizeCard(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('RECOGNITION_FAILED');
      expect(result.error.message).toContain('圖像數據不能為空');
    });

    it('should handle unsupported image format', async () => {
      const invalidRequest = { ...mockRequest, imageFormat: 'gif' as any };

      const result = await cardRecognitionService.recognizeCard(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('不支持的圖像格式');
    });

    it('should handle image size limits', async () => {
      // Create a very large base64 string (over 10MB)
      const largeImageData = 'a'.repeat(15 * 1024 * 1024); // 15MB string
      const invalidRequest = { ...mockRequest, imageData: largeImageData };

      const result = await cardRecognitionService.recognizeCard(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('圖像文件過大');
    });

    it('should handle very small images', async () => {
      const smallImageData = 'abc'; // Very small string
      const invalidRequest = { ...mockRequest, imageData: smallImageData };

      const result = await cardRecognitionService.recognizeCard(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error.message).toContain('圖像文件過小');
    });

    it('should include alternatives in response', async () => {
      const result = await cardRecognitionService.recognizeCard(mockRequest);

      expect(result.alternatives).toBeDefined();
      expect(Array.isArray(result.alternatives)).toBe(true);
      expect(result.alternatives.length).toBeGreaterThanOrEqual(0);
    });

    it('should include suggestions in response', async () => {
      const result = await cardRecognitionService.recognizeCard(mockRequest);

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should include usage information', async () => {
      const result = await cardRecognitionService.recognizeCard(mockRequest);

      expect(result.usage).toBeDefined();
      expect(result.usage.recognitionsUsed).toBeDefined();
      expect(result.usage.recognitionsRemaining).toBeDefined();
      expect(result.usage.resetDate).toBeDefined();
      expect(result.usage.tier).toBeDefined();
    });
  });

  describe('recognizeCardsBatch', () => {
    const mockBatchRequest: BatchRecognitionRequest = {
      images: [
        {
          id: 'image1',
          imageData:
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          imageFormat: 'png',
        },
        {
          id: 'image2',
          imageData:
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          imageFormat: 'png',
        },
      ],
      options: {
        enableMultipleCards: false,
        enableTextExtraction: true,
        enableFeatureDetection: true,
        confidenceThreshold: 0.7,
        maxResults: 5,
        timeout: 30000,
        useCache: true,
      },
    };

    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    it('should start batch recognition', async () => {
      const result =
        await cardRecognitionService.recognizeCardsBatch(mockBatchRequest);

      expect(result.batchId).toBeDefined();
      expect(['queued', 'processing', 'completed']).toContain(result.status);
      expect(result.totalImages).toBe(2);
      expect(result.processedImages).toBeGreaterThanOrEqual(0);
      expect(result.successfulRecognitions).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.processingStarted).toBeDefined();

      expect(mockLogger.info).toHaveBeenCalledWith(
        '開始批量卡牌識別:',
        expect.objectContaining({
          batchId: result.batchId,
          imageCount: 2,
        })
      );
    });

    it('should process batch asynchronously', async () => {
      const result =
        await cardRecognitionService.recognizeCardsBatch(mockBatchRequest);

      // Wait for async processing to start
      await new Promise(resolve => setTimeout(resolve, 100));

      const status = cardRecognitionService.getBatchJobStatus(result.batchId);
      expect(status).toBeDefined();
      expect(status.batchId).toBe(result.batchId);
    });

    it('should handle empty batch request', async () => {
      const emptyBatchRequest = { ...mockBatchRequest, images: [] };

      const result =
        await cardRecognitionService.recognizeCardsBatch(emptyBatchRequest);

      expect(result.totalImages).toBe(0);
      expect(['queued', 'processing', 'completed']).toContain(result.status);
    });
  });

  describe('startRealtimeRecognition', () => {
    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    it('should start realtime recognition', async () => {
      const onFrameProcessed = jest.fn();

      await cardRecognitionService.startRealtimeRecognition(onFrameProcessed);

      expect(mockLogger.info).toHaveBeenCalledWith('開始實時卡牌識別');
      expect((cardRecognitionService as any).realtimeInterval).toBeDefined();

      // Wait for at least one frame to be processed
      await new Promise(resolve => setTimeout(resolve, 100));

      cardRecognitionService.stopRealtimeRecognition();
    });

    it('should stop existing realtime recognition before starting new one', async () => {
      const onFrameProcessed1 = jest.fn();
      const onFrameProcessed2 = jest.fn();

      await cardRecognitionService.startRealtimeRecognition(onFrameProcessed1);
      const firstInterval = (cardRecognitionService as any).realtimeInterval;

      await cardRecognitionService.startRealtimeRecognition(onFrameProcessed2);
      const secondInterval = (cardRecognitionService as any).realtimeInterval;

      expect(firstInterval).not.toBe(secondInterval);

      cardRecognitionService.stopRealtimeRecognition();
    });

    it('should handle realtime recognition errors', async () => {
      // Mock error in frame processing
      const originalCaptureAndProcessFrame = (cardRecognitionService as any)
        .captureAndProcessFrame;
      (cardRecognitionService as any).captureAndProcessFrame = jest
        .fn()
        .mockRejectedValue(new Error('Frame error'));

      const onFrameProcessed = jest.fn();

      await cardRecognitionService.startRealtimeRecognition(onFrameProcessed);

      // Wait for error to occur
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockLogger.error).toHaveBeenCalledWith(
        '實時識別幀處理失敗:',
        expect.any(Error)
      );

      cardRecognitionService.stopRealtimeRecognition();

      // Restore original method
      (cardRecognitionService as any).captureAndProcessFrame =
        originalCaptureAndProcessFrame;
    });
  });

  describe('stopRealtimeRecognition', () => {
    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    it('should stop realtime recognition', async () => {
      const onFrameProcessed = jest.fn();

      await cardRecognitionService.startRealtimeRecognition(onFrameProcessed);
      expect((cardRecognitionService as any).realtimeInterval).toBeDefined();

      cardRecognitionService.stopRealtimeRecognition();

      expect((cardRecognitionService as any).realtimeInterval).toBeNull();
      expect(mockLogger.info).toHaveBeenCalledWith('實時識別已停止');
    });

    it('should handle stop when not running', () => {
      cardRecognitionService.stopRealtimeRecognition();

      expect((cardRecognitionService as any).realtimeInterval).toBeNull();
    });
  });

  describe('getRecognitionHistory', () => {
    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    it('should get recognition history', async () => {
      const history = await cardRecognitionService.getRecognitionHistory(
        'user123',
        10
      );

      expect(Array.isArray(history)).toBe(true);
      // Mock API returns empty array
      expect(history).toEqual([]);
    });

    it('should handle default limit', async () => {
      const history =
        await cardRecognitionService.getRecognitionHistory('user123');

      expect(Array.isArray(history)).toBe(true);
    });

    it('should handle API errors', async () => {
      const originalCallGetHistoryAPI = (cardRecognitionService as any)
        .callGetHistoryAPI;
      (cardRecognitionService as any).callGetHistoryAPI = jest
        .fn()
        .mockRejectedValue(new Error('API error'));

      await expect(
        cardRecognitionService.getRecognitionHistory('user123')
      ).rejects.toThrow('API error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取識別歷史失敗:',
        expect.any(Error)
      );

      // Restore original method
      (cardRecognitionService as any).callGetHistoryAPI =
        originalCallGetHistoryAPI;
    });
  });

  describe('submitUserFeedback', () => {
    const mockFeedback: UserFeedback = {
      isCorrect: true,
      rating: 5,
      comments: 'Great recognition',
      timestamp: new Date(),
    };

    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    it('should submit user feedback', async () => {
      await cardRecognitionService.submitUserFeedback(
        'history123',
        mockFeedback
      );

      expect(mockLogger.info).toHaveBeenCalledWith('用戶反饋提交成功:', {
        historyId: 'history123',
        isCorrect: true,
      });
    });

    it('should handle API errors', async () => {
      const originalCallSubmitFeedbackAPI = (cardRecognitionService as any)
        .callSubmitFeedbackAPI;
      (cardRecognitionService as any).callSubmitFeedbackAPI = jest
        .fn()
        .mockRejectedValue(new Error('Submit error'));

      await expect(
        cardRecognitionService.submitUserFeedback('history123', mockFeedback)
      ).rejects.toThrow('Submit error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        '提交用戶反饋失敗:',
        expect.any(Error)
      );

      // Restore original method
      (cardRecognitionService as any).callSubmitFeedbackAPI =
        originalCallSubmitFeedbackAPI;
    });
  });

  describe('getRecognitionStats', () => {
    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    it('should get recognition stats', async () => {
      const stats = await cardRecognitionService.getRecognitionStats();

      expect(stats).toBeDefined();
      expect(stats.totalRecognitions).toBeDefined();
      expect(stats.successfulRecognitions).toBeDefined();
      expect(stats.successRate).toBeDefined();
      expect(stats.averageConfidence).toBeDefined();
      expect(stats.averageProcessingTime).toBeDefined();
      expect(Array.isArray(stats.popularGames)).toBe(true);
      expect(Array.isArray(stats.popularSets)).toBe(true);
      expect(Array.isArray(stats.commonErrors)).toBe(true);
      expect(stats.userSatisfaction).toBeDefined();
    });

    it('should handle API errors', async () => {
      const originalCallGetStatsAPI = (cardRecognitionService as any)
        .callGetStatsAPI;
      (cardRecognitionService as any).callGetStatsAPI = jest
        .fn()
        .mockRejectedValue(new Error('Stats error'));

      await expect(
        cardRecognitionService.getRecognitionStats()
      ).rejects.toThrow('Stats error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取識別統計失敗:',
        expect.any(Error)
      );

      // Restore original method
      (cardRecognitionService as any).callGetStatsAPI = originalCallGetStatsAPI;
    });
  });

  describe('getSupportedGames', () => {
    it('should return supported games', () => {
      const games = cardRecognitionService.getSupportedGames();

      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
      expect(games).toContain('pokemon');
      expect(games).toContain('yugioh');
      expect(games).toContain('magic');
    });
  });

  describe('getConfig', () => {
    it('should return configuration copy', () => {
      const config = cardRecognitionService.getConfig();

      expect(config).toBeDefined();
      expect(config.enabledGames).toBeDefined();
      expect(config.defaultOptions).toBeDefined();
      expect(config.qualityThresholds).toBeDefined();
      expect(config.modelSettings).toBeDefined();
      expect(config.cacheSettings).toBeDefined();
      expect(config.retrySettings).toBeDefined();

      // Should be a copy, not reference
      const originalConfig = (cardRecognitionService as any).config;
      expect(config).not.toBe(originalConfig);
      expect(config).toEqual(originalConfig);
    });
  });

  describe('updateConfig', () => {
    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    it('should update configuration', async () => {
      const updates: Partial<RecognitionConfig> = {
        defaultOptions: {
          enableMultipleCards: true,
          enableTextExtraction: false,
          enableFeatureDetection: true,
          confidenceThreshold: 0.8,
          maxResults: 10,
          timeout: 60000,
          useCache: false,
        },
      };

      await cardRecognitionService.updateConfig(updates);

      const updatedConfig = cardRecognitionService.getConfig();
      expect(updatedConfig.defaultOptions.enableMultipleCards).toBe(true);
      expect(updatedConfig.defaultOptions.enableTextExtraction).toBe(false);
      expect(updatedConfig.defaultOptions.confidenceThreshold).toBe(0.8);
      expect(updatedConfig.defaultOptions.maxResults).toBe(10);
      expect(updatedConfig.defaultOptions.timeout).toBe(60000);
      expect(updatedConfig.defaultOptions.useCache).toBe(false);

      expect(mockLogger.info).toHaveBeenCalledWith('識別配置已更新');
    });

    it('should handle config update errors', async () => {
      const originalSaveConfig = (cardRecognitionService as any).saveConfig;
      (cardRecognitionService as any).saveConfig = jest
        .fn()
        .mockRejectedValue(new Error('Save error'));

      const updates = { defaultOptions: { confidenceThreshold: 0.9 } };

      await expect(
        cardRecognitionService.updateConfig(updates as any)
      ).rejects.toThrow('Save error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        '更新識別配置失敗:',
        expect.any(Error)
      );

      // Restore original method
      (cardRecognitionService as any).saveConfig = originalSaveConfig;
    });
  });

  describe('getBatchJobStatus', () => {
    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    it('should return null for non-existent batch', () => {
      const status = cardRecognitionService.getBatchJobStatus('non-existent');
      expect(status).toBeNull();
    });

    it('should return batch status for existing batch', async () => {
      const batchRequest: BatchRecognitionRequest = {
        images: [
          {
            id: 'test1',
            imageData: 'test-data',
            imageFormat: 'png',
          },
        ],
      };

      const batch =
        await cardRecognitionService.recognizeCardsBatch(batchRequest);
      const status = cardRecognitionService.getBatchJobStatus(batch.batchId);

      expect(status).toBeDefined();
      expect(status.batchId).toBe(batch.batchId);
      expect(['queued', 'processing', 'completed']).toContain(status.status);
    });
  });

  describe('private methods', () => {
    beforeEach(async () => {
      await cardRecognitionService.initialize();
    });

    it('should validate recognition request properly', () => {
      const validRequest: CardRecognitionRequest = {
        imageData: `valid-base64-data${'a'.repeat(10240)}`, // 確保超過10KB
        imageFormat: 'jpg',
      };

      expect(() => {
        (cardRecognitionService as any).validateRecognitionRequest(
          validRequest
        );
      }).not.toThrow();
    });

    it('should generate unique batch IDs', () => {
      const id1 = (cardRecognitionService as any).generateBatchId();
      const id2 = (cardRecognitionService as any).generateBatchId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^batch_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^batch_\d+_[a-z0-9]+$/);
    });

    it('should create mock card data', () => {
      const mockCard = (cardRecognitionService as any).createMockCard();

      expect(mockCard).toBeDefined();
      expect(mockCard.id).toBeDefined();
      expect(mockCard.name).toBeDefined();
      expect(mockCard.setName).toBeDefined();
      expect(mockCard.cardNumber).toBeDefined();
      expect(mockCard.images).toBeDefined();
      expect(mockCard.metadata).toBeDefined();
    });

    it('should create mock features', () => {
      const mockFeatures = (cardRecognitionService as any).createMockFeatures();

      expect(mockFeatures).toBeDefined();
      expect(mockFeatures.textFeatures).toBeDefined();
      expect(mockFeatures.visualFeatures).toBeDefined();
      expect(mockFeatures.structuralFeatures).toBeDefined();
      expect(mockFeatures.qualityMetrics).toBeDefined();
    });

    it('should create mock metadata', () => {
      const mockMetadata = (cardRecognitionService as any).createMockMetadata();

      expect(mockMetadata).toBeDefined();
      expect(mockMetadata.version).toBeDefined();
      expect(mockMetadata.modelVersion).toBeDefined();
      expect(mockMetadata.algorithm).toBeDefined();
      expect(mockMetadata.processingSteps).toBeDefined();
      expect(mockMetadata.confidence).toBeDefined();
      expect(mockMetadata.performanceMetrics).toBeDefined();
    });
  });
});
