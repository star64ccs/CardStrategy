import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  incrementalSyncManager,
  SyncItem,
} from '@/utils/incrementalSyncManager';
import {
  setSyncStatus,
  setLastSyncTime,
  setPendingChangesCount,
  setSyncError,
  setOnlineStatus,
} from '@/store/slices/syncSlice';
import { RootState } from '@/store';

export const useIncrementalSync = () => {
  const dispatch = useDispatch();
  const syncState = useSelector((state: RootState) => state.sync);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 更新 Redux store 中的同步狀態
  const updateStoreState = useCallback(() => {
    const state = incrementalSyncManager.getSyncState();
    dispatch(setLastSyncTime(state.lastSyncTime));
    dispatch(setPendingChangesCount(state.pendingChangesCount));
  }, [dispatch]);

  // 添加變更到同步隊列
  const addChange = useCallback(
    (item: Omit<SyncItem, 'timestamp' | 'version'>) => {
      incrementalSyncManager.addChange(item);
      updateStoreState();
    },
    [updateStoreState]
  );

  // 批量添加變更
  const addBatchChanges = useCallback(
    (items: Omit<SyncItem, 'timestamp' | 'version'>[]) => {
      incrementalSyncManager.addBatchChanges(items);
      updateStoreState();
    },
    [updateStoreState]
  );

  // 強制同步
  const forceSync = useCallback(async () => {
    try {
      dispatch(setSyncStatus('syncing'));
      await incrementalSyncManager.forceSync();
      updateStoreState();
    } catch (error) {
      dispatch(
        setSyncError(error instanceof Error ? error.message : '同步失敗')
      );
    }
  }, [dispatch, updateStoreState]);

  // 清除同步錯誤
  const clearError = useCallback(() => {
    dispatch(setSyncError(null));
  }, [dispatch]);

  // 設置網絡狀態監聽器
  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
      dispatch(setSyncStatus('idle'));
      // 網絡恢復時自動同步
      if (incrementalSyncManager.getPendingChangesCount() > 0) {
        forceSync();
      }
    };

    const handleOffline = () => {
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

  // 定期更新同步狀態
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      updateStoreState();
    }, 1000); // 每秒更新一次

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateStoreState]);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // 狀態
    syncStatus: syncState.status,
    lastSyncTime: syncState.lastSyncTime,
    pendingChangesCount: syncState.pendingChangesCount,
    error: syncState.error,
    isOnline: syncState.isOnline,

    // 方法
    addChange,
    addBatchChanges,
    forceSync,
    clearError,

    // 工具方法
    isSyncing: syncState.status === 'syncing',
    hasError: syncState.status === 'error',
    isOffline: syncState.status === 'offline',
    hasPendingChanges: syncState.pendingChangesCount > 0,
  };
};
