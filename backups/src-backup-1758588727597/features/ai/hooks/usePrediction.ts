import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  performPrediction,
  getPredictionHistory,
  getPredictionStats,
  getPredictionOptions,
  clearCurrentPrediction,
  setPredictionOptions,
  clearError,
  resetPredictionState,
  addPredictionToHistory,
  selectCurrentPrediction,
  selectPredictionHistory,
  selectPredictionStats,
  selectPredictionLoading,
  selectPredictionError,
  selectPredictionOptions,
  selectPredictionHistoryByCardId,
  selectPredictionAccuracy,
  selectTotalPredictions,
  selectTopPerformingCards,
  selectRecentPredictions,
  selectModelPerformance,
} from '../../../store/slices/predictionSlice';
import type {
  PredictionRequest,
  PredictionResult,
  PredictionOptions,
  PredictionType,
  TimeHorizon,
} from '../types/prediction';
import { PredictionHistory } from '../types/prediction';

/**
 * AI 預測系統自定義 Hook
 * 提供預測功能、歷史查詢、統計分析等
 */
export const usePrediction = () => {
  const dispatch = useAppDispatch();

  // 狀態選擇器
  const currentPrediction = useAppSelector(selectCurrentPrediction);
  const predictionHistory = useAppSelector(selectPredictionHistory);
  const predictionStats = useAppSelector(selectPredictionStats);
  const loading = useAppSelector(selectPredictionLoading);
  const error = useAppSelector(selectPredictionError);
  const options = useAppSelector(selectPredictionOptions);
  const accuracy = useAppSelector(selectPredictionAccuracy);
  const totalPredictions = useAppSelector(selectTotalPredictions);
  const topPerformingCards = useAppSelector(selectTopPerformingCards);
  const recentPredictions = useAppSelector(selectRecentPredictions);
  const modelPerformance = useAppSelector(selectModelPerformance);

  // 預測操作
  const predict = useCallback(
    async (request: PredictionRequest) => {
      try {
        const result = await dispatch(performPrediction(request)).unwrap();
        return result;
      } catch (error) {
        console.error('Prediction failed:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取預測歷史
  const getHistory = useCallback(
    async (cardId: string) => {
      try {
        const history = await dispatch(getPredictionHistory(cardId)).unwrap();
        return history;
      } catch (error) {
        console.error('Failed to get prediction history:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取預測統計
  const getStats = useCallback(async () => {
    try {
      const stats = await dispatch(getPredictionStats()).unwrap();
      return stats;
    } catch (error) {
      console.error('Failed to get prediction stats:', error);
      throw error;
    }
  }, [dispatch]);

  // 獲取預測選項
  const getOptions = useCallback(async () => {
    try {
      const options = await dispatch(getPredictionOptions()).unwrap();
      return options;
    } catch (error) {
      console.error('Failed to get prediction options:', error);
      throw error;
    }
  }, [dispatch]);

  // 更新預測選項
  const updateOptions = useCallback(
    (newOptions: Partial<PredictionOptions>) => {
      dispatch(setPredictionOptions(newOptions));
    },
    [dispatch]
  );

  // 清除當前預測
  const clearPrediction = useCallback(() => {
    dispatch(clearCurrentPrediction());
  }, [dispatch]);

  // 清除錯誤
  const clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 重置預測狀態
  const resetState = useCallback(() => {
    dispatch(resetPredictionState());
  }, [dispatch]);

  // 添加預測到歷史
  const addToHistory = useCallback(
    (prediction: PredictionResult) => {
      dispatch(addPredictionToHistory(prediction));
    },
    [dispatch]
  );

  // 實用函數
  const getHistoryByCardId = useCallback(
    (cardId: string) => {
      return predictionHistory.find(history => history.cardId === cardId);
    },
    [predictionHistory]
  );

  const getLatestPrediction = useCallback(
    (cardId: string) => {
      const history = getHistoryByCardId(cardId);
      if (history && history.predictions.length > 0) {
        return history.predictions[history.predictions.length - 1];
      }
      return null;
    },
    [getHistoryByCardId]
  );

  const getPredictionTrend = useCallback(
    (cardId: string) => {
      const history = getHistoryByCardId(cardId);
      if (!history || history.predictions.length < 2) {
        return null;
      }

      const recentPredictions = history.predictions
        .slice(-5)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      const firstValue = recentPredictions[0].predictedValue;
      const lastValue =
        recentPredictions[recentPredictions.length - 1].predictedValue;
      const trend =
        lastValue > firstValue
          ? 'up'
          : lastValue < firstValue
            ? 'down'
            : 'stable';
      const changePercent = ((lastValue - firstValue) / firstValue) * 100;

      return {
        trend,
        changePercent,
        direction:
          lastValue > firstValue
            ? 'bullish'
            : lastValue < firstValue
              ? 'bearish'
              : 'sideways',
      };
    },
    [getHistoryByCardId]
  );

  const getPredictionAccuracy = useCallback(
    (cardId: string) => {
      const history = getHistoryByCardId(cardId);
      return history?.accuracy || 0;
    },
    [getHistoryByCardId]
  );

  const getPredictionCount = useCallback(
    (cardId: string) => {
      const history = getHistoryByCardId(cardId);
      return history?.totalPredictions || 0;
    },
    [getHistoryByCardId]
  );

  const getAverageReturn = useCallback(
    (cardId: string) => {
      const history = getHistoryByCardId(cardId);
      return history?.averageReturn || 0;
    },
    [getHistoryByCardId]
  );

  const getBestPrediction = useCallback(
    (cardId: string) => {
      const history = getHistoryByCardId(cardId);
      return history?.bestPrediction || null;
    },
    [getHistoryByCardId]
  );

  const getWorstPrediction = useCallback(
    (cardId: string) => {
      const history = getHistoryByCardId(cardId);
      return history?.worstPrediction || null;
    },
    [getHistoryByCardId]
  );

  const getPredictionsByType = useCallback(
    (predictionType: PredictionType) => {
      const allPredictions: PredictionResult[] = [];
      predictionHistory.forEach(history => {
        allPredictions.push(
          ...history.predictions.filter(
            p => p.predictionType === predictionType
          )
        );
      });
      return allPredictions;
    },
    [predictionHistory]
  );

  const getPredictionsByHorizon = useCallback(
    (timeHorizon: TimeHorizon) => {
      const allPredictions: PredictionResult[] = [];
      predictionHistory.forEach(history => {
        allPredictions.push(
          ...history.predictions.filter(p => p.timeHorizon === timeHorizon)
        );
      });
      return allPredictions;
    },
    [predictionHistory]
  );

  const getRecentPredictionsByCard = useCallback(
    (cardId: string, limit = 10) => {
      const history = getHistoryByCardId(cardId);
      if (!history) return [];

      return history.predictions
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    },
    [getHistoryByCardId]
  );

  const getPredictionSuccessRate = useCallback(
    (cardId: string) => {
      const history = getHistoryByCardId(cardId);
      if (!history || history.totalPredictions === 0) return 0;
      return (history.successfulPredictions / history.totalPredictions) * 100;
    },
    [getHistoryByCardId]
  );

  const getTopCardsByAccuracy = useCallback(
    (limit = 10) => {
      return topPerformingCards
        .sort((a, b) => b.accuracy - a.accuracy)
        .slice(0, limit);
    },
    [topPerformingCards]
  );

  const getTopCardsByReturn = useCallback(
    (limit = 10) => {
      return topPerformingCards
        .sort((a, b) => b.averageReturn - a.averageReturn)
        .slice(0, limit);
    },
    [topPerformingCards]
  );

  const getModelAccuracy = useCallback(() => {
    return modelPerformance?.overallAccuracy || 0;
  }, [modelPerformance]);

  const getModelPrecision = useCallback(() => {
    return modelPerformance?.precision || 0;
  }, [modelPerformance]);

  const getModelRecall = useCallback(() => {
    return modelPerformance?.recall || 0;
  }, [modelPerformance]);

  const getModelF1Score = useCallback(() => {
    return modelPerformance?.f1Score || 0;
  }, [modelPerformance]);

  const getModelMAPE = useCallback(() => {
    return modelPerformance?.mape || 0;
  }, [modelPerformance]);

  const getModelRMSE = useCallback(() => {
    return modelPerformance?.rmse || 0;
  }, [modelPerformance]);

  const getModelVersion = useCallback(() => {
    return modelPerformance?.modelVersion || 'unknown';
  }, [modelPerformance]);

  const getLastModelUpdate = useCallback(() => {
    return modelPerformance?.lastUpdated || new Date();
  }, [modelPerformance]);

  const getTrainingDataSize = useCallback(() => {
    return modelPerformance?.trainingDataSize || 0;
  }, [modelPerformance]);

  return {
    // 狀態
    currentPrediction,
    predictionHistory,
    predictionStats,
    loading,
    error,
    options,
    accuracy,
    totalPredictions,
    topPerformingCards,
    recentPredictions,
    modelPerformance,

    // 操作
    predict,
    getHistory,
    getStats,
    getOptions,
    updateOptions,
    clearPrediction,
    clearError: clearErrorState,
    resetState,
    addToHistory,

    // 實用函數
    getHistoryByCardId,
    getLatestPrediction,
    getPredictionTrend,
    getPredictionAccuracy,
    getPredictionCount,
    getAverageReturn,
    getBestPrediction,
    getWorstPrediction,
    getPredictionsByType,
    getPredictionsByHorizon,
    getRecentPredictionsByCard,
    getPredictionSuccessRate,
    getTopCardsByAccuracy,
    getTopCardsByReturn,

    // 模型性能
    getModelAccuracy,
    getModelPrecision,
    getModelRecall,
    getModelF1Score,
    getModelMAPE,
    getModelRMSE,
    getModelVersion,
    getLastModelUpdate,
    getTrainingDataSize,
  };
};
