/**
 * 數據處理自定義 Hook
 * 提供簡化的 API 和狀態管理
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
 * 數據處理 Hook 返回值接口
 */
export interface UseDataProcessingReturn {
  // 狀態
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  lastError: { message: string; timestamp: Date; taskId?: string } | null;

  // 任務管理
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

  // 配置
  currentConfig: ProcessingConfig;

  // 統計信息
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

  // 事件歷史
  eventHistory: unknown[];

  // 操作方法
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

  // 便捷方法
  setStrategy: (strategy: ProcessingStrategy) => void;
  setPriority: (priority: DataPriority) => void;
  setCacheStrategy: (strategy: CacheStrategy) => void;
  setCompression: (compression: CompressionAlgorithm) => void;
  setBatchSize: (batchSize: number) => void;
  setMaxConcurrency: (maxConcurrency: number) => void;
  setTimeout: (timeout: number) => void;

  // 計算屬性
  successRate: number;
  averageTaskTime: number;
  isHealthy: boolean;
  performanceScore: number;
}

/**
 * 數據處理自定義 Hook
 */
export const useDataProcessing = (): UseDataProcessingReturn => {
  const dispatch = useAppDispatch();

  // 從 Redux 獲取狀態
  const state = useSelector(selectDataProcessingState);
  const isInitialized = useSelector(selectIsInitialized);
  const isProcessing = useSelector(selectIsProcessing);
  const activeTasks = useSelector(selectActiveTasks);
  const completedTasks = useSelector(selectCompletedTasks);
  const failedTasks = useSelector(selectFailedTasks);
  const taskQueue = useSelector(selectTaskQueue);
  const metrics = useSelector(selectMetrics);
  const currentConfig = useSelector(selectCurrentConfig);
  const error = useSelector(selectError);
  const lastError = useSelector(selectLastError);
  const eventHistory = useSelector(selectEventHistory);
  const cacheStats = useSelector(selectCacheStats);
  const queueStats = useSelector(selectQueueStats);

  // 計算屬性
  const successRate = useMemo(() => {
    if (metrics.totalTasks === 0) return 0;
    return (metrics.completedTasks / metrics.totalTasks) * 100;
  }, [metrics.completedTasks, metrics.totalTasks]);

  const averageTaskTime = useMemo(() => {
    return metrics.averageProcessingTime;
  }, [metrics.averageProcessingTime]);

  const isHealthy = useMemo(() => {
    return (
      isInitialized &&
      !error &&
      metrics.errorRate < 0.1 && // 錯誤率低於10%
      metrics.memoryUsage < 80 && // 內存使用率低於80%
      metrics.cpuUsage < 90 // CPU使用率低於90%
    );
  }, [
    isInitialized,
    error,
    metrics.errorRate,
    metrics.memoryUsage,
    metrics.cpuUsage,
  ]);

  const performanceScore = useMemo(() => {
    let score = 100;

    // 根據錯誤率扣分
    score -= metrics.errorRate * 50;

    // 根據內存使用率扣分
    if (metrics.memoryUsage > 80) {
      score -= (metrics.memoryUsage - 80) * 2;
    }

    // 根據CPU使用率扣分
    if (metrics.cpuUsage > 90) {
      score -= (metrics.cpuUsage - 90) * 2;
    }

    // 根據緩存命中率加分
    score += metrics.cacheHitRate * 20;

    return Math.max(0, Math.min(100, score));
  }, [
    metrics.errorRate,
    metrics.memoryUsage,
    metrics.cpuUsage,
    metrics.cacheHitRate,
  ]);

  // 操作方法
  const initialize = useCallback(
    async (config?: Partial<ProcessingConfig>) => {
      try {
        await (dispatch(initializeDataProcessing(config)) as any).unwrap();
      } catch (error) {
        console.error('初始化數據處理服務失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const processDataHandler = useCallback(
    async <TInput, TOutput>(
      data: TInput,
      processorName: string,
      config?: Partial<ProcessingConfig>
    ): Promise<ProcessingResult<TOutput>> => {
      try {
        const result = await (
          dispatch(processData({ data, processorName, config })) as any
        ).unwrap();
        return result;
      } catch (error) {
        console.error('數據處理失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const processBatchHandler = useCallback(
    async <TInput, TOutput>(
      dataArray: TInput[],
      processorName: string,
      config?: Partial<ProcessingConfig>
    ): Promise<ProcessingResult<TOutput>[]> => {
      try {
        const results = await (
          dispatch(processBatch({ dataArray, processorName, config })) as any
        ).unwrap();
        return results;
      } catch (error) {
        console.error('批量處理失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const registerProcessorHandler = useCallback(
    async (name: string, processor: DataProcessor<any, any>) => {
      try {
        await (
          dispatch(registerProcessor({ name, processor })) as any
        ).unwrap();
      } catch (error) {
        console.error('註冊處理器失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const updateMetricsHandler = useCallback(async () => {
    try {
      await (dispatch(updateMetrics()) as any).unwrap();
    } catch (error) {
      console.error('更新指標失敗:', error);
    }
  }, [dispatch]);

  const clearCacheHandler = useCallback(async () => {
    try {
      await (dispatch(clearCache()) as any).unwrap();
    } catch (error) {
      console.error('清理緩存失敗:', error);
      throw error;
    }
  }, [dispatch]);

  const resetServiceHandler = useCallback(async () => {
    try {
      await (dispatch(resetService()) as any).unwrap();
    } catch (error) {
      console.error('重置服務失敗:', error);
      throw error;
    }
  }, [dispatch]);

  const setConfig = useCallback(
    (config: Partial<ProcessingConfig>) => {
      dispatch(setProcessingConfig(config));
    },
    [dispatch]
  );

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearHistoryHandler = useCallback(() => {
    dispatch(clearHistory());
  }, [dispatch]);

  // 便捷方法
  const setStrategy = useCallback(
    (strategy: ProcessingStrategy) => {
      setConfig({ strategy });
    },
    [setConfig]
  );

  const setPriority = useCallback(
    (priority: DataPriority) => {
      setConfig({ priority });
    },
    [setConfig]
  );

  const setCacheStrategy = useCallback(
    (strategy: CacheStrategy) => {
      setConfig({ cacheStrategy: strategy });
    },
    [setConfig]
  );

  const setCompression = useCallback(
    (compression: CompressionAlgorithm) => {
      setConfig({ compression });
    },
    [setConfig]
  );

  const setBatchSize = useCallback(
    (batchSize: number) => {
      setConfig({ batchSize });
    },
    [setConfig]
  );

  const setMaxConcurrency = useCallback(
    (maxConcurrency: number) => {
      setConfig({ maxConcurrency });
    },
    [setConfig]
  );

  const setTimeoutHandler = useCallback(
    (timeout: number) => {
      setConfig({ timeout });
    },
    [setConfig]
  );

  // 自動更新指標
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(() => {
        updateMetricsHandler();
      }, 5000); // 每5秒更新一次

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isInitialized, updateMetricsHandler]);

  // 自動初始化
  useEffect(() => {
    if (!isInitialized) {
      initialize().catch(console.error);
    }
  }, [isInitialized, initialize]);

  return {
    // 狀態
    isInitialized,
    isProcessing,
    error,
    lastError,

    // 任務管理
    activeTasks,
    completedTasks,
    failedTasks,
    taskQueue,

    // 性能指標
    metrics,

    // 配置
    currentConfig,

    // 統計信息
    cacheStats,
    queueStats,

    // 事件歷史
    eventHistory,

    // 操作方法
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

    // 便捷方法
    setStrategy,
    setPriority,
    setCacheStrategy,
    setCompression,
    setBatchSize,
    setMaxConcurrency,
    setTimeout: setTimeoutHandler,

    // 計算屬性
    successRate,
    averageTaskTime,
    isHealthy,
    performanceScore,
  };
};

/**
 * 簡化的數據處理 Hook（僅用於基本操作）
 */
export const useSimpleDataProcessing = () => {
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
 * 性能監控 Hook
 */
export const useDataProcessingMetrics = () => {
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
 * 任務管理 Hook
 */
export const useDataProcessingTasks = () => {
  const { activeTasks, completedTasks, failedTasks, taskQueue, isProcessing } =
    useDataProcessing();

  const totalTasks =
    activeTasks.length + completedTasks.length + failedTasks.length;
  const pendingTasks = taskQueue.length;

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
