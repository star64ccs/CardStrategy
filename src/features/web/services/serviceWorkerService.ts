import { Platform } from 'react-native';

/**
 * Service Worker ConfigureInterface
 */
export interface ServiceWorkerConfig {
  swPath: string;
  scope: string;
  updateViaCache: 'all' | 'none' | 'imports';
  cacheName: string;
  cacheVersion: string;
  cacheStrategies: CacheStrategy[];
  offlineFallback: string;
  backgroundSync: BackgroundSyncConfig;
  pushNotification: PushNotificationConfig;
  periodicSync: PeriodicSyncConfig;
  contentIndex: ContentIndexConfig;
}

/**
 * Cache策略Interface
 */
export interface CacheStrategy {
  name: string;
  pattern: string | RegExp;
  strategy:
    | 'cache-first'
    | 'network-first'
    | 'stale-while-revalidate'
    | 'network-only'
    | 'cache-only';
  options: {
    cacheName?: string;
    maxAge?: number;
    maxEntries?: number;
    maxSize?: number;
    networkTimeoutSeconds?: number;
  };
}

/**
 * 背景SyncConfigureInterface
 */
export interface BackgroundSyncConfig {
  enabled: boolean;
  syncName: string;
  maxRetryAttempts: number;
  retryDelay: number;
}

/**
 * PushNotificationConfigureInterface
 */
export interface PushNotificationConfig {
  enabled: boolean;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  defaultPayload: {
    title: string;
    body: string;
    icon: string;
    badge: string;
    tag: string;
    data: Record<string, any>;
  };
}

/**
 * 定期SyncConfigureInterface
 */
export interface PeriodicSyncConfig {
  enabled: boolean;
  syncName: string;
  minInterval: number;
  maxInterval: number;
}

/**
 * ContentIndexConfigureInterface
 */
export interface ContentIndexConfig {
  enabled: boolean;
  entries: ContentIndexEntry[];
}

/**
 * ContentIndex條目Interface
 */
export interface ContentIndexEntry {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  icons: {
    src: string;
    sizes: string;
    type: string;
  }[];
  launchUrl: string;
}

/**
 * Service Worker Status
 */
export interface ServiceWorkerStatus {
  isRegistered: boolean;
  isActive: boolean;
  isControlling: boolean;
  isInstalling: boolean;
  isWaiting: boolean;
  scriptURL: string;
  scope: string;
  state: 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';
  updateTime: number;
}

/**
 * Service Worker Statistics
 */
export interface ServiceWorkerStats {
  totalRegistrations: number;
  totalUpdates: number;
  totalActivations: number;
  totalErrors: number;
  averageUpdateTime: number;
  cacheHitRate: number;
  offlineUsageTime: number;
  backgroundSyncCount: number;
  pushNotificationCount: number;
}

/**
 * Service Worker 結果
 */
export interface ServiceWorkerResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

/**
 * CacheOperation結果
 */
export interface CacheOperationResult {
  success: boolean;
  cachedUrls: string[];
  failedUrls: string[];
  totalSize: number;
  cacheName: string;
}

/**
 * Service Worker ServiceClass
 */
export class ServiceWorkerService {
  private static instance: ServiceWorkerService;
  private isInitialized = false;
  private config: ServiceWorkerConfig | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private readonly status: ServiceWorkerStatus = {
    isRegistered: false,
    isActive: false,
    isControlling: false,
    isInstalling: false,
    isWaiting: false,
    scriptURL: '',
    scope: '',
    state: 'redundant',
    updateTime: 0,
  };
  private readonly stats: ServiceWorkerStats = {
    totalRegistrations: 0,
    totalUpdates: 0,
    totalActivations: 0,
    totalErrors: 0,
    averageUpdateTime: 0,
    cacheHitRate: 0,
    offlineUsageTime: 0,
    backgroundSyncCount: 0,
    pushNotificationCount: 0,
  };

  private constructor() {
    // Private構造Function，實現單例模式
  }

  /**
   * Get Service Worker ServiceInstance
   */
  public static getInstance(): ServiceWorkerService {
    if (!ServiceWorkerService.instance) {
      ServiceWorkerService.instance = new ServiceWorkerService();
    }
    return ServiceWorkerService.instance;
  }

  /**
   * Initialize Service Worker Service
   */
  public async initialize(
    config: ServiceWorkerConfig
  ): Promise<ServiceWorkerResult> {
    if (this.isInitialized) {
      return { success: true, data: 'Service Worker Service已Initialize' };
    }

    if (Platform.OS !== 'web') {
      return {
        success: false,
        error: 'Service Worker Service僅支持 Web 平台',
        errorCode: 'PLATFORM_NOT_SUPPORTED',
      };
    }

    if (!('serviceWorker' in navigator)) {
      return {
        success: false,
        error: 'Service Worker 不支持',
        errorCode: 'SERVICE_WORKER_NOT_SUPPORTED',
      };
    }

    try {
      this.config = config;
      await this.registerServiceWorker();
      await this.setupEventListeners();
      await this.initializeCaches();

      this.isInitialized = true;

      return { success: true, data: 'Service Worker ServiceInitializeSuccess' };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Service Worker ServiceInitializeFailed',
        errorCode: 'INITIALIZATION_FAILED',
      };
    }
  }

  /**
   * Register Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!this.config) {
      throw new Error('Service Worker 配置未設置');
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        this.config.swPath,
        {
          scope: this.config.scope,
          updateViaCache: this.config.updateViaCache,
        }
      );

      this.status.isRegistered = true;
      this.status.scriptURL = this.config.swPath || '';
      this.status.scope = this.registration.scope;
      this.stats.totalRegistrations++;

      // 監聽 Service Worker Status變化
      this.registration.addEventListener('updatefound', () => {
        const _newWorker = this.registration.installing;
        if (newWorker) {
          this.status.isInstalling = true;
          this.status.state = 'installing';

          newWorker.addEventListener('statechange', () => {
            this.status.state = newWorker.state as any;

            switch (newWorker.state) {
              case 'installed':
                this.status.isInstalling = false;
                this.status.isWaiting = true;
                this.stats.totalUpdates++;
                break;
              case 'activated':
                this.status.isWaiting = false;
                this.status.isActive = true;
                this.status.isControlling = true;
                this.stats.totalActivations++;
                this.status.updateTime = Date.now();
                break;
              case 'redundant':
                this.status.isInstalling = false;
                this.status.isWaiting = false;
                this.status.isActive = false;
                break;
            }
          });
        }
      });

      // CheckYesNo已有活躍的 Service Worker
      if (this.registration.active) {
        this.status.isActive = true;
        this.status.isControlling = true;
        this.status.state = 'activated';
      }

      if (this.registration.waiting) {
        this.status.isWaiting = true;
        this.status.state = 'installed';
      }
    } catch (error) {
      this.stats.totalErrors++;
      throw error;
    }
  }

  /**
   * SettingsEvent監聽器
   */
  private async setupEventListeners(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker 未註冊');
    }

    // 監聽 Service Worker Message
    navigator.serviceWorker.addEventListener('message', event => {
      this.handleServiceWorkerMessage(event);
    });

    // 監聽Control器變化
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      this.status.isControlling = true;
    });

    // 監聽Error
    navigator.serviceWorker.addEventListener('error', event => {
      this.stats.totalErrors++;
      console.error('Service Worker Error:', event);
    });
  }

  /**
   * Handle Service Worker Message
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case 'CACHE_HIT':
        this.stats.cacheHitRate = (this.stats.cacheHitRate + data.hitRate) / 2;
        break;
      case 'OFFLINE_USAGE':
        this.stats.offlineUsageTime += data.duration;
        break;
      case 'BACKGROUND_SYNC':
        this.stats.backgroundSyncCount++;
        break;
      case 'PUSH_NOTIFICATION':
        this.stats.pushNotificationCount++;
        break;
      case 'UPDATE_TIME':
        this.stats.averageUpdateTime =
          (this.stats.averageUpdateTime + data.updateTime) / 2;
        break;
    }
  }

  /**
   * InitializeCache
   */
  private async initializeCaches(): Promise<void> {
    if (!this.config) {
      throw new Error('Service Worker 配置未設置');
    }

    try {
      // 清理舊VersionCache
      await this.cleanupOldCaches();

      // 預Cache重要Resource
      if (this.config.cacheStrategies.length > 0) {
        await this.precacheResources();
      }
    } catch (error) {
      console.warn('緩存InitializeFailed:', error);
    }
  }

  /**
   * 清理舊VersionCache
   */
  private async cleanupOldCaches(): Promise<void> {
    const _cacheNames = await caches.keys();
    const _currentCacheName = `${this.config.cacheName}-${this.config.cacheVersion}`;

    await Promise.all(
      cacheNames
        .filter(
          name =>
            name.startsWith(this.config.cacheName) && name !== currentCacheName
        )
        .map(name => caches.delete(name))
    );
  }

  /**
   * 預CacheResource
   */
  private async precacheResources(): Promise<void> {
    if (!this.config) {
      throw new Error('Service Worker 配置未設置');
    }

    const _cacheName = `${this.config.cacheName}-${this.config.cacheVersion}`;
    const _cache = await caches.open(cacheName);

    // 預Cache離線頁面
    if (this.config.offlineFallback) {
      await cache.add(this.config.offlineFallback);
    }

    // 預Cache策略中定義的Resource
    for (const strategy of this.config.cacheStrategies) {
      if (
        strategy.strategy === 'cache-only' ||
        strategy.strategy === 'cache-first'
      ) {
        try {
          if (typeof strategy.pattern === 'string') {
            await cache.add(strategy.pattern);
          }
        } catch (error) {
          console.warn(`預緩存Failed: ${strategy.pattern}`, error);
        }
      }
    }
  }

  /**
   * Update Service Worker
   */
  public async updateServiceWorker(): Promise<ServiceWorkerResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Service Worker Service未Initialize',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      };
    }

    if (!this.registration) {
      return {
        success: false,
        error: 'Service Worker 未註冊',
        errorCode: 'NOT_REGISTERED',
      };
    }

    try {
      const _startTime = Date.now();

      await this.registration.update();

      const _updateTime = Date.now() - startTime;
      this.stats.averageUpdateTime =
        (this.stats.averageUpdateTime + updateTime) / 2;

      return { success: true, data: 'Service Worker UpdateSuccess' };
    } catch (error) {
      this.stats.totalErrors++;
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Service Worker UpdateFailed',
        errorCode: 'UPDATE_FAILED',
      };
    }
  }

  /**
   * SkipAwait並Activate新的 Service Worker
   */
  public async skipWaiting(): Promise<ServiceWorkerResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Service Worker Service未Initialize',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      };
    }

    if (!this.registration?.waiting) {
      return {
        success: false,
        error: '沒有等待中的 Service Worker',
        errorCode: 'NO_WAITING_WORKER',
      };
    }

    try {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return { success: true, data: '跳過等待Success' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '跳過等待Failed',
        errorCode: 'SKIP_WAITING_FAILED',
      };
    }
  }

  /**
   * Cache URL
   */
  public async cacheUrl(
    url: string,
    strategy?: string
  ): Promise<CacheOperationResult> {
    if (!this.isInitialized) {
      throw new Error('Service Worker Service未Initialize');
    }

    if (!this.config) {
      throw new Error('Service Worker 配置未設置');
    }

    const _cacheName = `${this.config.cacheName}-${this.config.cacheVersion}`;
    const _cache = await caches.open(cacheName);

    try {
      const _response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        return {
          success: true,
          cachedUrls: [url],
          failedUrls: [],
          totalSize: 0,
          cacheName,
        };
      } else {
        return {
          success: false,
          cachedUrls: [],
          failedUrls: [url],
          totalSize: 0,
          cacheName,
        };
      }
    } catch (error) {
      return {
        success: false,
        cachedUrls: [],
        failedUrls: [url],
        totalSize: 0,
        cacheName,
      };
    }
  }

  /**
   * BatchCache URL
   */
  public async cacheUrls(urls: string[]): Promise<CacheOperationResult> {
    if (!this.isInitialized) {
      throw new Error('Service Worker Service未Initialize');
    }

    const _results = await Promise.allSettled(
      urls.map(url => this.cacheUrl(url))
    );

    const cachedUrls: string[] = [];
    const failedUrls: string[] = [];
    let totalSize = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        cachedUrls.push(urls[index]);
        totalSize += result.value.totalSize;
      } else {
        failedUrls.push(urls[index]);
      }
    });

    return {
      success: cachedUrls.length > 0,
      cachedUrls,
      failedUrls,
      totalSize,
      cacheName: `${this.config.cacheName}-${this.config.cacheVersion}`,
    };
  }

  /**
   * ClearCache
   */
  public async clearCache(): Promise<ServiceWorkerResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Service Worker Service未Initialize',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      };
    }

    try {
      const _cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith(this.config.cacheName))
          .map(name => caches.delete(name))
      );

      return { success: true, data: '緩存清除Success' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '緩存清除Failed',
        errorCode: 'CACHE_CLEAR_FAILED',
      };
    }
  }

  /**
   * GetCacheInformation
   */
  public async getCacheInfo(): Promise<
    ServiceWorkerResult<{ cacheNames: string[]; totalSize: number }>
  > {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Service Worker Service未Initialize',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      };
    }

    try {
      const _cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        if (cacheName.startsWith(this.config.cacheName)) {
          const _cache = await caches.open(cacheName);
          const _keys = await cache.keys();

          for (const request of keys) {
            const _response = await cache.match(request);
            if (response) {
              const _blob = await response.blob();
              totalSize += blob.size;
            }
          }
        }
      }

      return {
        success: true,
        data: { cacheNames, totalSize },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Get緩存信息Failed',
        errorCode: 'CACHE_INFO_FAILED',
      };
    }
  }

  /**
   * Get Service Worker Status
   */
  public getServiceWorkerStatus(): ServiceWorkerStatus {
    return { ...this.status };
  }

  /**
   * GetServiceStatistics
   */
  public getServiceStats(): ServiceWorkerStats {
    return { ...this.stats };
  }

  /**
   * CheckServiceYesNo就緒
   */
  public isServiceReady(): boolean {
    return this.isInitialized && Platform.OS === 'web';
  }

  /**
   * GetServiceInformation
   */
  public getServiceInfo(): ServiceWorkerResult<{
    isInitialized: boolean;
    platform: string;
    config: ServiceWorkerConfig | null;
    status: ServiceWorkerStatus;
    stats: ServiceWorkerStats;
  }> {
    return {
      success: true,
      data: {
        isInitialized: this.isInitialized,
        platform: Platform.OS,
        config: this.config,
        status: this.status,
        stats: this.stats,
      },
    };
  }
}

export default ServiceWorkerService;
