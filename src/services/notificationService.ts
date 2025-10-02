/**
 * NotificationService
 * 提供統一的NotificationManage功能
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
   * InitializeNotificationService
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
        logger.info('通知Service已禁用');
        this.isInitialized = true;
        return true;
      }

      // SettingsNotificationHandle器
      await this.setupNotificationHandler();

      // Request權限
      await this.requestPermissions();

      // CreateNotification渠道
      await this.createNotificationChannels();

      this.isInitialized = true;
      logger.info('NotificationService InitializeSuccess');
      return true;
    } catch (error) {
      logger.error('NotificationService InitializeFailed:', error);
      return false;
    }
  }

  /**
   * SettingsNotificationHandle器
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
   * RequestNotification權限
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
   * CreateNotification渠道
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
   * SendLocalNotification
   */
  public async sendLocalNotification(
    data: NotificationData
  ): Promise<string | null> {
    if (!this.isInitialized || !this.config.enabled) {
      logger.warn('通知Service未Initialize或已禁用');
      return null;
    }

    try {
      const _notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data || {},
        },
        trigger: null, // 立即Send
      });

      logger.info('本地通知發送Success:', {
        id: notificationId,
        title: data.title,
      });
      return notificationId;
    } catch (error) {
      logger.error('發送本地通知Failed:', error);
      return null;
    }
  }

  /**
   * Send延遲Notification
   */
  public async scheduleNotification(
    data: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    if (!this.isInitialized || !this.config.enabled) {
      logger.warn('通知Service未Initialize或已禁用');
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

      logger.info('延遲通知SettingsSuccess:', {
        id: notificationId,
        title: data.title,
      });
      return notificationId;
    } catch (error) {
      logger.error('Settings延遲通知Failed:', error);
      return null;
    }
  }

  /**
   * CancelNotification
   */
  public async cancelNotification(notificationId: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.info('通知取消Success:', { id: notificationId });
      return true;
    } catch (error) {
      logger.error('取消通知Failed:', error);
      return false;
    }
  }

  /**
   * Cancel所有Notification
   */
  public async cancelAllNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.info('所有通知取消Success');
      return true;
    } catch (error) {
      logger.error('取消所有通知Failed:', error);
      return false;
    }
  }

  /**
   * Settings徽章數量
   */
  public async setBadgeCount(count: number): Promise<boolean> {
    try {
      await Notifications.setBadgeCountAsync(count);
      return true;
    } catch (error) {
      logger.error('Settings徽章數量Failed:', error);
      return false;
    }
  }

  /**
   * AddNotificationReceive監聽器
   */
  public addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * AddNotificationResponse監聽器
   */
  public addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * CheckServiceStatus
   */
  public isServiceAvailable(): boolean {
    return this.isInitialized && this.config.enabled;
  }

  /**
   * GetServiceStatistics
   */
  public getStats(): unknown {
    return {
      isInitialized: this.isInitialized,
      enabled: this.config.enabled,
      channels: this.config.channels,
    };
  }
}

// Export單例Instance
export const _notificationService = NotificationService.getInstance();
