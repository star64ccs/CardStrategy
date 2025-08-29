// 智能搜索相關類型定義

// 智能搜索查詢
// 從基礎搜索類型導入
import type {
  SearchFilters,
  PriceRange,
  CardCondition,
  SearchHighlight,
  SearchSuggestion,
  SearchTrend,
} from './search';
import { SearchQuery } from './search';

export interface IntelligentSearchQuery {
  query: string;
  userId?: string;
  context?: SearchContext;
  preferences?: UserSearchPreferences;
  filters?: IntelligentSearchFilters;
  limit?: number;
  includeSuggestions?: boolean;
  includeSemantic?: boolean;
}

// 搜索上下文
export interface SearchContext {
  category?: string;
  priceRange?: PriceRange;
  condition?: CardCondition;
  rarity?: string;
  set?: string;
  artist?: string;
  language?: string;
  location?: string;
  timestamp?: number;
  sessionId?: string;
}

// 用戶搜索偏好
export interface UserSearchPreferences {
  preferredCategories?: string[];
  preferredPriceRange?: PriceRange;
  preferredCondition?: CardCondition;
  preferredRarity?: string[];
  preferredSets?: string[];
  preferredArtists?: string[];
  preferredLanguage?: string;
  searchHistoryWeight?: number;
  popularityWeight?: number;
  recencyWeight?: number;
  personalizationEnabled?: boolean;
}

// 智能搜索過濾器
export interface IntelligentSearchFilters {
  semanticThreshold?: number;
  relevanceThreshold?: number;
  categoryBoost?: number;
  priceBoost?: number;
  conditionBoost?: number;
  rarityBoost?: number;
  setBoost?: number;
  artistBoost?: number;
  excludeOutOfStock?: boolean;
  excludeExpensive?: boolean;
  excludeCheap?: boolean;
}

// 智能搜索響應
export interface IntelligentSearchResponse {
  results: IntelligentSearchResult[];
  suggestions: SearchSuggestion[];
  semanticMatches: SemanticMatch[];
  autoComplete: AutoCompleteOption[];
  searchHistory: SearchHistoryItem[];
  popularSearches: PopularSearchItem[];
  relatedSearches: RelatedSearchItem[];
  searchStats: IntelligentSearchStats;
  queryAnalysis: QueryAnalysis;
  personalizationScore: number;
  responseTime: number;
  cacheHit: boolean;
}

// 智能搜索結果
export interface IntelligentSearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: CardCondition;
  rarity: string;
  set: string;
  artist: string;
  language: string;
  imageUrl?: string;
  relevanceScore: number;
  semanticScore: number;
  personalizationScore: number;
  finalScore: number;
  highlights: SearchHighlight[];
  metadata: Record<string, any>;
  availability: boolean;
  location?: string;
  seller?: string;
  rating?: number;
  reviewCount?: number;
}

// 語義匹配
export interface SemanticMatch {
  query: string;
  originalQuery: string;
  similarity: number;
  confidence: number;
  explanation: string;
  suggestedFilters?: SearchFilters;
}

// 自動完成選項
export interface AutoCompleteOption {
  text: string;
  type: 'suggestion' | 'history' | 'popular' | 'semantic';
  relevance: number;
  category?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

// 搜索歷史項目
export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
  clickedResults: string[];
  filters?: SearchFilters;
  category?: string;
  success: boolean;
}

// 熱門搜索項目
export interface PopularSearchItem {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  category?: string;
  relatedQueries?: string[];
  lastUpdated: number;
}

// 相關搜索項目
export interface RelatedSearchItem {
  query: string;
  relevance: number;
  category?: string;
  reason: string;
  suggestedFilters?: SearchFilters;
}

// 智能搜索統計
export interface IntelligentSearchStats {
  totalQueries: number;
  averageResponseTime: number;
  cacheHitRate: number;
  semanticUsageRate: number;
  personalizationUsageRate: number;
  userSatisfactionScore: number;
  topQueries: PopularSearchItem[];
  searchTrends: SearchTrend[];
  categoryDistribution: CategoryStats[];
  timeDistribution: TimeStats[];
}

// 查詢分析
export interface QueryAnalysis {
  originalQuery: string;
  normalizedQuery: string;
  tokens: string[];
  entities: Entity[];
  intent: SearchIntent;
  confidence: number;
  suggestions: string[];
  corrections: QueryCorrection[];
  language: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

// 實體識別
export interface Entity {
  text: string;
  type:
    | 'card_name'
    | 'artist'
    | 'set'
    | 'rarity'
    | 'condition'
    | 'price'
    | 'category';
  confidence: number;
  start: number;
  end: number;
  normalizedValue?: string;
}

// 搜索意圖
export interface SearchIntent {
  primary:
    | 'find_card'
    | 'compare_prices'
    | 'explore_category'
    | 'find_deals'
    | 'research'
    | 'browse';
  secondary?: string;
  confidence: number;
  filters: Record<string, any>;
}

// 查詢糾正
export interface QueryCorrection {
  original: string;
  corrected: string;
  confidence: number;
  reason: string;
  suggestion: boolean;
}

// 類別統計
export interface CategoryStats {
  category: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// 時間統計
export interface TimeStats {
  hour: number;
  count: number;
  averageResponseTime: number;
  peak: boolean;
}

// 智能搜索配置
export interface IntelligentSearchConfig {
  semanticSearchEnabled: boolean;
  personalizationEnabled: boolean;
  autoCompleteEnabled: boolean;
  searchHistoryEnabled: boolean;
  suggestionsEnabled: boolean;
  cacheEnabled: boolean;
  maxSuggestions: number;
  maxHistoryItems: number;
  maxResults: number;
  semanticThreshold: number;
  relevanceThreshold: number;
  cacheTTL: number;
  personalizationWeight: number;
  popularityWeight: number;
  recencyWeight: number;
  semanticWeight: number;
}

// 智能搜索服務接口
export interface IntelligentSearchService {
  initialize(): Promise<boolean>;
  search(query: IntelligentSearchQuery): Promise<IntelligentSearchResponse>;
  getSuggestions(
    query: string,
    context?: SearchContext
  ): Promise<AutoCompleteOption[]>;
  getSearchHistory(userId: string): Promise<SearchHistoryItem[]>;
  saveSearchHistory(
    userId: string,
    query: string,
    results: string[]
  ): Promise<void>;
  getPopularSearches(category?: string): Promise<PopularSearchItem[]>;
  getRelatedSearches(query: string): Promise<RelatedSearchItem[]>;
  analyzeQuery(query: string): Promise<QueryAnalysis>;
  updateUserPreferences(
    userId: string,
    preferences: UserSearchPreferences
  ): Promise<void>;
  getUserPreferences(userId: string): Promise<UserSearchPreferences>;
  getSearchStats(): Promise<IntelligentSearchStats>;
  clearSearchHistory(userId: string): Promise<void>;
  getConfig(): IntelligentSearchConfig;
  updateConfig(config: Partial<IntelligentSearchConfig>): void;
}

// 智能搜索錯誤
export interface IntelligentSearchError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
  query?: string;
  userId?: string;
}

// 智能搜索事件
export interface IntelligentSearchEvent {
  type:
    | 'search'
    | 'suggestion'
    | 'autocomplete'
    | 'history'
    | 'popular'
    | 'semantic';
  query: string;
  userId?: string;
  timestamp: number;
  resultCount?: number;
  responseTime?: number;
  success: boolean;
  error?: IntelligentSearchError;
  metadata?: Record<string, any>;
}
