import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// 臨時Class型定義
interface SyncItem {
  id: string;
  type: string;
  data: unknown;
  timestamp: Date;
  version: number;
}

// 臨時實現
const _incrementalSyncManager = {
  getSyncState: () => ({ lastSyncTime: null, pendingChangesCount: 0 }),
  addChange: (item: unknown) => {},
  addBatchChanges: (items: unknown[]) => {},
  forceSync: async () => {},
  getPendingChangesCount: () => 0,
};

// 臨時 Redux actions
const _setSyncStatus = (status: string) => ({
  type: 'SET_SYNC_STATUS',
  payload: status,
});
const _setLastSyncTime = (time: Date | null) => ({
  type: 'SET_LAST_SYNC_TIME',
  payload: time,
});
const _setPendingChangesCount = (count: number) => ({
  type: 'SET_PENDING_CHANGES_COUNT',
  payload: count,
});
const _setSyncError = (error: string | null) => ({
  type: 'SET_SYNC_ERROR',
  payload: error,
});
const _setOnlineStatus = (status: boolean) => ({
  type: 'SET_ONLINE_STATUS',
  payload: status,
});

export const _useIncrementalSync = () => {
  const _dispatch = useDispatch();
  const _syncState = {
    status: 'idle',
    lastSyncTime: null,
    pendingChangesCount: 0,
    error: null,
    isOnline: true,
  };
  const _intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update Redux store 中的SyncStatus
  const _updateStoreState = useCallback(() => {
    const _state = incrementalSyncManager.getSyncState();
    dispatch(setLastSyncTime(state.lastSyncTime));
    dispatch(setPendingChangesCount(state.pendingChangesCount));
  }, [dispatch]);

  // Add變更到SyncQueue
  const _addChange = useCallback(
    (item: Omit<SyncItem, 'timestamp' | 'version'>) => {
      incrementalSyncManager.addChange(item);
      updateStoreState();
    },
    [updateStoreState]
  );

  // BatchAdd變更
  const _addBatchChanges = useCallback(
    (items: Omit<SyncItem, 'timestamp' | 'version'>[]) => {
      incrementalSyncManager.addBatchChanges(items);
      updateStoreState();
    },
    [updateStoreState]
  );

  // ForceSync
  const _forceSync = useCallback(async () => {
    try {
      dispatch(setSyncStatus('syncing'));
      await incrementalSyncManager.forceSync();
      updateStoreState();
    } catch (error) {
      dispatch(
        setSyncError(error instanceof Error ? error.message : '同步Failed')
      );
    }
  }, [dispatch, updateStoreState]);

  // ClearSyncError
  const _clearError = useCallback(() => {
    dispatch(setSyncError(null));
  }, [dispatch]);

  // SettingsNetworkStatus監聽器
  useEffect(() => {
    const _handleOnline = () => {
      dispatch(setOnlineStatus(true));
      dispatch(setSyncStatus('idle'));
      // NetworkRestore時AutoSync
      if (incrementalSyncManager.getPendingChangesCount() > 0) {
        forceSync();
      }
    };

    const _handleOffline = () => {
      dispatch(setOnlineStatus(false));
      dispatch(setSyncStatus('offline'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, forceSync]);

  // 定期UpdateSyncStatus
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      updateStoreState();
    }, 1000); // 每SecondUpdate一次

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateStoreState]);

  // ComponentUninstall時清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // Status
    syncStatus: syncState.status,
    lastSyncTime: syncState.lastSyncTime,
    pendingChangesCount: syncState.pendingChangesCount,
    error: syncState.error,
    isOnline: syncState.isOnline,

    // Method
    addChange,
    addBatchChanges,
    forceSync,
    clearError,

    // ToolMethod
    isSyncing: syncState.status === 'syncing',
    hasError: syncState.status === 'error',
    isOffline: syncState.status === 'offline',
    hasPendingChanges: syncState.pendingChangesCount > 0,
  };
};
