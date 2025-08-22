import { logger } from '@/utils/logger';
import { store } from '@/store';
import { setSyncStatus, setLastSyncTime } from '@/store/slices/syncSlice';

export interface SyncItem {
  id: string;
  type: 'card' | 'collection' | 'user' | 'annotation';
  data: any;
  timestamp: number;
  version: number;
  isDeleted?: boolean;
}

export interface SyncBatch {
  id: string;
  items: SyncItem[];
  timestamp: number;
  version: number;
}

export interface SyncState {
  lastSyncTime: number;
  pendingChanges: SyncItem[];
  syncInProgress: boolean;
  error: string | null;
  version: number;
}

class IncrementalSyncManager {
  private syncState: SyncState = {
    lastSyncTime: 0,
    pendingChanges: [],
    syncInProgress: false,
    error: null,
    version: 1,
  };

  private syncQueue: SyncBatch[] = [];
  private retryAttempts = 0;
  private maxRetryAttempts = 3;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSync();
  }

  /**
   * 初始化同步管理器
   */
  private initializeSync(): void {
    try {
      // 從本地存儲恢復同步狀態
      const savedState = localStorage.getItem('syncState');
      if (savedState) {
        this.syncState = { ...this.syncState, ...JSON.parse(savedState) };
      }

      // 設置定期同步
      this.startPeriodicSync();

      // 監聽網絡狀態變化
      this.setupNetworkListeners();

      logger.info('增量同步管理器初始化完成');
    } catch (error) {
      logger.error('初始化同步管理器失敗:', error);
    }
  }

  /**
   * 添加變更到同步隊列
   */
  public addChange(item: Omit<SyncItem, 'timestamp' | 'version'>): void {
    try {
      const syncItem: SyncItem = {
        ...item,
        timestamp: Date.now(),
        version: this.syncState.version++,
      };

      this.syncState.pendingChanges.push(syncItem);
      this.saveSyncState();

      // 觸發立即同步（如果網絡可用）
      if (navigator.onLine) {
        this.triggerSync();
      }

      logger.info(`添加同步項目: ${item.type} - ${item.id}`);
    } catch (error) {
      logger.error('添加同步變更失敗:', error);
    }
  }

  /**
   * 批量添加變更
   */
  public addBatchChanges(
    items: Omit<SyncItem, 'timestamp' | 'version'>[]
  ): void {
    try {
      const syncItems: SyncItem[] = items.map((item) => ({
        ...item,
        timestamp: Date.now(),
        version: this.syncState.version++,
      }));

      this.syncState.pendingChanges.push(...syncItems);
      this.saveSyncState();

      if (navigator.onLine) {
        this.triggerSync();
      }

      logger.info(`批量添加 ${items.length} 個同步項目`);
    } catch (error) {
      logger.error('批量添加同步變更失敗:', error);
    }
  }

  /**
   * 觸發同步
   */
  public async triggerSync(): Promise<void> {
    if (this.syncState.syncInProgress || !navigator.onLine) {
      return;
    }

    try {
      this.syncState.syncInProgress = true;
      this.syncState.error = null;
      this.updateStoreSyncStatus('syncing');

      const changes = [...this.syncState.pendingChanges];
      if (changes.length === 0) {
        this.syncState.syncInProgress = false;
        this.updateStoreSyncStatus('idle');
        return;
      }

      // 創建同步批次
      const batch: SyncBatch = {
        id: `batch_${Date.now()}`,
        items: changes,
        timestamp: Date.now(),
        version: this.syncState.version++,
      };

      // 發送到服務器
      const response = await this.sendSyncBatch(batch);

      if (response.success) {
        // 同步成功，清除已同步的變更
        this.syncState.pendingChanges = this.syncState.pendingChanges.filter(
          (item) =>
            !changes.find(
              (change) =>
                change.id === item.id && change.version === item.version
            )
        );

        this.syncState.lastSyncTime = Date.now();
        this.retryAttempts = 0;

        logger.info(`同步成功，處理了 ${changes.length} 個項目`);
      } else {
        throw new Error(response.error || '同步失敗');
      }

      this.saveSyncState();
      this.updateStoreSyncStatus('idle');
    } catch (error) {
      logger.error('同步失敗:', error);
      this.handleSyncError(error);
    } finally {
      this.syncState.syncInProgress = false;
    }
  }

  /**
   * 發送同步批次到服務器
   */
  private async sendSyncBatch(
    batch: SyncBatch
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/sync/incremental', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          batch,
          lastSyncTime: this.syncState.lastSyncTime,
          clientVersion: this.syncState.version,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, ...result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
      };
    }
  }

  /**
   * 處理同步錯誤
   */
  private handleSyncError(error: any): void {
    this.syncState.error = error instanceof Error ? error.message : '同步錯誤';
    this.retryAttempts++;

    if (this.retryAttempts < this.maxRetryAttempts) {
      // 指數退避重試
      const delay = Math.pow(2, this.retryAttempts) * 1000;
      setTimeout(() => {
        this.triggerSync();
      }, delay);

      logger.warn(
        `同步失敗，${delay}ms 後重試 (${this.retryAttempts}/${this.maxRetryAttempts})`
      );
    } else {
      logger.error('同步失敗次數過多，停止重試');
      this.updateStoreSyncStatus('error');
    }
  }

  /**
   * 開始定期同步
   */
  private startPeriodicSync(): void {
    // 每5分鐘同步一次
    this.syncInterval = setInterval(
      () => {
        if (navigator.onLine && this.syncState.pendingChanges.length > 0) {
          this.triggerSync();
        }
      },
      5 * 60 * 1000
    );
  }

  /**
   * 設置網絡監聽器
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      logger.info('網絡連接恢復');
      this.syncState.error = null;
      this.updateStoreSyncStatus('idle');

      if (this.syncState.pendingChanges.length > 0) {
        this.triggerSync();
      }
    });

    window.addEventListener('offline', () => {
      logger.warn('網絡連接中斷');
      this.updateStoreSyncStatus('offline');
    });
  }

  /**
   * 保存同步狀態到本地存儲
   */
  private saveSyncState(): void {
    try {
      localStorage.setItem('syncState', JSON.stringify(this.syncState));
    } catch (error) {
      logger.error('保存同步狀態失敗:', error);
    }
  }

  /**
   * 更新 Redux store 中的同步狀態
   */
  private updateStoreSyncStatus(
    status: 'idle' | 'syncing' | 'error' | 'offline'
  ): void {
    store.dispatch(setSyncStatus(status));
    store.dispatch(setLastSyncTime(this.syncState.lastSyncTime));
  }

  /**
   * 獲取認證令牌
   */
  private getAuthToken(): string {
    const state = store.getState();
    return state.auth.token || '';
  }

  /**
   * 獲取同步狀態
   */
  public getSyncState(): SyncState {
    return { ...this.syncState };
  }

  /**
   * 獲取待同步項目數量
   */
  public getPendingChangesCount(): number {
    return this.syncState.pendingChanges.length;
  }

  /**
   * 清除所有待同步項目
   */
  public clearPendingChanges(): void {
    this.syncState.pendingChanges = [];
    this.saveSyncState();
    logger.info('清除所有待同步項目');
  }

  /**
   * 強制同步
   */
  public forceSync(): Promise<void> {
    return this.triggerSync();
  }

  /**
   * 停止同步管理器
   */
  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    logger.info('增量同步管理器已停止');
  }
}

// 創建單例實例
export const incrementalSyncManager = new IncrementalSyncManager();

// 導出類型
export type { SyncItem, SyncBatch, SyncState };
