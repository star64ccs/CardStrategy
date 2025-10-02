import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  IncrementalSyncConfig,
  IncrementalSyncState,
} from '../services/incrementalSyncService';
import { incrementalSyncService } from '../services/incrementalSyncService';

/**
 * 增量Sync Hook Options
 */
export interface UseIncrementalSyncOptions {
  userId: string;
  deviceId: string;
  autoInitialize?: boolean;
  onSyncStarted?: () => void;
  onSyncCompleted?: (results: unknown) => void;
  onSyncError?: (error: unknown) => void;
  onFullSyncStarted?: () => void;
  onFullSyncCompleted?: (results: unknown) => void;
  onItemAdded?: (item: unknown) => void;
  onBatchItemsAdded?: (items: unknown[]) => void;
  onItemsCleaned?: (result: unknown) => void;
}

/**
 * 增量Sync Hook ReturnValue
 */
export interface UseIncrementalSyncReturn {
  // Status
  syncState: IncrementalSyncState;
  isSyncing: boolean;
  syncMode: 'incremental' | 'full' | 'idle';
  pendingItemsCount: number;
  error: string | null;
  stats: unknown;
  currentBatch: unknown;

  // Method
  initialize: (userId: string, deviceId: string) => Promise<void>;
  configure: (config: Partial<IncrementalSyncConfig>) => void;
  addSyncItem: (
    key: string,
    data: unknown,
    operation: 'create' | 'update' | 'delete',
    dataType: string,
    priority?: 'high' | 'normal' | 'low'
  ) => Promise<void>;
  addBatchSyncItems: (
    items: {
      key: string;
      data: unknown;
      operation: 'create' | 'update' | 'delete';
      dataType: string;
      priority?: 'high' | 'normal' | 'low';
    }[]
  ) => Promise<void>;
  triggerSync: () => Promise<void>;
  triggerFullSync: () => Promise<void>;
  retryFailedItems: () => Promise<void>;
  clearError: () => void;
  cleanupExpiredItems: (maxAge?: number) => Promise<void>;
  destroy: () => Promise<void>;
}

/**
 * 增量Sync Hook
 * 提供高效的增量DataSync功能
 */
export const _useIncrementalSync = (
  options: UseIncrementalSyncOptions
): UseIncrementalSyncReturn => {
  const [syncState, setSyncState] = useState<IncrementalSyncState>({
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
  });

  const _isInitialized = useRef(false);
  const _eventListeners = useRef<Map<string, () => void>>(new Map());

  // UpdateSyncStatus
  const _updateSyncState = useCallback(() => {
    const _state = incrementalSyncService.getSyncState();
    setSyncState(state);
  }, []);

  // InitializeService
  const _initialize = useCallback(
    async (userId: string, deviceId: string) => {
      if (isInitialized.current) {
        return;
      }

      try {
        await incrementalSyncService.initialize(userId, deviceId);
        isInitialized.current = true;
        updateSyncState();
      } catch (error) {
        console.error('增量同步InitializeFailed:', error);
        throw error;
      }
    },
    [updateSyncState]
  );

  // ConfigureSyncSettings
  const _configure = useCallback((config: Partial<IncrementalSyncConfig>) => {
    incrementalSyncService.configure(config);
  }, []);

  // AddSync項目
  const _addSyncItem = useCallback(
    async (
      key: string,
      data: unknown,
      operation: 'create' | 'update' | 'delete',
      dataType: string,
      priority: 'high' | 'normal' | 'low' = 'normal'
    ) => {
      await incrementalSyncService.addSyncItem(
        key,
        data,
        operation,
        dataType,
        priority
      );
      updateSyncState();
    },
    [updateSyncState]
  );

  // BatchAddSync項目
  const _addBatchSyncItems = useCallback(
    async (
      items: {
        key: string;
        data: unknown;
        operation: 'create' | 'update' | 'delete';
        dataType: string;
        priority?: 'high' | 'normal' | 'low';
      }[]
    ) => {
      await incrementalSyncService.addBatchSyncItems(items);
      updateSyncState();
    },
    [updateSyncState]
  );

  // 觸發Sync
  const _triggerSync = useCallback(async () => {
    await incrementalSyncService.triggerSync();
    updateSyncState();
  }, [updateSyncState]);

  // 觸發全量Sync
  const _triggerFullSync = useCallback(async () => {
    await incrementalSyncService.triggerFullSync();
    updateSyncState();
  }, [updateSyncState]);

  // RetryFailed的項目
  const _retryFailedItems = useCallback(async () => {
    await incrementalSyncService.retryFailedItems();
    updateSyncState();
  }, [updateSyncState]);

  // ClearSyncError
  const _clearError = useCallback(() => {
    incrementalSyncService.clearError();
    updateSyncState();
  }, [updateSyncState]);

  // 清理過期的Sync項目
  const _cleanupExpiredItems = useCallback(
    async (maxAge?: number) => {
      await incrementalSyncService.cleanupExpiredItems(maxAge);
      updateSyncState();
    },
    [updateSyncState]
  );

  // 銷毀Service
  const _destroy = useCallback(async () => {
    await incrementalSyncService.destroy();
    isInitialized.current = false;
  }, []);

  // SettingsEvent監聽器
  useEffect(() => {
    const _listeners = [
      { event: 'syncStarted', handler: options.onSyncStarted },
      { event: 'syncCompleted', handler: options.onSyncCompleted },
      { event: 'syncError', handler: options.onSyncError },
      { event: 'fullSyncStarted', handler: options.onFullSyncStarted },
      { event: 'fullSyncCompleted', handler: options.onFullSyncCompleted },
      { event: 'itemAdded', handler: options.onItemAdded },
      { event: 'batchItemsAdded', handler: options.onBatchItemsAdded },
      { event: 'itemsCleaned', handler: options.onItemsCleaned },
    ];

    listeners.forEach(({ event, handler }) => {
      if (handler) {
        const _wrappedHandler = (...args: unknown[]) => {
          // 調用EventHandle器
          if (handler) {
            handler(args);
          }
          updateSyncState();
        };
        incrementalSyncService.on(event, wrappedHandler);
        eventListeners.current.set(event, wrappedHandler);
      }
    });

    return () => {
      eventListeners.current.forEach((handler, event) => {
        incrementalSyncService.off(event, handler);
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
    if (
      options.autoInitialize &&
      options.userId &&
      options.deviceId &&
      !isInitialized.current
    ) {
      initialize(options.userId, options.deviceId);
    }
  }, [options.autoInitialize, options.userId, options.deviceId, initialize]);

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
    isSyncing: syncState.isSyncing,
    syncMode: syncState.syncMode,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    stats: syncState.stats,
    currentBatch: syncState.currentBatch,

    // Method
    initialize,
    configure,
    addSyncItem,
    addBatchSyncItems,
    triggerSync,
    triggerFullSync,
    retryFailedItems,
    clearError,
    cleanupExpiredItems,
    destroy,
  };
};

/**
 * 簡化的增量Sync Hook
 */
export const _useSimpleIncrementalSync = (userId: string, deviceId: string) => {
  const { syncState, addSyncItem, triggerSync, clearError } =
    useIncrementalSync({
      userId,
      deviceId,
      autoInitialize: true,
    });

  return {
    isSyncing: syncState.isSyncing,
    syncMode: syncState.syncMode,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    addSyncItem,
    triggerSync,
    clearError,
  };
};

/**
 * 卡片Data增量Sync Hook
 */
export const _useCardIncrementalSync = (userId: string, deviceId: string) => {
  const { syncState, addSyncItem, addBatchSyncItems, triggerSync, clearError } =
    useIncrementalSync({
      userId,
      deviceId,
      autoInitialize: true,
    });

  const _syncCard = useCallback(
    async (
      cardId: string,
      cardData: unknown,
      operation: 'create' | 'update' | 'delete'
    ) => {
      await addSyncItem(`card_${cardId}`, cardData, operation, 'card', 'high');
    },
    [addSyncItem]
  );

  const _syncCards = useCallback(
    async (
      cards: {
        id: string;
        data: unknown;
        operation: 'create' | 'update' | 'delete';
      }[]
    ) => {
      const _items = cards.map(card => ({
        key: `card_${card.id}`,
        data: card.data,
        operation: card.operation,
        dataType: 'card',
        priority: 'high' as const,
      }));
      await addBatchSyncItems(items);
    },
    [addBatchSyncItems]
  );

  return {
    isSyncing: syncState.isSyncing,
    syncMode: syncState.syncMode,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    syncCard,
    syncCards,
    triggerSync,
    clearError,
  };
};

/**
 * UserSettings增量Sync Hook
 */
export const _useUserSettingsIncrementalSync = (
  userId: string,
  deviceId: string
) => {
  const { syncState, addSyncItem, triggerSync, clearError } =
    useIncrementalSync({
      userId,
      deviceId,
      autoInitialize: true,
    });

  const _syncUserSettings = useCallback(
    async (
      settingsKey: string,
      settingsData: unknown,
      operation: 'create' | 'update' | 'delete'
    ) => {
      await addSyncItem(
        `user_settings_${settingsKey}`,
        settingsData,
        operation,
        'user_settings',
        'high'
      );
    },
    [addSyncItem]
  );

  return {
    isSyncing: syncState.isSyncing,
    syncMode: syncState.syncMode,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    syncUserSettings,
    triggerSync,
    clearError,
  };
};

/**
 * 收藏Data增量Sync Hook
 */
export const _useCollectionIncrementalSync = (
  userId: string,
  deviceId: string
) => {
  const { syncState, addSyncItem, addBatchSyncItems, triggerSync, clearError } =
    useIncrementalSync({
      userId,
      deviceId,
      autoInitialize: true,
    });

  const _syncCollection = useCallback(
    async (
      collectionId: string,
      collectionData: unknown,
      operation: 'create' | 'update' | 'delete'
    ) => {
      await addSyncItem(
        `collection_${collectionId}`,
        collectionData,
        operation,
        'collection',
        'normal'
      );
    },
    [addSyncItem]
  );

  const _syncCollections = useCallback(
    async (
      collections: {
        id: string;
        data: unknown;
        operation: 'create' | 'update' | 'delete';
      }[]
    ) => {
      const _items = collections.map(collection => ({
        key: `collection_${collection.id}`,
        data: collection.data,
        operation: collection.operation,
        dataType: 'collection',
        priority: 'normal' as const,
      }));
      await addBatchSyncItems(items);
    },
    [addBatchSyncItems]
  );

  return {
    isSyncing: syncState.isSyncing,
    syncMode: syncState.syncMode,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    syncCollection,
    syncCollections,
    triggerSync,
    clearError,
  };
};

/**
 * CommentData增量Sync Hook
 */
export const _useAnnotationIncrementalSync = (
  userId: string,
  deviceId: string
) => {
  const { syncState, addSyncItem, addBatchSyncItems, triggerSync, clearError } =
    useIncrementalSync({
      userId,
      deviceId,
      autoInitialize: true,
    });

  const _syncAnnotation = useCallback(
    async (
      annotationId: string,
      annotationData: unknown,
      operation: 'create' | 'update' | 'delete'
    ) => {
      await addSyncItem(
        `annotation_${annotationId}`,
        annotationData,
        operation,
        'annotation',
        'normal'
      );
    },
    [addSyncItem]
  );

  const _syncAnnotations = useCallback(
    async (
      annotations: {
        id: string;
        data: unknown;
        operation: 'create' | 'update' | 'delete';
      }[]
    ) => {
      const _items = annotations.map(annotation => ({
        key: `annotation_${annotation.id}`,
        data: annotation.data,
        operation: annotation.operation,
        dataType: 'annotation',
        priority: 'normal' as const,
      }));
      await addBatchSyncItems(items);
    },
    [addBatchSyncItems]
  );

  return {
    isSyncing: syncState.isSyncing,
    syncMode: syncState.syncMode,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    syncAnnotation,
    syncAnnotations,
    triggerSync,
    clearError,
  };
};
