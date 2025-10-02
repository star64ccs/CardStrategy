import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  OfflineSyncConfig,
  OfflineSyncState,
} from '../services/offlineSyncService';
import { offlineSyncService } from '../services/offlineSyncService';

/**
 * 離線同步 Hook 選項
 */
export interface UseOfflineSyncOptions {
  userId: string;
  autoInitialize?: boolean;
  onSyncStarted?: () => void;
  onSyncCompleted?: (results: unknown) => void;
  onSyncError?: (error: unknown) => void;
  onNetworkRestored?: () => void;
  onNetworkLost?: () => void;
  onItemAdded?: (item: unknown) => void;
  onConflictDetected?: (conflict: unknown) => void;
}

/**
 * 離線同步 Hook 返回值
 */
export interface UseOfflineSyncReturn {
  // 狀態
  syncState: OfflineSyncState;
  isOnline: boolean;
  isSyncing: boolean;
  pendingItemsCount: number;
  error: string | null;
  stats: unknown;

  // 方法
  initialize: (userId: string) => Promise<void>;
  configure: (config: Partial<OfflineSyncConfig>) => void;
  addToSyncQueue: (
    key: string,
    data: unknown,
    operation: 'create' | 'update' | 'delete',
    priority?: 'high' | 'normal' | 'low'
  ) => Promise<void>;
  triggerSync: () => Promise<void>;
  retryFailedItems: () => Promise<void>;
  clearError: () => void;
  cleanupExpiredItems: (maxAge?: number) => Promise<void>;
  destroy: () => Promise<void>;
}

/**
 * 離線同步 Hook
 * 提供離線數據存儲和網絡恢復時的自動同步功能
 */
export const useOfflineSync = (
  options: UseOfflineSyncOptions
): UseOfflineSyncReturn => {
  const [syncState, setSyncState] = useState<OfflineSyncState>({
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
  });

  const isInitialized = useRef(false);
  const eventListeners = useRef<Map<string, () => void>>(new Map());

  // 更新同步狀態
  const updateSyncState = useCallback(() => {
    const state = offlineSyncService.getSyncState();
    setSyncState(state);
  }, []);

  // 初始化服務
  const initialize = useCallback(
    async (userId: string) => {
      if (isInitialized.current) {
        return;
      }

      try {
        await offlineSyncService.initialize(userId);
        isInitialized.current = true;
        updateSyncState();
      } catch (error) {
        console.error('離線同步初始化失敗:', error);
        throw error;
      }
    },
    [updateSyncState]
  );

  // 配置同步設置
  const configure = useCallback((config: Partial<OfflineSyncConfig>) => {
    offlineSyncService.configure(config);
  }, []);

  // 添加同步項目到隊列
  const addToSyncQueue = useCallback(
    async (
      key: string,
      data: unknown,
      operation: 'create' | 'update' | 'delete',
      priority: 'high' | 'normal' | 'low' = 'normal'
    ) => {
      await offlineSyncService.addToSyncQueue(key, data, operation, priority);
      updateSyncState();
    },
    [updateSyncState]
  );

  // 觸發同步
  const triggerSync = useCallback(async () => {
    await offlineSyncService.triggerSync();
    updateSyncState();
  }, [updateSyncState]);

  // 重試失敗的項目
  const retryFailedItems = useCallback(async () => {
    await offlineSyncService.retryFailedItems();
    updateSyncState();
  }, [updateSyncState]);

  // 清除同步錯誤
  const clearError = useCallback(() => {
    offlineSyncService.clearError();
    updateSyncState();
  }, [updateSyncState]);

  // 清理過期的同步項目
  const cleanupExpiredItems = useCallback(
    async (maxAge?: number) => {
      await offlineSyncService.cleanupExpiredItems(maxAge);
      updateSyncState();
    },
    [updateSyncState]
  );

  // 銷毀服務
  const destroy = useCallback(async () => {
    await offlineSyncService.destroy();
    isInitialized.current = false;
  }, []);

  // 設置事件監聽器
  useEffect(() => {
    const listeners = [
      { event: 'syncStarted', handler: options.onSyncStarted },
      { event: 'syncCompleted', handler: options.onSyncCompleted },
      { event: 'syncError', handler: options.onSyncError },
      { event: 'networkRestored', handler: options.onNetworkRestored },
      { event: 'networkLost', handler: options.onNetworkLost },
      { event: 'itemAdded', handler: options.onItemAdded },
      { event: 'conflictDetected', handler: options.onConflictDetected },
    ];

    listeners.forEach(({ event, handler }) => {
      if (handler) {
        const wrappedHandler = (results?: unknown) => {
          handler(results);
          updateSyncState();
        };
        offlineSyncService.on(event, wrappedHandler);
        eventListeners.current.set(event, wrappedHandler);
      }
    });

    return () => {
      eventListeners.current.forEach((handler, event) => {
        offlineSyncService.off(event, handler);
      });
      eventListeners.current.clear();
    };
  }, [options, updateSyncState]);

  // 定期更新狀態
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInitialized.current) {
        updateSyncState();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [updateSyncState]);

  // 自動初始化
  useEffect(() => {
    if (options.autoInitialize && options.userId && !isInitialized.current) {
      initialize(options.userId);
    }
  }, [options.autoInitialize, options.userId, initialize]);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      if (isInitialized.current) {
        destroy();
      }
    };
  }, [destroy]);

  return {
    // 狀態
    syncState,
    isOnline: syncState.isOnline,
    isSyncing: syncState.isSyncing,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    stats: syncState.stats,

    // 方法
    initialize,
    configure,
    addToSyncQueue,
    triggerSync,
    retryFailedItems,
    clearError,
    cleanupExpiredItems,
    destroy,
  };
};

/**
 * 簡化的離線同步 Hook
 */
export const useSimpleOfflineSync = (userId: string) => {
  const { syncState, addToSyncQueue, triggerSync, clearError } = useOfflineSync(
    {
      userId,
      autoInitialize: true,
    }
  );

  return {
    isOnline: syncState.isOnline,
    isSyncing: syncState.isSyncing,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    addToSyncQueue,
    triggerSync,
    clearError,
  };
};

/**
 * 卡片數據離線同步 Hook
 */
export const useCardOfflineSync = (userId: string) => {
  const { syncState, addToSyncQueue, triggerSync, clearError } = useOfflineSync(
    {
      userId,
      autoInitialize: true,
    }
  );

  const syncCard = useCallback(
    async (
      cardId: string,
      cardData: unknown,
      operation: 'create' | 'update' | 'delete'
    ) => {
      await addToSyncQueue(`card_${cardId}`, cardData, operation, 'high');
    },
    [addToSyncQueue]
  );

  const syncCards = useCallback(
    async (
      cards: {
        id: string;
        data: unknown;
        operation: 'create' | 'update' | 'delete';
      }[]
    ) => {
      for (const card of cards) {
        await syncCard(card.id, card.data, card.operation);
      }
    },
    [syncCard]
  );

  return {
    isOnline: syncState.isOnline,
    isSyncing: syncState.isSyncing,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    syncCard,
    syncCards,
    triggerSync,
    clearError,
  };
};

/**
 * 用戶設置離線同步 Hook
 */
export const useUserSettingsOfflineSync = (userId: string) => {
  const { syncState, addToSyncQueue, triggerSync, clearError } = useOfflineSync(
    {
      userId,
      autoInitialize: true,
    }
  );

  const syncUserSettings = useCallback(
    async (
      settingsKey: string,
      settingsData: unknown,
      operation: 'create' | 'update' | 'delete'
    ) => {
      await addToSyncQueue(
        `user_settings_${settingsKey}`,
        settingsData,
        operation,
        'high'
      );
    },
    [addToSyncQueue]
  );

  return {
    isOnline: syncState.isOnline,
    isSyncing: syncState.isSyncing,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    syncUserSettings,
    triggerSync,
    clearError,
  };
};
