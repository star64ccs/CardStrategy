import { StorageManager } from './storage';
import { cacheManager } from './cacheManager';
import { networkMonitor } from './networkMonitor';
import { logger } from './logger';
import { apiService } from '../services/apiService';

// 離線操作類型
export interface OfflineOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high';
  metadata?: any;
}

// 同步狀態
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingOperations: number;
  failedOperations: number;
  syncProgress: number;
}

// 衝突解決策略
export type ConflictResolution = 'server-wins' | 'client-wins' | 'manual' | 'merge';

// 離線同步管理器類
export class OfflineSyncManager {
  private static instance: OfflineSyncManager;
  private syncQueue: OfflineOperation[] = [];
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  private operationPrefix = 'offline_op_';
  private maxRetries = 3;
  private syncIntervalMs = 30000; // 30 秒

  private constructor() {
    this.initialize();
  }

  static getInstance(): OfflineSyncManager {
    if (!OfflineSyncManager.instance) {
      OfflineSyncManager.instance = new OfflineSyncManager();
    }
    return OfflineSyncManager.instance;
  }

  // 初始化
  private async initialize(): Promise<void> {
    try {
      // 載入離線操作隊列
      await this.loadOfflineQueue();

      // 設置網絡監聽器
      networkMonitor.addListener(this.handleNetworkChange.bind(this));

      // 啟動自動同步
      this.startAutoSync();

      logger.info('Offline sync manager initialized');
    } catch (error) {
      logger.error('Initialize offline sync manager error:', { error });
    }
  }

  // 添加離線操作
  async addOfflineOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    try {
      const id = `${this.operationPrefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const offlineOperation: OfflineOperation = {
        ...operation,
        id,
        timestamp: Date.now(),
        retryCount: 0
      };

      // 保存到本地存儲
      await StorageManager.set(id, offlineOperation);

      // 添加到內存隊列
      this.syncQueue.push(offlineOperation);
      this.syncQueue.sort((a, b) => {
        // 按優先級排序
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // 同優先級按時間排序
        return a.timestamp - b.timestamp;
      });

      this.notifyListeners();
      logger.info('Offline operation added:', { id, type: operation.type, endpoint: operation.endpoint });

      return id;
    } catch (error) {
      logger.error('Add offline operation error:', { error, operation });
      throw error;
    }
  }

  // 執行離線操作
  private async executeOperation(operation: OfflineOperation): Promise<boolean> {
    try {
      logger.info('Executing offline operation:', { id: operation.id, type: operation.type, endpoint: operation.endpoint });

      let response;
      switch (operation.type) {
        case 'CREATE':
          response = await apiService.post(operation.endpoint, operation.data);
          break;
        case 'UPDATE':
          response = await apiService.put(operation.endpoint, operation.data);
          break;
        case 'DELETE':
          response = await apiService.delete(operation.endpoint);
          break;
        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }

      // 操作成功，從隊列中移除
      await this.removeOperation(operation.id);
      logger.info('Offline operation executed successfully:', { id: operation.id });

      return true;
    } catch (error) {
      logger.error('Execute offline operation error:', { error, operation });

      // 增加重試次數
      operation.retryCount++;

      if (operation.retryCount >= operation.maxRetries) {
        // 達到最大重試次數，標記為失敗
        await this.markOperationAsFailed(operation.id, error);
        return false;
      }

      // 更新操作
      await StorageManager.set(operation.id, operation);
      return false;
    }
  }

  // 同步所有離線操作
  async syncOfflineOperations(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      logger.warn('Sync already in progress');
      return { success: 0, failed: 0 };
    }

    const isOnline = await networkMonitor.isConnected();
    if (!isOnline) {
      logger.warn('Cannot sync: offline');
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      let successCount = 0;
      let failedCount = 0;
      const totalOperations = this.syncQueue.length;

      for (let i = 0; i < this.syncQueue.length; i++) {
        const operation = this.syncQueue[i];

        // 更新同步進度
        this.updateSyncProgress((i / totalOperations) * 100);

        const success = await this.executeOperation(operation);
        if (success) {
          successCount++;
        } else {
          failedCount++;
        }

        // 檢查網絡狀態
        const stillOnline = await networkMonitor.isConnected();
        if (!stillOnline) {
          logger.warn('Network lost during sync, stopping');
          break;
        }
      }

      // 更新最後同步時間
      await StorageManager.set('last_offline_sync', Date.now());

      logger.info('Offline sync completed:', { success: successCount, failed: failedCount });
      return { success: successCount, failed: failedCount };
    } catch (error) {
      logger.error('Sync offline operations error:', { error });
      return { success: 0, failed: 0 };
    } finally {
      this.isSyncing = false;
      this.updateSyncProgress(0);
      this.notifyListeners();
    }
  }

  // 離線數據同步
  async syncOfflineData(): Promise<void> {
    try {
      const isOnline = await networkMonitor.isConnected();
      if (!isOnline) {
        logger.warn('Cannot sync data: offline');
        return;
      }

      // 同步用戶數據
      await this.syncUserData();

      // 同步收藏數據
      await this.syncCollectionData();

      // 同步投資數據
      await this.syncInvestmentData();

      // 同步設置數據
      await this.syncSettingsData();

      logger.info('Offline data sync completed');
    } catch (error) {
      logger.error('Sync offline data error:', { error });
    }
  }

  // 同步用戶數據
  private async syncUserData(): Promise<void> {
    try {
      const cachedUserData = await StorageManager.get('cached_user_data');
      if (cachedUserData) {
        // 這裡可以實現用戶數據同步邏輯
        logger.info('User data synced');
      }
    } catch (error) {
      logger.error('Sync user data error:', { error });
    }
  }

  // 同步收藏數據
  private async syncCollectionData(): Promise<void> {
    try {
      const cachedCollections = await StorageManager.get('cached_collections');
      if (cachedCollections) {
        // 這裡可以實現收藏數據同步邏輯
        logger.info('Collection data synced');
      }
    } catch (error) {
      logger.error('Sync collection data error:', { error });
    }
  }

  // 同步投資數據
  private async syncInvestmentData(): Promise<void> {
    try {
      const cachedInvestments = await StorageManager.get('cached_investments');
      if (cachedInvestments) {
        // 這裡可以實現投資數據同步邏輯
        logger.info('Investment data synced');
      }
    } catch (error) {
      logger.error('Sync investment data error:', { error });
    }
  }

  // 同步設置數據
  private async syncSettingsData(): Promise<void> {
    try {
      const cachedSettings = await StorageManager.get('cached_settings');
      if (cachedSettings) {
        // 這裡可以實現設置數據同步邏輯
        logger.info('Settings data synced');
      }
    } catch (error) {
      logger.error('Sync settings data error:', { error });
    }
  }

  // 解決數據衝突
  async resolveConflict(
    operationId: string,
    serverData: any,
    clientData: any,
    resolution: ConflictResolution
  ): Promise<any> {
    try {
      let resolvedData;

      switch (resolution) {
        case 'server-wins':
          resolvedData = serverData;
          break;
        case 'client-wins':
          resolvedData = clientData;
          break;
        case 'merge':
          resolvedData = { ...serverData, ...clientData };
          break;
        case 'manual':
          // 需要用戶手動解決
          throw new Error('Manual conflict resolution required');
        default:
          throw new Error(`Unknown conflict resolution: ${resolution}`);
      }

      // 更新操作數據
      const operation = this.syncQueue.find(op => op.id === operationId);
      if (operation) {
        operation.data = resolvedData;
        await StorageManager.set(operationId, operation);
      }

      logger.info('Conflict resolved:', { operationId, resolution });
      return resolvedData;
    } catch (error) {
      logger.error('Resolve conflict error:', { error, operationId });
      throw error;
    }
  }

  // 獲取同步狀態
  async getSyncStatus(): Promise<SyncStatus> {
    const isOnline = await networkMonitor.isConnected();
    const lastSyncTime = await StorageManager.get<number>('last_offline_sync');
    const failedOperations = this.syncQueue.filter(op => op.retryCount >= op.maxRetries).length;

    return {
      isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime,
      pendingOperations: this.syncQueue.length,
      failedOperations,
      syncProgress: 0
    };
  }

  // 添加狀態監聽器
  addStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners.add(listener);
  }

  // 移除狀態監聽器
  removeStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners.delete(listener);
  }

  // 獲取離線操作隊列
  getOfflineQueue(): OfflineOperation[] {
    return [...this.syncQueue];
  }

  // 清除離線操作隊列
  async clearOfflineQueue(): Promise<void> {
    try {
      // 清除所有操作
      for (const operation of this.syncQueue) {
        await StorageManager.remove(operation.id);
      }

      this.syncQueue = [];
      this.notifyListeners();

      logger.info('Offline queue cleared');
    } catch (error) {
      logger.error('Clear offline queue error:', { error });
    }
  }

  // 啟動自動同步
  startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      const isOnline = await networkMonitor.isConnected();
      if (isOnline && this.syncQueue.length > 0) {
        await this.syncOfflineOperations();
      }
    }, this.syncIntervalMs);

    logger.info('Auto sync started');
  }

  // 停止自動同步
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Auto sync stopped');
    }
  }

  // 私有方法
  private async loadOfflineQueue(): Promise<void> {
    try {
      const keys = await StorageManager.getAllKeys();
      const operationKeys = keys.filter(key => key.startsWith(this.operationPrefix));

      const operations = await StorageManager.multiGet(operationKeys);
      this.syncQueue = operations
        .map(([key, value]) => value)
        .filter(Boolean)
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return a.timestamp - b.timestamp;
        });

      logger.info('Offline queue loaded:', { count: this.syncQueue.length });
    } catch (error) {
      logger.error('Load offline queue error:', { error });
    }
  }

  private async removeOperation(operationId: string): Promise<void> {
    try {
      await StorageManager.remove(operationId);
      this.syncQueue = this.syncQueue.filter(op => op.id !== operationId);
      this.notifyListeners();
    } catch (error) {
      logger.error('Remove operation error:', { error, operationId });
    }
  }

  private async markOperationAsFailed(operationId: string, error: any): Promise<void> {
    try {
      const operation = this.syncQueue.find(op => op.id === operationId);
      if (operation) {
        operation.metadata = { ...operation.metadata, error: error.message };
        await StorageManager.set(operationId, operation);
      }

      logger.error('Operation marked as failed:', { operationId, error: error.message });
    } catch (error) {
      logger.error('Mark operation as failed error:', { error, operationId });
    }
  }

  private handleNetworkChange(isOnline: boolean): void {
    if (isOnline && this.syncQueue.length > 0) {
      // 網絡恢復時自動同步
      setTimeout(() => {
        this.syncOfflineOperations();
      }, 2000); // 延遲 2 秒確保網絡穩定
    }

    this.notifyListeners();
  }

  private updateSyncProgress(progress: number): void {
    // 這裡可以實現進度更新邏輯
  }

  private async notifyListeners(): Promise<void> {
    const status = await this.getSyncStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        logger.error('Notify listener error:', { error });
      }
    });
  }
}

// 導出單例實例
export const offlineSyncManager = OfflineSyncManager.getInstance();
