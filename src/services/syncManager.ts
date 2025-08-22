import OfflineService from '../services/offlineService';

export interface SyncConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: { [key: string]: string };
  retryAttempts?: number;
  retryDelay?: number;
}

class SyncManager {
  private static instance: SyncManager;
  private syncQueue: Array<{ config: SyncConfig; data?: any; id: string }> = [];

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async syncData(config: SyncConfig, data?: any): Promise<boolean> {
    const syncId = Date.now().toString();

    if (!OfflineService.isConnected()) {
      // 離線時，將操作加入待處理隊列
      await OfflineService.addPendingAction('sync', { config, data, syncId });
      return false;
    }

    try {
      const response = await fetch(config.endpoint, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Sync error:', error);

      // 重試邏輯
      const retryAttempts = config.retryAttempts || 3;
      const retryDelay = config.retryDelay || 1000;

      for (let i = 0; i < retryAttempts; i++) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (i + 1))
        );

        try {
          const retryResponse = await fetch(config.endpoint, {
            method: config.method,
            headers: {
              'Content-Type': 'application/json',
              ...config.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
          });

          if (retryResponse.ok) {
            return true;
          }
        } catch (retryError) {
          console.error(`Retry ${i + 1} failed:`, retryError);
        }
      }

      // 所有重試都失敗，加入待處理隊列
      await OfflineService.addPendingAction('sync', { config, data, syncId });
      return false;
    }
  }

  async syncPendingData(): Promise<void> {
    if (!OfflineService.isConnected()) return;

    // 這裡可以實現批量同步邏輯
    console.log('Syncing pending data...');
  }

  getSyncQueueLength(): number {
    return this.syncQueue.length;
  }

  clearSyncQueue(): void {
    this.syncQueue = [];
  }
}

export default SyncManager.getInstance();
