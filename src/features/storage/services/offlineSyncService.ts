import { EventEmitter } from 'events';

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { logger } from '../../../utils/logger';
import type { SyncStats } from '../types/storage';
import { ConflictResolution } from '../types/storage';

/**
 * 離線Sync項目Interface
 */
export interface OfflineSyncItem {
  id: string;
  key: string;
  data: unknown;
  operation: 'create' | 'update' | 'delete';
  timestamp: number;
  version: number;
  deviceId: string;
  userId: string;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'normal' | 'low';
}

/**
 * 離線SyncConfigureInterface
 */
export interface OfflineSyncConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  syncInterval: number;
  conflictResolution: ConflictResolution;
  enableBackgroundSync: boolean;
  enableAutoRetry: boolean;
  enableConflictDetection: boolean;
}

/**
 * 離線SyncStatusInterface
 */
export interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingItemsCount: number;
  error: string | null;
  stats: SyncStats;
}

/**
 * 離線SyncService
 * 負責Manage離線DataStorage和NetworkRestore時的AutoSync
 */
export class OfflineSyncService extends EventEmitter {
  private static instance: OfflineSyncService;
  private syncQueue: OfflineSyncItem[] = [];
  private config: OfflineSyncConfig;
  private readonly state: OfflineSyncState;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly deviceId: string;
  private userId: string;

  private constructor() {
    super();
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      batchSize: 50,
      syncInterval: 30000, // 30Second
      conflictResolution: ConflictResolution.LAST_MODIFIED,
      enableBackgroundSync: true,
      enableAutoRetry: true,
      enableConflictDetection: true,
    };

    this.state = {
      isOnline: true,
      isSyncing: false,
      lastSyncTime: null,
      pendingItemsCount: 0,
      error: null,
      stats: {
        totalSynced: 0,
        pendingSync: 0,
        syncErrors: 0,
        lastSyncTime: new Date(),
        avgSyncTime: 0,
      },
    };

    this.deviceId = this.generateDeviceId();
    this.userId = '';
  }

  /**
   * Get單例Instance
   */
  public static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  /**
   * InitializeService
   */
  public async initialize(userId: string): Promise<void> {
    try {
      this.userId = userId;
      await this.loadSyncQueue();
      await this.setupNetworkListener();
      await this.startPeriodicSync();

      logger.info('離線同步ServiceInitializeSuccess', {
        userId,
        deviceId: this.deviceId,
        pendingItems: this.syncQueue.length,
      });

      this.emit('initialized', { userId, deviceId: this.deviceId });
    } catch (error) {
      logger.error('離線同步ServiceInitializeFailed:', error);
      throw error;
    }
  }

  /**
   * ConfigureSyncSettings
   */
  public configure(config: Partial<OfflineSyncConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('離線同步配置已更新:', this.config);
  }

  /**
   * AddSync項目到Queue
   */
  public async addToSyncQueue(
    key: string,
    data: unknown,
    operation: 'create' | 'update' | 'delete',
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<void> {
    const syncItem: OfflineSyncItem = {
      id: this.generateSyncId(),
      key,
      data,
      operation,
      timestamp: Date.now(),
      version: Date.now(),
      deviceId: this.deviceId,
      userId: this.userId,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      priority,
    };

    // Root據優先級InsertQueue
    if (priority === 'high') {
      this.syncQueue.unshift(syncItem);
    } else {
      this.syncQueue.push(syncItem);
    }

    this.state.pendingItemsCount = this.syncQueue.length;
    await this.saveSyncQueue();

    this.emit('itemAdded', syncItem);
    logger.debug('同步項目已添加到隊列:', { key, operation, priority });

    // 如果Network可用且EnableAutoSync，立即嘗試Sync
    if (this.state.isOnline && this.config.enableBackgroundSync) {
      this.triggerSync();
    }
  }

  /**
   * 觸發Sync
   */
  public async triggerSync(): Promise<void> {
    if (
      this.state.isSyncing ||
      !this.state.isOnline ||
      this.syncQueue.length === 0
    ) {
      return;
    }

    try {
      this.state.isSyncing = true;
      this.state.error = null;
      this.emit('syncStarted');

      const _startTime = Date.now();
      const _batch = this.syncQueue.slice(0, this.config.batchSize);

      logger.info(`開始同步批次，包含 ${batch.length} 個項目`);

      const _results = await this.syncBatch(batch);

      // UpdateStatisticsInformation
      const _syncTime = Date.now() - startTime;
      this.updateSyncStats(results, syncTime);

      // 從Queue中Remove已Sync的項目
      this.removeSyncedItems(batch.map(item => item.id));

      this.state.lastSyncTime = Date.now();
      this.emit('syncCompleted', results);

      logger.info('同步完成:', results);
    } catch (error) {
      this.handleSyncError(error);
    } finally {
      this.state.isSyncing = false;
    }
  }

  /**
   * GetSyncStatus
   */
  public getSyncState(): OfflineSyncState {
    return { ...this.state };
  }

  /**
   * Get待Sync項目數量
   */
  public getPendingItemsCount(): number {
    return this.syncQueue.length;
  }

  /**
   * ClearSyncError
   */
  public clearError(): void {
    this.state.error = null;
    this.emit('errorCleared');
  }

  /**
   * ManualRetryFailed的項目
   */
  public async retryFailedItems(): Promise<void> {
    const _failedItems = this.syncQueue.filter(item => item.retryCount > 0);
    if (failedItems.length === 0) {
      logger.info('沒有Failed的項目需要重試');
      return;
    }

    logger.info(`重試 ${failedItems.length} 個Failed的項目`);
    await this.triggerSync();
  }

  /**
   * 清理過期的Sync項目
   */
  public async cleanupExpiredItems(
    maxAge: number = 7 * 24 * 60 * 60 * 1000
  ): Promise<void> {
    const _cutoffTime = Date.now() - maxAge;
    const _originalCount = this.syncQueue.length;

    this.syncQueue = this.syncQueue.filter(item => item.timestamp > cutoffTime);

    const _removedCount = originalCount - this.syncQueue.length;
    if (removedCount > 0) {
      this.state.pendingItemsCount = this.syncQueue.length;
      await this.saveSyncQueue();

      logger.info(`清理了 ${removedCount} 個過期的同步項目`);
      this.emit('itemsCleaned', { removedCount });
    }
  }

  /**
   * 銷毀Service
   */
  public async destroy(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.removeAllListeners();
    logger.info('離線同步Service已銷毀');
  }

  /**
   * SettingsNetworkStatus監聽器
   */
  private async setupNetworkListener(): Promise<void> {
    const _unsubscribe = NetInfo.addEventListener(state => {
      const _wasOnline = this.state.isOnline;
      this.state.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.state.isOnline) {
        // NetworkRestore
        logger.info('網絡Connect已恢復');
        this.emit('networkRestored');

        if (this.config.enableBackgroundSync && this.syncQueue.length > 0) {
          this.triggerSync();
        }
      } else if (wasOnline && !this.state.isOnline) {
        // NetworkDisconnect
        logger.info('網絡Connect已斷開');
        this.emit('networkLost');
      }
    });

    // Get初始NetworkStatus
    try {
      const _netInfo = await NetInfo.fetch();
      this.state.isOnline = netInfo?.isConnected ?? false;
    } catch (error) {
      logger.warn('無法獲取網絡狀態，默認為離線:', error);
      this.state.isOnline = false;
    }
  }

  /**
   * Begin定期Sync
   */
  private async startPeriodicSync(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.state.isOnline && this.syncQueue.length > 0) {
        this.triggerSync();
      }
    }, this.config.syncInterval);
  }

  /**
   * Sync批次
   */
  private async syncBatch(batch: OfflineSyncItem[]): Promise<{
    success: number;
    failed: number;
    conflicts: number;
    errors: string[];
  }> {
    const _results = {
      success: 0,
      failed: 0,
      conflicts: 0,
      errors: [] as string[],
    };

    for (const item of batch) {
      try {
        const _result = await this.syncItem(item);

        if (result.success) {
          results.success++;
        } else if (result.conflict) {
          results.conflicts++;
          await this.handleConflict(item, result.serverData);
        } else {
          results.failed++;
          results.errors.push(result.error || 'Unknown error');

          if (
            this.config.enableAutoRetry &&
            item.retryCount < item.maxRetries
          ) {
            item.retryCount++;
            // 將項目Re加入Queue末尾
            this.syncQueue.push(item);
          }
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          error instanceof Error ? error.message : '未知Error'
        );
        logger.error('同步項目Failed:', { item, error });
      }
    }

    return results;
  }

  /**
   * SyncSingle項目
   */
  private async syncItem(item: OfflineSyncItem): Promise<{
    success: boolean;
    conflict?: boolean;
    serverData?: unknown;
    error?: string;
  }> {
    try {
      // 這裡應該調用實際的API
      // 目前使用模擬實現
      const _response = await this.mockApiCall(item);

      if (response.success) {
        return { success: true };
      } else if (response.conflict) {
        return {
          success: false,
          conflict: true,
          serverData: response.serverData,
        };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '同步Failed',
      };
    }
  }

  /**
   * Handle衝突
   */
  private async handleConflict(
    item: OfflineSyncItem,
    serverData: unknown
  ): Promise<void> {
    switch (this.config.conflictResolution) {
      case ConflictResolution.CLIENT_WINS:
        // Client獲勝，保持LocalData
        logger.info('衝突解決：客戶端獲勝', { key: item.key });
        break;

      case ConflictResolution.SERVER_WINS:
        // Server獲勝，UpdateLocalData
        await this.updateLocalData(item.key, serverData);
        logger.info('衝突解決：Server獲勝', { key: item.key });
        break;

      case ConflictResolution.LAST_MODIFIED:
        // 使用最後ModifyTime
        if (item.timestamp > serverData.timestamp) {
          logger.info('衝突解決：本地數據更新', { key: item.key });
        } else {
          await this.updateLocalData(item.key, serverData);
          logger.info('衝突解決：Server數據Update', { key: item.key });
        }
        break;

      case ConflictResolution.MERGE:
        // MergeData
        const _mergedData = this.mergeData(item.data, serverData);
        await this.updateLocalData(item.key, mergedData);
        logger.info('衝突解決：數據已合併', { key: item.key });
        break;

      case ConflictResolution.MANUAL:
        // ManualResolve，發出Event
        this.emit('conflictDetected', { item, serverData });
        logger.info('衝突檢測：需要手動解決', { key: item.key });
        break;
    }
  }

  /**
   * UpdateLocalData
   */
  private async updateLocalData(key: string, data: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      this.emit('localDataUpdated', { key, data });
    } catch (error) {
      logger.error('Update本地數據Failed:', { key, error });
    }
  }

  /**
   * MergeData
   */
  private mergeData(localData: unknown, serverData: unknown): unknown {
    // 簡單的深度Merge實現
    if (typeof localData !== 'object' || typeof serverData !== 'object') {
      return serverData;
    }

    const _merged = { ...localData };
    for (const key in serverData) {
      if (serverData.hasOwnProperty(key)) {
        if (typeof serverData[key] === 'object' && serverData[key] !== null) {
          merged[key] = this.mergeData(merged[key] || {}, serverData[key]);
        } else {
          merged[key] = serverData[key];
        }
      }
    }

    return merged;
  }

  /**
   * HandleSyncError
   */
  private handleSyncError(error: unknown): void {
    const _errorMessage = error instanceof Error ? error.message : '同步Failed';
    this.state.error = errorMessage;
    this.state.stats.syncErrors++;

    logger.error('同步Error:', error);
    this.emit('syncError', error);
  }

  /**
   * UpdateSyncStatistics
   */
  private updateSyncStats(results: unknown, syncTime: number): void {
    const { success, failed, conflicts } = results;

    this.state.stats.totalSynced += success;
    this.state.stats.syncErrors += failed;
    this.state.stats.lastSyncTime = new Date();

    // Update平均SyncTime
    const _totalSyncs = this.state.stats.totalSynced;
    this.state.stats.avgSyncTime =
      (this.state.stats.avgSyncTime * (totalSyncs - 1) + syncTime) / totalSyncs;
  }

  /**
   * Remove已Sync的項目
   */
  private removeSyncedItems(itemIds: string[]): void {
    this.syncQueue = this.syncQueue.filter(item => !itemIds.includes(item.id));
    this.state.pendingItemsCount = this.syncQueue.length;
    this.saveSyncQueue();
  }

  /**
   * SaveSyncQueue到LocalStorage
   */
  private async saveSyncQueue(): Promise<void> {
    try {
      const _key = `offline_sync_queue_${this.userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(this.syncQueue));
    } catch (error) {
      logger.error('保存同步隊列Failed:', error);
    }
  }

  /**
   * 從LocalStorage加載SyncQueue
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      const _key = `offline_sync_queue_${this.userId}`;
      const _data = await AsyncStorage.getItem(key);

      if (data) {
        this.syncQueue = JSON.parse(data);
        this.state.pendingItemsCount = this.syncQueue.length;
        logger.info(`加載了 ${this.syncQueue.length} 個待同步項目`);
      }
    } catch (error) {
      logger.error('加載同步隊列Failed:', error);
      this.syncQueue = [];
    }
  }

  /**
   * 生成設備ID
   */
  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成SyncID
   */
  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 模擬API調用
   */
  private async mockApiCall(item: OfflineSyncItem): Promise<{
    success: boolean;
    conflict?: boolean;
    serverData?: unknown;
    error?: string;
  }> {
    // 模擬Network延遲
    await new Promise(resolve =>
      setTimeout(resolve, 100 + Math.random() * 200)
    );

    // 模擬隨機Error
    if (Math.random() < 0.1) {
      throw new Error('網絡Error');
    }

    // 模擬衝突
    if (Math.random() < 0.05) {
      return {
        success: false,
        conflict: true,
        serverData: { ...item.data, timestamp: Date.now() - 1000 },
      };
    }

    return { success: true };
  }
}

// Export單例Instance
export const _offlineSyncService = OfflineSyncService.getInstance();
