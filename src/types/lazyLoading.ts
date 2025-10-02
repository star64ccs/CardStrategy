// 懶加載系統Class型定義

// 基礎懶加載Status
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

// Component懶加載Configure
export interface ComponentLazyLoadConfig {
  /** ComponentPath */
  path: string;
  /** 加載策略 */
  strategy: LazyLoadStrategy;
  /** 優先級 */
  priority: LazyLoadPriority;
  /** 預加載距離 (px) */
  preloadDistance?: number;
  /** 加載超時Time (ms) */
  timeout?: number;
  /** Retry次數 */
  retryCount?: number;
  /** Retry延遲 (ms) */
  retryDelay?: number;
  /** YesNoEnableCache */
  enableCache?: boolean;
  /** CacheTime (ms) */
  cacheTime?: number;
  /** Error回退Component */
  fallback?: React.ComponentType<any>;
  /** 加載指示器Component */
  loadingComponent?: React.ComponentType<any>;
  /** Custom加載Condition */
  shouldLoad?: () => boolean;
  /** 加載前Callback */
  onBeforeLoad?: () => void;
  /** 加載SuccessCallback */
  onLoadSuccess?: (component: React.ComponentType<any>) => void;
  /** 加載FailedCallback */
  onLoadError?: (error: Error) => void;
  /** 加載CompleteCallback */
  onLoadComplete?: () => void;
}

// Component懶加載Status
export interface ComponentLazyLoadState {
  /** 當前Status */
  status: LazyLoadStatus;
  /** ComponentInstance */
  component: React.ComponentType<any> | null;
  /** ErrorInformation */
  error: Error | null;
  /** 加載BeginTime */
  loadStartTime: number | null;
  /** 加載CompleteTime */
  loadEndTime: number | null;
  /** 加載耗時 (ms) */
  loadDuration: number | null;
  /** Retry次數 */
  retryAttempts: number;
  /** YesNo已Cancel */
  isCancelled: boolean;
  /** YesNo已預加載 */
  isPreloaded: boolean;
}

// Graph片懶加載Configure
export interface ImageLazyLoadConfig {
  /** Graph片URL */
  src: string;
  /** 加載策略 */
  strategy: LazyLoadStrategy;
  /** 優先級 */
  priority: LazyLoadPriority;
  /** 預加載距離 (px) */
  preloadDistance?: number;
  /** 加載超時Time (ms) */
  timeout?: number;
  /** Retry次數 */
  retryCount?: number;
  /** Retry延遲 (ms) */
  retryDelay?: number;
  /** YesNoEnableCache */
  enableCache?: boolean;
  /** CacheTime (ms) */
  cacheTime?: number;
  /** 佔位符Graph片 */
  placeholder?: string;
  /** Error回退Graph片 */
  fallback?: string;
  /** Graph片質量 */
  quality?: 'low' | 'medium' | 'high';
  /** Graph片尺寸 */
  size?: {
    width: number;
    height: number;
  };
  /** Custom加載Condition */
  shouldLoad?: () => boolean;
  /** 加載前Callback */
  onBeforeLoad?: () => void;
  /** 加載SuccessCallback */
  onLoadSuccess?: (image: HTMLImageElement) => void;
  /** 加載FailedCallback */
  onLoadError?: (error: Error) => void;
  /** 加載CompleteCallback */
  onLoadComplete?: () => void;
}

// Graph片懶加載Status
export interface ImageLazyLoadState {
  /** 當前Status */
  status: LazyLoadStatus;
  /** Graph片Element */
  image: HTMLImageElement | null;
  /** ErrorInformation */
  error: Error | null;
  /** 加載BeginTime */
  loadStartTime: number | null;
  /** 加載CompleteTime */
  loadEndTime: number | null;
  /** 加載耗時 (ms) */
  loadDuration: number | null;
  /** Retry次數 */
  retryAttempts: number;
  /** YesNo已Cancel */
  isCancelled: boolean;
  /** YesNo已預加載 */
  isPreloaded: boolean;
  /** 當前Show的Graph片URL */
  currentSrc: string | null;
}

// Data懶加載Configure
export interface DataLazyLoadConfig<T = any> {
  /** Data加載Function */
  loader: () => Promise<T>;
  /** 加載策略 */
  strategy: LazyLoadStrategy;
  /** 優先級 */
  priority: LazyLoadPriority;
  /** 預加載距離 (px) */
  preloadDistance?: number;
  /** 加載超時Time (ms) */
  timeout?: number;
  /** Retry次數 */
  retryCount?: number;
  /** Retry延遲 (ms) */
  retryDelay?: number;
  /** YesNoEnableCache */
  enableCache?: boolean;
  /** CacheTime (ms) */
  cacheTime?: number;
  /** 初始Data */
  initialData?: T;
  /** Custom加載Condition */
  shouldLoad?: () => boolean;
  /** 加載前Callback */
  onBeforeLoad?: () => void;
  /** 加載SuccessCallback */
  onLoadSuccess?: (data: T) => void;
  /** 加載FailedCallback */
  onLoadError?: (error: Error) => void;
  /** 加載CompleteCallback */
  onLoadComplete?: () => void;
}

// Data懶加載Status
export interface DataLazyLoadState<T = any> {
  /** 當前Status */
  status: LazyLoadStatus;
  /** Data */
  data: T | null;
  /** ErrorInformation */
  error: Error | null;
  /** 加載BeginTime */
  loadStartTime: number | null;
  /** 加載CompleteTime */
  loadEndTime: number | null;
  /** 加載耗時 (ms) */
  loadDuration: number | null;
  /** Retry次數 */
  retryAttempts: number;
  /** YesNo已Cancel */
  isCancelled: boolean;
  /** YesNo已預加載 */
  isPreloaded: boolean;
}

// 懶加載性能指標
export interface LazyLoadPerformanceMetrics {
  /** 總加載次數 */
  totalLoads: number;
  /** Success加載次數 */
  successfulLoads: number;
  /** Failed加載次數 */
  failedLoads: number;
  /** 平均加載Time (ms) */
  averageLoadTime: number;
  /** 最快加載Time (ms) */
  fastestLoadTime: number;
  /** 最慢加載Time (ms) */
  slowestLoadTime: number;
  /** Cache命中次數 */
  cacheHits: number;
  /** Cache未命中次數 */
  cacheMisses: number;
  /** Cache命中率 */
  cacheHitRate: number;
  /** 預加載次數 */
  preloadCount: number;
  /** Cancel加載次數 */
  cancelledLoads: number;
  /** Retry次數 */
  retryCount: number;
}

// 懶加載Event
export interface LazyLoadEvent {
  /** EventClass型 */
  type:
    | 'load_start'
    | 'load_success'
    | 'load_error'
    | 'load_complete'
    | 'preload'
    | 'cancel';
  /** ResourceClass型 */
  resourceType: 'component' | 'image' | 'data';
  /** Resource標識 */
  resourceId: string;
  /** Time戳 */
  timestamp: number;
  /** EventData */
  data?: unknown;
  /** ErrorInformation */
  error?: Error;
  /** 性能指標 */
  performance?: {
    loadStartTime: number;
    loadEndTime: number;
    loadDuration: number;
  };
}

// 懶加載Manage器Configure
export interface LazyLoadManagerConfig {
  /** Global預加載距離 (px) */
  globalPreloadDistance?: number;
  /** Global加載超時Time (ms) */
  globalTimeout?: number;
  /** GlobalRetry次數 */
  globalRetryCount?: number;
  /** GlobalRetry延遲 (ms) */
  globalRetryDelay?: number;
  /** YesNoEnableGlobalCache */
  enableGlobalCache?: boolean;
  /** GlobalCacheTime (ms) */
  globalCacheTime?: number;
  /** 最大Concurrent加載數 */
  maxConcurrentLoads?: number;
  /** YesNoEnable性能Monitor */
  enablePerformanceMonitoring?: boolean;
  /** 性能Monitor間隔 (ms) */
  performanceMonitoringInterval?: number;
  /** YesNoEnableEventLog */
  enableEventLogging?: boolean;
  /** EventLog級別 */
  eventLogLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** CustomEventHandle器 */
  eventHandlers?: {
    onLoadStart?: (event: LazyLoadEvent) => void;
    onLoadSuccess?: (event: LazyLoadEvent) => void;
    onLoadError?: (event: LazyLoadEvent) => void;
    onLoadComplete?: (event: LazyLoadEvent) => void;
    onPreload?: (event: LazyLoadEvent) => void;
    onCancel?: (event: LazyLoadEvent) => void;
  };
}

// 懶加載Manage器Status
export interface LazyLoadManagerState {
  /** 當前加載中的Resource數量 */
  activeLoads: number;
  /** Queue中的Resource數量 */
  queuedLoads: number;
  /** Cache中的Resource數量 */
  cachedResources: number;
  /** 性能指標 */
  performanceMetrics: LazyLoadPerformanceMetrics;
  /** YesNo已Initialize */
  isInitialized: boolean;
  /** YesNo已Pause */
  isPaused: boolean;
  /** 最後UpdateTime */
  lastUpdated: number;
}

// 懶加載ComponentProps
export interface LazyLoadComponentProps {
  /** ComponentConfigure */
  config: ComponentLazyLoadConfig;
  /** ComponentProps */
  componentProps?: Record<string, any>;
  /** Custom加載Component */
  loadingComponent?: React.ComponentType<any>;
  /** CustomErrorComponent */
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  /** Custom回退Component */
  fallbackComponent?: React.ComponentType<any>;
  /** 加載前Callback */
  onBeforeLoad?: () => void;
  /** 加載SuccessCallback */
  onLoadSuccess?: (component: React.ComponentType<any>) => void;
  /** 加載FailedCallback */
  onLoadError?: (error: Error) => void;
  /** 加載CompleteCallback */
  onLoadComplete?: () => void;
}

// 懶加載Graph片Props
export interface LazyLoadImageProps {
  /** Graph片Configure */
  config: ImageLazyLoadConfig;
  /** Graph片樣式 */
  style?: React.CSSProperties;
  /** Graph片Class名 */
  className?: string;
  /** Graph片Property */
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
  /** Custom加載Component */
  loadingComponent?: React.ComponentType<any>;
  /** CustomErrorComponent */
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  /** Custom佔位符Component */
  placeholderComponent?: React.ComponentType<any>;
  /** 加載前Callback */
  onBeforeLoad?: () => void;
  /** 加載SuccessCallback */
  onLoadSuccess?: (image: HTMLImageElement) => void;
  /** 加載FailedCallback */
  onLoadError?: (error: Error) => void;
  /** 加載CompleteCallback */
  onLoadComplete?: () => void;
}

// 懶加載DataProps
export interface LazyLoadDataProps<T = any> {
  /** DataConfigure */
  config: DataLazyLoadConfig<T>;
  /** 渲染Function */
  children: (data: T | null, state: DataLazyLoadState<T>) => React.ReactNode;
  /** Custom加載Component */
  loadingComponent?: React.ComponentType<any>;
  /** CustomErrorComponent */
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  /** 加載前Callback */
  onBeforeLoad?: () => void;
  /** 加載SuccessCallback */
  onLoadSuccess?: (data: T) => void;
  /** 加載FailedCallback */
  onLoadError?: (error: Error) => void;
  /** 加載CompleteCallback */
  onLoadComplete?: () => void;
}

// 懶加載HookReturnValue
export interface UseLazyLoadReturn<T = any> {
  /** 當前Status */
  state: T extends React.ComponentType<any>
    ? ComponentLazyLoadState
    : T extends string
      ? ImageLazyLoadState
      : DataLazyLoadState<T>;
  /** Begin加載 */
  load: () => Promise<void>;
  /** Cancel加載 */
  cancel: () => void;
  /** Retry加載 */
  retry: () => Promise<void>;
  /** 預加載 */
  preload: () => Promise<void>;
  /** ClearCache */
  clearCache: () => void;
  /** YesNo正在加載 */
  isLoading: boolean;
  /** YesNo已加載 */
  isLoaded: boolean;
  /** YesNo有Error */
  hasError: boolean;
  /** YesNo已Cancel */
  isCancelled: boolean;
}

// 懶加載ServiceInterface
export interface LazyLoadService {
  /** InitializeService */
  initialize(config?: LazyLoadManagerConfig): Promise<void>;
  /** RegisterComponent */
  registerComponent(id: string, config: ComponentLazyLoadConfig): void;
  /** RegisterGraph片 */
  registerImage(id: string, config: ImageLazyLoadConfig): void;
  /** RegisterData */
  registerData<T>(id: string, config: DataLazyLoadConfig<T>): void;
  /** 加載Component */
  loadComponent(id: string): Promise<React.ComponentType<any>>;
  /** 加載Graph片 */
  loadImage(id: string): Promise<HTMLImageElement>;
  /** 加載Data */
  loadData<T>(id: string): Promise<T>;
  /** 預加載Component */
  preloadComponent(id: string): Promise<void>;
  /** 預加載Graph片 */
  preloadImage(id: string): Promise<void>;
  /** 預加載Data */
  preloadData<T>(id: string): Promise<void>;
  /** Cancel加載 */
  cancelLoad(id: string): void;
  /** ClearCache */
  clearCache(id?: string): void;
  /** GetStatus */
  getState(): LazyLoadManagerState;
  /** Get性能指標 */
  getPerformanceMetrics(): LazyLoadPerformanceMetrics;
  /** PauseService */
  pause(): void;
  /** RestoreService */
  resume(): void;
  /** 銷毀Service */
  destroy(): void;
}

// 懶加載ToolFunctionClass型
export interface LazyLoadUtils {
  /** CreateComponent懶加載Configure */
  createComponentConfig(
    path: string,
    options?: Partial<ComponentLazyLoadConfig>
  ): ComponentLazyLoadConfig;
  /** CreateGraph片懶加載Configure */
  createImageConfig(
    src: string,
    options?: Partial<ImageLazyLoadConfig>
  ): ImageLazyLoadConfig;
  /** CreateData懶加載Configure */
  createDataConfig<T>(
    loader: () => Promise<T>,
    options?: Partial<DataLazyLoadConfig<T>>
  ): DataLazyLoadConfig<T>;
  /** CheckYesNoSupport Intersection Observer */
  supportsIntersectionObserver(): boolean;
  /** CheckYesNoSupport Resize Observer */
  supportsResizeObserver(): boolean;
  /** CheckNetworkConnectStatus */
  getNetworkStatus(): 'online' | 'offline' | 'slow';
  /** Get設備性能等級 */
  getDevicePerformance(): 'low' | 'medium' | 'high';
  /** 計算最佳預加載距離 */
  calculateOptimalPreloadDistance(): number;
  /** 生成UniqueID */
  generateId(): string;
  /** FormatTime */
  formatDuration(ms: number): string;
  /** FormatFile大小 */
  formatFileSize(bytes: number): string;
}
