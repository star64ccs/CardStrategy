import { errorHandler, withErrorHandling } from '@/core/utils/errorHandler';

/**
 * API ErrorHandle模板
 * 按照執Row原則建構
 * 嚴謹語法，無Error，高質量代碼
 */
export class APIErrorHandler {
  @withErrorHandling
  async handleAPIRequest<T>(
    request: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      throw errorHandler.handleError(error as Error, context);
    }
  }

  @withErrorHandling
  async handleAPIWithRetry<T>(
    request: () => Promise<T>,
    context: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await request();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    throw errorHandler.handleError(lastError, context);
  }

  @withErrorHandling
  async handleAPIWithTimeout<T>(
    request: () => Promise<T>,
    context: string,
    timeout: number = 10000
  ): Promise<T> {
    const _timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    try {
      return await Promise.race([request(), timeoutPromise]);
    } catch (error) {
      throw errorHandler.handleError(error as Error, context);
    }
  }

  @withErrorHandling
  async handleAPIWithFallback<T>(
    primaryRequest: () => Promise<T>,
    fallbackRequest: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await primaryRequest();
    } catch (error) {
      console.warn('Primary API request failed, trying fallback:', error);
      try {
        return await fallbackRequest();
      } catch (fallbackError) {
        throw errorHandler.handleError(fallbackError as Error, context);
      }
    }
  }
}
