import { Platform } from 'react-native';

import { logger } from '../../../core/utils/logger';

// Android 推送通知相關類型
export interface AndroidPushNotificationConfig {
  // FCM 配置
  fcmServerKey: string;
  fcmProjectId: string;
  fcmEnvironment: 'development' | 'production';

  // 推送設置
  enableBadge: boolean;
  enableSound: boolean;
  enableAlert: boolean;
  enableVibration: boolean;

  // 高級設置
  priority: 'normal' | 'high';
  timeToLive: number; // 秒
  collapseKey?: string;
  data?: Record<string, string>;
}

export interface AndroidPushNotificationPayload {
  notification?: {
    title: string;
    body: string;
    icon?: string;
    color?: string;
    sound?: string;
    tag?: string;
    clickAction?: string;
    bodyLocKey?: string;
    bodyLocArgs?: string[];
    titleLocKey?: string;
    titleLocArgs?: string[];
    channelId?: string;
  };
  data?: Record<string, string>;
  android?: {
    priority?: 'normal' | 'high';
    notification?: {
      icon?: string;
      color?: string;
      sound?: string;
      tag?: string;
      clickAction?: string;
      channelId?: string;
      priority?: 'min' | 'low' | 'default' | 'high' | 'max';
      defaultSound?: boolean;
      defaultVibrateTimings?: boolean;
      defaultLightSettings?: boolean;
      vibrateTimings?: number[];
      lightSettings?: {
        color: string;
        lightOnDuration: number;
        lightOffDuration: number;
      };
      visibility?: 'private' | 'public' | 'secret';
      notificationCount?: number;
      sticky?: boolean;
      localOnly?: boolean;
      ticker?: string;
      eventTime?: string;
      showWhen?: boolean;
      when?: number;
      useChronometer?: boolean;
      chronometerCountDown?: boolean;
      showProgress?: boolean;
      maxProgress?: number;
      progress?: number;
      indeterminate?: boolean;
      autoCancel?: boolean;
      ongoing?: boolean;
      onlyAlertOnce?: boolean;
      alertOnce?: boolean;
      largeIcon?: string;
      bigPicture?: string;
      style?: 'default' | 'bigtext' | 'bigpicture' | 'inbox' | 'messaging';
      bigText?: string;
      bigTextStyle?: {
        contentTitle?: string;
        summaryText?: string;
        bigText?: string;
        htmlText?: string;
      };
      inboxStyle?: {
        contentTitle?: string;
        summaryText?: string;
        lines?: string[];
      };
      messagingStyle?: {
        conversationTitle?: string;
        userDisplayName?: string;
        groupConversation?: boolean;
        messages?: {
          text: string;
          timestamp: number;
          senderId?: string;
        }[];
      };
    };
  };
}

export interface AndroidPushNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
  timestamp: Date;
  multicastId?: string;
  successCount?: number;
  failureCount?: number;
  canonicalIds?: number;
}

export interface AndroidDeviceToken {
  token: string;
  timestamp: Date;
  environment: 'development' | 'production';
  isValid: boolean;
  appVersion: string;
  sdkVersion: string;
}

export interface AndroidPushNotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  successRate: number;
  averageDeliveryTime: number;
  lastSentAt?: Date;
  topicSubscriptions: number;
  activeTokens: number;
}

// Android 推送通知庫接口
interface AndroidPushNotificationLibrary {
  // 設備令牌管理
  requestPermissions(): Promise<boolean>;
  getDeviceToken(): Promise<string | null>;
  registerForRemoteNotifications(): Promise<boolean>;
  unregisterForRemoteNotifications(): Promise<boolean>;

  // 推送發送
  sendNotification(
    deviceToken: string,
    payload: AndroidPushNotificationPayload,
    config: AndroidPushNotificationConfig
  ): Promise<AndroidPushNotificationResult>;

  // 批量發送
  sendBulkNotifications(
    deviceTokens: string[],
    payload: AndroidPushNotificationPayload,
    config: AndroidPushNotificationConfig
  ): Promise<AndroidPushNotificationResult[]>;

  // 主題訂閱
  subscribeToTopic(topic: string): Promise<boolean>;
  unsubscribeFromTopic(topic: string): Promise<boolean>;

  // 統計和監控
  getDeliveryStats(): Promise<AndroidPushNotificationStats>;
  validateDeviceToken(token: string): Promise<boolean>;
  getAppVersion(): Promise<string>;
  getSDKVersion(): Promise<string>;
}

/**
 * Android 專用推送通知服務
 * 處理 FCM 推送通知功能
 */
export class AndroidPushNotificationService {
  private static instance: AndroidPushNotificationService;
  private pushLib: AndroidPushNotificationLibrary | null = null;
  private isInitialized = false;
  private deviceToken: string | null = null;
  private config: AndroidPushNotificationConfig | null = null;
  private readonly stats: AndroidPushNotificationStats = {
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    successRate: 0,
    averageDeliveryTime: 0,
    topicSubscriptions: 0,
    activeTokens: 0,
  };

  private constructor() {
    this.initializeAndroidPushNotificationLibrary();
  }

  static getInstance(): AndroidPushNotificationService {
    if (!AndroidPushNotificationService.instance) {
      AndroidPushNotificationService.instance =
        new AndroidPushNotificationService();
    }
    return AndroidPushNotificationService.instance;
  }

  /**
   * 初始化 Android 推送通知庫
   */
  private async initializeAndroidPushNotificationLibrary(): Promise<void> {
    try {
      if (Platform.OS !== 'android') {
        throw new Error('此服務僅支持 Android 平台');
      }

      this.pushLib = await this.loadAndroidPushNotificationLibrary();
      this.isInitialized = true;
      logger.info('Android 推送通知服務初始化成功');
    } catch (error) {
      logger.error('Android 推送通知服務初始化失敗:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 加載 Android 推送通知庫
   */
  private async loadAndroidPushNotificationLibrary(): Promise<AndroidPushNotificationLibrary> {
    // 在實際應用中，這裡會導入真實的 Android 推送通知庫
    // 例如：@react-native-firebase/messaging, react-native-fcm 等

    return {
      requestPermissions: async () => {
        // 模擬請求權限
        const granted = Math.random() > 0.1;
        logger.info('Android 推送通知權限請求結果:', { granted });
        return granted;
      },

      getDeviceToken: async () => {
        // 模擬獲取設備令牌
        const token = `android-fcm-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.deviceToken = token;
        logger.info('Android 設備令牌獲取成功:', { token });
        return token;
      },

      registerForRemoteNotifications: async () => {
        // 模擬註冊遠程推送
        logger.info('Android 遠程推送註冊成功');
        return true;
      },

      unregisterForRemoteNotifications: async () => {
        // 模擬取消註冊遠程推送
        logger.info('Android 遠程推送取消註冊成功');
        return true;
      },

      sendNotification: async (
        deviceToken: string,
        payload: AndroidPushNotificationPayload,
        config: AndroidPushNotificationConfig
      ) => {
        // 模擬發送推送通知
        const success = Math.random() > 0.2;
        const startTime = Date.now();

        if (success) {
          const messageId = `android-message-${Date.now()}`;
          this.stats.totalSent++;
          this.stats.totalDelivered++;
          this.stats.lastSentAt = new Date();

          logger.info('Android 推送通知發送成功', {
            messageId,
            deviceToken: `${deviceToken.substring(0, 20)}...`,
            payload,
          });

          return {
            success: true,
            messageId,
            timestamp: new Date(),
          };
        } else {
          this.stats.totalSent++;
          this.stats.totalFailed++;

          logger.warn('Android 推送通知發送失敗', {
            deviceToken: `${deviceToken.substring(0, 20)}...`,
            error: 'Network error',
          });

          return {
            success: false,
            error: 'Network error',
            errorCode: 'network_error',
            timestamp: new Date(),
          };
        }
      },

      sendBulkNotifications: async (
        deviceTokens: string[],
        payload: AndroidPushNotificationPayload,
        config: AndroidPushNotificationConfig
      ) => {
        // 模擬批量發送推送通知
        const results: AndroidPushNotificationResult[] = [];
        const multicastId = `android-multicast-${Date.now()}`;
        let successCount = 0;
        let failureCount = 0;

        for (const token of deviceTokens) {
          const result = await this.pushLib.sendNotification(
            token,
            payload,
            config
          );
          results.push(result);

          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }
        }

        // 更新統計信息
        this.stats.totalSent += deviceTokens.length;
        this.stats.totalDelivered += successCount;
        this.stats.totalFailed += failureCount;

        logger.info('Android 批量推送通知發送完成', {
          multicastId,
          totalTokens: deviceTokens.length,
          successCount,
          failureCount,
        });

        return results;
      },

      subscribeToTopic: async (topic: string) => {
        // 模擬訂閱主題
        const success = Math.random() > 0.1;
        logger.info('Android 主題訂閱結果:', { topic, success });
        return success;
      },

      unsubscribeFromTopic: async (topic: string) => {
        // 模擬取消訂閱主題
        const success = Math.random() > 0.1;
        logger.info('Android 主題取消訂閱結果:', { topic, success });
        return success;
      },

      getDeliveryStats: async () => {
        // 計算成功率
        if (this.stats.totalSent > 0) {
          this.stats.successRate =
            (this.stats.totalDelivered / this.stats.totalSent) * 100;
        }

        return this.stats;
      },

      validateDeviceToken: async (token: string) => {
        // 模擬驗證設備令牌
        const isValid =
          token.length > 20 && token.includes('android-fcm-token');
        logger.info('Android 設備令牌驗證結果:', {
          token: `${token.substring(0, 20)}...`,
          isValid,
        });
        return isValid;
      },

      getAppVersion: async () => {
        // 模擬獲取應用版本
        return '1.0.0';
      },

      getSDKVersion: async () => {
        // 模擬獲取 SDK 版本
        return '2.0.0';
      },
    };
  }

  /**
   * 配置推送通知服務
   */
  public configure(config: AndroidPushNotificationConfig): void {
    this.config = config;
    logger.info('Android 推送通知服務配置完成', { config });
  }

  /**
   * 請求推送通知權限
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.pushLib) {
        throw new Error('Android 推送通知服務未初始化');
      }

      const granted = await this.pushLib.requestPermissions();

      if (granted) {
        logger.info('Android 推送通知權限已授予');
      } else {
        logger.warn('Android 推送通知權限被拒絕');
      }

      return granted;
    } catch (error) {
      logger.error('請求 Android 推送通知權限失敗:', error);
      return false;
    }
  }

  /**
   * 獲取設備令牌
   */
  public async getDeviceToken(): Promise<string | null> {
    if (!this.isInitialized || !this.pushLib) {
      throw new Error('Android 推送通知服務未初始化');
    }

    try {
      if (!this.deviceToken) {
        this.deviceToken = await this.pushLib.getDeviceToken();
      }

      return this.deviceToken;
    } catch (error) {
      logger.error('獲取 Android 設備令牌失敗:', error);
      return null;
    }
  }

  /**
   * 註冊遠程推送通知
   */
  public async registerForRemoteNotifications(): Promise<boolean> {
    if (!this.isInitialized || !this.pushLib) {
      throw new Error('Android 推送通知服務未初始化');
    }

    try {
      const success = await this.pushLib.registerForRemoteNotifications();

      if (success) {
        // 獲取設備令牌
        await this.getDeviceToken();
        logger.info('Android 遠程推送通知註冊成功');
      }

      return success;
    } catch (error) {
      logger.error('註冊 Android 遠程推送通知失敗:', error);
      return false;
    }
  }

  /**
   * 取消註冊遠程推送通知
   */
  public async unregisterForRemoteNotifications(): Promise<boolean> {
    if (!this.isInitialized || !this.pushLib) {
      throw new Error('Android 推送通知服務未初始化');
    }

    try {
      const success = await this.pushLib.unregisterForRemoteNotifications();

      if (success) {
        this.deviceToken = null;
        logger.info('Android 遠程推送通知取消註冊成功');
      }

      return success;
    } catch (error) {
      logger.error('取消註冊 Android 遠程推送通知失敗:', error);
      return false;
    }
  }

  /**
   * 發送推送通知
   */
  public async sendNotification(
    deviceToken: string,
    payload: AndroidPushNotificationPayload,
    config?: AndroidPushNotificationConfig
  ): Promise<AndroidPushNotificationResult> {
    try {
      if (!this.isInitialized || !this.pushLib) {
        throw new Error('Android 推送通知服務未初始化');
      }

      const finalConfig = config || this.config;
      if (!finalConfig) {
        throw new Error('推送通知配置未設置');
      }

      const result = await this.pushLib.sendNotification(
        deviceToken,
        payload,
        finalConfig
      );

      // 更新統計信息
      if (result.success) {
        this.stats.totalDelivered++;
      } else {
        this.stats.totalFailed++;
      }

      return result;
    } catch (error) {
      logger.error('發送 Android 推送通知失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        errorCode: 'unknown_error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 批量發送推送通知
   */
  public async sendBulkNotifications(
    deviceTokens: string[],
    payload: AndroidPushNotificationPayload,
    config?: AndroidPushNotificationConfig
  ): Promise<AndroidPushNotificationResult[]> {
    try {
      if (!this.isInitialized || !this.pushLib) {
        throw new Error('Android 推送通知服務未初始化');
      }

      const finalConfig = config || this.config;
      if (!finalConfig) {
        throw new Error('推送通知配置未設置');
      }

      const results = await this.pushLib.sendBulkNotifications(
        deviceTokens,
        payload,
        finalConfig
      );

      logger.info('Android 批量推送通知發送完成', {
        totalTokens: deviceTokens.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length,
      });

      return results;
    } catch (error) {
      logger.error('批量發送 Android 推送通知失敗:', error);
      return deviceTokens.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        errorCode: 'unknown_error',
        timestamp: new Date(),
      }));
    }
  }

  /**
   * 訂閱主題
   */
  public async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.pushLib) {
        throw new Error('Android 推送通知服務未初始化');
      }

      const success = await this.pushLib.subscribeToTopic(topic);

      if (success) {
        this.stats.topicSubscriptions++;
        logger.info('Android 主題訂閱成功:', { topic });
      }

      return success;
    } catch (error) {
      logger.error('Android 主題訂閱失敗:', error);
      return false;
    }
  }

  /**
   * 取消訂閱主題
   */
  public async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.pushLib) {
        throw new Error('Android 推送通知服務未初始化');
      }

      const success = await this.pushLib.unsubscribeFromTopic(topic);

      if (success) {
        this.stats.topicSubscriptions = Math.max(
          0,
          this.stats.topicSubscriptions - 1
        );
        logger.info('Android 主題取消訂閱成功:', { topic });
      }

      return success;
    } catch (error) {
      logger.error('Android 主題取消訂閱失敗:', error);
      return false;
    }
  }

  /**
   * 獲取推送統計信息
   */
  public async getDeliveryStats(): Promise<AndroidPushNotificationStats> {
    try {
      if (!this.isInitialized || !this.pushLib) {
        throw new Error('Android 推送通知服務未初始化');
      }

      const stats = await this.pushLib.getDeliveryStats();
      return stats;
    } catch (error) {
      logger.error('獲取 Android 推送統計信息失敗:', error);
      return this.stats;
    }
  }

  /**
   * 驗證設備令牌
   */
  public async validateDeviceToken(token: string): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.pushLib) {
        throw new Error('Android 推送通知服務未初始化');
      }

      return await this.pushLib.validateDeviceToken(token);
    } catch (error) {
      logger.error('驗證 Android 設備令牌失敗:', error);
      return false;
    }
  }

  /**
   * 獲取服務信息
   */
  public getServiceInfo() {
    return {
      isInitialized: this.isInitialized,
      platform: Platform.OS,
      deviceToken: this.deviceToken
        ? `${this.deviceToken.substring(0, 20)}...`
        : null,
      config: this.config
        ? {
            fcmEnvironment: this.config.fcmEnvironment,
            enableBadge: this.config.enableBadge,
            enableSound: this.config.enableSound,
            enableAlert: this.config.enableAlert,
            enableVibration: this.config.enableVibration,
          }
        : null,
      stats: this.stats,
    };
  }

  /**
   * 檢查服務狀態
   */
  public isServiceReady(): boolean {
    return this.isInitialized && this.pushLib !== null;
  }
}
