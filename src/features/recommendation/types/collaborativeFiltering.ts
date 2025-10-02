// 協同Filter推薦系統Class型定義

// 基礎Class型
export interface User {
  id: string;
  name: string;
  email?: string;
  preferences?: UserPreferences;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  tags: string[];
  attributes: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  userId: string;
  itemId: string;
  rating: number; // 1-5 星評分
  timestamp: Date;
  context?: RatingContext;
  metadata?: Record<string, any>;
}

export interface RatingContext {
  platform?: string;
  device?: string;
  location?: string;
  timeOfDay?: string;
  season?: string;
  specialEvent?: string;
}

export interface UserPreferences {
  favoriteCategories: string[];
  preferredTags: string[];
  ratingThreshold: number;
  recommendationCount: number;
  privacySettings: PrivacySettings;
}

export interface PrivacySettings {
  shareRatings: boolean;
  sharePreferences: boolean;
  allowRecommendations: boolean;
  dataRetentionDays: number;
}

// 相似度計算
export interface SimilarityScore {
  userId: string;
  targetUserId: string;
  score: number; // 0-1 之間
  method: SimilarityMethod;
  commonItems: number;
  calculatedAt: Date;
}

export enum SimilarityMethod {
  PEARSON = 'pearson',
  COSINE = 'cosine',
  EUCLIDEAN = 'euclidean',
  JACCARD = 'jaccard',
  MANHATTAN = 'manhattan',
}

// 推薦結果
export interface Recommendation {
  userId: string;
  itemId: string;
  score: number; // 預測評分
  confidence: number; // 置信度 0-1
  reason: RecommendationReason;
  algorithm: RecommendationAlgorithm;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface RecommendationReason {
  type:
    | 'similar_users'
    | 'item_similarity'
    | 'category_preference'
    | 'trending';
  description: string;
  supportingData?: Record<string, any>;
}

export enum RecommendationAlgorithm {
  USER_BASED = 'user_based',
  ITEM_BASED = 'item_based',
  MATRIX_FACTORIZATION = 'matrix_factorization',
  NEURAL_COLLABORATIVE = 'neural_collaborative',
}

// UserRow為
export interface UserBehavior {
  userId: string;
  itemId: string;
  action: UserAction;
  timestamp: Date;
  duration?: number; // 停留Time（Second）
  context?: BehaviorContext;
  metadata?: Record<string, any>;
}

export enum UserAction {
  VIEW = 'view',
  LIKE = 'like',
  DISLIKE = 'dislike',
  SHARE = 'share',
  PURCHASE = 'purchase',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  SEARCH = 'search',
  CLICK = 'click',
}

export interface BehaviorContext {
  sessionId: string;
  pageUrl: string;
  referrer?: string;
  userAgent: string;
  ipAddress?: string;
  location?: string;
}

// 模型Configure
export interface CollaborativeFilteringConfig {
  algorithm: RecommendationAlgorithm;
  similarityMethod: SimilarityMethod;
  minCommonItems: number;
  minSimilarityScore: number;
  maxRecommendations: number;
  cacheEnabled: boolean;
  cacheExpiryMinutes: number;
  batchSize: number;
  updateIntervalMinutes: number;
}

// 模型性能指標
export interface ModelPerformance {
  algorithm: RecommendationAlgorithm;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mae: number; // 平均絕對誤差
  rmse: number; // 均方Root誤差
  coverage: number;
  diversity: number;
  novelty: number;
  calculatedAt: Date;
}

// DataStatistics
export interface DataStatistics {
  totalUsers: number;
  totalItems: number;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  sparsity: number; // 稀疏度
  activeUsers: number;
  activeItems: number;
  lastUpdated: Date;
}

// EventClass型
export interface RecommendationEvent {
  type:
    | 'recommendation_generated'
    | 'recommendation_clicked'
    | 'recommendation_rated'
    | 'model_updated'
    | 'performance_calculated';
  userId?: string;
  itemId?: string;
  recommendationId?: string;
  data?: Record<string, any>;
  timestamp: Date;
}

// API ResponseClass型
export interface CollaborativeFilteringResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: {
    algorithm: RecommendationAlgorithm;
    processingTime: number;
    cacheHit: boolean;
    timestamp: Date;
  };
}

export interface GetRecommendationsResponse
  extends CollaborativeFilteringResponse {
  data?: {
    recommendations: Recommendation[];
    totalCount: number;
    hasMore: boolean;
  };
}

export interface GetSimilarUsersResponse
  extends CollaborativeFilteringResponse {
  data?: {
    similarUsers: SimilarityScore[];
    totalCount: number;
  };
}

export interface GetSimilarItemsResponse
  extends CollaborativeFilteringResponse {
  data?: {
    similarItems: {
      itemId: string;
      similarityScore: number;
      commonRatings: number;
    }[];
    totalCount: number;
  };
}

export interface GetModelPerformanceResponse
  extends CollaborativeFilteringResponse {
  data?: {
    performance: ModelPerformance;
    statistics: DataStatistics;
  };
}

// RequestClass型
export interface GetRecommendationsRequest {
  userId: string;
  limit?: number;
  categories?: string[];
  excludeRated?: boolean;
  algorithm?: RecommendationAlgorithm;
}

export interface GetSimilarUsersRequest {
  userId: string;
  limit?: number;
  minSimilarity?: number;
  method?: SimilarityMethod;
}

export interface GetSimilarItemsRequest {
  itemId: string;
  limit?: number;
  minSimilarity?: number;
  method?: SimilarityMethod;
}

export interface UpdateRatingRequest {
  userId: string;
  itemId: string;
  rating: number;
  context?: RatingContext;
}

export interface UpdateUserBehaviorRequest {
  userId: string;
  itemId: string;
  action: UserAction;
  context?: BehaviorContext;
}

// InternalData結構
export interface UserItemMatrix {
  [userId: string]: {
    [itemId: string]: number;
  };
}

export interface ItemItemMatrix {
  [itemId: string]: {
    [itemId2: string]: number;
  };
}

export interface UserUserMatrix {
  [userId: string]: {
    [userId2: string]: number;
  };
}

// CacheClass型
export interface RecommendationCache {
  userId: string;
  recommendations: Recommendation[];
  expiresAt: Date;
}

export interface SimilarityCache {
  key: string; // userId:userId 或 itemId:itemId
  similarity: number;
  expiresAt: Date;
}

// ConfigureClass型
export interface SystemConfig {
  collaborativeFiltering: CollaborativeFilteringConfig;
  database: {
    connectionString: string;
    maxConnections: number;
    timeout: number;
  };
  cache: {
    enabled: boolean;
    type: 'memory' | 'redis';
    host?: string;
    port?: number;
    password?: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enabled: boolean;
  };
}
