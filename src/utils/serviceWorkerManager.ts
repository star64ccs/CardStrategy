import { logger } from '@/utils/logger';

// 將配置抽離到單獨的配置文件
export interface ServiceWorkerConfig {
  swPath?: string;
  scope?: string;
  updateViaCache?: RequestCache;
  enableBackgroundSync?: boolean;
  enablePushNotifications?: boolean;
  enablePerformanceMonitoring?: boolean;
  cacheStrategies?: CacheStrategyConfig;
}

// 緩存策略配置
export interface CacheStrategyConfig {
  static: CacheStrategy;
  api: CacheStrategy;
  image: CacheStrategy;
  font: CacheStrategy;
  media: CacheStrategy;
}

interface CacheStrategy {
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'cache-only' | 'network-only';
  ttl: number;
  maxSize: number;
}

// 緩存信息
export interface CacheInfo {
  name: string;
  size: number;
  itemCount: number;
  lastUpdated: Date;
  strategy: string;
  ttl: number;
}

// 同步數據
export interface SyncData {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  retryCount: number;
}

// 性能指標
export interface PerformanceMetrics {
  cacheHits: number;
  cacheMisses: number;
  networkRequests: number;
  errors: number;
  hitRate: number;
  lastReset: Date;
}

// 預取配置
export interface PrefetchConfig {
  urls: string[];
  priority: 'high' | 'medium' | 'low';
  strategy: 'preload' | 'prefetch' | 'prerender';
}

// 默認配置
const DEFAULT_CONFIG: ServiceWorkerConfig = {
  swPath: '/sw.js',
  scope: '/',
  updateViaCache: 'all' as RequestCache,
  enableBackgroundSync: true,
  enablePushNotifications: true,
  enablePerformanceMonitoring: true,
  cacheStrategies: {
    static: { strategy: 'cache-first', ttl: 7 * 24 * 60 * 60 * 1000, maxSize: 50 * 1024 * 1024 },
    api: { strategy: 'network-first', ttl: 5 * 60 * 1000, maxSize: 10 * 1024 * 1024 },
    image: { strategy: 'stale-while-revalidate', ttl: 24 * 60 * 60 * 1000, maxSize: 100 * 1024 * 1024 },
    font: { strategy: 'cache-first', ttl: 30 * 24 * 60 * 60 * 1000, maxSize: 20 * 1024 * 1024 },
    media: { strategy: 'cache-only', ttl: 7 * 24 * 60 * 60 * 1000, maxSize: 200 * 1024 * 1024 }
  }
};

// 事件處理器類
class ServiceWorkerEventHandler {
  private registration: ServiceWorkerRegistration;

  constructor(registration: ServiceWorkerRegistration) {
    this.registration = registration;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.registration.addEventListener('install', this.handleInstall.bind(this));
    this.registration.addEventListener('activate', this.handleActivate.bind(this));
    this.registration.addEventListener('updatefound', this.handleUpdateFound.bind(this));

    navigator.serviceWorker.addEventListener('controllerchange', this.handleControllerChange.bind(this));
    navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleInstall(event: Event): void {
    logger.info('[SW Manager] Service Worker 安裝中...');
  }

  private handleActivate(event: Event): void {
    logger.info('[SW Manager] Service Worker 激活中...');
  }

  private handleUpdateFound(): void {
    logger.info('[SW Manager] 發現 Service Worker 更新');
  }

  private handleControllerChange(): void {
    logger.info('[SW Manager] Service Worker 控制器已變更');
    window.location.reload();
  }

  private handleMessage(event: MessageEvent): void {
    const { data } = event;

    switch (data.type) {
      case 'PERFORMANCE_METRICS':
        logger.info('[SW Manager] 收到性能指標:', data.metrics as Record<string, unknown>);
        break;
      case 'CACHE_UPDATED':
        logger.info('[SW Manager] 緩存已更新:', data.cacheName as string);
        break;
      case 'SYNC_COMPLETED':
        logger.info('[SW Manager] 背景同步完成:', data.result);
        break;
      case 'ERROR':
        logger.error('[SW Manager] Service Worker 錯誤:', data.error);
        break;
    }
  }
}

// 緩存管理器類
class CacheManager {
  async getCacheInfo(): Promise<CacheInfo[]> {
    if (!('caches' in window)) {
      return [];
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo: CacheInfo[] = [];

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        let totalSize = 0;

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
              totalSize += parseInt(contentLength, 10);
            }
          }
        }

        cacheInfo.push({
          name,
          size: totalSize,
          itemCount: keys.length,
          lastUpdated: new Date(),
          strategy: this.getStrategyForCache(name),
          ttl: this.getTTLForCache(name)
        });
      }

      return cacheInfo;
    } catch (error) {
      logger.error('[SW Manager] 獲取緩存信息失敗:', error);
      return [];
    }
  }

  private getStrategyForCache(cacheName: string): string {
    if (cacheName.includes('static')) return 'cache-first';
    if (cacheName.includes('api')) return 'network-first';
    if (cacheName.includes('image')) return 'stale-while-revalidate';
    if (cacheName.includes('font')) return 'cache-first';
    if (cacheName.includes('media')) return 'cache-only';
    return 'network-first';
  }

  private getTTLForCache(cacheName: string): number {
    if (cacheName.includes('static')) return 7 * 24 * 60 * 60 * 1000;
    if (cacheName.includes('api')) return 5 * 60 * 1000;
    if (cacheName.includes('image')) return 24 * 60 * 60 * 1000;
    if (cacheName.includes('font')) return 30 * 24 * 60 * 60 * 1000;
    if (cacheName.includes('media')) return 7 * 24 * 60 * 60 * 1000;
    return 5 * 60 * 1000;
  }
}

// 性能監控類
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    errors: 0,
    hitRate: 0,
    lastReset: new Date()
  };

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return this.metrics;
  }

  resetMetrics(): void {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      errors: 0,
      hitRate: 0,
      lastReset: new Date()
    };
  }
}

// 主 Service Worker 管理器類
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig;
  private syncQueue: SyncData[] = [];
  private updateCheckInterval: NodeJS.Timeout | null = null;
  private eventHandler: ServiceWorkerEventHandler | null = null;
  private cacheManager: CacheManager;
  private performanceMonitor: PerformanceMonitor;

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cacheManager = new CacheManager();
    this.performanceMonitor = new PerformanceMonitor();
  }

  // 初始化 Service Worker
  async init(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('[SW Manager] Service Worker 不受支持');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        this.config.swPath!,
        { scope: this.config.scope! }
      );

      logger.info('[SW Manager] Service Worker 註冊成功');

      // 設置事件處理器
      this.eventHandler = new ServiceWorkerEventHandler(this.registration);

      // 檢查更新
      await this.checkForUpdates();

      // 啟動定期更新檢查
      this.startUpdateCheck();

      // 初始化性能監控
      if (this.config.enablePerformanceMonitoring) {
        this.startPerformanceMonitoring();
      }

      return true;
    } catch (error) {
      logger.error('[SW Manager] Service Worker 註冊失敗:', error);
      return false;
    }
  }

  // 註冊 Service Worker
  async register(): Promise<boolean> {
    return this.init();
  }

  // 檢查更新
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      logger.info('[SW Manager] 更新檢查完成');
    } catch (error) {
      logger.error('[SW Manager] 更新檢查失敗:', error);
    }
  }

  // 啟動定期更新檢查
  private startUpdateCheck(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }

    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, 60 * 60 * 1000); // 每小時檢查一次
  }

  // 啟動性能監控
  private startPerformanceMonitoring(): void {
    setInterval(async () => {
      await this.getPerformanceMetrics();
    }, 30 * 1000); // 每30秒更新一次性能指標
  }

  // 獲取狀態
  getStatus(): {
    registered: boolean;
    active: boolean;
    installing: boolean;
    waiting: boolean;
    } {
    if (!this.registration) {
      return {
        registered: false,
        active: false,
        installing: false,
        waiting: false
      };
    }

    return {
      registered: true,
      active: !!this.registration.active,
      installing: !!this.registration.installing,
      waiting: !!this.registration.waiting
    };
  }

  // 獲取緩存信息
  async getCacheInfo(): Promise<CacheInfo[]> {
    return this.cacheManager.getCacheInfo();
  }

  // 獲取同步隊列
  getSyncQueue(): SyncData[] {
    return this.syncQueue;
  }

  // 獲取性能指標
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return this.performanceMonitor.getPerformanceMetrics();
  }

  // 預取資源
  async prefetchResources(config: PrefetchConfig): Promise<void> {
    if (!this.registration?.active) {
      logger.warn('[SW Manager] Service Worker 未激活，無法預取資源');
      return;
    }

    try {
      this.registration.active.postMessage({
        type: 'PREFETCH',
        urls: config.urls,
        priority: config.priority,
        strategy: config.strategy
      });

      logger.info('[SW Manager] 預取請求已發送:', config.urls);
    } catch (error) {
      logger.error('[SW Manager] 預取資源失敗:', error);
    }
  }

  // 智能預取
  async smartPrefetch(currentUrl: string): Promise<void> {
    const prefetchUrls: string[] = [];

    if (currentUrl.includes('/cards')) {
      prefetchUrls.push(
        '/api/cards',
        '/api/collections',
        '/static/js/cards.js',
        '/static/css/cards.css'
      );
    } else if (currentUrl.includes('/market')) {
      prefetchUrls.push(
        '/api/market/trends',
        '/api/market/prices',
        '/static/js/market.js'
      );
    } else if (currentUrl.includes('/portfolio')) {
      prefetchUrls.push(
        '/api/portfolio/stats',
        '/api/portfolio/holdings',
        '/static/js/portfolio.js'
      );
    }

    if (prefetchUrls.length > 0) {
      await this.prefetchResources({
        urls: prefetchUrls,
        priority: 'medium',
        strategy: 'prefetch'
      });
    }
  }

  // 清理緩存
  async clearCache(cacheName?: string): Promise<void> {
    if (!this.registration?.active) {
      logger.warn('[SW Manager] Service Worker 未激活，無法清理緩存');
      return;
    }

    try {
      this.registration.active.postMessage({
        type: 'CLEAR_CACHE',
        cacheName
      });

      logger.info('[SW Manager] 緩存清理請求已發送:', cacheName || 'all');
    } catch (error) {
      logger.error('[SW Manager] 清理緩存失敗:', error);
    }
  }

  // 添加同步數據
  addToSyncQueue(data: SyncData): void {
    this.syncQueue.push(data);
    logger.info('[SW Manager] 添加到同步隊列:', data.id);
  }

  // 清空同步隊列
  clearSyncQueue(): void {
    this.syncQueue = [];
    logger.info('[SW Manager] 同步隊列已清空');
  }

  // 註冊背景同步
  async registerBackgroundSync(tag: string, data?: any): Promise<void> {
    if (!this.config.enableBackgroundSync || !this.registration) {
      logger.warn('[SW Manager] 背景同步未啟用或 Service Worker 未註冊');
      return;
    }

    try {
      if ('sync' in this.registration) {
        await this.registration.sync.register(tag);
        logger.info('[SW Manager] 背景同步已註冊:', tag);
      } else {
        logger.warn('[SW Manager] 背景同步 API 不受支持');
      }
    } catch (error) {
      logger.error('[SW Manager] 註冊背景同步失敗:', error);
    }
  }

  // 發送推送通知
  async sendNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.config.enablePushNotifications || !this.registration) {
      logger.warn('[SW Manager] 推送通知未啟用或 Service Worker 未註冊');
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        await this.registration.showNotification(title, {
          icon: '/logo192.png',
          badge: '/logo192.png',
          ...options
        });
        logger.info('[SW Manager] 推送通知已發送:', title);
      } else {
        logger.warn('[SW Manager] 推送通知權限被拒絕');
      }
    } catch (error) {
      logger.error('[SW Manager] 發送推送通知失敗:', error);
    }
  }

  // 更新應用
  async updateApp(): Promise<void> {
    if (!this.registration?.waiting) {
      logger.info('[SW Manager] 沒有待更新的 Service Worker');
      return;
    }

    try {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      logger.info('[SW Manager] 更新請求已發送');
    } catch (error) {
      logger.error('[SW Manager] 更新應用失敗:', error);
    }
  }

  // 註銷 Service Worker
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();

      if (this.updateCheckInterval) {
        clearInterval(this.updateCheckInterval);
        this.updateCheckInterval = null;
      }

      this.registration = null;
      logger.info('[SW Manager] Service Worker 已註銷');

      return result;
    } catch (error) {
      logger.error('[SW Manager] 註銷 Service Worker 失敗:', error);
      return false;
    }
  }

  // 獲取配置
  getConfig(): ServiceWorkerConfig {
    return this.config;
  }

  // 更新配置
  updateConfig(newConfig: Partial<ServiceWorkerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('[SW Manager] 配置已更新:', newConfig);
  }

  // 檢查是否支持特定功能
  isSupported(feature: 'backgroundSync' | 'pushNotifications' | 'cache' | 'serviceWorker'): boolean {
    switch (feature) {
      case 'serviceWorker':
        return 'serviceWorker' in navigator;
      case 'backgroundSync':
        return 'serviceWorker' in navigator && 'sync' in (navigator.serviceWorker.registration || {});
      case 'pushNotifications':
        return 'Notification' in window && 'serviceWorker' in navigator;
      case 'cache':
        return 'caches' in window;
      default:
        return false;
    }
  }

  // 獲取支持的功能列表
  getSupportedFeatures(): string[] {
    const features: string[] = [];

    if (this.isSupported('serviceWorker')) features.push('serviceWorker');
    if (this.isSupported('backgroundSync')) features.push('backgroundSync');
    if (this.isSupported('pushNotifications')) features.push('pushNotifications');
    if (this.isSupported('cache')) features.push('cache');

    return features;
  }
}

// 創建單例實例
export const swManager = new ServiceWorkerManager();

