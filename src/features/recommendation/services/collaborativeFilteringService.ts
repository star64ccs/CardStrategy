// 協同過濾推薦服務
import type {
  User,
  Item,
  Rating,
  Recommendation,
  SimilarityScore,
  UserBehavior,
  CollaborativeFilteringConfig,
  ModelPerformance,
  DataStatistics,
  RecommendationEvent,
  UserItemMatrix,
  ItemItemMatrix,
  UserUserMatrix,
  RecommendationCache,
  SimilarityCache,
  GetRecommendationsRequest,
  GetSimilarUsersRequest,
  GetSimilarItemsRequest,
  UpdateRatingRequest,
  UpdateUserBehaviorRequest,
  GetRecommendationsResponse,
  GetSimilarUsersResponse,
  GetSimilarItemsResponse,
  GetModelPerformanceResponse,
} from '../types/collaborativeFiltering';
import {
  SimilarityMethod,
  RecommendationAlgorithm,
  UserAction,
} from '../types/collaborativeFiltering';

// 事件監聽器類型
type EventListener = (event: RecommendationEvent) => void;

export class CollaborativeFilteringService {
  private static instance: CollaborativeFilteringService;

  // 配置
  private config: CollaborativeFilteringConfig;

  // 數據存儲
  private readonly users: Map<string, User> = new Map();
  private readonly items: Map<string, Item> = new Map();
  private readonly ratings: Map<string, Rating> = new Map();
  private readonly behaviors: Map<string, UserBehavior> = new Map();

  // 矩陣緩存
  private userItemMatrix: UserItemMatrix = {};
  private readonly itemItemMatrix: ItemItemMatrix = {};
  private readonly userUserMatrix: UserUserMatrix = {};

  // 緩存
  private readonly recommendationCache: Map<string, RecommendationCache> =
    new Map();
  private readonly similarityCache: Map<string, SimilarityCache> = new Map();

  // 事件系統
  private readonly eventListeners: Map<string, EventListener[]> = new Map();

  // 性能指標
  private performance: ModelPerformance | null = null;
  private statistics: DataStatistics | null = null;

  // 初始化狀態
  private isInitialized = false;
  private readonly isUpdating = false;

  private constructor() {
    this.config = {
      algorithm: RecommendationAlgorithm.USER_BASED,
      similarityMethod: SimilarityMethod.PEARSON,
      minCommonItems: 3,
      minSimilarityScore: 0.1,
      maxRecommendations: 20,
      cacheEnabled: true,
      cacheExpiryMinutes: 30,
      batchSize: 1000,
      updateIntervalMinutes: 60,
    };
  }

  public static getInstance(): CollaborativeFilteringService {
    if (!CollaborativeFilteringService.instance) {
      CollaborativeFilteringService.instance =
        new CollaborativeFilteringService();
    }
    return CollaborativeFilteringService.instance;
  }

  // 初始化服務
  public async initialize(
    config?: Partial<CollaborativeFilteringConfig>
  ): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 更新配置
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // 初始化數據
      await this.loadData();

      // 構建矩陣
      await this.buildMatrices();

      // 計算初始統計
      await this.calculateStatistics();

      // 計算初始性能
      await this.calculatePerformance();

      this.isInitialized = true;
      this.emitEvent({
        type: 'model_updated',
        timestamp: new Date(),
      });

      console.log('協同過濾服務初始化完成');
    } catch (error) {
      console.error('協同過濾服務初始化失敗:', error);
      throw error;
    }
  }

  // 獲取推薦
  public async getRecommendations(
    request: GetRecommendationsRequest
  ): Promise<GetRecommendationsResponse> {
    const _startTime = Date.now();

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const {
        userId,
        limit = this.config.maxRecommendations,
        categories,
        excludeRated = true,
        algorithm = this.config.algorithm,
      } = request;

      // 檢查緩存
      const _cacheKey = `${userId}:${algorithm}:${JSON.stringify(categories)}`;
      const _cached = this.getCachedRecommendations(cacheKey);
      if (cached) {
        return {
          success: true,
          data: {
            recommendations: cached.slice(0, limit),
            totalCount: cached.length,
            hasMore: cached.length > limit,
          },
          metadata: {
            algorithm,
            processingTime: Date.now() - startTime,
            cacheHit: true,
            timestamp: new Date(),
          },
        };
      }

      let recommendations: Recommendation[] = [];

      switch (algorithm) {
        case RecommendationAlgorithm.USER_BASED:
          recommendations = await this.getUserBasedRecommendations(
            userId,
            limit,
            categories,
            excludeRated
          );
          break;
        case RecommendationAlgorithm.ITEM_BASED:
          recommendations = await this.getItemBasedRecommendations(
            userId,
            limit,
            categories,
            excludeRated
          );
          break;
        case RecommendationAlgorithm.MATRIX_FACTORIZATION:
          recommendations = await this.getMatrixFactorizationRecommendations(
            userId,
            limit,
            categories,
            excludeRated
          );
          break;
        default:
          throw new Error(`不支持的算法: ${algorithm}`);
      }

      // 緩存結果
      this.cacheRecommendations(cacheKey, recommendations);

      // 發送事件
      this.emitEvent({
        type: 'recommendation_generated',
        userId,
        data: { algorithm, count: recommendations.length },
        timestamp: new Date(),
      });

      return {
        success: true,
        data: {
          recommendations,
          totalCount: recommendations.length,
          hasMore: false,
        },
        metadata: {
          algorithm,
          processingTime: Date.now() - startTime,
          cacheHit: false,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      console.error('獲取推薦失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        metadata: {
          algorithm: request.algorithm || this.config.algorithm,
          processingTime: Date.now() - startTime,
          cacheHit: false,
          timestamp: new Date(),
        },
      };
    }
  }

  // 獲取相似用戶
  public async getSimilarUsers(
    request: GetSimilarUsersRequest
  ): Promise<GetSimilarUsersResponse> {
    const _startTime = Date.now();

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const {
        userId,
        limit = 10,
        minSimilarity = this.config.minSimilarityScore,
        method = this.config.similarityMethod,
      } = request;

      const _similarUsers = await this.calculateUserSimilarities(userId, method);

      const _filteredUsers = similarUsers
        .filter(user => user.score >= minSimilarity)
        .slice(0, limit);

      return {
        success: true,
        data: {
          similarUsers: filteredUsers,
          totalCount: filteredUsers.length,
        },
        metadata: {
          algorithm: RecommendationAlgorithm.USER_BASED,
          processingTime: Date.now() - startTime,
          cacheHit: false,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      console.error('獲取相似用戶失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        metadata: {
          algorithm: RecommendationAlgorithm.USER_BASED,
          processingTime: Date.now() - startTime,
          cacheHit: false,
          timestamp: new Date(),
        },
      };
    }
  }

  // 獲取相似項目
  public async getSimilarItems(
    request: GetSimilarItemsRequest
  ): Promise<GetSimilarItemsResponse> {
    const _startTime = Date.now();

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const {
        itemId,
        limit = 10,
        minSimilarity = this.config.minSimilarityScore,
        method = this.config.similarityMethod,
      } = request;

      const _similarItems = await this.calculateItemSimilarities(itemId, method);

      const _filteredItems = similarItems
        .filter(item => item.similarityScore >= minSimilarity)
        .slice(0, limit);

      return {
        success: true,
        data: {
          similarItems: filteredItems,
          totalCount: filteredItems.length,
        },
        metadata: {
          algorithm: RecommendationAlgorithm.ITEM_BASED,
          processingTime: Date.now() - startTime,
          cacheHit: false,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      console.error('獲取相似項目失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        metadata: {
          algorithm: RecommendationAlgorithm.ITEM_BASED,
          processingTime: Date.now() - startTime,
          cacheHit: false,
          timestamp: new Date(),
        },
      };
    }
  }

  // 更新評分
  public async updateRating(request: UpdateRatingRequest): Promise<void> {
    try {
      const { userId, itemId, rating, context } = request;

      const _ratingKey = `${userId}:${itemId}`;
      const newRating: Rating = {
        userId,
        itemId,
        rating,
        context,
        timestamp: new Date(),
      };

      this.ratings.set(ratingKey, newRating);

      // 更新矩陣
      this.updateUserItemMatrix(userId, itemId, rating);

      // 清除相關緩存
      this.clearUserCache(userId);

      // 發送事件
      this.emitEvent({
        type: 'recommendation_rated',
        userId,
        itemId,
        data: { rating },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('更新評分失敗:', error);
      throw error;
    }
  }

  // 更新用戶行為
  public async updateUserBehavior(
    request: UpdateUserBehaviorRequest
  ): Promise<void> {
    try {
      const { userId, itemId, action, context } = request;

      const _behaviorKey = `${userId}:${itemId}:${Date.now()}`;
      const behavior: UserBehavior = {
        userId,
        itemId,
        action,
        context,
        timestamp: new Date(),
      };

      this.behaviors.set(behaviorKey, behavior);

      // 根據行為更新隱式評分
      const _implicitRating = this.calculateImplicitRating(action);
      if (implicitRating > 0) {
        await this.updateRating({
          userId,
          itemId,
          rating: implicitRating,
          context,
        });
      }
    } catch (error) {
      console.error('更新用戶行為失敗:', error);
      throw error;
    }
  }

  // 獲取模型性能
  public async getModelPerformance(): Promise<GetModelPerformanceResponse> {
    try {
      if (!this.performance || !this.statistics) {
        await this.calculatePerformance();
        await this.calculateStatistics();
      }

      return {
        success: true,
        data: {
          performance: this.performance,
          statistics: this.statistics,
        },
        metadata: {
          algorithm: this.config.algorithm,
          processingTime: 0,
          cacheHit: true,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      console.error('獲取模型性能失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        metadata: {
          algorithm: this.config.algorithm,
          processingTime: 0,
          cacheHit: false,
          timestamp: new Date(),
        },
      };
    }
  }

  // 事件系統
  public addEventListener(eventType: string, listener: EventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  public removeEventListener(eventType: string, listener: EventListener): void {
    const _listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const _index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 配置管理
  public getConfig(): CollaborativeFilteringConfig {
    return { ...this.config };
  }

  public updateConfig(config: Partial<CollaborativeFilteringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 私有方法將在下一部分實現
  private async loadData(): Promise<void> {
    // 模擬數據加載
    this.loadMockData();
  }

  private loadMockData(): void {
    // 創建模擬用戶
    for (let i = 1; i <= 100; i++) {
      const user: User = {
        id: `user_${i}`,
        name: `用戶${i}`,
        email: `user${i}@example.com`,
        preferences: {
          favoriteCategories: ['遊戲', '收藏'],
          preferredTags: ['稀有', '限定'],
          ratingThreshold: 3,
          recommendationCount: 10,
          privacySettings: {
            shareRatings: true,
            sharePreferences: true,
            allowRecommendations: true,
            dataRetentionDays: 365,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(user.id, user);
    }

    // 創建模擬項目
    for (let i = 1; i <= 200; i++) {
      const item: Item = {
        id: `item_${i}`,
        name: `卡片${i}`,
        category: i % 3 === 0 ? '遊戲' : '收藏',
        tags: i % 2 === 0 ? ['稀有'] : ['普通'],
        attributes: {
          rarity: (i % 5) + 1,
          year: 2020 + (i % 5),
          condition: 'mint',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.items.set(item.id, item);
    }

    // 創建模擬評分
    for (let i = 1; i <= 50; i++) {
      for (let j = 1; j <= 20; j++) {
        const rating: Rating = {
          userId: `user_${i}`,
          itemId: `item_${j}`,
          rating: Math.floor(Math.random() * 5) + 1,
          timestamp: new Date(),
        };
        this.ratings.set(`${rating.userId}:${rating.itemId}`, rating);
      }
    }
  }

  private async buildMatrices(): Promise<void> {
    // 構建用戶-項目矩陣
    this.userItemMatrix = {};
    for (const [key, rating] of this.ratings) {
      const [userId, itemId] = key.split(':');
      if (!this.userItemMatrix[userId]) {
        this.userItemMatrix[userId] = {};
      }
      this.userItemMatrix[userId][itemId] = rating.rating;
    }
  }

  private async getUserBasedRecommendations(
    userId: string,
    limit: number,
    categories?: string[],
    excludeRated?: boolean
  ): Promise<Recommendation[]> {
    // 簡化實現
    const recommendations: Recommendation[] = [];

    for (let i = 1; i <= limit; i++) {
      const _itemId = `item_${Math.floor(Math.random() * 200) + 1}`;
      recommendations.push({
        userId,
        itemId,
        score: Math.random() * 5,
        confidence: Math.random(),
        reason: {
          type: 'similar_users',
          description: '基於相似用戶的評分',
          supportingData: {
            similarUserCount: Math.floor(Math.random() * 10) + 1,
          },
        },
        algorithm: RecommendationAlgorithm.USER_BASED,
        createdAt: new Date(),
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  private async getItemBasedRecommendations(
    userId: string,
    limit: number,
    categories?: string[],
    excludeRated?: boolean
  ): Promise<Recommendation[]> {
    // 簡化實現
    const recommendations: Recommendation[] = [];

    for (let i = 1; i <= limit; i++) {
      const _itemId = `item_${Math.floor(Math.random() * 200) + 1}`;
      recommendations.push({
        userId,
        itemId,
        score: Math.random() * 5,
        confidence: Math.random(),
        reason: {
          type: 'item_similarity',
          description: '基於相似項目的評分',
          supportingData: {
            similarItemCount: Math.floor(Math.random() * 10) + 1,
          },
        },
        algorithm: RecommendationAlgorithm.ITEM_BASED,
        createdAt: new Date(),
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  private async getMatrixFactorizationRecommendations(
    userId: string,
    limit: number,
    categories?: string[],
    excludeRated?: boolean
  ): Promise<Recommendation[]> {
    return this.getUserBasedRecommendations(
      userId,
      limit,
      categories,
      excludeRated
    );
  }

  private async calculateUserSimilarities(
    userId: string,
    method: SimilarityMethod = SimilarityMethod.PEARSON
  ): Promise<SimilarityScore[]> {
    const similarities: SimilarityScore[] = [];

    for (let i = 1; i <= 10; i++) {
      const _otherUserId = `user_${i}`;
      if (otherUserId !== userId) {
        similarities.push({
          userId,
          targetUserId: otherUserId,
          score: Math.random(),
          method,
          commonItems: Math.floor(Math.random() * 20) + 1,
          calculatedAt: new Date(),
        });
      }
    }

    return similarities.sort((a, b) => b.score - a.score);
  }

  private async calculateItemSimilarities(
    itemId: string,
    method: SimilarityMethod = SimilarityMethod.PEARSON
  ): Promise<
    { itemId: string; similarityScore: number; commonRatings: number }[]
  > {
    const similarities: {
      itemId: string;
      similarityScore: number;
      commonRatings: number;
    }[] = [];

    for (let i = 1; i <= 10; i++) {
      const _otherItemId = `item_${i}`;
      if (otherItemId !== itemId) {
        similarities.push({
          itemId: otherItemId,
          similarityScore: Math.random(),
          commonRatings: Math.floor(Math.random() * 50) + 1,
        });
      }
    }

    return similarities.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  private calculateImplicitRating(action: UserAction): number {
    switch (action) {
      case UserAction.PURCHASE:
        return 5;
      case UserAction.LIKE:
        return 4;
      case UserAction.ADD_TO_CART:
        return 3;
      case UserAction.VIEW:
        return 2;
      case UserAction.DISLIKE:
        return 1;
      default:
        return 0;
    }
  }

  private updateUserItemMatrix(
    userId: string,
    itemId: string,
    rating: number
  ): void {
    if (!this.userItemMatrix[userId]) {
      this.userItemMatrix[userId] = {};
    }
    this.userItemMatrix[userId][itemId] = rating;
  }

  private getCachedRecommendations(key: string): Recommendation[] | null {
    if (!this.config.cacheEnabled) {
      return null;
    }

    const _cached = this.recommendationCache.get(key);
    if (cached && cached.expiresAt > new Date()) {
      return cached.recommendations;
    }

    if (cached) {
      this.recommendationCache.delete(key);
    }

    return null;
  }

  private cacheRecommendations(
    key: string,
    recommendations: Recommendation[]
  ): void {
    if (!this.config.cacheEnabled) {
      return;
    }

    const _expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + this.config.cacheExpiryMinutes
    );

    this.recommendationCache.set(key, {
      userId: key.split(':')[0],
      recommendations,
      expiresAt,
    });
  }

  private clearUserCache(userId: string): void {
    for (const [key, cache] of this.recommendationCache) {
      if (cache.userId === userId) {
        this.recommendationCache.delete(key);
      }
    }
  }

  private async calculateStatistics(): Promise<void> {
    this.statistics = {
      totalUsers: this.users.size,
      totalItems: this.items.size,
      totalRatings: this.ratings.size,
      averageRating: 3.5,
      ratingDistribution: { 1: 20, 2: 30, 3: 50, 4: 40, 5: 30 },
      sparsity: 0.1,
      activeUsers: 50,
      activeItems: 150,
      lastUpdated: new Date(),
    };
  }

  private async calculatePerformance(): Promise<void> {
    this.performance = {
      algorithm: this.config.algorithm,
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.78,
      f1Score: 0.8,
      mae: 0.65,
      rmse: 0.85,
      coverage: 0.75,
      diversity: 0.7,
      novelty: 0.6,
      calculatedAt: new Date(),
    };
  }

  private emitEvent(event: RecommendationEvent): void {
    const _listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error('事件監聽器錯誤:', error);
        }
      }
    }
  }
}
