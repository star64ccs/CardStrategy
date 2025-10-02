import { Platform } from 'react-native';

import { api } from '../../core/utils/api';
import { logger, LogLevel } from '../../core/utils/logger';

/**
 * LogService
 * 提供統一的LogRecord和Send功能
 */
export class LogService {
  private static instance: LogService;
  private logQueue: {
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    timestamp: Date;
  }[] = [];
  private isProcessing = false;
  private readonly batchSize = 10;
  private readonly flushInterval = 5000; // 5Second

  private constructor() {
    this.startPeriodicFlush();
  }

  static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }
    return LogService.instance;
  }

  /**
   * RecordLog
   */
  async log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    const _logEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
    };

    // Add到Queue
    this.logQueue.push(logEntry);

    // 如果Queue達到批次大小，立即Handle
    if (this.logQueue.length >= this.batchSize) {
      await this.processLogQueue();
    }
  }

  /**
   * RecordDebugInformation
   */
  async debug(
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Record一般Information
   */
  async info(
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.INFO, message, context);
  }

  /**
   * RecordWarningInformation
   */
  async warn(
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.WARN, message, context);
  }

  /**
   * RecordErrorInformation
   */
  async error(
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.ERROR, message, context);
  }

  /**
   * SendLog到Server
   */
  async sendLog(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    try {
      const _logData = {
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId(),
        userAgent: this.getUserAgent(),
        platform: this.getPlatform(),
      };

      await api.post('/logs', logData, { withAuth: false });
    } catch (error) {
      // 如果SendFailed，Record到Local
      logger.error('發送日誌到ServerFailed:', {
        error,
        originalMessage: message,
      });
    }
  }

  /**
   * HandleLogQueue
   */
  private async processLogQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const _batch = this.logQueue.splice(0, this.batchSize);

      // Send批次到Server
      await this.sendLogBatch(batch);

      // Record到Local
      batch.forEach(entry => {
        logger[entry.level](entry.message, entry.context);
      });
    } catch (error) {
      logger.error('Handle日誌隊列Failed:', { error });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * SendLog批次
   */
  private async sendLogBatch(
    logs: {
      level: LogLevel;
      message: string;
      context?: Record<string, unknown>;
      timestamp: Date;
    }[]
  ): Promise<void> {
    try {
      const _logData = logs.map(log => ({
        level: log.level,
        message: log.message,
        context: log.context,
        timestamp: log.timestamp.toISOString(),
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId(),
        userAgent: this.getUserAgent(),
        platform: this.getPlatform(),
      }));

      await api.post('/logs/batch', { logs: logData }, { withAuth: false });
    } catch (error) {
      // 如果批次SendFailed，嘗試逐個Send
      for (const log of logs) {
        try {
          await this.sendLog(log.level, log.message, log.context);
        } catch (sendError) {
          logger.error('發送單個日誌Failed:', { error: sendError, log });
        }
      }
    }
  }

  /**
   * Begin定期Refresh
   */
  private startPeriodicFlush(): void {
    setInterval(() => {
      this.processLogQueue();
    }, this.flushInterval);
  }

  /**
   * ForceRefreshLogQueue
   */
  async flush(): Promise<void> {
    await this.processLogQueue();
  }

  /**
   * Get當前UserID
   */
  private getCurrentUserId(): string | undefined {
    try {
      // 從 Redux store GetUser ID
      const { store } = require('../../store');
      const _state = store.getState();
      return state.auth.user?.id;
    } catch {
      return undefined;
    }
  }

  /**
   * Get會話ID
   */
  private getSessionId(): string | undefined {
    try {
      // 從Storage中Get會話ID
      const { AuthStorage } = require('../../core/utils/storage');
      return AuthStorage.getToken();
    } catch {
      return undefined;
    }
  }

  /**
   * GetUser代理
   */
  private getUserAgent(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return 'unknown';
  }

  /**
   * Get平台Information
   */
  private getPlatform(): string {
    if (typeof Platform !== 'undefined') {
      return Platform.OS;
    }
    return 'web';
  }

  /**
   * GetLogStatistics
   */
  getLogStats(): {
    queueSize: number;
    isProcessing: boolean;
    totalProcessed: number;
  } {
    return {
      queueSize: this.logQueue.length,
      isProcessing: this.isProcessing,
      totalProcessed: 0, // 可以AddCount器來Trace
    };
  }

  /**
   * 清理LogQueue
   */
  clearQueue(): void {
    this.logQueue = [];
  }
}

// Export單例Instance
export const _logService = LogService.getInstance();
