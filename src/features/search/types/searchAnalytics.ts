// 搜索分析類型定義
export interface SearchAnalytics {
  // 基礎統計
  totalSearches: number;
  uniqueUsers: number;
  averageSearchTime: number;
  searchSuccessRate: number;

  // 時間統計
  searchesByHour: HourlyStats[];
  searchesByDay: DailyStats[];
  searchesByMonth: MonthlyStats[];

  // 用戶行為
  userBehavior: UserBehaviorStats;
  searchPatterns: SearchPattern[];
  sessionAnalytics: SessionAnalytics;

  // 熱門搜索
  popularSearches: PopularSearchStats[];
  trendingSearches: TrendingSearchStats[];
  searchCategories: CategoryStats[];

  // 性能指標
  performanceMetrics: PerformanceMetrics;
  errorRates: ErrorRateStats;
  cacheMetrics: CacheMetrics;

  // 業務指標
  conversionRates: ConversionRates;
  revenueImpact: RevenueImpact;
  userSatisfaction: UserSatisfactionStats;
}

export interface HourlyStats {
  hour: number;
  searches: number;
  uniqueUsers: number;
  averageResponseTime: number;
  successRate: number;
  peakHour: boolean;
}

export interface DailyStats {
  date: string;
  searches: number;
  uniqueUsers: number;
  averageResponseTime: number;
  successRate: number;
  dayOfWeek: number;
  isWeekend: boolean;
}

export interface MonthlyStats {
  year: number;
  month: number;
  searches: number;
  uniqueUsers: number;
  averageResponseTime: number;
  successRate: number;
  growthRate: number;
}

export interface UserBehaviorStats {
  averageSearchesPerSession: number;
  averageSessionDuration: number;
  bounceRate: number;
  returnRate: number;
  searchDepth: number;
  searchRefinementRate: number;
  filterUsageRate: number;
  sortUsageRate: number;
}

export interface SearchPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  averageResults: number;
  userSatisfaction: number;
  category: string;
}

export interface SessionAnalytics {
  totalSessions: number;
  averageSessionLength: number;
  searchSessions: number;
  conversionSessions: number;
  sessionPaths: SessionPath[];
  exitPages: ExitPageStats[];
}

export interface SessionPath {
  path: string[];
  frequency: number;
  conversionRate: number;
  averageDuration: number;
}

export interface ExitPageStats {
  page: string;
  exits: number;
  exitRate: number;
  averageTimeOnPage: number;
}

export interface PopularSearchStats {
  query: string;
  searches: number;
  uniqueUsers: number;
  averageResults: number;
  successRate: number;
  category: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

export interface TrendingSearchStats {
  query: string;
  currentSearches: number;
  previousSearches: number;
  growthRate: number;
  category: string;
  trend: 'rising' | 'falling' | 'stable';
  period: 'hour' | 'day' | 'week' | 'month';
}

export interface CategoryStats {
  category: string;
  searches: number;
  uniqueUsers: number;
  averageResults: number;
  successRate: number;
  trend: 'up' | 'down' | 'stable';
  marketShare: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  cacheHitRate: number;
}

export interface ErrorRateStats {
  totalErrors: number;
  errorRate: number;
  errorTypes: ErrorTypeStats[];
  errorTrends: ErrorTrend[];
}

export interface ErrorTypeStats {
  type: string;
  count: number;
  percentage: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorTrend {
  timestamp: number;
  errorRate: number;
  errorCount: number;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  averageCacheSize: number;
  cacheEfficiency: number;
  cacheWarmupTime: number;
}

export interface ConversionRates {
  searchToView: number;
  viewToClick: number;
  clickToPurchase: number;
  searchToPurchase: number;
  overallConversion: number;
}

export interface RevenueImpact {
  totalRevenue: number;
  searchAttributedRevenue: number;
  averageOrderValue: number;
  revenuePerSearch: number;
  searchROI: number;
}

export interface UserSatisfactionStats {
  averageRating: number;
  satisfactionScore: number;
  feedbackCount: number;
  positiveFeedbackRate: number;
  negativeFeedbackRate: number;
  improvementSuggestions: string[];
}

// 搜索分析配置
export interface SearchAnalyticsConfig {
  enabled: boolean;
  trackingInterval: number;
  dataRetentionDays: number;
  privacyMode: boolean;
  anonymizeData: boolean;
  exportFormat: 'json' | 'csv' | 'excel';
  realTimeTracking: boolean;
  batchProcessing: boolean;
}

// 搜索分析事件
export interface SearchAnalyticsEvent {
  type:
    | 'search_performed'
    | 'search_result_clicked'
    | 'search_refined'
    | 'search_error'
    | 'search_success';
  timestamp: number;
  userId?: string;
  sessionId: string;
  query: string;
  results: number;
  responseTime: number;
  filters?: Record<string, any>;
  sortBy?: string;
  page: number;
  limit: number;
  category?: string;
  success: boolean;
  errorMessage?: string;
  userAgent: string;
  platform: string;
  location?: string;
}

// 搜索分析報告
export interface SearchAnalyticsReport {
  id: string;
  title: string;
  description: string;
  period: {
    start: number;
    end: number;
  };
  analytics: SearchAnalytics;
  insights: SearchInsight[];
  recommendations: SearchRecommendation[];
  generatedAt: number;
  version: string;
}

export interface SearchInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data: Record<string, any>;
  timestamp: number;
}

export interface SearchRecommendation {
  id: string;
  type: 'optimization' | 'feature' | 'content' | 'performance';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  expectedImpact: string;
  implementation: string;
  cost: number;
  timeline: string;
}

// 搜索分析過濾器
export interface SearchAnalyticsFilter {
  dateRange?: {
    start: number;
    end: number;
  };
  categories?: string[];
  users?: string[];
  platforms?: string[];
  locations?: string[];
  queryTypes?: string[];
  successOnly?: boolean;
  minSearches?: number;
  minUsers?: number;
}

// 搜索分析導出選項
export interface SearchAnalyticsExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeCharts: boolean;
  includeInsights: boolean;
  includeRecommendations: boolean;
  compression: boolean;
  password?: string;
}

// 搜索分析警報
export interface SearchAnalyticsAlert {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  enabled: boolean;
  notificationChannels: string[];
  lastTriggered?: number;
  triggerCount: number;
}

export interface AlertCondition {
  metric: string;
  timeWindow: number;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
}
