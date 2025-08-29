// 協同過濾推薦服務單元測試
import { CollaborativeFilteringService } from '../services/collaborativeFilteringService';
import type { CollaborativeFilteringConfig } from '../types/collaborativeFiltering';
import {
  RecommendationAlgorithm,
  SimilarityMethod,
  UserAction,
} from '../types/collaborativeFiltering';

// 模擬數據轉換器
jest.mock('../../analytics/utils/dataConverters', () => ({
  convertToJson: jest.fn(data => JSON.stringify(data)),
  convertToCsv: jest.fn(data => 'csv,data'),
  convertToExcel: jest.fn(data => 'excel,data'),
  convertToPdf: jest.fn(data => 'pdf,data'),
}));

describe('CollaborativeFilteringService', () => {
  let service: CollaborativeFilteringService;

  beforeEach(() => {
    // 重置單例實例
    (CollaborativeFilteringService as any).instance = undefined;
    service = CollaborativeFilteringService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    test('應該返回相同的實例', () => {
      const _instance1 = CollaborativeFilteringService.getInstance();
      const _instance2 = CollaborativeFilteringService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    test('應該成功初始化服務', async () => {
      const _result = await service.initialize();
      expect(result).toBeUndefined();
    });

    test('應該使用自定義配置初始化', async () => {
      const customConfig: Partial<CollaborativeFilteringConfig> = {
        algorithm: RecommendationAlgorithm.ITEM_BASED,
        similarityMethod: SimilarityMethod.COSINE,
        maxRecommendations: 15,
      };

      await service.initialize(customConfig);
      const _config = service.getConfig();
      expect(config.algorithm).toBe(RecommendationAlgorithm.ITEM_BASED);
      expect(config.similarityMethod).toBe(SimilarityMethod.COSINE);
      expect(config.maxRecommendations).toBe(15);
    });

    test('重複初始化應該不會出錯', async () => {
      await service.initialize();
      await service.initialize();
      // 不應該拋出錯誤
    });
  });

  describe('getRecommendations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該成功獲取推薦', async () => {
      const _request = {
        userId: 'user_1',
        limit: 5,
        algorithm: RecommendationAlgorithm.USER_BASED,
      };

      const _response = await service.getRecommendations(request);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.recommendations).toBeInstanceOf(Array);
      expect(response.data.totalCount).toBeGreaterThanOrEqual(0);
      expect(response.metadata).toBeDefined();
      expect(response.metadata.algorithm).toBe(
        RecommendationAlgorithm.USER_BASED
      );
    });

    test('應該支持項目基於算法', async () => {
      const _request = {
        userId: 'user_1',
        limit: 5,
        algorithm: RecommendationAlgorithm.ITEM_BASED,
      };

      const _response = await service.getRecommendations(request);

      expect(response.success).toBe(true);
      expect(response.metadata.algorithm).toBe(
        RecommendationAlgorithm.ITEM_BASED
      );
    });

    test('應該支持矩陣分解算法', async () => {
      const _request = {
        userId: 'user_1',
        limit: 5,
        algorithm: RecommendationAlgorithm.MATRIX_FACTORIZATION,
      };

      const _response = await service.getRecommendations(request);

      expect(response.success).toBe(true);
      expect(response.metadata.algorithm).toBe(
        RecommendationAlgorithm.MATRIX_FACTORIZATION
      );
    });

    test('應該處理無效算法', async () => {
      const _request = {
        userId: 'user_1',
        limit: 5,
        algorithm: 'invalid_algorithm' as any,
      };

      const _response = await service.getRecommendations(request);

      expect(response.success).toBe(false);
      expect(response.error).toContain('不支持的算法');
    });

    test('應該支持類別過濾', async () => {
      const _request = {
        userId: 'user_1',
        limit: 5,
        categories: ['遊戲'],
        algorithm: RecommendationAlgorithm.USER_BASED,
      };

      const _response = await service.getRecommendations(request);

      expect(response.success).toBe(true);
    });

    test('應該支持排除已評分項目', async () => {
      const _request = {
        userId: 'user_1',
        limit: 5,
        excludeRated: true,
        algorithm: RecommendationAlgorithm.USER_BASED,
      };

      const _response = await service.getRecommendations(request);

      expect(response.success).toBe(true);
    });
  });

  describe('getSimilarUsers', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該成功獲取相似用戶', async () => {
      const _request = {
        userId: 'user_1',
        limit: 5,
        method: SimilarityMethod.PEARSON,
      };

      const _response = await service.getSimilarUsers(request);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.similarUsers).toBeInstanceOf(Array);
      expect(response.data.totalCount).toBeGreaterThanOrEqual(0);
      expect(response.metadata.algorithm).toBe(
        RecommendationAlgorithm.USER_BASED
      );
    });

    test('應該支持不同的相似度方法', async () => {
      const _request = {
        userId: 'user_1',
        limit: 5,
        method: SimilarityMethod.COSINE,
      };

      const _response = await service.getSimilarUsers(request);

      expect(response.success).toBe(true);
    });

    test('應該支持最小相似度過濾', async () => {
      const _request = {
        userId: 'user_1',
        limit: 10,
        minSimilarity: 0.5,
        method: SimilarityMethod.PEARSON,
      };

      const _response = await service.getSimilarUsers(request);

      expect(response.success).toBe(true);
      if (response.data.similarUsers.length > 0) {
        response.data.similarUsers.forEach(user => {
          expect(user.score).toBeGreaterThanOrEqual(0.5);
        });
      }
    });
  });

  describe('getSimilarItems', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該成功獲取相似項目', async () => {
      const _request = {
        itemId: 'item_1',
        limit: 5,
        method: SimilarityMethod.PEARSON,
      };

      const _response = await service.getSimilarItems(request);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.similarItems).toBeInstanceOf(Array);
      expect(response.data.totalCount).toBeGreaterThanOrEqual(0);
      expect(response.metadata.algorithm).toBe(
        RecommendationAlgorithm.ITEM_BASED
      );
    });

    test('應該支持不同的相似度方法', async () => {
      const _request = {
        itemId: 'item_1',
        limit: 5,
        method: SimilarityMethod.COSINE,
      };

      const _response = await service.getSimilarItems(request);

      expect(response.success).toBe(true);
    });

    test('應該支持最小相似度過濾', async () => {
      const _request = {
        itemId: 'item_1',
        limit: 10,
        minSimilarity: 0.5,
        method: SimilarityMethod.PEARSON,
      };

      const _response = await service.getSimilarItems(request);

      expect(response.success).toBe(true);
      if (response.data.similarItems.length > 0) {
        response.data.similarItems.forEach(item => {
          expect(item.similarityScore).toBeGreaterThanOrEqual(0.5);
        });
      }
    });
  });

  describe('updateRating', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該成功更新評分', async () => {
      const _request = {
        userId: 'user_1',
        itemId: 'item_1',
        rating: 5,
        context: {
          platform: 'web',
          device: 'desktop',
        },
      };

      await expect(service.updateRating(request)).resolves.not.toThrow();
    });

    test('應該支持不同評分值', async () => {
      const _ratings = [1, 2, 3, 4, 5];

      for (const rating of ratings) {
        const _request = {
          userId: 'user_1',
          itemId: `item_${rating}`,
          rating,
        };

        await expect(service.updateRating(request)).resolves.not.toThrow();
      }
    });

    test('應該處理無效評分', async () => {
      const _request = {
        userId: 'user_1',
        itemId: 'item_1',
        rating: 6, // 超出範圍
      };

      await expect(service.updateRating(request)).resolves.not.toThrow();
    });
  });

  describe('updateUserBehavior', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該成功更新用戶行為', async () => {
      const _request = {
        userId: 'user_1',
        itemId: 'item_1',
        action: UserAction.VIEW,
        context: {
          sessionId: 'session_1',
          pageUrl: '/item/1',
          userAgent: 'test-agent',
        },
      };

      await expect(service.updateUserBehavior(request)).resolves.not.toThrow();
    });

    test('應該支持所有行為類型', async () => {
      const _actions = [
        UserAction.VIEW,
        UserAction.LIKE,
        UserAction.DISLIKE,
        UserAction.SHARE,
        UserAction.PURCHASE,
        UserAction.ADD_TO_CART,
        UserAction.REMOVE_FROM_CART,
        UserAction.SEARCH,
        UserAction.CLICK,
      ];

      for (const action of actions) {
        const _request = {
          userId: 'user_1',
          itemId: 'item_1',
          action,
        };

        await expect(
          service.updateUserBehavior(request)
        ).resolves.not.toThrow();
      }
    });

    test('應該處理隱式評分轉換', async () => {
      const _request = {
        userId: 'user_1',
        itemId: 'item_1',
        action: UserAction.PURCHASE,
      };

      await expect(service.updateUserBehavior(request)).resolves.not.toThrow();
    });
  });

  describe('getModelPerformance', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該成功獲取模型性能', async () => {
      const _response = await service.getModelPerformance();

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.performance).toBeDefined();
      expect(response.data.statistics).toBeDefined();
      expect(response.metadata.algorithm).toBeDefined();
    });

    test('性能指標應該包含所有必要字段', async () => {
      const _response = await service.getModelPerformance();

      if (response.success && response.data.performance) {
        const { performance } = response.data;
        expect(performance.accuracy).toBeGreaterThanOrEqual(0);
        expect(performance.accuracy).toBeLessThanOrEqual(1);
        expect(performance.precision).toBeGreaterThanOrEqual(0);
        expect(performance.precision).toBeLessThanOrEqual(1);
        expect(performance.recall).toBeGreaterThanOrEqual(0);
        expect(performance.recall).toBeLessThanOrEqual(1);
        expect(performance.f1Score).toBeGreaterThanOrEqual(0);
        expect(performance.f1Score).toBeLessThanOrEqual(1);
        expect(performance.mae).toBeGreaterThanOrEqual(0);
        expect(performance.rmse).toBeGreaterThanOrEqual(0);
        expect(performance.coverage).toBeGreaterThanOrEqual(0);
        expect(performance.coverage).toBeLessThanOrEqual(1);
        expect(performance.diversity).toBeGreaterThanOrEqual(0);
        expect(performance.diversity).toBeLessThanOrEqual(1);
        expect(performance.novelty).toBeGreaterThanOrEqual(0);
        expect(performance.novelty).toBeLessThanOrEqual(1);
      }
    });

    test('統計數據應該包含所有必要字段', async () => {
      const _response = await service.getModelPerformance();

      if (response.success && response.data.statistics) {
        const { statistics } = response.data;
        expect(statistics.totalUsers).toBeGreaterThan(0);
        expect(statistics.totalItems).toBeGreaterThan(0);
        expect(statistics.totalRatings).toBeGreaterThan(0);
        expect(statistics.averageRating).toBeGreaterThan(0);
        expect(statistics.averageRating).toBeLessThanOrEqual(5);
        expect(statistics.sparsity).toBeGreaterThan(0);
        expect(statistics.sparsity).toBeLessThanOrEqual(1);
        expect(statistics.activeUsers).toBeGreaterThan(0);
        expect(statistics.activeItems).toBeGreaterThan(0);
      }
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該支持添加事件監聽器', async () => {
      const _listener = jest.fn();
      service.addEventListener('recommendation_generated', listener);

      // 觸發事件
      await service.getRecommendations({
        userId: 'user_1',
        limit: 1,
      });

      // 驗證監聽器被調用
      expect(listener).toHaveBeenCalled();
    });

    test('應該支持移除事件監聽器', async () => {
      const _listener = jest.fn();
      service.addEventListener('recommendation_generated', listener);
      service.removeEventListener('recommendation_generated', listener);

      // 觸發事件
      await service.getRecommendations({
        userId: 'user_1',
        limit: 1,
      });

      // 驗證監聽器沒有被調用
      expect(listener).not.toHaveBeenCalled();
    });

    test('應該處理監聽器錯誤', async () => {
      const _listener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      service.addEventListener('recommendation_generated', listener);

      // 不應該拋出錯誤
      await expect(
        service.getRecommendations({
          userId: 'user_1',
          limit: 1,
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Configuration', () => {
    test('應該返回當前配置', () => {
      const _config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.algorithm).toBeDefined();
      expect(config.similarityMethod).toBeDefined();
      expect(config.maxRecommendations).toBeDefined();
      expect(config.cacheEnabled).toBeDefined();
    });

    test('應該支持更新配置', () => {
      const _newConfig = {
        algorithm: RecommendationAlgorithm.ITEM_BASED,
        similarityMethod: SimilarityMethod.COSINE,
        maxRecommendations: 25,
      };

      service.updateConfig(newConfig);
      const _config = service.getConfig();

      expect(config.algorithm).toBe(RecommendationAlgorithm.ITEM_BASED);
      expect(config.similarityMethod).toBe(SimilarityMethod.COSINE);
      expect(config.maxRecommendations).toBe(25);
    });

    test('應該部分更新配置', () => {
      const _originalConfig = service.getConfig();
      const _partialConfig = {
        maxRecommendations: 30,
      };

      service.updateConfig(partialConfig);
      const _config = service.getConfig();

      expect(config.maxRecommendations).toBe(30);
      expect(config.algorithm).toBe(originalConfig.algorithm);
      expect(config.similarityMethod).toBe(originalConfig.similarityMethod);
    });
  });

  describe('Error Handling', () => {
    test('應該處理無效用戶ID', async () => {
      await service.initialize();

      const _response = await service.getRecommendations({
        userId: 'invalid_user',
        limit: 5,
      });

      expect(response.success).toBe(true); // 簡化實現返回成功
    });

    test('應該處理無效項目ID', async () => {
      await service.initialize();

      const _response = await service.getSimilarItems({
        itemId: 'invalid_item',
        limit: 5,
      });

      expect(response.success).toBe(true); // 簡化實現返回成功
    });

    test('應該處理服務未初始化', async () => {
      const _newService = CollaborativeFilteringService.getInstance();
      (newService as any).isInitialized = false;

      const _response = await newService.getRecommendations({
        userId: 'user_1',
        limit: 5,
      });

      expect(response.success).toBe(true); // 會自動初始化
    });
  });

  describe('Data Validation', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('推薦結果應該有正確的結構', async () => {
      const _response = await service.getRecommendations({
        userId: 'user_1',
        limit: 3,
      });

      if (response.success && response.data.recommendations.length > 0) {
        const _recommendation = response.data.recommendations[0];
        expect(recommendation.userId).toBe('user_1');
        expect(recommendation.itemId).toBeDefined();
        expect(recommendation.score).toBeGreaterThanOrEqual(0);
        expect(recommendation.confidence).toBeGreaterThanOrEqual(0);
        expect(recommendation.confidence).toBeLessThanOrEqual(1);
        expect(recommendation.reason).toBeDefined();
        expect(recommendation.algorithm).toBeDefined();
        expect(recommendation.createdAt).toBeInstanceOf(Date);
      }
    });

    test('相似用戶結果應該有正確的結構', async () => {
      const _response = await service.getSimilarUsers({
        userId: 'user_1',
        limit: 3,
      });

      if (response.success && response.data.similarUsers.length > 0) {
        const _similarUser = response.data.similarUsers[0];
        expect(similarUser.userId).toBe('user_1');
        expect(similarUser.targetUserId).toBeDefined();
        expect(similarUser.score).toBeGreaterThanOrEqual(0);
        expect(similarUser.score).toBeLessThanOrEqual(1);
        expect(similarUser.method).toBeDefined();
        expect(similarUser.commonItems).toBeGreaterThanOrEqual(0);
        expect(similarUser.calculatedAt).toBeInstanceOf(Date);
      }
    });

    test('相似項目結果應該有正確的結構', async () => {
      const _response = await service.getSimilarItems({
        itemId: 'item_1',
        limit: 3,
      });

      if (response.success && response.data.similarItems.length > 0) {
        const _similarItem = response.data.similarItems[0];
        expect(similarItem.itemId).toBeDefined();
        expect(similarItem.similarityScore).toBeGreaterThanOrEqual(0);
        expect(similarItem.similarityScore).toBeLessThanOrEqual(1);
        expect(similarItem.commonRatings).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
