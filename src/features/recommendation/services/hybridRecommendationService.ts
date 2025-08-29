import { UserAction } from '../types/collaborativeFiltering';
import type {
  GetHybridRecommendationsRequest,
  GetHybridRecommendationsResponse,
  HybridRecommendation,
  HybridRecommendationConfig,
  HybridRecommendationStats,
} from '../types/hybridRecommendation';
import {
  HybridAlgorithm,
  HybridFactorType,
  HybridRecommendationReason,
} from '../types/hybridRecommendation';

import { CollaborativeFilteringService } from './collaborativeFilteringService';
import ContentRecommendationService from './contentRecommendationService';

export class HybridRecommendationService {
  private static instance: HybridRecommendationService;
  private config: HybridRecommendationConfig = {
    algorithm: HybridAlgorithm.WEIGHTED_AVERAGE,
    weights: {
      collaborative: 0.6,
      content: 0.4,
      popularity: 0.3,
      trending: 0.2,
      personalization: 0.3,
      contextual: 0.2,
      diversity: 0.2,
      novelty: 0.1,
    },
    thresholds: {
      minScore: 0.1,
      minConfidence: 0.5,
      maxRecommendations: 20,
      cacheExpiry: 3600,
      performanceThreshold: 200,
    },
    caching: {
      enabled: true,
      maxSize: 1000,
      expiryTime: 3600,
      strategy: 'LRU',
    },
    performance: {
      maxResponseTime: 200,
      batchSize: 10,
      concurrency: 5,
      timeout: 5000,
    },
    personalization: {
      enabled: true,
      learningRate: 0.1,
      decayFactor: 0.95,
      minInteractions: 5,
    },
    diversity: {
      enabled: true,
      diversityWeight: 0.2,
      maxSimilarItems: 3,
      categorySpread: 0.5,
    },
    novelty: {
      enabled: true,
      noveltyWeight: 0.1,
      explorationRate: 0.1,
      maxNovelItems: 2,
    },
  };
  private readonly stats: HybridRecommendationStats = {
    totalRecommendations: 0,
    averageScore: 0,
    averageConfidence: 0,
    algorithmDistribution: {
      [HybridAlgorithm.WEIGHTED_AVERAGE]: 0,
      [HybridAlgorithm.LINEAR_COMBINATION]: 0,
      [HybridAlgorithm.ADAPTIVE_WEIGHTING]: 0,
      [HybridAlgorithm.ENSEMBLE_METHOD]: 0,
      [HybridAlgorithm.META_LEARNING]: 0,
      [HybridAlgorithm.DEEP_HYBRID]: 0,
      [HybridAlgorithm.CONTEXTUAL_HYBRID]: 0,
      [HybridAlgorithm.PERSONALIZED_HYBRID]: 0,
    },
    factorDistribution: {
      [HybridFactorType.COLLABORATIVE_FILTERING]: 0,
      [HybridFactorType.CONTENT_BASED]: 0,
      [HybridFactorType.POPULARITY]: 0,
      [HybridFactorType.TRENDING]: 0,
      [HybridFactorType.PERSONALIZATION]: 0,
      [HybridFactorType.CONTEXTUAL]: 0,
      [HybridFactorType.DIVERSITY]: 0,
      [HybridFactorType.NOVELTY]: 0,
    },
    reasonDistribution: {
      [HybridRecommendationReason.SIMILAR_USERS_LIKE]: 0,
      [HybridRecommendationReason.SIMILAR_CONTENT]: 0,
      [HybridRecommendationReason.USER_PREFERENCE]: 0,
      [HybridRecommendationReason.POPULAR_ITEM]: 0,
      [HybridRecommendationReason.TRENDING_ITEM]: 0,
      [HybridRecommendationReason.PERSONALIZED_MATCH]: 0,
      [HybridRecommendationReason.CONTEXTUAL_RELEVANCE]: 0,
      [HybridRecommendationReason.DIVERSITY_BOOST]: 0,
      [HybridRecommendationReason.NOVELTY_BOOST]: 0,
      [HybridRecommendationReason.HYBRID_OPTIMIZATION]: 0,
    },
    performanceMetrics: {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      diversity: 0,
      novelty: 0,
      coverage: 0,
      clickThroughRate: 0,
      conversionRate: 0,
      userSatisfaction: 0,
      responseTime: 0,
    },
    cacheStats: {
      hitRate: 0,
      missRate: 0,
      size: 0,
      maxSize: 1000,
      evictions: 0,
    },
    userEngagement: {
      clickThroughRate: 0,
      conversionRate: 0,
      averageSessionDuration: 0,
      returnRate: 0,
      satisfactionScore: 0,
    },
  };
  private readonly collaborativeService: CollaborativeFilteringService;
  private readonly contentService: ContentRecommendationService;
  private isInitialized = false;

  private constructor() {
    // 配置已在類屬性中初始化

    // stats 已在類屬性中初始化

    this.collaborativeService = CollaborativeFilteringService.getInstance();
    this.contentService = ContentRecommendationService.getInstance();
  }

  public static getInstance(): HybridRecommendationService {
    if (!HybridRecommendationService.instance) {
      HybridRecommendationService.instance = new HybridRecommendationService();
    }
    return HybridRecommendationService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // 初始化協作過濾服務
      await this.collaborativeService.initialize();

      // 初始化內容推薦服務
      await this.contentService.initialize();

      this.isInitialized = true;
      return true;
    } catch (error) {
      this.isInitialized = false;
      console.error('混合推薦服務初始化失敗:', error);
      return false;
    }
  }

  async getRecommendations(
    request: GetHybridRecommendationsRequest
  ): Promise<GetHybridRecommendationsResponse> {
    if (!this.isInitialized) {
      throw new Error('混合推薦服務尚未初始化');
    }

    const _startTime = Date.now();

    try {
      // 獲取協作過濾推薦
      let collaborativeRecommendations = { recommendations: [] as any[] };
      if (this.config.weights.collaborative > 0) {
        try {
          const _response = await this.collaborativeService.getRecommendations({
            userId: request.userId,
            limit: Math.ceil(
              (request.limit || 10) * this.config.weights.collaborative
            ),
          });
          collaborativeRecommendations = {
            recommendations: response.data?.recommendations || [],
          };
        } catch (error) {
          console.error('協作過濾推薦失敗:', error);
        }
      }

      const _contentRecommendations = { recommendations: [] as any[] };
      if (this.config.weights.content > 0) {
        try {
          // 暫時註釋掉，等待 ContentRecommendationService 實現
          // const _response = await this.contentService.getRecommendations({
          //   userId: request.userId,
          //   limit: Math.ceil((request.limit || 10) * this.config.weights.content)
          // });
          // contentRecommendations = { recommendations: response.recommendations || [] };
        } catch (error) {
          console.error('內容推薦失敗:', error);
        }
      }

      // 合併推薦結果
      const _allRecommendations = [
        ...collaborativeRecommendations.recommendations,
        ...contentRecommendations.recommendations,
      ];

      // 去重和排序
      const _uniqueRecommendations =
        this.deduplicateRecommendations(allRecommendations);
      const _sortedRecommendations = this.sortRecommendations(
        uniqueRecommendations,
        request.userId
      );

      // 限制數量
      const _finalRecommendations = sortedRecommendations.slice(
        0,
        request.limit
      );

      // 更新統計
      this.updateStats(finalRecommendations, Date.now() - startTime);

      return {
        recommendations: finalRecommendations,
        total: finalRecommendations.length,
        algorithm: HybridAlgorithm.WEIGHTED_AVERAGE,
        weights: this.config.weights,
        performance: this.stats.performanceMetrics,
        metadata: {
          requestId: this.generateRequestId(),
          processingTime: Date.now() - startTime,
          cacheHit: false,
          factors: finalRecommendations.map(rec => rec.factors).flat(),
        },
      };
    } catch (error) {
      console.error('獲取混合推薦失敗:', error);
      throw error;
    }
  }

  async recordClick(
    userId: string,
    recommendation: HybridRecommendation
  ): Promise<void> {
    try {
      // 記錄到協作過濾服務
      await this.collaborativeService.updateUserBehavior({
        userId,
        itemId: recommendation.id,
        action: UserAction.CLICK,
      });

      // 記錄到內容推薦服務
      await this.contentService.recordUserInteraction(
        userId,
        recommendation.id,
        {
          type: 'click',
          timestamp: new Date(),
        }
      );

      // 更新統計
      this.stats.performanceMetrics.clickThroughRate =
        (this.stats.performanceMetrics.clickThroughRate *
          this.stats.totalRecommendations +
          1) /
        (this.stats.totalRecommendations + 1);
    } catch (error) {
      console.error('記錄點擊失敗:', error);
    }
  }

  async recordRating(
    userId: string,
    recommendation: HybridRecommendation,
    rating: number
  ): Promise<void> {
    try {
      // 記錄到協作過濾服務
      await this.collaborativeService.updateRating({
        userId,
        itemId: recommendation.id,
        rating,
        context: {},
      });

      // 記錄到內容推薦服務
      await this.contentService.recordUserInteraction(
        userId,
        recommendation.id,
        {
          type: 'rate',
          timestamp: new Date(),
          rating,
        }
      );

      // 更新統計
      this.stats.averageScore =
        (this.stats.averageScore * this.stats.totalRecommendations + rating) /
        (this.stats.totalRecommendations + 1);
    } catch (error) {
      console.error('記錄評分失敗:', error);
    }
  }

  getConfig(): HybridRecommendationConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<HybridRecommendationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getStats(): HybridRecommendationStats {
    return { ...this.stats };
  }

  private deduplicateRecommendations(recommendations: unknown[]): unknown[] {
    const _seen = new Set();
    return recommendations.filter(rec => {
      const _key = rec.id;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private sortRecommendations(
    recommendations: unknown[],
    userId: string
  ): unknown[] {
    return recommendations.sort((a, b) => {
      const _scoreA = this.calculateHybridScore(a, userId);
      const _scoreB = this.calculateHybridScore(b, userId);
      return scoreB - scoreA;
    });
  }

  private calculateHybridScore(
    recommendation: unknown,
    userId: string
  ): number {
    const _popularityScore = recommendation.popularity || 0;
    const _recencyScore = recommendation.recency || 0;
    const _relevanceScore = recommendation.relevance || 0;
    const _diversityScore = recommendation.diversity || 0;

    return (
      popularityScore * this.config.weights.popularity +
      recencyScore * this.config.weights.trending +
      relevanceScore * this.config.weights.content +
      diversityScore * this.config.weights.diversity
    );
  }

  private calculateConfidence(recommendations: unknown[]): number {
    if (recommendations.length === 0) return 0;
    const _totalConfidence = recommendations.reduce(
      (sum, rec) => sum + (rec.confidence || 0),
      0
    );
    return totalConfidence / recommendations.length;
  }

  private calculateDiversity(recommendations: unknown[]): number {
    if (recommendations.length <= 1) return 1;

    const _categories = new Set(recommendations.map(rec => rec.category));
    return categories.size / recommendations.length;
  }

  private calculateNovelty(recommendations: unknown[]): number {
    if (recommendations.length === 0) return 0;

    const _noveltyScores = recommendations.map(rec => rec.novelty || 0);
    const _totalNovelty = noveltyScores.reduce((sum, score) => sum + score, 0);
    return totalNovelty / recommendations.length;
  }

  private updateStats(recommendations: unknown[], responseTime: number): void {
    this.stats.totalRecommendations += recommendations.length;
    this.stats.performanceMetrics.responseTime = responseTime;

    if (recommendations.length > 0) {
      const _avgScore =
        recommendations.reduce((sum, rec) => sum + (rec.score || 0), 0) /
        recommendations.length;
      this.stats.averageScore = avgScore;
    }
  }

  private generateRequestId(): string {
    return `hybrid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
