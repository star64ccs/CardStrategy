// 反饋系統Class型定義

// 反饋Class型枚舉
export enum FeedbackType {
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
  USER_EXPERIENCE = 'user_experience',
  PERFORMANCE_ISSUE = 'performance_issue',
  GENERAL_FEEDBACK = 'general_feedback',
  SURVEY_RESPONSE = 'survey_response',
}

// 反饋優先級枚舉
export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 反饋Status枚舉
export enum FeedbackStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

// 反饋分Class枚舉
export enum FeedbackCategory {
  UI_UX = 'ui_ux',
  FUNCTIONALITY = 'functionality',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  ACCESSIBILITY = 'accessibility',
  INTEGRATION = 'integration',
  DOCUMENTATION = 'documentation',
  OTHER = 'other',
}

// User滿意度評分
export enum SatisfactionRating {
  VERY_DISSATISFIED = 1,
  DISSATISFIED = 2,
  NEUTRAL = 3,
  SATISFIED = 4,
  VERY_SATISFIED = 5,
}

// 反饋DataInterface
export interface FeedbackData {
  id: string;
  type: FeedbackType;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  title: string;
  description: string;
  userEmail?: string;
  userName?: string;
  userId?: string;
  userAgent?: string;
  platform: 'ios' | 'android' | 'web';
  version: string;
  timestamp: number;
  location?: string;
  metadata?: Record<string, any>;
  attachments?: FeedbackAttachment[];
  tags?: string[];
  satisfactionRating?: SatisfactionRating;
  followUpRequired?: boolean;
  assignedTo?: string;
  estimatedResolutionTime?: number;
  actualResolutionTime?: number;
  resolutionNotes?: string;
  userFeedback?: string;
}

// 反饋附件Interface
export interface FeedbackAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'log';
  size: number;
  url: string;
  uploadedAt: number;
}

// 反饋ConfigureInterface
export interface FeedbackConfig {
  enabled: boolean;
  autoCollect: boolean;
  requireAuthentication: boolean;
  allowAnonymous: boolean;
  maxAttachments: number;
  maxAttachmentSize: number;
  allowedFileTypes: string[];
  categories: FeedbackCategory[];
  priorities: FeedbackPriority[];
  satisfactionSurvey: boolean;
  followUpEnabled: boolean;
  autoAssignment: boolean;
  notificationEnabled: boolean;
  analyticsEnabled: boolean;
  retentionDays: number;
  privacySettings: FeedbackPrivacySettings;
}

// 反饋隱私Settings
export interface FeedbackPrivacySettings {
  collectUserInfo: boolean;
  collectLocation: boolean;
  collectDeviceInfo: boolean;
  collectUsageData: boolean;
  anonymizeData: boolean;
  dataRetentionPeriod: number;
  allowDataSharing: boolean;
  gdprCompliant: boolean;
}

// 反饋Table單Interface
export interface FeedbackFormData {
  type: FeedbackType;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  title: string;
  description: string;
  userEmail?: string;
  userName?: string;
  satisfactionRating?: SatisfactionRating;
  followUpRequired?: boolean;
  attachments?: File[];
  tags?: string[];
}

// 反饋AnalysisDataInterface
export interface FeedbackAnalytics {
  totalFeedbacks: number;
  feedbacksByType: Record<FeedbackType, number>;
  feedbacksByCategory: Record<FeedbackCategory, number>;
  feedbacksByPriority: Record<FeedbackPriority, number>;
  feedbacksByStatus: Record<FeedbackStatus, number>;
  averageSatisfaction: number;
  satisfactionDistribution: Record<SatisfactionRating, number>;
  responseTime: {
    average: number;
    median: number;
    p95: number;
  };
  resolutionTime: {
    average: number;
    median: number;
    p95: number;
  };
  topIssues: {
    category: FeedbackCategory;
    count: number;
    percentage: number;
  }[];
  platformDistribution: Record<string, number>;
  versionDistribution: Record<string, number>;
  trends: {
    date: string;
    count: number;
    satisfaction: number;
  }[];
}

// 反饋Filter器Interface
export interface FeedbackFilter {
  types?: FeedbackType[];
  categories?: FeedbackCategory[];
  priorities?: FeedbackPriority[];
  statuses?: FeedbackStatus[];
  dateRange?: {
    start: number;
    end: number;
  };
  search?: string;
  tags?: string[];
  assignedTo?: string;
  satisfactionRating?: SatisfactionRating;
  platform?: string;
  version?: string;
}

// 反饋SortOptions
export interface FeedbackSort {
  field: 'timestamp' | 'priority' | 'status' | 'satisfactionRating' | 'title';
  direction: 'asc' | 'desc';
}

// 反饋PaginateInterface
export interface FeedbackPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 反饋Query結果Interface
export interface FeedbackQueryResult {
  feedbacks: FeedbackData[];
  pagination: FeedbackPagination;
  analytics: FeedbackAnalytics;
}

// 反饋EventInterface
export interface FeedbackEvent {
  type:
    | 'created'
    | 'updated'
    | 'deleted'
    | 'status_changed'
    | 'assigned'
    | 'resolved';
  feedbackId: string;
  userId?: string;
  timestamp: number;
  data: unknown;
}

// 反饋NotificationInterface
export interface FeedbackNotification {
  id: string;
  type:
    | 'new_feedback'
    | 'status_update'
    | 'assignment'
    | 'resolution'
    | 'follow_up';
  feedbackId: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  actionUrl?: string;
}

// 反饋ReportInterface
export interface FeedbackReport {
  id: string;
  title: string;
  description: string;
  type: 'summary' | 'detailed' | 'trend' | 'comparison';
  dateRange: {
    start: number;
    end: number;
  };
  filters: FeedbackFilter;
  data: FeedbackAnalytics;
  generatedAt: number;
  generatedBy: string;
  format: 'pdf' | 'csv' | 'json' | 'html';
  url?: string;
}

// 反饋ServiceConfigureInterface
export interface FeedbackServiceConfig {
  apiEndpoint: string;
  apiKey?: string;
  timeout: number;
  retryAttempts: number;
  batchSize: number;
  syncInterval: number;
  offlineSupport: boolean;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
}

// React Component Props Interface

// FeedbackForm Component Props
export interface FeedbackFormProps {
  config?: Partial<FeedbackConfig>;
  onSubmit?: (data: FeedbackFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<FeedbackFormData>;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// FeedbackWidget Component Props
export interface FeedbackWidgetProps {
  config?: Partial<FeedbackConfig>;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'small' | 'medium' | 'large';
  showBadge?: boolean;
  badgeCount?: number;
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// FeedbackAnalytics Component Props
export interface FeedbackAnalyticsProps {
  dateRange?: {
    start: number;
    end: number;
  };
  filters?: FeedbackFilter;
  refreshInterval?: number;
  showCharts?: boolean;
  showTable?: boolean;
  showExport?: boolean;
  onExport?: (format: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// FeedbackList Component Props
export interface FeedbackListProps {
  feedbacks: FeedbackData[];
  loading?: boolean;
  error?: string;
  filters?: FeedbackFilter;
  sort?: FeedbackSort;
  pagination?: FeedbackPagination;
  onFilterChange?: (filters: FeedbackFilter) => void;
  onSortChange?: (sort: FeedbackSort) => void;
  onPageChange?: (page: number) => void;
  onFeedbackClick?: (feedback: FeedbackData) => void;
  onFeedbackUpdate?: (feedback: FeedbackData) => void;
  onFeedbackDelete?: (feedbackId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// FeedbackDetail Component Props
export interface FeedbackDetailProps {
  feedback: FeedbackData;
  loading?: boolean;
  error?: string;
  onUpdate?: (feedback: FeedbackData) => void;
  onDelete?: (feedbackId: string) => void;
  onAssign?: (feedbackId: string, userId: string) => void;
  onStatusChange?: (feedbackId: string, status: FeedbackStatus) => void;
  onAddComment?: (feedbackId: string, comment: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Custom Hook ReturnClass型

// useFeedback Hook ReturnClass型
export interface UseFeedbackReturn {
  // Status
  feedbacks: FeedbackData[];
  loading: boolean;
  error: string | null;
  analytics: FeedbackAnalytics | null;

  // Operation
  submitFeedback: (data: FeedbackFormData) => Promise<void>;
  updateFeedback: (id: string, data: Partial<FeedbackData>) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  getFeedback: (id: string) => Promise<FeedbackData | null>;
  getFeedbacks: (
    filters?: FeedbackFilter,
    sort?: FeedbackSort,
    pagination?: Partial<FeedbackPagination>
  ) => Promise<FeedbackQueryResult>;
  getAnalytics: (filters?: FeedbackFilter) => Promise<FeedbackAnalytics>;

  // ToolMethod
  exportReport: (format: string, filters?: FeedbackFilter) => Promise<string>;
  sendNotification: (
    notification: Omit<FeedbackNotification, 'id' | 'timestamp'>
  ) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
}

// useFeedbackService Hook ReturnClass型
export interface UseFeedbackServiceReturn {
  service: unknown; // FeedbackService Instance
  config: FeedbackServiceConfig;
  isInitialized: boolean;
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';

  // ServiceMethod
  initialize: () => Promise<void>;
  sync: () => Promise<void>;
  clearCache: () => Promise<void>;
  updateConfig: (config: Partial<FeedbackServiceConfig>) => void;
}

// useFeedbackState Hook ReturnClass型
export interface UseFeedbackStateReturn {
  // Redux Status
  feedbacks: FeedbackData[];
  analytics: FeedbackAnalytics | null;
  notifications: FeedbackNotification[];
  reports: FeedbackReport[];
  filters: FeedbackFilter;
  sort: FeedbackSort;
  pagination: FeedbackPagination;

  // StatusSelect器
  getFeedbackById: (id: string) => FeedbackData | undefined;
  getFeedbacksByType: (type: FeedbackType) => FeedbackData[];
  getFeedbacksByCategory: (category: FeedbackCategory) => FeedbackData[];
  getFeedbacksByStatus: (status: FeedbackStatus) => FeedbackData[];
  getUnreadNotifications: () => FeedbackNotification[];
  getNotificationsByType: (type: string) => FeedbackNotification[];
}

// useFeedbackActions Hook ReturnClass型
export interface UseFeedbackActionsReturn {
  // Redux 動作
  submitFeedback: (data: FeedbackFormData) => any;
  updateFeedback: (id: string, data: Partial<FeedbackData>) => any;
  deleteFeedback: (id: string) => any;
  fetchFeedbacks: (
    filters?: FeedbackFilter,
    sort?: FeedbackSort,
    pagination?: Partial<FeedbackPagination>
  ) => any;
  fetchAnalytics: (filters?: FeedbackFilter) => any;
  createReport: (report: Omit<FeedbackReport, 'id' | 'generatedAt'>) => any;
  sendNotification: (
    notification: Omit<FeedbackNotification, 'id' | 'timestamp'>
  ) => any;
  markNotificationRead: (notificationId: string) => any;
  updateFilters: (filters: Partial<FeedbackFilter>) => any;
  updateSort: (sort: FeedbackSort) => any;
  updatePagination: (pagination: Partial<FeedbackPagination>) => any;
  clearError: () => any;
  resetState: () => any;
}
