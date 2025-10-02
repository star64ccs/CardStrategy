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

// StatusInterface
interface StorageState {
  // ServiceStatus
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // StorageConfigure
  currentStrategy: StorageStrategy;
  autoOptimize: boolean;

  // 統Count據
  stats: StorageStats | null;
  performanceReport: unknown | null;

  // Query結果
  queryResults: StorageItem[];
  queryLoading: boolean;

  // OperationStatus
  lastOperation: {
    type: string;
    key: string;
    success: boolean;
    timestamp: Date;
  } | null;

  // 推薦Configure
  recommendations: string[];
  predictedNeeds: unknown | null;
}

// 初始Status
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

// AsyncOperation

/**
 * InitializeStorageService
 */
export const _initializeStorageService = createAsyncThunk(
  'storage/initializeService',
  async (config?: unknown) => {
    const _storageService = MultiLayerStorageService.getInstance();
    const _strategyManager = StorageStrategyManager.getInstance();

    const _storageSuccess = await storageService.initialize(config);
    const _strategySuccess = await strategyManager.initialize(config?.adaptive);

    if (!storageSuccess || !strategySuccess) {
      throw new Error('存儲ServiceInitializeFailed');
    }

    return {
      strategy: strategyManager.getCurrentStrategy(),
      success: true,
    };
  }
);

/**
 * SettingsData
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
      throw new Error(result.error || '數據存儲Failed');
    }

    return { key, success: true };
  }
);

/**
 * GetData
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
 * DeleteData
 */
export const _deleteStorageData = createAsyncThunk(
  'storage/deleteData',
  async (key: string) => {
    const _storageService = MultiLayerStorageService.getInstance();
    const _result = await storageService.delete(key);

    if (!result.success) {
      throw new Error(result.error || '數據DeleteFailed');
    }

    return { key, success: true };
  }
);

/**
 * QueryData
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
 * GetStorageStatistics
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
 * ManualSync
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
 * 清理Storage
 */
export const _cleanupStorage = createAsyncThunk('storage/cleanup', async () => {
  const _storageService = MultiLayerStorageService.getInstance();
  const _result = await storageService.cleanup();

  return result;
});

/**
 * SettingsStorage策略
 */
export const _setStorageStrategy = createAsyncThunk(
  'storage/setStrategy',
  async (strategy: StorageStrategy) => {
    const _strategyManager = StorageStrategyManager.getInstance();
    const _success = await strategyManager.setStrategy(strategy);

    if (!success) {
      throw new Error('Settings存儲策略Failed');
    }

    return { strategy, success };
  }
);

/**
 * 優化Storage策略
 */
export const _optimizeStorageStrategy = createAsyncThunk(
  'storage/optimizeStrategy',
  async () => {
    const _strategyManager = StorageStrategyManager.getInstance();
    const _success = await strategyManager.optimizeStrategy();

    if (!success) {
      throw new Error('優化存儲策略Failed');
    }

    const _currentStrategy = strategyManager.getCurrentStrategy();
    return { strategy: currentStrategy, success };
  }
);

/**
 * Get性能Report
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
 * GetStorage建議
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

    return { options, recommendations: [] }; // 可以Add更多建議邏輯
  }
);

/**
 * 預測Storage需求
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
 * 銷毀StorageService
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

// Create slice
const _storageSlice = createSlice({
  name: 'storage',
  initialState,
  reducers: {
    // ResetStatus
    resetStorageState: state => {
      return { ...initialState };
    },

    // SettingsError
    setStorageError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // ClearError
    clearStorageError: state => {
      state.error = null;
    },

    // SettingsAuto優化
    setAutoOptimize: (state, action: PayloadAction<boolean>) => {
      state.autoOptimize = action.payload;
    },

    // Update最後Operation
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

    // ClearQuery結果
    clearQueryResults: state => {
      state.queryResults = [];
      state.queryLoading = false;
    },

    // Add推薦
    addRecommendation: (state, action: PayloadAction<string>) => {
      if (!state.recommendations.includes(action.payload)) {
        state.recommendations.push(action.payload);
      }
    },

    // Clear推薦
    clearRecommendations: state => {
      state.recommendations = [];
    },
  },
  extraReducers: builder => {
    // InitializeStorageService
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
        state.error = action.error.message || 'InitializeFailed';
      });

    // SettingsData
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
        state.error = action.error.message || '數據存儲Failed';
      });

    // GetData
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
        state.error = action.error.message || '數據GetFailed';
      });

    // DeleteData
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
        state.error = action.error.message || '數據DeleteFailed';
      });

    // QueryData
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
        state.error = action.error.message || '數據查詢Failed';
      });

    // GetStatistics
    builder
      .addCase(getStorageStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(getStorageStats.rejected, (state, action) => {
        state.error = action.error.message || 'Get統計Failed';
      });

    // SyncData
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
        state.error = action.error.message || '同步Failed';
      });

    // 清理Storage
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
        state.error = action.error.message || '清理Failed';
      });

    // Settings策略
    builder
      .addCase(setStorageStrategy.fulfilled, (state, action) => {
        state.currentStrategy = action.payload.strategy;
      })
      .addCase(setStorageStrategy.rejected, (state, action) => {
        state.error = action.error.message || 'Settings策略Failed';
      });

    // 優化策略
    builder
      .addCase(optimizeStorageStrategy.fulfilled, (state, action) => {
        state.currentStrategy = action.payload.strategy;
      })
      .addCase(optimizeStorageStrategy.rejected, (state, action) => {
        state.error = action.error.message || '優化策略Failed';
      });

    // 性能Report
    builder
      .addCase(getPerformanceReport.fulfilled, (state, action) => {
        state.performanceReport = action.payload;
        state.recommendations = action.payload.recommendations;
      })
      .addCase(getPerformanceReport.rejected, (state, action) => {
        state.error = action.error.message || 'Get性能報告Failed';
      });

    // Storage建議
    builder
      .addCase(getStorageRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload.recommendations;
      })
      .addCase(getStorageRecommendations.rejected, (state, action) => {
        state.error = action.error.message || 'Get建議Failed';
      });

    // 預測需求
    builder
      .addCase(predictStorageNeeds.fulfilled, (state, action) => {
        state.predictedNeeds = action.payload;
      })
      .addCase(predictStorageNeeds.rejected, (state, action) => {
        state.error = action.error.message || '預測Failed';
      });

    // 銷毀Service
    builder
      .addCase(destroyStorageService.fulfilled, state => {
        return { ...initialState };
      })
      .addCase(destroyStorageService.rejected, (state, action) => {
        state.error = action.error.message || '銷毀ServiceFailed';
      });
  },
});

// Export actions
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

// Select器
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

// Export reducer
export default storageSlice.reducer;
