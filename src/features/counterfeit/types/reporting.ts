// False卡回報系統Class型定義

// 舉報Class型枚舉
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

// 舉報Status枚舉
export enum ReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// WarningClass型枚舉
export enum WarningType {
  COMMUNITY_WARNING = 'COMMUNITY_WARNING',
  SELLER_WARNING = 'SELLER_WARNING',
  BUYER_WARNING = 'BUYER_WARNING',
  SYSTEM_WARNING = 'SYSTEM_WARNING',
  ADMIN_WARNING = 'ADMIN_WARNING',
}

// 黑名單Class型枚舉
export enum BlacklistType {
  USER = 'USER',
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  IP_ADDRESS = 'IP_ADDRESS',
  DEVICE = 'DEVICE',
}

// 舉報RequestInterface
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

// 證據項目Interface
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

// 舉報ResponseInterface
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

// 舉報RecordInterface
export interface ReportRecord {
  id: string;
  report: ReportRequest;
  response: ReportResponse;
  warnings: Warning[];
  blacklistEntries: BlacklistEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// WarningInterface
export interface Warning {
  id: string;
  type: WarningType;
  targetId: string; // UserID或實體ID
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

// 黑名單條目Interface
export interface BlacklistEntry {
  id: string;
  type: BlacklistType;
  targetId: string;
  targetValue: string; // UserID、IPAddress、設備ID等
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

// 社DistrictWarningInterface
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

// 舉報StatisticsInterface
export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  rejectedReports: number;
  averageResolutionTime: number; // Hour
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

// 舉報ConfigureInterface
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

// 舉報ServiceConfigureInterface
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

// 舉報QueryParameterInterface
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

// 舉報Filter器Interface
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

// 舉報ExportInterface
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

// 舉報NotificationInterface
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

// 舉報審核LogInterface
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
