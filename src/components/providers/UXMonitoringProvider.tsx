// 用戶體驗監控 Provider
import type { ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';

import UXMonitoringService from '../../services/uxMonitoringService';
import {
  initializeUXMonitoring,
  trackAction,
  trackPerformance,
  trackError,
  submitSatisfaction,
  getABTestVariant,
  trackConversion,
  getAnalytics,
  updateConfig,
  clearData,
  exportData,
  selectUXMonitoringState,
  selectIsInitialized,
  selectIsEnabled,
  selectConfig,
  selectCurrentSession,
  selectAnalytics,
  selectStatus,
  selectLoading,
  selectError,
  selectLastUpdated,
} from '../../store/slices/uxMonitoringSlice';
import type {
  UXAnalytics,
  UXMonitoringConfig,
  UserAction,
  PerformanceMetric,
  ErrorAnalytics,
  SatisfactionAnalytics,
  ErrorType,
  SatisfactionLevel,
  ErrorEvent,
  SatisfactionSurvey,
  ABTestAssignment,
  UseUXMonitoringReturn,
  UsePerformanceMonitoringReturn,
  UseErrorTrackingReturn,
  UseSatisfactionSurveyReturn,
  UseABTestingReturn,
} from '../../types/uxMonitoring';

// Context
interface UXMonitoringContextType {
  service: UXMonitoringService;
  isInitialized: boolean;
  isEnabled: boolean;
  config: UXMonitoringConfig | null;
  currentSession: unknown;
  analytics: UXAnalytics | null;
  status: unknown;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  trackAction: (
    action: Omit<UserAction, 'id' | 'timestamp' | 'sessionId'>
  ) => void;
  trackPerformance: (
    metric: Omit<PerformanceMetric, 'id' | 'timestamp' | 'sessionId'>
  ) => void;
  trackError: (error: Error, context?: unknown) => void;
  submitSatisfaction: (
    survey: Omit<SatisfactionSurvey, 'id' | 'timestamp' | 'sessionId'>
  ) => void;
  getABTestVariant: (testId: string) => string | null;
  trackConversion: (testId: string, goalId: string, value?: number) => void;
  getAnalytics: () => UXAnalytics | null;
  updateConfig: (config: Partial<UXMonitoringConfig>) => void;
  clearData: () => void;
  exportData: () => any;
}

const _UXMonitoringContext = createContext<UXMonitoringContextType | null>(null);

// Provider Props
interface UXMonitoringProviderProps {
  config?: Partial<UXMonitoringConfig>;
  children: ReactNode;
  autoInitialize?: boolean;
  autoAnalytics?: boolean;
  analyticsInterval?: number;
}

// Provider Component
export const UXMonitoringProvider: React.FC<UXMonitoringProviderProps> = ({
  config,
  children,
  autoInitialize = true,
  autoAnalytics = true,
  analyticsInterval = 30000, // 30秒
}) => {
  const _dispatch = useDispatch<AppDispatch>();
  const _state = useSelector(selectUXMonitoringState);
  const _service = UXMonitoringService.getInstance();

  // 自動初始化
  useEffect(() => {
    if (autoInitialize && !state.isInitialized) {
      dispatch(initializeUXMonitoring(config));
    }
    return undefined;
  }, [autoInitialize, state.isInitialized, config, dispatch]);

  // 自動獲取分析數據
  useEffect(() => {
    if (autoAnalytics && state.isInitialized) {
      const _interval = setInterval(() => {
        dispatch(getAnalytics());
      }, analyticsInterval);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoAnalytics, state.isInitialized, analyticsInterval, dispatch]);

  // 設置事件監聽器
  useEffect(() => {
    if (!state.isInitialized) return;

    const _handleActionTracked = (action: UserAction) => {
      // 可以添加額外的處理邏輯
    };

    const _handlePerformanceTracked = (metric: PerformanceMetric) => {
      // 可以添加額外的處理邏輯
    };

    const _handleErrorTracked = (error: ErrorEvent) => {
      // 可以添加額外的處理邏輯
    };

    const _handleSatisfactionSubmitted = (survey: SatisfactionSurvey) => {
      // 可以添加額外的處理邏輯
    };

    const _handleABTestAssigned = (assignment: ABTestAssignment) => {
      // 可以添加額外的處理邏輯
    };

    const _handleConversionTracked = (data: unknown) => {
      // 可以添加額外的處理邏輯
    };

    const _handleBatchFlushed = (data: unknown) => {
      // 可以添加額外的處理邏輯
    };

    service.on('action-tracked', handleActionTracked);
    service.on('performance-tracked', handlePerformanceTracked);
    service.on('error-tracked', handleErrorTracked);
    service.on('satisfaction-submitted', handleSatisfactionSubmitted);
    service.on('ab-test-assigned', handleABTestAssigned);
    service.on('conversion-tracked', handleConversionTracked);
    service.on('batch-flushed', handleBatchFlushed);

    return () => {
      service.off('action-tracked', handleActionTracked);
      service.off('performance-tracked', handlePerformanceTracked);
      service.off('error-tracked', handleErrorTracked);
      service.off('satisfaction-submitted', handleSatisfactionSubmitted);
      service.off('ab-test-assigned', handleABTestAssigned);
      service.off('conversion-tracked', handleConversionTracked);
      service.off('batch-flushed', handleBatchFlushed);
    };
  }, [state.isInitialized, service]);

  // 方法
  const _handleTrackAction = useCallback(
    (action: Omit<UserAction, 'id' | 'timestamp' | 'sessionId'>) => {
      dispatch(trackAction(action));
    },
    [dispatch]
  );

  const _handleTrackPerformance = useCallback(
    (metric: Omit<PerformanceMetric, 'id' | 'timestamp' | 'sessionId'>) => {
      dispatch(trackPerformance(metric));
    },
    [dispatch]
  );

  const _handleTrackError = useCallback(
    (error: Error, context?: unknown) => {
      dispatch(trackError(error, context));
    },
    [dispatch]
  );

  const _handleSubmitSatisfaction = useCallback(
    (survey: Omit<SatisfactionSurvey, 'id' | 'timestamp' | 'sessionId'>) => {
      dispatch(submitSatisfaction(survey));
    },
    [dispatch]
  );

  const _handleGetABTestVariant = useCallback(
    (testId: string): string | null => {
      const _variant = service.getABTestVariant(testId);
      if (variant) {
        dispatch(getABTestVariant(testId));
      }
      return variant;
    },
    [service, dispatch]
  );

  const _handleTrackConversion = useCallback(
    (testId: string, goalId: string, value?: number) => {
      dispatch(trackConversion({ testId, goalId, value }));
    },
    [dispatch]
  );

  const _handleGetAnalytics = useCallback((): UXAnalytics | null => {
    return state.analytics;
  }, [state.analytics]);

  const _handleUpdateConfig = useCallback(
    (config: Partial<UXMonitoringConfig>) => {
      dispatch(updateConfig(config));
    },
    [dispatch]
  );

  const _handleClearData = useCallback(() => {
    dispatch(clearData());
  }, [dispatch]);

  const _handleExportData = useCallback(() => {
    return service.exportData();
  }, [service]);

  const contextValue: UXMonitoringContextType = {
    service,
    isInitialized: state.isInitialized,
    isEnabled: state.isEnabled,
    config: state.config,
    currentSession: state.currentSession,
    analytics: state.analytics,
    status: state.status,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    trackAction: handleTrackAction,
    trackPerformance: handleTrackPerformance,
    trackError: handleTrackError,
    submitSatisfaction: handleSubmitSatisfaction,
    getABTestVariant: handleGetABTestVariant,
    trackConversion: handleTrackConversion,
    getAnalytics: handleGetAnalytics,
    updateConfig: handleUpdateConfig,
    clearData: handleClearData,
    exportData: handleExportData,
  };

  return (
    <UXMonitoringContext.Provider value={contextValue}>
      {children}
    </UXMonitoringContext.Provider>
  );
};

// 自定義 Hooks
export const _useUXMonitoring = (): UseUXMonitoringReturn => {
  const _context = useContext(UXMonitoringContext);
  if (!context) {
    throw new Error(
      'useUXMonitoring must be used within a UXMonitoringProvider'
    );
  }

  return {
    trackAction: context.trackAction,
    trackError: context.trackError,
    trackPerformance: context.trackPerformance,
    submitSatisfaction: context.submitSatisfaction,
    getABTestVariant: context.getABTestVariant,
    getAnalytics: () => context.getAnalytics() || ({} as UXAnalytics),
    getConfig: () => context.config || ({} as UXMonitoringConfig),
    updateConfig: context.updateConfig,
  };
};

export const _useUXMonitoringService = () => {
  const _context = useContext(UXMonitoringContext);
  if (!context) {
    throw new Error(
      'useUXMonitoringService must be used within a UXMonitoringProvider'
    );
  }

  return context.service;
};

export const _useUXMonitoringState = () => {
  const _context = useContext(UXMonitoringContext);
  if (!context) {
    throw new Error(
      'useUXMonitoringState must be used within a UXMonitoringProvider'
    );
  }

  return {
    isInitialized: context.isInitialized,
    isEnabled: context.isEnabled,
    config: context.config,
    currentSession: context.currentSession,
    analytics: context.analytics,
    status: context.status,
    loading: context.loading,
    error: context.error,
    lastUpdated: context.lastUpdated,
  };
};

export const _useUXMonitoringActions = () => {
  const _context = useContext(UXMonitoringContext);
  if (!context) {
    throw new Error(
      'useUXMonitoringActions must be used within a UXMonitoringProvider'
    );
  }

  return {
    trackAction: context.trackAction,
    trackPerformance: context.trackPerformance,
    trackError: context.trackError,
    submitSatisfaction: context.submitSatisfaction,
    getABTestVariant: context.getABTestVariant,
    trackConversion: context.trackConversion,
    updateConfig: context.updateConfig,
    clearData: context.clearData,
    exportData: context.exportData,
  };
};

export const _usePerformanceMonitoring = (): UsePerformanceMonitoringReturn => {
  const _context = useContext(UXMonitoringContext);
  if (!context) {
    throw new Error(
      'usePerformanceMonitoring must be used within a UXMonitoringProvider'
    );
  }

  const _metrics = context.analytics?.performanceAnalytics ? [] : []; // 簡化版本

  return {
    metrics,
    isMonitoring:
      (context.isEnabled && context.config?.performanceMonitoring?.enabled) ||
      false,
    startMonitoring: () => {
      // 性能監控已經在服務中自動啟動
    },
    stopMonitoring: () => {
      // 可以實現停止監控的邏輯
    },
    getMetrics: (type?: string) => {
      return metrics.filter((m: unknown) => !type || m.type === type);
    },
    clearMetrics: () => {
      context.clearData();
    },
  };
};

export const _useErrorTracking = (): UseErrorTrackingReturn => {
  const _context = useContext(UXMonitoringContext);
  if (!context) {
    throw new Error(
      'useErrorTracking must be used within a UXMonitoringProvider'
    );
  }

  const _errors = context.analytics?.errorAnalytics ? [] : []; // 簡化版本
  const _errorRate = context.analytics?.errorAnalytics?.errorRate || 0;

  return {
    errors,
    errorRate,
    trackError: context.trackError,
    clearErrors: () => {
      context.clearData();
    },
    getErrorAnalytics: () =>
      context.analytics?.errorAnalytics || {
        totalErrors: 0,
        errorRate: 0,
        errorDistribution: {} as Record<ErrorType, number>,
        errorTrends: [],
        topErrors: [],
        errorImpact: [],
      },
  };
};

export const _useSatisfactionSurvey = (): UseSatisfactionSurveyReturn => {
  const _context = useContext(UXMonitoringContext);
  if (!context) {
    throw new Error(
      'useSatisfactionSurvey must be used within a UXMonitoringProvider'
    );
  }

  const _surveys = context.analytics?.satisfactionAnalytics ? [] : []; // 簡化版本
  const _averageSatisfaction =
    context.analytics?.satisfactionAnalytics?.averageSatisfaction || 0;

  return {
    surveys,
    averageSatisfaction,
    submitSurvey: context.submitSatisfaction,
    shouldShowSurvey: () => {
      // 簡化的邏輯：每5次訪問顯示一次
      return context.status.actionCount % 5 === 0;
    },
    getSatisfactionAnalytics: () =>
      context.analytics?.satisfactionAnalytics || {
        averageSatisfaction: 0,
        satisfactionDistribution: {} as Record<SatisfactionLevel, number>,
        satisfactionTrends: [],
        topIssues: [],
        improvementSuggestions: [],
        netPromoterScore: 0,
      },
  };
};

export const _useABTesting = (): UseABTestingReturn => {
  const _context = useContext(UXMonitoringContext);
  if (!context) {
    throw new Error('useABTesting must be used within a UXMonitoringProvider');
  }

  const _tests = context.analytics?.abTestAnalytics ? [] : []; // 簡化版本
  const _assignments = context.analytics?.abTestAnalytics ? [] : []; // 簡化版本

  return {
    tests,
    assignments,
    getVariant: context.getABTestVariant,
    trackConversion: context.trackConversion,
    getTestResults: (testId: string) => {
      // 簡化版本：返回 null
      return null;
    },
  };
};

// 導出 Context
export { UXMonitoringContext };
