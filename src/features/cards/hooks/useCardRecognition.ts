import { useCallback, useEffect, useRef } from 'react';

import { logger } from '../../../core/utils/logger';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  initializeRecognition,
  recognizeCard,
  recognizeCardsBatch,
  getRecognitionHistory,
  submitUserFeedback,
  getRecognitionStats,
  updateRecognitionConfig,
  getBatchJobStatus,
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
  selectIsRecognizing,
  selectCurrentResult,
  selectRecognitionError,
  selectRecognitionHistory,
  selectIsLoadingHistory,
  selectHistoryError,
  selectBatchJobs,
  selectIsBatchProcessing,
  selectBatchError,
  selectIsRealtimeActive,
  selectRealtimeFrames,
  selectRealtimeError,
  selectRecognitionConfig,
  selectIsConfigLoading,
  selectConfigError,
  selectRecognitionStats,
  selectIsStatsLoading,
  selectStatsError,
  selectSelectedAlternative,
  selectShowAlternatives,
  selectCropMode,
  selectCropData,
} from '../../../store/slices/cardRecognitionSlice';
import { cardRecognitionService } from '../services/cardRecognitionService';
import type {
  CardRecognitionRequest,
  CardRecognitionResult,
  RecognitionConfig,
  RecognitionHistory,
  RecognitionStats,
  BatchRecognitionRequest,
  BatchRecognitionResponse,
  RealtimeRecognitionFrame,
  UserFeedback,
  AlternativeResult,
  CardGame,
} from '../types/recognition';

export interface UseCardRecognitionOptions {
  autoInitialize?: boolean;
  autoLoadHistory?: boolean;
  autoLoadStats?: boolean;
  onRecognitionComplete?: (result: CardRecognitionResult) => void;
  onRecognitionError?: (error: string) => void;
  onRealtimeFrame?: (frame: RealtimeRecognitionFrame) => void;
  onBatchComplete?: (batch: BatchRecognitionResponse) => void;
}

export interface UseCardRecognitionReturn {
  // Status
  isRecognizing: boolean;
  currentResult: CardRecognitionResult | null;
  recognitionError: string | null;

  // 歷史Record
  history: RecognitionHistory[];
  isLoadingHistory: boolean;
  historyError: string | null;

  // BatchHandle
  batchJobs: BatchRecognitionResponse[];
  isBatchProcessing: boolean;
  batchError: string | null;

  // 實時識別
  isRealtimeActive: boolean;
  realtimeFrames: RealtimeRecognitionFrame[];
  realtimeError: string | null;

  // Configure
  config: RecognitionConfig;
  isConfigLoading: boolean;
  configError: string | null;

  // Statistics
  stats: RecognitionStats | null;
  isStatsLoading: boolean;
  statsError: string | null;

  // UI Status
  selectedAlternative: AlternativeResult | null;
  showAlternatives: boolean;
  cropMode: boolean;
  cropData: { x: number; y: number; width: number; height: number } | null;

  // OperationMethod
  initialize: () => Promise<void>;
  recognize: (request: CardRecognitionRequest) => Promise<void>;
  recognizeBatch: (request: BatchRecognitionRequest) => Promise<void>;
  loadHistory: (userId: string, limit?: number) => Promise<void>;
  submitFeedback: (historyId: string, feedback: UserFeedback) => Promise<void>;
  loadStats: () => Promise<void>;
  updateConfig: (updates: Partial<RecognitionConfig>) => Promise<void>;

  // 實時識別Control
  startRealtime: (options?: {
    onFrame?: (frame: RealtimeRecognitionFrame) => void;
    frameRate?: number;
  }) => Promise<void>;
  stopRealtime: () => void;

  // BatchHandleControl
  getBatchStatus: (batchId: string) => Promise<void>;
  cancelBatch: (batchId: string) => void;
  clearBatch: (batchId: string) => void;

  // UI Control
  selectAlternative: (alternative: AlternativeResult | null) => void;
  toggleAlternatives: () => void;
  enableCropMode: () => void;
  disableCropMode: () => void;
  updateCropData: (
    data: { x: number; y: number; width: number; height: number } | null
  ) => void;

  // ErrorHandle
  clearErrors: () => void;
  clearRecognitionError: () => void;
  clearHistoryError: () => void;
  clearBatchError: () => void;
  clearRealtimeError: () => void;
  clearConfigError: () => void;
  clearStatsError: () => void;

  // Reset
  reset: () => void;

  // ToolMethod
  getSupportedGames: () => CardGame[];
  isGameSupported: (game: CardGame) => boolean;
  getDefaultOptions: () => any;
  validateImage: (imageData: string) => { valid: boolean; error?: string };
  formatProcessingTime: (ms: number) => string;
  getConfidenceLevel: (
    confidence: number
  ) => 'low' | 'medium' | 'high' | 'very_high';
}

export const _useCardRecognition = (
  options: UseCardRecognitionOptions = {}
): UseCardRecognitionReturn => {
  const _dispatch = useAppDispatch();
  const _realtimeRef = useRef<NodeJS.Timeout | null>(null);

  const {
    autoInitialize = true,
    autoLoadHistory = false,
    autoLoadStats = false,
    onRecognitionComplete,
    onRecognitionError,
    onRealtimeFrame,
    onBatchComplete,
  } = options;

  // Selectors
  const _isRecognizing = useAppSelector(selectIsRecognizing);
  const _currentResult = useAppSelector(selectCurrentResult);
  const _recognitionError = useAppSelector(selectRecognitionError);

  const _history = useAppSelector(selectRecognitionHistory);
  const _isLoadingHistory = useAppSelector(selectIsLoadingHistory);
  const _historyError = useAppSelector(selectHistoryError);

  const _batchJobs = useAppSelector(selectBatchJobs);
  const _isBatchProcessing = useAppSelector(selectIsBatchProcessing);
  const _batchError = useAppSelector(selectBatchError);

  const _isRealtimeActive = useAppSelector(selectIsRealtimeActive);
  const _realtimeFrames = useAppSelector(selectRealtimeFrames);
  const _realtimeError = useAppSelector(selectRealtimeError);

  const _config = useAppSelector(selectRecognitionConfig);
  const _isConfigLoading = useAppSelector(selectIsConfigLoading);
  const _configError = useAppSelector(selectConfigError);

  const _stats = useAppSelector(selectRecognitionStats);
  const _isStatsLoading = useAppSelector(selectIsStatsLoading);
  const _statsError = useAppSelector(selectStatsError);

  const _selectedAlternative = useAppSelector(selectSelectedAlternative);
  const _showAlternatives = useAppSelector(selectShowAlternatives);
  const _cropMode = useAppSelector(selectCropMode);
  const _cropData = useAppSelector(selectCropData);

  // OperationMethod
  const _initialize = useCallback(async () => {
    try {
      await dispatch(initializeRecognition()).unwrap();
      logger.info('卡牌識別InitializeSuccess');
    } catch (error: unknown) {
      logger.error('卡牌識別InitializeFailed:', error);
      onRecognitionError?.(error.message || 'InitializeFailed');
    }
  }, [dispatch, onRecognitionError]);

  const _recognize = useCallback(
    async (request: CardRecognitionRequest) => {
      try {
        const _result = await dispatch(recognizeCard(request)).unwrap();
        if (result.response.success && result.response.results.length > 0) {
          onRecognitionComplete?.(result.response.results[0]);
        }
        logger.info('卡牌識別Success:', {
          confidence: result.response.results[0]?.confidence,
        });
      } catch (error: unknown) {
        logger.error('卡牌識別Failed:', error);
        onRecognitionError?.(error.message || '識別Failed');
      }
    },
    [dispatch, onRecognitionComplete, onRecognitionError]
  );

  const _recognizeBatch = useCallback(
    async (request: BatchRecognitionRequest) => {
      try {
        const _batch = await dispatch(recognizeCardsBatch(request)).unwrap();
        logger.info('批量識別已啟動:', {
          batchId: batch.batchId,
          totalImages: batch.totalImages,
        });

        // 輪詢Batch作業Status
        const _pollBatchStatus = async () => {
          try {
            const _status = await dispatch(
              getBatchJobStatus(batch.batchId)
            ).unwrap();
            dispatch(updateBatchJob(status));

            if (status.status === 'completed') {
              onBatchComplete?.(status);
              logger.info('批量識別完成:', { batchId: status.batchId });
            } else if (status.status === 'processing') {
              // Continue輪詢
              setTimeout(pollBatchStatus, 2000);
            }
          } catch (error: unknown) {
            logger.error('Get批量狀態Failed:', error);
          }
        };

        // Begin輪詢
        setTimeout(pollBatchStatus, 1000);
      } catch (error: unknown) {
        logger.error('批量識別啟動Failed:', error);
        onRecognitionError?.(error.message || '批量識別Failed');
      }
    },
    [dispatch, onBatchComplete, onRecognitionError]
  );

  const _loadHistory = useCallback(
    async (userId: string, limit?: number) => {
      try {
        await dispatch(getRecognitionHistory({ userId, limit })).unwrap();
        logger.info('識別歷史加載Success');
      } catch (error: unknown) {
        logger.error('加載識別歷史Failed:', error);
      }
    },
    [dispatch]
  );

  const _submitFeedback = useCallback(
    async (historyId: string, feedback: UserFeedback) => {
      try {
        await dispatch(submitUserFeedback({ historyId, feedback })).unwrap();
        logger.info('用戶反饋提交Success:', {
          historyId,
          isCorrect: feedback.isCorrect,
        });
      } catch (error: unknown) {
        logger.error('提交用戶反饋Failed:', error);
      }
    },
    [dispatch]
  );

  const _loadStats = useCallback(async () => {
    try {
      await dispatch(getRecognitionStats()).unwrap();
      logger.info('識別統計加載Success');
    } catch (error: unknown) {
      logger.error('加載識別統計Failed:', error);
    }
  }, [dispatch]);

  const _updateConfig = useCallback(
    async (updates: Partial<RecognitionConfig>) => {
      try {
        await dispatch(updateRecognitionConfig(updates)).unwrap();
        logger.info('識別ConfigureUpdateSuccess');
      } catch (error: unknown) {
        logger.error('Update識別ConfigureFailed:', error);
      }
    },
    [dispatch]
  );

  // 實時識別Control
  const _startRealtime = useCallback(
    async (
      options: {
        onFrame?: (frame: RealtimeRecognitionFrame) => void;
        frameRate?: number;
      } = {}
    ) => {
      try {
        const { onFrame, frameRate = 30 } = options;

        dispatch(startRealtimeRecognition());

        await cardRecognitionService.startRealtimeRecognition(
          (frame: RealtimeRecognitionFrame) => {
            dispatch(addRealtimeFrame(frame));
            onFrame?.(frame);
            onRealtimeFrame?.(frame);
          }
        );

        logger.info('實時識別已啟動');
      } catch (error: unknown) {
        logger.error('啟動實時識別Failed:', error);
        dispatch(setRealtimeError(error.message || '啟動實時識別Failed'));
      }
    },
    [dispatch, onRealtimeFrame]
  );

  const _stopRealtime = useCallback(() => {
    cardRecognitionService.stopRealtimeRecognition();
    dispatch(stopRealtimeRecognition());
    logger.info('實時識別已停止');
  }, [dispatch]);

  // BatchHandleControl
  const _getBatchStatus = useCallback(
    async (batchId: string) => {
      try {
        await dispatch(getBatchJobStatus(batchId)).unwrap();
      } catch (error: unknown) {
        logger.error('Get批量狀態Failed:', error);
      }
    },
    [dispatch]
  );

  const _cancelBatch = useCallback((batchId: string) => {
    // 在實際實現中，這裡會調用Service來CancelBatch作業
    logger.info('取消批量作業:', { batchId });
  }, []);

  const _clearBatch = useCallback(
    (batchId: string) => {
      dispatch(removeBatchJob(batchId));
    },
    [dispatch]
  );

  // UI Control
  const _selectAlternative = useCallback(
    (alternative: AlternativeResult | null) => {
      dispatch(setSelectedAlternative(alternative));
    },
    [dispatch]
  );

  const _toggleAlternatives = useCallback(() => {
    dispatch(setShowAlternatives(!showAlternatives));
  }, [dispatch, showAlternatives]);

  const _enableCropMode = useCallback(() => {
    dispatch(setCropMode(true));
  }, [dispatch]);

  const _disableCropMode = useCallback(() => {
    dispatch(setCropMode(false));
    dispatch(setCropData(null));
  }, [dispatch]);

  const _updateCropData = useCallback(
    (data: { x: number; y: number; width: number; height: number } | null) => {
      dispatch(setCropData(data));
    },
    [dispatch]
  );

  // ErrorHandle
  const _clearErrors = useCallback(() => {
    dispatch(clearRecognitionError());
    dispatch(clearHistoryError());
    dispatch(clearBatchError());
    dispatch(clearRealtimeError());
    dispatch(clearConfigError());
    dispatch(clearStatsError());
  }, [dispatch]);

  const _clearRecognitionErrorAction = useCallback(() => {
    dispatch(clearRecognitionError());
  }, [dispatch]);

  const _clearHistoryErrorAction = useCallback(() => {
    dispatch(clearHistoryError());
  }, [dispatch]);

  const _clearBatchErrorAction = useCallback(() => {
    dispatch(clearBatchError());
  }, [dispatch]);

  const _clearRealtimeErrorAction = useCallback(() => {
    dispatch(clearRealtimeError());
  }, [dispatch]);

  const _clearConfigErrorAction = useCallback(() => {
    dispatch(clearConfigError());
  }, [dispatch]);

  const _clearStatsErrorAction = useCallback(() => {
    dispatch(clearStatsError());
  }, [dispatch]);

  // Reset
  const _reset = useCallback(() => {
    dispatch(resetRecognitionState());
    stopRealtime();
  }, [dispatch, stopRealtime]);

  // ToolMethod
  const _getSupportedGames = useCallback((): CardGame[] => {
    return cardRecognitionService.getSupportedGames();
  }, []);

  const _isGameSupported = useCallback(
    (game: CardGame): boolean => {
      return config.enabledGames.includes(game);
    },
    [config.enabledGames]
  );

  const _getDefaultOptions = useCallback(() => {
    return config.defaultOptions;
  }, [config.defaultOptions]);

  const _validateImage = useCallback(
    (imageData: string): { valid: boolean; error?: string } => {
      try {
        if (!imageData) {
          return { valid: false, error: '圖像數據不能為空' };
        }

        // Check Base64 格式
        if (
          !imageData.startsWith('data:image/') &&
          !imageData.match(/^[A-Za-z0-9+/]*={0,2}$/)
        ) {
          return { valid: false, error: '無效的圖像格式' };
        }

        // CheckGraph像大小
        const _imageSizeKB = (imageData.length * 3) / 4 / 1024;
        if (imageSizeKB > 10240) {
          return {
            valid: false,
            error: '圖像文件過大，請使用小於 10MB 的圖像',
          };
        }

        if (imageSizeKB < 10) {
          return { valid: false, error: '圖像文件過小，請使用更清晰的圖像' };
        }

        return { valid: true };
      } catch (error: unknown) {
        return { valid: false, error: `圖像VerifyFailed: ${error.message}` };
      }
    },
    []
  );

  const _formatProcessingTime = useCallback((ms: number): string => {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}秒`;
    } else {
      const _minutes = Math.floor(ms / 60000);
      const _seconds = Math.floor((ms % 60000) / 1000);
      return `${minutes}分${seconds}秒`;
    }
  }, []);

  const _getConfidenceLevel = useCallback(
    (confidence: number): 'low' | 'medium' | 'high' | 'very_high' => {
      if (confidence >= 0.9) return 'very_high';
      if (confidence >= 0.75) return 'high';
      if (confidence >= 0.6) return 'medium';
      return 'low';
    },
    []
  );

  // AutoInitialize
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize, initialize]);

  // Auto加載歷史
  useEffect(() => {
    if (autoLoadHistory) {
      loadHistory('current_user'); // 在實際實現中從AuthenticateStatusGetUserID
    }
  }, [autoLoadHistory, loadHistory]);

  // Auto加載Statistics
  useEffect(() => {
    if (autoLoadStats) {
      loadStats();
    }
  }, [autoLoadStats, loadStats]);

  // 清理實時識別
  useEffect(() => {
    return () => {
      if (isRealtimeActive) {
        stopRealtime();
      }
    };
  }, [isRealtimeActive, stopRealtime]);

  return {
    // Status
    isRecognizing,
    currentResult,
    recognitionError,

    // 歷史Record
    history,
    isLoadingHistory,
    historyError,

    // BatchHandle
    batchJobs,
    isBatchProcessing,
    batchError,

    // 實時識別
    isRealtimeActive,
    realtimeFrames,
    realtimeError,

    // Configure
    config,
    isConfigLoading,
    configError,

    // Statistics
    stats,
    isStatsLoading,
    statsError,

    // UI Status
    selectedAlternative,
    showAlternatives,
    cropMode,
    cropData,

    // OperationMethod
    initialize,
    recognize,
    recognizeBatch,
    loadHistory,
    submitFeedback,
    loadStats,
    updateConfig,

    // 實時識別Control
    startRealtime,
    stopRealtime,

    // BatchHandleControl
    getBatchStatus,
    cancelBatch,
    clearBatch,

    // UI Control
    selectAlternative,
    toggleAlternatives,
    enableCropMode,
    disableCropMode,
    updateCropData,

    // ErrorHandle
    clearErrors,
    clearRecognitionError: clearRecognitionErrorAction,
    clearHistoryError: clearHistoryErrorAction,
    clearBatchError: clearBatchErrorAction,
    clearRealtimeError: clearRealtimeErrorAction,
    clearConfigError: clearConfigErrorAction,
    clearStatsError: clearStatsErrorAction,

    // Reset
    reset,

    // ToolMethod
    getSupportedGames,
    isGameSupported,
    getDefaultOptions,
    validateImage,
    formatProcessingTime,
    getConfidenceLevel,
  };
};
