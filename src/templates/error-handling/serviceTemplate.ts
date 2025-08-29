import {
  errorHandler,
  withErrorHandling,
  handleErrors,
} from '@/core/utils/errorHandler';

/**
 * 服務錯誤處理模板
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */
export class ServiceErrorHandler {
  @handleErrors
  async handleServiceOperation(operation: () => Promise<any>, context: string) {
    try {
      return await operation();
    } catch (error) {
      return errorHandler.handleError(error as Error, context);
    }
  }

  @handleErrors
  async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw errorHandler.handleError(error as Error, context);
    }
  }

  @handleErrors
  async handleWithRetry<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    throw errorHandler.handleError(lastError, context);
  }

  @handleErrors
  async handleWithFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      console.warn('Primary operation failed, trying fallback:', error);
      try {
        return await fallbackOperation();
      } catch (fallbackError) {
        throw errorHandler.handleError(fallbackError as Error, context);
      }
    }
  }
}
