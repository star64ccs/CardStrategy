import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  performAppraisal,
  getAppraisalHistory,
  getAppraisalStats,
  getAppraisalOptions,
  clearCurrentAppraisal,
  setAppraisalOptions,
  clearError,
  resetAppraisalState,
  selectCurrentAppraisal,
  selectAppraisalHistory,
  selectAppraisalStats,
  selectAppraisalOptions,
  selectAppraisalStatus,
  selectAppraisalError,
  selectAppraisalLoading,
} from '../../../store/slices/appraisalSlice';
import type { AppraisalRequest, AppraisalOptions } from '../types/appraisal';

export const _useAppraisal = () => {
  const _dispatch = useAppDispatch();

  // Selectors
  const _currentAppraisal = useAppSelector(selectCurrentAppraisal);
  const _history = useAppSelector(selectAppraisalHistory);
  const _stats = useAppSelector(selectAppraisalStats);
  const _options = useAppSelector(selectAppraisalOptions);
  const _status = useAppSelector(selectAppraisalStatus);
  const _error = useAppSelector(selectAppraisalError);
  const _loading = useAppSelector(selectAppraisalLoading);

  // Actions
  const _startAppraisal = useCallback(
    (request: AppraisalRequest) => {
      return dispatch(performAppraisal(request));
    },
    [dispatch]
  );

  const _loadAppraisalHistory = useCallback(
    (cardId: string) => {
      return dispatch(getAppraisalHistory(cardId));
    },
    [dispatch]
  );

  const _loadAppraisalStats = useCallback(() => {
    return dispatch(getAppraisalStats());
  }, [dispatch]);

  const _loadAppraisalOptions = useCallback(() => {
    return dispatch(getAppraisalOptions());
  }, [dispatch]);

  const _clearAppraisal = useCallback(() => {
    dispatch(clearCurrentAppraisal());
  }, [dispatch]);

  const _updateOptions = useCallback(
    (newOptions: Partial<AppraisalOptions>) => {
      dispatch(setAppraisalOptions(newOptions));
    },
    [dispatch]
  );

  const _clearAppraisalError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const _resetAppraisal = useCallback(() => {
    dispatch(resetAppraisalState());
  }, [dispatch]);

  // Utility functions
  const _getAppraisalById = useCallback(
    (cardId: string) => {
      return history.find(h => h.cardId === cardId);
    },
    [history]
  );

  const _getLatestAppraisal = useCallback(
    (cardId: string) => {
      const _cardHistory = history.find(h => h.cardId === cardId);
      if (!cardHistory || cardHistory.appraisals.length === 0) {
        return null;
      }
      return cardHistory.appraisals[cardHistory.appraisals.length - 1];
    },
    [history]
  );

  const _getAppraisalTrend = useCallback(
    (cardId: string) => {
      const _cardHistory = history.find(h => h.cardId === cardId);
      return cardHistory?.trend || 'stable';
    },
    [history]
  );

  const _getAverageGrade = useCallback(
    (cardId: string) => {
      const _cardHistory = history.find(h => h.cardId === cardId);
      return cardHistory?.averageGrade || 'N/A';
    },
    [history]
  );

  const _getBestGrade = useCallback(
    (cardId: string) => {
      const _cardHistory = history.find(h => h.cardId === cardId);
      return cardHistory?.bestGrade || 'N/A';
    },
    [history]
  );

  const _getWorstGrade = useCallback(
    (cardId: string) => {
      const _cardHistory = history.find(h => h.cardId === cardId);
      return cardHistory?.worstGrade || 'N/A';
    },
    [history]
  );

  const _getTotalAppraisals = useCallback(
    (cardId: string) => {
      const _cardHistory = history.find(h => h.cardId === cardId);
      return cardHistory?.totalAppraisals || 0;
    },
    [history]
  );

  const _isAppraisalComplete = useCallback(() => {
    return status === 'completed' && currentAppraisal !== null;
  }, [status, currentAppraisal]);

  const _isAppraisalProcessing = useCallback(() => {
    return status === 'processing' || loading;
  }, [status, loading]);

  const _hasAppraisalError = useCallback(() => {
    return error !== null;
  }, [error]);

  const _canRetryAppraisal = useCallback(() => {
    return error?.isRetryable || false;
  }, [error]);

  return {
    // State
    currentAppraisal,
    history,
    stats,
    options,
    status,
    error,
    loading,

    // Actions
    startAppraisal,
    loadAppraisalHistory,
    loadAppraisalStats,
    loadAppraisalOptions,
    clearAppraisal,
    updateOptions,
    clearAppraisalError,
    resetAppraisal,

    // Utility functions
    getAppraisalById,
    getLatestAppraisal,
    getAppraisalTrend,
    getAverageGrade,
    getBestGrade,
    getWorstGrade,
    getTotalAppraisals,
    isAppraisalComplete,
    isAppraisalProcessing,
    hasAppraisalError,
    canRetryAppraisal,
  };
};
