/**
 * 統一緩存管理器
 * 整合 Redis、CDN 和預加載功能
 */

import { logger } from '../../utils/logger';
import CDNCache, { CDNConfig } from './cdnCache';
import PreloadManager from './preloadManager';
import RedisCache, { CacheConfig as RedisConfig } from './redisCache';

export interface CacheManagerConfig {
  redis: RedisConfig;
  cdn: CDNConfig;
  enablePreload: boolean;
  enableStatistics: boolean;
  cacheStrategy: 'memory-first' | 'redis-first' | 'cdn-first' | 'hybrid';
  maxMemoryCacheSize: number;
  compressionThreshold: number;
}

export interface CacheOperation {
  type: 'get' | 'set' | 'delete' | 'preload';
  key: string;
  success: boolean;
  responseTime: number;
  source: 'memory' | 'redis' | 'cdn' | 'preload';
  timestamp: number;
}

export interface CacheManagerStats {
  operations: number;
  hits: number;
  misses: number;
  errors: number;
  hitRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  redisStats: any;
  cdnStats: any;
  preloadStats: any;
  operationsBySource: Record<string, number>;
  recentOperations: CacheOperation[];
}

class CacheManager {
  private static instance: CacheManager;
  private config: CacheManagerConfig;
  private redisCache: RedisCache;
  private cdnCache: CDNCache;
  private preloadManager: PreloadManager;
  private memoryCache: Map<string, any> = new Map();
  private stats: CacheManagerStats;
  private recentOperations: CacheOperation[] = [];
  private isInitialized: boolean = false;

  private constructor(config: CacheManagerConfig) {
    this.config = {
      maxMemoryCacheSize: 1000,
      compressionThreshold: 1024, // 1KB
      enablePreload: true,
      enableStatistics: true,
      cacheStrategy: 'hybrid',
      ...config,
    };

    this.stats = {
      operations: 0,
      hits: 0,
      misses: 0,
      errors: 0,
      hitRate: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      redisStats: {},
      cdnStats: {},
      preloadStats: {},
      operationsBySource: {},
      recentOperations: [],
    };

    this.initializeCaches();
  }

  public static getInstance(config?: CacheManagerConfig): CacheManager {
    if (!CacheManager.instance) {
      if (!config) {
        throw new Error(
          'Cache manager configuration is required for first initialization'
        );
      }
      CacheManager.instance = new CacheManager(config);
    }
    return CacheManager.instance;
  }

  /**
   * 初始化緩存管理器
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 初始化 Redis 緩存
      await this.redisCache.initialize();

      // 初始化 CDN 緩存
      await this.cdnCache.initialize();

      // 初始化預加載管理器
      if (this.config.enablePreload) {
        await this.preloadManager.initialize();
      }

      this.isInitialized = true;
      logger.info('Cache manager initialized successfully', {
        strategy: this.config.cacheStrategy,
        preload: this.config.enablePreload,
        statistics: this.config.enableStatistics,
      });

      // 啟動統計收集
      if (this.config.enableStatistics) {
        this.startStatisticsCollection();
      }
    } catch (error) {
      logger.error('Failed to initialize cache manager', error);
      throw error;
    }
  }

  /**
   * 獲取緩存值
   */
  public async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    let result: T | null = null;
    let source: 'memory' | 'redis' | 'cdn' = 'memory';

    try {
      this.stats.operations++;

      // 根據緩存策略獲取數據
      switch (this.config.cacheStrategy) {
        case 'memory-first':
          result = await this.getMemoryFirst<T>(key);
          source = result ? 'memory' : 'redis';
          break;
        case 'redis-first':
          result = await this.getRedisFirst<T>(key);
          source = result ? 'redis' : 'memory';
          break;
        case 'cdn-first':
          result = await this.getCDNFirst<T>(key);
          source = 'cdn';
          break;
        case 'hybrid':
          result = await this.getHybrid<T>(key);
          source = this.determineSource(result);
          break;
      }

      const success = result !== null;
      const responseTime = Date.now() - startTime;

      this.recordOperation({
        type: 'get',
        key,
        success,
        responseTime,
        source,
        timestamp: Date.now(),
      });

      if (success) {
        this.stats.hits++;
      } else {
        this.stats.misses++;
      }

      logger.debug('Cache get operation', {
        key,
        success,
        responseTime,
        source,
      });

      return result;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      this.stats.errors++;

      this.recordOperation({
        type: 'get',
        key,
        success: false,
        responseTime: Date.now() - startTime,
        source: 'memory',
        timestamp: Date.now(),
      });

      return null;
    }
  }

  /**
   * 設置緩存值
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const startTime = Date.now();
    let success = false;
    let source: 'memory' | 'redis' | 'cdn' = 'memory';

    try {
      this.stats.operations++;

      // 根據緩存策略設置數據
      switch (this.config.cacheStrategy) {
        case 'memory-first':
          success = await this.setMemoryFirst(key, value, ttl);
          source = 'memory';
          break;
        case 'redis-first':
          success = await this.setRedisFirst(key, value, ttl);
          source = 'redis';
          break;
        case 'cdn-first':
          success = await this.setCDNFirst(key, value, ttl);
          source = 'cdn';
          break;
        case 'hybrid':
          success = await this.setHybrid(key, value, ttl);
          source = 'redis'; // 混合策略主要使用 Redis
          break;
      }

      const responseTime = Date.now() - startTime;

      this.recordOperation({
        type: 'set',
        key,
        success,
        responseTime,
        source,
        timestamp: Date.now(),
      });

      logger.debug('Cache set operation', {
        key,
        success,
        responseTime,
        source,
        size: JSON.stringify(value).length,
      });

      return success;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      this.stats.errors++;

      this.recordOperation({
        type: 'set',
        key,
        success: false,
        responseTime: Date.now() - startTime,
        source: 'memory',
        timestamp: Date.now(),
      });

      return false;
    }
  }

  /**
   * 刪除緩存值
   */
  public async delete(key: string): Promise<boolean> {
    const startTime = Date.now();
    let success = false;

    try {
      this.stats.operations++;

      // 從所有緩存層刪除
      const memorySuccess = this.memoryCache.delete(key);
      const redisSuccess = await this.redisCache.delete(key);

      success = memorySuccess || redisSuccess;

      const responseTime = Date.now() - startTime;

      this.recordOperation({
        type: 'delete',
        key,
        success,
        responseTime,
        source: 'memory',
        timestamp: Date.now(),
      });

      logger.debug('Cache delete operation', { key, success, responseTime });
      return success;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * 預加載資源
   */
  public async preload(
    resource: string,
    type: 'asset' | 'route' | 'data' | 'api' = 'asset',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<boolean> {
    if (!this.config.enablePreload) {
      return false;
    }

    const startTime = Date.now();

    try {
      const success = await this.preloadManager.preloadResource(
        resource,
        type,
        priority
      );
      const responseTime = Date.now() - startTime;

      this.recordOperation({
        type: 'preload',
        key: resource,
        success,
        responseTime,
        source: 'preload',
        timestamp: Date.now(),
      });

      logger.debug('Cache preload operation', {
        resource,
        type,
        priority,
        success,
        responseTime,
      });

      return success;
    } catch (error) {
      logger.error('Cache preload error', { resource, type, error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * 清除所有緩存
   */
  public async clear(): Promise<boolean> {
    try {
      this.memoryCache.clear();
      await this.redisCache.flushAll();
      await this.cdnCache.purgeCache();

      logger.info('All caches cleared successfully');
      return true;
    } catch (error) {
      logger.error('Cache clear error', error);
      return false;
    }
  }

  /**
   * 獲取緩存統計信息
   */
  public getStats(): CacheManagerStats {
    const totalOperations = this.stats.operations;
    this.stats.hitRate =
      totalOperations > 0 ? (this.stats.hits / totalOperations) * 100 : 0;

    this.stats.memoryUsage = this.memoryCache.size;
    this.stats.redisStats = this.redisCache.getStats();
    this.stats.cdnStats = this.cdnCache.getStats();

    if (this.config.enablePreload) {
      this.stats.preloadStats = this.preloadManager.getStats();
    }

    this.stats.recentOperations = this.recentOperations.slice(-100); // 保留最近100個操作

    return { ...this.stats };
  }

  /**
   * 健康檢查
   */
  public async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const redisHealth = await this.redisCache.healthCheck();
      const cdnHealth = await this.cdnCache.healthCheck();
      const preloadHealth = this.config.enablePreload
        ? await this.preloadManager.healthCheck()
        : { healthy: true, details: {} };

      const healthy =
        redisHealth.healthy && cdnHealth.healthy && preloadHealth.healthy;

      return {
        healthy,
        details: {
          initialized: this.isInitialized,
          config: {
            strategy: this.config.cacheStrategy,
            preload: this.config.enablePreload,
            statistics: this.config.enableStatistics,
          },
          stats: this.getStats(),
          redis: redisHealth.details,
          cdn: cdnHealth.details,
          preload: preloadHealth.details,
        },
      };
    } catch (error) {
      logger.error('Cache manager health check failed', error);
      return {
        healthy: false,
        details: {
          initialized: this.isInitialized,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private initializeCaches(): void {
    this.redisCache = RedisCache.getInstance(this.config.redis);
    this.cdnCache = CDNCache.getInstance(this.config.cdn);
    this.preloadManager = PreloadManager.getInstance(this.cdnCache);
  }

  private async getMemoryFirst<T>(key: string): Promise<T | null> {
    // 首先檢查內存緩存
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) as T;
    }

    // 從 Redis 獲取並存儲到內存
    const value = await this.redisCache.get<T>(key);
    if (value !== null) {
      this.memoryCache.set(key, value);
    }

    return value;
  }

  private async getRedisFirst<T>(key: string): Promise<T | null> {
    // 首先從 Redis 獲取
    const value = await this.redisCache.get<T>(key);
    if (value !== null) {
      return value;
    }

    // 檢查內存緩存
    if (this.memoryCache.has(key)) {
      const memoryValue = this.memoryCache.get(key) as T;
      // 將內存值同步到 Redis
      await this.redisCache.set(key, memoryValue);
      return memoryValue;
    }

    return null;
  }

  private async getCDNFirst<T>(key: string): Promise<T | null> {
    // 從 CDN 獲取優化資源
    const optimizedUrl = await this.cdnCache.getOptimizedUrl(key);

    // 模擬從 CDN 獲取數據
    return this.simulateCDNGet<T>(optimizedUrl);
  }

  private async getHybrid<T>(key: string): Promise<T | null> {
    // 混合策略：內存 -> Redis -> CDN
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) as T;
    }

    const redisValue = await this.redisCache.get<T>(key);
    if (redisValue !== null) {
      this.memoryCache.set(key, redisValue);
      return redisValue;
    }

    // 最後嘗試從 CDN 獲取
    return await this.getCDNFirst<T>(key);
  }

  private async setMemoryFirst(
    key: string,
    value: any,
    ttl?: number
  ): Promise<boolean> {
    this.memoryCache.set(key, value);

    // 檢查內存緩存大小限制
    if (this.memoryCache.size > this.config.maxMemoryCacheSize) {
      this.evictOldestMemoryEntries();
    }

    // 同步到 Redis
    return await this.redisCache.set(key, value, ttl);
  }

  private async setRedisFirst(
    key: string,
    value: any,
    ttl?: number
  ): Promise<boolean> {
    const success = await this.redisCache.set(key, value, ttl);

    if (success) {
      this.memoryCache.set(key, value);
    }

    return success;
  }

  private async setCDNFirst(
    key: string,
    value: any,
    ttl?: number
  ): Promise<boolean> {
    // 對於 CDN，我們通常不直接設置值，而是預加載資源
    return await this.preload(key, 'asset', 'medium');
  }

  private async setHybrid(
    key: string,
    value: any,
    ttl?: number
  ): Promise<boolean> {
    // 混合策略：同時設置到內存和 Redis
    this.memoryCache.set(key, value);
    const redisSuccess = await this.redisCache.set(key, value, ttl);

    // 檢查內存緩存大小限制
    if (this.memoryCache.size > this.config.maxMemoryCacheSize) {
      this.evictOldestMemoryEntries();
    }

    return redisSuccess;
  }

  private determineSource(result: any): 'memory' | 'redis' | 'cdn' {
    // 簡單的源確定邏輯
    return result ? 'redis' : 'cdn';
  }

  private async simulateCDNGet<T>(url: string): Promise<T | null> {
    // 模擬從 CDN 獲取數據
    return null; // 實際實現中會從 CDN 獲取數據
  }

  private evictOldestMemoryEntries(): void {
    const entries = Array.from(this.memoryCache.entries());
    const toEvict = entries.slice(
      0,
      Math.floor(this.config.maxMemoryCacheSize * 0.1)
    );

    toEvict.forEach(([key]) => {
      this.memoryCache.delete(key);
    });

    logger.debug('Evicted oldest memory cache entries', {
      count: toEvict.length,
    });
  }

  private recordOperation(operation: CacheOperation): void {
    if (!this.config.enableStatistics) {
      return;
    }

    this.recentOperations.push(operation);

    // 限制最近操作記錄數量
    if (this.recentOperations.length > 1000) {
      this.recentOperations = this.recentOperations.slice(-500);
    }

    // 更新按源統計
    const source = operation.source;
    if (!this.stats.operationsBySource[source]) {
      this.stats.operationsBySource[source] = 0;
    }
    this.stats.operationsBySource[source]++;

    // 更新平均響應時間
    const totalOperations = this.stats.operations;
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (totalOperations - 1) +
        operation.responseTime) /
      totalOperations;
  }

  private startStatisticsCollection(): void {
    // 定期更新統計信息
    setInterval(() => {
      try {
        this.getStats();
      } catch (error) {
        logger.error('Statistics collection error', error);
      }
    }, 60000); // 每分鐘更新一次
  }
}

export default CacheManager;
