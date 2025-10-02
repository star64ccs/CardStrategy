// 懶加載Service實現
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

// Cache項Interface
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// 加載Queue項Interface
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
 * 懶加載Service實現
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
   * Get單例Instance
   */
  public static getInstance(): LazyLoadServiceImpl {
    if (!LazyLoadServiceImpl.instance) {
      LazyLoadServiceImpl.instance = new LazyLoadServiceImpl();
    }
    return LazyLoadServiceImpl.instance;
  }

  /**
   * InitializeService
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
   * RegisterComponent
   */
  public registerComponent(id: string, config: ComponentLazyLoadConfig): void {
    this.componentRegistry.set(id, {
      ...this.getDefaultComponentConfig(),
      ...config,
    });
  }

  /**
   * RegisterGraph片
   */
  public registerImage(id: string, config: ImageLazyLoadConfig): void {
    this.imageRegistry.set(id, {
      ...this.getDefaultImageConfig(),
      ...config,
    });
  }

  /**
   * RegisterData
   */
  public registerData<T>(id: string, config: DataLazyLoadConfig<T>): void {
    this.dataRegistry.set(id, {
      ...this.getDefaultDataConfig(),
      ...config,
    });
  }

  /**
   * 加載Component
   */
  public async loadComponent(id: string): Promise<React.ComponentType<any>> {
    const _config = this.componentRegistry.get(id);
    if (!config) {
      throw new Error(`Component with id '${id}' not found`);
    }

    // CheckCache
    if (config.enableCache) {
      const _cached = this.getCachedComponent(id);
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

        const _startTime = Date.now();
        try {
          // DynamicImportComponent
          const _module = await import(
            /* webpackChunkName: "[request]" */ config.path
          ).catch(() => {
            throw new Error(
              `Failed to load component from path: ${config.path}`
            );
          });
          const _component = module.default || module;

          const _endTime = Date.now();
          const _duration = endTime - startTime;

          // CacheComponent
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
          const _endTime = Date.now();
          const _duration = endTime - startTime;

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
   * 加載Graph片
   */
  public async loadImage(id: string): Promise<HTMLImageElement> {
    const _config = this.imageRegistry.get(id);
    if (!config) {
      throw new Error(`Image with id '${id}' not found`);
    }

    // CheckCache
    if (config.enableCache) {
      const _cached = this.getCachedImage(id);
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

        const _startTime = Date.now();
        try {
          const _image = await this.loadImageElement(config);

          const _endTime = Date.now();
          const _duration = endTime - startTime;

          // CacheGraph片
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
          const _endTime = Date.now();
          const _duration = endTime - startTime;

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
   * 加載Data
   */
  public async loadData<T>(id: string): Promise<T> {
    const _config = this.dataRegistry.get(id);
    if (!config) {
      throw new Error(`Data with id '${id}' not found`);
    }

    // CheckCache
    if (config.enableCache) {
      const _cached = this.getCachedData<T>(id);
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

        const _startTime = Date.now();
        try {
          const _data = await config.loader();

          const _endTime = Date.now();
          const _duration = endTime - startTime;

          // CacheData
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
          const _endTime = Date.now();
          const _duration = endTime - startTime;

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
   * 預加載Component
   */
  public async preloadComponent(id: string): Promise<void> {
    const _config = this.componentRegistry.get(id);
    if (!config) {
      throw new Error(`Component with id '${id}' not found`);
    }

    // CheckYesNo已經加載
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
      // 預加載Failed不ThrowError
      console.warn(`Failed to preload component '${id}':`, error);
    }
  }

  /**
   * 預加載Graph片
   */
  public async preloadImage(id: string): Promise<void> {
    const _config = this.imageRegistry.get(id);
    if (!config) {
      throw new Error(`Image with id '${id}' not found`);
    }

    // CheckYesNo已經加載
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
      // 預加載Failed不ThrowError
      console.warn(`Failed to preload image '${id}':`, error);
    }
  }

  /**
   * 預加載Data
   */
  public async preloadData<T>(id: string): Promise<void> {
    const _config = this.dataRegistry.get(id);
    if (!config) {
      throw new Error(`Data with id '${id}' not found`);
    }

    // CheckYesNo已經加載
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
      // 預加載Failed不ThrowError
      console.warn(`Failed to preload data '${id}':`, error);
    }
  }

  /**
   * Cancel加載
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
   * ClearCache
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
   * GetStatus
   */
  public getState(): LazyLoadManagerState {
    return { ...this.state };
  }

  /**
   * Get性能指標
   */
  public getPerformanceMetrics(): LazyLoadPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * PauseService
   */
  public pause(): void {
    this.isPaused = true;
    this.state.isPaused = true;
    this.state.lastUpdated = Date.now();
  }

  /**
   * RestoreService
   */
  public resume(): void {
    this.isPaused = false;
    this.state.isPaused = false;
    this.state.lastUpdated = Date.now();
    this.processQueue();
  }

  /**
   * 銷毀Service
   */
  public destroy(): void {
    this.isInitialized = false;
    this.isPaused = true;
    this.activeLoads.clear();
    this.loadQueue = [];
    this.eventListeners.clear();
  }

  // PrivateMethod

  private getDefaultConfig(): LazyLoadManagerConfig {
    return {
      globalPreloadDistance: 100,
      globalTimeout: 30000,
      globalRetryCount: 3,
      globalRetryDelay: 1000,
      enableGlobalCache: true,
      globalCacheTime: 300000, // 5Minute
      maxConcurrentLoads: 6,
      enablePerformanceMonitoring: true,
      performanceMonitoringInterval: 60000, // 1Minute
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
        const _priorityOrder = {
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

    const _nextItem = this.loadQueue.shift();
    if (!nextItem) {
      return;
    }

    this.activeLoads.add(nextItem.id);
    this.updateState();

    try {
      const _result = await nextItem.loadFunction();
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
      const _img = new Image();

      const _timeout = setTimeout(() => {
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
    const _cached = this.componentCache.get(id);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    this.componentCache.delete(id);
    return null;
  }

  private getCachedImage(id: string): HTMLImageElement | null {
    const _cached = this.imageCache.get(id);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    this.imageCache.delete(id);
    return null;
  }

  private getCachedData<T>(id: string): T | null {
    const _cached = this.dataCache.get(id);
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
    const _total =
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
      const _logLevel = this.config.eventLogLevel || 'info';
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

// Export單例Instance
export const _lazyLoadService = LazyLoadServiceImpl.getInstance();
