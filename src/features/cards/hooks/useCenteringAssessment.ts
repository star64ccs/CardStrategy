import { useCallback, useEffect } from 'react';

import { logger } from '../../../core/utils/logger';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  initializeCenteringAssessment,
  assessCentering,
  getAssessmentHistory,
  getAssessmentStats,
  selectIsAssessing,
  selectAssessmentResult,
  selectAssessmentError,
  selectAssessmentHistory,
  selectAssessmentStats,
  selectCurrentImage,
  selectAssessmentOptions,
  selectIsLoadingHistory,
  selectHistoryError,
  selectIsLoadingStats,
  selectStatsError,
  selectIsOptionsLoading,
  selectOptionsError,
  clearAssessmentError,
  clearHistoryError,
  clearStatsError,
  clearOptionsError,
  setCurrentAssessmentImage,
  clearAssessmentResult,
  updateAssessmentOptions,
} from '../../../store/slices/centeringAssessmentSlice';
import type {
  CenteringAssessmentRequest,
  CenteringAssessmentResult,
  CenteringAssessmentError,
  CenteringAssessmentHistory,
  CenteringAssessmentStats,
  CenteringAssessmentOptions,
} from '../types/centering';

interface UseCenteringAssessmentOptions {
  autoInitialize?: boolean;
  onAssessmentSuccess?: (result: CenteringAssessmentResult) => void;
  onAssessmentError?: (error: CenteringAssessmentError) => void;
  onHistoryLoaded?: (history: CenteringAssessmentHistory[]) => void;
  onStatsLoaded?: (stats: CenteringAssessmentStats) => void;
}

interface UseCenteringAssessmentReturn {
  isAssessing: boolean;
  assessmentResult: CenteringAssessmentResult | null;
  assessmentError: CenteringAssessmentError | null;
  assessmentHistory: CenteringAssessmentHistory[];
  assessmentStats: CenteringAssessmentStats | null;
  currentImage: string | null;
  assessmentOptions: CenteringAssessmentOptions;
  isLoadingHistory: boolean;
  historyError: string | null;
  isLoadingStats: boolean;
  statsError: string | null;
  isOptionsLoading: boolean;
  optionsError: string | null;
  initialize: () => Promise<void>;
  assess: (
    request: CenteringAssessmentRequest
  ) => Promise<CenteringAssessmentResult | undefined>;
  getHistory: (userId: string, limit?: number) => Promise<void>;
  getStats: (userId: string) => Promise<void>;
  clearErrors: () => void;
  setCurrentImage: (image: string | null) => void;
  clearResult: () => void;
  updateOptions: (options: Partial<CenteringAssessmentOptions>) => void;
}

export const _useCenteringAssessment = (
  options: UseCenteringAssessmentOptions = {}
): UseCenteringAssessmentReturn => {
  const _dispatch = useAppDispatch();
  const {
    autoInitialize = true,
    onAssessmentSuccess,
    onAssessmentError,
    onHistoryLoaded,
    onStatsLoaded,
  } = options;

  // Selectors
  const _isAssessing = useAppSelector(selectIsAssessing);
  const _assessmentResult = useAppSelector(selectAssessmentResult);
  const _assessmentError = useAppSelector(selectAssessmentError);
  const _assessmentHistory = useAppSelector(selectAssessmentHistory);
  const _assessmentStats = useAppSelector(selectAssessmentStats);
  const _currentImage = useAppSelector(selectCurrentImage);
  const _assessmentOptions = useAppSelector(selectAssessmentOptions);
  const _isLoadingHistory = useAppSelector(selectIsLoadingHistory);
  const _historyError = useAppSelector(selectHistoryError);
  const _isLoadingStats = useAppSelector(selectIsLoadingStats);
  const _statsError = useAppSelector(selectStatsError);
  const _isOptionsLoading = useAppSelector(selectIsOptionsLoading);
  const _optionsError = useAppSelector(selectOptionsError);

  // Actions
  const _initialize = useCallback(async () => {
    try {
      await dispatch(initializeCenteringAssessment()).unwrap();
      logger.info('置中評估系統初始化成功');
    } catch (error: unknown) {
      logger.error('置中評估系統初始化失敗:', error);
      onAssessmentError?.(error);
    }
  }, [dispatch, onAssessmentError]);

  const _assess = useCallback(
    async (request: CenteringAssessmentRequest) => {
      try {
        const _result = await dispatch(assessCentering(request)).unwrap();
        onAssessmentSuccess?.(result);
        return result;
      } catch (error: unknown) {
        logger.error('置中評估失敗:', error);
        onAssessmentError?.(error);
        return undefined;
      }
    },
    [dispatch, onAssessmentSuccess, onAssessmentError]
  );

  const _getHistory = useCallback(
    async (userId: string, limit?: number) => {
      try {
        const _history = await dispatch(
          getAssessmentHistory({ userId, limit })
        ).unwrap();
        onHistoryLoaded?.(history);
      } catch (error: unknown) {
        logger.error('獲取評估歷史失敗:', error);
      }
    },
    [dispatch, onHistoryLoaded]
  );

  const _getStats = useCallback(
    async (userId: string) => {
      try {
        const _stats = await dispatch(getAssessmentStats(userId)).unwrap();
        onStatsLoaded?.(stats);
      } catch (error: unknown) {
        logger.error('獲取評估統計失敗:', error);
      }
    },
    [dispatch, onStatsLoaded]
  );

  const _clearErrors = useCallback(() => {
    dispatch(clearAssessmentError());
    dispatch(clearHistoryError());
    dispatch(clearStatsError());
    dispatch(clearOptionsError());
  }, [dispatch]);

  const _setImage = useCallback(
    (image: string | null) => {
      dispatch(setCurrentAssessmentImage(image));
    },
    [dispatch]
  );

  const _clearResult = useCallback(() => {
    dispatch(clearAssessmentResult());
  }, [dispatch]);

  const _updateOptions = useCallback(
    (options: Partial<CenteringAssessmentOptions>) => {
      dispatch(updateAssessmentOptions(options));
    },
    [dispatch]
  );

  // Auto-initialize
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize, initialize]);

  return {
    isAssessing,
    assessmentResult,
    assessmentError,
    assessmentHistory,
    assessmentStats,
    currentImage,
    assessmentOptions,
    isLoadingHistory,
    historyError,
    isLoadingStats,
    statsError,
    isOptionsLoading,
    optionsError,
    initialize,
    assess,
    getHistory,
    getStats,
    clearErrors,
    setCurrentImage: setImage,
    clearResult,
    updateOptions,
  };
};
