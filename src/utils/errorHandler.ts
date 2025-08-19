import { logger } from '@/utils/logger';

// 錯誤類型枚舉
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN = 'UNKNOWN'
}

// 錯誤嚴重程度
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// 錯誤信息接口
export interface ErrorInfo {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  requestInfo?: {
    method?: string;
    url?: string;
    path?: string;
    params?: Record<string, unknown>;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
  };
  context?: {
    route?: string;
    component?: string;
    service?: string;
    function?: string;
  };
  stack?: string;
}

// 自定義錯誤類
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

// 錯誤處理器類
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorStats: Map<ErrorType, number> = new Map();
  private recentErrors: ErrorInfo[] = [];
  private maxRecentErrors = 100;

  private constructor() {
    // 私有構造函數，防止外部實例化
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // 處理錯誤
  public handleError(error: Error | AppError, context?: Record<string, unknown>): ErrorInfo {
    const errorInfo = this.parseError(error, context);

    // 記錄錯誤統計
    this.recordError(errorInfo);

    // 記錄錯誤日誌
    this.logError(errorInfo);

    // 根據嚴重程度決定是否發送警報
    if (errorInfo.severity === ErrorSeverity.CRITICAL || errorInfo.severity === ErrorSeverity.HIGH) {
      this.sendAlert(errorInfo);
    }

    return errorInfo;
  }

  // 解析錯誤
  private parseError(error: Error | AppError, context?: Record<string, unknown>): ErrorInfo {
    const isAppError = error instanceof AppError;

    return {
      id: this.generateErrorId(),
      type: isAppError ? error.type : this.determineErrorType(error),
      severity: isAppError ? error.severity : this.determineErrorSeverity(error),
      message: error.message || '未知錯誤',
      code: isAppError ? error.code : undefined,
      details: isAppError ? error.details : undefined,
      timestamp: new Date(),
      context: context as any,
      stack: error.stack
    };
  }

  // 生成錯誤 ID
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 確定錯誤類型
  private determineErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('network') || message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK;
    }
    if (name.includes('validation') || message.includes('validation')) {
      return ErrorType.VALIDATION;
    }
    if (name.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return ErrorType.AUTHENTICATION;
    }
    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND;
    }
    if (name.includes('server') || message.includes('server error')) {
      return ErrorType.SERVER_ERROR;
    }

    return ErrorType.UNKNOWN;
  }

  // 確定錯誤嚴重程度
  private determineErrorSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (name.includes('critical') || message.includes('critical')) {
      return ErrorSeverity.CRITICAL;
    }
    if (name.includes('high') || message.includes('high')) {
      return ErrorSeverity.HIGH;
    }
    if (name.includes('low') || message.includes('low')) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  // 記錄錯誤統計
  private recordError(errorInfo: ErrorInfo): void {
    const currentCount = this.errorStats.get(errorInfo.type) || 0;
    this.errorStats.set(errorInfo.type, currentCount + 1);

    // 添加到最近錯誤列表
    this.recentErrors.push(errorInfo);
    if (this.recentErrors.length > this.maxRecentErrors) {
      this.recentErrors.shift();
    }
  }

  // 記錄錯誤日誌
  private logError(errorInfo: ErrorInfo): void {
    const logMessage = `[${errorInfo.type}] ${errorInfo.message}`;
    const logContext = {
      errorId: errorInfo.id,
      severity: errorInfo.severity,
      code: errorInfo.code,
      details: errorInfo.details,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp.toISOString()
    };

    switch (errorInfo.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error(logMessage, logContext);
        break;
      case ErrorSeverity.HIGH:
        logger.error(logMessage, logContext);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(logMessage, logContext);
        break;
      case ErrorSeverity.LOW:
        logger.info(logMessage, logContext);
        break;
    }
  }

  // 發送警報
  private sendAlert(errorInfo: ErrorInfo): void {
    // 這裡可以集成第三方警報服務，如 Sentry、Bugsnag 等
    logger.error('需要立即關注的錯誤:', {
      errorId: errorInfo.id,
      type: errorInfo.type,
      severity: errorInfo.severity,
      message: errorInfo.message,
      timestamp: errorInfo.timestamp.toISOString()
    });
  }

  // 獲取錯誤統計
  public getErrorStats(): Map<ErrorType, number> {
    return new Map(this.errorStats);
  }

  // 獲取最近錯誤
  public getRecentErrors(): ErrorInfo[] {
    return [...this.recentErrors];
  }

  // 清理錯誤統計
  public clearErrorStats(): void {
    this.errorStats.clear();
    this.recentErrors = [];
  }

  // 創建網絡錯誤
  public static createNetworkError(
    message: string,
    details?: Record<string, unknown>
  ): AppError {
    return new AppError(
      message,
      ErrorType.NETWORK,
      ErrorSeverity.HIGH,
      'NETWORK_ERROR',
      details
    );
  }

  // 創建驗證錯誤
  public static createValidationError(
    message: string,
    details?: Record<string, unknown>
  ): AppError {
    return new AppError(
      message,
      ErrorType.VALIDATION,
      ErrorSeverity.MEDIUM,
      'VALIDATION_ERROR',
      details
    );
  }

  // 創建認證錯誤
  public static createAuthenticationError(
    message: string,
    details?: Record<string, unknown>
  ): AppError {
    return new AppError(
      message,
      ErrorType.AUTHENTICATION,
      ErrorSeverity.HIGH,
      'AUTHENTICATION_ERROR',
      details
    );
  }

  // 創建授權錯誤
  public static createAuthorizationError(
    message: string,
    details?: Record<string, unknown>
  ): AppError {
    return new AppError(
      message,
      ErrorType.AUTHORIZATION,
      ErrorSeverity.HIGH,
      'AUTHORIZATION_ERROR',
      details
    );
  }

  // 創建未找到錯誤
  public static createNotFoundError(
    message: string,
    details?: Record<string, unknown>
  ): AppError {
    return new AppError(
      message,
      ErrorType.NOT_FOUND,
      ErrorSeverity.MEDIUM,
      'NOT_FOUND_ERROR',
      details
    );
  }

  // 創建服務器錯誤
  public static createServerError(
    message: string,
    details?: Record<string, unknown>
  ): AppError {
    return new AppError(
      message,
      ErrorType.SERVER_ERROR,
      ErrorSeverity.CRITICAL,
      'SERVER_ERROR',
      details
    );
  }
}

// 導出單例實例
export const errorHandler = ErrorHandler.getInstance();

// 錯誤處理裝飾器
export function handleErrors(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      return await method.apply(this, args);
    } catch (error) {
      const errorInfo = errorHandler.handleError(error as Error, {
        component: target.constructor.name,
        function: propertyName,
        args
      });
      throw error;
    }
  };
}

// 異步錯誤處理包裝器
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorInfo = errorHandler.handleError(error as Error, {
        function: fn.name,
        args,
        ...context
      });
      throw error;
    }
  }) as T;
}
