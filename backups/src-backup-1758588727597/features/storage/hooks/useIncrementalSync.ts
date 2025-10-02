import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  IncrementalSyncConfig,
  IncrementalSyncState,
} from '../services/incrementalSyncService';
import { incrementalSyncService } from '../services/incrementalSyncService';

/**
 * 增量同步 Hook 選項
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
 * 增量同步 Hook 返回值
 */
export interface UseIncrementalSyncReturn {
  // 狀態
  syncState: IncrementalSyncState;
  isSyncing: boolean;
  syncMode: 'incremental' | 'full' | 'idle';
  pendingItemsCount: number;
  error: string | null;
  stats: unknown;
  currentBatch: unknown;

  // 方法
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
 * 增量同步 Hook
 * 提供高效的增量數據同步功能
 */
export const useIncrementalSync = (
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

  const isInitialized = useRef(false);
  const eventListeners = useRef<Map<string, () => void>>(new Map());

  // 更新同步狀態
  const updateSyncState = useCallback(() => {
    const state = incrementalSyncService.getSyncState();
    setSyncState(state);
  }, []);

  // 初始化服務
  const initialize = useCallback(
    async (userId: string, deviceId: string) => {
      if (isInitialized.current) {
        return;
      }

      try {
        await incrementalSyncService.initialize(userId, deviceId);
        isInitialized.current = true;
        updateSyncState();
      } catch (error) {
        console.error('增量同步初始化失敗:', error);
        throw error;
      }
    },
    [updateSyncState]
  );

  // 配置同步設置
  const configure = useCallback((config: Partial<IncrementalSyncConfig>) => {
    incrementalSyncService.configure(config);
  }, []);

  // 添加同步項目
  const addSyncItem = useCallback(
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

  // 批量添加同步項目
  const addBatchSyncItems = useCallback(
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

  // 觸發同步
  const triggerSync = useCallback(async () => {
    await incrementalSyncService.triggerSync();
    updateSyncState();
  }, [updateSyncState]);

  // 觸發全量同步
  const triggerFullSync = useCallback(async () => {
    await incrementalSyncService.triggerFullSync();
    updateSyncState();
  }, [updateSyncState]);

  // 重試失敗的項目
  const retryFailedItems = useCallback(async () => {
    await incrementalSyncService.retryFailedItems();
    updateSyncState();
  }, [updateSyncState]);

  // 清除同步錯誤
  const clearError = useCallback(() => {
    incrementalSyncService.clearError();
    updateSyncState();
  }, [updateSyncState]);

  // 清理過期的同步項目
  const cleanupExpiredItems = useCallback(
    async (maxAge?: number) => {
      await incrementalSyncService.cleanupExpiredItems(maxAge);
      updateSyncState();
    },
    [updateSyncState]
  );

  // 銷毀服務
  const destroy = useCallback(async () => {
    await incrementalSyncService.destroy();
    isInitialized.current = false;
  }, []);

  // 設置事件監聽器
  useEffect(() => {
    const listeners = [
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
        const wrappedHandler = (...args: unknown[]) => {
          // 調用事件處理器
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
    if (
      options.autoInitialize &&
      options.userId &&
      options.deviceId &&
      !isInitialized.current
    ) {
      initialize(options.userId, options.deviceId);
    }
  }, [options.autoInitialize, options.userId, options.deviceId, initialize]);

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
    isSyncing: syncState.isSyncing,
    syncMode: syncState.syncMode,
    pendingItemsCount: syncState.pendingItemsCount,
    error: syncState.error,
    stats: syncState.stats,
    currentBatch: syncState.currentBatch,

    // 方法
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
 * 簡化的增量同步 Hook
 */
export const useSimpleIncrementalSync = (userId: string, deviceId: string) => {
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
 * 卡片數據增量同步 Hook
 */
export const useCardIncrementalSync = (userId: string, deviceId: string) => {
  const { syncState, addSyncItem, addBatchSyncItems, triggerSync, clearError } =
    useIncrementalSync({
      userId,
      deviceId,
      autoInitialize: true,
    });

  const syncCard = useCallback(
    async (
      cardId: string,
      cardData: unknown,
      operation: 'create' | 'update' | 'delete'
    ) => {
      await addSyncItem(`card_${cardId}`, cardData, operation, 'card', 'high');
    },
    [addSyncItem]
  );

  const syncCards = useCallback(
    async (
      cards: {
        id: string;
        data: unknown;
        operation: 'create' | 'update' | 'delete';
      }[]
    ) => {
      const items = cards.map(card => ({
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
 * 用戶設置增量同步 Hook
 */
export const useUserSettingsIncrementalSync = (
  userId: string,
  deviceId: string
) => {
  const { syncState, addSyncItem, triggerSync, clearError } =
    useIncrementalSync({
      userId,
      deviceId,
      autoInitialize: true,
    });

  const syncUserSettings = useCallback(
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
 * 收藏數據增量同步 Hook
 */
export const useCollectionIncrementalSync = (
  userId: string,
  deviceId: string
) => {
  const { syncState, addSyncItem, addBatchSyncItems, triggerSync, clearError } =
    useIncrementalSync({
      userId,
      deviceId,
      autoInitialize: true,
    });

  const syncCollection = useCallback(
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

  const syncCollections = useCallback(
    async (
      collections: {
        id: string;
        data: unknown;
        operation: 'create' | 'update' | 'delete';
      }[]
    ) => {
      const items = collections.map(collection => ({
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
 * 註釋數據增量同步 Hook
 */
export const useAnnotationIncrementalSync = (
  userId: string,
  deviceId: string
) => {
  const { syncState, addSyncItem, addBatchSyncItems, triggerSync, clearError } =
    useIncrementalSync({
      userId,
      deviceId,
      autoInitialize: true,
    });

  const syncAnnotation = useCallback(
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

  const syncAnnotations = useCallback(
    async (
      annotations: {
        id: string;
        data: unknown;
        operation: 'create' | 'update' | 'delete';
      }[]
    ) => {
      const items = annotations.map(annotation => ({
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
