import { StorageManager, CacheStorage } from './storage';
import { logger } from './logger';
import { CACHE_EXPIRY } from './constants';
import { networkMonitor } from './networkMonitor';

// 緩存項目類型
export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  version: string;
  etag?: string;
  lastModified?: string;
}

// 緩存配置
export interface CacheConfig {
  key: string;
  expiry?: number;
  version?: string;
  etag?: string;
  lastModified?: string;
  forceRefresh?: boolean;
  offlineOnly?: boolean;
}

// 緩存統計
export interface CacheStats {
  totalItems: number;
  totalSize: number;
  oldestItem: number;
  newestItem: number;
  expiredItems: number;
}

// 緩存管理器類
export class CacheManager {
  private static instance: CacheManager;
  private cachePrefix = 'api_cache_';
  private imageCachePrefix = 'image_cache_';
  private cardCachePrefix = 'card_cache_';
  private marketCachePrefix = 'market_cache_';
  private queuePrefix = 'offline_queue_';
  private version = '1.0.0';

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // API 響應緩存
  async cacheApiResponse<T>(
    endpoint: string,
    data: T,
    config: Partial<CacheConfig> = {}
  ): Promise<void> {
    try {
      const key = this.generateCacheKey(endpoint, config);
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (config.expiry || CACHE_EXPIRY.MEDIUM),
        version: config.version || this.version,
        ...(config.etag && { etag: config.etag }),
        ...(config.lastModified && { lastModified: config.lastModified })
      };

      await StorageManager.set(key, cacheItem);
      logger.info('API response cached:', { endpoint, key });
    } catch (error) {
      logger.error('Cache API response error:', { error, endpoint });
    }
  }

  // 獲取緩存的 API 響應
  async getCachedApiResponse<T>(
    endpoint: string,
    config: Partial<CacheConfig> = {}
  ): Promise<T | null> {
    try {
      const key = this.generateCacheKey(endpoint, config);
      const cacheItem = await StorageManager.get<CacheItem<T>>(key);

      if (!cacheItem) {
        return null;
      }

      // 檢查版本
      if (cacheItem.version !== (config.version || this.version)) {
        await this.removeCacheItem(key);
        return null;
      }

      // 檢查是否過期
      if (Date.now() > cacheItem.expiry) {
        await this.removeCacheItem(key);
        return null;
      }

      // 檢查 ETag
      if (config.etag && cacheItem.etag !== config.etag) {
        await this.removeCacheItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      logger.error('Get cached API response error:', { error, endpoint });
      return null;
    }
  }

  // 圖片緩存
  async cacheImage(key: string, uri: string): Promise<void> {
    try {
      const cacheKey = `${this.imageCachePrefix}${this.hashString(key)}`;
      const cacheItem: CacheItem<string> = {
        data: uri,
        timestamp: Date.now(),
        expiry: Date.now() + CACHE_EXPIRY.LONG, // 圖片緩存 24 小時
        version: this.version
      };

      await StorageManager.set(cacheKey, cacheItem);
      logger.info('Image cached:', { key, cacheKey });
    } catch (error) {
      logger.error('Cache image error:', { error, key });
    }
  }

  // 獲取緩存的圖片
  async getImage(key: string): Promise<string | null> {
    try {
      const cacheKey = `${this.imageCachePrefix}${this.hashString(key)}`;
      const cacheItem = await StorageManager.get<CacheItem<string>>(cacheKey);

      if (!cacheItem) {
        return null;
      }

      if (Date.now() > cacheItem.expiry) {
        await this.removeCacheItem(cacheKey);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      logger.error('Get cached image error:', { error, key });
      return null;
    }
  }

  // 移除緩存的圖片
  async removeImage(key: string): Promise<void> {
    try {
      const cacheKey = `${this.imageCachePrefix}${this.hashString(key)}`;
      await StorageManager.remove(cacheKey);
      logger.info('Image cache removed:', { key });
    } catch (error) {
      logger.error('Remove cached image error:', { error, key });
    }
  }

  // 卡片數據本地存儲
  async cacheCardData<T>(cardId: string, data: T): Promise<void> {
    try {
      const key = `${this.cardCachePrefix}${cardId}`;
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + CACHE_EXPIRY.LONG,
        version: this.version
      };

      await StorageManager.set(key, cacheItem);
      logger.info('Card data cached:', { cardId });
    } catch (error) {
      logger.error('Cache card data error:', { error, cardId });
    }
  }

  // 獲取緩存的卡片數據
  async getCachedCardData<T>(cardId: string): Promise<T | null> {
    try {
      const key = `${this.cardCachePrefix}${cardId}`;
      const cacheItem = await StorageManager.get<CacheItem<T>>(key);

      if (!cacheItem) {
        return null;
      }

      if (Date.now() > cacheItem.expiry) {
        await this.removeCacheItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      logger.error('Get cached card data error:', { error, cardId });
      return null;
    }
  }

  // 市場數據緩存
  async cacheMarketData<T>(marketType: string, data: T): Promise<void> {
    try {
      const key = `${this.marketCachePrefix}${marketType}`;
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + CACHE_EXPIRY.SHORT, // 市場數據緩存 5 分鐘
        version: this.version
      };

      await StorageManager.set(key, cacheItem);
      logger.info('Market data cached:', { marketType });
    } catch (error) {
      logger.error('Cache market data error:', { error, marketType });
    }
  }

  // 獲取緩存的市場數據
  async getCachedMarketData<T>(marketType: string): Promise<T | null> {
    try {
      const key = `${this.marketCachePrefix}${marketType}`;
      const cacheItem = await StorageManager.get<CacheItem<T>>(key);

      if (!cacheItem) {
        return null;
      }

      if (Date.now() > cacheItem.expiry) {
        await this.removeCacheItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      logger.error('Get cached market data error:', { error, marketType });
      return null;
    }
  }

  // 離線操作隊列
  async addToOfflineQueue(operation: any): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      queue.push({
        ...operation,
        timestamp: Date.now(),
        id: this.generateOperationId()
      });

      const key = `${this.queuePrefix}operations`;
      await StorageManager.set(key, queue);
      logger.info('Operation added to offline queue:', { operation });
    } catch (error) {
      logger.error('Add to offline queue error:', { error, operation });
    }
  }

  // 獲取離線操作隊列
  async getOfflineQueue(): Promise<any[]> {
    try {
      const key = `${this.queuePrefix}operations`;
      const queue = await StorageManager.get<any[]>(key);
      return queue || [];
    } catch (error) {
      logger.error('Get offline queue error:', { error });
      return [];
    }
  }

  // 清除離線操作隊列
  async clearOfflineQueue(): Promise<void> {
    try {
      const key = `${this.queuePrefix}operations`;
      await StorageManager.remove(key);
      logger.info('Offline queue cleared');
    } catch (error) {
      logger.error('Clear offline queue error:', { error });
    }
  }

  // 智能緩存策略
  async smartCache<T>(
    key: string,
    fetchData: () => Promise<T>,
    config: Partial<CacheConfig> = {}
  ): Promise<T> {
    try {
      // 檢查網絡狀態
      const networkState = await networkMonitor.getCurrentState();
      const isOnline = networkState?.isConnected ?? false;

      // 如果離線且配置為離線優先，嘗試從緩存獲取
      if (!isOnline && config.offlineOnly) {
        const cached = await this.getCachedApiResponse<T>(key, config);
        if (cached) {
          return cached;
        }
        throw new Error('No cached data available offline');
      }

      // 如果強制刷新，直接獲取新數據
      if (config.forceRefresh) {
        const data = await fetchData();
        await this.cacheApiResponse(key, data, config);
        return data;
      }

      // 嘗試從緩存獲取
      const cached = await this.getCachedApiResponse<T>(key, config);
      if (cached) {
        return cached;
      }

      // 緩存未命中，獲取新數據
      const data = await fetchData();
      await this.cacheApiResponse(key, data, config);
      return data;
    } catch (error) {
      logger.error('Smart cache error:', { error, key });
      throw error;
    }
  }

  // 預加載數據
  async preloadData<T>(
    endpoints: string[],
    fetchFunction: (endpoint: string) => Promise<T>
  ): Promise<void> {
    try {
      const promises = endpoints.map(async (endpoint) => {
        try {
          const data = await fetchFunction(endpoint);
          await this.cacheApiResponse(endpoint, data);
        } catch (error) {
          logger.error('Preload data error for endpoint:', { error, endpoint });
        }
      });

      await Promise.allSettled(promises);
      logger.info('Data preloading completed');
    } catch (error) {
      logger.error('Preload data error:', { error });
    }
  }

  // 獲取緩存統計
  async getCacheStats(): Promise<CacheStats> {
    try {
      const keys = await StorageManager.getAllKeys();
      const cacheKeys = keys.filter(key =>
        key.startsWith(this.cachePrefix) ||
        key.startsWith(this.imageCachePrefix) ||
        key.startsWith(this.cardCachePrefix) ||
        key.startsWith(this.marketCachePrefix)
      );

      let totalSize = 0;
      let oldestItem = Date.now();
      let newestItem = 0;
      let expiredItems = 0;

      for (const key of cacheKeys) {
        const cacheItem = await StorageManager.get<CacheItem<any>>(key);
        if (cacheItem) {
          totalSize += 1;

          if (cacheItem.timestamp < oldestItem) {
            oldestItem = cacheItem.timestamp;
          }

          if (cacheItem.timestamp > newestItem) {
            newestItem = cacheItem.timestamp;
          }

          if (Date.now() > cacheItem.expiry) {
            expiredItems += 1;
          }
        }
      }

      return {
        totalItems: totalSize,
        totalSize,
        oldestItem,
        newestItem,
        expiredItems
      };
    } catch (error) {
      logger.error('Get cache stats error:', { error });
      return {
        totalItems: 0,
        totalSize: 0,
        oldestItem: 0,
        newestItem: 0,
        expiredItems: 0
      };
    }
  }

  // 清理過期緩存
  async cleanupExpiredCache(): Promise<void> {
    try {
      const keys = await StorageManager.getAllKeys();
      const cacheKeys = keys.filter(key =>
        key.startsWith(this.cachePrefix) ||
        key.startsWith(this.imageCachePrefix) ||
        key.startsWith(this.cardCachePrefix) ||
        key.startsWith(this.marketCachePrefix)
      );

      for (const key of cacheKeys) {
        const cacheItem = await StorageManager.get<CacheItem<any>>(key);
        if (cacheItem && Date.now() > cacheItem.expiry) {
          await StorageManager.remove(key);
        }
      }

      logger.info('Expired cache cleaned up');
    } catch (error) {
      logger.error('Cache cleanup error:', { error });
    }
  }

  // 清除所有緩存
  async clearAllCache(): Promise<void> {
    try {
      const keys = await StorageManager.getAllKeys();
      const cacheKeys = keys.filter(key =>
        key.startsWith(this.cachePrefix) ||
        key.startsWith(this.imageCachePrefix) ||
        key.startsWith(this.cardCachePrefix) ||
        key.startsWith(this.marketCachePrefix)
      );

      await StorageManager.multiRemove(cacheKeys);
      logger.info('All cache cleared');
    } catch (error) {
      logger.error('Clear all cache error:', { error });
    }
  }

  // 私有方法
  private generateCacheKey(endpoint: string, config: Partial<CacheConfig>): string {
    const params = new URLSearchParams();
    if (config.etag) params.append('etag', config.etag);
    if (config.lastModified) params.append('lastModified', config.lastModified);

    const queryString = params.toString();
    return `${this.cachePrefix}${this.hashString(endpoint)}${queryString ? `?${queryString}` : ''}`;
  }

  private async removeCacheItem(key: string): Promise<void> {
    try {
      await StorageManager.remove(key);
    } catch (error) {
      logger.error('Remove cache item error:', { error, key });
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private generateOperationId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 導出單例實例
export const cacheManager = CacheManager.getInstance();
