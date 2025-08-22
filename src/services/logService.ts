import { logger } from '@/utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 日誌服務配置
interface LogServiceConfig {
  sentryDsn?: string;
  logRocketAppId?: string;
  customLogEndpoint?: string;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
}

// 日誌批次
interface LogBatch {
  logs: LogEntry[];
  timestamp: Date;
  retryCount: number;
}

// 日誌條目
interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
  appVersion?: string;
  buildNumber?: string;
  platform?: string;
  tags?: Record<string, string>;
}

// 設備信息
interface DeviceInfo {
  platform: string;
  version: string;
  model: string;
  brand: string;
  deviceId: string;
  screenWidth: number;
  screenHeight: number;
  screenDensity: number;
}

// 日誌服務類
class LogService {
  private config: LogServiceConfig;
  private logQueue: LogEntry[] = [];
  private batchQueue: LogBatch[] = [];
  private isFlushing = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private deviceInfo: DeviceInfo | null = null;

  constructor(config: Partial<LogServiceConfig> = {}) {
    this.config = {
      batchSize: 50,
      flushInterval: 30000, // 30秒
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.initializeDeviceInfo();
    this.startFlushTimer();
  }

  // 初始化設備信息
  private async initializeDeviceInfo(): Promise<void> {
    try {
      const { Platform, Dimensions } = require('react-native');
      const { getUniqueId } = require('react-native-device-info');
      const Constants = require('expo-constants').default;

      const screen = Dimensions.get('screen');

      this.deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
        model: Constants.deviceName || 'Unknown',
        brand: Constants.deviceBrand || 'Unknown',
        deviceId: await getUniqueId(),
        screenWidth: screen.width,
        screenHeight: screen.height,
        screenDensity: screen.scale,
      };
    } catch (error) {
      logger.error('初始化設備信息失敗:', { error });
    }
  }

  // 生成會話 ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 發送日誌
  async sendLog(
    level: string,
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    try {
      const logEntry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
        userId: this.getCurrentUserId(),
        sessionId: this.sessionId,
        deviceInfo: this.deviceInfo || undefined,
        appVersion: this.getAppVersion(),
        buildNumber: this.getBuildNumber(),
        platform: 'react-native',
        tags: this.generateTags(level, context),
      };

      // 添加到隊列
      this.logQueue.push(logEntry);

      // 檢查是否需要立即發送
      if (this.logQueue.length >= this.config.batchSize) {
        await this.flushLogs();
      }
    } catch (error) {
      logger.error('添加日誌到隊列失敗:', { error, level, message });
    }
  }

  // 獲取當前用戶 ID
  private getCurrentUserId(): string | undefined {
    try {
      const { store } = require('@/store');
      const state = store.getState();
      return state.auth.user?.id;
    } catch (error) {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        const userData = AsyncStorage.getItem('user_data');
        if (userData) {
          const parsed = JSON.parse(userData);
          return parsed.id;
        }
      } catch {
        // 忽略錯誤
      }
      return undefined;
    }
  }

  // 獲取應用版本
  private getAppVersion(): string {
    try {
      const Constants = require('expo-constants').default;
      return Constants.expoConfig?.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // 獲取構建號
  private getBuildNumber(): string {
    try {
      const Constants = require('expo-constants').default;
      return (
        Constants.expoConfig?.ios?.buildNumber ||
        Constants.expoConfig?.android?.versionCode?.toString() ||
        'unknown'
      );
    } catch {
      return 'unknown';
    }
  }

  // 生成標籤
  private generateTags(
    level: string,
    context?: Record<string, unknown>
  ): Record<string, string> {
    const tags: Record<string, string> = {
      level,
      platform: 'react-native',
      environment: __DEV__ ? 'development' : 'production',
    };

    // 從上下文中提取標籤
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        if (typeof value === 'string' && key.startsWith('tag_')) {
          tags[key.replace('tag_', '')] = value;
        }
      });
    }

    return tags;
  }

  // 開始定時刷新
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.config.flushInterval);
  }

  // 刷新日誌
  async flushLogs(): Promise<void> {
    if (this.isFlushing || this.logQueue.length === 0) {
      return;
    }

    this.isFlushing = true;

    try {
      const logs = this.logQueue.splice(0, this.config.batchSize);
      const batch: LogBatch = {
        logs,
        timestamp: new Date(),
        retryCount: 0,
      };

      await this.sendBatch(batch);
    } catch (error) {
      logger.error('刷新日誌失敗:', { error });
    } finally {
      this.isFlushing = false;
    }
  }

  // 發送批次
  private async sendBatch(batch: LogBatch): Promise<void> {
    try {
      // 發送到 Sentry
      if (this.config.sentryDsn) {
        await this.sendToSentry(batch.logs);
      }

      // 發送到 LogRocket
      if (this.config.logRocketAppId) {
        await this.sendToLogRocket(batch.logs);
      }

      // 發送到自定義端點
      if (this.config.customLogEndpoint) {
        await this.sendToCustomEndpoint(batch.logs);
      }

      // 發送到後端 API
      await this.sendToBackendAPI(batch.logs);
    } catch (error) {
      logger.error('發送日誌批次失敗:', {
        error,
        batchSize: batch.logs.length,
      });

      // 重試機制
      if (batch.retryCount < this.config.maxRetries) {
        batch.retryCount++;
        this.batchQueue.push(batch);

        setTimeout(() => {
          this.retryFailedBatches();
        }, this.config.retryDelay * batch.retryCount);
      } else {
        // 達到最大重試次數，保存到本地
        await this.saveToLocalStorage(batch.logs);
      }
    }
  }

  // 發送到 Sentry
  private async sendToSentry(logs: LogEntry[]): Promise<void> {
    try {
      const Sentry = require('@sentry/react-native');

      logs.forEach((log) => {
        if (log.level === 'error') {
          Sentry.captureException(new Error(log.message), {
            extra: log.context,
            user: { id: log.userId },
            tags: log.tags,
            contexts: {
              device: log.deviceInfo,
              app: {
                version: log.appVersion,
                build: log.buildNumber,
              },
            },
          });
        } else {
          Sentry.captureMessage(log.message, {
            level: log.level as any,
            extra: log.context,
            user: { id: log.userId },
            tags: log.tags,
          });
        }
      });
    } catch (error) {
      logger.error('發送到 Sentry 失敗:', { error });
    }
  }

  // 發送到 LogRocket
  private async sendToLogRocket(logs: LogEntry[]): Promise<void> {
    try {
      const LogRocket = require('logrocket');

      logs.forEach((log) => {
        LogRocket.captureException(new Error(log.message), {
          extra: {
            ...log.context,
            level: log.level,
            timestamp: log.timestamp,
            sessionId: log.sessionId,
            deviceInfo: log.deviceInfo,
          },
        });
      });
    } catch (error) {
      logger.error('發送到 LogRocket 失敗:', { error });
    }
  }

  // 發送到自定義端點
  private async sendToCustomEndpoint(logs: LogEntry[]): Promise<void> {
    try {
      const { api } = require('@/config/api');

      await api.post(
        this.config.customLogEndpoint!,
        {
          logs,
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId,
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      logger.error('發送到自定義端點失敗:', { error });
      throw error;
    }
  }

  // 發送到後端 API
  private async sendToBackendAPI(logs: LogEntry[]): Promise<void> {
    try {
      const { api } = require('@/config/api');

      await api.post(
        '/logs/batch',
        {
          logs,
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId,
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      logger.error('發送到後端 API 失敗:', { error });
      throw error;
    }
  }

  // 重試失敗的批次
  private async retryFailedBatches(): Promise<void> {
    if (this.batchQueue.length === 0) {
      return;
    }

    const batch = this.batchQueue.shift();
    if (batch) {
      await this.sendBatch(batch);
    }
  }

  // 保存到本地存儲
  private async saveToLocalStorage(logs: LogEntry[]): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const key = `failed_logs_${Date.now()}`;
      await AsyncStorage.setItem(key, JSON.stringify(logs));

      // 清理舊的失敗日誌（保留最近 10 個）
      await this.cleanupOldFailedLogs();
    } catch (error) {
      logger.error('保存失敗日誌到本地存儲失敗:', { error });
    }
  }

  // 清理舊的失敗日誌
  private async cleanupOldFailedLogs(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const keys = await AsyncStorage.getAllKeys();
      const failedLogKeys = keys.filter((key) =>
        key.startsWith('failed_logs_')
      );

      if (failedLogKeys.length > 10) {
        // 按時間戳排序，保留最新的 10 個
        failedLogKeys.sort();
        const keysToRemove = failedLogKeys.slice(0, failedLogKeys.length - 10);
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      logger.error('清理舊的失敗日誌失敗:', { error });
    }
  }

  // 設置用戶信息
  setUser(userId: string, userInfo?: Record<string, unknown>): void {
    try {
      const Sentry = require('@sentry/react-native');
      Sentry.setUser({
        id: userId,
        ...userInfo,
      });
    } catch (error) {
      logger.error('設置 Sentry 用戶信息失敗:', { error });
    }
  }

  // 設置標籤
  setTag(key: string, value: string): void {
    try {
      const Sentry = require('@sentry/react-native');
      Sentry.setTag(key, value);
    } catch (error) {
      logger.error('設置 Sentry 標籤失敗:', { error });
    }
  }

  // 設置上下文
  setContext(name: string, context: Record<string, unknown>): void {
    try {
      const Sentry = require('@sentry/react-native');
      Sentry.setContext(name, context);
    } catch (error) {
      logger.error('設置 Sentry 上下文失敗:', { error });
    }
  }

  // 手動刷新
  async forceFlush(): Promise<void> {
    await this.flushLogs();
  }

  // 清理資源
  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // 強制刷新剩餘日誌
    this.flushLogs();
  }

  // 獲取隊列狀態
  getQueueStatus(): { queueLength: number; batchQueueLength: number } {
    return {
      queueLength: this.logQueue.length,
      batchQueueLength: this.batchQueue.length,
    };
  }
}

// 創建日誌服務實例
export { LogService };
export const logService = new LogService({
  sentryDsn: process.env.SENTRY_DSN,
  logRocketAppId: process.env.LOGROCKET_APP_ID,
  customLogEndpoint: process.env.CUSTOM_LOG_ENDPOINT,
  batchSize: 50,
  flushInterval: 30000,
  maxRetries: 3,
  retryDelay: 1000,
});
