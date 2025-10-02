// Search相OffClass型定義

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

export interface SearchFilters {
  category?: string[];
  priceRange?: PriceRange;
  condition?: CardCondition[];
  rarity?: string[];
  set?: string[];
  year?: number[];
  language?: string[];
  isAuthentic?: boolean;
  hasImage?: boolean;
  location?: string[];
  seller?: string[];
  tags?: string[];
  dateRange?: DateRange;
}

export interface PriceRange {
  min?: number;
  max?: number;
  currency?: string;
}

export interface DateRange {
  start?: Date;
  end?: Date;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  type: 'card' | 'user' | 'collection' | 'market';
  title: string;
  description: string;
  image?: string;
  price?: number;
  currency?: string;
  condition?: CardCondition;
  rarity?: string;
  set?: string;
  year?: number;
  language?: string;
  location?: string;
  seller?: string;
  tags?: string[];
  score: number;
  highlights?: SearchHighlight[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchHighlight {
  field: string;
  snippet: string;
  matchedTerms: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  query: string;
  filters: SearchFilters;
  sortBy: SortOption;
  searchTime: number;
  suggestions?: string[];
  facets?: SearchFacets;
}

export interface SearchFacets {
  categories: FacetItem[];
  conditions: FacetItem[];
  rarities: FacetItem[];
  sets: FacetItem[];
  years: FacetItem[];
  languages: FacetItem[];
  locations: FacetItem[];
  priceRanges: FacetItem[];
}

export interface FacetItem {
  value: string;
  count: number;
  selected?: boolean;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'correction';
  score: number;
  metadata?: Record<string, any>;
}

export interface SearchStats {
  totalSearches: number;
  averageResponseTime: number;
  popularQueries: PopularQuery[];
  searchTrends: SearchTrend[];
  userBehavior: UserSearchBehavior;
}

export interface PopularQuery {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SearchTrend {
  date: string;
  searches: number;
  uniqueUsers: number;
}

export interface UserSearchBehavior {
  averageQueriesPerSession: number;
  averageSessionDuration: number;
  conversionRate: number;
  bounceRate: number;
}

export interface SearchIndex {
  id: string;
  name: string;
  type: 'card' | 'user' | 'collection' | 'market';
  status: 'active' | 'building' | 'error';
  documentCount: number;
  lastUpdated: Date;
  size: number;
}

export interface SearchIndexConfig {
  name: string;
  type: string;
  fields: IndexField[];
  analyzers: AnalyzerConfig[];
  settings: IndexSettings;
}

export interface IndexField {
  name: string;
  type: 'text' | 'keyword' | 'number' | 'date' | 'boolean' | 'geo_point';
  analyzer?: string;
  searchable: boolean;
  filterable: boolean;
  sortable: boolean;
  facetable: boolean;
}

export interface AnalyzerConfig {
  name: string;
  type:
    | 'standard'
    | 'simple'
    | 'whitespace'
    | 'stop'
    | 'keyword'
    | 'pattern'
    | 'language'
    | 'custom';
  settings?: Record<string, any>;
}

export interface IndexSettings {
  numberOfShards: number;
  numberOfReplicas: number;
  refreshInterval: string;
  maxResultWindow: number;
}

// 卡片相OffClass型
export type CardCondition =
  | 'mint'
  | 'near_mint'
  | 'excellent'
  | 'good'
  | 'light_played'
  | 'played'
  | 'poor';

// Search歷史
export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  filters?: SearchFilters;
  resultsCount: number;
  clickedResults?: string[];
  searchTime: number;
  timestamp: Date;
}

// SearchPreferences
export interface SearchPreferences {
  userId: string;
  defaultFilters?: SearchFilters;
  defaultSortBy?: SortOption;
  savedSearches: SavedSearch[];
  searchAlerts: SearchAlert[];
  preferences: {
    autoSuggest: boolean;
    searchHistory: boolean;
    personalizedResults: boolean;
    language: string;
    currency: string;
  };
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: SearchFilters;
  sortBy?: SortOption;
  isActive: boolean;
  createdAt: Date;
  lastUsed: Date;
}

export interface SearchAlert {
  id: string;
  name: string;
  query: string;
  filters?: SearchFilters;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

// Search性能指標
export interface SearchMetrics {
  queryTime: number;
  indexTime: number;
  resultCount: number;
  cacheHit: boolean;
  suggestionsGenerated: number;
  facetsGenerated: number;
}

// SearchError
export interface SearchError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// SearchConfigure
export interface SearchConfig {
  maxResults: number;
  defaultLimit: number;
  maxQueryLength: number;
  enableFuzzySearch: boolean;
  enableAutocomplete: boolean;
  enableSuggestions: boolean;
  enableFacets: boolean;
  enableHighlights: boolean;
  cacheEnabled: boolean;
  cacheTTL: number;
  indexRefreshInterval: number;
}
