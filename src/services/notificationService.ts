/**
 * 通知服務
 * 提供統一的通知管理功能
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { logger } from '../utils/logger';

export interface NotificationConfig {
  enabled: boolean;
  channels: {
    default: string;
    alerts: string;
    updates: string;
  };
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private config: NotificationConfig = {
    enabled: true,
    channels: {
      default: 'default',
      alerts: 'alerts',
      updates: 'updates',
    },
  };

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 初始化通知服務
   */
  public async initialize(
    config?: Partial<NotificationConfig>
  ): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn('NotificationService 已經初始化');
      return true;
    }

    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      if (!this.config.enabled) {
        logger.info('通知服務已禁用');
        this.isInitialized = true;
        return true;
      }

      // 設置通知處理器
      await this.setupNotificationHandler();

      // 請求權限
      await this.requestPermissions();

      // 創建通知渠道
      await this.createNotificationChannels();

      this.isInitialized = true;
      logger.info('NotificationService 初始化成功');
      return true;
    } catch (error) {
      logger.error('NotificationService 初始化失敗:', error);
      return false;
    }
  }

  /**
   * 設置通知處理器
   */
  private async setupNotificationHandler(): Promise<void> {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  /**
   * 請求通知權限
   */
  private async requestPermissions(): Promise<void> {
    if (!Device.isDevice) {
      logger.warn('非設備環境，跳過權限請求');
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.warn('通知權限未授予');
    }
  }

  /**
   * 創建通知渠道
   */
  private async createNotificationChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        this.config.channels.default,
        {
          name: '默認通知',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        }
      );

      await Notifications.setNotificationChannelAsync(
        this.config.channels.alerts,
        {
          name: '警報通知',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#FF231F7C',
        }
      );

      await Notifications.setNotificationChannelAsync(
        this.config.channels.updates,
        {
          name: '更新通知',
          importance: Notifications.AndroidImportance.LOW,
          vibrationPattern: [0, 250],
          lightColor: '#FF231F7C',
        }
      );
    }
  }

  /**
   * 發送本地通知
   */
  public async sendLocalNotification(
    data: NotificationData
  ): Promise<string | null> {
    if (!this.isInitialized || !this.config.enabled) {
      logger.warn('通知服務未初始化或已禁用');
      return null;
    }

    try {
      const _notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
        },
        trigger: null, // 立即發送
      });

      logger.info('本地通知發送成功:', {
        id: notificationId,
        title: data.title,
      });
      return notificationId;
    } catch (error) {
      logger.error('發送本地通知失敗:', error);
      return null;
    }
  }

  /**
   * 發送延遲通知
   */
  public async scheduleNotification(
    data: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    if (!this.isInitialized || !this.config.enabled) {
      logger.warn('通知服務未初始化或已禁用');
      return null;
    }

    try {
      const _notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
        },
        trigger,
      });

      logger.info('延遲通知設置成功:', {
        id: notificationId,
        title: data.title,
      });
      return notificationId;
    } catch (error) {
      logger.error('設置延遲通知失敗:', error);
      return null;
    }
  }

  /**
   * 取消通知
   */
  public async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.info('通知取消成功:', { id: notificationId });
      return true;
    } catch (error) {
      logger.error('取消通知失敗:', error);
      return false;
    }
  }

  /**
   * 取消所有通知
   */
  public async cancelAllNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.info('所有通知取消成功');
      return true;
    } catch (error) {
      logger.error('取消所有通知失敗:', error);
      return false;
    }
  }

  /**
   * 設置徽章數量
   */
  public async setBadgeCount(count: number): Promise<boolean> {
    try {
      await Notifications.setBadgeCountAsync(count);
      return true;
    } catch (error) {
      logger.error('設置徽章數量失敗:', error);
      return false;
    }
  }

  /**
   * 添加通知接收監聽器
   */
  public addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * 添加通知響應監聽器
   */
  public addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * 檢查服務狀態
   */
  public isServiceAvailable(): boolean {
    return this.isInitialized && this.config.enabled;
  }

  /**
   * 獲取服務統計
   */
  public getStats(): unknown {
    return {
      isInitialized: this.isInitialized,
      enabled: this.config.enabled,
      channels: this.config.channels,
    };
  }
}

// 導出單例實例
export const _notificationService = NotificationService.getInstance();
