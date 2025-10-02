/**
 * DataHandle優化系統Class型定義
 * 實現高性能DataHandle、Cache優化、ParallelHandle等功能
 */

// Handle策略枚舉
export enum ProcessingStrategy {
  SEQUENTIAL = 'sequential', // 順序Handle
  PARALLEL = 'parallel', // ParallelHandle
  STREAMING = 'streaming', // 流式Handle
  BATCH = 'batch', // BatchHandle
  INCREMENTAL = 'incremental', // 增量Handle
  CACHED = 'cached', // CacheHandle
}

// Data優先級
export enum DataPriority {
  CRITICAL = 'critical', // OffKeyData
  HIGH = 'high', // 高優先級
  NORMAL = 'normal', // 正常優先級
  LOW = 'low', // 低優先級
  BACKGROUND = 'background', // 後台Handle
}

// HandleStatus
export enum ProcessingStatus {
  PENDING = 'pending', // AwaitHandle
  PROCESSING = 'processing', // Handle中
  COMPLETED = 'completed', // 已Complete
  FAILED = 'failed', // Failed
  CANCELLED = 'cancelled', // 已Cancel
  PAUSED = 'paused', // Pause
}

// Cache策略
export enum CacheStrategy {
  NONE = 'none', // 不Cache
  MEMORY = 'memory', // MemoryCache
  DISK = 'disk', // DiskCache
  HYBRID = 'hybrid', // 混合Cache
  INTELLIGENT = 'intelligent', // 智能Cache
}

// 壓縮算法
export enum CompressionAlgorithm {
  NONE = 'none', // 不壓縮
  GZIP = 'gzip', // GZIP壓縮
  LZ4 = 'lz4', // LZ4壓縮
  ZSTD = 'zstd', // ZSTD壓縮
  BROTLI = 'brotli', // Brotli壓縮
}

// DataHandleConfigure
export interface ProcessingConfig {
  strategy: ProcessingStrategy; // Handle策略
  priority: DataPriority; // Data優先級
  cacheStrategy: CacheStrategy; // Cache策略
  compression: CompressionAlgorithm; // 壓縮算法
  batchSize: number; // Batch大小
  maxConcurrency: number; // 最大Concurrent數
  timeout: number; // 超時Time(ms)
  retryAttempts: number; // Retry次數
  retryDelay: number; // Retry延遲(ms)
  enableProfiling: boolean; // Enable性能Analysis
  enableMetrics: boolean; // Enable指標收集
  memoryLimit: number; // MemoryLimit(MB)
  cpuLimit: number; // CPULimit(%)
}

// DataHandleTask
export interface ProcessingTask<T = any> {
  id: string; // TaskID
  type: string; // TaskClass型
  data: T; // HandleData
  config: ProcessingConfig; // HandleConfigure
  status: ProcessingStatus; // HandleStatus
  priority: DataPriority; // 優先級
  createdAt: Date; // CreateTime
  startedAt?: Date; // BeginTime
  completedAt?: Date; // CompleteTime
  progress: number; // 進度(0-100)
  result?: unknown; // Handle結果
  error?: string; // ErrorInformation
  metadata: Record<string, any>; // 元Data
}

// Handle結果
export interface ProcessingResult<T = any> {
  success: boolean; // YesNoSuccess
  data: T; // Handle後的Data
  processingTime: number; // HandleTime(ms)
  memoryUsage: number; // Memory使用(MB)
  cacheHit: boolean; // YesNoCache命中
  compressionRatio?: number; // 壓縮比
  metadata: Record<string, any>; // 元Data
}

// 性能指標
export interface PerformanceMetrics {
  totalTasks: number; // 總Task數
  completedTasks: number; // 已CompleteTask數
  failedTasks: number; // FailedTask數
  averageProcessingTime: number; // 平均HandleTime(ms)
  throughput: number; // 吞吐量(Task/Second)
  memoryUsage: number; // Memory使用(MB)
  cpuUsage: number; // CPU使用率(%)
  cacheHitRate: number; // Cache命中率
  compressionRatio: number; // 平均壓縮比
  errorRate: number; // Error率
  uptime: number; // 運RowTime(Second)
}

// Cache項
export interface CacheItem<T = any> {
  key: string; // CacheKey
  data: T; // CacheData
  createdAt: Date; // CreateTime
  accessedAt: Date; // 最後訪問Time
  expiresAt?: Date; // 過期Time
  size: number; // 大小(bytes)
  hits: number; // 命中次數
  compressionRatio?: number; // 壓縮比
}

// Handle管道
export interface ProcessingPipeline {
  id: string; // 管道ID
  name: string; // 管道名稱
  stages: ProcessingStage[]; // Handle階段
  config: ProcessingConfig; // Configure
  status: ProcessingStatus; // Status
  metrics: PerformanceMetrics; // 性能指標
}

// Handle階段
export interface ProcessingStage {
  id: string; // 階段ID
  name: string; // 階段名稱
  processor: string; // Handle器名稱
  config: Record<string, any>; // 階段Configure
  order: number; // 執Row順序
  required: boolean; // YesNoRequired
  timeout?: number; // 階段超時
}

// DataConvert器
export interface DataTransformer<TInput = any, TOutput = any> {
  name: string; // Convert器名稱
  transform(data: TInput): TOutput; // ConvertMethod
  validate?(data: TInput): boolean; // VerifyMethod
  optimize?(data: TInput): TInput; // 優化Method
}

// Handle器Interface
export interface DataProcessor<TInput = any, TOutput = any> {
  name: string; // Handle器名稱
  process(
    data: TInput,
    config: ProcessingConfig
  ): Promise<ProcessingResult<TOutput>>;
  validate?(data: TInput): boolean; // VerifyMethod
  optimize?(data: TInput): TInput; // 優化Method
}

// CacheManage器
export interface CacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  size(): Promise<number>;
  keys(): Promise<string[]>;
  stats(): Promise<{
    size: number;
    hitRate: number;
    missRate: number;
    evictionCount: number;
  }>;
}

// TaskQueue
export interface TaskQueue {
  enqueue<T>(task: ProcessingTask<T>): Promise<void>;
  dequeue(): Promise<ProcessingTask | null>;
  peek(): Promise<ProcessingTask | null>;
  size(): Promise<number>;
  clear(): Promise<void>;
  remove(id: string): Promise<boolean>;
  get(id: string): Promise<ProcessingTask | null>;
}

// 性能Monitor器
export interface PerformanceMonitor {
  startTimer(name: string): void;
  endTimer(name: string): number;
  recordMetric(name: string, value: number): void;
  getMetrics(): Record<string, number>;
  reset(): void;
  generateReport(): PerformanceMetrics;
}

// DataHandleEvent
export interface ProcessingEvent {
  type:
    | 'task_started'
    | 'task_completed'
    | 'task_failed'
    | 'cache_hit'
    | 'cache_miss';
  taskId: string;
  timestamp: Date;
  data?: unknown;
  error?: string;
}

// Event監聽器
export type EventListener = (event: ProcessingEvent) => void;

// DataHandleServiceConfigure
export interface DataProcessingServiceConfig {
  defaultConfig: ProcessingConfig; // DefaultConfigure
  cacheConfig: {
    // CacheConfigure
    maxSize: number; // 最大Cache大小
    ttl: number; // DefaultTTL
    strategy: CacheStrategy; // Cache策略
  };
  queueConfig: {
    // QueueConfigure
    maxSize: number; // 最大Queue大小
    concurrency: number; // Concurrent數
    timeout: number; // 超時Time
  };
  monitoringConfig: {
    // MonitorConfigure
    enabled: boolean; // YesNoEnable
    interval: number; // Monitor間隔
    thresholds: {
      // 閾Value
      memoryUsage: number; // Memory使用閾Value
      cpuUsage: number; // CPU使用閾Value
      errorRate: number; // Error率閾Value
    };
  };
}
