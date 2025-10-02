import { EventEmitter } from 'events';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../../../utils/logger';
import type { SyncStats } from '../types/storage';
import { ConflictResolution } from '../types/storage';

/**
 * 增量同步項目接口
 */
export interface IncrementalSyncItem {
  id: string;
  key: string;
  data: unknown;
  operation: 'create' | 'update' | 'delete';
  timestamp: number;
  version: number;
  checksum: string;
  userId: string;
  deviceId: string;
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
  metadata: {
    dataType: string;
    changeType: 'full' | 'incremental';
    dependencies?: string[];
    conflicts?: string[];
  };
}

/**
 * 增量同步批次接口
 */
export interface IncrementalSyncBatch {
  id: string;
  items: IncrementalSyncItem[];
  timestamp: number;
  version: number;
  checksum: string;
  metadata: {
    deviceId: string;
    userId: string;
    batchSize: number;
    priority: 'high' | 'normal' | 'low';
  };
}

/**
 * 增量同步配置接口
 */
export interface IncrementalSyncConfig {
  maxBatchSize: number;
  syncInterval: number;
  retryDelay: number;
  maxRetries: number;
  conflictResolution: ConflictResolution;
  enableCompression: boolean;
  enableDeduplication: boolean;
  enableConflictDetection: boolean;
  enableIncrementalSync: boolean;
  enableFullSync: boolean;
  syncTimeout: number;
}

/**
 * 增量同步狀態接口
 */
export interface IncrementalSyncState {
  isSyncing: boolean;
  lastSyncTime: number | null;
  lastFullSyncTime: number | null;
  pendingItemsCount: number;
  error: string | null;
  stats: SyncStats;
  syncMode: 'incremental' | 'full' | 'idle';
  currentBatch: IncrementalSyncBatch | null;
}

/**
 * 增量同步服務
 * 負責高效的增量數據同步
 */
export class IncrementalSyncService extends EventEmitter {
  private static instance: IncrementalSyncService;
  private config: IncrementalSyncConfig;
  private readonly state: IncrementalSyncState;
  private syncQueue: IncrementalSyncItem[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private deviceId: string;
  private userId: string;
  private lastServerVersion = 0;

  private constructor() {
    super();
    this.config = {
      maxBatchSize: 100,
      syncInterval: 30000, // 30秒
      retryDelay: 5000,
      maxRetries: 3,
      conflictResolution: ConflictResolution.LAST_MODIFIED,
      enableCompression: true,
      enableDeduplication: true,
      enableConflictDetection: true,
      enableIncrementalSync: true,
      enableFullSync: true,
      syncTimeout: 30000,
    };

    this.state = {
      isSyncing: false,
      lastSyncTime: null,
      lastFullSyncTime: null,
      pendingItemsCount: 0,
      error: null,
      stats: {
        totalSynced: 0,
        pendingSync: 0,
        syncErrors: 0,
        lastSyncTime: new Date(),
        avgSyncTime: 0,
      },
      syncMode: 'idle',
      currentBatch: null,
    };

    this.deviceId = '';
    this.userId = '';
  }

  /**
   * 獲取單例實例
   */
  public static getInstance(): IncrementalSyncService {
    if (!IncrementalSyncService.instance) {
      IncrementalSyncService.instance = new IncrementalSyncService();
    }
    return IncrementalSyncService.instance;
  }

  /**
   * 初始化服務
   */
  public async initialize(userId: string, deviceId: string): Promise<void> {
    try {
      this.userId = userId;
      this.deviceId = deviceId;

      await this.loadSyncQueue();
      await this.loadLastServerVersion();
      await this.startPeriodicSync();

      logger.info('增量同步服務初始化成功', {
        userId,
        deviceId,
        pendingItems: this.syncQueue.length,
      });

      this.emit('initialized', { userId, deviceId });
    } catch (error) {
      logger.error('增量同步服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 配置同步設置
   */
  public configure(config: Partial<IncrementalSyncConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('增量同步配置已更新:', this.config);
  }

  /**
   * 添加同步項目
   */
  public async addSyncItem(
    key: string,
    data: unknown,
    operation: 'create' | 'update' | 'delete',
    dataType: string,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    const syncItem: IncrementalSyncItem = {
      id: this.generateSyncId(),
      key,
      data,
      operation,
      timestamp: Date.now(),
      version: Date.now(),
      checksum: this.generateChecksum(data),
      userId: this.userId,
      deviceId: this.deviceId,
      priority,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      metadata: {
        dataType,
        changeType: 'incremental',
        dependencies: [],
        conflicts: [],
      },
    };

    // 去重處理
    if (this.config.enableDeduplication) {
      const existingIndex = this.syncQueue.findIndex(
        item => item.key === key && item.operation === operation
      );
      if (existingIndex !== -1) {
        this.syncQueue[existingIndex] = syncItem;
      } else {
        this.syncQueue.push(syncItem);
      }
    } else {
      this.syncQueue.push(syncItem);
    }

    // 根據優先級排序
    this.syncQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    this.state.pendingItemsCount = this.syncQueue.length;
    await this.saveSyncQueue();

    this.emit('itemAdded', syncItem);
    logger.debug('同步項目已添加:', { key, operation, priority });

    // 如果啟用自動同步，立即嘗試同步
    if (this.config.enableIncrementalSync) {
      this.triggerSync();
    }
  }

  /**
   * 批量添加同步項目
   */
  public async addBatchSyncItems(
    items: {
      key: string;
      data: unknown;
      operation: 'create' | 'update' | 'delete';
      dataType: string;
      priority?: 'high' | 'normal' | 'low';
    }[]
  ): Promise<void> {
    const syncItems: IncrementalSyncItem[] = items.map(item => ({
      id: this.generateSyncId(),
      key: item.key,
      data: item.data,
      operation: item.operation,
      timestamp: Date.now(),
      version: Date.now(),
      checksum: this.generateChecksum(item.data),
      userId: this.userId,
      deviceId: this.deviceId,
      priority: item.priority || 'normal',
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      metadata: {
        dataType: item.dataType,
        changeType: 'incremental',
        dependencies: [],
        conflicts: [],
      },
    }));

    this.syncQueue.push(...syncItems);
    this.state.pendingItemsCount = this.syncQueue.length;
    await this.saveSyncQueue();

    this.emit('batchItemsAdded', syncItems);
    logger.info(`批量添加了 ${syncItems.length} 個同步項目`);

    if (this.config.enableIncrementalSync) {
      this.triggerSync();
    }
  }

  /**
   * 觸發同步
   */
  public async triggerSync(): Promise<void> {
    if (this.state.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    try {
      this.state.isSyncing = true;
      this.state.error = null;
      this.state.syncMode = 'incremental';
      this.emit('syncStarted');

      const startTime = Date.now();
      const batch = this.createSyncBatch();

      logger.info(`開始增量同步，批次包含 ${batch.items.length} 個項目`);

      const results = await this.syncBatch(batch);

      // 更新統計信息
      const syncTime = Date.now() - startTime;
      this.updateSyncStats(results, syncTime);

      // 從隊列中移除已同步的項目
      this.removeSyncedItems(batch.items.map(item => item.id));

      this.state.lastSyncTime = Date.now();
      this.state.syncMode = 'idle';
      this.emit('syncCompleted', results);

      logger.info('增量同步完成:', results);
    } catch (error) {
      this.handleSyncError(error);
    } finally {
      this.state.isSyncing = false;
    }
  }

  /**
   * 觸發全量同步
   */
  public async triggerFullSync(): Promise<void> {
    if (this.state.isSyncing) {
      return;
    }

    try {
      this.state.isSyncing = true;
      this.state.error = null;
      this.state.syncMode = 'full';
      this.emit('fullSyncStarted');

      const startTime = Date.now();

      logger.info('開始全量同步');

      const results = await this.performFullSync();

      const syncTime = Date.now() - startTime;
      this.updateSyncStats(results, syncTime);

      this.state.lastFullSyncTime = Date.now();
      this.state.syncMode = 'idle';
      this.emit('fullSyncCompleted', results);

      logger.info('全量同步完成:', results);
    } catch (error) {
      this.handleSyncError(error);
    } finally {
      this.state.isSyncing = false;
    }
  }

  /**
   * 獲取同步狀態
   */
  public getSyncState(): IncrementalSyncState {
    return { ...this.state };
  }

  /**
   * 獲取待同步項目數量
   */
  public getPendingItemsCount(): number {
    return this.syncQueue.length;
  }

  /**
   * 清除同步錯誤
   */
  public clearError(): void {
    this.state.error = null;
    this.emit('errorCleared');
  }

  /**
   * 重試失敗的項目
   */
  public async retryFailedItems(): Promise<void> {
    const failedItems = this.syncQueue.filter(item => item.retryCount > 0);
    if (failedItems.length === 0) {
      logger.info('沒有失敗的項目需要重試');
      return;
    }

    logger.info(`重試 ${failedItems.length} 個失敗的項目`);
    await this.triggerSync();
  }

  /**
   * 清理過期的同步項目
   */
  public async cleanupExpiredItems(
    maxAge: number = 7 * 24 * 60 * 60 * 1000
  ): Promise<void> {
    const cutoffTime = Date.now() - maxAge;
    const originalCount = this.syncQueue.length;

    this.syncQueue = this.syncQueue.filter(item => item.timestamp > cutoffTime);

    const removedCount = originalCount - this.syncQueue.length;
    if (removedCount > 0) {
      this.state.pendingItemsCount = this.syncQueue.length;
      await this.saveSyncQueue();

      logger.info(`清理了 ${removedCount} 個過期的同步項目`);
      this.emit('itemsCleaned', { removedCount });
    }
  }

  /**
   * 銷毀服務
   */
  public async destroy(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.removeAllListeners();
    logger.info('增量同步服務已銷毀');
  }

  /**
   * 開始定期同步
   */
  private async startPeriodicSync(): Promise<void> {
    this.syncInterval = setInterval(() => {
      if (this.syncQueue.length > 0) {
        this.triggerSync();
      }
    }, this.config.syncInterval);
  }

  /**
   * 創建同步批次
   */
  private createSyncBatch(): IncrementalSyncBatch {
    const items = this.syncQueue.slice(0, this.config.maxBatchSize);

    const batch: IncrementalSyncBatch = {
      id: this.generateBatchId(),
      items,
      timestamp: Date.now(),
      version: this.lastServerVersion + 1,
      checksum: this.generateBatchChecksum(items),
      metadata: {
        deviceId: this.deviceId,
        userId: this.userId,
        batchSize: items.length,
        priority: this.getBatchPriority(items),
      },
    };

    this.state.currentBatch = batch;
    return batch;
  }

  /**
   * 同步批次
   */
  private async syncBatch(batch: IncrementalSyncBatch): Promise<{
    success: number;
    failed: number;
    conflicts: number;
    errors: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      conflicts: 0,
      errors: [] as string[],
    };

    try {
      // 這裡應該調用實際的API
      const response = await this.mockBatchSync(batch);

      if (response.success) {
        results.success = batch.items.length;
        this.lastServerVersion = response.serverVersion || 0;
        await this.saveLastServerVersion();
      } else {
        results.failed = batch.items.length;
        results.errors.push(response.error || '批次同步失敗');
      }
    } catch (error) {
      results.failed = batch.items.length;
      results.errors.push(error instanceof Error ? error.message : '同步失敗');
      logger.error('批次同步失敗:', error);
    }

    return results;
  }

  /**
   * 執行全量同步
   */
  private async performFullSync(): Promise<{
    success: number;
    failed: number;
    conflicts: number;
    errors: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      conflicts: 0,
      errors: [] as string[],
    };

    try {
      // 這裡應該調用實際的全量同步API
      const response = await this.mockFullSync();

      if (response.success) {
        results.success = response.syncedItems || 0;
        this.lastServerVersion = response.serverVersion || 0;
        await this.saveLastServerVersion();
      } else {
        results.failed = 1;
        results.errors.push(response.error || '全量同步失敗');
      }
    } catch (error) {
      results.failed = 1;
      results.errors.push(
        error instanceof Error ? error.message : '全量同步失敗'
      );
      logger.error('全量同步失敗:', error);
    }

    return results;
  }

  /**
   * 處理同步錯誤
   */
  private handleSyncError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : '同步失敗';
    this.state.error = errorMessage;
    this.state.stats.syncErrors++;

    logger.error('增量同步錯誤:', error);
    this.emit('syncError', error);
  }

  /**
   * 更新同步統計
   */
  private updateSyncStats(results: unknown, syncTime: number): void {
    const { success, failed } = results;

    this.state.stats.totalSynced += success;
    this.state.stats.syncErrors += failed;
    this.state.stats.lastSyncTime = new Date();

    const totalSyncs = this.state.stats.totalSynced;
    this.state.stats.avgSyncTime =
      (this.state.stats.avgSyncTime * (totalSyncs - 1) + syncTime) / totalSyncs;
  }

  /**
   * 移除已同步的項目
   */
  private removeSyncedItems(itemIds: string[]): void {
    this.syncQueue = this.syncQueue.filter(item => !itemIds.includes(item.id));
    this.state.pendingItemsCount = this.syncQueue.length;
    this.saveSyncQueue();
  }

  /**
   * 獲取批次優先級
   */
  private getBatchPriority(
    items: IncrementalSyncItem[]
  ): 'high' | 'normal' | 'low' {
    const highPriorityCount = items.filter(
      item => item.priority === 'high'
    ).length;
    const totalCount = items.length;

    if (highPriorityCount > totalCount * 0.5) {
      return 'high';
    } else if (highPriorityCount > 0) {
      return 'normal';
    } else {
      return 'low';
    }
  }

  /**
   * 生成同步ID
   */
  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成批次ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成校驗和
   */
  private generateChecksum(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * 生成批次校驗和
   */
  private generateBatchChecksum(items: IncrementalSyncItem[]): string {
    const data = items.map(item => `${item.id}:${item.checksum}`).join('|');
    return this.generateChecksum(data);
  }

  /**
   * 保存同步隊列
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      const key = `incremental_sync_queue_${this.userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(this.syncQueue));
    } catch (error) {
      logger.error('保存同步隊列失敗:', error);
    }
  }

  /**
   * 加載同步隊列
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const key = `incremental_sync_queue_${this.userId}`;
      const data = await AsyncStorage.getItem(key);

      if (data) {
        this.syncQueue = JSON.parse(data);
        this.state.pendingItemsCount = this.syncQueue.length;
        logger.info(`加載了 ${this.syncQueue.length} 個待同步項目`);
      }
    } catch (error) {
      logger.error('加載同步隊列失敗:', error);
      this.syncQueue = [];
    }
  }

  /**
   * 保存最後服務器版本
   */
  private async saveLastServerVersion(): Promise<void> {
    try {
      const key = `last_server_version_${this.userId}`;
      await AsyncStorage.setItem(key, this.lastServerVersion.toString());
    } catch (error) {
      logger.error('保存最後服務器版本失敗:', error);
    }
  }

  /**
   * 加載最後服務器版本
   */
  private async loadLastServerVersion(): Promise<void> {
    try {
      const key = `last_server_version_${this.userId}`;
      const data = await AsyncStorage.getItem(key);

      if (data) {
        this.lastServerVersion = parseInt(data, 10);
        logger.info(`加載最後服務器版本: ${this.lastServerVersion}`);
      }
    } catch (error) {
      logger.error('加載最後服務器版本失敗:', error);
      this.lastServerVersion = 0;
    }
  }

  /**
   * 模擬批次同步
   */
  private async mockBatchSync(batch: IncrementalSyncBatch): Promise<{
    success: boolean;
    serverVersion?: number;
    error?: string;
  }> {
    // 模擬網絡延遲
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );

    // 模擬隨機錯誤
    if (Math.random() < 0.1) {
      throw new Error('網絡錯誤');
    }

    return {
      success: true,
      serverVersion: Date.now(),
    };
  }

  /**
   * 模擬全量同步
   */
  private async mockFullSync(): Promise<{
    success: boolean;
    syncedItems?: number;
    serverVersion?: number;
    error?: string;
  }> {
    // 模擬網絡延遲
    await new Promise(resolve =>
      setTimeout(resolve, 2000 + Math.random() * 3000)
    );

    // 模擬隨機錯誤
    if (Math.random() < 0.05) {
      throw new Error('全量同步失敗');
    }

    return {
      success: true,
      syncedItems: 1000,
      serverVersion: Date.now(),
    };
  }
}

// 導出單例實例
export const incrementalSyncService = IncrementalSyncService.getInstance();
