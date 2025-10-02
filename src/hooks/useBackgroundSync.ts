import { useState, useEffect, useCallback } from 'react';
// 臨時Class型定義，Await backgroundSyncManager 實現
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
const _backgroundSyncManager = {
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
  // TaskManage
  addTask: (task: Omit<SyncTask, 'id' | 'retryCount' | 'createdAt'>) => string;
  addTasks: (
    tasks: Omit<SyncTask, 'id' | 'retryCount' | 'createdAt'>[]
  ) => string[];
  removeTask: (id: string) => boolean;
  clearTasks: () => void;
  getTask: (id: string) => SyncTask | undefined;

  // SyncControl
  startSync: () => Promise<void>;
  stopAutoSync: () => void;

  // ConfigureManage
  updateConfig: (config: Partial<SyncConfig>) => void;

  // 清理和Statistics
  cleanupExpiredTasks: (maxAge?: number) => number;
  getTaskStats: () => {
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
  };

  // 便捷Method
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

  // 衝突Resolve功能
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

export const _useBackgroundSync = (): BackgroundSyncState &
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

  // UpdateStatus
  const _updateState = useCallback(() => {
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

  // AddTask
  const _addTask = useCallback(
    (task: Omit<SyncTask, 'id' | 'retryCount' | 'createdAt'>): string => {
      try {
        const _id = backgroundSyncManager.addTask(task);
        updateState();
        return id;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '添加任務Failed',
        }));
        throw error;
      }
    },
    [updateState]
  );

  // BatchAddTask
  const _addTasks = useCallback(
    (tasks: Omit<SyncTask, 'id' | 'retryCount' | 'createdAt'>[]): string[] => {
      try {
        const _ids = backgroundSyncManager.addTasks(tasks);
        updateState();
        return ids;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '批量添加任務Failed',
        }));
        throw error;
      }
    },
    [updateState]
  );

  // RemoveTask
  const _removeTask = useCallback(
    (id: string): boolean => {
      try {
        const _removed = backgroundSyncManager.removeTask(id);
        updateState();
        return removed;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '移除任務Failed',
        }));
        return false;
      }
    },
    [updateState]
  );

  // 清Empty所有Task
  const _clearTasks = useCallback(() => {
    try {
      backgroundSyncManager.clearTasks();
      updateState();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '清空任務Failed',
      }));
    }
  }, [updateState]);

  // GetTask
  const _getTask = useCallback((id: string): SyncTask | undefined => {
    return backgroundSyncManager.getTask(id);
  }, []);

  // BeginSync
  const _startSync = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await backgroundSyncManager.startSync();
      updateState();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '同步Failed',
        isLoading: false,
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [updateState]);

  // StopAutoSync
  const _stopAutoSync = useCallback(() => {
    try {
      backgroundSyncManager.stopAutoSync();
      updateState();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '停止自動同步Failed',
      }));
    }
  }, [updateState]);

  // UpdateConfigure
  const _updateConfig = useCallback(
    (config: Partial<SyncConfig>) => {
      try {
        backgroundSyncManager.updateConfig(config);
        updateState();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'UpdateConfigureFailed',
        }));
      }
    },
    [updateState]
  );

  // 清理過期Task
  const _cleanupExpiredTasks = useCallback(
    (maxAge?: number): number => {
      try {
        const _cleanedCount = backgroundSyncManager.cleanupExpiredTasks(maxAge);
        updateState();
        return cleanedCount;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '清理過期任務Failed',
        }));
        return 0;
      }
    },
    [updateState]
  );

  // GetTaskStatistics
  const _getTaskStats = useCallback(() => {
    return backgroundSyncManager.getTaskStats();
  }, []);

  // 便捷Method：Add API Task
  const _addApiTask = useCallback(
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

  // 便捷Method：AddDataTask
  const _addDataTask = useCallback(
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

  // 便捷Method：AddFileTask
  const _addFileTask = useCallback(
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

  // 便捷Method：AddNotificationTask
  const _addNotificationTask = useCallback(
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

  // 衝突Resolve功能
  const _setConflictResolutionStrategy = useCallback(
    (taskId: string, strategy: ConflictResolutionStrategy) => {
      try {
        const _success = backgroundSyncManager.setConflictResolutionStrategy(
          taskId,
          strategy
        );
        updateState();
        return success;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Settings衝突解決策略Failed',
        }));
        return false;
      }
    },
    [updateState]
  );

  const _addCustomResolver = useCallback(
    (key: string, resolver: (client: unknown, server: unknown) => any) => {
      try {
        backgroundSyncManager.addCustomResolver(key, resolver);
        updateState();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : '添加自定義解析器Failed',
        }));
      }
    },
    [updateState]
  );

  const _removeCustomResolver = useCallback(
    (key: string) => {
      try {
        const _removed = backgroundSyncManager.removeCustomResolver(key);
        updateState();
        return removed;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : '移除自定義解析器Failed',
        }));
        return false;
      }
    },
    [updateState]
  );

  const _updateConflictResolutionConfig = useCallback(
    (config: Partial<ConflictResolutionConfig>) => {
      try {
        backgroundSyncManager.updateConflictResolutionConfig(config);
        updateState();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Update衝突解決ConfigureFailed',
        }));
      }
    },
    [updateState]
  );

  const _testConflictResolution = useCallback(
    async (
      clientData: unknown,
      serverData: unknown,
      strategy: ConflictResolutionStrategy
    ) => {
      try {
        const _result = await backgroundSyncManager.testConflictResolution(
          clientData,
          serverData,
          strategy
        );
        return result;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '測試衝突解決Failed',
        }));
        throw error;
      }
    },
    [updateState]
  );

  // 定期UpdateStatus
  useEffect(() => {
    const _interval = setInterval(() => {
      updateState();
    }, 5000); // 每5SecondUpdate一次

    return () => clearInterval(interval);
  }, [updateState]);

  // NetworkStatus監聽
  useEffect(() => {
    const _handleOnline = () => {
      // NetworkRestore時AutoBeginSync
      if (state.status.pendingTasks > 0) {
        startSync();
      }
    };

    const _handleOffline = () => {
      // NetworkDisconnect時StopAutoSync
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
    // Status
    ...state,

    // Method
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
