// 懶加載系統類型定義

// 基礎懶加載狀態
export enum LazyLoadStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

// 懶加載優先級
export enum LazyLoadPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 懶加載策略
export enum LazyLoadStrategy {
  INTERSECTION_OBSERVER = 'intersection_observer',
  SCROLL_EVENT = 'scroll_event',
  MANUAL = 'manual',
  IMMEDIATE = 'immediate',
  DELAYED = 'delayed',
}

// 組件懶加載配置
export interface ComponentLazyLoadConfig {
  /** 組件路徑 */
  path: string;
  /** 加載策略 */
  strategy: LazyLoadStrategy;
  /** 優先級 */
  priority: LazyLoadPriority;
  /** 預加載距離 (px) */
  preloadDistance?: number;
  /** 加載超時時間 (ms) */
  timeout?: number;
  /** 重試次數 */
  retryCount?: number;
  /** 重試延遲 (ms) */
  retryDelay?: number;
  /** 是否啟用緩存 */
  enableCache?: boolean;
  /** 緩存時間 (ms) */
  cacheTime?: number;
  /** 錯誤回退組件 */
  fallback?: React.ComponentType<any>;
  /** 加載指示器組件 */
  loadingComponent?: React.ComponentType<any>;
  /** 自定義加載條件 */
  shouldLoad?: () => boolean;
  /** 加載前回調 */
  onBeforeLoad?: () => void;
  /** 加載成功回調 */
  onLoadSuccess?: (component: React.ComponentType<any>) => void;
  /** 加載失敗回調 */
  onLoadError?: (error: Error) => void;
  /** 加載完成回調 */
  onLoadComplete?: () => void;
}

// 組件懶加載狀態
export interface ComponentLazyLoadState {
  /** 當前狀態 */
  status: LazyLoadStatus;
  /** 組件實例 */
  component: React.ComponentType<any> | null;
  /** 錯誤信息 */
  error: Error | null;
  /** 加載開始時間 */
  loadStartTime: number | null;
  /** 加載完成時間 */
  loadEndTime: number | null;
  /** 加載耗時 (ms) */
  loadDuration: number | null;
  /** 重試次數 */
  retryAttempts: number;
  /** 是否已取消 */
  isCancelled: boolean;
  /** 是否已預加載 */
  isPreloaded: boolean;
}

// 圖片懶加載配置
export interface ImageLazyLoadConfig {
  /** 圖片URL */
  src: string;
  /** 加載策略 */
  strategy: LazyLoadStrategy;
  /** 優先級 */
  priority: LazyLoadPriority;
  /** 預加載距離 (px) */
  preloadDistance?: number;
  /** 加載超時時間 (ms) */
  timeout?: number;
  /** 重試次數 */
  retryCount?: number;
  /** 重試延遲 (ms) */
  retryDelay?: number;
  /** 是否啟用緩存 */
  enableCache?: boolean;
  /** 緩存時間 (ms) */
  cacheTime?: number;
  /** 佔位符圖片 */
  placeholder?: string;
  /** 錯誤回退圖片 */
  fallback?: string;
  /** 圖片質量 */
  quality?: 'low' | 'medium' | 'high';
  /** 圖片尺寸 */
  size?: {
    width: number;
    height: number;
  };
  /** 自定義加載條件 */
  shouldLoad?: () => boolean;
  /** 加載前回調 */
  onBeforeLoad?: () => void;
  /** 加載成功回調 */
  onLoadSuccess?: (image: HTMLImageElement) => void;
  /** 加載失敗回調 */
  onLoadError?: (error: Error) => void;
  /** 加載完成回調 */
  onLoadComplete?: () => void;
}

// 圖片懶加載狀態
export interface ImageLazyLoadState {
  /** 當前狀態 */
  status: LazyLoadStatus;
  /** 圖片元素 */
  image: HTMLImageElement | null;
  /** 錯誤信息 */
  error: Error | null;
  /** 加載開始時間 */
  loadStartTime: number | null;
  /** 加載完成時間 */
  loadEndTime: number | null;
  /** 加載耗時 (ms) */
  loadDuration: number | null;
  /** 重試次數 */
  retryAttempts: number;
  /** 是否已取消 */
  isCancelled: boolean;
  /** 是否已預加載 */
  isPreloaded: boolean;
  /** 當前顯示的圖片URL */
  currentSrc: string | null;
}

// 數據懶加載配置
export interface DataLazyLoadConfig<T = any> {
  /** 數據加載函數 */
  loader: () => Promise<T>;
  /** 加載策略 */
  strategy: LazyLoadStrategy;
  /** 優先級 */
  priority: LazyLoadPriority;
  /** 預加載距離 (px) */
  preloadDistance?: number;
  /** 加載超時時間 (ms) */
  timeout?: number;
  /** 重試次數 */
  retryCount?: number;
  /** 重試延遲 (ms) */
  retryDelay?: number;
  /** 是否啟用緩存 */
  enableCache?: boolean;
  /** 緩存時間 (ms) */
  cacheTime?: number;
  /** 初始數據 */
  initialData?: T;
  /** 自定義加載條件 */
  shouldLoad?: () => boolean;
  /** 加載前回調 */
  onBeforeLoad?: () => void;
  /** 加載成功回調 */
  onLoadSuccess?: (data: T) => void;
  /** 加載失敗回調 */
  onLoadError?: (error: Error) => void;
  /** 加載完成回調 */
  onLoadComplete?: () => void;
}

// 數據懶加載狀態
export interface DataLazyLoadState<T = any> {
  /** 當前狀態 */
  status: LazyLoadStatus;
  /** 數據 */
  data: T | null;
  /** 錯誤信息 */
  error: Error | null;
  /** 加載開始時間 */
  loadStartTime: number | null;
  /** 加載完成時間 */
  loadEndTime: number | null;
  /** 加載耗時 (ms) */
  loadDuration: number | null;
  /** 重試次數 */
  retryAttempts: number;
  /** 是否已取消 */
  isCancelled: boolean;
  /** 是否已預加載 */
  isPreloaded: boolean;
}

// 懶加載性能指標
export interface LazyLoadPerformanceMetrics {
  /** 總加載次數 */
  totalLoads: number;
  /** 成功加載次數 */
  successfulLoads: number;
  /** 失敗加載次數 */
  failedLoads: number;
  /** 平均加載時間 (ms) */
  averageLoadTime: number;
  /** 最快加載時間 (ms) */
  fastestLoadTime: number;
  /** 最慢加載時間 (ms) */
  slowestLoadTime: number;
  /** 緩存命中次數 */
  cacheHits: number;
  /** 緩存未命中次數 */
  cacheMisses: number;
  /** 緩存命中率 */
  cacheHitRate: number;
  /** 預加載次數 */
  preloadCount: number;
  /** 取消加載次數 */
  cancelledLoads: number;
  /** 重試次數 */
  retryCount: number;
}

// 懶加載事件
export interface LazyLoadEvent {
  /** 事件類型 */
  type:
    | 'load_start'
    | 'load_success'
    | 'load_error'
    | 'load_complete'
    | 'preload'
    | 'cancel';
  /** 資源類型 */
  resourceType: 'component' | 'image' | 'data';
  /** 資源標識 */
  resourceId: string;
  /** 時間戳 */
  timestamp: number;
  /** 事件數據 */
  data?: unknown;
  /** 錯誤信息 */
  error?: Error;
  /** 性能指標 */
  performance?: {
    loadStartTime: number;
    loadEndTime: number;
    loadDuration: number;
  };
}

// 懶加載管理器配置
export interface LazyLoadManagerConfig {
  /** 全局預加載距離 (px) */
  globalPreloadDistance?: number;
  /** 全局加載超時時間 (ms) */
  globalTimeout?: number;
  /** 全局重試次數 */
  globalRetryCount?: number;
  /** 全局重試延遲 (ms) */
  globalRetryDelay?: number;
  /** 是否啟用全局緩存 */
  enableGlobalCache?: boolean;
  /** 全局緩存時間 (ms) */
  globalCacheTime?: number;
  /** 最大並發加載數 */
  maxConcurrentLoads?: number;
  /** 是否啟用性能監控 */
  enablePerformanceMonitoring?: boolean;
  /** 性能監控間隔 (ms) */
  performanceMonitoringInterval?: number;
  /** 是否啟用事件日誌 */
  enableEventLogging?: boolean;
  /** 事件日誌級別 */
  eventLogLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** 自定義事件處理器 */
  eventHandlers?: {
    onLoadStart?: (event: LazyLoadEvent) => void;
    onLoadSuccess?: (event: LazyLoadEvent) => void;
    onLoadError?: (event: LazyLoadEvent) => void;
    onLoadComplete?: (event: LazyLoadEvent) => void;
    onPreload?: (event: LazyLoadEvent) => void;
    onCancel?: (event: LazyLoadEvent) => void;
  };
}

// 懶加載管理器狀態
export interface LazyLoadManagerState {
  /** 當前加載中的資源數量 */
  activeLoads: number;
  /** 隊列中的資源數量 */
  queuedLoads: number;
  /** 緩存中的資源數量 */
  cachedResources: number;
  /** 性能指標 */
  performanceMetrics: LazyLoadPerformanceMetrics;
  /** 是否已初始化 */
  isInitialized: boolean;
  /** 是否已暫停 */
  isPaused: boolean;
  /** 最後更新時間 */
  lastUpdated: number;
}

// 懶加載組件Props
export interface LazyLoadComponentProps {
  /** 組件配置 */
  config: ComponentLazyLoadConfig;
  /** 組件Props */
  componentProps?: Record<string, any>;
  /** 自定義加載組件 */
  loadingComponent?: React.ComponentType<any>;
  /** 自定義錯誤組件 */
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  /** 自定義回退組件 */
  fallbackComponent?: React.ComponentType<any>;
  /** 加載前回調 */
  onBeforeLoad?: () => void;
  /** 加載成功回調 */
  onLoadSuccess?: (component: React.ComponentType<any>) => void;
  /** 加載失敗回調 */
  onLoadError?: (error: Error) => void;
  /** 加載完成回調 */
  onLoadComplete?: () => void;
}

// 懶加載圖片Props
export interface LazyLoadImageProps {
  /** 圖片配置 */
  config: ImageLazyLoadConfig;
  /** 圖片樣式 */
  style?: React.CSSProperties;
  /** 圖片類名 */
  className?: string;
  /** 圖片屬性 */
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
  /** 自定義加載組件 */
  loadingComponent?: React.ComponentType<any>;
  /** 自定義錯誤組件 */
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  /** 自定義佔位符組件 */
  placeholderComponent?: React.ComponentType<any>;
  /** 加載前回調 */
  onBeforeLoad?: () => void;
  /** 加載成功回調 */
  onLoadSuccess?: (image: HTMLImageElement) => void;
  /** 加載失敗回調 */
  onLoadError?: (error: Error) => void;
  /** 加載完成回調 */
  onLoadComplete?: () => void;
}

// 懶加載數據Props
export interface LazyLoadDataProps<T = any> {
  /** 數據配置 */
  config: DataLazyLoadConfig<T>;
  /** 渲染函數 */
  children: (data: T | null, state: DataLazyLoadState<T>) => React.ReactNode;
  /** 自定義加載組件 */
  loadingComponent?: React.ComponentType<any>;
  /** 自定義錯誤組件 */
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  /** 加載前回調 */
  onBeforeLoad?: () => void;
  /** 加載成功回調 */
  onLoadSuccess?: (data: T) => void;
  /** 加載失敗回調 */
  onLoadError?: (error: Error) => void;
  /** 加載完成回調 */
  onLoadComplete?: () => void;
}

// 懶加載Hook返回值
export interface UseLazyLoadReturn<T = any> {
  /** 當前狀態 */
  state: T extends React.ComponentType<any>
    ? ComponentLazyLoadState
    : T extends string
      ? ImageLazyLoadState
      : DataLazyLoadState<T>;
  /** 開始加載 */
  load: () => Promise<void>;
  /** 取消加載 */
  cancel: () => void;
  /** 重試加載 */
  retry: () => Promise<void>;
  /** 預加載 */
  preload: () => Promise<void>;
  /** 清除緩存 */
  clearCache: () => void;
  /** 是否正在加載 */
  isLoading: boolean;
  /** 是否已加載 */
  isLoaded: boolean;
  /** 是否有錯誤 */
  hasError: boolean;
  /** 是否已取消 */
  isCancelled: boolean;
}

// 懶加載服務接口
export interface LazyLoadService {
  /** 初始化服務 */
  initialize(config?: LazyLoadManagerConfig): Promise<void>;
  /** 註冊組件 */
  registerComponent(id: string, config: ComponentLazyLoadConfig): void;
  /** 註冊圖片 */
  registerImage(id: string, config: ImageLazyLoadConfig): void;
  /** 註冊數據 */
  registerData<T>(id: string, config: DataLazyLoadConfig<T>): void;
  /** 加載組件 */
  loadComponent(id: string): Promise<React.ComponentType<any>>;
  /** 加載圖片 */
  loadImage(id: string): Promise<HTMLImageElement>;
  /** 加載數據 */
  loadData<T>(id: string): Promise<T>;
  /** 預加載組件 */
  preloadComponent(id: string): Promise<void>;
  /** 預加載圖片 */
  preloadImage(id: string): Promise<void>;
  /** 預加載數據 */
  preloadData<T>(id: string): Promise<void>;
  /** 取消加載 */
  cancelLoad(id: string): void;
  /** 清除緩存 */
  clearCache(id?: string): void;
  /** 獲取狀態 */
  getState(): LazyLoadManagerState;
  /** 獲取性能指標 */
  getPerformanceMetrics(): LazyLoadPerformanceMetrics;
  /** 暫停服務 */
  pause(): void;
  /** 恢復服務 */
  resume(): void;
  /** 銷毀服務 */
  destroy(): void;
}

// 懶加載工具函數類型
export interface LazyLoadUtils {
  /** 創建組件懶加載配置 */
  createComponentConfig(
    path: string,
    options?: Partial<ComponentLazyLoadConfig>
  ): ComponentLazyLoadConfig;
  /** 創建圖片懶加載配置 */
  createImageConfig(
    src: string,
    options?: Partial<ImageLazyLoadConfig>
  ): ImageLazyLoadConfig;
  /** 創建數據懶加載配置 */
  createDataConfig<T>(
    loader: () => Promise<T>,
    options?: Partial<DataLazyLoadConfig<T>>
  ): DataLazyLoadConfig<T>;
  /** 檢查是否支持 Intersection Observer */
  supportsIntersectionObserver(): boolean;
  /** 檢查是否支持 Resize Observer */
  supportsResizeObserver(): boolean;
  /** 檢查網絡連接狀態 */
  getNetworkStatus(): 'online' | 'offline' | 'slow';
  /** 獲取設備性能等級 */
  getDevicePerformance(): 'low' | 'medium' | 'high';
  /** 計算最佳預加載距離 */
  calculateOptimalPreloadDistance(): number;
  /** 生成唯一ID */
  generateId(): string;
  /** 格式化時間 */
  formatDuration(ms: number): string;
  /** 格式化文件大小 */
  formatFileSize(bytes: number): string;
}
