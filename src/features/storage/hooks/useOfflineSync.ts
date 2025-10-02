import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  OfflineSyncConfig,
  OfflineSyncState,
} from '../services/offlineSyncService';
import { offlineSyncService } from '../services/offlineSyncService';

/**
 * 離線Sync Hook Options
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
 * 離線Sync Hook ReturnValue
 */
export interface UseOfflineSyncReturn {
  // Status
  syncState: OfflineSyncState;
  isOnline: boolean;
  isSyncing: boolean;
  pendingItemsCount: number;
  error: string | null;
  stats: unknown;

  // Method
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
 * 離線Sync Hook
 * 提供離線DataStorage和NetworkRestore時的AutoSync功能
 */
export const _useOfflineSync = (
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

  const _isInitialized = useRef(false);
  const _eventListeners = useRef<Map<string, () => void>>(new Map());

  // UpdateSyncStatus
  const _updateSyncState = useCallback(() => {
    const _state = offlineSyncService.getSyncState();
    setSyncState(state);
  }, []);

  // InitializeService
  const _initialize = useCallback(
    async (userId: string) => {
      if (isInitialized.current) {
        return;
      }

      try {
        await offlineSyncService.initialize(userId);
        isInitialized.current = true;
        updateSyncState();
      } catch (error) {
        console.error('離線同步InitializeFailed:', error);
        throw error;
      }
    },
    [updateSyncState]
  );

  // ConfigureSyncSettings
  const _configure = useCallback((config: Partial<OfflineSyncConfig>) => {
    offlineSyncService.configure(config);
  }, []);

  // AddSync項目到Queue
  const _addToSyncQueue = useCallback(
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

  // 觸發Sync
  const _triggerSync = useCallback(async () => {
    await offlineSyncService.triggerSync();
    updateSyncState();
  }, [updateSyncState]);

  // RetryFailed的項目
  const _retryFailedItems = useCallback(async () => {
    await offlineSyncService.retryFailedItems();
    updateSyncState();
  }, [updateSyncState]);

  // ClearSyncError
  const _clearError = useCallback(() => {
    offlineSyncService.clearError();
    updateSyncState();
  }, [updateSyncState]);

  // 清理過期的Sync項目
  const _cleanupExpiredItems = useCallback(
    async (maxAge?: number) => {
      await offlineSyncService.cleanupExpiredItems(maxAge);
      updateSyncState();
    },
    [updateSyncState]
  );

  // 銷毀Service
  const _destroy = useCallback(async () => {
    await offlineSyncService.destroy();
    isInitialized.current = false;
  }, []);

  // SettingsEvent監聽器
  useEffect(() => {
    const _listeners = [
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
        const _wrappedHandler = (results?: unknown) => {
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

  // 定期UpdateStatus
  useEffect(() => {
    const _interval = setInterval(() => {
      if (isInitialized.current) {
        updateSyncState();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [updateSyncState]);

  // AutoInitialize
  useEffect(() => {
    if (options.autoInitialize && options.userId && !isInitialized.current) {
      initialize(options.userId);
    }
  }, [options.autoInitialize, options.userId, initialize]);

  // ComponentUninstall時清理
  useEffect(() => {
    return () => {
      if (isInitialized.current) {
        destroy();
      }
    };
  }, [destroy]);

  return {
    // Status
    syncState,
    isOnline: syncState.isOnline,
    isSyncing: syncState.isSyncing,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    stats: syncState.stats,

    // Method
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
 * 簡化的離線Sync Hook
 */
export const _useSimpleOfflineSync = (userId: string) => {
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
 * 卡片Data離線Sync Hook
 */
export const _useCardOfflineSync = (userId: string) => {
  const { syncState, addToSyncQueue, triggerSync, clearError } = useOfflineSync(
    {
      userId,
      autoInitialize: true,
    }
  );

  const _syncCard = useCallback(
    async (
      cardId: string,
      cardData: unknown,
      operation: 'create' | 'update' | 'delete'
    ) => {
      await addToSyncQueue(`card_${cardId}`, cardData, operation, 'high');
    },
    [addToSyncQueue]
  );

  const _syncCards = useCallback(
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
 * UserSettings離線Sync Hook
 */
export const _useUserSettingsOfflineSync = (userId: string) => {
  const { syncState, addToSyncQueue, triggerSync, clearError } = useOfflineSync(
    {
      userId,
      autoInitialize: true,
    }
  );

  const _syncUserSettings = useCallback(
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
