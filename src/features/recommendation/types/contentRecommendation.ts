// Content推薦系統Class型定義

// Content項目Interface
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  tags: string[];
  category: string;
  attributes: ContentAttributes;
  metadata: ContentMetadata;
  popularity: PopularityMetrics;
  createdAt: Date;
  updatedAt: Date;
}

// ContentClass型枚舉
export enum ContentType {
  CARD = 'card',
  ARTICLE = 'article',
  VIDEO = 'video',
  PODCAST = 'podcast',
  GUIDE = 'guide',
  REVIEW = 'review',
  NEWS = 'news',
  TUTORIAL = 'tutorial',
}

// ContentProperty
export interface ContentAttributes {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // Minute
  language: string;
  format: string;
  price: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  bookmarkCount: number;
}

// Content元Data
export interface ContentMetadata {
  author: string;
  publisher: string;
  source: string;
  license: string;
  keywords: string[];
  summary: string;
  thumbnail: string;
  relatedItems: string[];
}

// 熱度指標
export interface PopularityMetrics {
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  bookmarkCount: number;
  rating: number;
  reviewCount: number;
  trendingScore: number;
  viralScore: number;
}

// UserPreferences
export interface UserPreference {
  userId: string;
  contentTypes: ContentType[];
  categories: string[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  priceRange: {
    min: number;
    max: number;
  };
  durationRange: {
    min: number;
    max: number;
  };
  ratingThreshold: number;
  lastUpdated: Date;
}

// Content相似度
export interface ContentSimilarity {
  sourceId: string;
  targetId: string;
  similarityScore: number;
  similarityMethod: SimilarityMethod;
  commonTags: string[];
  commonCategories: string[];
  attributeSimilarity: AttributeSimilarity;
}

// 相似度Method
export enum SimilarityMethod {
  COSINE = 'cosine',
  JACCARD = 'jaccard',
  EUCLIDEAN = 'euclidean',
  PEARSON = 'pearson',
  MANHATTAN = 'manhattan',
  HYBRID = 'hybrid',
}

// Property相似度
export interface AttributeSimilarity {
  tagSimilarity: number;
  categorySimilarity: number;
  typeSimilarity: number;
  difficultySimilarity: number;
  languageSimilarity: number;
  priceSimilarity: number;
  durationSimilarity: number;
  ratingSimilarity: number;
}

// Content推薦
export interface ContentRecommendation {
  id: string;
  userId: string;
  contentId: string;
  score: number;
  reason: RecommendationReason;
  algorithm: ContentRecommendationAlgorithm;
  confidence: number;
  timestamp: Date;
  metadata: RecommendationMetadata;
}

// 推薦原因
export interface RecommendationReason {
  type:
    | 'similar_content'
    | 'user_preference'
    | 'popular'
    | 'trending'
    | 'collaborative'
    | 'hybrid';
  description: string;
  factors: RecommendationFactor[];
  weight: number;
}

// 推薦因素
export interface RecommendationFactor {
  factor: string;
  value: number;
  weight: number;
  description: string;
}

// Content推薦算法
export enum ContentRecommendationAlgorithm {
  CONTENT_BASED = 'content_based',
  TAG_BASED = 'tag_based',
  CATEGORY_BASED = 'category_based',
  ATTRIBUTE_BASED = 'attribute_based',
  HYBRID = 'hybrid',
  POPULARITY_BASED = 'popularity_based',
  TRENDING_BASED = 'trending_based',
}

// 推薦元Data
export interface RecommendationMetadata {
  userInteraction: UserInteraction;
  contentFeatures: ContentFeatures;
  algorithmParams: AlgorithmParameters;
  performanceMetrics: PerformanceMetrics;
}

// User互動
export interface UserInteraction {
  viewCount: number;
  likeCount: number;
  shareCount: number;
  bookmarkCount: number;
  rating: number;
  lastInteraction: Date;
  interactionHistory: InteractionEvent[];
}

// 互動Event
export interface InteractionEvent {
  type: 'view' | 'like' | 'share' | 'bookmark' | 'rate' | 'comment';
  timestamp: Date;
  duration?: number;
  rating?: number;
  comment?: string;
}

// Content特徵
export interface ContentFeatures {
  tagFeatures: TagFeatures;
  categoryFeatures: CategoryFeatures;
  attributeFeatures: AttributeFeatures;
  popularityFeatures: PopularityFeatures;
}

// Tag特徵
export interface TagFeatures {
  tagVector: number[];
  tagWeights: Record<string, number>;
  tagFrequency: Record<string, number>;
  tagCooccurrence: Record<string, Record<string, number>>;
}

// Class別特徵
export interface CategoryFeatures {
  categoryVector: number[];
  categoryWeights: Record<string, number>;
  categoryHierarchy: Record<string, string[]>;
  categorySimilarity: Record<string, Record<string, number>>;
}

// Property特徵
export interface AttributeFeatures {
  difficultyVector: number[];
  languageVector: number[];
  priceVector: number[];
  durationVector: number[];
  ratingVector: number[];
}

// 熱度特徵
export interface PopularityFeatures {
  viewTrend: number[];
  likeTrend: number[];
  shareTrend: number[];
  trendingScore: number;
  viralScore: number;
  freshnessScore: number;
}

// 算法Parameter
export interface AlgorithmParameters {
  similarityThreshold: number;
  maxRecommendations: number;
  diversityWeight: number;
  noveltyWeight: number;
  popularityWeight: number;
  recencyWeight: number;
  tagWeight: number;
  categoryWeight: number;
  attributeWeight: number;
}

// 性能指標
export interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  diversity: number;
  novelty: number;
  coverage: number;
  clickThroughRate: number;
  conversionRate: number;
}

// Content推薦Configure
export interface ContentRecommendationConfig {
  enabled: boolean;
  algorithms: ContentRecommendationAlgorithm[];
  similarityMethods: SimilarityMethod[];
  maxRecommendations: number;
  similarityThreshold: number;
  diversityWeight: number;
  noveltyWeight: number;
  popularityWeight: number;
  recencyWeight: number;
  tagWeight: number;
  categoryWeight: number;
  attributeWeight: number;
  cacheEnabled: boolean;
  cacheExpiry: number;
  updateInterval: number;
  performanceTracking: boolean;
}

// Content推薦Statistics
export interface ContentRecommendationStats {
  totalRecommendations: number;
  totalUsers: number;
  totalContent: number;
  averageScore: number;
  algorithmDistribution: Record<ContentRecommendationAlgorithm, number>;
  similarityMethodDistribution: Record<SimilarityMethod, number>;
  performanceMetrics: PerformanceMetrics;
  lastUpdated: Date;
}

// API RequestClass型
export interface GetContentRecommendationsRequest {
  userId: string;
  limit?: number;
  algorithm?: ContentRecommendationAlgorithm;
  similarityMethod?: SimilarityMethod;
  filters?: ContentFilters;
  options?: RecommendationOptions;
}

// ContentFilter器
export interface ContentFilters {
  contentTypes?: ContentType[];
  categories?: string[];
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  durationRange?: {
    min: number;
    max: number;
  };
  ratingThreshold?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// 推薦Options
export interface RecommendationOptions {
  includeSimilarContent?: boolean;
  includePopularContent?: boolean;
  includeTrendingContent?: boolean;
  diversityBoost?: boolean;
  noveltyBoost?: boolean;
  recencyBoost?: boolean;
  explainRecommendations?: boolean;
}

// API ResponseClass型
export interface GetContentRecommendationsResponse {
  recommendations: ContentRecommendation[];
  totalCount: number;
  algorithm: ContentRecommendationAlgorithm;
  similarityMethod: SimilarityMethod;
  performanceMetrics: PerformanceMetrics;
  metadata: {
    processingTime: number;
    cacheHit: boolean;
    filters: ContentFilters;
    options: RecommendationOptions;
  };
}

// InternalData結構
export interface ContentItemMatrix {
  [contentId: string]: {
    [targetContentId: string]: number;
  };
}

export interface UserContentMatrix {
  [userId: string]: {
    [contentId: string]: number;
  };
}

export interface ContentRecommendationCache {
  [cacheKey: string]: {
    recommendations: GetContentRecommendationsResponse;
    timestamp: Date;
    expiresAt: Date;
  };
}

export interface ContentSimilarityCache {
  [contentId: string]: {
    similarities: ContentSimilarity[];
    timestamp: Date;
    expiresAt: Date;
  };
}

// 系統Configure
export interface ContentRecommendationSystemConfig {
  serviceName: string;
  version: string;
  environment: string;
  config: ContentRecommendationConfig;
  stats: ContentRecommendationStats;
  cache: {
    recommendations: ContentRecommendationCache;
    similarities: ContentSimilarityCache;
  };
}
