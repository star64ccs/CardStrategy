import { useCallback } from 'react';
import { errorHandlerService, AppError } from '@/services/errorHandlerService';
import { logger } from '@/utils/logger';

export interface UseErrorHandlerOptions {
  context?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  enableRetry?: boolean;
  maxRetries?: number;
  onError?: (error: AppError) => void;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    context,
    severity = 'medium',
    enableRetry = true,
    maxRetries = 3,
    onError
  } = options;

  // 處理錯誤
  const handleError = useCallback(async (
    error: Error | string,
    errorContext?: string,
    errorSeverity?: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<AppError> => {
    const finalContext = errorContext || context || 'Unknown';
    const finalSeverity = errorSeverity || severity;

    try {
      const appError = await errorHandlerService.handleError(
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
      logger.error('錯誤處理失敗', { error: handlerError, originalError: error });
      throw handlerError;
    }
  }, [context, severity, onError]);

  // 處理 API 錯誤
  const handleApiError = useCallback(async (
    error: any,
    errorContext?: string
  ): Promise<AppError> => {
    const finalContext = errorContext || context || 'API';

    try {
      const appError = await errorHandlerService.handleApiError(error, finalContext);

      // 調用自定義錯誤處理回調
      if (onError) {
        onError(appError);
      }

      return appError;
    } catch (handlerError) {
      logger.error('API 錯誤處理失敗', { error: handlerError, originalError: error });
      throw handlerError;
    }
  }, [context, onError]);

  // 處理驗證錯誤
  const handleValidationError = useCallback(async (
    errors: string[],
    errorContext?: string
  ): Promise<AppError> => {
    const finalContext = errorContext || context || 'Validation';

    try {
      const appError = await errorHandlerService.handleValidationError(errors, finalContext);

      // 調用自定義錯誤處理回調
      if (onError) {
        onError(appError);
      }

      return appError;
    } catch (handlerError) {
      logger.error('驗證錯誤處理失敗', { error: handlerError, originalErrors: errors });
      throw handlerError;
    }
  }, [context, onError]);

  // 處理認證錯誤
  const handleAuthError = useCallback(async (
    error: Error | string,
    errorContext?: string
  ): Promise<AppError> => {
    const finalContext = errorContext || context || 'Authentication';

    try {
      const appError = await errorHandlerService.handleAuthError(error, finalContext);

      // 調用自定義錯誤處理回調
      if (onError) {
        onError(appError);
      }

      return appError;
    } catch (handlerError) {
      logger.error('認證錯誤處理失敗', { error: handlerError, originalError: error });
      throw handlerError;
    }
  }, [context, onError]);

  // 重試操作
  const retryOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationContext?: string,
    operationMaxRetries?: number
  ): Promise<T> => {
    if (!enableRetry) {
      throw new Error('重試功能已禁用');
    }

    const finalContext = operationContext || context || 'RetryOperation';
    const finalMaxRetries = operationMaxRetries || maxRetries;

    try {
      return await errorHandlerService.retryOperation(
        operation,
        finalContext,
        finalMaxRetries
      );
    } catch (error) {
      // 重試失敗後，使用統一的錯誤處理
      await handleError(error as Error, finalContext, 'high');
      throw error;
    }
  }, [context, enableRetry, maxRetries, handleError]);

  // 安全執行操作
  const safeExecute = useCallback(async <T>(
    operation: () => Promise<T>,
    operationContext?: string,
    fallback?: T
  ): Promise<T | undefined> => {
    const finalContext = operationContext || context || 'SafeExecute';

    try {
      return await operation();
    } catch (error) {
      await handleError(error as Error, finalContext, 'medium');
      return fallback;
    }
  }, [context, handleError]);

  // 獲取錯誤統計
  const getErrorStats = useCallback(() => {
    return errorHandlerService.getErrorStats();
  }, []);

  // 獲取所有錯誤
  const getAllErrors = useCallback(() => {
    return errorHandlerService.getAllErrors();
  }, []);

  // 獲取未處理錯誤
  const getUnhandledErrors = useCallback(() => {
    return errorHandlerService.getUnhandledErrors();
  }, []);

  // 清理舊錯誤
  const cleanupOldErrors = useCallback((maxAge?: number) => {
    errorHandlerService.cleanupOldErrors(maxAge);
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
    cleanupOldErrors
  };
};
