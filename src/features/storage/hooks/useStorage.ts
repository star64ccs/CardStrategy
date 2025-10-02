import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '../../../store';
import {
  // AsyncOperation
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

  // SyncOperation
  resetStorageState,
  setStorageError,
  clearStorageError,
  setAutoOptimize,
  updateLastOperation,
  clearQueryResults,
  addRecommendation,
  clearRecommendations,

  // Select器
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
 * StorageManage Hook
 * 提供完整的多層Storage功能和策略Manage
 */
export const _useStorage = () => {
  const _dispatch = useDispatch<AppDispatch>();

  // StatusSelect器
  const _storageState = useSelector((state: RootState) =>
    selectStorageState(state)
  );
  const _isInitialized = useSelector((state: RootState) =>
    selectIsStorageInitialized(state)
  );
  const _isLoading = useSelector((state: RootState) =>
    selectStorageLoading(state)
  );
  const _error = useSelector((state: RootState) => selectStorageError(state));
  const _currentStrategy = useSelector((state: RootState) =>
    selectCurrentStrategy(state)
  );
  const _stats = useSelector((state: RootState) => selectStorageStats(state));
  const _performanceReport = useSelector((state: RootState) =>
    selectPerformanceReport(state)
  );
  const _queryResults = useSelector((state: RootState) =>
    selectQueryResults(state)
  );
  const _queryLoading = useSelector((state: RootState) =>
    selectQueryLoading(state)
  );
  const _lastOperation = useSelector((state: RootState) =>
    selectLastOperation(state)
  );
  const _recommendations = useSelector((state: RootState) =>
    selectRecommendations(state)
  );
  const _predictedNeeds = useSelector((state: RootState) =>
    selectPredictedNeeds(state)
  );
  const _autoOptimize = useSelector((state: RootState) =>
    selectAutoOptimize(state)
  );

  // ServiceManage
  const _initializeService = useCallback(
    async (config?: unknown) => {
      return dispatch(initializeStorageService(config));
    },
    [dispatch]
  );

  const _destroyService = useCallback(async () => {
    return dispatch(destroyStorageService());
  }, [dispatch]);

  // DataOperation
  const _setData = useCallback(
    async <T>(key: string, data: T, options?: StorageOptions) => {
      return dispatch(setStorageData({ key, data, options }));
    },
    [dispatch]
  );

  const _getData = useCallback(
    async <T>(key: string, options?: StorageOptions): Promise<T | null> => {
      const _result = await dispatch(getStorageData({ key, options }));
      return result.payload ? (result.payload as any).data : null;
    },
    [dispatch]
  );

  const _deleteData = useCallback(
    async (key: string) => {
      return dispatch(deleteStorageData(key));
    },
    [dispatch]
  );

  const _queryData = useCallback(
    async (query: StorageQuery) => {
      return dispatch(queryStorageData(query));
    },
    [dispatch]
  );

  // Statistics和Monitor
  const _refreshStats = useCallback(async () => {
    return dispatch(getStorageStats());
  }, [dispatch]);

  const _sync = useCallback(async () => {
    return dispatch(syncStorageData());
  }, [dispatch]);

  const _cleanup = useCallback(async () => {
    return dispatch(cleanupStorage());
  }, [dispatch]);

  // 策略Manage
  const _setStrategy = useCallback(
    async (strategy: StorageStrategy) => {
      return dispatch(setStorageStrategy(strategy));
    },
    [dispatch]
  );

  const _optimizeStrategy = useCallback(async () => {
    return dispatch(optimizeStorageStrategy());
  }, [dispatch]);

  const _getReport = useCallback(async () => {
    return dispatch(getPerformanceReport());
  }, [dispatch]);

  const _getRecommendations = useCallback(
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

  const _predictNeeds = useCallback(
    async (timeHorizon?: number) => {
      return dispatch(predictStorageNeeds(timeHorizon));
    },
    [dispatch]
  );

  // StatusManage
  const _resetState = useCallback(() => {
    dispatch(resetStorageState());
  }, [dispatch]);

  const _setError = useCallback(
    (error: string) => {
      dispatch(setStorageError(error));
    },
    [dispatch]
  );

  const _clearError = useCallback(() => {
    dispatch(clearStorageError());
  }, [dispatch]);

  const _toggleAutoOptimize = useCallback(
    (enabled: boolean) => {
      dispatch(setAutoOptimize(enabled));
    },
    [dispatch]
  );

  const _updateOperation = useCallback(
    (operation: { type: string; key: string; success: boolean }) => {
      dispatch(updateLastOperation(operation));
    },
    [dispatch]
  );

  const _clearQuery = useCallback(() => {
    dispatch(clearQueryResults());
  }, [dispatch]);

  const _addRec = useCallback(
    (recommendation: string) => {
      dispatch(addRecommendation(recommendation));
    },
    [dispatch]
  );

  const _clearRecs = useCallback(() => {
    dispatch(clearRecommendations());
  }, [dispatch]);

  // 便捷Method

  /**
   * 智能Storage - Root據Data特徵AutoSelect最佳StorageOptions
   */
  const _smartStore = useCallback(
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
      const _dataSize = JSON.stringify(data).length;
      const _accessFrequency = metadata?.accessFrequency || 0.5;
      const _importance = metadata?.importance || DataPriority.MEDIUM;
      const _isTemporary = metadata?.isTemporary || false;

      // Get推薦的StorageOptions
      const _recResult = await getRecommendations({
        dataSize,
        accessFrequency,
        importance,
        isTemporary,
      });

      const options: StorageOptions = {
        priority: importance,
        tags: metadata?.tags,
        namespace: metadata?.namespace,
        // 可以從推薦結果中提取更多Options
      };

      if (isTemporary) {
        options.ttl = 10 * 60 * 1000; // 10Minute
      }

      return setData(key, data, options);
    },
    [setData, getRecommendations]
  );

  /**
   * BatchOperation
   */
  const _batchStore = useCallback(
    async <T>(
      items: {
        key: string;
        data: T;
        options?: StorageOptions;
      }[]
    ) => {
      const _results = await Promise.allSettled(
        items.map(item => setData(item.key, item.data, item.options))
      );

      const _successful = results.filter(
        result => result.status === 'fulfilled'
      ).length;
      const _failed = results.length - successful;

      return { successful, failed, total: results.length };
    },
    [setData]
  );

  const _batchRetrieve = useCallback(
    async <T>(keys: string[], options?: StorageOptions) => {
      const _results = await Promise.allSettled(
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

  const _batchDelete = useCallback(
    async (keys: string[]) => {
      const _results = await Promise.allSettled(
        keys.map(key => deleteData(key))
      );

      const _successful = results.filter(
        result => result.status === 'fulfilled'
      ).length;
      const _failed = results.length - successful;

      return { successful, failed, total: results.length };
    },
    [deleteData]
  );

  /**
   * CacheManage
   */
  const _cacheData = useCallback(
    async <T>(key: string, data: T, ttl?: number) => {
      const options: StorageOptions = {
        layer: StorageLayer.CACHE,
        ttl: ttl || 30 * 60 * 1000, // Default30Minute
        sync: false,
      };

      return setData(key, data, options);
    },
    [setData]
  );

  const _getCachedData = useCallback(
    async <T>(key: string): Promise<T | null> => {
      const options: StorageOptions = {
        layer: StorageLayer.CACHE,
      };

      return getData<T>(key, options);
    },
    [getData]
  );

  /**
   * 持久化Storage
   */
  const _persistData = useCallback(
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
   * 臨時Storage
   */
  const _tempStore = useCallback(
    async <T>(key: string, data: T, ttl?: number) => {
      const options: StorageOptions = {
        layer: StorageLayer.MEMORY,
        ttl: ttl || 5 * 60 * 1000, // Default5Minute
        sync: false,
        priority: DataPriority.LOW,
      };

      return setData(key, data, options);
    },
    [setData]
  );

  /**
   * Search功能
   */
  const _searchByNamespace = useCallback(
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

  const _searchByTags = useCallback(
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

  const _searchByPriority = useCallback(
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
   * Statistics輔助Function
   */
  const _getHitRate = useCallback(() => {
    return stats?.hitRate || 0;
  }, [stats]);

  const _getStorageUsage = useCallback(() => {
    return stats
      ? {
          totalSize: stats.totalSize,
          totalItems: stats.totalItems,
          usagePercentage: stats.totalSize / (200 * 1024 * 1024), // False設200MBLimit
        }
      : null;
  }, [stats]);

  const _getPerformanceMetrics = useCallback(() => {
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
   * 健康Check
   */
  const _healthCheck = useCallback(async () => {
    try {
      // 執Row基本OperationTest
      const _testKey = `health_check_${Date.now()}`;
      const _testData = { test: true, timestamp: new Date() };

      // TestWrite
      await setData(testKey, testData);

      // TestRead
      const _retrieved = await getData(testKey);

      // TestDelete
      await deleteData(testKey);

      // GetStatistics
      await refreshStats();

      const _isHealthy =
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
    // Status
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

    // ServiceManage
    initializeService,
    destroyService,

    // 基本Operation
    setData,
    getData,
    deleteData,
    queryData,

    // Statistics和Monitor
    refreshStats,
    sync,
    cleanup,

    // 策略Manage
    setStrategy,
    optimizeStrategy,
    getReport,
    getRecommendations,
    predictNeeds,

    // StatusManage
    resetState,
    setError,
    clearError,
    toggleAutoOptimize,
    updateOperation,
    clearQuery,
    addRec,
    clearRecs,

    // 便捷Method
    smartStore,
    batchStore,
    batchRetrieve,
    batchDelete,
    cacheData,
    getCachedData,
    persistData,
    tempStore,

    // Search功能
    searchByNamespace,
    searchByTags,
    searchByPriority,

    // Statistics輔助
    getHitRate,
    getStorageUsage,
    getPerformanceMetrics,

    // 健康Check
    healthCheck,
  };
};
