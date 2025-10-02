import { logger } from '../../../core/utils/logger';
import { CacheStorage, StorageManager } from '../../../core/utils/storage';
import type {
  StorageCallbacks,
  StorageConfig,
  StorageError,
  StorageEvent,
  StorageItem,
  StorageMetadata,
  StorageOptions,
  StorageQuery,
  StorageStats,
} from '../types/storage';
import {
  CleanupStrategy,
  CompressionType,
  ConflictResolution,
  DataPriority,
  StorageErrorCode,
  StorageEventType,
  StorageLayer,
  StorageStrategy,
  SyncStatus,
} from '../types/storage';

/**
 * 多層StorageService
 * 實現多層Storage策略、CacheManage、DataSync等功能
 */
export class MultiLayerStorageService {
  private static instance: MultiLayerStorageService;
  private isInitialized = false;
  private config: StorageConfig;
  private callbacks: StorageCallbacks = {};
  private stats: StorageStats;

  // Storage層Instance
  private readonly memoryStorage = new Map<string, StorageItem>();

  // SyncQueue
  private syncQueue: StorageItem[] = [];
  private isSyncing = false;

  // StatisticsTrace
  private readonly operationStats = {
    reads: 0,
    writes: 0,
    hits: 0,
    misses: 0,
    errors: 0,
  };

  private constructor() {
    this.config = this.getDefaultConfig();
    this.stats = this.initializeStats();
  }

  /**
   * GetServiceInstance（單例模式）
   */
  public static getInstance(): MultiLayerStorageService {
    if (!MultiLayerStorageService.instance) {
      MultiLayerStorageService.instance = new MultiLayerStorageService();
    }
    return MultiLayerStorageService.instance;
  }

  /**
   * InitializeStorageService
   */
  public async initialize(
    config?: Partial<StorageConfig>,
    forceReinit = false
  ): Promise<boolean> {
    if (this.isInitialized && !forceReinit) {
      logger.warn('MultiLayerStorageService 已經初始化');
      return true;
    }

    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Initialize各Storage層
      await this.initializeLayers();

      // Start後台Task
      this.startBackgroundTasks();

      this.isInitialized = true;
      logger.info('MultiLayerStorageService InitializeSuccess');
      return true;
    } catch (error) {
      logger.error('MultiLayerStorageService InitializeFailed:', error);
      return false;
    }
  }

  /**
   * SettingsData到Storage
   */
  public async set<T>(
    key: string,
    data: T,
    options: StorageOptions = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const _startTime = Date.now();
      this.operationStats.writes++;

      // VerifyInput
      if (!key || key.trim() === '') {
        return { success: false, error: '鍵名不能為空' };
      }

      // CreateStorage項目
      const _item = await this.createStorageItem(key, data, options);

      // CheckMemoryLimit
      if (await this.shouldRejectDueToMemoryLimit(item)) {
        logger.warn('內存限制檢查觸發緊急清理:', {
          key,
          itemSize: item.metadata.size,
        });
        await this.performEmergencyCleanup();
      }

      // Root據策略SelectStorage層
      const _layers = this.selectStorageLayers(item.priority, options.layer);

      // Write到選定的層
      const _results = await Promise.allSettled(
        layers.map(layer => this.writeToLayer(layer, item))
      );

      // CheckWrite結果
      const _successfulLayers = results.filter(
        result => result.status === 'fulfilled'
      );
      const _failedLayers = results.filter(
        result => result.status === 'rejected'
      );

      if (failedLayers.length > 0) {
        logger.warn('部分存儲層寫入Failed:', {
          key,
          failedLayers: failedLayers.map(r => r.reason),
          successfulLayers: successfulLayers.length,
        });
      }

      if (successfulLayers.length === 0) {
        throw new Error('所有存儲層寫入Failed');
      }

      // UpdateStatistics
      const _latency = Date.now() - startTime;
      this.updateWriteStats(latency);

      // 觸發Event
      this.emitEvent({
        type: StorageEventType.ITEM_CREATED,
        key,
        data,
        metadata: item.metadata,
        timestamp: new Date(),
        source: layers[0],
      });

      // Add到SyncQueue
      if (options.sync !== false && this.config.sync.enabled) {
        this.addToSyncQueue(item);
      }

      logger.debug(`數據寫入Success: ${key}`, { layers: layers.length, latency });
      return { success: true };
    } catch (error) {
      this.operationStats.errors++;
      logger.error('數據寫入Failed:', {
        error,
        key,
        errorMessage: (error as Error).message,
        stack: (error as Error).stack,
      });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * 從StorageGetData
   */
  public async get<T>(
    key: string,
    options: StorageOptions = {}
  ): Promise<T | null> {
    try {
      const _startTime = Date.now();
      this.operationStats.reads++;

      // OKSearch層的順序
      const _searchLayers = this.getSearchLayers(options.layer);

      for (const layer of searchLayers) {
        try {
          const _item = await this.readFromLayer<T>(layer, key);
          if (item) {
            // CheckYesNo過期
            if (item.expiresAt && new Date() > item.expiresAt) {
              // Data已過期，Delete並ContinueSearch
              await this.deleteFromLayer(layer, key);
              continue;
            }

            // Update訪問Time
            await this.updateAccessTime(key, layer);

            // UpdateStatistics
            this.operationStats.hits++;
            const _latency = Date.now() - startTime;
            this.updateReadStats(latency);

            // 觸發Event
            this.emitEvent({
              type: StorageEventType.ITEM_ACCESSED,
              key,
              data: item.data,
              timestamp: new Date(),
              source: layer,
            });

            // Cache提升：將Data複製到更快的層
            if (
              layer !== StorageLayer.MEMORY &&
              this.shouldPromoteToCache(item)
            ) {
              await this.promoteToFasterLayer(key, item, layer);
            }

            logger.debug(`數據讀取Success: ${key}`, { layer, latency });
            return item.data;
          }
        } catch (error) {
          logger.warn(`從層 ${layer} 讀取Failed:`, { error, key });
          continue;
        }
      }

      // 未找到Data
      this.operationStats.misses++;
      logger.debug(`數據未找到: ${key}`);
      return null;
    } catch (error) {
      this.operationStats.errors++;
      logger.error('數據讀取Failed:', { error, key });
      return null;
    }
  }

  /**
   * DeleteData
   */
  public async delete(
    key: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 從所有層Delete
      const _layers = Object.values(StorageLayer);
      const _results = await Promise.allSettled(
        layers.map(layer => this.deleteFromLayer(layer, key))
      );

      // 觸發Event
      this.emitEvent({
        type: StorageEventType.ITEM_DELETED,
        key,
        timestamp: new Date(),
        source: StorageLayer.LOCAL,
      });

      logger.debug(`數據DeleteSuccess: ${key}`);
      return { success: true };
    } catch (error) {
      this.operationStats.errors++;
      logger.error('數據DeleteFailed:', { error, key });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * QueryData
   */
  public async query(query: StorageQuery): Promise<StorageItem[]> {
    try {
      const results: StorageItem[] = [];

      // 從LocalStorageQuery
      const _keys = await StorageManager.getAllKeys();

      for (const key of keys) {
        if (key.startsWith('storage_item_')) {
          const _item = await StorageManager.get<StorageItem>(key);
          if (item && this.matchesQuery(item, query)) {
            results.push(item);
          }
        }
      }

      // ApplySort和Paginate
      return this.applySortingAndPagination(results, query);
    } catch (error) {
      logger.error('查詢Failed:', { error, query });
      return [];
    }
  }

  /**
   * GetStorageStatistics
   */
  public async getStats(): Promise<StorageStats> {
    try {
      // Update統Count據
      await this.updateStats();
      return { ...this.stats };
    } catch (error) {
      logger.error('Get統計Failed:', error);
      return this.stats;
    }
  }

  /**
   * ManualSync
   */
  public async sync(): Promise<{
    success: boolean;
    syncedItems: number;
    errors: number;
  }> {
    if (this.isSyncing) {
      return { success: false, syncedItems: 0, errors: 1 };
    }

    try {
      this.isSyncing = true;
      this.emitEvent({
        type: StorageEventType.SYNC_STARTED,
        key: '',
        timestamp: new Date(),
        source: StorageLayer.CLOUD,
      });

      let syncedItems = 0;
      let errors = 0;

      // HandleSyncQueue
      while (this.syncQueue.length > 0) {
        const _item = this.syncQueue.shift()!;
        try {
          await this.syncItemToCloud(item);
          syncedItems++;
        } catch (error) {
          logger.error('同步項目Failed:', { error, key: item.key });
          errors++;
        }
      }

      this.emitEvent({
        type: StorageEventType.SYNC_COMPLETED,
        key: '',
        timestamp: new Date(),
        source: StorageLayer.CLOUD,
      });

      logger.info(`同步完成: ${syncedItems} 項目Success, ${errors} Error`);
      return { success: true, syncedItems, errors };
    } catch (error) {
      logger.error('同步Failed:', error);
      this.emitEvent({
        type: StorageEventType.SYNC_FAILED,
        key: '',
        timestamp: new Date(),
        source: StorageLayer.CLOUD,
      });
      return { success: false, syncedItems: 0, errors: 1 };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 清理Storage
   */
  public async cleanup(): Promise<{ success: boolean; itemsRemoved: number }> {
    try {
      this.emitEvent({
        type: StorageEventType.CLEANUP_STARTED,
        key: '',
        timestamp: new Date(),
        source: StorageLayer.LOCAL,
      });

      let itemsRemoved = 0;

      // 清理過期項目
      itemsRemoved += await this.cleanupExpiredItems();

      // Root據策略清理
      if (this.config.cleanup.strategy === CleanupStrategy.LRU) {
        itemsRemoved += await this.cleanupLRU();
      } else if (this.config.cleanup.strategy === CleanupStrategy.SIZE_BASED) {
        itemsRemoved += await this.cleanupBySize();
      }

      this.emitEvent({
        type: StorageEventType.CLEANUP_COMPLETED,
        key: '',
        timestamp: new Date(),
        source: StorageLayer.LOCAL,
      });

      logger.info(`清理完成: ${itemsRemoved} 項目移除`);
      return { success: true, itemsRemoved };
    } catch (error) {
      logger.error('清理Failed:', error);
      return { success: false, itemsRemoved: 0 };
    }
  }

  /**
   * SettingsCallbackFunction
   */
  public setCallbacks(callbacks: StorageCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * 銷毀Service
   */
  public async destroy(): Promise<boolean> {
    try {
      this.isInitialized = false;
      this.memoryStorage.clear();
      this.syncQueue = [];
      this.callbacks = {};
      // ResetConfigure為DefaultValue
      this.config = this.getDefaultConfig();
      this.stats = this.initializeStats();
      logger.info('MultiLayerStorageService 已銷毀');
      return true;
    } catch (error) {
      logger.error('銷毀 MultiLayerStorageService Failed:', error);
      return false;
    }
  }

  // PrivateMethod實現

  private getDefaultConfig(): StorageConfig {
    return {
      strategy: StorageStrategy.BALANCED,
      layers: [
        {
          layer: StorageLayer.MEMORY,
          enabled: true,
          priority: 1,
          maxSize: 10 * 1024 * 1024, // 10MB
          maxItems: 1000,
          ttl: 5 * 60 * 1000, // 5Minute
        },
        {
          layer: StorageLayer.CACHE,
          enabled: true,
          priority: 2,
          maxSize: 50 * 1024 * 1024, // 50MB
          maxItems: 5000,
          ttl: 30 * 60 * 1000, // 30Minute
        },
        {
          layer: StorageLayer.LOCAL,
          enabled: true,
          priority: 3,
          maxSize: 200 * 1024 * 1024, // 200MB
          maxItems: 20000,
          ttl: 7 * 24 * 60 * 60 * 1000, // 7天
        },
      ],
      compression: {
        enabled: true,
        algorithm: CompressionType.GZIP,
        minSize: 1024, // 1KB
        level: 6,
        autoCompress: true,
      },
      sync: {
        enabled: true,
        interval: 5 * 60 * 1000, // 5Minute
        batchSize: 100,
        maxRetries: 3,
        conflictResolution: ConflictResolution.LAST_MODIFIED,
        backgroundSync: true,
        syncOnStartup: true,
        syncOnNetworkChange: true,
      },
      cleanup: {
        enabled: true,
        interval: 60 * 60 * 1000, // 1Hour
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
        maxSize: 100 * 1024 * 1024, // 100MB
        strategy: CleanupStrategy.LRU,
        preserveCritical: true,
      },
      monitoring: {
        enabled: true,
        metrics: [],
        alertThresholds: {
          maxReadLatency: 100,
          maxWriteLatency: 200,
          minHitRate: 0.8,
          maxErrorRate: 0.05,
          maxStorageUsage: 0.9,
        },
        reportingInterval: 60 * 1000, // 1Minute
      },
      security: {
        encryption: {
          enabled: false,
          algorithm: 'aes-256' as any,
          keyRotation: false,
          keyRotationInterval: 24 * 60 * 60 * 1000, // 24Hour
        },
        access: {
          enabled: false,
          permissions: 'read_write' as any,
          roleBasedAccess: false,
        },
        audit: {
          enabled: true,
          logLevel: 'info' as any,
          retention: 30 * 24 * 60 * 60 * 1000, // 30天
          includeData: false,
        },
      },
    };
  }

  private initializeStats(): StorageStats {
    return {
      totalSize: 0,
      totalItems: 0,
      hitRate: 0,
      missRate: 0,
      averageReadLatency: 0,
      averageWriteLatency: 0,
      layerStats: [],
      syncStats: {
        totalSynced: 0,
        pendingSync: 0,
        syncErrors: 0,
        lastSyncTime: new Date(),
        avgSyncTime: 0,
      },
      errorStats: {
        totalErrors: 0,
        errorsByType: {},
        errorsByLayer: {} as any,
      },
    };
  }

  private async initializeLayers(): Promise<void> {
    // InitializeMemory層
    this.memoryStorage.clear();

    // 清理過期的Cache
    if (this.config.cleanup.enabled) {
      await this.cleanup();
    }

    logger.info('存儲層初始化完成');
  }

  private startBackgroundTasks(): void {
    // 定期Sync
    if (this.config.sync.enabled && this.config.sync.backgroundSync) {
      setInterval(() => {
        this.sync().catch(error => {
          logger.error('後台同步Failed:', error);
        });
      }, this.config.sync.interval);
    }

    // 定期清理
    if (this.config.cleanup.enabled) {
      setInterval(() => {
        this.cleanup().catch(error => {
          logger.error('後台清理Failed:', error);
        });
      }, this.config.cleanup.interval);
    }

    logger.info('後台任務已啟動');
  }

  private async createStorageItem<T>(
    key: string,
    data: T,
    options: StorageOptions
  ): Promise<StorageItem<T>> {
    try {
      const _now = new Date();
      const _serializedData = JSON.stringify(data);

      // 計算大小（在 Node.js 環境中使用 Buffer，在瀏覽器中使用 Blob）
      let size: number;
      try {
        if (typeof Buffer !== 'undefined') {
          size = Buffer.byteLength(serializedData, 'utf8');
        } else {
          size = new Blob([serializedData]).size;
        }
      } catch (error) {
        // 如果都Failed，使用字符串長度作為估計
        size = serializedData.length;
      }

      const metadata: StorageMetadata = {
        size,
        compressed: false,
        checksum: this.generateChecksum(serializedData),
        version: 1,
        tags: options.tags || [],
        namespace: options.namespace || 'default',
        readCount: 0,
        writeCount: 1,
        lastModifiedBy: 'system',
        schema: typeof data === 'object' ? 'json' : typeof data,
      };

      const item: StorageItem<T> = {
        id: this.generateId(),
        key,
        data,
        metadata,
        layers: [],
        priority: options.priority || DataPriority.MEDIUM,
        syncStatus: SyncStatus.PENDING,
        createdAt: now,
        updatedAt: now,
        accessedAt: now,
        expiresAt: options.ttl
          ? new Date(now.getTime() + options.ttl)
          : undefined,
      };

      logger.debug('Create存儲項目Success:', { key, size, priority: item.priority });
      return item;
    } catch (error) {
      logger.error('Create存儲項目Failed:', {
        error,
        key,
        errorMessage: (error as Error).message,
      });
      throw error;
    }
  }

  private selectStorageLayers(
    priority: DataPriority,
    preferredLayer?: StorageLayer
  ): StorageLayer[] {
    const layers: StorageLayer[] = [];

    if (preferredLayer) {
      layers.push(preferredLayer);
      return layers;
    }

    // Root據優先級和策略Select層
    switch (this.config.strategy) {
      case StorageStrategy.PERFORMANCE:
        layers.push(StorageLayer.MEMORY, StorageLayer.CACHE);
        break;
      case StorageStrategy.RELIABILITY:
        layers.push(StorageLayer.LOCAL, StorageLayer.CLOUD);
        break;
      case StorageStrategy.BALANCED:
        if (priority === DataPriority.CRITICAL) {
          layers.push(StorageLayer.MEMORY, StorageLayer.LOCAL);
        } else {
          layers.push(StorageLayer.CACHE, StorageLayer.LOCAL);
        }
        break;
      case StorageStrategy.OFFLINE_FIRST:
        layers.push(StorageLayer.LOCAL, StorageLayer.CACHE);
        break;
    }

    return layers;
  }

  private getSearchLayers(preferredLayer?: StorageLayer): StorageLayer[] {
    if (preferredLayer) {
      return [preferredLayer];
    }

    // 按性能順序Search，但優先SearchEnable的層
    const enabledLayers: StorageLayer[] = [];

    // Root據Configure策略OKSearch順序
    switch (this.config.strategy) {
      case StorageStrategy.PERFORMANCE:
        enabledLayers.push(
          StorageLayer.MEMORY,
          StorageLayer.CACHE,
          StorageLayer.LOCAL,
          StorageLayer.CLOUD
        );
        break;
      case StorageStrategy.RELIABILITY:
        enabledLayers.push(
          StorageLayer.LOCAL,
          StorageLayer.CLOUD,
          StorageLayer.CACHE,
          StorageLayer.MEMORY
        );
        break;
      case StorageStrategy.BALANCED:
        enabledLayers.push(
          StorageLayer.MEMORY,
          StorageLayer.CACHE,
          StorageLayer.LOCAL,
          StorageLayer.CLOUD
        );
        break;
      case StorageStrategy.OFFLINE_FIRST:
        enabledLayers.push(
          StorageLayer.LOCAL,
          StorageLayer.CACHE,
          StorageLayer.MEMORY,
          StorageLayer.CLOUD
        );
        break;
      default:
        enabledLayers.push(
          StorageLayer.MEMORY,
          StorageLayer.CACHE,
          StorageLayer.LOCAL,
          StorageLayer.CLOUD
        );
    }

    return enabledLayers;
  }

  private async writeToLayer<T>(
    layer: StorageLayer,
    item: StorageItem<T>
  ): Promise<void> {
    try {
      switch (layer) {
        case StorageLayer.MEMORY:
          this.memoryStorage.set(item.key, item);
          break;
        case StorageLayer.CACHE:
          const _cacheExpiry = item.expiresAt
            ? Math.max(0, item.expiresAt.getTime() - Date.now())
            : undefined;
          await CacheStorage.setCache(item.key, item, cacheExpiry);
          break;
        case StorageLayer.LOCAL:
          await StorageManager.set(item.key, item);
          break;
        case StorageLayer.CLOUD:
          // 雲端Storage實現（模擬）
          await this.simulateCloudWrite(item.key, item);
          break;
      }

      // 只有在SuccessWrite後才Add層到 item.layers
      if (!item.layers.includes(layer)) {
        item.layers.push(layer);
      }

      logger.debug(`Success寫入到 ${layer} 層:`, { key: item.key, layer });
    } catch (error) {
      logger.error(`寫入到 ${layer} 層Failed:`, {
        error,
        key: item.key,
        layer,
        errorMessage: (error as Error).message,
      });
      throw error;
    }
  }

  private async readFromLayer<T>(
    layer: StorageLayer,
    key: string
  ): Promise<StorageItem<T> | null> {
    const _storageKey = `storage_item_${key}`;

    switch (layer) {
      case StorageLayer.MEMORY:
        return (this.memoryStorage.get(storageKey) as StorageItem<T>) || null;
      case StorageLayer.CACHE:
        return CacheStorage.getCache<StorageItem<T>>(storageKey);
      case StorageLayer.LOCAL:
        return StorageManager.get<StorageItem<T>>(storageKey);
      case StorageLayer.CLOUD:
        // 雲端Storage實現（模擬）
        return this.simulateCloudRead<T>(storageKey);
      default:
        return null;
    }
  }

  private async deleteFromLayer(
    layer: StorageLayer,
    key: string
  ): Promise<void> {
    const _storageKey = `storage_item_${key}`;

    switch (layer) {
      case StorageLayer.MEMORY:
        this.memoryStorage.delete(storageKey);
        break;
      case StorageLayer.CACHE:
        await CacheStorage.removeCache(storageKey);
        break;
      case StorageLayer.LOCAL:
        await StorageManager.remove(storageKey);
        break;
      case StorageLayer.CLOUD:
        // 雲端Storage實現（模擬）
        await this.simulateCloudDelete(storageKey);
        break;
    }
  }

  private async updateAccessTime(
    key: string,
    layer: StorageLayer
  ): Promise<void> {
    try {
      const _item = await this.readFromLayer(layer, key);
      if (item) {
        item.accessedAt = new Date();
        item.metadata.readCount++;
        await this.writeToLayer(layer, item);
      }
    } catch (error) {
      logger.warn('Update訪問時間Failed:', { error, key, layer });
    }
  }

  private shouldPromoteToCache(item: StorageItem): boolean {
    // Root據訪問頻率和優先級決定YesNo提升到更快的層
    return (
      item.metadata.readCount > 5 || item.priority === DataPriority.CRITICAL
    );
  }

  private async promoteToFasterLayer(
    key: string,
    item: StorageItem,
    currentLayer: StorageLayer
  ): Promise<void> {
    try {
      if (currentLayer === StorageLayer.LOCAL) {
        await this.writeToLayer(StorageLayer.CACHE, item);
      } else if (currentLayer === StorageLayer.CACHE) {
        await this.writeToLayer(StorageLayer.MEMORY, item);
      }
    } catch (error) {
      logger.warn('緩存提升Failed:', { error, key });
    }
  }

  private addToSyncQueue(item: StorageItem): void {
    if (!this.syncQueue.find(queueItem => queueItem.key === item.key)) {
      this.syncQueue.push(item);
    }
  }

  private async syncItemToCloud(item: StorageItem): Promise<void> {
    // 模擬雲端Sync
    await new Promise(resolve => setTimeout(resolve, 100));
    item.syncStatus = SyncStatus.SYNCED;
    logger.debug(`項目已同步到雲端: ${item.key}`);
  }

  private async simulateCloudWrite<T>(
    key: string,
    item: StorageItem<T>
  ): Promise<void> {
    // 模擬雲端Write延遲
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async simulateCloudRead<T>(
    key: string
  ): Promise<StorageItem<T> | null> {
    // 模擬雲端Read延遲
    await new Promise(resolve => setTimeout(resolve, 150));
    return null; // 模擬雲端暫無Data
  }

  private async simulateCloudDelete(key: string): Promise<void> {
    // 模擬雲端Delete延遲
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private matchesQuery(item: StorageItem, query: StorageQuery): boolean {
    if (query.namespace && item.metadata.namespace !== query.namespace) {
      return false;
    }

    if (query.priority && item.priority !== query.priority) {
      return false;
    }

    if (query.tags && query.tags.length > 0) {
      const _hasMatchingTag = query.tags.some(tag =>
        item.metadata.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    if (query.createdAfter && item.createdAt < query.createdAfter) {
      return false;
    }

    if (query.createdBefore && item.createdAt > query.createdBefore) {
      return false;
    }

    return true;
  }

  private applySortingAndPagination(
    items: StorageItem[],
    query: StorageQuery
  ): StorageItem[] {
    // Sort
    if (query.sortBy) {
      items.sort((a, b) => {
        let aValue: unknown, bValue: unknown;

        switch (query.sortBy) {
          case 'created_at':
            aValue = a.createdAt.getTime();
            bValue = b.createdAt.getTime();
            break;
          case 'updated_at':
            aValue = a.updatedAt.getTime();
            bValue = b.updatedAt.getTime();
            break;
          case 'accessed_at':
            aValue = a.accessedAt.getTime();
            bValue = b.accessedAt.getTime();
            break;
          case 'size':
            aValue = a.metadata.size;
            bValue = b.metadata.size;
            break;
          default:
            return 0;
        }

        if (query.sortOrder === 'desc') {
          return bValue - aValue;
        } else {
          return aValue - bValue;
        }
      });
    }

    // Paginate
    const _offset = query.offset || 0;
    const _limit = query.limit || items.length;
    return items.slice(offset, offset + limit);
  }

  private async updateStats(): Promise<void> {
    const _totalReads = this.operationStats.reads;
    const _totalHits = this.operationStats.hits;

    this.stats.hitRate = totalReads > 0 ? totalHits / totalReads : 0;
    this.stats.missRate = 1 - this.stats.hitRate;

    // 計算總大小和項目數
    this.stats.totalItems = this.memoryStorage.size;
    this.stats.totalSize = Array.from(this.memoryStorage.values()).reduce(
      (total, item) => total + item.metadata.size,
      0
    );
  }

  private updateReadStats(latency: number): void {
    // 簡單的Move平均
    this.stats.averageReadLatency =
      this.stats.averageReadLatency * 0.9 + latency * 0.1;
  }

  private updateWriteStats(latency: number): void {
    // 簡單的Move平均
    this.stats.averageWriteLatency =
      this.stats.averageWriteLatency * 0.9 + latency * 0.1;
  }

  private async cleanupExpiredItems(): Promise<number> {
    let itemsRemoved = 0;
    const _now = new Date();

    // 清理Memory中的過期項目
    for (const [key, item] of this.memoryStorage.entries()) {
      if (item.expiresAt && item.expiresAt < now) {
        this.memoryStorage.delete(key);
        itemsRemoved++;
      }
    }

    return itemsRemoved;
  }

  private async cleanupLRU(): Promise<number> {
    let itemsRemoved = 0;

    // Get所有項目並按訪問TimeSort
    const _items = Array.from(this.memoryStorage.entries()).sort(
      ([, a], [, b]) => a.accessedAt.getTime() - b.accessedAt.getTime()
    );

    // Remove最久未使用的項目
    const _maxItems =
      this.config.layers.find(layer => layer.layer === StorageLayer.MEMORY)
        ?.maxItems || 1000;

    while (this.memoryStorage.size > maxItems && items.length > 0) {
      const [key] = items.shift()!;
      this.memoryStorage.delete(key);
      itemsRemoved++;
    }

    return itemsRemoved;
  }

  private async cleanupBySize(): Promise<number> {
    let itemsRemoved = 0;
    const _maxSize =
      this.config.layers.find(layer => layer.layer === StorageLayer.MEMORY)
        ?.maxSize || 10 * 1024 * 1024;

    let currentSize = Array.from(this.memoryStorage.values()).reduce(
      (total, item) => total + item.metadata.size,
      0
    );

    // 按大小Sort，Remove最大的項目
    const _items = Array.from(this.memoryStorage.entries()).sort(
      ([, a], [, b]) => b.metadata.size - a.metadata.size
    );

    while (currentSize > maxSize && items.length > 0) {
      const [key, item] = items.shift()!;
      if (
        item.priority !== DataPriority.CRITICAL ||
        !this.config.cleanup.preserveCritical
      ) {
        this.memoryStorage.delete(key);
        currentSize -= item.metadata.size;
        itemsRemoved++;
      }
    }

    return itemsRemoved;
  }

  private emitEvent(event: StorageEvent): void {
    // 觸發相應的Callback
    switch (event.type) {
      case StorageEventType.ITEM_CREATED:
        this.callbacks.onItemCreated?.(event);
        break;
      case StorageEventType.ITEM_UPDATED:
        this.callbacks.onItemUpdated?.(event);
        break;
      case StorageEventType.ITEM_DELETED:
        this.callbacks.onItemDeleted?.(event);
        break;
      case StorageEventType.SYNC_COMPLETED:
        this.callbacks.onSyncCompleted?.(this.stats.syncStats);
        break;
      case StorageEventType.ERROR_OCCURRED:
        // CreateErrorObject並觸發Callback
        if (this.callbacks.onError) {
          const error: StorageError = {
            code: StorageErrorCode.UNKNOWN,
            message: 'Storage error occurred',
            timestamp: event.timestamp,
          };
          this.callbacks.onError(error);
        }
        break;
    }
  }

  private generateId(): string {
    return `storage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChecksum(data: string): string {
    // 簡單的校驗和實現
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const _char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert為32位整數
    }
    return hash.toString(16);
  }

  private async shouldRejectDueToMemoryLimit(
    item: StorageItem
  ): Promise<boolean> {
    const _currentSize = Array.from(this.memoryStorage.values()).reduce(
      (total, item) => total + item.metadata.size,
      0
    );

    const _maxSize =
      this.config.layers.find(layer => layer.layer === StorageLayer.MEMORY)
        ?.maxSize || 10 * 1024 * 1024;

    return currentSize + item.metadata.size > maxSize;
  }

  private async performEmergencyCleanup(): Promise<void> {
    const _maxItems =
      this.config.layers.find(layer => layer.layer === StorageLayer.MEMORY)
        ?.maxItems || 1000;

    // 如果超過最大項目數，執Row LRU 清理
    if (this.memoryStorage.size >= maxItems) {
      await this.cleanupLRU();
    }
  }
}
