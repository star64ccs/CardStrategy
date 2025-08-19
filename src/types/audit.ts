// 審計日誌系統類型定義

// 審計事件類型
export type AuditEventType =
  // 用戶相關事件
  | 'user_login'                    // 用戶登錄
  | 'user_logout'                   // 用戶登出
  | 'user_register'                 // 用戶註冊
  | 'user_profile_update'           // 用戶資料更新
  | 'user_password_change'          // 密碼變更
  | 'user_account_delete'           // 帳戶刪除
  | 'user_permission_change'        // 權限變更

  // 卡片相關事件
  | 'card_scan'                     // 卡片掃描
  | 'card_add'                      // 添加卡片
  | 'card_update'                   // 更新卡片
  | 'card_delete'                   // 刪除卡片
  | 'card_favorite'                 // 收藏卡片
  | 'card_share'                    // 分享卡片
  | 'card_price_monitor'            // 價格監控

  // 投資相關事件
  | 'investment_create'             // 創建投資
  | 'investment_update'             // 更新投資
  | 'investment_delete'             // 刪除投資
  | 'portfolio_view'                // 查看投資組合
  | 'portfolio_export'              // 導出投資組合

  // 支付相關事件
  | 'payment_method_add'            // 添加支付方式
  | 'payment_method_update'         // 更新支付方式
  | 'payment_method_delete'         // 刪除支付方式
  | 'payment_process'               // 處理支付
  | 'subscription_create'           // 創建訂閱
  | 'subscription_cancel'           // 取消訂閱

  // 數據相關事件
  | 'data_export'                   // 數據導出
  | 'data_import'                   // 數據導入
  | 'data_backup'                   // 數據備份
  | 'data_restore'                  // 數據恢復
  | 'data_breach'                   // 數據洩露

  // 系統管理事件
  | 'admin_login'                   // 管理員登錄
  | 'admin_action'                  // 管理員操作
  | 'system_config_change'          // 系統配置變更
  | 'user_management'               // 用戶管理
  | 'system_backup'                 // 系統備份

  // 安全相關事件
  | 'security_alert'                // 安全警報
  | 'failed_login_attempt'          // 登錄失敗嘗試
  | 'suspicious_activity'           // 可疑活動
  | 'api_rate_limit_exceeded'       // API速率限制超標

  // AI相關事件
  | 'ai_analysis_request'           // AI分析請求
  | 'ai_model_update'               // AI模型更新
  | 'ai_prediction_request'         // AI預測請求

  // 通知相關事件
  | 'notification_sent'             // 發送通知
  | 'notification_failed'           // 通知失敗
  | 'notification_preference_change' // 通知偏好變更

  // 隱私相關事件
  | 'privacy_setting_change'        // 隱私設置變更
  | 'consent_given'                 // 同意授權
  | 'consent_withdrawn'             // 撤回同意
  | 'data_rights_request'           // 數據權利請求

  // 其他事件
  | 'app_error'                     // 應用錯誤
  | 'performance_issue'             // 性能問題
  | 'third_party_integration'       // 第三方集成
  | 'unknown';                      // 未知事件

// 審計事件嚴重性等級
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

// 審計事件狀態
export type AuditEventStatus = 'success' | 'failure' | 'pending' | 'cancelled';

// 用戶操作結果
export type OperationResult = 'success' | 'failure' | 'partial_success' | 'timeout';

// 審計事件詳細信息
export interface AuditEvent {
  id: string;                       // 事件唯一標識
  eventType: AuditEventType;        // 事件類型
  severity: AuditSeverity;          // 嚴重性等級
  status: AuditEventStatus;         // 事件狀態
  result: OperationResult;          // 操作結果

  // 用戶信息
  userId?: string;                  // 用戶ID
  userEmail?: string;               // 用戶郵箱
  userRole?: string;                // 用戶角色
  userAgent?: string;               // 用戶代理
  ipAddress?: string;               // IP地址
  location?: string;                // 地理位置

  // 事件詳情
  title: string;                    // 事件標題
  description: string;              // 事件描述
  details?: Record<string, any>;    // 詳細信息
  metadata?: Record<string, any>;   // 元數據

  // 資源信息
  resourceType?: string;            // 資源類型
  resourceId?: string;              // 資源ID
  resourceName?: string;            // 資源名稱

  // 時間信息
  timestamp: Date;                  // 事件時間戳
  duration?: number;                // 操作持續時間（毫秒）

  // 系統信息
  sessionId?: string;               // 會話ID
  requestId?: string;               // 請求ID
  traceId?: string;                 // 追蹤ID

  // 錯誤信息
  errorCode?: string;               // 錯誤代碼
  errorMessage?: string;            // 錯誤消息
  stackTrace?: string;              // 堆疊追蹤

  // 合規信息
  complianceTags?: string[];        // 合規標籤
  regulatoryRequirements?: string[]; // 法規要求

  // 審計信息
  auditTrail?: string[];            // 審計追蹤
  relatedEvents?: string[];         // 相關事件ID

  createdAt: Date;                  // 創建時間
  updatedAt: Date;                  // 更新時間
}

// 審計日誌配置
export interface AuditLogConfig {
  enabled: boolean;                 // 是否啟用審計日誌
  logLevel: AuditSeverity;          // 日誌級別
  retentionDays: number;            // 保留天數
  maxLogSize: number;               // 最大日誌大小（MB）
  compressionEnabled: boolean;      // 是否啟用壓縮
  encryptionEnabled: boolean;       // 是否啟用加密

  // 過濾配置
  excludeEvents: AuditEventType[];  // 排除的事件類型
  includeOnlyEvents: AuditEventType[]; // 僅包含的事件類型

  // 通知配置
  alertOnCritical: boolean;         // 嚴重事件警報
  alertOnHigh: boolean;             // 高級事件警報
  notificationChannels: string[];   // 通知渠道

  // 導出配置
  autoExportEnabled: boolean;       // 自動導出
  exportFormat: 'json' | 'csv' | 'xml'; // 導出格式
  exportSchedule: string;           // 導出計劃
}

// 審計日誌查詢參數
export interface AuditLogQuery {
  startDate?: Date;                 // 開始日期
  endDate?: Date;                   // 結束日期
  eventTypes?: AuditEventType[];    // 事件類型
  severities?: AuditSeverity[];     // 嚴重性等級
  userIds?: string[];               // 用戶ID
  statuses?: AuditEventStatus[];    // 事件狀態
  resourceTypes?: string[];         // 資源類型
  resourceIds?: string[];           // 資源ID
  ipAddresses?: string[];           // IP地址
  searchText?: string;              // 搜索文本

  // 分頁參數
  page: number;                     // 頁碼
  limit: number;                    // 每頁數量
  sortBy?: string;                  // 排序字段
  sortOrder?: 'asc' | 'desc';       // 排序順序
}

// 審計日誌統計
export interface AuditLogStatistics {
  totalEvents: number;              // 總事件數
  eventsByType: Record<AuditEventType, number>; // 按類型統計
  eventsBySeverity: Record<AuditSeverity, number>; // 按嚴重性統計
  eventsByStatus: Record<AuditEventStatus, number>; // 按狀態統計
  eventsByUser: Record<string, number>; // 按用戶統計
  eventsByResource: Record<string, number>; // 按資源統計

  // 時間統計
  eventsByHour: Record<number, number>; // 按小時統計
  eventsByDay: Record<string, number>; // 按天統計
  eventsByMonth: Record<string, number>; // 按月統計

  // 性能統計
  averageResponseTime: number;      // 平均響應時間
  slowestOperations: {       // 最慢操作
    eventType: AuditEventType;
    averageDuration: number;
    count: number;
  }[];

  // 錯誤統計
  errorRate: number;                // 錯誤率
  topErrors: {               // 常見錯誤
    errorCode: string;
    count: number;
    percentage: number;
  }[];

  // 安全統計
  securityEvents: number;           // 安全事件數
  failedLoginAttempts: number;      // 登錄失敗嘗試
  suspiciousActivities: number;     // 可疑活動

  // 合規統計
  complianceEvents: number;         // 合規事件數
  regulatoryViolations: number;     // 法規違規數
}

// 審計日誌報告
export interface AuditLogReport {
  id: string;                       // 報告ID
  title: string;                    // 報告標題
  description: string;              // 報告描述
  type: 'summary' | 'detailed' | 'compliance' | 'security' | 'performance'; // 報告類型

  // 報告範圍
  startDate: Date;                  // 開始日期
  endDate: Date;                    // 結束日期
  filters: AuditLogQuery;           // 查詢過濾器

  // 報告內容
  statistics: AuditLogStatistics;   // 統計信息
  events: AuditEvent[];             // 事件列表
  summary: string;                  // 摘要
  recommendations: string[];        // 建議

  // 報告元數據
  generatedBy: string;              // 生成者
  generatedAt: Date;                // 生成時間
  format: 'pdf' | 'html' | 'json' | 'csv'; // 報告格式

  // 報告狀態
  status: 'generating' | 'completed' | 'failed'; // 報告狀態
  downloadUrl?: string;             // 下載鏈接
  expiresAt?: Date;                 // 過期時間
}

// 審計日誌警報
export interface AuditLogAlert {
  id: string;                       // 警報ID
  title: string;                    // 警報標題
  description: string;              // 警報描述
  severity: AuditSeverity;          // 嚴重性等級

  // 觸發條件
  triggerType: 'threshold' | 'pattern' | 'anomaly' | 'manual'; // 觸發類型
  triggerConditions: Record<string, any>; // 觸發條件
  threshold?: number;               // 閾值

  // 警報狀態
  status: 'active' | 'triggered' | 'acknowledged' | 'resolved'; // 警報狀態
  triggeredAt?: Date;               // 觸發時間
  acknowledgedAt?: Date;            // 確認時間
  resolvedAt?: Date;                // 解決時間

  // 相關事件
  relatedEvents: string[];          // 相關事件ID
  eventCount: number;               // 事件數量

  // 通知配置
  notificationChannels: string[];   // 通知渠道
  recipients: string[];             // 接收者

  // 警報元數據
  createdAt: Date;                  // 創建時間
  updatedAt: Date;                  // 更新時間
  createdBy: string;                // 創建者
}

// 審計日誌導出選項
export interface AuditLogExportOptions {
  format: 'json' | 'csv' | 'xml' | 'pdf'; // 導出格式
  compression: boolean;             // 是否壓縮
  encryption: boolean;              // 是否加密
  password?: string;                // 加密密碼

  // 內容選項
  includeDetails: boolean;          // 包含詳細信息
  includeMetadata: boolean;         // 包含元數據
  includeStackTrace: boolean;       // 包含堆疊追蹤

  // 過濾選項
  filters: AuditLogQuery;           // 查詢過濾器

  // 分頁選項
  batchSize: number;                // 批次大小
  maxRecords: number;               // 最大記錄數
}

// 審計日誌清理選項
export interface AuditLogCleanupOptions {
  retentionDays: number;            // 保留天數
  deleteEvents: AuditEventType[];   // 刪除的事件類型
  archiveEvents: AuditEventType[];  // 歸檔的事件類型
  compressArchives: boolean;        // 壓縮歸檔
  backupBeforeCleanup: boolean;     // 清理前備份
}

// 審計日誌搜索結果
export interface AuditLogSearchResult {
  events: AuditEvent[];             // 事件列表
  totalCount: number;               // 總數量
  page: number;                     // 當前頁碼
  totalPages: number;               // 總頁數
  hasMore: boolean;                 // 是否有更多
  searchTime: number;               // 搜索時間（毫秒）
  facets?: Record<string, any>;     // 分面搜索結果
}

// 審計日誌實時監控
export interface AuditLogMonitor {
  id: string;                       // 監控ID
  name: string;                     // 監控名稱
  description: string;              // 監控描述

  // 監控配置
  enabled: boolean;                 // 是否啟用
  eventTypes: AuditEventType[];     // 監控的事件類型
  severities: AuditSeverity[];      // 監控的嚴重性等級

  // 實時統計
  eventsPerMinute: number;          // 每分鐘事件數
  eventsPerHour: number;            // 每小時事件數
  activeUsers: number;              // 活躍用戶數
  errorRate: number;                // 錯誤率

  // 警報配置
  alerts: AuditLogAlert[];          // 相關警報
  notificationEnabled: boolean;     // 是否啟用通知

  // 監控狀態
  lastUpdate: Date;                 // 最後更新時間
  isHealthy: boolean;               // 是否健康
  status: 'active' | 'paused' | 'error'; // 監控狀態
}
