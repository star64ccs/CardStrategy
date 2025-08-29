import ContentRecommendationService from '../services/contentRecommendationService';
import type { UserPreference } from '../types/contentRecommendation';
import {
  ContentRecommendationAlgorithm,
  SimilarityMethod,
  ContentType,
} from '../types/contentRecommendation';

// Mock dataConverters
jest.mock('../../analytics/utils/dataConverters', () => ({
  dataConverters: {
    convertToChartData: jest.fn(),
    convertToTableData: jest.fn(),
    convertToExportData: jest.fn(),
  },
}));

describe('ContentRecommendationService', () => {
  let service: ContentRecommendationService;

  beforeEach(() => {
    // Reset singleton instance
    (ContentRecommendationService as any).instance = null;
    service = ContentRecommendationService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = ContentRecommendationService.getInstance();
      const _instance2 = ContentRecommendationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('應該成功初始化服務', async () => {
      const _result = await service.initialize();
      expect(result).toBeUndefined();
    });

    it('應該只初始化一次', async () => {
      await service.initialize();
      const _result = await service.initialize();
      expect(result).toBeUndefined();
    });
  });

  describe('getContentRecommendations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該返回推薦列表', async () => {
      const _request = {
        userId: 'user_123',
        limit: 10,
        algorithm: ContentRecommendationAlgorithm.CONTENT_BASED,
        similarityMethod: SimilarityMethod.COSINE,
      };

      const _response = await service.getContentRecommendations(request);

      expect(response).toBeDefined();
      expect(response.recommendations).toBeDefined();
      expect(Array.isArray(response.recommendations)).toBe(true);
      expect(response.totalCount).toBeGreaterThanOrEqual(0);
      expect(response.algorithm).toBe(
        ContentRecommendationAlgorithm.CONTENT_BASED
      );
      expect(response.similarityMethod).toBe(SimilarityMethod.COSINE);
      expect(response.performanceMetrics).toBeDefined();
      expect(response.metadata).toBeDefined();
    });

    it('應該支持不同的算法', async () => {
      const _algorithms = [
        ContentRecommendationAlgorithm.CONTENT_BASED,
        ContentRecommendationAlgorithm.TAG_BASED,
        ContentRecommendationAlgorithm.CATEGORY_BASED,
        ContentRecommendationAlgorithm.ATTRIBUTE_BASED,
        ContentRecommendationAlgorithm.HYBRID,
        ContentRecommendationAlgorithm.POPULARITY_BASED,
        ContentRecommendationAlgorithm.TRENDING_BASED,
      ];

      for (const algorithm of algorithms) {
        const _request = {
          userId: 'user_123',
          limit: 5,
          algorithm,
          similarityMethod: SimilarityMethod.COSINE,
        };

        const _response = await service.getContentRecommendations(request);
        expect(response.algorithm).toBe(algorithm);
      }
    });

    it('應該支持不同的相似度方法', async () => {
      const _methods = [
        SimilarityMethod.COSINE,
        SimilarityMethod.JACCARD,
        SimilarityMethod.EUCLIDEAN,
        SimilarityMethod.PEARSON,
        SimilarityMethod.MANHATTAN,
        SimilarityMethod.HYBRID,
      ];

      for (const method of methods) {
        const _request = {
          userId: 'user_123',
          limit: 5,
          algorithm: ContentRecommendationAlgorithm.CONTENT_BASED,
          similarityMethod: method,
        };

        const _response = await service.getContentRecommendations(request);
        expect(response.similarityMethod).toBe(method);
      }
    });

    it('應該支持過濾器', async () => {
      const _request = {
        userId: 'user_123',
        limit: 10,
        filters: {
          contentTypes: [ContentType.CARD, ContentType.ARTICLE],
          categories: ['strategy'],
          tags: ['pokemon'],
          difficulty: 'beginner' as const,
          language: 'zh-TW',
          priceRange: { min: 0, max: 100 },
          durationRange: { min: 1, max: 60 },
          ratingThreshold: 4.0,
        },
      };

      const _response = await service.getContentRecommendations(request);
      expect(response).toBeDefined();
      expect(response.metadata.filters).toEqual(request.filters);
    });

    it('應該支持推薦選項', async () => {
      const _request = {
        userId: 'user_123',
        limit: 10,
        options: {
          includeSimilarContent: true,
          includePopularContent: true,
          includeTrendingContent: true,
          diversityBoost: true,
          noveltyBoost: true,
          recencyBoost: true,
          explainRecommendations: true,
        },
      };

      const _response = await service.getContentRecommendations(request);
      expect(response).toBeDefined();
      expect(response.metadata.options).toEqual(request.options);
    });
  });

  describe('getSimilarContent', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該返回相似內容列表', async () => {
      const _contentId = 'content_1';
      const _limit = 5;
      const _similarityMethod = SimilarityMethod.COSINE;

      const _similarities = await service.getSimilarContent(
        contentId,
        limit,
        similarityMethod
      );

      expect(similarities).toBeDefined();
      expect(Array.isArray(similarities)).toBe(true);
      expect(similarities.length).toBeLessThanOrEqual(limit);

      if (similarities.length > 0) {
        const _similarity = similarities[0];
        expect(similarity.sourceId).toBe(contentId);
        expect(similarity.similarityScore).toBeGreaterThanOrEqual(0);
        expect(similarity.similarityScore).toBeLessThanOrEqual(1);
        expect(similarity.similarityMethod).toBe(similarityMethod);
        expect(similarity.commonTags).toBeDefined();
        expect(similarity.commonCategories).toBeDefined();
        expect(similarity.attributeSimilarity).toBeDefined();
      }
    });

    it('應該支持不同的相似度方法', async () => {
      const _contentId = 'content_1';
      const _methods = [
        SimilarityMethod.COSINE,
        SimilarityMethod.JACCARD,
        SimilarityMethod.EUCLIDEAN,
      ];

      for (const method of methods) {
        const _similarities = await service.getSimilarContent(
          contentId,
          3,
          method
        );
        expect(similarities).toBeDefined();
        expect(Array.isArray(similarities)).toBe(true);
      }
    });

    it('應該處理不存在的內容ID', async () => {
      const _contentId = 'non_existent_content';

      await expect(service.getSimilarContent(contentId)).rejects.toThrow(
        'Content item not found'
      );
    });
  });

  describe('updateUserPreference', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該成功更新用戶偏好', async () => {
      const _userId = 'user_123';
      const preference: Partial<UserPreference> = {
        contentTypes: [ContentType.CARD, ContentType.ARTICLE],
        categories: ['strategy', 'trading'],
        tags: ['pokemon', 'yugioh'],
        difficulty: 'intermediate',
        language: 'zh-TW',
        priceRange: { min: 0, max: 100 },
        durationRange: { min: 1, max: 60 },
        ratingThreshold: 4.0,
      };

      const _result = await service.updateUserPreference(userId, preference);
      expect(result).toBeUndefined();
    });

    it('應該支持部分更新', async () => {
      const _userId = 'user_123';
      const preference: Partial<UserPreference> = {
        contentTypes: [ContentType.VIDEO],
        difficulty: 'advanced',
      };

      const _result = await service.updateUserPreference(userId, preference);
      expect(result).toBeUndefined();
    });
  });

  describe('recordUserInteraction', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該成功記錄用戶互動', async () => {
      const _userId = 'user_123';
      const _contentId = 'content_1';
      const _interaction = {
        type: 'view' as const,
        timestamp: new Date(),
        duration: 30,
      };

      const _result = await service.recordUserInteraction(
        userId,
        contentId,
        interaction
      );
      expect(result).toBeUndefined();
    });

    it('應該支持不同類型的互動', async () => {
      const _userId = 'user_123';
      const _contentId = 'content_1';
      const _interactions = [
        { type: 'view' as const, timestamp: new Date() },
        { type: 'like' as const, timestamp: new Date() },
        { type: 'share' as const, timestamp: new Date() },
        { type: 'bookmark' as const, timestamp: new Date() },
        { type: 'rate' as const, timestamp: new Date(), rating: 4.5 },
        {
          type: 'comment' as const,
          timestamp: new Date(),
          comment: 'Great content',
        },
      ];

      for (const interaction of interactions) {
        const _result = await service.recordUserInteraction(
          userId,
          contentId,
          interaction
        );
        expect(result).toBeUndefined();
      }
    });
  });

  describe('Configuration', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該獲取配置', () => {
      const _config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.enabled).toBeDefined();
      expect(config.algorithms).toBeDefined();
      expect(config.similarityMethods).toBeDefined();
      expect(config.maxRecommendations).toBeDefined();
      expect(config.similarityThreshold).toBeDefined();
      expect(config.cacheEnabled).toBeDefined();
      expect(config.cacheExpiry).toBeDefined();
      expect(config.updateInterval).toBeDefined();
      expect(config.performanceTracking).toBeDefined();
    });

    it('應該更新配置', () => {
      const _originalConfig = service.getConfig();
      const _newConfig = {
        maxRecommendations: 30,
        similarityThreshold: 0.5,
        cacheEnabled: false,
      };

      service.updateConfig(newConfig);
      const _updatedConfig = service.getConfig();

      expect(updatedConfig.maxRecommendations).toBe(30);
      expect(updatedConfig.similarityThreshold).toBe(0.5);
      expect(updatedConfig.cacheEnabled).toBe(false);
      expect(updatedConfig.enabled).toBe(originalConfig.enabled); // 未更新的值保持不變
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該支持添加事件監聽器', async () => {
      const _listener = jest.fn();
      service.addEventListener('recommendationsGenerated', listener);

      const _request = {
        userId: 'user_123',
        limit: 5,
      };

      await service.getContentRecommendations(request);

      // 等待事件觸發
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalled();
    });

    it('應該支持移除事件監聽器', async () => {
      const _listener = jest.fn();
      service.addEventListener('recommendationsGenerated', listener);
      service.removeEventListener('recommendationsGenerated', listener);

      const _request = {
        userId: 'user_123',
        limit: 5,
      };

      await service.getContentRecommendations(request);

      // 等待事件觸發
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener).not.toHaveBeenCalled();
    });

    it('應該支持多個事件監聽器', async () => {
      const _listener1 = jest.fn();
      const _listener2 = jest.fn();

      service.addEventListener('recommendationsGenerated', listener1);
      service.addEventListener('recommendationsGenerated', listener2);

      const _request = {
        userId: 'user_123',
        limit: 5,
      };

      await service.getContentRecommendations(request);

      // 等待事件觸發
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該處理無效的用戶ID', async () => {
      const _request = {
        userId: '',
        limit: 10,
      };

      await expect(
        service.getContentRecommendations(request)
      ).rejects.toThrow();
    });

    it('應該處理無效的內容ID', async () => {
      await expect(service.getSimilarContent('')).rejects.toThrow();
    });

    it('應該處理無效的數量限制', async () => {
      const _request = {
        userId: 'user_123',
        limit: -1,
      };

      await expect(
        service.getContentRecommendations(request)
      ).rejects.toThrow();
    });
  });

  describe('Data Validation', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('推薦結果應該有正確的結構', async () => {
      const _request = {
        userId: 'user_123',
        limit: 5,
      };

      const _response = await service.getContentRecommendations(request);

      if (response.recommendations.length > 0) {
        const _recommendation = response.recommendations[0];

        expect(recommendation.id).toBeDefined();
        expect(recommendation.userId).toBe(request.userId);
        expect(recommendation.contentId).toBeDefined();
        expect(recommendation.score).toBeGreaterThanOrEqual(0);
        expect(recommendation.score).toBeLessThanOrEqual(1);
        expect(recommendation.reason).toBeDefined();
        expect(recommendation.algorithm).toBeDefined();
        expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
        expect(recommendation.confidence).toBeLessThanOrEqual(1);
        expect(recommendation.timestamp).toBeInstanceOf(Date);
        expect(recommendation.metadata).toBeDefined();
      }
    });

    it('相似內容結果應該有正確的結構', async () => {
      const _contentId = 'content_1';
      const _similarities = await service.getSimilarContent(contentId, 3);

      if (similarities.length > 0) {
        const _similarity = similarities[0];

        expect(similarity.sourceId).toBe(contentId);
        expect(similarity.targetId).toBeDefined();
        expect(similarity.similarityScore).toBeGreaterThanOrEqual(0);
        expect(similarity.similarityScore).toBeLessThanOrEqual(1);
        expect(similarity.similarityMethod).toBeDefined();
        expect(similarity.commonTags).toBeDefined();
        expect(Array.isArray(similarity.commonTags)).toBe(true);
        expect(similarity.commonCategories).toBeDefined();
        expect(Array.isArray(similarity.commonCategories)).toBe(true);
        expect(similarity.attributeSimilarity).toBeDefined();
      }
    });

    it('性能指標應該有正確的結構', async () => {
      const _request = {
        userId: 'user_123',
        limit: 5,
      };

      const _response = await service.getContentRecommendations(request);
      const _metrics = response.performanceMetrics;

      expect(metrics.accuracy).toBeGreaterThanOrEqual(0);
      expect(metrics.accuracy).toBeLessThanOrEqual(1);
      expect(metrics.precision).toBeGreaterThanOrEqual(0);
      expect(metrics.precision).toBeLessThanOrEqual(1);
      expect(metrics.recall).toBeGreaterThanOrEqual(0);
      expect(metrics.recall).toBeLessThanOrEqual(1);
      expect(metrics.f1Score).toBeGreaterThanOrEqual(0);
      expect(metrics.f1Score).toBeLessThanOrEqual(1);
      expect(metrics.diversity).toBeGreaterThanOrEqual(0);
      expect(metrics.diversity).toBeLessThanOrEqual(1);
      expect(metrics.novelty).toBeGreaterThanOrEqual(0);
      expect(metrics.novelty).toBeLessThanOrEqual(1);
      expect(metrics.coverage).toBeGreaterThanOrEqual(0);
      expect(metrics.coverage).toBeLessThanOrEqual(1);
      expect(metrics.clickThroughRate).toBeGreaterThanOrEqual(0);
      expect(metrics.clickThroughRate).toBeLessThanOrEqual(1);
      expect(metrics.conversionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該在合理時間內返回結果', async () => {
      const _startTime = Date.now();

      const _request = {
        userId: 'user_123',
        limit: 10,
      };

      await service.getContentRecommendations(request);

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      // 應該在1秒內完成
      expect(duration).toBeLessThan(1000);
    });

    it('應該支持並發請求', async () => {
      const _requests = Array.from({ length: 5 }, (_, i) => ({
        userId: `user_${i}`,
        limit: 5,
      }));

      const _startTime = Date.now();

      const _promises = requests.map(request =>
        service.getContentRecommendations(request)
      );

      await Promise.all(promises);

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      // 並發請求應該比順序請求快
      expect(duration).toBeLessThan(2000);
    });
  });
});
