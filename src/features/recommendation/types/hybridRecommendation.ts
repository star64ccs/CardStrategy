// 混合推薦系統Class型定義
export interface HybridRecommendation {
  id: string;
  userId: string;
  itemId: string;
  score: number;
  confidence: number;
  reason: HybridRecommendationReason;
  factors: HybridRecommendationFactor[];
  metadata: HybridRecommendationMetadata;
  createdAt: Date;
  expiresAt: Date;
}

export interface HybridRecommendationFactor {
  type: HybridFactorType;
  weight: number;
  score: number;
  description: string;
  metadata?: Record<string, any>;
}

export enum HybridFactorType {
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  CONTENT_BASED = 'content_based',
  POPULARITY = 'popularity',
  TRENDING = 'trending',
  PERSONALIZATION = 'personalization',
  CONTEXTUAL = 'contextual',
  DIVERSITY = 'diversity',
  NOVELTY = 'novelty',
}

export enum HybridRecommendationReason {
  SIMILAR_USERS_LIKE = 'similar_users_like',
  SIMILAR_CONTENT = 'similar_content',
  USER_PREFERENCE = 'user_preference',
  POPULAR_ITEM = 'popular_item',
  TRENDING_ITEM = 'trending_item',
  PERSONALIZED_MATCH = 'personalized_match',
  CONTEXTUAL_RELEVANCE = 'contextual_relevance',
  DIVERSITY_BOOST = 'diversity_boost',
  NOVELTY_BOOST = 'novelty_boost',
  HYBRID_OPTIMIZATION = 'hybrid_optimization',
}

export interface HybridRecommendationMetadata {
  collaborativeScore: number;
  contentScore: number;
  popularityScore: number;
  trendingScore: number;
  personalizationScore: number;
  contextualScore: number;
  diversityScore: number;
  noveltyScore: number;
  algorithm: HybridAlgorithm;
  similarityMethod: string;
  userBehavior: UserBehaviorContext;
  contentAttributes: ContentAttributes;
  performanceMetrics: HybridPerformanceMetrics;
}

export enum HybridAlgorithm {
  WEIGHTED_AVERAGE = 'weighted_average',
  LINEAR_COMBINATION = 'linear_combination',
  ADAPTIVE_WEIGHTING = 'adaptive_weighting',
  ENSEMBLE_METHOD = 'ensemble_method',
  META_LEARNING = 'meta_learning',
  DEEP_HYBRID = 'deep_hybrid',
  CONTEXTUAL_HYBRID = 'contextual_hybrid',
  PERSONALIZED_HYBRID = 'personalized_hybrid',
}

export interface UserBehaviorContext {
  recentInteractions: UserInteraction[];
  preferences: UserPreference;
  behaviorPattern: BehaviorPattern;
  context: RecommendationContext;
}

export interface UserInteraction {
  type: InteractionType;
  itemId: string;
  timestamp: Date;
  value?: number;
  metadata?: Record<string, any>;
}

export enum InteractionType {
  VIEW = 'view',
  LIKE = 'like',
  SHARE = 'share',
  BOOKMARK = 'bookmark',
  RATE = 'rate',
  COMMENT = 'comment',
  PURCHASE = 'purchase',
  SEARCH = 'search',
}

export interface UserPreference {
  contentTypes: string[];
  categories: string[];
  tags: string[];
  difficulty: string;
  language: string;
  priceRange: PriceRange;
  durationRange: DurationRange;
  ratingThreshold: number;
  metadata?: Record<string, any>;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface DurationRange {
  min: number;
  max: number;
  unit: 'minutes' | 'hours' | 'days';
}

export interface BehaviorPattern {
  activeHours: number[];
  preferredDays: string[];
  sessionDuration: number;
  interactionFrequency: number;
  contentConsumptionRate: number;
  socialEngagementRate: number;
}

export interface RecommendationContext {
  timeOfDay: string;
  dayOfWeek: string;
  location?: string;
  device: string;
  platform: string;
  sessionId: string;
  searchQuery?: string;
  currentPage?: string;
}

export interface ContentAttributes {
  type: string;
  category: string;
  tags: string[];
  difficulty: string;
  duration: number;
  language: string;
  price: number;
  rating: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  bookmarkCount: number;
  metadata?: Record<string, any>;
}

export interface HybridPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  diversity: number;
  novelty: number;
  coverage: number;
  clickThroughRate: number;
  conversionRate: number;
  userSatisfaction: number;
  responseTime: number;
}

export interface HybridRecommendationConfig {
  algorithm: HybridAlgorithm;
  weights: HybridWeights;
  thresholds: HybridThresholds;
  caching: CachingConfig;
  performance: PerformanceConfig;
  personalization: PersonalizationConfig;
  diversity: DiversityConfig;
  novelty: NoveltyConfig;
}

export interface HybridWeights {
  collaborative: number;
  content: number;
  popularity: number;
  trending: number;
  personalization: number;
  contextual: number;
  diversity: number;
  novelty: number;
}

export interface HybridThresholds {
  minScore: number;
  minConfidence: number;
  maxRecommendations: number;
  cacheExpiry: number;
  performanceThreshold: number;
}

export interface CachingConfig {
  enabled: boolean;
  maxSize: number;
  expiryTime: number;
  strategy: 'LRU' | 'LFU' | 'FIFO';
}

export interface PerformanceConfig {
  maxResponseTime: number;
  batchSize: number;
  concurrency: number;
  timeout: number;
}

export interface PersonalizationConfig {
  enabled: boolean;
  learningRate: number;
  decayFactor: number;
  minInteractions: number;
}

export interface DiversityConfig {
  enabled: boolean;
  diversityWeight: number;
  maxSimilarItems: number;
  categorySpread: number;
}

export interface NoveltyConfig {
  enabled: boolean;
  noveltyWeight: number;
  explorationRate: number;
  maxNovelItems: number;
}

export interface HybridRecommendationStats {
  totalRecommendations: number;
  averageScore: number;
  averageConfidence: number;
  algorithmDistribution: Record<HybridAlgorithm, number>;
  factorDistribution: Record<HybridFactorType, number>;
  reasonDistribution: Record<HybridRecommendationReason, number>;
  performanceMetrics: HybridPerformanceMetrics;
  cacheStats: CacheStats;
  userEngagement: UserEngagementStats;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  size: number;
  maxSize: number;
  evictions: number;
}

export interface UserEngagementStats {
  clickThroughRate: number;
  conversionRate: number;
  averageSessionDuration: number;
  returnRate: number;
  satisfactionScore: number;
}

export interface GetHybridRecommendationsRequest {
  userId: string;
  limit?: number;
  algorithm?: HybridAlgorithm;
  weights?: Partial<HybridWeights>;
  filters?: HybridFilters;
  options?: HybridOptions;
  context?: RecommendationContext;
}

export interface HybridFilters {
  contentTypes?: string[];
  categories?: string[];
  tags?: string[];
  difficulty?: string;
  language?: string;
  priceRange?: PriceRange;
  durationRange?: DurationRange;
  minRating?: number;
  excludeIds?: string[];
}

export interface HybridOptions {
  includeMetadata?: boolean;
  includeFactors?: boolean;
  includePerformance?: boolean;
  sortBy?: 'score' | 'confidence' | 'diversity' | 'novelty';
  sortOrder?: 'asc' | 'desc';
  enableDiversity?: boolean;
  enableNovelty?: boolean;
  enablePersonalization?: boolean;
}

export interface GetHybridRecommendationsResponse {
  recommendations: HybridRecommendation[];
  total: number;
  algorithm: HybridAlgorithm;
  weights: HybridWeights;
  performance: HybridPerformanceMetrics;
  metadata: {
    requestId: string;
    processingTime: number;
    cacheHit: boolean;
    factors: HybridRecommendationFactor[];
  };
}

export interface HybridRecommendationEvent {
  type:
    | 'recommendation_generated'
    | 'recommendation_clicked'
    | 'recommendation_rated'
    | 'model_updated';
  userId: string;
  recommendations?: HybridRecommendation[];
  clickedRecommendation?: HybridRecommendation;
  rating?: number;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// InternalData結構
export interface HybridRecommendationMatrix {
  [userId: string]: {
    [itemId: string]: HybridRecommendation;
  };
}

export interface HybridRecommendationCache {
  [cacheKey: string]: {
    recommendations: GetHybridRecommendationsResponse;
    timestamp: number;
    expiresAt: number;
  };
}

export interface HybridRecommendationSystemConfig {
  version: string;
  environment: string;
  features: {
    collaborativeFiltering: boolean;
    contentBased: boolean;
    popularity: boolean;
    trending: boolean;
    personalization: boolean;
    contextual: boolean;
    diversity: boolean;
    novelty: boolean;
  };
  limits: {
    maxRecommendations: number;
    maxCacheSize: number;
    maxResponseTime: number;
    maxConcurrentRequests: number;
  };
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: Record<string, number>;
  };
}
