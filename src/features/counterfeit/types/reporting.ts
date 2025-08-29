// 假卡回報系統類型定義

// 舉報類型枚舉
export enum ReportType {
  FAKE_CARD = 'FAKE_CARD',
  COUNTERFEIT = 'COUNTERFEIT',
  REPRINT = 'REPRINT',
  ALTERED = 'ALTERED',
  STOLEN = 'STOLEN',
  SCAM = 'SCAM',
  OTHER = 'OTHER',
}

// 舉報嚴重性枚舉
export enum ReportSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// 舉報狀態枚舉
export enum ReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// 警告類型枚舉
export enum WarningType {
  COMMUNITY_WARNING = 'COMMUNITY_WARNING',
  SELLER_WARNING = 'SELLER_WARNING',
  BUYER_WARNING = 'BUYER_WARNING',
  SYSTEM_WARNING = 'SYSTEM_WARNING',
  ADMIN_WARNING = 'ADMIN_WARNING',
}

// 黑名單類型枚舉
export enum BlacklistType {
  USER = 'USER',
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  IP_ADDRESS = 'IP_ADDRESS',
  DEVICE = 'DEVICE',
}

// 舉報請求接口
export interface ReportRequest {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  cardId?: string;
  reportType: ReportType;
  severity: ReportSeverity;
  title: string;
  description: string;
  evidence: EvidenceItem[];
  location?: string;
  timestamp: Date;
  isAnonymous: boolean;
  contactInfo?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

// 證據項目接口
export interface EvidenceItem {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LINK' | 'TEXT';
  url?: string;
  content?: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  description?: string;
  timestamp: Date;
}

// 舉報響應接口
export interface ReportResponse {
  id: string;
  reportId: string;
  status: ReportStatus;
  assignedTo?: string;
  reviewNotes?: string;
  actionTaken?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

// 舉報記錄接口
export interface ReportRecord {
  id: string;
  report: ReportRequest;
  response: ReportResponse;
  warnings: Warning[];
  blacklistEntries: BlacklistEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// 警告接口
export interface Warning {
  id: string;
  type: WarningType;
  targetId: string; // 用戶ID或實體ID
  targetType: 'USER' | 'SELLER' | 'BUYER' | 'CARD' | 'LISTING';
  title: string;
  message: string;
  severity: ReportSeverity;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

// 黑名單條目接口
export interface BlacklistEntry {
  id: string;
  type: BlacklistType;
  targetId: string;
  targetValue: string; // 用戶ID、IP地址、設備ID等
  reason: string;
  severity: ReportSeverity;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
  removedAt?: Date;
  removedBy?: string;
  removalReason?: string;
}

// 社區警告接口
export interface CommunityWarning {
  id: string;
  title: string;
  message: string;
  severity: ReportSeverity;
  targetAudience: 'ALL' | 'SELLERS' | 'BUYERS' | 'SPECIFIC_GROUP';
  targetGroupIds?: string[];
  isActive: boolean;
  displayFrom: Date;
  displayUntil?: Date;
  createdAt: Date;
  createdBy: string;
  acknowledgedCount: number;
  dismissedCount: number;
}

// 舉報統計接口
export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  rejectedReports: number;
  averageResolutionTime: number; // 小時
  reportsByType: Record<ReportType, number>;
  reportsBySeverity: Record<ReportSeverity, number>;
  reportsByStatus: Record<ReportStatus, number>;
  topReporters: {
    userId: string;
    username: string;
    reportCount: number;
    validReports: number;
  }[];
  topReportedUsers: {
    userId: string;
    username: string;
    reportCount: number;
    resolvedReports: number;
  }[];
}

// 舉報配置接口
export interface ReportConfig {
  autoApproveThreshold: number;
  manualReviewThreshold: number;
  warningThreshold: number;
  blacklistThreshold: number;
  maxReportsPerUser: number;
  maxReportsPerDay: number;
  reportExpirationDays: number;
  warningExpirationDays: number;
  blacklistExpirationDays: number;
  enableAnonymousReports: boolean;
  requireEvidence: boolean;
  minEvidenceCount: number;
  maxEvidenceSize: number; // MB
  allowedEvidenceTypes: string[];
}

// 舉報服務配置接口
export interface ReportServiceConfig {
  enabled: boolean;
  config: ReportConfig;
  moderators: string[];
  admins: string[];
  autoModerationEnabled: boolean;
  aiModerationEnabled: boolean;
  notificationEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  webhookUrl?: string;
  retentionDays: number;
  backupEnabled: boolean;
}

// 舉報查詢參數接口
export interface ReportQueryParams {
  status?: ReportStatus[];
  type?: ReportType[];
  severity?: ReportSeverity[];
  reporterId?: string;
  reportedUserId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'severity' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

// 舉報過濾器接口
export interface ReportFilter {
  status: ReportStatus[];
  type: ReportType[];
  severity: ReportSeverity[];
  dateRange: {
    from: Date;
    to: Date;
  };
  assignedTo?: string;
  hasEvidence: boolean;
  isAnonymous: boolean;
}

// 舉報導出接口
export interface ReportExport {
  id: string;
  format: 'CSV' | 'JSON' | 'PDF' | 'EXCEL';
  filters: ReportFilter;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  fileSize?: number;
  recordCount?: number;
}

// 舉報通知接口
export interface ReportNotification {
  id: string;
  type:
    | 'REPORT_CREATED'
    | 'REPORT_UPDATED'
    | 'REPORT_RESOLVED'
    | 'WARNING_ISSUED'
    | 'BLACKLIST_ADDED';
  targetUserId: string;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

// 舉報審核日誌接口
export interface ReportAuditLog {
  id: string;
  reportId: string;
  action:
    | 'CREATED'
    | 'UPDATED'
    | 'STATUS_CHANGED'
    | 'ASSIGNED'
    | 'RESOLVED'
    | 'CLOSED';
  userId: string;
  username: string;
  oldValue?: unknown;
  newValue?: unknown;
  notes?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}
