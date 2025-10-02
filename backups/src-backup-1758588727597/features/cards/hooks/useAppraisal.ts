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

export const useAppraisal = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const currentAppraisal = useAppSelector(selectCurrentAppraisal);
  const history = useAppSelector(selectAppraisalHistory);
  const stats = useAppSelector(selectAppraisalStats);
  const options = useAppSelector(selectAppraisalOptions);
  const status = useAppSelector(selectAppraisalStatus);
  const error = useAppSelector(selectAppraisalError);
  const loading = useAppSelector(selectAppraisalLoading);

  // Actions
  const startAppraisal = useCallback(
    (request: AppraisalRequest) => {
      return dispatch(performAppraisal(request));
    },
    [dispatch]
  );

  const loadAppraisalHistory = useCallback(
    (cardId: string) => {
      return dispatch(getAppraisalHistory(cardId));
    },
    [dispatch]
  );

  const loadAppraisalStats = useCallback(() => {
    return dispatch(getAppraisalStats());
  }, [dispatch]);

  const loadAppraisalOptions = useCallback(() => {
    return dispatch(getAppraisalOptions());
  }, [dispatch]);

  const clearAppraisal = useCallback(() => {
    dispatch(clearCurrentAppraisal());
  }, [dispatch]);

  const updateOptions = useCallback(
    (newOptions: Partial<AppraisalOptions>) => {
      dispatch(setAppraisalOptions(newOptions));
    },
    [dispatch]
  );

  const clearAppraisalError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resetAppraisal = useCallback(() => {
    dispatch(resetAppraisalState());
  }, [dispatch]);

  // Utility functions
  const getAppraisalById = useCallback(
    (cardId: string) => {
      return history.find(h => h.cardId === cardId);
    },
    [history]
  );

  const getLatestAppraisal = useCallback(
    (cardId: string) => {
      const cardHistory = history.find(h => h.cardId === cardId);
      if (!cardHistory || cardHistory.appraisals.length === 0) {
        return null;
      }
      return cardHistory.appraisals[cardHistory.appraisals.length - 1];
    },
    [history]
  );

  const getAppraisalTrend = useCallback(
    (cardId: string) => {
      const cardHistory = history.find(h => h.cardId === cardId);
      return cardHistory?.trend || 'stable';
    },
    [history]
  );

  const getAverageGrade = useCallback(
    (cardId: string) => {
      const cardHistory = history.find(h => h.cardId === cardId);
      return cardHistory?.averageGrade || 'N/A';
    },
    [history]
  );

  const getBestGrade = useCallback(
    (cardId: string) => {
      const cardHistory = history.find(h => h.cardId === cardId);
      return cardHistory?.bestGrade || 'N/A';
    },
    [history]
  );

  const getWorstGrade = useCallback(
    (cardId: string) => {
      const cardHistory = history.find(h => h.cardId === cardId);
      return cardHistory?.worstGrade || 'N/A';
    },
    [history]
  );

  const getTotalAppraisals = useCallback(
    (cardId: string) => {
      const cardHistory = history.find(h => h.cardId === cardId);
      return cardHistory?.totalAppraisals || 0;
    },
    [history]
  );

  const isAppraisalComplete = useCallback(() => {
    return status === 'completed' && currentAppraisal !== null;
  }, [status, currentAppraisal]);

  const isAppraisalProcessing = useCallback(() => {
    return status === 'processing' || loading;
  }, [status, loading]);

  const hasAppraisalError = useCallback(() => {
    return error !== null;
  }, [error]);

  const canRetryAppraisal = useCallback(() => {
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
