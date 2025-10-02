/**
 * Storage策略Class型定義
 * Support多層Storage、Cache策略、DataSync等功能
 */

// Storage層級枚舉
export enum StorageLayer {
  MEMORY = 'memory', // MemoryStorage（最快）
  CACHE = 'cache', // LocalCache
  LOCAL = 'local', // LocalStorage
  CLOUD = 'cloud', // 雲端Storage
  BACKUP = 'backup', // BackupStorage
}

// Storage策略枚舉
export enum StorageStrategy {
  PERFORMANCE = 'performance', // 性能優先
  RELIABILITY = 'reliability', // 可靠性優先
  BALANCED = 'balanced', // 平衡模式
  OFFLINE_FIRST = 'offline_first', // 離線優先
}

// Data優先級枚舉
export enum DataPriority {
  CRITICAL = 'critical', // OffKeyData
  HIGH = 'high', // 高優先級
  MEDIUM = 'medium', // 中等優先級
  LOW = 'low', // 低優先級
  CACHE_ONLY = 'cache_only', // 僅Cache
}

// SyncStatus枚舉
export enum SyncStatus {
  SYNCED = 'synced', // 已Sync
  PENDING = 'pending', // 待Sync
  SYNCING = 'syncing', // Sync中
  CONFLICT = 'conflict', // 衝突
  ERROR = 'error', // Error
  OFFLINE = 'offline', // 離線
}

// 壓縮算法枚舉
export enum CompressionType {
  NONE = 'none',
  GZIP = 'gzip',
  LZ4 = 'lz4',
  BROTLI = 'brotli',
}

// Storage項目Interface
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

// Storage元DataInterface
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

// StorageConfigureInterface
export interface StorageConfig {
  strategy: StorageStrategy;
  layers: StorageLayerConfig[];
  compression: CompressionConfig;
  sync: SyncConfig;
  cleanup: CleanupConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}

// Storage層ConfigureInterface
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

// 壓縮ConfigureInterface
export interface CompressionConfig {
  enabled: boolean;
  algorithm: CompressionType;
  minSize: number; // 最小壓縮尺寸
  level: number; // 壓縮級別 (1-9)
  autoCompress: boolean;
}

// SyncConfigureInterface
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

// 衝突Resolve策略枚舉
export enum ConflictResolution {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  LAST_MODIFIED = 'last_modified',
  MERGE = 'merge',
  MANUAL = 'manual',
}

// 清理ConfigureInterface
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
  AGE_BASED = 'age_based', // 基於Age
}

// MonitorConfigureInterface
export interface MonitoringConfig {
  enabled: boolean;
  metrics: MetricType[];
  alertThresholds: AlertThresholds;
  reportingInterval: number;
}

// 指標Class型枚舉
export enum MetricType {
  READ_LATENCY = 'read_latency',
  WRITE_LATENCY = 'write_latency',
  HIT_RATE = 'hit_rate',
  MISS_RATE = 'miss_rate',
  ERROR_RATE = 'error_rate',
  STORAGE_USAGE = 'storage_usage',
  SYNC_STATUS = 'sync_status',
}

// 告警閾ValueInterface
export interface AlertThresholds {
  maxReadLatency: number;
  maxWriteLatency: number;
  minHitRate: number;
  maxErrorRate: number;
  maxStorageUsage: number;
}

// 安全ConfigureInterface
export interface SecurityConfig {
  encryption: EncryptionConfig;
  access: AccessConfig;
  audit: AuditConfig;
}

// EncryptConfigureInterface
export interface EncryptionConfig {
  enabled: boolean;
  algorithm: EncryptionAlgorithm;
  keyRotation: boolean;
  keyRotationInterval: number;
}

// Encrypt算法枚舉
export enum EncryptionAlgorithm {
  AES_256 = 'aes-256',
  AES_192 = 'aes-192',
  AES_128 = 'aes-128',
  CHACHA20 = 'chacha20',
}

// 訪問ControlConfigureInterface
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

// 審計ConfigureInterface
export interface AuditConfig {
  enabled: boolean;
  logLevel: AuditLogLevel;
  retention: number;
  includeData: boolean;
}

// 審計Log級別枚舉
export enum AuditLogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// StorageOperationInterface
export interface StorageOperation {
  operation: OperationType;
  key: string;
  data?: unknown;
  options?: StorageOptions;
  timestamp: Date;
  userId?: string;
}

// OperationClass型枚舉
export enum OperationType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  UPDATE = 'update',
  SYNC = 'sync',
  CLEANUP = 'cleanup',
}

// StorageOptionsInterface
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

// StorageStatisticsInterface
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

// 層StatisticsInterface
export interface LayerStats {
  layer: StorageLayer;
  size: number;
  items: number;
  hitRate: number;
  readLatency: number;
  writeLatency: number;
  errorCount: number;
}

// SyncStatisticsInterface
export interface SyncStats {
  totalSynced: number;
  pendingSync: number;
  syncErrors: number;
  lastSyncTime: Date;
  avgSyncTime: number;
}

// ErrorStatisticsInterface
export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByLayer: Record<StorageLayer, number>;
  lastError?: StorageError;
}

// StorageErrorInterface
export interface StorageError {
  code: StorageErrorCode;
  message: string;
  layer?: StorageLayer;
  operation?: OperationType;
  timestamp: Date;
  details?: unknown;
}

// StorageError代碼枚舉
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

// QueryInterface
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

// SortField枚舉
export enum SortField {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  ACCESSED_AT = 'accessed_at',
  SIZE = 'size',
  PRIORITY = 'priority',
}

// Sort順序枚舉
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// StorageEventInterface
export interface StorageEvent {
  type: StorageEventType;
  key: string;
  data?: unknown;
  metadata?: StorageMetadata;
  timestamp: Date;
  source: StorageLayer;
}

// StorageEventClass型枚舉
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

// StorageCallbackInterface
export interface StorageCallbacks {
  onItemCreated?: (event: StorageEvent) => void;
  onItemUpdated?: (event: StorageEvent) => void;
  onItemDeleted?: (event: StorageEvent) => void;
  onSyncCompleted?: (stats: SyncStats) => void;
  onError?: (error: StorageError) => void;
}

// BackupConfigureInterface
export interface BackupConfig {
  enabled: boolean;
  interval: number;
  maxBackups: number;
  compression: boolean;
  encryption: boolean;
  remoteBackup: boolean;
  backupLocation: string;
}

// RestoreOptionsInterface
export interface RestoreOptions {
  backupId: string;
  selective: boolean;
  namespaces?: string[];
  overwrite: boolean;
  validateIntegrity: boolean;
}
