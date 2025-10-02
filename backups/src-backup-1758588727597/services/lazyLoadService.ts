// 懶加載服務實現
import type {
  ComponentLazyLoadConfig,
  DataLazyLoadConfig,
  ImageLazyLoadConfig,
  LazyLoadEvent,
  LazyLoadManagerConfig,
  LazyLoadManagerState,
  LazyLoadPerformanceMetrics,
  LazyLoadService,
} from '../types/lazyLoading';
import { LazyLoadPriority, LazyLoadStrategy } from '../types/lazyLoading';

// 緩存項接口
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// 加載隊列項接口
interface LoadQueueItem {
  id: string;
  type: 'component' | 'image' | 'data';
  priority: LazyLoadPriority;
  loadFunction: () => Promise<any>;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

/**
 * 懶加載服務實現
 */
export class LazyLoadServiceImpl implements LazyLoadService {
  private static instance: LazyLoadServiceImpl;
  private config: LazyLoadManagerConfig;
  private state: LazyLoadManagerState;
  private readonly componentRegistry: Map<string, ComponentLazyLoadConfig> =
    new Map();
  private readonly imageRegistry: Map<string, ImageLazyLoadConfig> = new Map();
  private readonly dataRegistry: Map<string, DataLazyLoadConfig> = new Map();
  private readonly componentCache: Map<
    string,
    CacheItem<React.ComponentType<any>>
  > = new Map();
  private readonly imageCache: Map<string, CacheItem<HTMLImageElement>> =
    new Map();
  private readonly dataCache: Map<string, CacheItem<any>> = new Map();
  private loadQueue: LoadQueueItem[] = [];
  private readonly activeLoads: Set<string> = new Set();
  private readonly eventListeners: Set<(event: LazyLoadEvent) => void> =
    new Set();
  private performanceMetrics: LazyLoadPerformanceMetrics;
  private isInitialized = false;
  private isPaused = false;

  constructor() {
    this.config = this.getDefaultConfig();
    this.state = this.getInitialState();
    this.performanceMetrics = this.getInitialPerformanceMetrics();
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): LazyLoadServiceImpl {
    if (!LazyLoadServiceImpl.instance) {
      LazyLoadServiceImpl.instance = new LazyLoadServiceImpl();
    }
    return LazyLoadServiceImpl.instance;
  }

  /**
   * 初始化服務
   */
  public async initialize(config?: LazyLoadManagerConfig): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.config = { ...this.getDefaultConfig(), ...config };
    this.state = this.getInitialState();
    this.performanceMetrics = this.getInitialPerformanceMetrics();

    this.isInitialized = true;
    this.state.isInitialized = true;
    this.state.lastUpdated = Date.now();

    this.emitEvent({
      type: 'load_start',
      resourceType: 'data',
      resourceId: 'service_initialization',
      timestamp: Date.now(),
      data: { config: this.config },
    });
  }

  /**
   * 註冊組件
   */
  public registerComponent(id: string, config: ComponentLazyLoadConfig): void {
    this.componentRegistry.set(id, {
      ...this.getDefaultComponentConfig(),
      ...config,
    });
  }

  /**
   * 註冊圖片
   */
  public registerImage(id: string, config: ImageLazyLoadConfig): void {
    this.imageRegistry.set(id, {
      ...this.getDefaultImageConfig(),
      ...config,
    });
  }

  /**
   * 註冊數據
   */
  public registerData<T>(id: string, config: DataLazyLoadConfig<T>): void {
    this.dataRegistry.set(id, {
      ...this.getDefaultDataConfig(),
      ...config,
    });
  }

  /**
   * 加載組件
   */
  public async loadComponent(id: string): Promise<React.ComponentType<any>> {
    const config = this.componentRegistry.get(id);
    if (!config) {
      throw new Error(`Component with id '${id}' not found`);
    }

    // 檢查緩存
    if (config.enableCache) {
      const cached = this.getCachedComponent(id);
      if (cached) {
        this.recordCacheHit('component');
        return cached;
      }
    }

    return this.queueLoad({
      id,
      type: 'component',
      priority: config.priority,
      loadFunction: async () => {
        this.emitEvent({
          type: 'load_start',
          resourceType: 'component',
          resourceId: id,
          timestamp: Date.now(),
          data: { config },
        });

        const startTime = Date.now();
        try {
          // 動態導入組件
          const module = await import(
            /* webpackChunkName: "[request]" */ config.path
          ).catch(() => {
            throw new Error(
              `Failed to load component from path: ${config.path}`
            );
          });
          const component = module.default || module;

          const endTime = Date.now();
          const duration = endTime - startTime;

          // 緩存組件
          if (config.enableCache) {
            this.cacheComponent(id, component, config.cacheTime);
          }

          this.recordLoadSuccess(duration);
          this.emitEvent({
            type: 'load_success',
            resourceType: 'component',
            resourceId: id,
            timestamp: Date.now(),
            data: { component, duration },
          });

          return component;
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.recordLoadError(duration);
          this.emitEvent({
            type: 'load_error',
            resourceType: 'component',
            resourceId: id,
            timestamp: Date.now(),
            error: error as Error,
            performance: {
              loadStartTime: startTime,
              loadEndTime: endTime,
              loadDuration: duration,
            },
          });

          throw error;
        }
      },
    });
  }

  /**
   * 加載圖片
   */
  public async loadImage(id: string): Promise<HTMLImageElement> {
    const config = this.imageRegistry.get(id);
    if (!config) {
      throw new Error(`Image with id '${id}' not found`);
    }

    // 檢查緩存
    if (config.enableCache) {
      const cached = this.getCachedImage(id);
      if (cached) {
        this.recordCacheHit('image');
        return cached;
      }
    }

    return this.queueLoad({
      id,
      type: 'image',
      priority: config.priority,
      loadFunction: async () => {
        this.emitEvent({
          type: 'load_start',
          resourceType: 'image',
          resourceId: id,
          timestamp: Date.now(),
          data: { config },
        });

        const startTime = Date.now();
        try {
          const image = await this.loadImageElement(config);

          const endTime = Date.now();
          const duration = endTime - startTime;

          // 緩存圖片
          if (config.enableCache) {
            this.cacheImage(id, image, config.cacheTime);
          }

          this.recordLoadSuccess(duration);
          this.emitEvent({
            type: 'load_success',
            resourceType: 'image',
            resourceId: id,
            timestamp: Date.now(),
            data: { image, duration },
          });

          return image;
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.recordLoadError(duration);
          this.emitEvent({
            type: 'load_error',
            resourceType: 'image',
            resourceId: id,
            timestamp: Date.now(),
            error: error as Error,
            performance: {
              loadStartTime: startTime,
              loadEndTime: endTime,
              loadDuration: duration,
            },
          });

          throw error;
        }
      },
    });
  }

  /**
   * 加載數據
   */
  public async loadData<T>(id: string): Promise<T> {
    const config = this.dataRegistry.get(id);
    if (!config) {
      throw new Error(`Data with id '${id}' not found`);
    }

    // 檢查緩存
    if (config.enableCache) {
      const cached = this.getCachedData<T>(id);
      if (cached) {
        this.recordCacheHit('data');
        return cached;
      }
    }

    return this.queueLoad({
      id,
      type: 'data',
      priority: config.priority,
      loadFunction: async () => {
        this.emitEvent({
          type: 'load_start',
          resourceType: 'data',
          resourceId: id,
          timestamp: Date.now(),
          data: { config },
        });

        const startTime = Date.now();
        try {
          const data = await config.loader();

          const endTime = Date.now();
          const duration = endTime - startTime;

          // 緩存數據
          if (config.enableCache) {
            this.cacheData<T>(id, data, config.cacheTime);
          }

          this.recordLoadSuccess(duration);
          this.emitEvent({
            type: 'load_success',
            resourceType: 'data',
            resourceId: id,
            timestamp: Date.now(),
            data: { data, duration },
          });

          return data;
        } catch (error) {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.recordLoadError(duration);
          this.emitEvent({
            type: 'load_error',
            resourceType: 'data',
            resourceId: id,
            timestamp: Date.now(),
            error: error as Error,
            performance: {
              loadStartTime: startTime,
              loadEndTime: endTime,
              loadDuration: duration,
            },
          });

          throw error;
        }
      },
    });
  }

  /**
   * 預加載組件
   */
  public async preloadComponent(id: string): Promise<void> {
    const config = this.componentRegistry.get(id);
    if (!config) {
      throw new Error(`Component with id '${id}' not found`);
    }

    // 檢查是否已經加載
    if (config.enableCache && this.getCachedComponent(id)) {
      return;
    }

    try {
      await this.loadComponent(id);
      this.performanceMetrics.preloadCount++;
      this.emitEvent({
        type: 'preload',
        resourceType: 'component',
        resourceId: id,
        timestamp: Date.now(),
      });
    } catch (error) {
      // 預加載失敗不拋出錯誤
      console.warn(`Failed to preload component '${id}':`, error);
    }
  }

  /**
   * 預加載圖片
   */
  public async preloadImage(id: string): Promise<void> {
    const config = this.imageRegistry.get(id);
    if (!config) {
      throw new Error(`Image with id '${id}' not found`);
    }

    // 檢查是否已經加載
    if (config.enableCache && this.getCachedImage(id)) {
      return;
    }

    try {
      await this.loadImage(id);
      this.performanceMetrics.preloadCount++;
      this.emitEvent({
        type: 'preload',
        resourceType: 'image',
        resourceId: id,
        timestamp: Date.now(),
      });
    } catch (error) {
      // 預加載失敗不拋出錯誤
      console.warn(`Failed to preload image '${id}':`, error);
    }
  }

  /**
   * 預加載數據
   */
  public async preloadData<T>(id: string): Promise<void> {
    const config = this.dataRegistry.get(id);
    if (!config) {
      throw new Error(`Data with id '${id}' not found`);
    }

    // 檢查是否已經加載
    if (config.enableCache && this.getCachedData<T>(id)) {
      return;
    }

    try {
      await this.loadData<T>(id);
      this.performanceMetrics.preloadCount++;
      this.emitEvent({
        type: 'preload',
        resourceType: 'data',
        resourceId: id,
        timestamp: Date.now(),
      });
    } catch (error) {
      // 預加載失敗不拋出錯誤
      console.warn(`Failed to preload data '${id}':`, error);
    }
  }

  /**
   * 取消加載
   */
  public cancelLoad(id: string): void {
    this.activeLoads.delete(id);
    this.loadQueue = this.loadQueue.filter(item => item.id !== id);
    this.performanceMetrics.cancelledLoads++;
    this.emitEvent({
      type: 'cancel',
      resourceType: 'data',
      resourceId: id,
      timestamp: Date.now(),
    });
  }

  /**
   * 清除緩存
   */
  public clearCache(id?: string): void {
    if (id) {
      this.componentCache.delete(id);
      this.imageCache.delete(id);
      this.dataCache.delete(id);
    } else {
      this.componentCache.clear();
      this.imageCache.clear();
      this.dataCache.clear();
    }
    this.updateState();
  }

  /**
   * 獲取狀態
   */
  public getState(): LazyLoadManagerState {
    return { ...this.state };
  }

  /**
   * 獲取性能指標
   */
  public getPerformanceMetrics(): LazyLoadPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * 暫停服務
   */
  public pause(): void {
    this.isPaused = true;
    this.state.isPaused = true;
    this.state.lastUpdated = Date.now();
  }

  /**
   * 恢復服務
   */
  public resume(): void {
    this.isPaused = false;
    this.state.isPaused = false;
    this.state.lastUpdated = Date.now();
    this.processQueue();
  }

  /**
   * 銷毀服務
   */
  public destroy(): void {
    this.isInitialized = false;
    this.isPaused = true;
    this.activeLoads.clear();
    this.loadQueue = [];
    this.eventListeners.clear();
  }

  // 私有方法

  private getDefaultConfig(): LazyLoadManagerConfig {
    return {
      globalPreloadDistance: 100,
      globalTimeout: 30000,
      globalRetryCount: 3,
      globalRetryDelay: 1000,
      enableGlobalCache: true,
      globalCacheTime: 300000, // 5分鐘
      maxConcurrentLoads: 6,
      enablePerformanceMonitoring: true,
      performanceMonitoringInterval: 60000, // 1分鐘
      enableEventLogging: true,
      eventLogLevel: 'info',
    };
  }

  private getInitialState(): LazyLoadManagerState {
    return {
      activeLoads: 0,
      queuedLoads: 0,
      cachedResources: 0,
      performanceMetrics: this.getInitialPerformanceMetrics(),
      isInitialized: false,
      isPaused: false,
      lastUpdated: Date.now(),
    };
  }

  private getInitialPerformanceMetrics(): LazyLoadPerformanceMetrics {
    return {
      totalLoads: 0,
      successfulLoads: 0,
      failedLoads: 0,
      averageLoadTime: 0,
      fastestLoadTime: Infinity,
      slowestLoadTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      preloadCount: 0,
      cancelledLoads: 0,
      retryCount: 0,
    };
  }

  private getDefaultComponentConfig(): ComponentLazyLoadConfig {
    return {
      path: '',
      strategy: LazyLoadStrategy.INTERSECTION_OBSERVER,
      priority: LazyLoadPriority.NORMAL,
      preloadDistance: this.config.globalPreloadDistance,
      timeout: this.config.globalTimeout,
      retryCount: this.config.globalRetryCount,
      retryDelay: this.config.globalRetryDelay,
      enableCache: this.config.enableGlobalCache,
      cacheTime: this.config.globalCacheTime,
    };
  }

  private getDefaultImageConfig(): ImageLazyLoadConfig {
    return {
      src: '',
      strategy: LazyLoadStrategy.INTERSECTION_OBSERVER,
      priority: LazyLoadPriority.NORMAL,
      preloadDistance: this.config.globalPreloadDistance,
      timeout: this.config.globalTimeout,
      retryCount: this.config.globalRetryCount,
      retryDelay: this.config.globalRetryDelay,
      enableCache: this.config.enableGlobalCache,
      cacheTime: this.config.globalCacheTime,
      quality: 'medium',
    };
  }

  private getDefaultDataConfig<T>(): DataLazyLoadConfig<T> {
    return {
      loader: async () => {
        throw new Error('Loader not implemented');
      },
      strategy: LazyLoadStrategy.MANUAL,
      priority: LazyLoadPriority.NORMAL,
      preloadDistance: this.config.globalPreloadDistance,
      timeout: this.config.globalTimeout,
      retryCount: this.config.globalRetryCount,
      retryDelay: this.config.globalRetryDelay,
      enableCache: this.config.enableGlobalCache,
      cacheTime: this.config.globalCacheTime,
    };
  }

  private queueLoad(
    item: Omit<LoadQueueItem, 'resolve' | 'reject' | 'timestamp'>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const queueItem: LoadQueueItem = {
        ...item,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      this.loadQueue.push(queueItem);
      this.loadQueue.sort((a, b) => {
        const priorityOrder = {
          [LazyLoadPriority.CRITICAL]: 0,
          [LazyLoadPriority.HIGH]: 1,
          [LazyLoadPriority.NORMAL]: 2,
          [LazyLoadPriority.LOW]: 3,
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      this.updateState();
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (
      this.isPaused ||
      this.activeLoads.size >= (this.config.maxConcurrentLoads || 6)
    ) {
      return;
    }

    const nextItem = this.loadQueue.shift();
    if (!nextItem) {
      return;
    }

    this.activeLoads.add(nextItem.id);
    this.updateState();

    try {
      const result = await nextItem.loadFunction();
      nextItem.resolve(result);
    } catch (error) {
      nextItem.reject(error as Error);
    } finally {
      this.activeLoads.delete(nextItem.id);
      this.updateState();
      this.processQueue();
    }
  }

  private async loadImageElement(
    config: ImageLazyLoadConfig
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      const timeout = setTimeout(() => {
        reject(new Error(`Image load timeout: ${config.src}`));
      }, config.timeout || this.config.globalTimeout);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load image: ${config.src}`));
      };

      img.src = config.src;
    });
  }

  private getCachedComponent(id: string): React.ComponentType<any> | null {
    const cached = this.componentCache.get(id);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    this.componentCache.delete(id);
    return null;
  }

  private getCachedImage(id: string): HTMLImageElement | null {
    const cached = this.imageCache.get(id);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    this.imageCache.delete(id);
    return null;
  }

  private getCachedData<T>(id: string): T | null {
    const cached = this.dataCache.get(id);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    this.dataCache.delete(id);
    return null;
  }

  private cacheComponent(
    id: string,
    component: React.ComponentType<any>,
    cacheTime?: number
  ): void {
    this.componentCache.set(id, {
      data: component,
      timestamp: Date.now(),
      expiresAt:
        Date.now() + (cacheTime || this.config.globalCacheTime || 300000),
    });
  }

  private cacheImage(
    id: string,
    image: HTMLImageElement,
    cacheTime?: number
  ): void {
    this.imageCache.set(id, {
      data: image,
      timestamp: Date.now(),
      expiresAt:
        Date.now() + (cacheTime || this.config.globalCacheTime || 300000),
    });
  }

  private cacheData<T>(id: string, data: T, cacheTime?: number): void {
    this.dataCache.set(id, {
      data,
      timestamp: Date.now(),
      expiresAt:
        Date.now() + (cacheTime || this.config.globalCacheTime || 300000),
    });
  }

  private recordCacheHit(type: 'component' | 'image' | 'data'): void {
    this.performanceMetrics.cacheHits++;
    this.updateCacheHitRate();
  }

  private recordLoadSuccess(duration: number): void {
    this.performanceMetrics.totalLoads++;
    this.performanceMetrics.successfulLoads++;
    this.performanceMetrics.averageLoadTime =
      (this.performanceMetrics.averageLoadTime *
        (this.performanceMetrics.successfulLoads - 1) +
        duration) /
      this.performanceMetrics.successfulLoads;
    this.performanceMetrics.fastestLoadTime = Math.min(
      this.performanceMetrics.fastestLoadTime,
      duration
    );
    this.performanceMetrics.slowestLoadTime = Math.max(
      this.performanceMetrics.slowestLoadTime,
      duration
    );
  }

  private recordLoadError(duration: number): void {
    this.performanceMetrics.totalLoads++;
    this.performanceMetrics.failedLoads++;
    this.performanceMetrics.slowestLoadTime = Math.max(
      this.performanceMetrics.slowestLoadTime,
      duration
    );
  }

  private updateCacheHitRate(): void {
    const total =
      this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses;
    this.performanceMetrics.cacheHitRate =
      total > 0 ? this.performanceMetrics.cacheHits / total : 0;
  }

  private updateState(): void {
    this.state.activeLoads = this.activeLoads.size;
    this.state.queuedLoads = this.loadQueue.length;
    this.state.cachedResources =
      this.componentCache.size + this.imageCache.size + this.dataCache.size;
    this.state.performanceMetrics = { ...this.performanceMetrics };
    this.state.lastUpdated = Date.now();
  }

  private emitEvent(event: LazyLoadEvent): void {
    if (this.config.enableEventLogging) {
      const logLevel = this.config.eventLogLevel || 'info';
      console[logLevel]('LazyLoad Event:', event);
    }

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in lazy load event listener:', error);
      }
    });
  }
}

// 導出單例實例
export const lazyLoadService = LazyLoadServiceImpl.getInstance();
