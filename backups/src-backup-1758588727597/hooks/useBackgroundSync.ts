import { useState, useEffect, useCallback } from 'react';
// 臨時類型定義，等待 backgroundSyncManager 實現
interface SyncTask {
  id: string;
  type: string;
  url: string;
  data?: unknown;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  maxRetries?: number;
  retryDelay?: number;
  metadata?: unknown;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  createdAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface SyncStatus {
  isRunning: boolean;
  lastSync: Date | null;
  nextSync: Date | null;
  pendingTasks: number;
}

interface SyncStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingTasks: number;
}

interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  maxRetries: number;
  retryDelay: number;
}

interface ConflictResolutionStrategy {
  type: 'client-wins' | 'server-wins' | 'merge' | 'custom';
  config?: unknown;
}

interface ConflictResolutionConfig {
  defaultStrategy: ConflictResolutionStrategy;
  customResolvers: Record<string, any>;
}

interface ConflictResolution {
  resolved: boolean;
  data: unknown;
  strategy: string;
}

// 臨時實現
const backgroundSyncManager = {
  getStatus: (): SyncStatus => ({
    isRunning: false,
    lastSync: null,
    nextSync: null,
    pendingTasks: 0,
  }),
  getStats: (): SyncStats => ({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    pendingTasks: 0,
  }),
  getConfig: (): SyncConfig => ({
    autoSync: false,
    syncInterval: 5000,
    maxRetries: 3,
    retryDelay: 1000,
  }),
  getAllTasks: (): SyncTask[] => [],
  addTask: (task: unknown) => '',
  addTasks: (tasks: unknown[]) => tasks.map(() => ''),
  removeTask: (id: string) => false,
  clearTasks: () => {},
  getTask: (id: string) => undefined,
  startSync: async () => {},
  stopAutoSync: () => {},
  updateConfig: (config: unknown) => {},
  cleanupExpiredTasks: (maxAge?: number) => 0,
  getTaskStats: () => ({ byType: {}, byPriority: {}, byStatus: {} }),
  getConflictResolutionConfig: () => ({
    defaultStrategy: { type: 'client-wins' as const },
    customResolvers: {},
  }),
  setConflictResolutionStrategy: (taskId: string, strategy: unknown) => false,
  addCustomResolver: (key: string, resolver: unknown) => {},
  removeCustomResolver: (key: string) => false,
  updateConflictResolutionConfig: (config: unknown) => {},
  testConflictResolution: async (
    clientData: unknown,
    serverData: unknown,
    strategy: unknown
  ) => ({ resolved: false, data: null, strategy: '' }),
};

export interface BackgroundSyncState {
  status: SyncStatus;
  stats: SyncStats;
  config: SyncConfig;
  tasks: SyncTask[];
  isLoading: boolean;
  error: string | null;
  conflictResolutionConfig: ConflictResolutionConfig;
}

export interface BackgroundSyncActions {
  // 任務管理
  addTask: (task: Omit<SyncTask, 'id' | 'retryCount' | 'createdAt'>) => string;
  addTasks: (
    tasks: Omit<SyncTask, 'id' | 'retryCount' | 'createdAt'>[]
  ) => string[];
  removeTask: (id: string) => boolean;
  clearTasks: () => void;
  getTask: (id: string) => SyncTask | undefined;

  // 同步控制
  startSync: () => Promise<void>;
  stopAutoSync: () => void;

  // 配置管理
  updateConfig: (config: Partial<SyncConfig>) => void;

  // 清理和統計
  cleanupExpiredTasks: (maxAge?: number) => number;
  getTaskStats: () => {
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
  };

  // 便捷方法
  addApiTask: (
    url: string,
    method: string,
    data?: unknown,
    priority?: 'high' | 'medium' | 'low'
  ) => string;
  addDataTask: (
    url: string,
    data: unknown,
    priority?: 'high' | 'medium' | 'low'
  ) => string;
  addFileTask: (
    url: string,
    file: File,
    priority?: 'high' | 'medium' | 'low'
  ) => string;
  addNotificationTask: (
    url: string,
    notification: unknown,
    priority?: 'high' | 'medium' | 'low'
  ) => string;

  // 衝突解決功能
  setConflictResolutionStrategy: (
    taskId: string,
    strategy: ConflictResolutionStrategy
  ) => boolean;
  addCustomResolver: (
    key: string,
    resolver: (client: unknown, server: unknown) => any
  ) => void;
  removeCustomResolver: (key: string) => boolean;
  updateConflictResolutionConfig: (
    config: Partial<ConflictResolutionConfig>
  ) => void;
  testConflictResolution: (
    clientData: unknown,
    serverData: unknown,
    strategy: ConflictResolutionStrategy
  ) => Promise<ConflictResolution>;
}

export const useBackgroundSync = (): BackgroundSyncState &
  BackgroundSyncActions => {
  const [state, setState] = useState<BackgroundSyncState>({
    status: backgroundSyncManager.getStatus(),
    stats: backgroundSyncManager.getStats(),
    config: backgroundSyncManager.getConfig(),
    tasks: backgroundSyncManager.getAllTasks(),
    isLoading: false,
    error: null,
    conflictResolutionConfig:
      backgroundSyncManager.getConflictResolutionConfig(),
  });

  // 更新狀態
  const updateState = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: backgroundSyncManager.getStatus(),
      stats: backgroundSyncManager.getStats(),
      config: backgroundSyncManager.getConfig(),
      tasks: backgroundSyncManager.getAllTasks(),
      conflictResolutionConfig:
        backgroundSyncManager.getConflictResolutionConfig(),
    }));
  }, []);

  // 添加任務
  const addTask = useCallback(
    (task: Omit<SyncTask, 'id' | 'retryCount' | 'createdAt'>): string => {
      try {
        const id = backgroundSyncManager.addTask(task);
        updateState();
        return id;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '添加任務失敗',
        }));
        throw error;
      }
    },
    [updateState]
  );

  // 批量添加任務
  const addTasks = useCallback(
    (tasks: Omit<SyncTask, 'id' | 'retryCount' | 'createdAt'>[]): string[] => {
      try {
        const ids = backgroundSyncManager.addTasks(tasks);
        updateState();
        return ids;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '批量添加任務失敗',
        }));
        throw error;
      }
    },
    [updateState]
  );

  // 移除任務
  const removeTask = useCallback(
    (id: string): boolean => {
      try {
        const removed = backgroundSyncManager.removeTask(id);
        updateState();
        return removed;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '移除任務失敗',
        }));
        return false;
      }
    },
    [updateState]
  );

  // 清空所有任務
  const clearTasks = useCallback(() => {
    try {
      backgroundSyncManager.clearTasks();
      updateState();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '清空任務失敗',
      }));
    }
  }, [updateState]);

  // 獲取任務
  const getTask = useCallback((id: string): SyncTask | undefined => {
    return backgroundSyncManager.getTask(id);
  }, []);

  // 開始同步
  const startSync = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await backgroundSyncManager.startSync();
      updateState();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '同步失敗',
        isLoading: false,
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [updateState]);

  // 停止自動同步
  const stopAutoSync = useCallback(() => {
    try {
      backgroundSyncManager.stopAutoSync();
      updateState();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '停止自動同步失敗',
      }));
    }
  }, [updateState]);

  // 更新配置
  const updateConfig = useCallback(
    (config: Partial<SyncConfig>) => {
      try {
        backgroundSyncManager.updateConfig(config);
        updateState();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '更新配置失敗',
        }));
      }
    },
    [updateState]
  );

  // 清理過期任務
  const cleanupExpiredTasks = useCallback(
    (maxAge?: number): number => {
      try {
        const cleanedCount = backgroundSyncManager.cleanupExpiredTasks(maxAge);
        updateState();
        return cleanedCount;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '清理過期任務失敗',
        }));
        return 0;
      }
    },
    [updateState]
  );

  // 獲取任務統計
  const getTaskStats = useCallback(() => {
    return backgroundSyncManager.getTaskStats();
  }, []);

  // 便捷方法：添加 API 任務
  const addApiTask = useCallback(
    (
      url: string,
      method: string,
      data?: unknown,
      priority: 'high' | 'medium' | 'low' = 'medium'
    ): string => {
      return addTask({
        type: 'api',
        url,
        data,
        method,
        headers: {},
        body: data,
        priority,
        maxRetries: 3,
        retryDelay: 1000,
        metadata: undefined,
        status: 'pending',
      });
    },
    [addTask]
  );

  // 便捷方法：添加數據任務
  const addDataTask = useCallback(
    (
      url: string,
      data: unknown,
      priority: 'high' | 'medium' | 'low' = 'medium'
    ): string => {
      return addTask({
        type: 'data',
        url,
        data,
        method: 'POST',
        headers: {},
        body: data,
        priority,
        maxRetries: 3,
        retryDelay: 1000,
        metadata: undefined,
        status: 'pending',
      });
    },
    [addTask]
  );

  // 便捷方法：添加文件任務
  const addFileTask = useCallback(
    (
      url: string,
      file: File,
      priority: 'high' | 'medium' | 'low' = 'medium'
    ): string => {
      return addTask({
        type: 'file',
        url,
        data: { fileName: file.name, fileSize: file.size },
        method: 'POST',
        headers: {},
        body: { fileName: file.name, fileSize: file.size },
        priority,
        maxRetries: 3,
        retryDelay: 1000,
        metadata: { fileName: file.name, fileSize: file.size },
        status: 'pending',
      });
    },
    [addTask]
  );

  // 便捷方法：添加通知任務
  const addNotificationTask = useCallback(
    (
      url: string,
      notification: unknown,
      priority: 'high' | 'medium' | 'low' = 'medium'
    ): string => {
      return addTask({
        type: 'notification',
        url,
        data: notification,
        method: 'POST',
        headers: {},
        body: notification,
        priority,
        maxRetries: 3,
        retryDelay: 1000,
        metadata: undefined,
        status: 'pending',
      });
    },
    [addTask]
  );

  // 衝突解決功能
  const setConflictResolutionStrategy = useCallback(
    (taskId: string, strategy: ConflictResolutionStrategy) => {
      try {
        const success = backgroundSyncManager.setConflictResolutionStrategy(
          taskId,
          strategy
        );
        updateState();
        return success;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : '設置衝突解決策略失敗',
        }));
        return false;
      }
    },
    [updateState]
  );

  const addCustomResolver = useCallback(
    (key: string, resolver: (client: unknown, server: unknown) => any) => {
      try {
        backgroundSyncManager.addCustomResolver(key, resolver);
        updateState();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : '添加自定義解析器失敗',
        }));
      }
    },
    [updateState]
  );

  const removeCustomResolver = useCallback(
    (key: string) => {
      try {
        const removed = backgroundSyncManager.removeCustomResolver(key);
        updateState();
        return removed;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : '移除自定義解析器失敗',
        }));
        return false;
      }
    },
    [updateState]
  );

  const updateConflictResolutionConfig = useCallback(
    (config: Partial<ConflictResolutionConfig>) => {
      try {
        backgroundSyncManager.updateConflictResolutionConfig(config);
        updateState();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : '更新衝突解決配置失敗',
        }));
      }
    },
    [updateState]
  );

  const testConflictResolution = useCallback(
    async (
      clientData: unknown,
      serverData: unknown,
      strategy: ConflictResolutionStrategy
    ) => {
      try {
        const result = await backgroundSyncManager.testConflictResolution(
          clientData,
          serverData,
          strategy
        );
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '測試衝突解決失敗',
        }));
        throw error;
      }
    },
    [updateState]
  );

  // 定期更新狀態
  useEffect(() => {
    const interval = setInterval(() => {
      updateState();
    }, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [updateState]);

  // 網絡狀態監聽
  useEffect(() => {
    const handleOnline = () => {
      // 網絡恢復時自動開始同步
      if (state.status.pendingTasks > 0) {
        startSync();
      }
    };

    const handleOffline = () => {
      // 網絡斷開時停止自動同步
      stopAutoSync();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.status.pendingTasks, startSync, stopAutoSync]);

  return {
    // 狀態
    ...state,

    // 方法
    addTask,
    addTasks,
    removeTask,
    clearTasks,
    getTask,
    startSync,
    stopAutoSync,
    updateConfig,
    cleanupExpiredTasks,
    getTaskStats,
    addApiTask,
    addDataTask,
    addFileTask,
    addNotificationTask,
    setConflictResolutionStrategy,
    addCustomResolver,
    removeCustomResolver,
    updateConflictResolutionConfig,
    testConflictResolution,
  };
};
