import { useCallback, useEffect } from 'react';

import { logger } from '../../../core/utils/logger';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  initializeAuthenticityCheck,
  checkAuthenticity,
  getCheckHistory,
  getCheckStats,
  selectIsChecking,
  selectCheckResult,
  selectCheckError,
  selectCheckHistory,
  selectCheckStats,
  selectCurrentImage,
  selectCheckOptions,
  selectIsLoadingHistory,
  selectHistoryError,
  selectIsLoadingStats,
  selectStatsError,
  selectIsOptionsLoading,
  selectOptionsError,
  clearCheckError,
  clearHistoryError,
  clearStatsError,
  clearOptionsError,
  setCurrentCheckImage,
  clearCheckResult,
  updateCheckOptions,
} from '../../../store/slices/authenticityCheckSlice';
import type {
  AuthenticityCheckRequest,
  AuthenticityCheckResult,
  AuthenticityCheckError,
  AuthenticityCheckHistory,
  AuthenticityCheckStats,
  AuthenticityCheckOptions,
} from '../types/authenticity';

interface UseAuthenticityCheckOptions {
  autoInitialize?: boolean;
  onCheckSuccess?: (result: AuthenticityCheckResult) => void;
  onCheckError?: (error: AuthenticityCheckError) => void;
  onHistoryLoaded?: (history: AuthenticityCheckHistory[]) => void;
  onStatsLoaded?: (stats: AuthenticityCheckStats) => void;
}

interface UseAuthenticityCheckReturn {
  isChecking: boolean;
  checkResult: AuthenticityCheckResult | null;
  checkError: AuthenticityCheckError | null;
  checkHistory: AuthenticityCheckHistory[];
  checkStats: AuthenticityCheckStats | null;
  currentImage: string | null;
  checkOptions: AuthenticityCheckOptions;
  isLoadingHistory: boolean;
  historyError: string | null;
  isLoadingStats: boolean;
  statsError: string | null;
  isOptionsLoading: boolean;
  optionsError: string | null;
  initialize: () => Promise<void>;
  check: (
    request: AuthenticityCheckRequest
  ) => Promise<AuthenticityCheckResult | undefined>;
  getHistory: (userId: string, limit?: number) => Promise<void>;
  getStats: (userId: string) => Promise<void>;
  clearErrors: () => void;
  setCurrentImage: (image: string | null) => void;
  clearResult: () => void;
  updateOptions: (options: Partial<AuthenticityCheckOptions>) => void;
}

export const _useAuthenticityCheck = (
  options: UseAuthenticityCheckOptions = {}
): UseAuthenticityCheckReturn => {
  const _dispatch = useAppDispatch();
  const {
    autoInitialize = true,
    onCheckSuccess,
    onCheckError,
    onHistoryLoaded,
    onStatsLoaded,
  } = options;

  // Selectors
  const _isChecking = useAppSelector(selectIsChecking);
  const _checkResult = useAppSelector(selectCheckResult);
  const _checkError = useAppSelector(selectCheckError);
  const _checkHistory = useAppSelector(selectCheckHistory);
  const _checkStats = useAppSelector(selectCheckStats);
  const _currentImage = useAppSelector(selectCurrentImage);
  const _checkOptions = useAppSelector(selectCheckOptions);
  const _isLoadingHistory = useAppSelector(selectIsLoadingHistory);
  const _historyError = useAppSelector(selectHistoryError);
  const _isLoadingStats = useAppSelector(selectIsLoadingStats);
  const _statsError = useAppSelector(selectStatsError);
  const _isOptionsLoading = useAppSelector(selectIsOptionsLoading);
  const _optionsError = useAppSelector(selectOptionsError);

  // Actions
  const _initialize = useCallback(async () => {
    try {
      await dispatch(initializeAuthenticityCheck()).unwrap();
      logger.info('防偽檢查系統初始化成功');
    } catch (error: unknown) {
      logger.error('防偽檢查系統初始化失敗:', error);
      onCheckError?.(error);
    }
  }, [dispatch, onCheckError]);

  const _check = useCallback(
    async (request: AuthenticityCheckRequest) => {
      try {
        const _result = await dispatch(checkAuthenticity(request)).unwrap();
        onCheckSuccess?.(result);
        return result;
      } catch (error: unknown) {
        logger.error('防偽檢查失敗:', error);
        onCheckError?.(error);
        return undefined;
      }
    },
    [dispatch, onCheckSuccess, onCheckError]
  );

  const _getHistory = useCallback(
    async (userId: string, limit?: number) => {
      try {
        const _history = await dispatch(
          getCheckHistory({ userId, limit })
        ).unwrap();
        onHistoryLoaded?.(history);
      } catch (error: unknown) {
        logger.error('獲取檢查歷史失敗:', error);
      }
    },
    [dispatch, onHistoryLoaded]
  );

  const _getStats = useCallback(
    async (userId: string) => {
      try {
        const _stats = await dispatch(getCheckStats(userId)).unwrap();
        onStatsLoaded?.(stats);
      } catch (error: unknown) {
        logger.error('獲取檢查統計失敗:', error);
      }
    },
    [dispatch, onStatsLoaded]
  );

  const _clearErrors = useCallback(() => {
    dispatch(clearCheckError());
    dispatch(clearHistoryError());
    dispatch(clearStatsError());
    dispatch(clearOptionsError());
  }, [dispatch]);

  const _setImage = useCallback(
    (image: string | null) => {
      dispatch(setCurrentCheckImage(image));
    },
    [dispatch]
  );

  const _clearResult = useCallback(() => {
    dispatch(clearCheckResult());
  }, [dispatch]);

  const _updateOptions = useCallback(
    (options: Partial<AuthenticityCheckOptions>) => {
      dispatch(updateCheckOptions(options));
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
    isChecking,
    checkResult,
    checkError,
    checkHistory,
    checkStats,
    currentImage,
    checkOptions,
    isLoadingHistory,
    historyError,
    isLoadingStats,
    statsError,
    isOptionsLoading,
    optionsError,
    initialize,
    check,
    getHistory,
    getStats,
    clearErrors,
    setCurrentImage: setImage,
    clearResult,
    updateOptions,
  };
};
