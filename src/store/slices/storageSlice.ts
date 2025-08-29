import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { MultiLayerStorageService } from '../../features/storage/services/multiLayerStorageService';
import { StorageStrategyManager } from '../../features/storage/services/storageStrategyManager';
import type {
  StorageStats,
  StorageOptions,
  StorageQuery,
  StorageItem,
  DataPriority,
} from '../../features/storage/types/storage';
import {
  StorageStrategy,
  StorageLayer,
} from '../../features/storage/types/storage';

// 狀態接口
interface StorageState {
  // 服務狀態
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // 存儲配置
  currentStrategy: StorageStrategy;
  autoOptimize: boolean;

  // 統計數據
  stats: StorageStats | null;
  performanceReport: unknown | null;

  // 查詢結果
  queryResults: StorageItem[];
  queryLoading: boolean;

  // 操作狀態
  lastOperation: {
    type: string;
    key: string;
    success: boolean;
    timestamp: Date;
  } | null;

  // 推薦配置
  recommendations: string[];
  predictedNeeds: unknown | null;
}

// 初始狀態
const initialState: StorageState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  currentStrategy: StorageStrategy.BALANCED,
  autoOptimize: true,
  stats: null,
  performanceReport: null,
  queryResults: [],
  queryLoading: false,
  lastOperation: null,
  recommendations: [],
  predictedNeeds: null,
};

// 異步操作

/**
 * 初始化存儲服務
 */
export const _initializeStorageService = createAsyncThunk(
  'storage/initializeService',
  async (config?: unknown) => {
    const _storageService = MultiLayerStorageService.getInstance();
    const _strategyManager = StorageStrategyManager.getInstance();

    const _storageSuccess = await storageService.initialize(config);
    const _strategySuccess = await strategyManager.initialize(config?.adaptive);

    if (!storageSuccess || !strategySuccess) {
      throw new Error('存儲服務初始化失敗');
    }

    return {
      strategy: strategyManager.getCurrentStrategy(),
      success: true,
    };
  }
);

/**
 * 設置數據
 */
export const _setStorageData = createAsyncThunk(
  'storage/setData',
  async ({
    key,
    data,
    options,
  }: {
    key: string;
    data: unknown;
    options?: StorageOptions;
  }) => {
    const _storageService = MultiLayerStorageService.getInstance();
    const _result = await storageService.set(key, data, options);

    if (!result.success) {
      throw new Error(result.error || '數據存儲失敗');
    }

    return { key, success: true };
  }
);

/**
 * 獲取數據
 */
export const _getStorageData = createAsyncThunk(
  'storage/getData',
  async ({ key, options }: { key: string; options?: StorageOptions }) => {
    const _storageService = MultiLayerStorageService.getInstance();
    const _data = await storageService.get(key, options);

    return { key, data };
  }
);

/**
 * 刪除數據
 */
export const _deleteStorageData = createAsyncThunk(
  'storage/deleteData',
  async (key: string) => {
    const _storageService = MultiLayerStorageService.getInstance();
    const _result = await storageService.delete(key);

    if (!result.success) {
      throw new Error(result.error || '數據刪除失敗');
    }

    return { key, success: true };
  }
);

/**
 * 查詢數據
 */
export const _queryStorageData = createAsyncThunk(
  'storage/queryData',
  async (query: StorageQuery) => {
    const _storageService = MultiLayerStorageService.getInstance();
    const _results = await storageService.query(query);

    return { query, results };
  }
);

/**
 * 獲取存儲統計
 */
export const _getStorageStats = createAsyncThunk(
  'storage/getStats',
  async () => {
    const _storageService = MultiLayerStorageService.getInstance();
    const _stats = await storageService.getStats();

    return stats;
  }
);

/**
 * 手動同步
 */
export const _syncStorageData = createAsyncThunk(
  'storage/syncData',
  async () => {
    const _storageService = MultiLayerStorageService.getInstance();
    const _result = await storageService.sync();

    return result;
  }
);

/**
 * 清理存儲
 */
export const _cleanupStorage = createAsyncThunk('storage/cleanup', async () => {
  const _storageService = MultiLayerStorageService.getInstance();
  const _result = await storageService.cleanup();

  return result;
});

/**
 * 設置存儲策略
 */
export const _setStorageStrategy = createAsyncThunk(
  'storage/setStrategy',
  async (strategy: StorageStrategy) => {
    const _strategyManager = StorageStrategyManager.getInstance();
    const _success = await strategyManager.setStrategy(strategy);

    if (!success) {
      throw new Error('設置存儲策略失敗');
    }

    return { strategy, success };
  }
);

/**
 * 優化存儲策略
 */
export const _optimizeStorageStrategy = createAsyncThunk(
  'storage/optimizeStrategy',
  async () => {
    const _strategyManager = StorageStrategyManager.getInstance();
    const _success = await strategyManager.optimizeStrategy();

    if (!success) {
      throw new Error('優化存儲策略失敗');
    }

    const _currentStrategy = strategyManager.getCurrentStrategy();
    return { strategy: currentStrategy, success };
  }
);

/**
 * 獲取性能報告
 */
export const _getPerformanceReport = createAsyncThunk(
  'storage/getPerformanceReport',
  async () => {
    const _strategyManager = StorageStrategyManager.getInstance();
    const _report = await strategyManager.getPerformanceReport();

    return report;
  }
);

/**
 * 獲取存儲建議
 */
export const _getStorageRecommendations = createAsyncThunk(
  'storage/getRecommendations',
  async ({
    dataSize,
    accessFrequency,
    importance,
    isTemporary,
  }: {
    dataSize: number;
    accessFrequency: number;
    importance: DataPriority;
    isTemporary?: boolean;
  }) => {
    const _strategyManager = StorageStrategyManager.getInstance();
    const _options = strategyManager.recommendStorageOptions(
      dataSize,
      accessFrequency,
      importance,
      isTemporary
    );

    return { options, recommendations: [] }; // 可以添加更多建議邏輯
  }
);

/**
 * 預測存儲需求
 */
export const _predictStorageNeeds = createAsyncThunk(
  'storage/predictNeeds',
  async (timeHorizon?: number) => {
    const _strategyManager = StorageStrategyManager.getInstance();
    const _predictions = strategyManager.predictStorageNeeds(timeHorizon);

    return predictions;
  }
);

/**
 * 銷毀存儲服務
 */
export const _destroyStorageService = createAsyncThunk(
  'storage/destroyService',
  async () => {
    const _storageService = MultiLayerStorageService.getInstance();
    const _strategyManager = StorageStrategyManager.getInstance();

    const _storageSuccess = await storageService.destroy();
    const _strategySuccess = await strategyManager.destroy();

    return { success: storageSuccess && strategySuccess };
  }
);

// 創建 slice
const _storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    // 重置狀態
    resetStorageState: state => {
      return { ...initialState };
    },

    // 設置錯誤
    setStorageError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // 清除錯誤
    clearStorageError: state => {
      state.error = null;
    },

    // 設置自動優化
    setAutoOptimize: (state, action: PayloadAction<boolean>) => {
      state.autoOptimize = action.payload;
    },

    // 更新最後操作
    updateLastOperation: (
      state,
      action: PayloadAction<{
        type: string;
        key: string;
        success: boolean;
      }>
    ) => {
      state.lastOperation = {
        ...action.payload,
        timestamp: new Date(),
      };
    },

    // 清除查詢結果
    clearQueryResults: state => {
      state.queryResults = [];
      state.queryLoading = false;
    },

    // 添加推薦
    addRecommendation: (state, action: PayloadAction<string>) => {
      if (!state.recommendations.includes(action.payload)) {
        state.recommendations.push(action.payload);
      }
    },

    // 清除推薦
    clearRecommendations: state => {
      state.recommendations = [];
    },
  },
  extraReducers: builder => {
    // 初始化存儲服務
    builder
      .addCase(initializeStorageService.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeStorageService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.currentStrategy = action.payload.strategy;
      })
      .addCase(initializeStorageService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '初始化失敗';
      });

    // 設置數據
    builder
      .addCase(setStorageData.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setStorageData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastOperation = {
          type: 'SET',
          key: action.payload.key,
          success: action.payload.success,
          timestamp: new Date(),
        };
      })
      .addCase(setStorageData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '數據存儲失敗';
      });

    // 獲取數據
    builder
      .addCase(getStorageData.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStorageData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastOperation = {
          type: 'GET',
          key: action.payload.key,
          success: action.payload.data !== null,
          timestamp: new Date(),
        };
      })
      .addCase(getStorageData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '數據獲取失敗';
      });

    // 刪除數據
    builder
      .addCase(deleteStorageData.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteStorageData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastOperation = {
          type: 'DELETE',
          key: action.payload.key,
          success: action.payload.success,
          timestamp: new Date(),
        };
      })
      .addCase(deleteStorageData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '數據刪除失敗';
      });

    // 查詢數據
    builder
      .addCase(queryStorageData.pending, state => {
        state.queryLoading = true;
        state.error = null;
      })
      .addCase(queryStorageData.fulfilled, (state, action) => {
        state.queryLoading = false;
        state.queryResults = action.payload.results;
      })
      .addCase(queryStorageData.rejected, (state, action) => {
        state.queryLoading = false;
        state.error = action.error.message || '數據查詢失敗';
      });

    // 獲取統計
    builder
      .addCase(getStorageStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getStorageStats.rejected, (state, action) => {
        state.error = action.error.message || '獲取統計失敗';
      });

    // 同步數據
    builder
      .addCase(syncStorageData.pending, state => {
        state.isLoading = true;
      })
      .addCase(syncStorageData.fulfilled, state => {
        state.isLoading = false;
        state.lastOperation = {
          type: 'SYNC',
          key: 'all',
          success: true,
          timestamp: new Date(),
        };
      })
      .addCase(syncStorageData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '同步失敗';
      });

    // 清理存儲
    builder
      .addCase(cleanupStorage.pending, state => {
        state.isLoading = true;
      })
      .addCase(cleanupStorage.fulfilled, state => {
        state.isLoading = false;
        state.lastOperation = {
          type: 'CLEANUP',
          key: 'all',
          success: true,
          timestamp: new Date(),
        };
      })
      .addCase(cleanupStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '清理失敗';
      });

    // 設置策略
    builder
      .addCase(setStorageStrategy.fulfilled, (state, action) => {
        state.currentStrategy = action.payload.strategy;
      })
      .addCase(setStorageStrategy.rejected, (state, action) => {
        state.error = action.error.message || '設置策略失敗';
      });

    // 優化策略
    builder
      .addCase(optimizeStorageStrategy.fulfilled, (state, action) => {
        state.currentStrategy = action.payload.strategy;
      })
      .addCase(optimizeStorageStrategy.rejected, (state, action) => {
        state.error = action.error.message || '優化策略失敗';
      });

    // 性能報告
    builder
      .addCase(getPerformanceReport.fulfilled, (state, action) => {
        state.performanceReport = action.payload;
        state.recommendations = action.payload.recommendations;
      })
      .addCase(getPerformanceReport.rejected, (state, action) => {
        state.error = action.error.message || '獲取性能報告失敗';
      });

    // 存儲建議
    builder
      .addCase(getStorageRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload.recommendations;
      })
      .addCase(getStorageRecommendations.rejected, (state, action) => {
        state.error = action.error.message || '獲取建議失敗';
      });

    // 預測需求
    builder
      .addCase(predictStorageNeeds.fulfilled, (state, action) => {
        state.predictedNeeds = action.payload;
      })
      .addCase(predictStorageNeeds.rejected, (state, action) => {
        state.error = action.error.message || '預測失敗';
      });

    // 銷毀服務
    builder
      .addCase(destroyStorageService.fulfilled, state => {
        return { ...initialState };
      })
      .addCase(destroyStorageService.rejected, (state, action) => {
        state.error = action.error.message || '銷毀服務失敗';
      });
  },
});

// 導出 actions
export const {
  resetStorageState,
  setStorageError,
  clearStorageError,
  setAutoOptimize,
  updateLastOperation,
  clearQueryResults,
  addRecommendation,
  clearRecommendations,
} = storageSlice.actions;

// 選擇器
export const _selectStorageState = (state: { storage: StorageState }) =>
  state.storage;
export const _selectIsStorageInitialized = (state: { storage: StorageState }) =>
  state.storage.isInitialized;
export const _selectStorageLoading = (state: { storage: StorageState }) =>
  state.storage.isLoading;
export const _selectStorageError = (state: { storage: StorageState }) =>
  state.storage.error;
export const _selectCurrentStrategy = (state: { storage: StorageState }) =>
  state.storage.currentStrategy;
export const _selectStorageStats = (state: { storage: StorageState }) =>
  state.storage.stats;
export const _selectPerformanceReport = (state: { storage: StorageState }) =>
  state.storage.performanceReport;
export const _selectQueryResults = (state: { storage: StorageState }) =>
  state.storage.queryResults;
export const _selectQueryLoading = (state: { storage: StorageState }) =>
  state.storage.queryLoading;
export const _selectLastOperation = (state: { storage: StorageState }) =>
  state.storage.lastOperation;
export const _selectRecommendations = (state: { storage: StorageState }) =>
  state.storage.recommendations;
export const _selectPredictedNeeds = (state: { storage: StorageState }) =>
  state.storage.predictedNeeds;
export const _selectAutoOptimize = (state: { storage: StorageState }) =>
  state.storage.autoOptimize;

// 導出 reducer
export default storageSlice.reducer;
