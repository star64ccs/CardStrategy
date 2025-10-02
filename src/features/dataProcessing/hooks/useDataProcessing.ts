/**
 * DataHandleCustom Hook
 * 提供簡化的 API 和StatusManage
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  clearCache,
  clearError,
  clearHistory,
  initializeDataProcessing,
  processBatch,
  processData,
  registerProcessor,
  resetService,
  selectActiveTasks,
  selectCacheStats,
  selectCompletedTasks,
  selectCurrentConfig,
  selectDataProcessingState,
  selectError,
  selectEventHistory,
  selectFailedTasks,
  selectIsInitialized,
  selectIsProcessing,
  selectLastError,
  selectMetrics,
  selectQueueStats,
  selectTaskQueue,
  setProcessingConfig,
  updateMetrics,
} from '../slices/dataProcessingSlice';
import type {
  CacheStrategy,
  CompressionAlgorithm,
  DataPriority,
  DataProcessor,
  ProcessingConfig,
  ProcessingResult,
  ProcessingStrategy,
  ProcessingTask,
} from '../types/processing';

/**
 * DataHandle Hook ReturnValueInterface
 */
export interface UseDataProcessingReturn {
  // Status
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  lastError: { message: string; timestamp: Date; taskId?: string } | null;

  // TaskManage
  activeTasks: ProcessingTask<any>[];
  completedTasks: ProcessingTask<any>[];
  failedTasks: ProcessingTask<any>[];
  taskQueue: ProcessingTask<any>[];

  // 性能指標
  metrics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageProcessingTime: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
    cacheHitRate: number;
    compressionRatio: number;
    errorRate: number;
    uptime: number;
  };

  // Configure
  currentConfig: ProcessingConfig;

  // StatisticsInformation
  cacheStats: {
    hitRate: number;
    size: number;
    maxSize: number;
    items: number;
  };
  queueStats: {
    activeTasks: number;
    pendingTasks: number;
    completedTasks: number;
    failedTasks: number;
    throughput: number;
    averageProcessingTime: number;
  };

  // Event歷史
  eventHistory: unknown[];

  // OperationMethod
  initialize: (config?: Partial<ProcessingConfig>) => Promise<void>;
  processData: <TInput, TOutput>(
    data: TInput,
    processorName: string,
    config?: Partial<ProcessingConfig>
  ) => Promise<ProcessingResult<TOutput>>;
  processBatch: <TInput, TOutput>(
    dataArray: TInput[],
    processorName: string,
    config?: Partial<ProcessingConfig>
  ) => Promise<ProcessingResult<TOutput>[]>;
  registerProcessor: (
    name: string,
    processor: DataProcessor<any, any>
  ) => Promise<void>;
  updateMetrics: () => Promise<void>;
  clearCache: () => Promise<void>;
  resetService: () => Promise<void>;
  setConfig: (config: Partial<ProcessingConfig>) => void;
  clearError: () => void;
  clearHistory: () => void;

  // 便捷Method
  setStrategy: (strategy: ProcessingStrategy) => void;
  setPriority: (priority: DataPriority) => void;
  setCacheStrategy: (strategy: CacheStrategy) => void;
  setCompression: (compression: CompressionAlgorithm) => void;
  setBatchSize: (batchSize: number) => void;
  setMaxConcurrency: (maxConcurrency: number) => void;
  setTimeout: (timeout: number) => void;

  // 計算Property
  successRate: number;
  averageTaskTime: number;
  isHealthy: boolean;
  performanceScore: number;
}

/**
 * DataHandleCustom Hook
 */
export const _useDataProcessing = (): UseDataProcessingReturn => {
  const _dispatch = useAppDispatch();

  // 從 Redux GetStatus
  const _state = useSelector(selectDataProcessingState);
  const _isInitialized = useSelector(selectIsInitialized);
  const _isProcessing = useSelector(selectIsProcessing);
  const _activeTasks = useSelector(selectActiveTasks);
  const _completedTasks = useSelector(selectCompletedTasks);
  const _failedTasks = useSelector(selectFailedTasks);
  const _taskQueue = useSelector(selectTaskQueue);
  const _metrics = useSelector(selectMetrics);
  const _currentConfig = useSelector(selectCurrentConfig);
  const _error = useSelector(selectError);
  const _lastError = useSelector(selectLastError);
  const _eventHistory = useSelector(selectEventHistory);
  const _cacheStats = useSelector(selectCacheStats);
  const _queueStats = useSelector(selectQueueStats);

  // 計算Property
  const _successRate = useMemo(() => {
    if (metrics.totalTasks === 0) return 0;
    return (metrics.completedTasks / metrics.totalTasks) * 100;
  }, [metrics.completedTasks, metrics.totalTasks]);

  const _averageTaskTime = useMemo(() => {
    return metrics.averageProcessingTime;
  }, [metrics.averageProcessingTime]);

  const _isHealthy = useMemo(() => {
    return (
      isInitialized &&
      !error &&
      metrics.errorRate < 0.1 && // Error率低於10%
      metrics.memoryUsage < 80 && // Memory使用率低於80%
      metrics.cpuUsage < 90 // CPU使用率低於90%
    );
  }, [
    isInitialized,
    error,
    metrics.errorRate,
    metrics.memoryUsage,
    metrics.cpuUsage,
  ]);

  const _performanceScore = useMemo(() => {
    let score = 100;

    // Root據Error率扣分
    score -= metrics.errorRate * 50;

    // Root據Memory使用率扣分
    if (metrics.memoryUsage > 80) {
      score -= (metrics.memoryUsage - 80) * 2;
    }

    // Root據CPU使用率扣分
    if (metrics.cpuUsage > 90) {
      score -= (metrics.cpuUsage - 90) * 2;
    }

    // Root據Cache命中率加分
    score += metrics.cacheHitRate * 20;

    return Math.max(0, Math.min(100, score));
  }, [
    metrics.errorRate,
    metrics.memoryUsage,
    metrics.cpuUsage,
    metrics.cacheHitRate,
  ]);

  // OperationMethod
  const _initialize = useCallback(
    async (config?: Partial<ProcessingConfig>) => {
      try {
        await (dispatch(initializeDataProcessing(config)) as any).unwrap();
      } catch (error) {
        console.error('Initialize數據HandleServiceFailed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _processDataHandler = useCallback(
    async <TInput, TOutput>(
      data: TInput,
      processorName: string,
      config?: Partial<ProcessingConfig>
    ): Promise<ProcessingResult<TOutput>> => {
      try {
        const _result = await (
          dispatch(processData({ data, processorName, config })) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('數據HandleFailed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _processBatchHandler = useCallback(
    async <TInput, TOutput>(
      dataArray: TInput[],
      processorName: string,
      config?: Partial<ProcessingConfig>
    ): Promise<ProcessingResult<TOutput>[]> => {
      try {
        const _results = await (
          dispatch(processBatch({ dataArray, processorName, config })) as any
        ).unwrap();
        return results;
      } catch (error) {
        console.error('批量HandleFailed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _registerProcessorHandler = useCallback(
    async (name: string, processor: DataProcessor<any, any>) => {
      try {
        await (
          dispatch(registerProcessor({ name, processor })) as any
        ).unwrap();
      } catch (error) {
        console.error('註冊Handle器Failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _updateMetricsHandler = useCallback(async () => {
    try {
      await (dispatch(updateMetrics()) as any).unwrap();
    } catch (error) {
      console.error('Update指標Failed:', error);
    }
  }, [dispatch]);

  const _clearCacheHandler = useCallback(async () => {
    try {
      await (dispatch(clearCache()) as any).unwrap();
    } catch (error) {
      console.error('清理緩存Failed:', error);
      throw error;
    }
  }, [dispatch]);

  const _resetServiceHandler = useCallback(async () => {
    try {
      await (dispatch(resetService()) as any).unwrap();
    } catch (error) {
      console.error('重置ServiceFailed:', error);
      throw error;
    }
  }, [dispatch]);

  const _setConfig = useCallback(
    (config: Partial<ProcessingConfig>) => {
      dispatch(setProcessingConfig(config));
    },
    [dispatch]
  );

  const _clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const _clearHistoryHandler = useCallback(() => {
    dispatch(clearHistory());
  }, [dispatch]);

  // 便捷Method
  const _setStrategy = useCallback(
    (strategy: ProcessingStrategy) => {
      setConfig({ strategy });
    },
    [setConfig]
  );

  const _setPriority = useCallback(
    (priority: DataPriority) => {
      setConfig({ priority });
    },
    [setConfig]
  );

  const _setCacheStrategy = useCallback(
    (strategy: CacheStrategy) => {
      setConfig({ cacheStrategy: strategy });
    },
    [setConfig]
  );

  const _setCompression = useCallback(
    (compression: CompressionAlgorithm) => {
      setConfig({ compression });
    },
    [setConfig]
  );

  const _setBatchSize = useCallback(
    (batchSize: number) => {
      setConfig({ batchSize });
    },
    [setConfig]
  );

  const _setMaxConcurrency = useCallback(
    (maxConcurrency: number) => {
      setConfig({ maxConcurrency });
    },
    [setConfig]
  );

  const _setTimeoutHandler = useCallback(
    (timeout: number) => {
      setConfig({ timeout });
    },
    [setConfig]
  );

  // AutoUpdate指標
  useEffect(() => {
    if (isInitialized) {
      const _interval = setInterval(() => {
        updateMetricsHandler();
      }, 5000); // 每5SecondUpdate一次

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isInitialized, updateMetricsHandler]);

  // AutoInitialize
  useEffect(() => {
    if (!isInitialized) {
      initialize().catch(console.error);
    }
  }, [isInitialized, initialize]);

  return {
    // Status
    isInitialized,
    isProcessing,
    error,
    lastError,

    // TaskManage
    activeTasks,
    completedTasks,
    failedTasks,
    taskQueue,

    // 性能指標
    metrics,

    // Configure
    currentConfig,

    // StatisticsInformation
    cacheStats,
    queueStats,

    // Event歷史
    eventHistory,

    // OperationMethod
    initialize,
    processData: processDataHandler,
    processBatch: processBatchHandler,
    registerProcessor: registerProcessorHandler,
    updateMetrics: updateMetricsHandler,
    clearCache: clearCacheHandler,
    resetService: resetServiceHandler,
    setConfig,
    clearError: clearErrorHandler,
    clearHistory: clearHistoryHandler,

    // 便捷Method
    setStrategy,
    setPriority,
    setCacheStrategy,
    setCompression,
    setBatchSize,
    setMaxConcurrency,
    setTimeout: setTimeoutHandler,

    // 計算Property
    successRate,
    averageTaskTime,
    isHealthy,
    performanceScore,
  };
};

/**
 * 簡化的DataHandle Hook（僅用於基本Operation）
 */
export const _useSimpleDataProcessing = () => {
  const {
    isInitialized,
    isProcessing,
    error,
    processData,
    processBatch,
    registerProcessor,
    clearError,
  } = useDataProcessing();

  return {
    isInitialized,
    isProcessing,
    error,
    processData,
    processBatch,
    registerProcessor,
    clearError,
  };
};

/**
 * 性能Monitor Hook
 */
export const _useDataProcessingMetrics = () => {
  const {
    metrics,
    cacheStats,
    queueStats,
    successRate,
    averageTaskTime,
    isHealthy,
    performanceScore,
    updateMetrics,
  } = useDataProcessing();

  return {
    metrics,
    cacheStats,
    queueStats,
    successRate,
    averageTaskTime,
    isHealthy,
    performanceScore,
    updateMetrics,
  };
};

/**
 * TaskManage Hook
 */
export const _useDataProcessingTasks = () => {
  const { activeTasks, completedTasks, failedTasks, taskQueue, isProcessing } =
    useDataProcessing();

  const _totalTasks =
    activeTasks.length + completedTasks.length + failedTasks.length;
  const _pendingTasks = taskQueue.length;

  return {
    activeTasks,
    completedTasks,
    failedTasks,
    taskQueue,
    isProcessing,
    totalTasks,
    pendingTasks,
  };
};
