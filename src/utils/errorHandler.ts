import { environment } from '@/config/environment';
import { showErrorToast } from '@/components/common';
import { logger } from './logger';

// 錯誤類型定義
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  stack?: string;
}

// 錯誤代碼枚舉
export enum ErrorCode {
  // 網絡錯誤
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',

  // API 錯誤
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // 認證錯誤
  AUTH_ERROR = 'AUTH_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // 數據錯誤
  DATA_ERROR = 'DATA_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',

  // 用戶錯誤
  USER_ERROR = 'USER_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',

  // 系統錯誤
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 錯誤處理器類
class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  private constructor() {
    // 私有構造函數，防止外部實例化
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // 處理錯誤
  handleError(error: Error | AppError | string, context?: string): AppError {
    const appError = this.normalizeError(error, context);

    // 記錄錯誤
    this.logError(appError);

    // 顯示用戶友好的錯誤消息
    this.showUserFriendlyError(appError);

    // 在開發環境中顯示詳細錯誤
    if (environment.enableLogging) {
      logger.error('Error occurred:', { appError });
    }

    return appError;
  }

  // 標準化錯誤
  private normalizeError(error: Error | AppError | string, context?: string): AppError {
    if (typeof error === 'string') {
      return {
        code: ErrorCode.UNKNOWN_ERROR,
        message: error,
        timestamp: new Date(),
        details: { context }
      };
    }

    if ('code' in error) {
      return {
        ...error,
        timestamp: error.timestamp || new Date(),
        details: { ...error.details, context }
      };
    }

    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message || 'An unknown error occurred',
      timestamp: new Date(),
      ...(error.stack && { stack: error.stack }),
      details: { context }
    };
  }

  // 記錄錯誤
  private logError(error: AppError): void {
    this.errorLog.push(error);

    // 限制日誌大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
  }

  // 顯示用戶友好的錯誤消息
  private showUserFriendlyError(error: AppError): void {
    const userMessage = this.getUserFriendlyMessage(error);
    showErrorToast(userMessage);
  }

  // 獲取用戶友好的錯誤消息
  private getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case ErrorCode.NETWORK_ERROR:
        return '網絡連接失敗，請檢查您的網絡設置';
      case ErrorCode.TIMEOUT_ERROR:
        return '請求超時，請稍後重試';
      case ErrorCode.UNAUTHORIZED:
        return '請先登錄您的帳戶';
      case ErrorCode.FORBIDDEN:
        return '您沒有權限執行此操作';
      case ErrorCode.NOT_FOUND:
        return '請求的資源不存在';
      case ErrorCode.VALIDATION_ERROR:
        return '輸入數據格式不正確';
      case ErrorCode.TOKEN_EXPIRED:
        return '登錄已過期，請重新登錄';
      case ErrorCode.INVALID_CREDENTIALS:
        return '用戶名或密碼不正確';
      case ErrorCode.STORAGE_ERROR:
        return '數據存儲失敗';
      case ErrorCode.PERMISSION_DENIED:
        return '權限不足';
      default:
        return '發生未知錯誤，請稍後重試';
    }
  }

  // 獲取錯誤日誌
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // 清除錯誤日誌
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // 檢查是否為可重試錯誤
  isRetryableError(error: AppError): boolean {
    const retryableCodes = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.CONNECTION_ERROR,
      ErrorCode.API_ERROR
    ];
    return retryableCodes.includes(error.code as ErrorCode);
  }

  // 檢查是否為認證錯誤
  isAuthError(error: AppError): boolean {
    const authCodes = [
      ErrorCode.UNAUTHORIZED,
      ErrorCode.TOKEN_EXPIRED,
      ErrorCode.INVALID_CREDENTIALS
    ];
    return authCodes.includes(error.code as ErrorCode);
  }
}

// 導出單例實例
export const errorHandler = ErrorHandler.getInstance();

// 導出便捷方法
export const handleError = (error: Error | AppError | string, context?: string) => {
  return errorHandler.handleError(error, context);
};

export const isRetryableError = (error: AppError) => {
  return errorHandler.isRetryableError(error);
};

export const isAuthError = (error: AppError) => {
  return errorHandler.isAuthError(error);
};
