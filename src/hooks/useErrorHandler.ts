import { useCallback } from 'react';

import { logger } from '../core/utils/logger';

// 臨時類型定義
interface AppError {
  code: string;
  message: string;
  stack?: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, unknown>;
}

// 臨時實現
const _errorHandlerService = {
  handleError: async (
    error: unknown,
    context: string,
    severity: string
  ): Promise<AppError> => {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || '未知錯誤',
      timestamp: new Date(),
      context: { context, severity },
    };
  },
  handleApiError: async (error: unknown, context: string): Promise<AppError> => {
    return {
      code: 'API_ERROR',
      message: error.message || 'API 錯誤',
      timestamp: new Date(),
      context: { context },
    };
  },
  handleValidationError: async (
    errors: string[],
    context: string
  ): Promise<AppError> => {
    return {
      code: 'VALIDATION_ERROR',
      message: errors.join(', '),
      timestamp: new Date(),
      context: { context },
    };
  },
  handleAuthError: async (error: unknown, context: string): Promise<AppError> => {
    return {
      code: 'AUTH_ERROR',
      message: error.message || '認證錯誤',
      timestamp: new Date(),
      context: { context },
    };
  },
  retryOperation: async (
    operation: () => Promise<any>,
    maxRetries = 3
  ): Promise<any> => {
    let lastError: unknown;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (i === maxRetries - 1) throw error;
      }
    }
  },
  getErrorStats: () => ({ total: 0, byType: {}, bySeverity: {} }),
  getAllErrors: () => [],
  getUnhandledErrors: () => [],
  cleanupOldErrors: () => 0,
};

export interface UseErrorHandlerOptions {
  context?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  enableRetry?: boolean;
  maxRetries?: number;
  onError?: (error: AppError) => void;
}

export const _useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    context,
    severity = 'medium',
    enableRetry = true,
    maxRetries = 3,
    onError,
  } = options;

  // 處理錯誤
  const _handleError = useCallback(
    async (
      error: Error | string,
      errorContext?: string,
      errorSeverity?: 'low' | 'medium' | 'high' | 'critical'
    ): Promise<AppError> => {
      const _finalContext = errorContext || context || 'Unknown';
      const _finalSeverity = errorSeverity || severity;

      try {
        const _appError = await errorHandlerService.handleError(
          error,
          finalContext,
          finalSeverity
        );

        // 調用自定義錯誤處理回調
        if (onError) {
          onError(appError);
        }

        return appError;
      } catch (handlerError) {
        logger.error('錯誤處理失敗', {
          error: handlerError,
          originalError: error,
        });
        throw handlerError;
      }
    },
    [context, severity, onError]
  );

  // 處理 API 錯誤
  const _handleApiError = useCallback(
    async (error: unknown, errorContext?: string): Promise<AppError> => {
      const _finalContext = errorContext || context || 'API';

      try {
        const _appError = await errorHandlerService.handleApiError(
          error,
          finalContext
        );

        // 調用自定義錯誤處理回調
        if (onError) {
          onError(appError);
        }

        return appError;
      } catch (handlerError) {
        logger.error('API 錯誤處理失敗', {
          error: handlerError,
          originalError: error,
        });
        throw handlerError;
      }
    },
    [context, onError]
  );

  // 處理驗證錯誤
  const _handleValidationError = useCallback(
    async (errors: string[], errorContext?: string): Promise<AppError> => {
      const _finalContext = errorContext || context || 'Validation';

      try {
        const _appError = await errorHandlerService.handleValidationError(
          errors,
          finalContext
        );

        // 調用自定義錯誤處理回調
        if (onError) {
          onError(appError);
        }

        return appError;
      } catch (handlerError) {
        logger.error('驗證錯誤處理失敗', {
          error: handlerError,
          originalErrors: errors,
        });
        throw handlerError;
      }
    },
    [context, onError]
  );

  // 處理認證錯誤
  const _handleAuthError = useCallback(
    async (error: Error | string, errorContext?: string): Promise<AppError> => {
      const _finalContext = errorContext || context || 'Authentication';

      try {
        const _appError = await errorHandlerService.handleAuthError(
          error,
          finalContext
        );

        // 調用自定義錯誤處理回調
        if (onError) {
          onError(appError);
        }

        return appError;
      } catch (handlerError) {
        logger.error('認證錯誤處理失敗', {
          error: handlerError,
          originalError: error,
        });
        throw handlerError;
      }
    },
    [context, onError]
  );

  // 重試操作
  const _retryOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationContext?: string,
      operationMaxRetries?: number
    ): Promise<T> => {
      if (!enableRetry) {
        throw new Error('重試功能已禁用');
      }

      const _finalContext = operationContext || context || 'RetryOperation';
      const _finalMaxRetries = operationMaxRetries || maxRetries;

      try {
        return await errorHandlerService.retryOperation(
          operation,
          finalMaxRetries
        );
      } catch (error) {
        // 重試失敗後，使用統一的錯誤處理
        await handleError(error as Error, finalContext, 'high');
        throw error;
      }
    },
    [context, enableRetry, maxRetries, handleError]
  );

  // 安全執行操作
  const _safeExecute = useCallback(
    async <T>(
      operation: () => Promise<T>,
      operationContext?: string,
      fallback?: T
    ): Promise<T | undefined> => {
      const _finalContext = operationContext || context || 'SafeExecute';

      try {
        return await operation();
      } catch (error) {
        await handleError(error as Error, finalContext, 'medium');
        return fallback;
      }
    },
    [context, handleError]
  );

  // 獲取錯誤統計
  const _getErrorStats = useCallback(() => {
    return errorHandlerService.getErrorStats();
  }, []);

  // 獲取所有錯誤
  const _getAllErrors = useCallback(() => {
    return errorHandlerService.getAllErrors();
  }, []);

  // 獲取未處理錯誤
  const _getUnhandledErrors = useCallback(() => {
    return errorHandlerService.getUnhandledErrors();
  }, []);

  // 清理舊錯誤
  const _cleanupOldErrors = useCallback((maxAge?: number) => {
    errorHandlerService.cleanupOldErrors();
  }, []);

  return {
    handleError,
    handleApiError,
    handleValidationError,
    handleAuthError,
    retryOperation,
    safeExecute,
    getErrorStats,
    getAllErrors,
    getUnhandledErrors,
    cleanupOldErrors,
  };
};
