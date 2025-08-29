import type { AppError } from '../core/utils/errorHandler';
import {
  ErrorHandler,
  ErrorSeverity,
  ErrorType,
} from '../core/utils/errorHandler';
import { logger } from '../core/utils/logger';

export interface ErrorReport {
  id: string;
  error: AppError;
  context: string;
  timestamp: Date;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  environment: string;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByContext: Record<string, number>;
  recentErrors: ErrorReport[];
  errorRate: number; // 每分鐘錯誤率
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private readonly errorHandler: ErrorHandler;
  private errorReports: ErrorReport[] = [];
  private readonly maxReports = 1000;
  private readonly errorRateWindow = 60000; // 1分鐘
  private readonly errorCounts: Map<number, number> = new Map(); // timestamp -> count

  private constructor() {
    this.errorHandler = ErrorHandler.getInstance();
  }

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * 處理錯誤並生成報告
   */
  async handleError(
    error: Error | AppError,
    context: string,
    options: {
      userId?: string;
      sessionId?: string;
      userAgent?: string;
      environment?: string;
    } = {}
  ): Promise<ErrorReport> {
    // 使用 ErrorHandler 處理錯誤
    const _appError = this.errorHandler.handleError(error, context);

    // 創建錯誤報告
    const report: ErrorReport = {
      id: this.generateReportId(),
      error: appError,
      context,
      timestamp: new Date(),
      userAgent: options.userAgent,
      userId: options.userId,
      sessionId: options.sessionId,
      environment: options.environment || 'production',
    };

    // 記錄錯誤報告
    this.recordErrorReport(report);

    // 記錄錯誤計數
    this.recordErrorCount();

    // 根據錯誤嚴重程度決定是否需要額外處理
    await this.handleErrorBySeverity(appError, report);

    return report;
  }

  /**
   * 根據錯誤嚴重程度進行特殊處理
   */
  private async handleErrorBySeverity(
    error: AppError,
    report: ErrorReport
  ): Promise<void> {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        await this.handleCriticalError(error, report);
        break;
      case ErrorSeverity.HIGH:
        await this.handleHighSeverityError(error, report);
        break;
      case ErrorSeverity.MEDIUM:
        await this.handleMediumSeverityError(error, report);
        break;
      case ErrorSeverity.LOW:
        await this.handleLowSeverityError(error, report);
        break;
    }
  }

  /**
   * 處理嚴重錯誤
   */
  private async handleCriticalError(
    error: AppError,
    report: ErrorReport
  ): Promise<void> {
    logger.error('Critical error detected:', {
      error: error.message,
      context: report.context,
      reportId: report.id,
      timestamp: report.timestamp,
    });

    // 可以添加緊急通知邏輯
    // await this.sendEmergencyNotification(error, report);
  }

  /**
   * 處理高嚴重程度錯誤
   */
  private async handleHighSeverityError(
    error: AppError,
    report: ErrorReport
  ): Promise<void> {
    logger.error('High severity error detected:', {
      error: error.message,
      context: report.context,
      reportId: report.id,
      timestamp: report.timestamp,
    });

    // 可以添加高優先級通知邏輯
    // await this.sendHighPriorityNotification(error, report);
  }

  /**
   * 處理中等嚴重程度錯誤
   */
  private async handleMediumSeverityError(
    error: AppError,
    report: ErrorReport
  ): Promise<void> {
    logger.warn('Medium severity error detected:', {
      error: error.message,
      context: report.context,
      reportId: report.id,
      timestamp: report.timestamp,
    });
  }

  /**
   * 處理低嚴重程度錯誤
   */
  private async handleLowSeverityError(
    error: AppError,
    report: ErrorReport
  ): Promise<void> {
    logger.info('Low severity error detected:', {
      error: error.message,
      context: report.context,
      reportId: report.id,
      timestamp: report.timestamp,
    });
  }

  /**
   * 記錄錯誤報告
   */
  private recordErrorReport(report: ErrorReport): void {
    this.errorReports.push(report);

    // 限制報告數量
    if (this.errorReports.length > this.maxReports) {
      this.errorReports.shift();
    }
  }

  /**
   * 記錄錯誤計數
   */
  private recordErrorCount(): void {
    const _now = Date.now();
    const _windowStart = now - this.errorRateWindow;

    // 清理過期的計數
    for (const [timestamp] of this.errorCounts) {
      if (timestamp < windowStart) {
        this.errorCounts.delete(timestamp);
      }
    }

    // 增加當前時間窗口的計數
    const _currentCount = this.errorCounts.get(now) || 0;
    this.errorCounts.set(now, currentCount + 1);
  }

  /**
   * 生成報告 ID
   */
  private generateReportId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 獲取錯誤指標
   */
  getErrorMetrics(): ErrorMetrics {
    const _now = Date.now();
    const _windowStart = now - this.errorRateWindow;

    // 計算錯誤率
    let totalCount = 0;
    for (const [timestamp, count] of this.errorCounts) {
      if (timestamp >= windowStart) {
        totalCount += count;
      }
    }
    const _errorRate = totalCount / (this.errorRateWindow / 60000); // 每分鐘錯誤率

    // 統計錯誤類型
    const errorsByType: Record<ErrorType, number> = {
      [ErrorType.NETWORK]: 0,
      [ErrorType.VALIDATION]: 0,
      [ErrorType.AUTHENTICATION]: 0,
      [ErrorType.AUTHORIZATION]: 0,
      [ErrorType.DATABASE]: 0,
      [ErrorType.EXTERNAL_SERVICE]: 0,
      [ErrorType.CONFIGURATION]: 0,
      [ErrorType.UNKNOWN]: 0,
    };

    // 統計錯誤嚴重程度
    const errorsBySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };

    // 統計錯誤上下文
    const errorsByContext: Record<string, number> = {};

    // 計算統計數據
    for (const report of this.errorReports) {
      errorsByType[report.error.type]++;
      errorsBySeverity[report.error.severity]++;
      errorsByContext[report.context] =
        (errorsByContext[report.context] || 0) + 1;
    }

    return {
      totalErrors: this.errorReports.length,
      errorsByType,
      errorsBySeverity,
      errorsByContext,
      recentErrors: this.errorReports.slice(-10), // 最近10個錯誤
      errorRate,
    };
  }

  /**
   * 獲取特定類型的錯誤報告
   */
  getErrorReportsByType(type: ErrorType): ErrorReport[] {
    return this.errorReports.filter(report => report.error.type === type);
  }

  /**
   * 獲取特定嚴重程度的錯誤報告
   */
  getErrorReportsBySeverity(severity: ErrorSeverity): ErrorReport[] {
    return this.errorReports.filter(
      report => report.error.severity === severity
    );
  }

  /**
   * 獲取特定上下文的錯誤報告
   */
  getErrorReportsByContext(context: string): ErrorReport[] {
    return this.errorReports.filter(report => report.context === context);
  }

  /**
   * 清理舊的錯誤報告
   */
  cleanupOldReports(maxAge: number = 24 * 60 * 60 * 1000): number {
    // 默認24小時
    const _cutoff = Date.now() - maxAge;
    const _initialCount = this.errorReports.length;

    this.errorReports = this.errorReports.filter(
      report => report.timestamp.getTime() > cutoff
    );

    return initialCount - this.errorReports.length;
  }

  /**
   * 導出錯誤報告
   */
  exportErrorReports(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    }
    // 確保所有屬性都可序列化
    const _serializableReports = this.errorReports.map(report => ({
      id: report.id,
      context: report.context,
      timestamp: report.timestamp.toISOString(),
      userAgent: report.userAgent,
      userId: report.userId,
      sessionId: report.sessionId,
      environment: report.environment,
      error: {
        name: report.error.name,
        message: report.error.message,
        type: report.error.type,
        severity: report.error.severity,
        code: report.error.code,
        details: report.error.details,
        isOperational: report.error.isOperational,
        stack: report.error.stack,
      },
    }));
    return JSON.stringify(serializableReports, null, 2);
  }

  /**
   * 導出為 CSV 格式
   */
  private exportToCSV(): string {
    const _headers = [
      'ID',
      'Timestamp',
      'Type',
      'Severity',
      'Message',
      'Context',
      'Environment',
    ];
    const _rows = this.errorReports.map(report => [
      report.id,
      report.timestamp.toISOString(),
      report.error.type,
      report.error.severity,
      report.error.message,
      report.context,
      report.environment,
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  /**
   * 重置服務狀態
   */
  reset(): void {
    this.errorReports = [];
    this.errorCounts.clear();
    this.errorHandler.clearErrorStats();
  }
}

// 導出單例實例
export const _errorHandlingService = ErrorHandlingService.getInstance();
