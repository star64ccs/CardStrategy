/**
 * 數據處理 Redux Slice
 * 管理處理狀態、任務隊列和性能指標
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { DataProcessingService } from '../services/dataProcessingService';
import type {
  PerformanceMetrics,
  ProcessingConfig,
  ProcessingEvent,
  ProcessingResult,
  ProcessingTask,
} from '../types/processing';
import {
  CacheStrategy,
  CompressionAlgorithm,
  DataPriority,
  ProcessingStrategy,
} from '../types/processing';

// 狀態接口
export interface DataProcessingState {
  // 服務狀態
  isInitialized: boolean;
  isProcessing: boolean;

  // 任務管理
  activeTasks: ProcessingTask<any>[];
  completedTasks: ProcessingTask<any>[];
  failedTasks: ProcessingTask<any>[];
  taskQueue: ProcessingTask<any>[];

  // 性能指標
  metrics: PerformanceMetrics;

  // 配置
  currentConfig: ProcessingConfig;

  // 錯誤處理
  error: string | null;
  lastError: {
    message: string;
    timestamp: Date;
    taskId?: string;
  } | null;

  // 事件歷史
  eventHistory: ProcessingEvent[];

  // 緩存狀態
  cacheStats: {
    hitRate: number;
    size: number;
    maxSize: number;
    items: number;
  };

  // 隊列狀態
  queueStats: {
    activeTasks: number;
    pendingTasks: number;
    completedTasks: number;
    failedTasks: number;
    throughput: number;
    averageProcessingTime: number;
  };
}

// 初始狀態
const initialState: DataProcessingState = {
  isInitialized: false,
  isProcessing: false,
  activeTasks: [],
  completedTasks: [],
  failedTasks: [],
  taskQueue: [],
  metrics: {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageProcessingTime: 0,
    throughput: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    cacheHitRate: 0,
    compressionRatio: 0,
    errorRate: 0,
    uptime: Date.now(),
  },
  currentConfig: {
    strategy: ProcessingStrategy.PARALLEL,
    priority: DataPriority.NORMAL,
    cacheStrategy: CacheStrategy.HYBRID,
    compression: CompressionAlgorithm.GZIP,
    batchSize: 100,
    maxConcurrency: 4,
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    enableProfiling: true,
    enableMetrics: true,
    memoryLimit: 512,
    cpuLimit: 80,
  },
  error: null,
  lastError: null,
  eventHistory: [],
  cacheStats: {
    hitRate: 0,
    size: 0,
    maxSize: 100 * 1024 * 1024, // 100MB
    items: 0,
  },
  queueStats: {
    activeTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    throughput: 0,
    averageProcessingTime: 0,
  },
};

// 異步 Thunk Actions

/**
 * 初始化數據處理服務
 */
export const _initializeDataProcessing = createAsyncThunk(
  'dataProcessing/initialize',
  async (config?: Partial<ProcessingConfig>) => {
    const _service = DataProcessingService.getInstance();

    // 添加事件監聽器
    service.addEventListener((event: ProcessingEvent) => {
      // 這裡可以通過 dispatch 來更新狀態
      console.log('Processing event:', event);
    });

    const _success = await service.initialize();
    if (!success) {
      throw new Error('數據處理服務初始化失敗');
    }

    return { success, config };
  }
);

/**
 * 處理單個數據
 */
export const _processData = createAsyncThunk<
  ProcessingResult<any>,
  {
    data: unknown;
    processorName: string;
    config?: Partial<ProcessingConfig>;
  },
  {
    rejectValue: ProcessingResult<any>;
  }
>(
  'dataProcessing/processData',
  async (
    params: {
      data: unknown;
      processorName: string;
      config?: Partial<ProcessingConfig>;
    },
    { rejectWithValue }
  ): Promise<ProcessingResult<any>> => {
    try {
      const _service = DataProcessingService.getInstance();
      const _result = await service.processData(
        params.data,
        params.processorName,
        params.config
      );
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '處理失敗');
    }
  }
);

/**
 * 批量處理數據
 */
export const _processBatch = createAsyncThunk(
  'dataProcessing/processBatch',
  async (
    params: {
      dataArray: unknown[];
      processorName: string;
      config?: Partial<ProcessingConfig>;
    },
    { rejectWithValue }
  ): Promise<ProcessingResult<any>[]> => {
    try {
      const _service = DataProcessingService.getInstance();
      const _results = await service.processBatch(
        params.dataArray,
        params.processorName,
        params.config
      );
      return results;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '批量處理失敗');
    }
  }
);

/**
 * 更新性能指標
 */
export const _updateMetrics = createAsyncThunk(
  'dataProcessing/updateMetrics',
  async () => {
    const _service = DataProcessingService.getInstance();
    const _metrics = await service.getMetrics();
    const _stats = await service.getStats();

    return {
      metrics,
      cacheStats: stats.cache,
      queueStats: stats.queue,
    };
  }
);

/**
 * 註冊處理器
 */
export const _registerProcessor = createAsyncThunk(
  'dataProcessing/registerProcessor',
  async (params: { name: string; processor: unknown }) => {
    const _service = DataProcessingService.getInstance();
    service.registerProcessor(params.name, params.processor);
    return { name: params.name };
  }
);

/**
 * 清理緩存
 */
export const _clearCache = createAsyncThunk(
  'dataProcessing/clearCache',
  async () => {
    const _service = DataProcessingService.getInstance();
    await service['cacheManager'].clear();
    return { success: true };
  }
);

/**
 * 重置服務
 */
export const _resetService = createAsyncThunk(
  'dataProcessing/resetService',
  async () => {
    const _service = DataProcessingService.getInstance();
    await service.destroy();
    await service.initialize();
    return { success: true };
  }
);

// Slice 定義
const _dataProcessingSlice = createSlice({
  name: 'dataProcessing',
  initialState,
  reducers: {
    // 同步 Actions

    /**
     * 設置處理配置
     */
    setProcessingConfig: (
      state,
      action: PayloadAction<Partial<ProcessingConfig>>
    ) => {
      state.currentConfig = { ...state.currentConfig, ...action.payload };
    },

    /**
     * 添加任務到隊列
     */
    addTaskToQueue: (state, action: PayloadAction<ProcessingTask<any>>) => {
      state.taskQueue.push(action.payload);
      state.metrics.totalTasks++;
    },

    /**
     * 更新任務狀態
     */
    updateTaskStatus: (
      state,
      action: PayloadAction<{
        taskId: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        result?: ProcessingResult<any>;
        error?: string;
      }>
    ) => {
      const { taskId, status, result, error } = action.payload;

      // 從隊列中移除任務
      state.taskQueue = state.taskQueue.filter(task => task.id !== taskId);

      // 更新活動任務
      if (status === 'processing') {
        const _task = state.taskQueue.find(t => t.id === taskId);
        if (task) {
          state.activeTasks.push(task);
        }
      } else {
        state.activeTasks = state.activeTasks.filter(
          task => task.id !== taskId
        );
      }

      // 添加到完成或失敗任務列表
      if (status === 'completed' && result) {
        state.completedTasks.push({
          ...state.activeTasks.find(t => t.id === taskId)!,
          result,
        });
        state.metrics.completedTasks++;
      } else if (status === 'failed') {
        state.failedTasks.push({
          ...state.activeTasks.find(t => t.id === taskId)!,
          error,
        });
        state.metrics.failedTasks++;
      }

      // 更新錯誤率
      state.metrics.errorRate =
        state.metrics.failedTasks / state.metrics.totalTasks;
    },

    /**
     * 添加事件到歷史
     */
    addEventToHistory: (state, action: PayloadAction<ProcessingEvent>) => {
      state.eventHistory.push(action.payload);

      // 限制歷史記錄數量
      if (state.eventHistory.length > 100) {
        state.eventHistory = state.eventHistory.slice(-100);
      }
    },

    /**
     * 清除錯誤
     */
    clearError: state => {
      state.error = null;
      state.lastError = null;
    },

    /**
     * 清除歷史記錄
     */
    clearHistory: state => {
      state.eventHistory = [];
      state.completedTasks = [];
      state.failedTasks = [];
    },

    /**
     * 設置處理狀態
     */
    setProcessingStatus: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // 初始化處理
      .addCase(initializeDataProcessing.pending, state => {
        state.isInitialized = false;
        state.error = null;
      })
      .addCase(initializeDataProcessing.fulfilled, (state, action) => {
        state.isInitialized = true;
        if (action.payload.config) {
          state.currentConfig = {
            ...state.currentConfig,
            ...action.payload.config,
          };
        }
      })
      .addCase(initializeDataProcessing.rejected, (state, action) => {
        state.isInitialized = false;
        state.error = action.error.message || '初始化失敗';
        state.lastError = {
          message: state.error,
          timestamp: new Date(),
        };
      })

      // 數據處理
      .addCase(processData.pending, state => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(processData.fulfilled, (state, action) => {
        state.isProcessing = false;
        // 處理結果會通過事件監聽器更新
      })
      .addCase(processData.rejected, (state, action) => {
        state.isProcessing = false;
        const _errorMessage = action.error?.message || '處理失敗';
        state.error = errorMessage;
        state.lastError = {
          message: errorMessage,
          timestamp: new Date(),
        };
      })

      // 批量處理
      .addCase(processBatch.pending, state => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(processBatch.fulfilled, (state, action) => {
        state.isProcessing = false;
        // 批量處理結果會通過事件監聽器更新
      })
      .addCase(processBatch.rejected, (state, action) => {
        state.isProcessing = false;
        const _errorMessage = action.error?.message || '批量處理失敗';
        state.error = errorMessage;
        state.lastError = {
          message: errorMessage,
          timestamp: new Date(),
        };
      })

      // 更新指標
      .addCase(updateMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload.metrics;
        state.cacheStats = action.payload.cacheStats;
        state.queueStats = action.payload.queueStats;
      })

      // 註冊處理器
      .addCase(registerProcessor.fulfilled, (state, action) => {
        // 處理器註冊成功，可以更新相關狀態
        console.log(`處理器註冊成功: ${action.payload.name}`);
      })

      // 清理緩存
      .addCase(clearCache.fulfilled, state => {
        state.cacheStats = {
          hitRate: 0,
          size: 0,
          maxSize: state.cacheStats.maxSize,
          items: 0,
        };
      })

      // 重置服務
      .addCase(resetService.fulfilled, state => {
        state.isInitialized = true;
        state.error = null;
        state.lastError = null;
        state.activeTasks = [];
        state.completedTasks = [];
        state.failedTasks = [];
        state.taskQueue = [];
        state.eventHistory = [];
        state.metrics = {
          totalTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
          averageProcessingTime: 0,
          throughput: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          cacheHitRate: 0,
          compressionRatio: 0,
          errorRate: 0,
          uptime: Date.now(),
        };
      });
  },
});

// 導出 Actions
export const {
  setProcessingConfig,
  addTaskToQueue,
  updateTaskStatus,
  addEventToHistory,
  clearError,
  clearHistory,
  setProcessingStatus,
} = dataProcessingSlice.actions;

// 導出 Selectors
export const _selectDataProcessingState = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing;
export const _selectIsInitialized = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.isInitialized;
export const _selectIsProcessing = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.isProcessing;
export const _selectActiveTasks = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.activeTasks;
export const _selectCompletedTasks = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.completedTasks;
export const _selectFailedTasks = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.failedTasks;
export const _selectTaskQueue = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.taskQueue;
export const _selectMetrics = (state: { dataProcessing: DataProcessingState }) =>
  state.dataProcessing.metrics;
export const _selectCurrentConfig = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.currentConfig;
export const _selectError = (state: { dataProcessing: DataProcessingState }) =>
  state.dataProcessing.error;
export const _selectLastError = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.lastError;
export const _selectEventHistory = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.eventHistory;
export const _selectCacheStats = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.cacheStats;
export const _selectQueueStats = (state: {
  dataProcessing: DataProcessingState;
}) => state.dataProcessing.queueStats;

// 導出 Reducer
export default dataProcessingSlice.reducer;
