/**
 * 存儲策略類型定義
 * 支持多層存儲、緩存策略、數據同步等功能
 */

// 存儲層級枚舉
export enum StorageLayer {
  MEMORY = 'memory', // 內存存儲（最快）
  CACHE = 'cache', // 本地緩存
  LOCAL = 'local', // 本地存儲
  CLOUD = 'cloud', // 雲端存儲
  BACKUP = 'backup', // 備份存儲
}

// 存儲策略枚舉
export enum StorageStrategy {
  PERFORMANCE = 'performance', // 性能優先
  RELIABILITY = 'reliability', // 可靠性優先
  BALANCED = 'balanced', // 平衡模式
  OFFLINE_FIRST = 'offline_first', // 離線優先
}

// 數據優先級枚舉
export enum DataPriority {
  CRITICAL = 'critical', // 關鍵數據
  HIGH = 'high', // 高優先級
  MEDIUM = 'medium', // 中等優先級
  LOW = 'low', // 低優先級
  CACHE_ONLY = 'cache_only', // 僅緩存
}

// 同步狀態枚舉
export enum SyncStatus {
  SYNCED = 'synced', // 已同步
  PENDING = 'pending', // 待同步
  SYNCING = 'syncing', // 同步中
  CONFLICT = 'conflict', // 衝突
  ERROR = 'error', // 錯誤
  OFFLINE = 'offline', // 離線
}

// 壓縮算法枚舉
export enum CompressionType {
  NONE = 'none',
  GZIP = 'gzip',
  LZ4 = 'lz4',
  BROTLI = 'brotli',
}

// 存儲項目接口
export interface StorageItem<T = any> {
  id: string;
  key: string;
  data: T;
  metadata: StorageMetadata;
  layers: StorageLayer[];
  priority: DataPriority;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
  accessedAt: Date;
  expiresAt?: Date;
}

// 存儲元數據接口
export interface StorageMetadata {
  size: number;
  compressed: boolean;
  compressionType?: CompressionType;
  checksum: string;
  version: number;
  tags: string[];
  namespace: string;
  readCount: number;
  writeCount: number;
  lastModifiedBy?: string;
  schema?: string;
}

// 存儲配置接口
export interface StorageConfig {
  strategy: StorageStrategy;
  layers: StorageLayerConfig[];
  compression: CompressionConfig;
  sync: SyncConfig;
  cleanup: CleanupConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}

// 存儲層配置接口
export interface StorageLayerConfig {
  layer: StorageLayer;
  enabled: boolean;
  priority: number;
  maxSize: number;
  maxItems: number;
  ttl: number; // Time to live in milliseconds
  fallback?: StorageLayer;
  redundancy?: number;
}

// 壓縮配置接口
export interface CompressionConfig {
  enabled: boolean;
  algorithm: CompressionType;
  minSize: number; // 最小壓縮尺寸
  level: number; // 壓縮級別 (1-9)
  autoCompress: boolean;
}

// 同步配置接口
export interface SyncConfig {
  enabled: boolean;
  interval: number;
  batchSize: number;
  maxRetries: number;
  conflictResolution: ConflictResolution;
  backgroundSync: boolean;
  syncOnStartup: boolean;
  syncOnNetworkChange: boolean;
}

// 衝突解決策略枚舉
export enum ConflictResolution {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  LAST_MODIFIED = 'last_modified',
  MERGE = 'merge',
  MANUAL = 'manual',
}

// 清理配置接口
export interface CleanupConfig {
  enabled: boolean;
  interval: number;
  maxAge: number;
  maxSize: number;
  strategy: CleanupStrategy;
  preserveCritical: boolean;
}

// 清理策略枚舉
export enum CleanupStrategy {
  LRU = 'lru', // Least Recently Used
  LFU = 'lfu', // Least Frequently Used
  FIFO = 'fifo', // First In First Out
  SIZE_BASED = 'size_based', // 基於大小
  AGE_BASED = 'age_based', // 基於年齡
}

// 監控配置接口
export interface MonitoringConfig {
  enabled: boolean;
  metrics: MetricType[];
  alertThresholds: AlertThresholds;
  reportingInterval: number;
}

// 指標類型枚舉
export enum MetricType {
  READ_LATENCY = 'read_latency',
  WRITE_LATENCY = 'write_latency',
  HIT_RATE = 'hit_rate',
  MISS_RATE = 'miss_rate',
  ERROR_RATE = 'error_rate',
  STORAGE_USAGE = 'storage_usage',
  SYNC_STATUS = 'sync_status',
}

// 告警閾值接口
export interface AlertThresholds {
  maxReadLatency: number;
  maxWriteLatency: number;
  minHitRate: number;
  maxErrorRate: number;
  maxStorageUsage: number;
}

// 安全配置接口
export interface SecurityConfig {
  encryption: EncryptionConfig;
  access: AccessConfig;
  audit: AuditConfig;
}

// 加密配置接口
export interface EncryptionConfig {
  enabled: boolean;
  algorithm: EncryptionAlgorithm;
  keyRotation: boolean;
  keyRotationInterval: number;
}

// 加密算法枚舉
export enum EncryptionAlgorithm {
  AES_256 = 'aes-256',
  AES_192 = 'aes-192',
  AES_128 = 'aes-128',
  CHACHA20 = 'chacha20',
}

// 訪問控制配置接口
export interface AccessConfig {
  enabled: boolean;
  permissions: PermissionLevel;
  roleBasedAccess: boolean;
  ipWhitelist?: string[];
}

// 權限級別枚舉
export enum PermissionLevel {
  READ_ONLY = 'read_only',
  READ_WRITE = 'read_write',
  ADMIN = 'admin',
}

// 審計配置接口
export interface AuditConfig {
  enabled: boolean;
  logLevel: AuditLogLevel;
  retention: number;
  includeData: boolean;
}

// 審計日誌級別枚舉
export enum AuditLogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// 存儲操作接口
export interface StorageOperation {
  operation: OperationType;
  key: string;
  data?: unknown;
  options?: StorageOptions;
  timestamp: Date;
  userId?: string;
}

// 操作類型枚舉
export enum OperationType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  UPDATE = 'update',
  SYNC = 'sync',
  CLEANUP = 'cleanup',
}

// 存儲選項接口
export interface StorageOptions {
  layer?: StorageLayer;
  priority?: DataPriority;
  ttl?: number;
  compress?: boolean;
  encrypt?: boolean;
  sync?: boolean;
  tags?: string[];
  namespace?: string;
}

// 存儲統計接口
export interface StorageStats {
  totalSize: number;
  totalItems: number;
  hitRate: number;
  missRate: number;
  averageReadLatency: number;
  averageWriteLatency: number;
  layerStats: LayerStats[];
  syncStats: SyncStats;
  errorStats: ErrorStats;
}

// 層統計接口
export interface LayerStats {
  layer: StorageLayer;
  size: number;
  items: number;
  hitRate: number;
  readLatency: number;
  writeLatency: number;
  errorCount: number;
}

// 同步統計接口
export interface SyncStats {
  totalSynced: number;
  pendingSync: number;
  syncErrors: number;
  lastSyncTime: Date;
  avgSyncTime: number;
}

// 錯誤統計接口
export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByLayer: Record<StorageLayer, number>;
  lastError?: StorageError;
}

// 存儲錯誤接口
export interface StorageError {
  code: StorageErrorCode;
  message: string;
  layer?: StorageLayer;
  operation?: OperationType;
  timestamp: Date;
  details?: unknown;
}

// 存儲錯誤代碼枚舉
export enum StorageErrorCode {
  NOT_FOUND = 'not_found',
  ACCESS_DENIED = 'access_denied',
  QUOTA_EXCEEDED = 'quota_exceeded',
  NETWORK_ERROR = 'network_error',
  CORRUPTION = 'corruption',
  ENCRYPTION_ERROR = 'encryption_error',
  SYNC_CONFLICT = 'sync_conflict',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

// 查詢接口
export interface StorageQuery {
  namespace?: string;
  tags?: string[];
  priority?: DataPriority;
  layer?: StorageLayer;
  syncStatus?: SyncStatus;
  createdAfter?: Date;
  createdBefore?: Date;
  accessedAfter?: Date;
  accessedBefore?: Date;
  limit?: number;
  offset?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

// 排序字段枚舉
export enum SortField {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  ACCESSED_AT = 'accessed_at',
  SIZE = 'size',
  PRIORITY = 'priority',
}

// 排序順序枚舉
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// 存儲事件接口
export interface StorageEvent {
  type: StorageEventType;
  key: string;
  data?: unknown;
  metadata?: StorageMetadata;
  timestamp: Date;
  source: StorageLayer;
}

// 存儲事件類型枚舉
export enum StorageEventType {
  ITEM_CREATED = 'item_created',
  ITEM_UPDATED = 'item_updated',
  ITEM_DELETED = 'item_deleted',
  ITEM_ACCESSED = 'item_accessed',
  SYNC_STARTED = 'sync_started',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_FAILED = 'sync_failed',
  CLEANUP_STARTED = 'cleanup_started',
  CLEANUP_COMPLETED = 'cleanup_completed',
  ERROR_OCCURRED = 'error_occurred',
}

// 存儲回調接口
export interface StorageCallbacks {
  onItemCreated?: (event: StorageEvent) => void;
  onItemUpdated?: (event: StorageEvent) => void;
  onItemDeleted?: (event: StorageEvent) => void;
  onSyncCompleted?: (stats: SyncStats) => void;
  onError?: (error: StorageError) => void;
}

// 備份配置接口
export interface BackupConfig {
  enabled: boolean;
  interval: number;
  maxBackups: number;
  compression: boolean;
  encryption: boolean;
  remoteBackup: boolean;
  backupLocation: string;
}

// 恢復選項接口
export interface RestoreOptions {
  backupId: string;
  selective: boolean;
  namespaces?: string[];
  overwrite: boolean;
  validateIntegrity: boolean;
}
