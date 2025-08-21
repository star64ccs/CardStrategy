// 統一日誌工具
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  userId?: string;
}

class Logger {
  private isDevelopment = __DEV__;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000;

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      userId: this.getCurrentUserId()
    };

    // 保存到歷史記錄
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // 在開發環境中輸出到控制台
    if (this.isDevelopment) {
      const timestamp = entry.timestamp.toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

      switch (level) {
        case LogLevel.DEBUG:
          // eslint-disable-next-line no-console
          // logger.info(prefix, message, context || '');
          break;
        case LogLevel.INFO:
          // eslint-disable-next-line no-console
          // logger.info(prefix, message, context || '');
          break;
        case LogLevel.WARN:
          // eslint-disable-next-line no-console
          // logger.info(prefix, message, context || '');
          break;
        case LogLevel.ERROR:
          // eslint-disable-next-line no-console
          // logger.info(prefix, message, context || '');
          break;
      }
    }

    // 在生產環境中發送到日誌服務
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      // 發送錯誤到日誌服務
      this.sendToLogService(entry);
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      // 從 Redux store 獲取用戶 ID
      const { store } = require('@/store');
      const state = store.getState();
      return state.auth.user?.id;
    } catch (error) {
      // 如果無法獲取 Redux store，嘗試從 AsyncStorage 獲取
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        const userData = AsyncStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          return parsed.id;
        }
      } catch {
        // 如果都失敗了，返回 undefined
      }
      return undefined;
    }
  }

  private async sendToLogService(entry: LogEntry): Promise<void> {
    try {
      // 使用新的日誌服務
      const { logService } = require('@/services/logService');
      await logService.sendLog(entry.level, entry.message, entry.context);
    } catch (error) {
      // 如果日誌服務失敗，至少記錄到控制台
      // logger.info('日誌服務發送失敗:', error);
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context);
  }

  // 獲取日誌歷史
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  // 清除日誌歷史
  clearHistory() {
    this.logHistory = [];
  }

  // 導出日誌
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }
}

export const logger = new Logger();
