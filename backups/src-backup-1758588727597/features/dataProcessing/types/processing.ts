/**
 * 數據處理優化系統類型定義
 * 實現高性能數據處理、緩存優化、並行處理等功能
 */

// 處理策略枚舉
export enum ProcessingStrategy {
  SEQUENTIAL = 'sequential', // 順序處理
  PARALLEL = 'parallel', // 並行處理
  STREAMING = 'streaming', // 流式處理
  BATCH = 'batch', // 批量處理
  INCREMENTAL = 'incremental', // 增量處理
  CACHED = 'cached', // 緩存處理
}

// 數據優先級
export enum DataPriority {
  CRITICAL = 'critical', // 關鍵數據
  HIGH = 'high', // 高優先級
  NORMAL = 'normal', // 正常優先級
  LOW = 'low', // 低優先級
  BACKGROUND = 'background', // 後台處理
}

// 處理狀態
export enum ProcessingStatus {
  PENDING = 'pending', // 等待處理
  PROCESSING = 'processing', // 處理中
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed', // 失敗
  CANCELLED = 'cancelled', // 已取消
  PAUSED = 'paused', // 暫停
}

// 緩存策略
export enum CacheStrategy {
  NONE = 'none', // 不緩存
  MEMORY = 'memory', // 內存緩存
  DISK = 'disk', // 磁盤緩存
  HYBRID = 'hybrid', // 混合緩存
  INTELLIGENT = 'intelligent', // 智能緩存
}

// 壓縮算法
export enum CompressionAlgorithm {
  NONE = 'none', // 不壓縮
  GZIP = 'gzip', // GZIP壓縮
  LZ4 = 'lz4', // LZ4壓縮
  ZSTD = 'zstd', // ZSTD壓縮
  BROTLI = 'brotli', // Brotli壓縮
}

// 數據處理配置
export interface ProcessingConfig {
  strategy: ProcessingStrategy; // 處理策略
  priority: DataPriority; // 數據優先級
  cacheStrategy: CacheStrategy; // 緩存策略
  compression: CompressionAlgorithm; // 壓縮算法
  batchSize: number; // 批量大小
  maxConcurrency: number; // 最大並發數
  timeout: number; // 超時時間(ms)
  retryAttempts: number; // 重試次數
  retryDelay: number; // 重試延遲(ms)
  enableProfiling: boolean; // 啟用性能分析
  enableMetrics: boolean; // 啟用指標收集
  memoryLimit: number; // 內存限制(MB)
  cpuLimit: number; // CPU限制(%)
}

// 數據處理任務
export interface ProcessingTask<T = any> {
  id: string; // 任務ID
  type: string; // 任務類型
  data: T; // 處理數據
  config: ProcessingConfig; // 處理配置
  status: ProcessingStatus; // 處理狀態
  priority: DataPriority; // 優先級
  createdAt: Date; // 創建時間
  startedAt?: Date; // 開始時間
  completedAt?: Date; // 完成時間
  progress: number; // 進度(0-100)
  result?: unknown; // 處理結果
  error?: string; // 錯誤信息
  metadata: Record<string, any>; // 元數據
}

// 處理結果
export interface ProcessingResult<T = any> {
  success: boolean; // 是否成功
  data: T; // 處理後的數據
  processingTime: number; // 處理時間(ms)
  memoryUsage: number; // 內存使用(MB)
  cacheHit: boolean; // 是否緩存命中
  compressionRatio?: number; // 壓縮比
  metadata: Record<string, any>; // 元數據
}

// 性能指標
export interface PerformanceMetrics {
  totalTasks: number; // 總任務數
  completedTasks: number; // 已完成任務數
  failedTasks: number; // 失敗任務數
  averageProcessingTime: number; // 平均處理時間(ms)
  throughput: number; // 吞吐量(任務/秒)
  memoryUsage: number; // 內存使用(MB)
  cpuUsage: number; // CPU使用率(%)
  cacheHitRate: number; // 緩存命中率
  compressionRatio: number; // 平均壓縮比
  errorRate: number; // 錯誤率
  uptime: number; // 運行時間(秒)
}

// 緩存項
export interface CacheItem<T = any> {
  key: string; // 緩存鍵
  data: T; // 緩存數據
  createdAt: Date; // 創建時間
  accessedAt: Date; // 最後訪問時間
  expiresAt?: Date; // 過期時間
  size: number; // 大小(bytes)
  hits: number; // 命中次數
  compressionRatio?: number; // 壓縮比
}

// 處理管道
export interface ProcessingPipeline {
  id: string; // 管道ID
  name: string; // 管道名稱
  stages: ProcessingStage[]; // 處理階段
  config: ProcessingConfig; // 配置
  status: ProcessingStatus; // 狀態
  metrics: PerformanceMetrics; // 性能指標
}

// 處理階段
export interface ProcessingStage {
  id: string; // 階段ID
  name: string; // 階段名稱
  processor: string; // 處理器名稱
  config: Record<string, any>; // 階段配置
  order: number; // 執行順序
  required: boolean; // 是否必需
  timeout?: number; // 階段超時
}

// 數據轉換器
export interface DataTransformer<TInput = any, TOutput = any> {
  name: string; // 轉換器名稱
  transform(data: TInput): TOutput; // 轉換方法
  validate?(data: TInput): boolean; // 驗證方法
  optimize?(data: TInput): TInput; // 優化方法
}

// 處理器接口
export interface DataProcessor<TInput = any, TOutput = any> {
  name: string; // 處理器名稱
  process(
    data: TInput,
    config: ProcessingConfig
  ): Promise<ProcessingResult<TOutput>>;
  validate?(data: TInput): boolean; // 驗證方法
  optimize?(data: TInput): TInput; // 優化方法
}

// 緩存管理器
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

// 任務隊列
export interface TaskQueue {
  enqueue<T>(task: ProcessingTask<T>): Promise<void>;
  dequeue(): Promise<ProcessingTask | null>;
  peek(): Promise<ProcessingTask | null>;
  size(): Promise<number>;
  clear(): Promise<void>;
  remove(id: string): Promise<boolean>;
  get(id: string): Promise<ProcessingTask | null>;
}

// 性能監控器
export interface PerformanceMonitor {
  startTimer(name: string): void;
  endTimer(name: string): number;
  recordMetric(name: string, value: number): void;
  getMetrics(): Record<string, number>;
  reset(): void;
  generateReport(): PerformanceMetrics;
}

// 數據處理事件
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

// 事件監聽器
export type EventListener = (event: ProcessingEvent) => void;

// 數據處理服務配置
export interface DataProcessingServiceConfig {
  defaultConfig: ProcessingConfig; // 默認配置
  cacheConfig: {
    // 緩存配置
    maxSize: number; // 最大緩存大小
    ttl: number; // 默認TTL
    strategy: CacheStrategy; // 緩存策略
  };
  queueConfig: {
    // 隊列配置
    maxSize: number; // 最大隊列大小
    concurrency: number; // 並發數
    timeout: number; // 超時時間
  };
  monitoringConfig: {
    // 監控配置
    enabled: boolean; // 是否啟用
    interval: number; // 監控間隔
    thresholds: {
      // 閾值
      memoryUsage: number; // 內存使用閾值
      cpuUsage: number; // CPU使用閾值
      errorRate: number; // 錯誤率閾值
    };
  };
}
