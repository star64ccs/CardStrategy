import { logger } from '@/utils/logger';
import { notificationService } from './notificationService';

// 錯誤類型定義
export interface AppError {
  id: string;
  type: 'api' | 'network' | 'validation' | 'auth' | 'system' | 'unknown';
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
}

// 錯誤處理配置
export interface ErrorHandlerConfig {
  enableNotifications: boolean;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  logErrors: boolean;
  reportToAnalytics: boolean;
}

// 錯誤處理策略
export interface ErrorStrategy {
  shouldRetry: (error: AppError) => boolean;
  shouldNotify: (error: AppError) => boolean;
  shouldLog: (error: AppError) => boolean;
  getRetryDelay: (error: AppError) => number;
  getErrorMessage: (error: AppError) => string;
}

class ErrorHandlerService {
  private errors: AppError[] = [];
  private config: ErrorHandlerConfig = {
    enableNotifications: true,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    logErrors: true,
    reportToAnalytics: true
  };

  private strategies: Map<string, ErrorStrategy> = new Map();

  constructor() {
    this.initializeDefaultStrategies();
  }

  // 初始化默認錯誤處理策略
  private initializeDefaultStrategies(): void {
    // API 錯誤策略
    this.strategies.set('api', {
      shouldRetry: (error) => {
        const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
        return error.details?.status && retryableStatusCodes.includes(error.details.status);
      },
      shouldNotify: (error) => error.severity === 'high' || error.severity === 'critical',
      shouldLog: (error) => true,
      getRetryDelay: (error) => this.config.retryDelay * Math.pow(2, error.retryCount),
      getErrorMessage: (error) => {
        if (error.details?.status === 401) return '認證失敗，請重新登錄';
        if (error.details?.status === 403) return '權限不足';
        if (error.details?.status === 404) return '請求的資源不存在';
        if (error.details?.status === 429) return '請求過於頻繁，請稍後再試';
        if (error.details?.status >= 500) return '服務器錯誤，請稍後再試';
        return error.message || '發生未知錯誤';
      }
    });

    // 網絡錯誤策略
    this.strategies.set('network', {
      shouldRetry: (error) => true,
      shouldNotify: (error) => error.severity === 'high' || error.severity === 'critical',
      shouldLog: (error) => true,
      getRetryDelay: (error) => this.config.retryDelay * Math.pow(2, error.retryCount),
      getErrorMessage: (error) => '網絡連接錯誤，請檢查您的網絡連接'
    });

    // 驗證錯誤策略
    this.strategies.set('validation', {
      shouldRetry: (error) => false,
      shouldNotify: (error) => false,
      shouldLog: (error) => true,
      getRetryDelay: (error) => 0,
      getErrorMessage: (error) => error.message || '輸入數據驗證失敗'
    });

    // 認證錯誤策略
    this.strategies.set('auth', {
      shouldRetry: (error) => false,
      shouldNotify: (error) => true,
      shouldLog: (error) => true,
      getRetryDelay: (error) => 0,
      getErrorMessage: (error) => '認證失敗，請重新登錄'
    });

    // 系統錯誤策略
    this.strategies.set('system', {
      shouldRetry: (error) => error.severity !== 'critical',
      shouldNotify: (error) => error.severity === 'critical',
      shouldLog: (error) => true,
      getRetryDelay: (error) => this.config.retryDelay * Math.pow(2, error.retryCount),
      getErrorMessage: (error) => '系統錯誤，請稍後再試'
    });
  }

  // 處理錯誤
  async handleError(
    error: Error | string,
    context?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    type: 'api' | 'network' | 'validation' | 'auth' | 'system' | 'unknown' = 'unknown'
  ): Promise<AppError> {
    const appError: AppError = {
      id: this.generateErrorId(),
      type,
      message: typeof error === 'string' ? error : error.message,
      details: typeof error === 'string' ? undefined : error,
      timestamp: new Date(),
      severity,
      handled: false,
      retryable: false,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      context
    };

    // 獲取錯誤處理策略
    const strategy = this.strategies.get(type) || this.strategies.get('unknown')!;

    // 設置重試屬性
    appError.retryable = strategy.shouldRetry(appError);

    // 記錄錯誤
    if (this.config.logErrors && strategy.shouldLog(appError)) {
      this.logError(appError);
    }

    // 發送通知
    if (this.config.enableNotifications && strategy.shouldNotify(appError)) {
      await this.sendErrorNotification(appError, strategy);
    }

    // 報告到分析服務
    if (this.config.reportToAnalytics) {
      this.reportError(appError);
    }

    // 保存錯誤
    this.errors.push(appError);

    // 標記為已處理
    appError.handled = true;

    return appError;
  }

  // 重試操作
  async retryOperation<T>(
    operation: () => Promise<T>,
    context?: string,
    maxRetries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: AppError | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const appError = await this.handleError(
          error as Error,
          context,
          'medium',
          'api'
        );

        appError.retryCount = attempt;
        lastError = appError;

        // 檢查是否應該重試
        const strategy = this.strategies.get(appError.type)!;
        if (!strategy.shouldRetry(appError) || attempt >= maxRetries) {
          break;
        }

        // 等待重試延遲
        const delay = strategy.getRetryDelay(appError);
        await new Promise(resolve => setTimeout(resolve, delay));

        logger.warn(`重試操作 (${attempt}/${maxRetries})`, { context, delay });
      }
    }

    throw new Error(lastError?.message || '操作失敗');
  }

  // 處理 API 錯誤
  async handleApiError(error: any, context?: string): Promise<AppError> {
    let type: 'api' | 'network' | 'auth' = 'api';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    // 判斷錯誤類型
    if (error.response) {
      const {status} = error.response;
      if (status === 401 || status === 403) {
        type = 'auth';
        severity = 'high';
      } else if (status >= 500) {
        severity = 'high';
      }
    } else if (error.request) {
      type = 'network';
      severity = 'high';
    }

    return this.handleError(error, context, severity, type);
  }

  // 處理驗證錯誤
  async handleValidationError(errors: string[], context?: string): Promise<AppError> {
    const message = errors.join(', ');
    return this.handleError(message, context, 'low', 'validation');
  }

  // 處理認證錯誤
  async handleAuthError(error: Error | string, context?: string): Promise<AppError> {
    return this.handleError(error, context, 'high', 'auth');
  }

  // 記錄錯誤
  private logError(error: AppError): void {
    const logData = {
      errorId: error.id,
      type: error.type,
      message: error.message,
      severity: error.severity,
      context: error.context,
      timestamp: error.timestamp.toISOString(),
      retryCount: error.retryCount,
      details: error.details
    };

    switch (error.severity) {
      case 'critical':
        logger.error('嚴重錯誤', logData);
        break;
      case 'high':
        logger.error('高級錯誤', logData);
        break;
      case 'medium':
        logger.warn('中級錯誤', logData);
        break;
      case 'low':
        logger.info('低級錯誤', logData);
        break;
    }
  }

  // 發送錯誤通知
  private async sendErrorNotification(error: AppError, strategy: ErrorStrategy): Promise<void> {
    try {
      const message = strategy.getErrorMessage(error);

      await notificationService.sendNotification({
        id: `error_${error.id}`,
        type: 'error',
        title: '系統錯誤',
        message,
        data: {
          errorId: error.id,
          errorType: error.type,
          context: error.context,
          timestamp: error.timestamp.toISOString()
        },
        priority: error.severity === 'critical' ? 'high' : 'normal',
        category: 'system_error'
      });
    } catch (notificationError) {
      logger.error('發送錯誤通知失敗', { error: notificationError });
    }
  }

  // 報告錯誤到分析服務
  private reportError(error: AppError): void {
    try {
      // 這裡可以集成 Sentry、Bugsnag 等錯誤追蹤服務
      if (process.env.SENTRY_DSN) {
        const Sentry = require('@sentry/react-native');
        Sentry.captureException(new Error(error.message), {
          extra: {
            errorId: error.id,
            type: error.type,
            context: error.context,
            severity: error.severity,
            retryCount: error.retryCount
          },
          tags: {
            errorType: error.type,
            severity: error.severity
          }
        });
      }
    } catch (reportError) {
      logger.error('報告錯誤失敗', { error: reportError });
    }
  }

  // 生成錯誤 ID
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 獲取錯誤統計
  getErrorStats(): {
    total: number;
    byType: { [key: string]: number };
    bySeverity: { [key: string]: number };
    unhandled: number;
    retryable: number;
    } {
    const stats = {
      total: this.errors.length,
      byType: {} as { [key: string]: number },
      bySeverity: {} as { [key: string]: number },
      unhandled: 0,
      retryable: 0
    };

    this.errors.forEach(error => {
      // 按類型統計
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;

      // 按嚴重程度統計
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;

      // 未處理錯誤
      if (!error.handled) stats.unhandled++;

      // 可重試錯誤
      if (error.retryable) stats.retryable++;
    });

    return stats;
  }

  // 清理舊錯誤
  cleanupOldErrors(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);
    this.errors = this.errors.filter(error => error.timestamp > cutoff);
  }

  // 獲取所有錯誤
  getAllErrors(): AppError[] {
    return [...this.errors];
  }

  // 獲取未處理錯誤
  getUnhandledErrors(): AppError[] {
    return this.errors.filter(error => !error.handled);
  }

  // 更新配置
  updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // 添加自定義錯誤策略
  addErrorStrategy(type: string, strategy: ErrorStrategy): void {
    this.strategies.set(type, strategy);
  }
}

// 導出單例實例
export const errorHandlerService = new ErrorHandlerService();
