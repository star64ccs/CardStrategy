// 用戶體驗監控系統類型定義

// 基礎枚舉
export enum UserActionType {
  CLICK = 'click',
  SCROLL = 'scroll',
  INPUT = 'input',
  NAVIGATE = 'navigate',
  SUBMIT = 'submit',
  HOVER = 'hover',
  FOCUS = 'focus',
  BLUR = 'blur',
  RESIZE = 'resize',
  VISIBILITY_CHANGE = 'visibility_change',
}

export enum PerformanceMetricType {
  PAGE_LOAD = 'page_load',
  RESOURCE_LOAD = 'resource_load',
  INTERACTION = 'interaction',
  MEMORY_USAGE = 'memory_usage',
  CPU_USAGE = 'cpu_usage',
  NETWORK_LATENCY = 'network_latency',
  FRAME_RATE = 'frame_rate',
  LAYOUT_SHIFT = 'layout_shift',
  FIRST_INPUT_DELAY = 'first_input_delay',
  LARGEST_CONTENTFUL_PAINT = 'largest_contentful_paint',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorType {
  JAVASCRIPT = 'javascript',
  NETWORK = 'network',
  RESOURCE = 'resource',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
  API = 'api',
  RUNTIME = 'runtime',
}

export enum SatisfactionLevel {
  VERY_DISSATISFIED = 1,
  DISSATISFIED = 2,
  NEUTRAL = 3,
  SATISFIED = 4,
  VERY_SATISFIED = 5,
}

export enum ABTestStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  DRAFT = 'draft',
}

export enum ABTestType {
  FEATURE = 'feature',
  UI = 'ui',
  CONTENT = 'content',
  PRICING = 'pricing',
  FLOW = 'flow',
}

// 用戶行為追蹤
export interface UserAction {
  id: string;
  type: UserActionType;
  elementId?: string;
  elementType?: string;
  elementText?: string;
  elementClasses?: string[];
  timestamp: number;
  sessionId: string;
  userId?: string;
  pageUrl: string;
  pageTitle: string;
  coordinates?: {
    x: number;
    y: number;
  };
  metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: number;
  actions: UserAction[];
  deviceInfo: DeviceInfo;
  location?: GeoLocation;
  referrer?: string;
  userAgent: string;
  screenResolution: {
    width: number;
    height: number;
  };
  viewportSize: {
    width: number;
    height: number;
  };
}

export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web' | 'desktop';
  os: string;
  osVersion: string;
  browser?: string;
  browserVersion?: string;
  deviceModel?: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  connectionType?: 'wifi' | '4g' | '3g' | '2g' | 'unknown';
  connectionSpeed?: number;
}

export interface GeoLocation {
  country: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
}

// 性能監控
export interface PerformanceMetric {
  id: string;
  type: PerformanceMetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  pageUrl: string;
  metadata?: Record<string, any>;
}

export interface PageLoadMetrics {
  navigationStart: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domLoading: number;
  domInteractive: number;
  domContentLoaded: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export interface ResourceLoadMetrics {
  url: string;
  type: string;
  size: number;
  duration: number;
  startTime: number;
  endTime: number;
  status: number;
  statusText: string;
}

// 錯誤追蹤
export interface ErrorEvent {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  filename?: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  pageUrl: string;
  userAgent: string;
  deviceInfo: DeviceInfo;
  breadcrumbs: ErrorBreadcrumb[];
  context: ErrorContext;
  tags?: Record<string, string>;
}

export interface ErrorBreadcrumb {
  type: string;
  message: string;
  data?: Record<string, any>;
  timestamp: number;
  level: 'debug' | 'info' | 'warning' | 'error';
}

export interface ErrorContext {
  user: {
    id?: string;
    email?: string;
    username?: string;
  };
  tags: Record<string, string>;
  extra: Record<string, any>;
  request?: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body?: unknown;
  };
}

// 滿意度調查
export interface SatisfactionSurvey {
  id: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  pageUrl: string;
  overallSatisfaction: SatisfactionLevel;
  easeOfUse: SatisfactionLevel;
  performance: SatisfactionLevel;
  design: SatisfactionLevel;
  functionality: SatisfactionLevel;
  comments?: string;
  wouldRecommend: boolean;
  issues?: string[];
  suggestions?: string[];
  metadata?: Record<string, any>;
}

// A/B 測試
export interface ABTest {
  id: string;
  name: string;
  description: string;
  type: ABTestType;
  status: ABTestStatus;
  startDate: number;
  endDate?: number;
  variants: ABTestVariant[];
  trafficAllocation: number; // 0-100
  targetAudience?: ABTestAudience;
  goals: ABTestGoal[];
  results?: ABTestResults;
  createdAt: number;
  updatedAt: number;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficPercentage: number;
  configuration: Record<string, any>;
  isControl: boolean;
}

export interface ABTestAudience {
  userSegments?: string[];
  deviceTypes?: string[];
  locations?: string[];
  userProperties?: Record<string, any>;
  customRules?: string[];
}

export interface ABTestGoal {
  id: string;
  name: string;
  type: 'conversion' | 'engagement' | 'revenue' | 'custom';
  metric: string;
  target?: number;
  weight: number;
}

export interface ABTestResults {
  totalUsers: number;
  variantResults: Record<string, ABTestVariantResult>;
  statisticalSignificance: number;
  winner?: string;
  confidence: number;
  pValue: number;
}

export interface ABTestVariantResult {
  variantId: string;
  users: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
  averageOrderValue?: number;
  engagementMetrics?: Record<string, number>;
  goalResults: Record<string, number>;
}

export interface ABTestAssignment {
  testId: string;
  variantId: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  isNewUser: boolean;
}

// 監控配置
export interface UXMonitoringConfig {
  enabled: boolean;
  samplingRate: number; // 0-1
  privacySettings: PrivacySettings;
  performanceMonitoring: PerformanceMonitoringConfig;
  errorTracking: ErrorTrackingConfig;
  userBehaviorTracking: UserBehaviorTrackingConfig;
  satisfactionSurvey: SatisfactionSurveyConfig;
  abTesting: ABTestingConfig;
  dataRetention: DataRetentionConfig;
}

export interface PrivacySettings {
  anonymizeData: boolean;
  respectDoNotTrack: boolean;
  cookieConsent: boolean;
  dataRetentionDays: number;
  allowPersonalData: boolean;
  complianceMode: 'gdpr' | 'ccpa' | 'pipeda' | 'lgpd' | 'none';
}

export interface PerformanceMonitoringConfig {
  enabled: boolean;
  metrics: PerformanceMetricType[];
  thresholds: Record<PerformanceMetricType, number>;
  samplingRate: number;
  batchSize: number;
  flushInterval: number;
}

export interface ErrorTrackingConfig {
  enabled: boolean;
  captureUnhandledErrors: boolean;
  capturePromiseRejections: boolean;
  captureNetworkErrors: boolean;
  maxBreadcrumbs: number;
  ignoreErrors: string[];
  severityThreshold: ErrorSeverity;
}

export interface UserBehaviorTrackingConfig {
  enabled: boolean;
  trackClicks: boolean;
  trackScrolls: boolean;
  trackInputs: boolean;
  trackNavigation: boolean;
  trackHovers: boolean;
  trackResizes: boolean;
  maxActionsPerSession: number;
  sensitiveElements: string[];
}

export interface SatisfactionSurveyConfig {
  enabled: boolean;
  triggerType: 'time' | 'action' | 'page' | 'manual';
  triggerValue: number | string;
  questions: SatisfactionQuestion[];
  showFrequency: number; // 每N次訪問顯示一次
  maxSurveysPerUser: number;
}

export interface SatisfactionQuestion {
  id: string;
  type: 'rating' | 'boolean' | 'text' | 'multiple_choice';
  question: string;
  required: boolean;
  options?: string[];
  minRating?: number;
  maxRating?: number;
}

export interface ABTestingConfig {
  enabled: boolean;
  maxActiveTests: number;
  trafficAllocationLimit: number;
  statisticalSignificanceThreshold: number;
  minimumSampleSize: number;
  testDuration: number; // 天數
}

export interface DataRetentionConfig {
  userActions: number; // 天數
  performanceMetrics: number;
  errorEvents: number;
  satisfactionSurveys: number;
  abTestResults: number;
  sessions: number;
}

// 監控數據
export interface UXMonitoringData {
  sessions: UserSession[];
  performanceMetrics: PerformanceMetric[];
  errorEvents: ErrorEvent[];
  satisfactionSurveys: SatisfactionSurvey[];
  abTestAssignments: ABTestAssignment[];
  abTests: ABTest[];
}

// 分析結果
export interface UXAnalytics {
  sessionAnalytics: SessionAnalytics;
  performanceAnalytics: PerformanceAnalytics;
  errorAnalytics: ErrorAnalytics;
  satisfactionAnalytics: SatisfactionAnalytics;
  abTestAnalytics: ABTestAnalytics;
  userJourneyAnalytics: UserJourneyAnalytics;
}

export interface SessionAnalytics {
  totalSessions: number;
  averageSessionDuration: number;
  averagePageViews: number;
  bounceRate: number;
  sessionTrends: TimeSeriesData[];
  topPages: PageAnalytics[];
  userRetention: RetentionData[];
}

export interface PerformanceAnalytics {
  averagePageLoadTime: number;
  averageResourceLoadTime: number;
  performanceDistribution: Record<PerformanceMetricType, number[]>;
  slowPages: PagePerformance[];
  performanceTrends: TimeSeriesData[];
  resourceOptimization: ResourceOptimization[];
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorRate: number;
  errorDistribution: Record<ErrorType, number>;
  errorTrends: TimeSeriesData[];
  topErrors: ErrorSummary[];
  errorImpact: ErrorImpact[];
}

export interface SatisfactionAnalytics {
  averageSatisfaction: number;
  satisfactionDistribution: Record<SatisfactionLevel, number>;
  satisfactionTrends: TimeSeriesData[];
  topIssues: string[];
  improvementSuggestions: string[];
  netPromoterScore: number;
}

export interface ABTestAnalytics {
  activeTests: number;
  completedTests: number;
  testResults: ABTestResults[];
  conversionImprovements: ConversionImprovement[];
  revenueImpact: RevenueImpact[];
}

export interface UserJourneyAnalytics {
  commonPaths: UserPath[];
  dropoffPoints: DropoffPoint[];
  conversionFunnels: ConversionFunnel[];
  userSegments: UserSegment[];
}

// 輔助類型
export interface TimeSeriesData {
  timestamp: number;
  value: number;
  label: string;
}

export interface PageAnalytics {
  url: string;
  title: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
}

export interface RetentionData {
  day: number;
  retentionRate: number;
  users: number;
}

export interface PagePerformance {
  url: string;
  averageLoadTime: number;
  p95LoadTime: number;
  errorRate: number;
  userCount: number;
}

export interface ResourceOptimization {
  resourceType: string;
  averageSize: number;
  averageLoadTime: number;
  optimizationPotential: number;
  recommendations: string[];
}

export interface ErrorSummary {
  message: string;
  count: number;
  frequency: number;
  lastOccurrence: number;
  affectedUsers: number;
}

export interface ErrorImpact {
  errorType: string;
  userImpact: number;
  businessImpact: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConversionImprovement {
  testId: string;
  testName: string;
  improvement: number;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface RevenueImpact {
  testId: string;
  revenueIncrease: number;
  conversionRateIncrease: number;
  averageOrderValueIncrease: number;
}

export interface UserPath {
  path: string[];
  frequency: number;
  conversionRate: number;
  averageTime: number;
}

export interface DropoffPoint {
  page: string;
  dropoffRate: number;
  usersLost: number;
  potentialCauses: string[];
}

export interface ConversionFunnel {
  name: string;
  steps: FunnelStep[];
  conversionRate: number;
  totalConversions: number;
}

export interface FunnelStep {
  name: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: Record<string, any>;
  userCount: number;
  behaviorPatterns: Record<string, any>;
}

// React 組件 Props
export interface UXMonitoringProviderProps {
  config: UXMonitoringConfig;
  children: React.ReactNode;
}

export interface PerformanceMonitorProps {
  enabled?: boolean;
  metrics?: PerformanceMetricType[];
  onMetric?: (metric: PerformanceMetric) => void;
  children: React.ReactNode;
}

export interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  children: React.ReactNode;
}

export interface SatisfactionSurveyProps {
  config: SatisfactionSurveyConfig;
  onComplete?: (survey: SatisfactionSurvey) => void;
  onDismiss?: () => void;
  visible?: boolean;
}

export interface ABTestProviderProps {
  tests: ABTest[];
  onAssignment?: (assignment: ABTestAssignment) => void;
  children: React.ReactNode;
}

export interface UXMonitoringDashboardProps {
  analytics: UXAnalytics;
  config: UXMonitoringConfig;
  onConfigChange?: (config: UXMonitoringConfig) => void;
}

// 自定義 Hook 返回類型
export interface UseUXMonitoringReturn {
  trackAction: (
    action: Omit<UserAction, 'id' | 'timestamp' | 'sessionId'>
  ) => void;
  trackError: (error: Error, context?: Partial<ErrorContext>) => void;
  trackPerformance: (
    metric: Omit<PerformanceMetric, 'id' | 'timestamp' | 'sessionId'>
  ) => void;
  submitSatisfaction: (
    survey: Omit<SatisfactionSurvey, 'id' | 'timestamp' | 'sessionId'>
  ) => void;
  getABTestVariant: (testId: string) => string | null;
  getAnalytics: () => UXAnalytics;
  getConfig: () => UXMonitoringConfig;
  updateConfig: (config: Partial<UXMonitoringConfig>) => void;
}

export interface UsePerformanceMonitoringReturn {
  metrics: PerformanceMetric[];
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  getMetrics: (type?: PerformanceMetricType) => PerformanceMetric[];
  clearMetrics: () => void;
}

export interface UseErrorTrackingReturn {
  errors: ErrorEvent[];
  errorRate: number;
  trackError: (error: Error, context?: Partial<ErrorContext>) => void;
  clearErrors: () => void;
  getErrorAnalytics: () => ErrorAnalytics;
}

export interface UseSatisfactionSurveyReturn {
  surveys: SatisfactionSurvey[];
  averageSatisfaction: number;
  submitSurvey: (
    survey: Omit<SatisfactionSurvey, 'id' | 'timestamp' | 'sessionId'>
  ) => void;
  shouldShowSurvey: () => boolean;
  getSatisfactionAnalytics: () => SatisfactionAnalytics;
}

export interface UseABTestingReturn {
  tests: ABTest[];
  assignments: ABTestAssignment[];
  getVariant: (testId: string) => string | null;
  trackConversion: (testId: string, goalId: string, value?: number) => void;
  getTestResults: (testId: string) => ABTestResults | null;
}
