// 審計Log系統Class型定義

// 審計EventClass型
export type AuditEventType =
  // User相OffEvent
  | 'user_login' // UserLogin
  | 'user_logout' // User登出
  | 'user_register' // UserRegister
  | 'user_profile_update' // User資料Update
  | 'user_password_change' // Password變更
  | 'user_account_delete' // 帳戶Delete
  | 'user_permission_change' // 權限變更

  // 卡片相OffEvent
  | 'card_scan' // 卡片掃描
  | 'card_add' // Add卡片
  | 'card_update' // Update卡片
  | 'card_delete' // Delete卡片
  | 'card_favorite' // 收藏卡片
  | 'card_share' // 分享卡片
  | 'card_price_monitor' // 價格Monitor

  // 投資相OffEvent
  | 'investment_create' // Create投資
  | 'investment_update' // Update投資
  | 'investment_delete' // Delete投資
  | 'portfolio_view' // 查看投資組合
  | 'portfolio_export' // Export投資組合

  // 支付相OffEvent
  | 'payment_method_add' // Add支付方式
  | 'payment_method_update' // Update支付方式
  | 'payment_method_delete' // Delete支付方式
  | 'payment_process' // Handle支付
  | 'subscription_create' // Create訂閱
  | 'subscription_cancel' // Cancel訂閱

  // Data相OffEvent
  | 'data_export' // DataExport
  | 'data_import' // DataImport
  | 'data_backup' // DataBackup
  | 'data_restore' // DataRestore
  | 'data_breach' // Data洩露

  // 系統ManageEvent
  | 'admin_login' // Manage員Login
  | 'admin_action' // Manage員Operation
  | 'system_config_change' // 系統Configure變更
  | 'user_management' // UserManage
  | 'system_backup' // 系統Backup

  // 安全相OffEvent
  | 'security_alert' // 安全Alert
  | 'failed_login_attempt' // LoginFailed嘗試
  | 'suspicious_activity' // 可疑活動
  | 'api_rate_limit_exceeded' // API速率Limit超標

  // AI相OffEvent
  | 'ai_analysis_request' // AIAnalysisRequest
  | 'ai_model_update' // AI模型Update
  | 'ai_prediction_request' // AI預測Request

  // Notification相OffEvent
  | 'notification_sent' // SendNotification
  | 'notification_failed' // NotificationFailed
  | 'notification_preference_change' // NotificationPreferences變更

  // 隱私相OffEvent
  | 'privacy_setting_change' // 隱私Settings變更
  | 'consent_given' // AgreeAuthorize
  | 'consent_withdrawn' // 撤回Agree
  | 'data_rights_request' // Data權利Request

  // 其他Event
  | 'app_error' // ApplyError
  | 'performance_issue' // 性能問題
  | 'third_party_integration' // 第三方集成
  | 'unknown'; // 未知Event

// 審計Event嚴重性等級
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

// 審計EventStatus
export type AuditEventStatus = 'success' | 'failure' | 'pending' | 'cancelled';

// UserOperation結果
export type OperationResult =
  | 'success'
  | 'failure'
  | 'partial_success'
  | 'timeout';

// 審計Event詳細Information
export interface AuditEvent {
  id: string; // EventUnique標識
  eventType: AuditEventType; // EventClass型
  severity: AuditSeverity; // 嚴重性等級
  status: AuditEventStatus; // EventStatus
  result: OperationResult; // Operation結果

  // UserInformation
  userId?: string; // UserID
  userEmail?: string; // UserEmail
  userRole?: string; // User角色
  userAgent?: string; // User代理
  ipAddress?: string; // IPAddress
  location?: string; // 地理位置

  // Event詳情
  title: string; // Event標題
  description: string; // EventDescription
  details?: Record<string, any>; // 詳細Information
  metadata?: Record<string, any>; // 元Data

  // ResourceInformation
  resourceType?: string; // ResourceClass型
  resourceId?: string; // ResourceID
  resourceName?: string; // Resource名稱

  // TimeInformation
  timestamp: Date; // EventTime戳
  duration?: number; // Operation持續Time（毫Second）

  // 系統Information
  sessionId?: string; // 會話ID
  requestId?: string; // RequestID
  traceId?: string; // TraceID

  // ErrorInformation
  errorCode?: string; // Error代碼
  errorMessage?: string; // ErrorMessage
  stackTrace?: string; // 堆疊Trace

  // 合規Information
  complianceTags?: string[]; // 合規Tag
  regulatoryRequirements?: string[]; // 法規要求

  // 審計Information
  auditTrail?: string[]; // 審計Trace
  relatedEvents?: string[]; // 相OffEventID

  createdAt: Date; // CreateTime
  updatedAt: Date; // UpdateTime
}

// 審計LogConfigure
export interface AuditLogConfig {
  enabled: boolean; // YesNoEnable審計Log
  logLevel: AuditSeverity; // Log級別
  retentionDays: number; // 保留天數
  maxLogSize: number; // 最大Log大小（MB）
  compressionEnabled: boolean; // YesNoEnable壓縮
  encryptionEnabled: boolean; // YesNoEnableEncrypt

  // FilterConfigure
  excludeEvents: AuditEventType[]; // 排除的EventClass型
  includeOnlyEvents: AuditEventType[]; // 僅Package含的EventClass型

  // NotificationConfigure
  alertOnCritical: boolean; // 嚴重EventAlert
  alertOnHigh: boolean; // 高級EventAlert
  notificationChannels: string[]; // Notification渠道

  // ExportConfigure
  autoExportEnabled: boolean; // AutoExport
  exportFormat: 'json' | 'csv' | 'xml'; // Export格式
  exportSchedule: string; // Export計劃
}

// 審計LogQueryParameter
export interface AuditLogQuery {
  startDate?: Date; // BeginDay
  endDate?: Date; // EndDay
  eventTypes?: AuditEventType[]; // EventClass型
  severities?: AuditSeverity[]; // 嚴重性等級
  userIds?: string[]; // UserID
  statuses?: AuditEventStatus[]; // EventStatus
  resourceTypes?: string[]; // ResourceClass型
  resourceIds?: string[]; // ResourceID
  ipAddresses?: string[]; // IPAddress
  searchText?: string; // Search文本

  // PaginateParameter
  page: number; // 頁碼
  limit: number; // 每頁數量
  sortBy?: string; // SortField
  sortOrder?: 'asc' | 'desc'; // Sort順序
}

// 審計LogStatistics
export interface AuditLogStatistics {
  totalEvents: number; // 總Event數
  eventsByType: Record<AuditEventType, number>; // 按Class型Statistics
  eventsBySeverity: Record<AuditSeverity, number>; // 按嚴重性Statistics
  eventsByStatus: Record<AuditEventStatus, number>; // 按StatusStatistics
  eventsByUser: Record<string, number>; // 按UserStatistics
  eventsByResource: Record<string, number>; // 按ResourceStatistics

  // TimeStatistics
  eventsByHour: Record<number, number>; // 按HourStatistics
  eventsByDay: Record<string, number>; // 按天Statistics
  eventsByMonth: Record<string, number>; // 按月Statistics

  // 性能Statistics
  averageResponseTime: number; // 平均ResponseTime
  slowestOperations: {
    // 最慢Operation
    eventType: AuditEventType;
    averageDuration: number;
    count: number;
  }[];

  // ErrorStatistics
  errorRate: number; // Error率
  topErrors: {
    // 常見Error
    errorCode: string;
    count: number;
    percentage: number;
  }[];

  // 安全Statistics
  securityEvents: number; // 安全Event數
  failedLoginAttempts: number; // LoginFailed嘗試
  suspiciousActivities: number; // 可疑活動

  // 合規Statistics
  complianceEvents: number; // 合規Event數
  regulatoryViolations: number; // 法規違規數
}

// 審計LogReport
export interface AuditLogReport {
  id: string; // ReportID
  title: string; // Report標題
  description: string; // ReportDescription
  type: 'summary' | 'detailed' | 'compliance' | 'security' | 'performance'; // ReportClass型

  // Report範圍
  startDate: Date; // BeginDay
  endDate: Date; // EndDay
  filters: AuditLogQuery; // QueryFilter器

  // ReportContent
  statistics: AuditLogStatistics; // StatisticsInformation
  events: AuditEvent[]; // EventList
  summary: string; // 摘要
  recommendations: string[]; // 建議

  // Report元Data
  generatedBy: string; // 生成者
  generatedAt: Date; // 生成Time
  format: 'pdf' | 'html' | 'json' | 'csv'; // Report格式

  // ReportStatus
  status: 'generating' | 'completed' | 'failed'; // ReportStatus
  downloadUrl?: string; // Download鏈接
  expiresAt?: Date; // 過期Time
}

// 審計LogAlert
export interface AuditLogAlert {
  id: string; // AlertID
  title: string; // Alert標題
  description: string; // AlertDescription
  severity: AuditSeverity; // 嚴重性等級

  // 觸發Condition
  triggerType: 'threshold' | 'pattern' | 'anomaly' | 'manual'; // 觸發Class型
  triggerConditions: Record<string, any>; // 觸發Condition
  threshold?: number; // 閾Value

  // AlertStatus
  status: 'active' | 'triggered' | 'acknowledged' | 'resolved'; // AlertStatus
  triggeredAt?: Date; // 觸發Time
  acknowledgedAt?: Date; // ConfirmTime
  resolvedAt?: Date; // ResolveTime

  // 相OffEvent
  relatedEvents: string[]; // 相OffEventID
  eventCount: number; // Event數量

  // NotificationConfigure
  notificationChannels: string[]; // Notification渠道
  recipients: string[]; // Receive者

  // Alert元Data
  createdAt: Date; // CreateTime
  updatedAt: Date; // UpdateTime
  createdBy: string; // Create者
}

// 審計LogExportOptions
export interface AuditLogExportOptions {
  format: 'json' | 'csv' | 'xml' | 'pdf'; // Export格式
  compression: boolean; // YesNo壓縮
  encryption: boolean; // YesNoEncrypt
  password?: string; // EncryptPassword

  // ContentOptions
  includeDetails: boolean; // Package含詳細Information
  includeMetadata: boolean; // Package含元Data
  includeStackTrace: boolean; // Package含堆疊Trace

  // FilterOptions
  filters: AuditLogQuery; // QueryFilter器

  // PaginateOptions
  batchSize: number; // 批次大小
  maxRecords: number; // 最大Record數
}

// 審計Log清理Options
export interface AuditLogCleanupOptions {
  retentionDays: number; // 保留天數
  deleteEvents: AuditEventType[]; // Delete的EventClass型
  archiveEvents: AuditEventType[]; // 歸檔的EventClass型
  compressArchives: boolean; // 壓縮歸檔
  backupBeforeCleanup: boolean; // 清理前Backup
}

// 審計LogSearch結果
export interface AuditLogSearchResult {
  events: AuditEvent[]; // EventList
  totalCount: number; // 總數量
  page: number; // 當前頁碼
  totalPages: number; // 總頁數
  hasMore: boolean; // YesNo有更多
  searchTime: number; // SearchTime（毫Second）
  facets?: Record<string, any>; // 分面Search結果
}

// 審計Log實時Monitor
export interface AuditLogMonitor {
  id: string; // MonitorID
  name: string; // Monitor名稱
  description: string; // MonitorDescription

  // MonitorConfigure
  enabled: boolean; // YesNoEnable
  eventTypes: AuditEventType[]; // Monitor的EventClass型
  severities: AuditSeverity[]; // Monitor的嚴重性等級

  // 實時Statistics
  eventsPerMinute: number; // 每MinuteEvent數
  eventsPerHour: number; // 每HourEvent數
  activeUsers: number; // 活躍User數
  errorRate: number; // Error率

  // AlertConfigure
  alerts: AuditLogAlert[]; // 相OffAlert
  notificationEnabled: boolean; // YesNoEnableNotification

  // MonitorStatus
  lastUpdate: Date; // 最後UpdateTime
  isHealthy: boolean; // YesNo健康
  status: 'active' | 'paused' | 'error'; // MonitorStatus
}
