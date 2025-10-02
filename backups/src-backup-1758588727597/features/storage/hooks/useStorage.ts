import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../../../store';
import {
  // 異步操作
  initializeStorageService,
  setStorageData,
  getStorageData,
  deleteStorageData,
  queryStorageData,
  getStorageStats,
  syncStorageData,
  cleanupStorage,
  setStorageStrategy,
  optimizeStorageStrategy,
  getPerformanceReport,
  getStorageRecommendations,
  predictStorageNeeds,
  destroyStorageService,

  // 同步操作
  resetStorageState,
  setStorageError,
  clearStorageError,
  setAutoOptimize,
  updateLastOperation,
  clearQueryResults,
  addRecommendation,
  clearRecommendations,

  // 選擇器
  selectStorageState,
  selectIsStorageInitialized,
  selectStorageLoading,
  selectStorageError,
  selectCurrentStrategy,
  selectStorageStats,
  selectPerformanceReport,
  selectQueryResults,
  selectQueryLoading,
  selectLastOperation,
  selectRecommendations,
  selectPredictedNeeds,
  selectAutoOptimize,
} from '../../../store/slices/storageSlice';
import type {
  StorageStrategy,
  StorageOptions,
  StorageQuery,
} from '../types/storage';
import { DataPriority, StorageLayer } from '../types/storage';

/**
 * 存儲管理 Hook
 * 提供完整的多層存儲功能和策略管理
 */
export const useStorage = () => {
  const dispatch = useDispatch<AppDispatch>();

  // 狀態選擇器
  const storageState = useSelector((state: RootState) =>
    selectStorageState(state)
  );
  const isInitialized = useSelector((state: RootState) =>
    selectIsStorageInitialized(state)
  );
  const isLoading = useSelector((state: RootState) =>
    selectStorageLoading(state)
  );
  const error = useSelector((state: RootState) => selectStorageError(state));
  const currentStrategy = useSelector((state: RootState) =>
    selectCurrentStrategy(state)
  );
  const stats = useSelector((state: RootState) => selectStorageStats(state));
  const performanceReport = useSelector((state: RootState) =>
    selectPerformanceReport(state)
  );
  const queryResults = useSelector((state: RootState) =>
    selectQueryResults(state)
  );
  const queryLoading = useSelector((state: RootState) =>
    selectQueryLoading(state)
  );
  const lastOperation = useSelector((state: RootState) =>
    selectLastOperation(state)
  );
  const recommendations = useSelector((state: RootState) =>
    selectRecommendations(state)
  );
  const predictedNeeds = useSelector((state: RootState) =>
    selectPredictedNeeds(state)
  );
  const autoOptimize = useSelector((state: RootState) =>
    selectAutoOptimize(state)
  );

  // 服務管理
  const initializeService = useCallback(
    async (config?: unknown) => {
      return dispatch(initializeStorageService(config));
    },
    [dispatch]
  );

  const destroyService = useCallback(async () => {
    return dispatch(destroyStorageService());
  }, [dispatch]);

  // 數據操作
  const setData = useCallback(
    async <T>(key: string, data: T, options?: StorageOptions) => {
      return dispatch(setStorageData({ key, data, options }));
    },
    [dispatch]
  );

  const getData = useCallback(
    async <T>(key: string, options?: StorageOptions): Promise<T | null> => {
      const result = await dispatch(getStorageData({ key, options }));
      return result.payload ? (result.payload as any).data : null;
    },
    [dispatch]
  );

  const deleteData = useCallback(
    async (key: string) => {
      return dispatch(deleteStorageData(key));
    },
    [dispatch]
  );

  const queryData = useCallback(
    async (query: StorageQuery) => {
      return dispatch(queryStorageData(query));
    },
    [dispatch]
  );

  // 統計和監控
  const refreshStats = useCallback(async () => {
    return dispatch(getStorageStats());
  }, [dispatch]);

  const sync = useCallback(async () => {
    return dispatch(syncStorageData());
  }, [dispatch]);

  const cleanup = useCallback(async () => {
    return dispatch(cleanupStorage());
  }, [dispatch]);

  // 策略管理
  const setStrategy = useCallback(
    async (strategy: StorageStrategy) => {
      return dispatch(setStorageStrategy(strategy));
    },
    [dispatch]
  );

  const optimizeStrategy = useCallback(async () => {
    return dispatch(optimizeStorageStrategy());
  }, [dispatch]);

  const getReport = useCallback(async () => {
    return dispatch(getPerformanceReport());
  }, [dispatch]);

  const getRecommendations = useCallback(
    async (params: {
      dataSize: number;
      accessFrequency: number;
      importance: DataPriority;
      isTemporary?: boolean;
    }) => {
      return dispatch(getStorageRecommendations(params));
    },
    [dispatch]
  );

  const predictNeeds = useCallback(
    async (timeHorizon?: number) => {
      return dispatch(predictStorageNeeds(timeHorizon));
    },
    [dispatch]
  );

  // 狀態管理
  const resetState = useCallback(() => {
    dispatch(resetStorageState());
  }, [dispatch]);

  const setError = useCallback(
    (error: string) => {
      dispatch(setStorageError(error));
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearStorageError());
  }, [dispatch]);

  const toggleAutoOptimize = useCallback(
    (enabled: boolean) => {
      dispatch(setAutoOptimize(enabled));
    },
    [dispatch]
  );

  const updateOperation = useCallback(
    (operation: { type: string; key: string; success: boolean }) => {
      dispatch(updateLastOperation(operation));
    },
    [dispatch]
  );

  const clearQuery = useCallback(() => {
    dispatch(clearQueryResults());
  }, [dispatch]);

  const addRec = useCallback(
    (recommendation: string) => {
      dispatch(addRecommendation(recommendation));
    },
    [dispatch]
  );

  const clearRecs = useCallback(() => {
    dispatch(clearRecommendations());
  }, [dispatch]);

  // 便捷方法

  /**
   * 智能存儲 - 根據數據特徵自動選擇最佳存儲選項
   */
  const smartStore = useCallback(
    async <T>(
      key: string,
      data: T,
      metadata?: {
        importance?: DataPriority;
        accessFrequency?: number;
        isTemporary?: boolean;
        tags?: string[];
        namespace?: string;
      }
    ) => {
      const dataSize = JSON.stringify(data).length;
      const accessFrequency = metadata?.accessFrequency || 0.5;
      const importance = metadata?.importance || DataPriority.MEDIUM;
      const isTemporary = metadata?.isTemporary || false;

      // 獲取推薦的存儲選項
      const recResult = await getRecommendations({
        dataSize,
        accessFrequency,
        importance,
        isTemporary,
      });

      const options: StorageOptions = {
        priority: importance,
        tags: metadata?.tags,
        namespace: metadata?.namespace,
        // 可以從推薦結果中提取更多選項
      };

      if (isTemporary) {
        options.ttl = 10 * 60 * 1000; // 10分鐘
      }

      return setData(key, data, options);
    },
    [setData, getRecommendations]
  );

  /**
   * 批量操作
   */
  const batchStore = useCallback(
    async <T>(
      items: {
        key: string;
        data: T;
        options?: StorageOptions;
      }[]
    ) => {
      const results = await Promise.allSettled(
        items.map(item => setData(item.key, item.data, item.options))
      );

      const successful = results.filter(
        result => result.status === 'fulfilled'
      ).length;
      const failed = results.length - successful;

      return { successful, failed, total: results.length };
    },
    [setData]
  );

  const batchRetrieve = useCallback(
    async <T>(keys: string[], options?: StorageOptions) => {
      const results = await Promise.allSettled(
        keys.map(key => getData<T>(key, options))
      );

      const data: { key: string; data: T | null; success: boolean }[] =
        keys.map((key, index) => ({
          key,
          data:
            results[index].status === 'fulfilled'
              ? (results[index] as any).value
              : null,
          success: results[index].status === 'fulfilled',
        }));

      return data;
    },
    [getData]
  );

  const batchDelete = useCallback(
    async (keys: string[]) => {
      const results = await Promise.allSettled(
        keys.map(key => deleteData(key))
      );

      const successful = results.filter(
        result => result.status === 'fulfilled'
      ).length;
      const failed = results.length - successful;

      return { successful, failed, total: results.length };
    },
    [deleteData]
  );

  /**
   * 緩存管理
   */
  const cacheData = useCallback(
    async <T>(key: string, data: T, ttl?: number) => {
      const options: StorageOptions = {
        layer: StorageLayer.CACHE,
        ttl: ttl || 30 * 60 * 1000, // 默認30分鐘
        sync: false,
      };

      return setData(key, data, options);
    },
    [setData]
  );

  const getCachedData = useCallback(
    async <T>(key: string): Promise<T | null> => {
      const options: StorageOptions = {
        layer: StorageLayer.CACHE,
      };

      return getData<T>(key, options);
    },
    [getData]
  );

  /**
   * 持久化存儲
   */
  const persistData = useCallback(
    async <T>(key: string, data: T, options?: Omit<StorageOptions, 'sync'>) => {
      const persistOptions: StorageOptions = {
        ...options,
        layer: StorageLayer.LOCAL,
        sync: true,
        priority: DataPriority.HIGH,
      };

      return setData(key, data, persistOptions);
    },
    [setData]
  );

  /**
   * 臨時存儲
   */
  const tempStore = useCallback(
    async <T>(key: string, data: T, ttl?: number) => {
      const options: StorageOptions = {
        layer: StorageLayer.MEMORY,
        ttl: ttl || 5 * 60 * 1000, // 默認5分鐘
        sync: false,
        priority: DataPriority.LOW,
      };

      return setData(key, data, options);
    },
    [setData]
  );

  /**
   * 搜索功能
   */
  const searchByNamespace = useCallback(
    async (namespace: string, limit?: number) => {
      const query: StorageQuery = {
        namespace,
        limit: limit || 100,
        sortBy: 'updated_at' as any,
        sortOrder: 'desc' as any,
      };

      return queryData(query);
    },
    [queryData]
  );

  const searchByTags = useCallback(
    async (tags: string[], limit?: number) => {
      const query: StorageQuery = {
        tags,
        limit: limit || 100,
        sortBy: 'accessed_at' as any,
        sortOrder: 'desc' as any,
      };

      return queryData(query);
    },
    [queryData]
  );

  const searchByPriority = useCallback(
    async (priority: DataPriority, limit?: number) => {
      const query: StorageQuery = {
        priority,
        limit: limit || 100,
        sortBy: 'created_at' as any,
        sortOrder: 'desc' as any,
      };

      return queryData(query);
    },
    [queryData]
  );

  /**
   * 統計輔助函數
   */
  const getHitRate = useCallback(() => {
    return stats?.hitRate || 0;
  }, [stats]);

  const getStorageUsage = useCallback(() => {
    return stats
      ? {
          totalSize: stats.totalSize,
          totalItems: stats.totalItems,
          usagePercentage: stats.totalSize / (200 * 1024 * 1024), // 假設200MB限制
        }
      : null;
  }, [stats]);

  const getPerformanceMetrics = useCallback(() => {
    return stats
      ? {
          readLatency: stats.averageReadLatency,
          writeLatency: stats.averageWriteLatency,
          hitRate: stats.hitRate,
          errorRate: stats.errorStats.totalErrors / (stats.totalItems || 1),
        }
      : null;
  }, [stats]);

  /**
   * 健康檢查
   */
  const healthCheck = useCallback(async () => {
    try {
      // 執行基本操作測試
      const testKey = `health_check_${Date.now()}`;
      const testData = { test: true, timestamp: new Date() };

      // 測試寫入
      await setData(testKey, testData);

      // 測試讀取
      const retrieved = await getData(testKey);

      // 測試刪除
      await deleteData(testKey);

      // 獲取統計
      await refreshStats();

      const isHealthy =
        retrieved !== null &&
        JSON.stringify(retrieved) === JSON.stringify(testData);

      return {
        healthy: isHealthy,
        timestamp: new Date(),
        metrics: getPerformanceMetrics(),
      };
    } catch (error) {
      return {
        healthy: false,
        timestamp: new Date(),
        error: (error as Error).message,
        metrics: null,
      };
    }
  }, [setData, getData, deleteData, refreshStats, getPerformanceMetrics]);

  return {
    // 狀態
    isInitialized,
    isLoading,
    error,
    currentStrategy,
    stats,
    performanceReport,
    queryResults,
    queryLoading,
    lastOperation,
    recommendations,
    predictedNeeds,
    autoOptimize,

    // 服務管理
    initializeService,
    destroyService,

    // 基本操作
    setData,
    getData,
    deleteData,
    queryData,

    // 統計和監控
    refreshStats,
    sync,
    cleanup,

    // 策略管理
    setStrategy,
    optimizeStrategy,
    getReport,
    getRecommendations,
    predictNeeds,

    // 狀態管理
    resetState,
    setError,
    clearError,
    toggleAutoOptimize,
    updateOperation,
    clearQuery,
    addRec,
    clearRecs,

    // 便捷方法
    smartStore,
    batchStore,
    batchRetrieve,
    batchDelete,
    cacheData,
    getCachedData,
    persistData,
    tempStore,

    // 搜索功能
    searchByNamespace,
    searchByTags,
    searchByPriority,

    // 統計輔助
    getHitRate,
    getStorageUsage,
    getPerformanceMetrics,

    // 健康檢查
    healthCheck,
  };
};
