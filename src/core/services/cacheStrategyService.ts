import { logger } from '@/utils/logger';

export interface CacheConfig {
  maxSize: number;
  ttl: number; // 毫秒
  cleanupInterval: number; // 毫秒
  enableCompression: boolean;
  enablePersistence: boolean;
  persistencePath?: string;
}

export interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // 估算大小（字節）
  tags?: string[];
}

export interface CacheStats {
  totalItems: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  averageAccessTime: number;
  memoryUsage: number;
  efficiency: number; // 0-100
}

export interface CachePolicy {
  name: string;
  description: string;
  ttl: number;
  maxSize: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tags: string[];
  conditions: {
    queryPattern?: string;
    responseSize?: number;
    accessFrequency?: number;
  };
}

export interface CacheLayer {
  name: string;
  type: 'MEMORY' | 'REDIS' | 'DISK';
  config: CacheConfig;
  stats: CacheStats;
  isActive: boolean;
}

export interface CacheStrategy {
  name: string;
  description: string;
  layers: CacheLayer[];
  policies: CachePolicy[];
  adaptive: boolean;
  performance: {
    hitRate: number;
    averageResponseTime: number;
    memoryEfficiency: number;
  };
}

export class CacheStrategyService {
  private static instance: CacheStrategyService;
  private isInitialized = false;
  private readonly memoryCache: Map<string, CacheItem> = new Map();
  private readonly cachePolicies: Map<string, CachePolicy> = new Map();
  private readonly cacheLayers: CacheLayer[] = [];
  private readonly strategies: CacheStrategy[] = [];
  private cleanupInterval: NodeJS.Timeout | null = null;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
    totalRequests: number;
  } = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0,
  };

  public static getInstance(): CacheStrategyService {
    if (!CacheStrategyService.instance) {
      CacheStrategyService.instance = new CacheStrategyService();
    }
    return CacheStrategyService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('CacheStrategyService already initialized');
      return;
    }

    try {
      this.setupDefaultPolicies();
      this.setupDefaultLayers();
      this.setupDefaultStrategies();
      this.startCleanupProcess();

      logger.info('CacheStrategyService initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize CacheStrategyService', error);
      throw error;
    }
  }

  /**
   * 設置緩存
   */
  public async set<T>(
    key: string,
    value: T,
    options?: {
      ttl?: number;
      tags?: string[];
      policy?: string;
    }
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('CacheStrategyService not initialized');
    }

    try {
      const _policy = options?.policy
        ? this.cachePolicies.get(options.policy)
        : this.getBestPolicy(key, value);
      const _ttl = options?.ttl || policy?.ttl || 300000; // 默認5分鐘
      const _tags = options?.tags || policy?.tags || [];

      const item: CacheItem<T> = {
        key,
        value,
        timestamp: Date.now(),
        ttl,
        accessCount: 0,
        lastAccessed: Date.now(),
        size: this.estimateSize(value),
        tags,
      };

      // 檢查緩存大小限制
      await this.ensureCapacity(item.size);

      this.memoryCache.set(key, item);

      logger.debug('Cache item set', { key, size: item.size, ttl });
    } catch (error) {
      logger.error('Failed to set cache item', { key, error });
      throw error;
    }
  }

  /**
   * 獲取緩存
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!this.isInitialized) {
      throw new Error('CacheStrategyService not initialized');
    }

    try {
      const _item = this.memoryCache.get(key) as CacheItem<T>;

      if (!item) {
        this.stats.misses++;
        this.stats.totalRequests++;
        logger.debug('Cache miss', { key });
        return null;
      }

      // 檢查是否過期
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
        this.stats.misses++;
        this.stats.totalRequests++;
        logger.debug('Cache item expired', { key });
        return null;
      }

      // 更新訪問統計
      item.accessCount++;
      item.lastAccessed = Date.now();

      this.stats.hits++;
      this.stats.totalRequests++;

      logger.debug('Cache hit', { key, accessCount: item.accessCount });
      return item.value;
    } catch (error) {
      logger.error('Failed to get cache item', { key, error });
      throw error;
    }
  }

  /**
   * 刪除緩存
   */
  public async delete(key: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('CacheStrategyService not initialized');
    }

    try {
      const _deleted = this.memoryCache.delete(key);
      if (deleted) {
        logger.debug('Cache item deleted', { key });
      }
      return deleted;
    } catch (error) {
      logger.error('Failed to delete cache item', { key, error });
      throw error;
    }
  }

  /**
   * 根據標籤刪除緩存
   */
  public async deleteByTags(tags: string[]): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('CacheStrategyService not initialized');
    }

    try {
      let deletedCount = 0;

      for (const [key, item] of this.memoryCache.entries()) {
        if (item.tags?.some(tag => tags.includes(tag))) {
          this.memoryCache.delete(key);
          deletedCount++;
        }
      }

      logger.info('Cache items deleted by tags', { tags, deletedCount });
      return deletedCount;
    } catch (error) {
      logger.error('Failed to delete cache items by tags', { tags, error });
      throw error;
    }
  }

  /**
   * 清空所有緩存
   */
  public async clear(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('CacheStrategyService not initialized');
    }

    try {
      this.memoryCache.clear();
      this.stats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalRequests: 0,
      };

      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Failed to clear cache', error);
      throw error;
    }
  }

  /**
   * 獲取緩存統計信息
   */
  public getStats(): CacheStats {
    if (!this.isInitialized) {
      throw new Error('CacheStrategyService not initialized');
    }

    const _totalItems = this.memoryCache.size;
    const _totalSize = Array.from(this.memoryCache.values()).reduce(
      (sum, item) => sum + item.size,
      0
    );
    const _hitRate =
      this.stats.totalRequests > 0
        ? (this.stats.hits / this.stats.totalRequests) * 100
        : 0;
    const _missRate = 100 - hitRate;
    const _averageAccessTime = this.calculateAverageAccessTime();
    const _memoryUsage = this.calculateMemoryUsage();
    const _efficiency = this.calculateEfficiency();

    return {
      totalItems,
      totalSize,
      hitRate,
      missRate,
      evictionCount: this.stats.evictions,
      averageAccessTime,
      memoryUsage,
      efficiency,
    };
  }

  /**
   * 獲取緩存策略
   */
  public getStrategies(): CacheStrategy[] {
    return this.strategies;
  }

  /**
   * 獲取緩存層
   */
  public getLayers(): CacheLayer[] {
    return this.cacheLayers;
  }

  /**
   * 添加緩存策略
   */
  public addStrategy(strategy: CacheStrategy): void {
    if (!this.isInitialized) {
      throw new Error('CacheStrategyService not initialized');
    }

    this.strategies.push(strategy);
    logger.info('Cache strategy added', { name: strategy.name });
  }

  /**
   * 優化緩存策略
   */
  public async optimizeStrategy(strategyName: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('CacheStrategyService not initialized');
    }

    try {
      const _strategy = this.strategies.find(s => s.name === strategyName);
      if (!strategy) {
        throw new Error(`Strategy ${strategyName} not found`);
      }

      const _stats = this.getStats();

      // 根據命中率調整策略
      if (stats.hitRate < 50) {
        await this.adjustTTL(strategy, 'increase');
        await this.adjustCacheSize(strategy, 'increase');
      } else if (stats.hitRate > 90) {
        await this.adjustTTL(strategy, 'decrease');
        await this.adjustCacheSize(strategy, 'decrease');
      }

      logger.info('Cache strategy optimized', {
        strategyName,
        hitRate: stats.hitRate,
      });
    } catch (error) {
      logger.error('Failed to optimize cache strategy', {
        strategyName,
        error,
      });
      throw error;
    }
  }

  /**
   * 預熱緩存
   */
  public async warmupCache(
    keys: string[],
    dataProvider: (key: string) => Promise<any>
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('CacheStrategyService not initialized');
    }

    try {
      logger.info('Starting cache warmup', { keyCount: keys.length });

      const _promises = keys.map(async key => {
        try {
          const _value = await dataProvider(key);
          await this.set(key, value);
        } catch (error) {
          logger.warn('Failed to warmup cache item', { key, error });
        }
      });

      await Promise.allSettled(promises);
      logger.info('Cache warmup completed');
    } catch (error) {
      logger.error('Failed to warmup cache', error);
      throw error;
    }
  }

  /**
   * 獲取服務狀態
   */
  public getStatus(): unknown {
    return {
      isInitialized: this.isInitialized,
      cacheSize: this.memoryCache.size,
      strategies: this.strategies.length,
      layers: this.cacheLayers.length,
      stats: this.isInitialized
        ? this.getStats()
        : {
            totalItems: 0,
            totalSize: 0,
            hitRate: 0,
            missRate: 100,
            evictionCount: 0,
            averageAccessTime: 0,
            memoryUsage: 0,
            efficiency: 0,
          },
    };
  }

  /**
   * 清理服務
   */
  public async cleanup(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.isInitialized) {
      await this.clear();
    }
    this.isInitialized = false;
    logger.info('CacheStrategyService cleaned up');
  }

  // 私有方法

  private setupDefaultPolicies(): void {
    // 高頻訪問策略
    this.cachePolicies.set('high_frequency', {
      name: 'High Frequency Access',
      description: '適用於高頻訪問的數據',
      ttl: 600000, // 10分鐘
      maxSize: 1000,
      priority: 'HIGH',
      tags: ['frequent'],
      conditions: {
        accessFrequency: 10,
      },
    });

    // 大數據策略
    this.cachePolicies.set('large_data', {
      name: 'Large Data',
      description: '適用於大型數據集',
      ttl: 1800000, // 30分鐘
      maxSize: 100,
      priority: 'MEDIUM',
      tags: ['large'],
      conditions: {
        responseSize: 1000000, // 1MB
      },
    });

    // 關鍵數據策略
    this.cachePolicies.set('critical_data', {
      name: 'Critical Data',
      description: '適用於關鍵業務數據',
      ttl: 3600000, // 1小時
      maxSize: 500,
      priority: 'CRITICAL',
      tags: ['critical'],
      conditions: {},
    });

    // 臨時數據策略
    this.cachePolicies.set('temporary', {
      name: 'Temporary Data',
      description: '適用於臨時數據',
      ttl: 60000, // 1分鐘
      maxSize: 2000,
      priority: 'LOW',
      tags: ['temporary'],
      conditions: {},
    });
  }

  private setupDefaultLayers(): void {
    // 內存層
    this.cacheLayers.push({
      name: 'Memory Layer',
      type: 'MEMORY',
      config: {
        maxSize: 1000,
        ttl: 300000,
        cleanupInterval: 60000,
        enableCompression: false,
        enablePersistence: false,
      },
      stats: {
        totalItems: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        evictionCount: 0,
        averageAccessTime: 0,
        memoryUsage: 0,
        efficiency: 0,
      },
      isActive: true,
    });

    // Redis層（模擬）
    this.cacheLayers.push({
      name: 'Redis Layer',
      type: 'REDIS',
      config: {
        maxSize: 10000,
        ttl: 1800000,
        cleanupInterval: 300000,
        enableCompression: true,
        enablePersistence: true,
      },
      stats: {
        totalItems: 0,
        totalSize: 0,
        hitRate: 0,
        missRate: 0,
        evictionCount: 0,
        averageAccessTime: 0,
        memoryUsage: 0,
        efficiency: 0,
      },
      isActive: false, // 暫時禁用
    });
  }

  private setupDefaultStrategies(): void {
    // 分層緩存策略
    this.strategies.push({
      name: 'Layered Cache Strategy',
      description: '使用多層緩存提高性能',
      layers: this.cacheLayers,
      policies: Array.from(this.cachePolicies.values()),
      adaptive: true,
      performance: {
        hitRate: 0,
        averageResponseTime: 0,
        memoryEfficiency: 0,
      },
    });

    // 智能緩存策略
    this.strategies.push({
      name: 'Intelligent Cache Strategy',
      description: '根據訪問模式自適應調整',
      layers: this.cacheLayers,
      policies: Array.from(this.cachePolicies.values()),
      adaptive: true,
      performance: {
        hitRate: 0,
        averageResponseTime: 0,
        memoryEfficiency: 0,
      },
    });
  }

  private getBestPolicy(key: string, value: unknown): CachePolicy | null {
    const _size = this.estimateSize(value);

    // 根據數據大小選擇策略
    if (size > 1000000) {
      return this.cachePolicies.get('large_data') || null;
    }

    // 根據鍵名模式選擇策略
    if (key.includes('temp') || key.includes('session')) {
      return this.cachePolicies.get('temporary') || null;
    }

    if (key.includes('critical') || key.includes('config')) {
      return this.cachePolicies.get('critical_data') || null;
    }

    return this.cachePolicies.get('high_frequency') || null;
  }

  private estimateSize(value: unknown): number {
    try {
      const _jsonString = JSON.stringify(value);
      return new Blob([jsonString]).size;
    } catch {
      return 1000; // 默認大小
    }
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private async ensureCapacity(newItemSize: number): Promise<void> {
    const _maxSize = 100 * 1024 * 1024; // 100MB
    const _currentSize = Array.from(this.memoryCache.values()).reduce(
      (sum, item) => sum + item.size,
      0
    );

    if (currentSize + newItemSize > maxSize) {
      await this.evictItems(newItemSize);
    }
  }

  private async evictItems(requiredSpace: number): Promise<void> {
    // LRU 策略：移除最久未訪問的項目
    const _items = Array.from(this.memoryCache.entries()).sort(
      ([, a], [, b]) => a.lastAccessed - b.lastAccessed
    );

    let freedSpace = 0;
    const evictedKeys: string[] = [];

    for (const [key, item] of items) {
      if (freedSpace >= requiredSpace) break;

      this.memoryCache.delete(key);
      freedSpace += item.size;
      evictedKeys.push(key);
      this.stats.evictions++;
    }

    if (evictedKeys.length > 0) {
      logger.info('Cache items evicted', {
        count: evictedKeys.length,
        freedSpace,
      });
    }
  }

  private calculateAverageAccessTime(): number {
    const _items = Array.from(this.memoryCache.values());
    if (items.length === 0) return 0;

    const _totalTime = items.reduce(
      (sum, item) => sum + (Date.now() - item.lastAccessed),
      0
    );
    return totalTime / items.length;
  }

  private calculateMemoryUsage(): number {
    const _totalSize = Array.from(this.memoryCache.values()).reduce(
      (sum, item) => sum + item.size,
      0
    );
    const _maxSize = 100 * 1024 * 1024; // 100MB
    return (totalSize / maxSize) * 100;
  }

  private calculateEfficiency(): number {
    const _hitRate =
      this.stats.totalRequests > 0
        ? (this.stats.hits / this.stats.totalRequests) * 100
        : 0;
    const _memoryUsage = this.calculateMemoryUsage();

    // 效率 = 命中率 * (1 - 內存使用率)
    return Math.max(0, hitRate * (1 - memoryUsage / 100));
  }

  private async adjustTTL(
    strategy: CacheStrategy,
    action: 'increase' | 'decrease'
  ): Promise<void> {
    for (const policy of strategy.policies) {
      if (action === 'increase') {
        policy.ttl = Math.min(policy.ttl * 1.5, 3600000); // 最大1小時
      } else {
        policy.ttl = Math.max(policy.ttl * 0.8, 60000); // 最小1分鐘
      }
    }
  }

  private async adjustCacheSize(
    strategy: CacheStrategy,
    action: 'increase' | 'decrease'
  ): Promise<void> {
    for (const layer of strategy.layers) {
      if (action === 'increase') {
        layer.config.maxSize = Math.min(layer.config.maxSize * 1.2, 10000);
      } else {
        layer.config.maxSize = Math.max(layer.config.maxSize * 0.9, 100);
      }
    }
  }

  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      try {
        this.cleanupExpiredItems();
      } catch (error) {
        logger.error('Cache cleanup error', error);
      }
    }, 60000); // 每分鐘清理一次
  }

  private cleanupExpiredItems(): void {
    const _now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug('Expired cache items cleaned', { count: cleanedCount });
    }
  }
}

// 導出單例實例
export const _cacheStrategyService = CacheStrategyService.getInstance();

export default cacheStrategyService;
