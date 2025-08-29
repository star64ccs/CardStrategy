// 用戶反饋相關類型定義

// 反饋類型
export type FeedbackType =
  | 'bug_report' // 錯誤報告
  | 'feature_request' // 功能請求
  | 'improvement' // 改進建議
  | 'general' // 一般反饋
  | 'compliment' // 讚美
  | 'complaint'; // 投訴

// 反饋優先級
export type FeedbackPriority =
  | 'low' // 低優先級
  | 'medium' // 中優先級
  | 'high' // 高優先級
  | 'critical'; // 緊急

// 反饋狀態
export type FeedbackStatus =
  | 'pending' // 待處理
  | 'in_review' // 審核中
  | 'in_progress' // 處理中
  | 'resolved' // 已解決
  | 'closed' // 已關閉
  | 'rejected'; // 已拒絕

// 反饋分類
export type FeedbackCategory =
  | 'ui_ux' // 用戶界面/體驗
  | 'performance' // 性能問題
  | 'functionality' // 功能問題
  | 'ai_features' // AI 功能
  | 'scanning' // 掃描功能
  | 'pricing' // 價格相關
  | 'notifications' // 通知系統
  | 'data_accuracy' // 數據準確性
  | 'security' // 安全問題
  | 'other'; // 其他

// 用戶反饋
export interface UserFeedback {
  id: string;
  userId: string;
  type: FeedbackType;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  title: string;
  description: string;
  attachments?: string[]; // 附件 URL
  deviceInfo: {
    platform: 'ios' | 'android' | 'web';
    version: string;
    model?: string;
    osVersion?: string;
  };
  appInfo: {
    version: string;
    buildNumber: string;
  };
  location?: {
    screen: string;
    action?: string;
  };
  metadata?: {
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  response?: FeedbackResponse;
  tags?: string[];
  votes: number;
  isAnonymous: boolean;
}

// 反饋回應
export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  responderId: string;
  responderName: string;
  responderRole: 'admin' | 'moderator' | 'support';
  message: string;
  isInternal: boolean; // 是否為內部回應
  createdAt: string;
  updatedAt: string;
}

// 反饋統計
export interface FeedbackStats {
  total: number;
  byType: Record<FeedbackType, number>;
  byCategory: Record<FeedbackCategory, number>;
  byStatus: Record<FeedbackStatus, number>;
  byPriority: Record<FeedbackPriority, number>;
  recentTrends: {
    date: string;
    count: number;
  }[];
  averageResponseTime: number; // 平均回應時間（小時）
  resolutionRate: number; // 解決率（百分比）
}

// 功能請求
export interface FeatureRequest extends UserFeedback {
  type: 'feature_request';
  impact: 'low' | 'medium' | 'high'; // 影響程度
  effort: 'low' | 'medium' | 'high'; // 開發難度
  targetVersion?: string; // 目標版本
  alternatives?: string[]; // 替代方案
  useCases: string[]; // 使用場景
  benefits: string[]; // 預期好處
}

// 錯誤報告
export interface BugReport extends UserFeedback {
  type: 'bug_report';
  severity: 'low' | 'medium' | 'high' | 'critical'; // 嚴重程度
  reproducibility: 'always' | 'sometimes' | 'rarely' | 'once'; // 重現頻率
  steps: string[]; // 重現步驟
  expectedBehavior: string; // 預期行為
  actualBehavior: string; // 實際行為
  errorLogs?: string; // 錯誤日誌
  crashReport?: string; // 崩潰報告
}

// 反饋過濾器
export interface FeedbackFilter {
  type?: FeedbackType[];
  category?: FeedbackCategory[];
  status?: FeedbackStatus[];
  priority?: FeedbackPriority[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  assignedTo?: string;
  tags?: string[];
}

// 反饋排序
export type FeedbackSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'priority'
  | 'votes'
  | 'status';

export type FeedbackSortOrder = 'asc' | 'desc';

// 反饋查詢參數
export interface FeedbackQueryParams {
  page?: number;
  limit?: number;
  filter?: FeedbackFilter;
  sortBy?: FeedbackSortBy;
  sortOrder?: FeedbackSortOrder;
}

// 反饋創建請求
export interface CreateFeedbackRequest {
  type: FeedbackType;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  title: string;
  description: string;
  attachments?: File[];
  isAnonymous?: boolean;
  tags?: string[];
  // 特定類型的額外字段
  impact?: 'low' | 'medium' | 'high';
  effort?: 'low' | 'medium' | 'high';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  reproducibility?: 'always' | 'sometimes' | 'rarely' | 'once';
  steps?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  useCases?: string[];
  benefits?: string[];
}

// 反饋更新請求
export interface UpdateFeedbackRequest {
  title?: string;
  description?: string;
  priority?: FeedbackPriority;
  status?: FeedbackStatus;
  tags?: string[];
  assignedTo?: string;
}

// 反饋回應請求
export interface CreateFeedbackResponseRequest {
  feedbackId: string;
  message: string;
  isInternal?: boolean;
}

// 反饋投票
export interface FeedbackVote {
  id: string;
  feedbackId: string;
  userId: string;
  vote: 1 | -1; // 1 = 贊成, -1 = 反對
  createdAt: string;
}

// 反饋標籤
export interface FeedbackTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  usageCount: number;
  createdAt: string;
}

// 反饋模板
export interface FeedbackTemplate {
  id: string;
  name: string;
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  description: string;
  fields: {
    name: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file';
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 反饋通知設置
export interface FeedbackNotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyOnStatusChange: boolean;
  notifyOnResponse: boolean;
  notifyOnAssignment: boolean;
  digestFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

// 反饋分析報告
export interface FeedbackAnalysisReport {
  period: {
    start: string;
    end: string;
  };
  stats: FeedbackStats;
  topIssues: {
    category: FeedbackCategory;
    count: number;
    percentage: number;
  }[];
  userSatisfaction: {
    score: number; // 1-10
    trend: 'improving' | 'stable' | 'declining';
    factors: string[];
  };
  responseMetrics: {
    averageResponseTime: number;
    resolutionTime: number;
    satisfactionScore: number;
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
  }[];
}
