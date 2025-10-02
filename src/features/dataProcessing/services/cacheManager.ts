/**
 * 高性能CacheManage器
 * 實現多級Cache、智能淘汰、Data壓縮等功能
 */

import { logger } from '../../../core/utils/logger';
import type {
  CacheManager,
  CacheItem,
  PerformanceMetrics,
} from '../types/processing';
import { CacheStrategy, CompressionAlgorithm } from '../types/processing';

/**
 * 高性能CacheManage器實現
 */
export class HighPerformanceCacheManager implements CacheManager {
  private readonly memoryCache = new Map<string, CacheItem>();
  private readonly diskCache = new Map<string, CacheItem>();
  private readonly strategy: CacheStrategy;
  private readonly maxSize: number;
  private readonly ttl: number;
  private readonly compression: CompressionAlgorithm;
  private metrics: PerformanceMetrics;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    strategy: CacheStrategy = CacheStrategy.HYBRID,
    maxSize: number = 100 * 1024 * 1024, // 100MB
    ttl: number = 60 * 60 * 1000, // 1Hour
    compression: CompressionAlgorithm = CompressionAlgorithm.GZIP
  ) {
    this.strategy = strategy;
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.compression = compression;
    this.metrics = this.initializeMetrics();
    this.startCleanupTask();
  }

  /**
   * GetCacheData
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const _startTime = Date.now();

      // CheckMemoryCache
      if (
        this.strategy === CacheStrategy.MEMORY ||
        this.strategy === CacheStrategy.HYBRID
      ) {
        const _memoryItem = this.memoryCache.get(key);
        if (memoryItem && !this.isExpired(memoryItem)) {
          memoryItem.accessedAt = new Date();
          memoryItem.hits++;
          this.updateMetrics('hit');
          logger.debug(`內存緩存命中: ${key}`);
          return this.decompressData<T>(memoryItem.data);
        }
      }

      // CheckDiskCache
      if (
        this.strategy === CacheStrategy.DISK ||
        this.strategy === CacheStrategy.HYBRID
      ) {
        const _diskItem = this.diskCache.get(key);
        if (diskItem && !this.isExpired(diskItem)) {
          diskItem.accessedAt = new Date();
          diskItem.hits++;

          // 提升到MemoryCache
          if (this.strategy === CacheStrategy.HYBRID) {
            await this.promoteToMemory(key, diskItem);
          }

          this.updateMetrics('hit');
          logger.debug(`磁盤緩存命中: ${key}`);
          return this.decompressData<T>(diskItem.data);
        }
      }

      this.updateMetrics('miss');
      logger.debug(`緩存未命中: ${key}`);
      return null;
    } catch (error) {
      logger.error('緩存讀取Failed:', { error, key });
      return null;
    }
  }

  /**
   * SettingsCacheData
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const _startTime = Date.now();
      const _compressedData = await this.compressData(data);
      const _size = this.calculateSize(compressedData);

      const cacheItem: CacheItem<T> = {
        key,
        data: compressedData,
        createdAt: new Date(),
        accessedAt: new Date(),
        expiresAt: ttl
          ? new Date(Date.now() + ttl)
          : new Date(Date.now() + this.ttl),
        size,
        hits: 0,
        compressionRatio: this.calculateCompressionRatio(data, compressedData),
      };

      // Root據策略SelectStorage位置
      switch (this.strategy) {
        case CacheStrategy.MEMORY:
          await this.setToMemory(key, cacheItem);
          break;
        case CacheStrategy.DISK:
          await this.setToDisk(key, cacheItem);
          break;
        case CacheStrategy.HYBRID:
          await this.setToHybrid(key, cacheItem);
          break;
        case CacheStrategy.INTELLIGENT:
          await this.setToIntelligent(key, cacheItem);
          break;
      }

      logger.debug(`緩存SettingsSuccess: ${key}`, { size, strategy: this.strategy });
    } catch (error) {
      logger.error('緩存SettingsFailed:', { error, key });
      throw error;
    }
  }

  /**
   * DeleteCacheData
   */
  async delete(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key);
      this.diskCache.delete(key);
      logger.debug(`緩存DeleteSuccess: ${key}`);
    } catch (error) {
      logger.error('緩存DeleteFailed:', { error, key });
      throw error;
    }
  }

  /**
   * 清Empty所有Cache
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();
      this.diskCache.clear();
      this.metrics = this.initializeMetrics();
      logger.info('緩存清空完成');
    } catch (error) {
      logger.error('緩存清空Failed:', error);
      throw error;
    }
  }

  /**
   * CheckCacheYesNo存在
   */
  async has(key: string): Promise<boolean> {
    const _memoryItem = this.memoryCache.get(key);
    const _diskItem = this.diskCache.get(key);

    return (
      !!(memoryItem && !this.isExpired(memoryItem)) ||
      !!(diskItem && !this.isExpired(diskItem))
    );
  }

  /**
   * GetCache大小
   */
  async size(): Promise<number> {
    return this.memoryCache.size + this.diskCache.size;
  }

  /**
   * Get所有CacheKey
   */
  async keys(): Promise<string[]> {
    const _memoryKeys = Array.from(this.memoryCache.keys());
    const _diskKeys = Array.from(this.diskCache.keys());
    return [...new Set([...memoryKeys, ...diskKeys])];
  }

  /**
   * GetCacheStatisticsInformation
   */
  async stats(): Promise<{
    size: number;
    hitRate: number;
    missRate: number;
    evictionCount: number;
  }> {
    const _totalRequests = this.metrics.totalTasks;
    const _hitRate = totalRequests > 0 ? this.metrics.cacheHitRate : 0;
    const _missRate = 1 - hitRate;

    return {
      size: await this.size(),
      hitRate,
      missRate,
      evictionCount: this.metrics.failedTasks, // 使用FailedTask數作為淘汰Count
    };
  }

  /**
   * 銷毀CacheManage器
   */
  async destroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    await this.clear();
    logger.info('緩存管理器已銷毀');
  }

  // PrivateMethod實現

  private initializeMetrics(): PerformanceMetrics {
    return {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageProcessingTime: 0,
      throughput: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      cacheHitRate: 0,
      compressionRatio: 0,
      errorRate: 0,
      uptime: 0,
    };
  }

  private updateMetrics(type: 'hit' | 'miss'): void {
    this.metrics.totalTasks++;
    if (type === 'hit') {
      this.metrics.completedTasks++;
    } else {
      this.metrics.failedTasks++;
    }

    this.metrics.cacheHitRate =
      this.metrics.completedTasks / this.metrics.totalTasks;
    this.metrics.errorRate = this.metrics.failedTasks / this.metrics.totalTasks;
  }

  private isExpired(item: CacheItem): boolean {
    return item.expiresAt ? new Date() > item.expiresAt : false;
  }

  private calculateSize(data: unknown): number {
    try {
      const _serialized = JSON.stringify(data);
      return Buffer.byteLength(serialized, 'utf8');
    } catch {
      return 0;
    }
  }

  private calculateCompressionRatio(
    original: unknown,
    compressed: unknown
  ): number {
    try {
      const _originalSize = this.calculateSize(original);
      const _compressedSize = this.calculateSize(compressed);
      return originalSize > 0 ? compressedSize / originalSize : 1;
    } catch {
      return 1;
    }
  }

  private async compressData<T>(data: T): Promise<T> {
    if (this.compression === CompressionAlgorithm.NONE) {
      return data;
    }

    try {
      // 簡化的壓縮實現
      const _serialized = JSON.stringify(data);
      let compressed: string;

      switch (this.compression) {
        case CompressionAlgorithm.GZIP:
          // 模擬GZIP壓縮
          compressed = btoa(serialized); // 簡化實現
          break;
        case CompressionAlgorithm.LZ4:
          // 模擬LZ4壓縮
          compressed = serialized.replace(/\s+/g, ' '); // 簡化實現
          break;
        default:
          compressed = serialized;
      }

      return JSON.parse(compressed);
    } catch (error) {
      logger.warn('數據壓縮Failed，使用原始數據:', error);
      return data;
    }
  }

  private async decompressData<T>(data: T): Promise<T> {
    if (this.compression === CompressionAlgorithm.NONE) {
      return data;
    }

    try {
      // 簡化的解壓縮實現
      const _serialized = JSON.stringify(data);
      let decompressed: string;

      switch (this.compression) {
        case CompressionAlgorithm.GZIP:
          // 模擬GZIP解壓縮
          decompressed = atob(serialized); // 簡化實現
          break;
        case CompressionAlgorithm.LZ4:
          // 模擬LZ4解壓縮
          decompressed = serialized; // 簡化實現
          break;
        default:
          decompressed = serialized;
      }

      return JSON.parse(decompressed);
    } catch (error) {
      logger.warn('數據解壓縮Failed，使用原始數據:', error);
      return data;
    }
  }

  private async setToMemory<T>(key: string, item: CacheItem<T>): Promise<void> {
    // CheckMemoryLimit
    if (this.memoryCache.size >= this.maxSize / 1024) {
      // 簡化的MemoryLimit
      await this.evictFromMemory();
    }

    this.memoryCache.set(key, item);
  }

  private async setToDisk<T>(key: string, item: CacheItem<T>): Promise<void> {
    // CheckDiskLimit
    if (this.diskCache.size >= this.maxSize / 1024) {
      // 簡化的DiskLimit
      await this.evictFromDisk();
    }

    this.diskCache.set(key, item);
  }

  private async setToHybrid<T>(key: string, item: CacheItem<T>): Promise<void> {
    // 小DataStorage在Memory，大DataStorage在Disk
    if (item.size < 1024) {
      // 1KB以下存Memory
      await this.setToMemory(key, item);
    } else {
      await this.setToDisk(key, item);
    }
  }

  private async setToIntelligent<T>(
    key: string,
    item: CacheItem<T>
  ): Promise<void> {
    // 智能策略：Root據訪問頻率和Data大小決定Storage位置
    const _accessFrequency = this.calculateAccessFrequency(key);

    if (accessFrequency > 0.5 && item.size < 1024) {
      await this.setToMemory(key, item);
    } else {
      await this.setToDisk(key, item);
    }
  }

  private async promoteToMemory<T>(
    key: string,
    diskItem: CacheItem<T>
  ): Promise<void> {
    try {
      // CheckMemoryEmpty間
      if (this.memoryCache.size >= this.maxSize / 1024) {
        await this.evictFromMemory();
      }

      this.memoryCache.set(key, diskItem);
      logger.debug(`數據提升到內存緩存: ${key}`);
    } catch (error) {
      logger.warn('數據提升到內存Failed:', { error, key });
    }
  }

  private calculateAccessFrequency(key: string): number {
    const _memoryItem = this.memoryCache.get(key);
    const _diskItem = this.diskCache.get(key);

    if (!memoryItem && !diskItem) {
      return 0;
    }

    const _item = memoryItem || diskItem;
    const _age = Date.now() - item.createdAt.getTime();
    return age > 0 ? item.hits / (age / 1000) : 0; // 每Second訪問次數
  }

  private async evictFromMemory(): Promise<void> {
    // LRU淘汰策略
    const _items = Array.from(this.memoryCache.entries()).sort(
      ([, a], [, b]) => a.accessedAt.getTime() - b.accessedAt.getTime()
    );

    if (items.length > 0) {
      const [key] = items[0];
      this.memoryCache.delete(key);
      this.metrics.failedTasks++; // Record淘汰次數
      logger.debug(`內存緩存淘汰: ${key}`);
    }
  }

  private async evictFromDisk(): Promise<void> {
    // LRU淘汰策略
    const _items = Array.from(this.diskCache.entries()).sort(
      ([, a], [, b]) => a.accessedAt.getTime() - b.accessedAt.getTime()
    );

    if (items.length > 0) {
      const [key] = items[0];
      this.diskCache.delete(key);
      this.metrics.failedTasks++; // Record淘汰次數
      logger.debug(`磁盤緩存淘汰: ${key}`);
    }
  }

  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredItems();
      },
      5 * 60 * 1000
    ); // 每5Minute清理一次
  }

  private cleanupExpiredItems(): void {
    const _now = new Date();
    let cleanedCount = 0;

    // 清理MemoryCache
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }

    // 清理DiskCache
    for (const [key, item] of this.diskCache.entries()) {
      if (this.isExpired(item)) {
        this.diskCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`清理過期緩存項目: ${cleanedCount} 個`);
    }
  }
}
