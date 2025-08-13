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
      userId: undefined // TODO: 從 Redux store 獲取用戶 ID
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
          console.debug(prefix, message, context || '');
          break;
        case LogLevel.INFO:
          // eslint-disable-next-line no-console
          console.info(prefix, message, context || '');
          break;
        case LogLevel.WARN:
          // eslint-disable-next-line no-console
          console.warn(prefix, message, context || '');
          break;
        case LogLevel.ERROR:
          // eslint-disable-next-line no-console
          console.error(prefix, message, context || '');
          break;
      }
    }

    // TODO: 在生產環境中發送到日誌服務
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      // 發送錯誤到日誌服務
      this.sendToLogService(entry);
    }
  }

  private sendToLogService(entry: LogEntry) {
    // TODO: 實現日誌服務發送邏輯
    // 例如：發送到 Sentry、LogRocket 等
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
