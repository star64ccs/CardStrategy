import { logger } from './logger';

// 錯誤類型枚舉
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown',
}

// 錯誤嚴重程度枚舉
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 自定義應用錯誤類
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly timestamp: Date;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 特定錯誤類型
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      ErrorType.VALIDATION,
      ErrorSeverity.MEDIUM,
      'VALIDATION_ERROR',
      details
    );
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      ErrorType.AUTHENTICATION,
      ErrorSeverity.HIGH,
      'AUTHENTICATION_ERROR',
      details
    );
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      ErrorType.AUTHORIZATION,
      ErrorSeverity.HIGH,
      'AUTHORIZATION_ERROR',
      details
    );
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      ErrorType.NETWORK,
      ErrorSeverity.HIGH,
      'NETWORK_ERROR',
      details
    );
    this.name = 'NetworkError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      ErrorType.DATABASE,
      ErrorSeverity.HIGH,
      'DATABASE_ERROR',
      details
    );
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: unknown) {
    super(
      message,
      ErrorType.EXTERNAL_SERVICE,
      ErrorSeverity.HIGH,
      'EXTERNAL_SERVICE_ERROR',
      { service, ...details }
    );
    this.name = 'ExternalServiceError';
  }
}

/**
 * 增強錯誤處理器
 * 提供統一的錯誤處理和恢復機制
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private readonly errorCount: Map<string, number> = new Map();
  private readonly errorStats: Map<ErrorType, number> = new Map();
  private recentErrors: AppError[] = [];
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1秒
  private readonly maxRecentErrors = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | AppError, context?: string): AppError {
    let appError: AppError;

    // 如果已經是 AppError，直接使用
    if (error instanceof AppError) {
      appError = error;
    } else {
      // 將標準 Error 轉換為 AppError
      appError = new AppError(
        error.message,
        this.detectErrorType(error),
        this.detectErrorSeverity(error),
        undefined,
        { originalError: error, context }
      );
    }

    // 記錄錯誤統計
    this.recordError(appError);

    // 記錄錯誤日誌
    this.logError(appError, context);

    return appError;
  }

  async handleErrorWithRetry(
    error: Error,
    context: string,
    retryFn?: () => Promise<any>
  ): Promise<any> {
    const _errorKey = `${context}:${error.message}`;
    const _currentCount = this.errorCount.get(errorKey) || 0;

    logger.error('Error occurred:', {
      context,
      error: error.message,
      stack: error.stack,
      retryCount: currentCount,
    });

    // 如果還有重試機會且提供了重試函數
    if (currentCount < this.maxRetries && retryFn) {
      this.errorCount.set(errorKey, currentCount + 1);

      // 指數退避延遲
      const _delay = this.retryDelay * 2 ** currentCount;
      await this.sleep(delay);

      logger.info('Retrying operation:', {
        context,
        retryCount: currentCount + 1,
      });

      try {
        return await retryFn();
      } catch (retryError) {
        // 如果重試也失敗，遞歸調用自身
        if (currentCount + 1 < this.maxRetries) {
          return this.handleErrorWithRetry(
            retryError as Error,
            context,
            retryFn
          );
        } else {
          // 重置錯誤計數
          this.errorCount.delete(errorKey);
          throw retryError;
        }
      }
    }

    // 重置錯誤計數
    this.errorCount.delete(errorKey);

    // 根據錯誤類型提供恢復建議
    const _recoverySuggestion = this.getRecoverySuggestion(error, context);
    logger.warn('Recovery suggestion:', { suggestion: recoverySuggestion });

    throw error;
  }

  private detectErrorType(error: Error): ErrorType {
    const _message = error.message.toLowerCase();
    const _name = error.name.toLowerCase();

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      name.includes('network') ||
      message.includes('連接')
    ) {
      return ErrorType.NETWORK;
    }
    if (
      message.includes('validation') ||
      name.includes('validation') ||
      message.includes('驗證')
    ) {
      return ErrorType.VALIDATION;
    }
    if (
      message.includes('auth') ||
      message.includes('token') ||
      name.includes('auth') ||
      message.includes('認證')
    ) {
      return ErrorType.AUTHENTICATION;
    }
    if (
      message.includes('permission') ||
      message.includes('forbidden') ||
      name.includes('auth') ||
      message.includes('權限')
    ) {
      return ErrorType.AUTHORIZATION;
    }
    if (
      message.includes('database') ||
      message.includes('sql') ||
      name.includes('database') ||
      message.includes('數據庫')
    ) {
      return ErrorType.DATABASE;
    }
    if (
      message.includes('external') ||
      message.includes('api') ||
      name.includes('external') ||
      message.includes('外部')
    ) {
      return ErrorType.EXTERNAL_SERVICE;
    }
    if (
      message.includes('config') ||
      message.includes('configuration') ||
      message.includes('配置')
    ) {
      return ErrorType.CONFIGURATION;
    }
    return ErrorType.UNKNOWN;
  }

  private detectErrorSeverity(error: Error): ErrorSeverity {
    const _message = error.message.toLowerCase();
    const _name = error.name.toLowerCase();

    if (message.includes('critical') || name.includes('critical')) {
      return ErrorSeverity.CRITICAL;
    }
    if (
      message.includes('high') ||
      name.includes('high') ||
      message.includes('連接') ||
      message.includes('network')
    ) {
      return ErrorSeverity.HIGH;
    }
    if (message.includes('low') || name.includes('low')) {
      return ErrorSeverity.LOW;
    }
    return ErrorSeverity.MEDIUM;
  }

  private recordError(error: AppError): void {
    // 更新錯誤統計
    const _currentCount = this.errorStats.get(error.type) || 0;
    this.errorStats.set(error.type, currentCount + 1);

    // 添加到最近錯誤列表
    this.recentErrors.push(error);
    if (this.recentErrors.length > this.maxRecentErrors) {
      this.recentErrors.shift();
    }
  }

  private logError(error: AppError, context?: string): void {
    const _logData = {
      name: error.name,
      message: error.message,
      type: error.type,
      severity: error.severity,
      code: error.code,
      context,
      timestamp: error.timestamp.toISOString(),
      stack: error.stack,
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        logger.error('High severity error:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn('Medium severity error:', logData);
        break;
      case ErrorSeverity.LOW:
        logger.info('Low severity error:', logData);
        break;
    }
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
    if (error.message.includes('database')) {
      return '檢查數據庫連接和查詢語句';
    }
    if (error.message.includes('auth')) {
      return '檢查認證憑證是否有效';
    }
    return '請稍後重試或聯繫技術支持';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 公共方法
  getErrorStats(): Map<ErrorType, number> {
    return new Map(this.errorStats);
  }

  getRecentErrors(): AppError[] {
    return [...this.recentErrors];
  }

  clearErrorStats(): void {
    this.errorStats.clear();
    this.recentErrors = [];
    this.errorCount.clear();
  }

  resetErrorCount(): void {
    this.errorCount.clear();
  }
}

// 錯誤處理裝飾器
export function withErrorHandling<T extends any[], R>(
  target: (...args: T) => Promise<R>,
  context?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await target(...args);
    } catch (error) {
      const _handler = ErrorHandler.getInstance();
      const _appError = handler.handleError(
        error as Error,
        context || target.name
      );
      throw appError;
    }
  };
}

// 方法裝飾器
export function handleErrors(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const _originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      const _handler = ErrorHandler.getInstance();
      const _appError = handler.handleError(
        error as Error,
        `${target.constructor.name}.${propertyKey}`
      );
      throw appError;
    }
  };

  return descriptor;
}

// 導出單例實例
// 導出單例實例
export const _errorHandler = ErrorHandler.getInstance();
