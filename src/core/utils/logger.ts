// 統一LogTool
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  userId?: string;
}

class Logger {
  private readonly isDevelopment = __DEV__;
  private logHistory: LogEntry[] = [];
  private readonly maxHistorySize = 1000;

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      userId: this.getCurrentUserId(),
    };

    // Save到歷史Record
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // 在On發環境中Output到Control台
    if (this.isDevelopment) {
      const _timestamp = entry.timestamp.toISOString();
      const _prefix = `[${timestamp}] [${level.toUpperCase()}]`;

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

    // 在生產環境中Send到LogService
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      // SendError到LogService
      this.sendToLogService(entry);
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      // 從 Redux store GetUser ID
      const { store } = require('../../store');
      const _state = store.getState();
      return state.auth.user?.id;
    } catch (error) {
      // 如果無法Get Redux store，嘗試從 AsyncStorage Get
      try {
        const _AsyncStorage = require('@react-native-async-storage/async-storage');
        const _userData = AsyncStorage.getItem('user_data');
        if (userData) {
          const _parsed = JSON.parse(userData);
          return parsed.id;
        }
      } catch {
        // 如果都Failed了，Return undefined
      }
      return undefined;
    }
  }

  private async sendToLogService(entry: LogEntry): Promise<void> {
    try {
      // 使用新的LogService
      const { logService } = require('../../shared/services/logService');
      await logService.sendLog(entry.level, entry.message, entry.context);
    } catch (error) {
      // 如果LogServiceFailed，至少Record到Control台
      console.error('日誌Service發送Failed:', error);
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

  // GetLog歷史
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  // ClearLog歷史
  clearHistory() {
    this.logHistory = [];
  }

  // ExportLog
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }
}

export const _logger = new Logger();
