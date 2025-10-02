import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  createPredictionAlert,
  createPredictionModel,
  deletePredictionAlert,
  exportPredictiveAnalysisData,
  generatePrediction,
  generatePredictionReport,
  getPredictiveAnalysis,
  getPredictionReports,
  getPredictionInsights,
  getPredictionRecommendations,
  getPredictionAlerts,
  getRealTimePredictionMetrics,
  initializePredictiveAnalysis,
  clearError,
  clearAllErrors,
  resetPredictiveAnalysis,
  selectAlerts,
  selectConfig,
  selectError,
  selectInsights,
  selectIsInitialized,
  selectLoading,
  selectModels,
  selectPredictions,
  selectRealTimeMetrics,
  selectRecommendations,
  selectReports,
  updatePredictionAlert,
  updatePredictiveAnalysisConfig,
} from '../../../store/slices/predictiveAnalysisSlice';
import type {
  PredictionAlert,
  PredictionFilter,
  PredictionModelConfig,
  PredictiveAnalysisConfig,
  PredictiveAnalysisExportOptions,
} from '../types/predictiveAnalysis';

/**
 * 預測Analysis Hook
 * 提供預測Analysis功能的 React 集成
 */
export const _usePredictiveAnalysis = () => {
  const _dispatch = useAppDispatch();

  // StatusSelect器
  const _models = useSelector(selectModels);
  const _predictions = useSelector(selectPredictions);
  const _reports = useSelector(selectReports);
  const _insights = useSelector(selectInsights);
  const _recommendations = useSelector(selectRecommendations);
  const _alerts = useSelector(selectAlerts);
  const _config = useSelector(selectConfig);
  const _realTimeMetrics = useSelector(selectRealTimeMetrics);
  const _loading = useSelector(selectLoading);
  const _error = useSelector(selectError);
  const _isInitialized = useSelector(selectIsInitialized);

  // Initialize
  const _initialize = useCallback(
    async (config?: Partial<PredictiveAnalysisConfig>) => {
      return dispatch(initializePredictiveAnalysis(config)).unwrap();
    },
    [dispatch]
  );

  // GetAnalysisData
  const _getAnalysis = useCallback(
    async (filter?: PredictionFilter) => {
      return dispatch(getPredictiveAnalysis(filter)).unwrap();
    },
    [dispatch]
  );

  // Create模型
  const _createModel = useCallback(
    async (
      name: string,
      description: string,
      config: PredictionModelConfig
    ) => {
      return dispatch(
        createPredictionModel({ name, description, config })
      ).unwrap();
    },
    [dispatch]
  );

  // 生成預測
  const _generatePredictionResult = useCallback(
    async (modelId: string, inputFeatures: Record<string, any>) => {
      return dispatch(generatePrediction({ modelId, inputFeatures })).unwrap();
    },
    [dispatch]
  );

  // 生成Report
  const _generateReport = useCallback(
    async (
      modelId: string,
      title: string,
      description: string,
      dateRange: { start: Date; end: Date }
    ) => {
      return dispatch(
        generatePredictionReport({
          modelId,
          title,
          description,
          dateRange,
        })
      ).unwrap();
    },
    [dispatch]
  );

  // ExportData
  const _exportData = useCallback(
    async (options: PredictiveAnalysisExportOptions) => {
      return dispatch(exportPredictiveAnalysisData(options)).unwrap();
    },
    [dispatch]
  );

  // CreateAlert
  const _createAlert = useCallback(
    async (
      modelId: string,
      type: PredictionAlert['type'],
      severity: PredictionAlert['severity'],
      title: string,
      message: string,
      threshold: number,
      currentValue: number
    ) => {
      return dispatch(
        createPredictionAlert({
          modelId,
          type,
          severity,
          title,
          message,
          threshold,
          currentValue,
        })
      ).unwrap();
    },
    [dispatch]
  );

  // UpdateAlert
  const _updateAlert = useCallback(
    async (alertId: string, updates: Partial<PredictionAlert>) => {
      return dispatch(updatePredictionAlert({ alertId, updates })).unwrap();
    },
    [dispatch]
  );

  // DeleteAlert
  const _deleteAlert = useCallback(
    async (alertId: string) => {
      return dispatch(deletePredictionAlert(alertId)).unwrap();
    },
    [dispatch]
  );

  // GetConfigure
  const _getConfig = useCallback(async () => {
    return dispatch(updatePredictiveAnalysisConfig({})).unwrap();
  }, [dispatch]);

  // UpdateConfigure
  const _updateConfig = useCallback(
    async (updates: Partial<PredictiveAnalysisConfig>) => {
      return dispatch(updatePredictiveAnalysisConfig(updates)).unwrap();
    },
    [dispatch]
  );

  // GetReport
  const _getReports = useCallback(
    async (modelId?: string) => {
      return dispatch(getPredictionReports(modelId)).unwrap();
    },
    [dispatch]
  );

  // Get洞察
  const _getInsights = useCallback(
    async (modelId?: string) => {
      return dispatch(getPredictionInsights(modelId)).unwrap();
    },
    [dispatch]
  );

  // Get建議
  const _getRecommendations = useCallback(
    async (modelId?: string) => {
      return dispatch(getPredictionRecommendations(modelId)).unwrap();
    },
    [dispatch]
  );

  // GetAlert
  const _getAlerts = useCallback(
    async (modelId?: string) => {
      return dispatch(getPredictionAlerts(modelId)).unwrap();
    },
    [dispatch]
  );

  // Get實時指標
  const _getRealTimeMetrics = useCallback(async () => {
    return dispatch(getRealTimePredictionMetrics()).unwrap();
  }, [dispatch]);

  // ClearError
  const _clearErrorAction = useCallback(
    (errorKey: keyof typeof error) => {
      dispatch(clearError(errorKey));
    },
    [dispatch]
  );

  // Clear所有Error
  const _clearAllErrorsAction = useCallback(() => {
    dispatch(clearAllErrors());
  }, [dispatch]);

  // ResetStatus
  const _reset = useCallback(() => {
    dispatch(resetPredictiveAnalysis());
  }, [dispatch]);

  // 計算Property
  const _activeModels = useMemo(
    () => (models as any[]).filter((model: unknown) => model.isActive),
    [models]
  );

  const _readyModels = useMemo(
    () =>
      (models as any[]).filter((model: unknown) => model.status === 'ready'),
    [models]
  );

  const _trainingModels = useMemo(
    () =>
      (models as any[]).filter((model: unknown) => model.status === 'training'),
    [models]
  );

  const _errorModels = useMemo(
    () =>
      (models as any[]).filter((model: unknown) => model.status === 'error'),
    [models]
  );

  const _totalPredictions = useMemo(() => predictions.length, [predictions]);

  const _averageAccuracy = useMemo(() => {
    if (predictions.length === 0) return 0;
    return (
      predictions.reduce((sum, pred) => sum + pred.accuracy, 0) /
      predictions.length
    );
  }, [predictions]);

  const _activeAlerts = useMemo(
    () => alerts.filter(alert => alert.isActive),
    [alerts]
  );

  const _criticalAlerts = useMemo(
    () =>
      alerts.filter(alert => alert.severity === 'critical' && alert.isActive),
    [alerts]
  );

  const _warningAlerts = useMemo(
    () =>
      alerts.filter(alert => alert.severity === 'warning' && alert.isActive),
    [alerts]
  );

  // AutoInitialize
  useEffect(() => {
    if (!isInitialized && !loading.initialize) {
      initialize();
    }
  }, [isInitialized, loading.initialize, initialize]);

  // 定期Update實時指標
  useEffect(() => {
    if (isInitialized) {
      const _interval = setInterval(() => {
        getRealTimeMetrics();
      }, 30000); // 每30SecondUpdate一次

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isInitialized, getRealTimeMetrics]);

  return {
    // Status
    models,
    predictions,
    reports,
    insights,
    recommendations,
    alerts,
    config,
    realTimeMetrics,
    loading,
    error,
    isInitialized,

    // 計算Property
    activeModels,
    readyModels,
    trainingModels,
    errorModels,
    totalPredictions,
    averageAccuracy,
    activeAlerts,
    criticalAlerts,
    warningAlerts,

    // OperationMethod
    initialize,
    getAnalysis,
    createModel,
    generatePrediction: generatePredictionResult,
    generateReport,
    exportData,
    createAlert,
    updateAlert,
    deleteAlert,
    getConfig,
    updateConfig,
    getReports,
    getInsights,
    getRecommendations,
    getAlerts,
    getRealTimeMetrics,
    clearError: clearErrorAction,
    clearAllErrors: clearAllErrorsAction,
    reset,
  };
};
