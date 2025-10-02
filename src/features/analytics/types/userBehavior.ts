// UserRow為AnalysisClass型定義

// UserRow為EventClass型
export type UserBehaviorEventType =
  | 'page_view'
  | 'card_view'
  | 'card_click'
  | 'search_performed'
  | 'filter_applied'
  | 'sort_changed'
  | 'add_to_collection'
  | 'remove_from_collection'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'share_card'
  | 'report_card'
  | 'purchase_attempt'
  | 'purchase_completed'
  | 'login'
  | 'logout'
  | 'registration'
  | 'profile_update'
  | 'settings_change'
  | 'notification_interaction'
  | 'app_launch'
  | 'app_close'
  | 'session_start'
  | 'session_end';

// UserRow為Event
export interface UserBehaviorEvent {
  id: string;
  userId: string;
  sessionId: string;
  eventType: UserBehaviorEventType;
  timestamp: number;
  page?: string;
  cardId?: string;
  category?: string;
  searchQuery?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  price?: number;
  currency?: string;
  platform: 'iOS' | 'Android' | 'Web';
  userAgent: string;
  deviceInfo: {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser?: string;
    screenResolution: string;
    language: string;
  };
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
  metadata?: Record<string, any>;
}

// UserRow為模式
export interface UserBehaviorPattern {
  id: string;
  userId: string;
  patternType: 'search' | 'browse' | 'collect' | 'purchase' | 'social';
  frequency: number;
  averageDuration: number;
  preferredCategories: string[];
  preferredPriceRange: {
    min: number;
    max: number;
    currency: string;
  };
  preferredTimeSlots: number[];
  preferredDays: number[];
  lastUpdated: number;
  confidence: number;
}

// User畫像
export interface UserProfile {
  id: string;
  userId: string;
  userType: 'collector' | 'investor' | 'player' | 'casual' | 'professional';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  collectionSize: number;
  activeSince: number;
  lastActive: number;
  engagementScore: number;
  loyaltyScore: number;
  behaviorScore: number;
  riskTolerance: 'low' | 'medium' | 'high';
  preferences: {
    favoriteCategories: string[];
    favoriteSeries: string[];
    preferredConditions: string[];
    preferredLanguages: string[];
    notificationPreferences: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  behaviorMetrics: {
    totalSessions: number;
    averageSessionDuration: number;
    averageSessionsPerDay: number;
    mostActiveHour: number;
    mostActiveDay: number;
    bounceRate: number;
    returnRate: number;
    conversionRate: number;
  };
}

// UserRow為Statistics
export interface UserBehaviorStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  churnRate: number;
  totalEvents: number;
  averageEventsPerUser: number;
  averageSessionDuration: number;
  sessionFrequency: number;
  conversionRate: number;
  revenuePerUser: number;
  eventsByType: Record<string, number>;
  peakHours: number[];
  conversionFunnel: {
    step1: number;
    step2: number;
    step3: number;
    step4: number;
  };
}

// UserRow為AnalysisConfigure
export interface UserBehaviorConfig {
  enabled: boolean;
  trackingInterval: number;
  dataRetentionDays: number;
  privacyMode: boolean;
  anonymizeData: boolean;
  realTimeTracking: boolean;
  batchProcessing: boolean;
  eventBufferSize: number;
  maxEventsPerSession: number;
  sessionTimeout: number;
  geolocationTracking: boolean;
  deviceTracking: boolean;
  customEvents: boolean;
}

// UserRow為AnalysisReport
export interface UserBehaviorReport {
  id: string;
  title: string;
  description: string;
  period: {
    start: number;
    end: number;
  };
  filter?: UserBehaviorFilter;
  stats: UserBehaviorStats;
  patterns: UserBehaviorPattern[];
  profiles: UserProfile[];
  insights: UserBehaviorInsight[];
  recommendations: UserBehaviorRecommendation[];
  generatedAt: number;
  status?: 'pending' | 'completed' | 'failed';
  version: string;
}

// UserRow為洞察
export interface UserBehaviorInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data: Record<string, any>;
  timestamp: number;
  affectedUsers: number;
  potentialValue: number;
}

// UserRow為建議
export interface UserBehaviorRecommendation {
  id: string;
  type:
    | 'personalization'
    | 'engagement'
    | 'retention'
    | 'conversion'
    | 'optimization';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  expectedImpact: string;
  implementation: string;
  cost: number;
  timeline: string;
  targetUsers: string[];
  successMetrics: string[];
}

// UserRow為Filter器
export interface UserBehaviorFilter {
  userIds?: string[];
  eventTypes?: UserBehaviorEventType[];
  startTime?: number;
  endTime?: number;
  dateRange?: {
    start: number;
    end: number;
  };
  userTypes?: string[];
  experienceLevels?: string[];
  categories?: string[];
  priceRanges?: {
    min: number;
    max: number;
    currency: string;
  }[];
  platforms?: string[];
  locations?: string[];
  engagementLevels?: 'low' | 'medium' | 'high';
  conversionStatus?: 'converted' | 'non_converted';
  activityLevels?: 'inactive' | 'low' | 'medium' | 'high';
}

// UserRow為ExportOptions
export interface UserBehaviorExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeEvents: boolean;
  includePatterns: boolean;
  includeProfiles: boolean;
  includeInsights: boolean;
  includeRecommendations: boolean;
  compression: boolean;
  anonymize: boolean;
}

// UserRow為Alert
export interface UserBehaviorAlert {
  id: string;
  name: string;
  description: string;
  condition: {
    metric: string;
    timeWindow: number;
    aggregation: 'count' | 'avg' | 'sum' | 'min' | 'max';
  };
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  enabled: boolean;
  notificationChannels: string[];
  triggerCount: number;
  lastTriggered?: number;
}

// UserRow為AnalysisResponse
export interface UserBehaviorAnalysisResponse {
  events: UserBehaviorEvent[];
  patterns: UserBehaviorPattern[];
  profiles: UserProfile[];
  stats: UserBehaviorStats;
  insights: UserBehaviorInsight[];
  recommendations: UserBehaviorRecommendation[];
  alerts: UserBehaviorAlert[];
  metadata: {
    totalEvents: number;
    analysisTime: number;
    dataQuality: number;
    confidence: number;
  };
}

// UserRow為TraceOptions
export interface UserBehaviorTrackingOptions {
  trackPageViews: boolean;
  trackClicks: boolean;
  trackScrolls: boolean;
  trackTimeOnPage: boolean;
  trackFormInteractions: boolean;
  trackErrors: boolean;
  trackPerformance: boolean;
  trackCustomEvents: boolean;
  respectPrivacy: boolean;
  anonymizeData: boolean;
}

// UserRow為Analysis指標
export interface UserBehaviorMetrics {
  // 基礎指標
  totalEvents: number;
  uniqueUsers: number;
  activeSessions: number;
  averageSessionDuration: number;

  // 參與度指標
  pageViewsPerSession: number;
  averageTimeOnPage: number;
  bounceRate: number;
  returnRate: number;

  // 轉化指標
  conversionRate: number;
  funnelConversion: {
    step1: number;
    step2: number;
    step3: number;
    step4: number;
  };

  // User價Value指標
  averageUserValue: number;
  customerLifetimeValue: number;
  revenuePerUser: number;

  // 留存指標
  retentionRates: {
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  };

  // Row為指標
  searchBehavior: {
    averageSearchesPerSession: number;
    popularSearchTerms: string[];
    searchRefinementRate: number;
  };

  collectionBehavior: {
    averageCardsPerCollection: number;
    collectionGrowthRate: number;
    popularCategories: string[];
  };

  purchaseBehavior: {
    averageOrderValue: number;
    purchaseFrequency: number;
    preferredPaymentMethods: string[];
  };
}
