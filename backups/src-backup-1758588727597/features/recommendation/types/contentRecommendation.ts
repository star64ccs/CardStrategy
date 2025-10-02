// 內容推薦系統類型定義

// 內容項目接口
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

// 內容類型枚舉
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

// 內容屬性
export interface ContentAttributes {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // 分鐘
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

// 內容元數據
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

// 用戶偏好
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

// 內容相似度
export interface ContentSimilarity {
  sourceId: string;
  targetId: string;
  similarityScore: number;
  similarityMethod: SimilarityMethod;
  commonTags: string[];
  commonCategories: string[];
  attributeSimilarity: AttributeSimilarity;
}

// 相似度方法
export enum SimilarityMethod {
  COSINE = 'cosine',
  JACCARD = 'jaccard',
  EUCLIDEAN = 'euclidean',
  PEARSON = 'pearson',
  MANHATTAN = 'manhattan',
  HYBRID = 'hybrid',
}

// 屬性相似度
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

// 內容推薦
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

// 內容推薦算法
export enum ContentRecommendationAlgorithm {
  CONTENT_BASED = 'content_based',
  TAG_BASED = 'tag_based',
  CATEGORY_BASED = 'category_based',
  ATTRIBUTE_BASED = 'attribute_based',
  HYBRID = 'hybrid',
  POPULARITY_BASED = 'popularity_based',
  TRENDING_BASED = 'trending_based',
}

// 推薦元數據
export interface RecommendationMetadata {
  userInteraction: UserInteraction;
  contentFeatures: ContentFeatures;
  algorithmParams: AlgorithmParameters;
  performanceMetrics: PerformanceMetrics;
}

// 用戶互動
export interface UserInteraction {
  viewCount: number;
  likeCount: number;
  shareCount: number;
  bookmarkCount: number;
  rating: number;
  lastInteraction: Date;
  interactionHistory: InteractionEvent[];
}

// 互動事件
export interface InteractionEvent {
  type: 'view' | 'like' | 'share' | 'bookmark' | 'rate' | 'comment';
  timestamp: Date;
  duration?: number;
  rating?: number;
  comment?: string;
}

// 內容特徵
export interface ContentFeatures {
  tagFeatures: TagFeatures;
  categoryFeatures: CategoryFeatures;
  attributeFeatures: AttributeFeatures;
  popularityFeatures: PopularityFeatures;
}

// 標籤特徵
export interface TagFeatures {
  tagVector: number[];
  tagWeights: Record<string, number>;
  tagFrequency: Record<string, number>;
  tagCooccurrence: Record<string, Record<string, number>>;
}

// 類別特徵
export interface CategoryFeatures {
  categoryVector: number[];
  categoryWeights: Record<string, number>;
  categoryHierarchy: Record<string, string[]>;
  categorySimilarity: Record<string, Record<string, number>>;
}

// 屬性特徵
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

// 算法參數
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

// 內容推薦配置
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

// 內容推薦統計
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

// API 請求類型
export interface GetContentRecommendationsRequest {
  userId: string;
  limit?: number;
  algorithm?: ContentRecommendationAlgorithm;
  similarityMethod?: SimilarityMethod;
  filters?: ContentFilters;
  options?: RecommendationOptions;
}

// 內容過濾器
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

// 推薦選項
export interface RecommendationOptions {
  includeSimilarContent?: boolean;
  includePopularContent?: boolean;
  includeTrendingContent?: boolean;
  diversityBoost?: boolean;
  noveltyBoost?: boolean;
  recencyBoost?: boolean;
  explainRecommendations?: boolean;
}

// API 響應類型
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

// 內部數據結構
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

// 系統配置
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
