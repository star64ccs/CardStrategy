import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { logger } from '../../core/utils/logger';
import { cardRecognitionService } from '../../features/cards/services/cardRecognitionService';
import type {
  CardRecognitionRequest,
  RecognitionState,
  RecognitionHistory,
  BatchRecognitionRequest,
  BatchRecognitionResponse,
  RealtimeRecognitionFrame,
  RecognitionConfig,
  UserFeedback,
  AlternativeResult,
} from '../../features/cards/types/recognition';
import {
  CardRecognitionResponse,
  CardRecognitionResult,
  RecognitionStats,
} from '../../features/cards/types/recognition';

// 異步 Thunk Actions

/**
 * 初始化卡牌識別服務
 */
export const _initializeRecognition = createAsyncThunk(
  'cardRecognition/initialize',
  async (_, { rejectWithValue }) => {
    try {
      await cardRecognitionService.initialize();
      const _config = cardRecognitionService.getConfig();
      const _supportedGames = cardRecognitionService.getSupportedGames();
      return { config, supportedGames };
    } catch (error: unknown) {
      logger.error('初始化卡牌識別失敗:', error);
      return rejectWithValue(error.message || '初始化卡牌識別失敗');
    }
  }
);

/**
 * 識別卡牌
 */
export const _recognizeCard = createAsyncThunk(
  'cardRecognition/recognizeCard',
  async (request: CardRecognitionRequest, { rejectWithValue }) => {
    try {
      const _response = await cardRecognitionService.recognizeCard(request);
      return { request, response };
    } catch (error: unknown) {
      logger.error('卡牌識別失敗:', error);
      return rejectWithValue(error.message || '卡牌識別失敗');
    }
  }
);

/**
 * 批量識別卡牌
 */
export const _recognizeCardsBatch = createAsyncThunk(
  'cardRecognition/recognizeCardsBatch',
  async (request: BatchRecognitionRequest, { rejectWithValue }) => {
    try {
      const _response =
        await cardRecognitionService.recognizeCardsBatch(request);
      return response;
    } catch (error: unknown) {
      logger.error('批量卡牌識別失敗:', error);
      return rejectWithValue(error.message || '批量卡牌識別失敗');
    }
  }
);

/**
 * 獲取識別歷史
 */
export const _getRecognitionHistory = createAsyncThunk(
  'cardRecognition/getHistory',
  async (params: { userId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const _history = await cardRecognitionService.getRecognitionHistory(
        params.userId,
        params.limit
      );
      return history;
    } catch (error: unknown) {
      logger.error('獲取識別歷史失敗:', error);
      return rejectWithValue(error.message || '獲取識別歷史失敗');
    }
  }
);

/**
 * 提交用戶反饋
 */
export const _submitUserFeedback = createAsyncThunk(
  'cardRecognition/submitFeedback',
  async (
    params: { historyId: string; feedback: UserFeedback },
    { rejectWithValue }
  ) => {
    try {
      await cardRecognitionService.submitUserFeedback(
        params.historyId,
        params.feedback
      );
      return params;
    } catch (error: unknown) {
      logger.error('提交用戶反饋失敗:', error);
      return rejectWithValue(error.message || '提交用戶反饋失敗');
    }
  }
);

/**
 * 獲取識別統計
 */
export const _getRecognitionStats = createAsyncThunk(
  'cardRecognition/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const _stats = await cardRecognitionService.getRecognitionStats();
      return stats;
    } catch (error: unknown) {
      logger.error('獲取識別統計失敗:', error);
      return rejectWithValue(error.message || '獲取識別統計失敗');
    }
  }
);

/**
 * 更新配置
 */
export const _updateRecognitionConfig = createAsyncThunk(
  'cardRecognition/updateConfig',
  async (updates: Partial<RecognitionConfig>, { rejectWithValue }) => {
    try {
      await cardRecognitionService.updateConfig(updates);
      const _newConfig = cardRecognitionService.getConfig();
      return newConfig;
    } catch (error: unknown) {
      logger.error('更新識別配置失敗:', error);
      return rejectWithValue(error.message || '更新識別配置失敗');
    }
  }
);

/**
 * 獲取批量作業狀態
 */
export const _getBatchJobStatus = createAsyncThunk(
  'cardRecognition/getBatchStatus',
  async (batchId: string, { rejectWithValue }) => {
    try {
      const _status = cardRecognitionService.getBatchJobStatus(batchId);
      if (!status) {
        return rejectWithValue('批量作業不存在');
      }
      return status;
    } catch (error: unknown) {
      logger.error('獲取批量作業狀態失敗:', error);
      return rejectWithValue(error.message || '獲取批量作業狀態失敗');
    }
  }
);

// 初始狀態
const initialState: RecognitionState = {
  // 當前識別
  isRecognizing: false,
  currentRequest: null,
  currentResult: null,
  recognitionError: null,

  // 識別歷史
  history: [],
  isLoadingHistory: false,
  historyError: null,

  // 批量識別
  batchJobs: [],
  isBatchProcessing: false,
  batchError: null,

  // 實時識別
  isRealtimeActive: false,
  realtimeFrames: [],
  realtimeError: null,

  // 配置和設置
  config: {
    enabledGames: ['pokemon', 'yugioh', 'magic'],
    defaultOptions: {
      enableMultipleCards: false,
      enableTextExtraction: true,
      enableFeatureDetection: true,
      confidenceThreshold: 0.7,
      maxResults: 5,
      timeout: 30000,
      useCache: true,
    },
    qualityThresholds: {
      minimumResolution: { width: 480, height: 640 },
      minimumClarity: 0.5,
      maximumAngle: 30,
      maximumDistortion: 0.3,
    },
    modelSettings: {
      version: '1.0.0',
      confidence: 0.8,
      ensembleModels: true,
      fallbackModels: [],
      updateInterval: 24 * 60 * 60 * 1000,
    },
    cacheSettings: {
      enabled: true,
      ttl: 3600,
      maxSize: 100,
      strategy: 'lru',
    },
    retrySettings: {
      maxRetries: 3,
      backoffFactor: 2,
      maxBackoffTime: 30000,
      retryableErrors: ['NETWORK_ERROR', 'TIMEOUT'],
    },
  },
  isConfigLoading: false,
  configError: null,

  // 統計和分析
  stats: null,
  isStatsLoading: false,
  statsError: null,

  // UI 狀態
  selectedAlternative: null,
  showAlternatives: false,
  cropMode: false,
  cropData: null,
};

// Slice 定義
const _cardRecognitionSlice = createSlice({
  name: 'cardRecognition',
  initialState,
  reducers: {
    // 清除錯誤
    clearRecognitionError: state => {
      state.recognitionError = null;
    },
    clearHistoryError: state => {
      state.historyError = null;
    },
    clearBatchError: state => {
      state.batchError = null;
    },
    clearRealtimeError: state => {
      state.realtimeError = null;
    },
    clearConfigError: state => {
      state.configError = null;
    },
    clearStatsError: state => {
      state.statsError = null;
    },

    // 重置狀態
    resetRecognitionState: state => {
      state.isRecognizing = false;
      state.currentRequest = null;
      state.currentResult = null;
      state.recognitionError = null;
      state.selectedAlternative = null;
      state.showAlternatives = false;
    },

    // UI 狀態管理
    setSelectedAlternative: (
      state,
      action: PayloadAction<AlternativeResult | null>
    ) => {
      state.selectedAlternative = action.payload;
    },
    setShowAlternatives: (state, action: PayloadAction<boolean>) => {
      state.showAlternatives = action.payload;
    },
    setCropMode: (state, action: PayloadAction<boolean>) => {
      state.cropMode = action.payload;
    },
    setCropData: (
      state,
      action: PayloadAction<{
        x: number;
        y: number;
        width: number;
        height: number;
      } | null>
    ) => {
      state.cropData = action.payload;
    },

    // 實時識別管理
    startRealtimeRecognition: state => {
      state.isRealtimeActive = true;
      state.realtimeError = null;
      state.realtimeFrames = [];
    },
    stopRealtimeRecognition: state => {
      state.isRealtimeActive = false;
      state.realtimeFrames = [];
    },
    addRealtimeFrame: (
      state,
      action: PayloadAction<RealtimeRecognitionFrame>
    ) => {
      state.realtimeFrames.push(action.payload);
      // 保持最近 10 幀
      if (state.realtimeFrames.length > 10) {
        state.realtimeFrames = state.realtimeFrames.slice(-10);
      }
    },
    setRealtimeError: (state, action: PayloadAction<string>) => {
      state.realtimeError = action.payload;
      state.isRealtimeActive = false;
    },

    // 批量作業管理
    updateBatchJob: (
      state,
      action: PayloadAction<BatchRecognitionResponse>
    ) => {
      const _index = state.batchJobs.findIndex(
        job => job.batchId === action.payload.batchId
      );
      if (index >= 0) {
        state.batchJobs[index] = action.payload;
      } else {
        state.batchJobs.push(action.payload);
      }
    },
    removeBatchJob: (state, action: PayloadAction<string>) => {
      state.batchJobs = state.batchJobs.filter(
        job => job.batchId !== action.payload
      );
    },

    // 配置管理
    updateConfigLocal: (
      state,
      action: PayloadAction<Partial<RecognitionConfig>>
    ) => {
      state.config = { ...state.config, ...action.payload };
    },
  },
  extraReducers: builder => {
    // 初始化識別服務
    builder
      .addCase(initializeRecognition.pending, state => {
        state.isConfigLoading = true;
        state.configError = null;
      })
      .addCase(initializeRecognition.fulfilled, (state, action) => {
        state.isConfigLoading = false;
        state.config = action.payload.config;
      })
      .addCase(initializeRecognition.rejected, (state, action) => {
        state.isConfigLoading = false;
        state.configError = action.payload as string;
      });

    // 識別卡牌
    builder
      .addCase(recognizeCard.pending, (state, action) => {
        state.isRecognizing = true;
        state.recognitionError = null;
        state.currentRequest = action.meta.arg;
        state.currentResult = null;
      })
      .addCase(recognizeCard.fulfilled, (state, action) => {
        state.isRecognizing = false;
        state.currentResult = action.payload.response.results[0] || null;

        // 如果識別成功，添加到歷史記錄
        if (
          action.payload.response.success &&
          action.payload.response.results.length > 0
        ) {
          const historyEntry: RecognitionHistory = {
            id: `history_${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 'current_user',
            request: action.payload.request,
            response: action.payload.response,
            success: true,
            processingTime: action.payload.response.processingTime,
            confidence: action.payload.response.results[0].confidence,
            recognizedCard: action.payload.response.results[0].card,
            metadata: {
              userAgent: 'CardStrategy/1.0.0',
              platform: 'mobile',
              version: '1.0.0',
            },
          };
          state.history.unshift(historyEntry);

          // 保持歷史記錄最多 100 條
          if (state.history.length > 100) {
            state.history = state.history.slice(0, 100);
          }
        }
      })
      .addCase(recognizeCard.rejected, (state, action) => {
        state.isRecognizing = false;
        state.recognitionError = action.payload as string;
        state.currentResult = null;
      });

    // 批量識別
    builder
      .addCase(recognizeCardsBatch.pending, state => {
        state.isBatchProcessing = true;
        state.batchError = null;
      })
      .addCase(recognizeCardsBatch.fulfilled, (state, action) => {
        state.isBatchProcessing = false;
        state.batchJobs.push(action.payload);
      })
      .addCase(recognizeCardsBatch.rejected, (state, action) => {
        state.isBatchProcessing = false;
        state.batchError = action.payload as string;
      });

    // 獲取識別歷史
    builder
      .addCase(getRecognitionHistory.pending, state => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(getRecognitionHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.history = action.payload;
      })
      .addCase(getRecognitionHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = action.payload as string;
      });

    // 提交用戶反饋
    builder.addCase(submitUserFeedback.fulfilled, (state, action) => {
      const _historyIndex = state.history.findIndex(
        h => h.id === action.payload.historyId
      );
      if (historyIndex >= 0) {
        state.history[historyIndex].userFeedback = action.payload.feedback;
      }
    });

    // 獲取識別統計
    builder
      .addCase(getRecognitionStats.pending, state => {
        state.isStatsLoading = true;
        state.statsError = null;
      })
      .addCase(getRecognitionStats.fulfilled, (state, action) => {
        state.isStatsLoading = false;
        state.stats = action.payload;
      })
      .addCase(getRecognitionStats.rejected, (state, action) => {
        state.isStatsLoading = false;
        state.statsError = action.payload as string;
      });

    // 更新配置
    builder
      .addCase(updateRecognitionConfig.pending, state => {
        state.isConfigLoading = true;
        state.configError = null;
      })
      .addCase(updateRecognitionConfig.fulfilled, (state, action) => {
        state.isConfigLoading = false;
        state.config = action.payload;
      })
      .addCase(updateRecognitionConfig.rejected, (state, action) => {
        state.isConfigLoading = false;
        state.configError = action.payload as string;
      });

    // 獲取批量作業狀態
    builder.addCase(getBatchJobStatus.fulfilled, (state, action) => {
      const _index = state.batchJobs.findIndex(
        job => job.batchId === action.payload.batchId
      );
      if (index >= 0) {
        state.batchJobs[index] = action.payload;
      }
    });
  },
});

// 導出 Actions
export const {
  clearRecognitionError,
  clearHistoryError,
  clearBatchError,
  clearRealtimeError,
  clearConfigError,
  clearStatsError,
  resetRecognitionState,
  setSelectedAlternative,
  setShowAlternatives,
  setCropMode,
  setCropData,
  startRealtimeRecognition,
  stopRealtimeRecognition,
  addRealtimeFrame,
  setRealtimeError,
  updateBatchJob,
  removeBatchJob,
  updateConfigLocal,
} = cardRecognitionSlice.actions;

// Selectors
export const _selectIsRecognizing = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.isRecognizing;

export const _selectCurrentResult = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.currentResult;

export const _selectRecognitionError = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.recognitionError;

export const _selectRecognitionHistory = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.history;

export const _selectIsLoadingHistory = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.isLoadingHistory;

export const _selectHistoryError = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.historyError;

export const _selectBatchJobs = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.batchJobs;

export const _selectIsBatchProcessing = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.isBatchProcessing;

export const _selectBatchError = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.batchError;

export const _selectIsRealtimeActive = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.isRealtimeActive;

export const _selectRealtimeFrames = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.realtimeFrames;

export const _selectRealtimeError = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.realtimeError;

export const _selectRecognitionConfig = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.config;

export const _selectIsConfigLoading = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.isConfigLoading;

export const _selectConfigError = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.configError;

export const _selectRecognitionStats = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.stats;

export const _selectIsStatsLoading = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.isStatsLoading;

export const _selectStatsError = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.statsError;

export const _selectSelectedAlternative = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.selectedAlternative;

export const _selectShowAlternatives = (state: {
  cardRecognition: RecognitionState;
}) => state.cardRecognition.showAlternatives;

export const _selectCropMode = (state: { cardRecognition: RecognitionState }) =>
  state.cardRecognition.cropMode;

export const _selectCropData = (state: { cardRecognition: RecognitionState }) =>
  state.cardRecognition.cropData;

export default cardRecognitionSlice.reducer;
