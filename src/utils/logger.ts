import { Platform } from 'react-native';

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableFile: boolean;
  maxFileSize: number;
  maxFiles: number;
}

class Logger {
  private config: LoggerConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableFile: false,
      maxFileSize: 1024 * 1024, // 1MB
      maxFiles: 5,
    };
  }

  public initialize(config?: Partial<LoggerConfig>): void {
    if (this.isInitialized) {
      return;
    }

    this.config = { ...this.config, ...config };
    this.isInitialized = true;

    if (__DEV__) {
      this.info('Logger initialized', { config: this.config });
    }
  }

  public debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      this.log('DEBUG', message, data);
    }
  }

  public info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      this.log('INFO', message, data);
    }
  }

  public warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      this.log('WARN', message, data);
    }
  }

  public error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      this.log('ERROR', message, error);
    }
  }

  private shouldLog(level: string): boolean {
    if (!this.isInitialized) {
      return true; // Allow未Initialize時的Log
    }

    const _levels = ['debug', 'info', 'warn', 'error'];
    const _currentLevelIndex = levels.indexOf(this.config.level);
    const _messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private log(level: string, message: string, data?: unknown): void {
    const _timestamp = new Date().toISOString();
    const _logEntry = {
      timestamp,
      level,
      message,
      data,
      platform: Platform.OS,
      version: Platform.Version,
    };

    if (this.config.enableConsole) {
      this.writeToConsole(level, logEntry);
    }

    if (this.config.enableFile) {
      this.writeToFile(logEntry);
    }
  }

  private writeToConsole(level: string, logEntry: unknown): void {
    const { timestamp, message, data } = logEntry;
    const _prefix = `[${timestamp}] [${level}]`;

    switch (level) {
      case 'DEBUG':
        console.debug(prefix, message, data);
        break;
      case 'INFO':
        console.info(prefix, message, data);
        break;
      case 'WARN':
        console.warn(prefix, message, data);
        break;
      case 'ERROR':
        console.error(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
    }
  }

  private writeToFile(logEntry: unknown): void {
    // 在 React Native 中，FileWrite需要額外的LibrarySupport
    // 這裡可以集成 react-native-fs 或其他File系統Library
    if (__DEV__) {
      console.log('File logging not implemented yet');
    }
  }

  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public clear(): void {
    // 清理LogCache或File
    if (__DEV__) {
      console.log('Logger cleared');
    }
  }
}

// Create單例Instance
export const _logger = new Logger();

// AutoInitialize
if (__DEV__) {
  logger.initialize({ level: 'debug' });
} else {
  logger.initialize({ level: 'info' });
}

export default logger;
