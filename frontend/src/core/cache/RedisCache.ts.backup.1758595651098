/**
 * Redis 緩存管理器
 * 提供高性能的多層緩存策略
 */

import { logger } from '../../utils/logger';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
  averageResponseTime: number;
}

export interface CacheItem<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
}

class RedisCache {
  private static instance: RedisCache;
  private config: CacheConfig;
  private stats: CacheStats;
  private isConnected: boolean = false;
  private connectionPromise?: Promise<void>;

  // 模擬 Redis 客戶端（實際環境中應使用真實的 Redis 客戶端）
  private mockClient: Map<string, CacheItem> = new Map();

  private constructor(config: CacheConfig) {
    this.config = {
      keyPrefix: 'cardstrategy:',
      defaultTTL: 3600, // 1小時
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0,
      averageResponseTime: 0,
    };
  }

  public static getInstance(config?: CacheConfig): RedisCache {
    if (!RedisCache.instance) {
      if (!config) {
        throw new Error(
          'Redis cache configuration is required for first initialization'
        );
      }
      RedisCache.instance = new RedisCache(config);
    }
    return RedisCache.instance;
  }

  /**
   * 初始化 Redis 連接
   */
  public async initialize(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.connect();
    await this.connectionPromise;
  }

  private async connect(): Promise<void> {
    try {
      // 模擬連接延遲
      await new Promise(resolve => setTimeout(resolve, 100));

      this.isConnected = true;
      logger.info('Redis cache connected successfully', {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db || 0,
      });

      // 啟動定期清理過期鍵
      this.startCleanupTask();
    } catch (error) {
      logger.error('Failed to connect to Redis cache', error);
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 獲取緩存值
   */
  public async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      await this.ensureConnected();

      const fullKey = this.getFullKey(key);
      const item = this.mockClient.get(fullKey);

      if (!item) {
        this.stats.misses++;
        this.updateStats(startTime);
        return null;
      }

      // 檢查是否過期
      if (this.isExpired(item)) {
        await this.delete(key);
        this.stats.misses++;
        this.updateStats(startTime);
        return null;
      }

      // 更新訪問統計
      item.accessCount++;
      item.lastAccess = Date.now();

      this.stats.hits++;
      this.updateStats(startTime);

      logger.debug('Cache hit', { key, accessCount: item.accessCount });
      return item.value as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      this.stats.errors++;
      this.updateStats(startTime);
      return null;
    }
  }

  /**
   * 設置緩存值
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const startTime = Date.now();

    try {
      await this.ensureConnected();

      const fullKey = this.getFullKey(key);
      const cacheTTL = ttl || this.config.defaultTTL || 3600;

      const item: CacheItem<T> = {
        value,
        timestamp: Date.now(),
        ttl: cacheTTL * 1000, // 轉換為毫秒
        accessCount: 0,
        lastAccess: Date.now(),
      };

      this.mockClient.set(fullKey, item);
      this.stats.sets++;
      this.updateStats(startTime);

      logger.debug('Cache set', {
        key,
        ttl: cacheTTL,
        size: JSON.stringify(value).length,
      });

      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      this.stats.errors++;
      this.updateStats(startTime);
      return false;
    }
  }

  /**
   * 刪除緩存鍵
   */
  public async delete(key: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      await this.ensureConnected();

      const fullKey = this.getFullKey(key);
      const existed = this.mockClient.has(fullKey);

      if (existed) {
        this.mockClient.delete(fullKey);
        this.stats.deletes++;
      }

      this.updateStats(startTime);

      logger.debug('Cache delete', { key, existed });
      return existed;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      this.stats.errors++;
      this.updateStats(startTime);
      return false;
    }
  }

  /**
   * 批量獲取
   */
  public async mget<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();

    try {
      const promises = keys.map(async key => {
        const value = await this.get<T>(key);
        return { key, value };
      });

      const resolved = await Promise.all(promises);

      resolved.forEach(({ key, value }) => {
        results.set(key, value);
      });

      logger.debug('Cache mget completed', {
        keys: keys.length,
        hits: resolved.filter(r => r.value !== null).length,
      });
    } catch (error) {
      logger.error('Cache mget error', { keys, error });
      this.stats.errors++;
    }

    return results;
  }

  /**
   * 批量設置
   */
  public async mset<T>(
    items: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<boolean> {
    try {
      const promises = items.map(({ key, value, ttl }) =>
        this.set(key, value, ttl)
      );

      const results = await Promise.all(promises);
      const success = results.every(result => result === true);

      logger.debug('Cache mset completed', {
        items: items.length,
        success,
      });

      return success;
    } catch (error) {
      logger.error('Cache mset error', { items: items.length, error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * 檢查鍵是否存在
   */
  public async exists(key: string): Promise<boolean> {
    try {
      await this.ensureConnected();

      const fullKey = this.getFullKey(key);
      const item = this.mockClient.get(fullKey);

      if (!item) {
        return false;
      }

      if (this.isExpired(item)) {
        await this.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * 獲取剩餘生存時間
   */
  public async ttl(key: string): Promise<number> {
    try {
      await this.ensureConnected();

      const fullKey = this.getFullKey(key);
      const item = this.mockClient.get(fullKey);

      if (!item) {
        return -2; // 鍵不存在
      }

      if (this.isExpired(item)) {
        await this.delete(key);
        return -2;
      }

      const remaining = item.ttl - (Date.now() - item.timestamp);
      return Math.max(0, Math.floor(remaining / 1000)); // 轉換為秒
    } catch (error) {
      logger.error('Cache ttl error', { key, error });
      this.stats.errors++;
      return -1;
    }
  }

  /**
   * 清除所有緩存
   */
  public async flushAll(): Promise<boolean> {
    try {
      await this.ensureConnected();

      this.mockClient.clear();

      logger.info('Cache flushed successfully');
      return true;
    } catch (error) {
      logger.error('Cache flush error', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * 獲取緩存統計信息
   */
  public getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate =
      totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return { ...this.stats };
  }

  /**
   * 重置統計信息
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * 獲取緩存大小
   */
  public async size(): Promise<number> {
    try {
      await this.ensureConnected();
      return this.mockClient.size;
    } catch (error) {
      logger.error('Cache size error', error);
      return 0;
    }
  }

  /**
   * 健康檢查
   */
  public async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      await this.ensureConnected();

      // 測試基本操作
      const testKey = '__health_check__';
      const testValue = Date.now();

      await this.set(testKey, testValue, 10);
      const retrieved = await this.get(testKey);
      await this.delete(testKey);

      const healthy = retrieved === testValue;

      return {
        healthy,
        details: {
          connected: this.isConnected,
          stats: this.getStats(),
          size: await this.size(),
        },
      };
    } catch (error) {
      logger.error('Cache health check failed', error);
      return {
        healthy: false,
        details: {
          connected: this.isConnected,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.initialize();
    }
  }

  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private updateStats(startTime: number): void {
    const responseTime = Date.now() - startTime;
    const totalRequests =
      this.stats.hits +
      this.stats.misses +
      this.stats.sets +
      this.stats.deletes;

    // 計算平均響應時間
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (totalRequests - 1) + responseTime) /
      totalRequests;
  }

  private startCleanupTask(): void {
    // 每5分鐘清理一次過期鍵
    setInterval(
      async () => {
        try {
          const now = Date.now();
          const expiredKeys: string[] = [];

          for (const [key, item] of this.mockClient.entries()) {
            if (now - item.timestamp > item.ttl) {
              expiredKeys.push(key);
            }
          }

          expiredKeys.forEach(key => {
            this.mockClient.delete(key);
          });

          if (expiredKeys.length > 0) {
            logger.debug('Cleaned up expired cache keys', {
              count: expiredKeys.length,
            });
          }
        } catch (error) {
          logger.error('Cache cleanup error', error);
        }
      },
      5 * 60 * 1000
    ); // 5分鐘
  }
}

export default RedisCache;
