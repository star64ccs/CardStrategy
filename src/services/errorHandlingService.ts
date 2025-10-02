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
  errorRate: number; // 每MinuteError率
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private readonly errorHandler: ErrorHandler;
  private errorReports: ErrorReport[] = [];
  private readonly maxReports = 1000;
  private readonly errorRateWindow = 60000; // 1Minute
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
   * HandleError並生成Report
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
    // 使用 ErrorHandler HandleError
    const _appError = this.errorHandler.handleError(error, context);

    // CreateErrorReport
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

    // RecordErrorReport
    this.recordErrorReport(report);

    // RecordErrorCount
    this.recordErrorCount();

    // Root據Error嚴重程度決定YesNo需要額外Handle
    await this.handleErrorBySeverity(appError, report);

    return report;
  }

  /**
   * Root據Error嚴重程度進RowSpecialHandle
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
   * Handle嚴重Error
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

    // 可以Add緊急Notification邏輯
    // await this.sendEmergencyNotification(error, report);
  }

  /**
   * Handle高嚴重程度Error
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

    // 可以Add高優先級Notification邏輯
    // await this.sendHighPriorityNotification(error, report);
  }

  /**
   * Handle中等嚴重程度Error
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
   * Handle低嚴重程度Error
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
   * RecordErrorReport
   */
  private recordErrorReport(report: ErrorReport): void {
    this.errorReports.push(report);

    // LimitReport數量
    if (this.errorReports.length > this.maxReports) {
      this.errorReports.shift();
    }
  }

  /**
   * RecordErrorCount
   */
  private recordErrorCount(): void {
    const _now = Date.now();
    const _windowStart = now - this.errorRateWindow;

    // 清理過期的Count
    for (const [timestamp] of this.errorCounts) {
      if (timestamp < windowStart) {
        this.errorCounts.delete(timestamp);
      }
    }

    // 增加當前Time窗口的Count
    const _currentCount = this.errorCounts.get(now) || 0;
    this.errorCounts.set(now, currentCount + 1);
  }

  /**
   * 生成Report ID
   */
  private generateReportId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * GetError指標
   */
  getErrorMetrics(): ErrorMetrics {
    const _now = Date.now();
    const _windowStart = now - this.errorRateWindow;

    // 計算Error率
    let totalCount = 0;
    for (const [timestamp, count] of this.errorCounts) {
      if (timestamp >= windowStart) {
        totalCount += count;
      }
    }
    const _errorRate = totalCount / (this.errorRateWindow / 60000); // 每MinuteError率

    // StatisticsErrorClass型
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

    // StatisticsError嚴重程度
    const errorsBySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    };

    // StatisticsError上下文
    const errorsByContext: Record<string, number> = {};

    // 計算統Count據
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
      recentErrors: this.errorReports.slice(-10), // 最近10個Error
      errorRate,
    };
  }

  /**
   * GetSpecificClass型的ErrorReport
   */
  getErrorReportsByType(type: ErrorType): ErrorReport[] {
    return this.errorReports.filter(report => report.error.type === type);
  }

  /**
   * GetSpecific嚴重程度的ErrorReport
   */
  getErrorReportsBySeverity(severity: ErrorSeverity): ErrorReport[] {
    return this.errorReports.filter(
      report => report.error.severity === severity
    );
  }

  /**
   * GetSpecific上下文的ErrorReport
   */
  getErrorReportsByContext(context: string): ErrorReport[] {
    return this.errorReports.filter(report => report.context === context);
  }

  /**
   * 清理舊的ErrorReport
   */
  cleanupOldReports(maxAge: number = 24 * 60 * 60 * 1000): number {
    // Default24Hour
    const _cutoff = Date.now() - maxAge;
    const _initialCount = this.errorReports.length;

    this.errorReports = this.errorReports.filter(
      report => report.timestamp.getTime() > cutoff
    );

    return initialCount - this.errorReports.length;
  }

  /**
   * ExportErrorReport
   */
  exportErrorReports(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    }
    // 確保所有Property都可序Column化
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
   * Export為 CSV 格式
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
   * ResetServiceStatus
   */
  reset(): void {
    this.errorReports = [];
    this.errorCounts.clear();
    this.errorHandler.clearErrorStats();
  }
}

// Export單例Instance
export const _errorHandlingService = ErrorHandlingService.getInstance();
