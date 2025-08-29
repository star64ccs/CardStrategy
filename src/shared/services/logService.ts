import { Platform } from 'react-native';

import { api } from '../../core/utils/api';
import { logger, LogLevel } from '../../core/utils/logger';

/**
 * 日誌服務
 * 提供統一的日誌記錄和發送功能
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
  private readonly flushInterval = 5000; // 5秒

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
   * 記錄日誌
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

    // 添加到隊列
    this.logQueue.push(logEntry);

    // 如果隊列達到批次大小，立即處理
    if (this.logQueue.length >= this.batchSize) {
      await this.processLogQueue();
    }
  }

  /**
   * 記錄調試信息
   */
  async debug(
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * 記錄一般信息
   */
  async info(
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.INFO, message, context);
  }

  /**
   * 記錄警告信息
   */
  async warn(
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.WARN, message, context);
  }

  /**
   * 記錄錯誤信息
   */
  async error(
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await this.log(LogLevel.ERROR, message, context);
  }

  /**
   * 發送日誌到服務器
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
      // 如果發送失敗，記錄到本地
      logger.error('發送日誌到服務器失敗:', {
        error,
        originalMessage: message,
      });
    }
  }

  /**
   * 處理日誌隊列
   */
  private async processLogQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const _batch = this.logQueue.splice(0, this.batchSize);

      // 發送批次到服務器
      await this.sendLogBatch(batch);

      // 記錄到本地
      batch.forEach(entry => {
        logger[entry.level](entry.message, entry.context);
      });
    } catch (error) {
      logger.error('處理日誌隊列失敗:', { error });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 發送日誌批次
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
      // 如果批次發送失敗，嘗試逐個發送
      for (const log of logs) {
        try {
          await this.sendLog(log.level, log.message, log.context);
        } catch (sendError) {
          logger.error('發送單個日誌失敗:', { error: sendError, log });
        }
      }
    }
  }

  /**
   * 開始定期刷新
   */
  private startPeriodicFlush(): void {
    setInterval(() => {
      this.processLogQueue();
    }, this.flushInterval);
  }

  /**
   * 強制刷新日誌隊列
   */
  async flush(): Promise<void> {
    await this.processLogQueue();
  }

  /**
   * 獲取當前用戶ID
   */
  private getCurrentUserId(): string | undefined {
    try {
      // 從 Redux store 獲取用戶 ID
      const { store } = require('../../store');
      const _state = store.getState();
      return state.auth.user?.id;
    } catch {
      return undefined;
    }
  }

  /**
   * 獲取會話ID
   */
  private getSessionId(): string | undefined {
    try {
      // 從存儲中獲取會話ID
      const { AuthStorage } = require('../../core/utils/storage');
      return AuthStorage.getToken();
    } catch {
      return undefined;
    }
  }

  /**
   * 獲取用戶代理
   */
  private getUserAgent(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return 'unknown';
  }

  /**
   * 獲取平台信息
   */
  private getPlatform(): string {
    if (typeof Platform !== 'undefined') {
      return Platform.OS;
    }
    return 'web';
  }

  /**
   * 獲取日誌統計
   */
  getLogStats(): {
    queueSize: number;
    isProcessing: boolean;
    totalProcessed: number;
  } {
    return {
      queueSize: this.logQueue.length,
      isProcessing: this.isProcessing,
      totalProcessed: 0, // 可以添加計數器來追蹤
    };
  }

  /**
   * 清理日誌隊列
   */
  clearQueue(): void {
    this.logQueue = [];
  }
}

// 導出單例實例
export const _logService = LogService.getInstance();
