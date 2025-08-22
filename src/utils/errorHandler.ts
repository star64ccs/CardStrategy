
import { logger } from './logger';

/**
 * 增強錯誤處理器
 * 提供統一的錯誤處理和恢復機制
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount: Map<string, number> = new Map();
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1秒

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  async handleError(error: Error, context: string, retryFn?: () => Promise<any>): Promise<any> {
    const errorKey = `${context}:${error.message}`;
    const currentCount = this.errorCount.get(errorKey) || 0;

    logger.error('Error occurred:', {
      context,
      error: error.message,
      stack: error.stack,
      retryCount: currentCount
    });

    // 如果還有重試機會且提供了重試函數
    if (currentCount < this.maxRetries && retryFn) {
      this.errorCount.set(errorKey, currentCount + 1);
      
      // 指數退避延遲
      const delay = this.retryDelay * Math.pow(2, currentCount);
      await this.sleep(delay);

      logger.info('Retrying operation:', { context, retryCount: currentCount + 1 });
      return retryFn();
    }

    // 重置錯誤計數
    this.errorCount.delete(errorKey);

    // 根據錯誤類型提供恢復建議
    const recoverySuggestion = this.getRecoverySuggestion(error, context);
    logger.warn('Recovery suggestion:', recoverySuggestion);

    throw error;
  }

  private getRecoverySuggestion(error: Error, context: string): string {
    if (error.message.includes('network')) {
      return '檢查網絡連接並重試';
    }
    if (error.message.includes('timeout')) {
      return '增加超時時間或檢查服務器狀態';
    }
    if (error.message.includes('permission')) {
      return '檢查權限設置';
    }
    if (error.message.includes('validation')) {
      return '檢查輸入數據格式';
    }
    return '請稍後重試或聯繫技術支持';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  resetErrorCount(): void {
    this.errorCount.clear();
  }

  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [key, count] of this.errorCount.entries()) {
      stats[key] = count;
    }
    return stats;
  }
}

export const errorHandler = ErrorHandler.getInstance();
