/**
 * PushNotificationService
 * HandlePushNotification功能，Package括LocalNotification、遠程Notification、Notification權限Manage等
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { logger } from '../../../core/utils/logger';

import { realtimeUpdateService } from './realtimeUpdateService';

export interface NotificationConfig {
  title: string;
  body: string;
  data?: unknown;
  sound?: boolean;
  priority?: 'default' | 'normal' | 'high';
  badge?: number;
  category?: string;
  channelId?: string;
  android?: {
    channelId?: string;
    priority?: 'default' | 'normal' | 'high';
    sound?: boolean;
    vibrate?: boolean;
    color?: string;
    icon?: string;
  };
  ios?: {
    sound?: boolean;
    badge?: number;
    category?: string;
    threadId?: string;
  };
}

export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  importance: 'default' | 'min' | 'low' | 'high' | 'max';
  sound?: boolean;
  vibrate?: boolean;
  enableLights?: boolean;
  lightColor?: string;
}

export interface NotificationPermission {
  granted: boolean;
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalOpened: number;
  byType: Record<string, number>;
  byChannel: Record<string, number>;
  lastSent: Date | null;
  lastOpened: Date | null;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized = false;
  private expoPushToken: string | null = null;
  private readonly notificationChannels: Map<string, NotificationChannel> =
    new Map();
  private stats: NotificationStats;
  private readonly notificationListeners: Map<
    string,
    (notification: unknown) => void
  > = new Map();

  private constructor() {
    this.stats = this.getDefaultStats();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * InitializePushNotificationService
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info('Initialize推送通知Service');

      // SettingsNotificationHandle器
      await this.setupNotificationHandlers();

      // RequestNotification權限
      await this.requestPermissions();

      // Get Expo Push令牌
      await this.getExpoPushToken();

      // CreateDefaultNotification頻道
      await this.createDefaultChannels();

      // Settings實時UpdateHandle器
      this.setupRealtimeUpdateHandler();

      this.isInitialized = true;
      logger.info('推送通知ServiceInitialize完成');
    } catch (error: unknown) {
      logger.error('推送通知ServiceInitializeFailed:', error);
      throw error;
    }
  }

  /**
   * RequestNotification權限
   */
  public async requestPermissions(): Promise<NotificationPermission> {
    try {
      // CheckYesNo為實體設備
      const { isDevice } = Device;
      if (!isDevice) {
        logger.warn('推送通知僅在實體設備上可用');
        return {
          granted: false,
          status: 'denied',
          canAskAgain: false,
        };
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const _granted = finalStatus === 'granted';

      logger.info('通知權限狀態:', { status: finalStatus, granted });

      return {
        granted,
        status: finalStatus,
        canAskAgain: finalStatus !== 'denied',
      };
    } catch (error: unknown) {
      logger.error('請求通知權限Failed:', error);
      throw error;
    }
  }

  /**
   * GetNotification權限Status
   */
  public async getPermissionStatus(): Promise<NotificationPermission> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const _granted = status === 'granted';

      return {
        granted,
        status,
        canAskAgain: status !== 'denied',
      };
    } catch (error: unknown) {
      logger.error('Get通知權限狀態Failed:', error);
      throw error;
    }
  }

  /**
   * Get Expo Push令牌
   */
  public async getExpoPushToken(): Promise<string | null> {
    try {
      // CheckYesNo為實體設備
      const { isDevice } = Device;
      if (!isDevice) {
        logger.warn('推送令牌僅在實體設備上可用');
        return null;
      }

      const _token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });

      this.expoPushToken = token.data;
      logger.info('Get Expo 推送令牌Success:', { token: this.expoPushToken });

      return this.expoPushToken;
    } catch (error: unknown) {
      logger.error('Get Expo 推送令牌Failed:', error);
      return null;
    }
  }

  /**
   * CreateNotification頻道（Android）
   */
  public async createNotificationChannel(
    channel: NotificationChannel
  ): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(channel.id, {
          name: channel.name,
          description: channel.description,
          importance:
            Notifications.AndroidImportance[
              channel.importance.toUpperCase() as keyof typeof Notifications.AndroidImportance
            ],
          sound: typeof channel.sound === 'string' ? channel.sound : undefined,
          vibrationPattern: channel.vibrate ? [0, 250, 250, 250] : undefined,
          enableLights: channel.enableLights,
          lightColor: channel.lightColor,
        });
      }

      this.notificationChannels.set(channel.id, channel);
      logger.debug('Create通知頻道Success:', {
        channelId: channel.id,
        name: channel.name,
      });
    } catch (error: unknown) {
      logger.error('Create通知頻道Failed:', error);
      throw error;
    }
  }

  /**
   * SendLocalNotification
   */
  public async sendLocalNotification(
    config: NotificationConfig
  ): Promise<string> {
    try {
      const _notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: config.title,
          body: config.body,
          data: config.data || {},
          sound: config.sound,
          priority: config.priority,
          badge: config.badge,
          categoryIdentifier: config.category,
        },
        trigger: null, // 立即Send
      });

      this.updateStats('sent', config.category || 'default');
      logger.debug('本地通知發送Success:', {
        notificationId,
        title: config.title,
      });

      return notificationId;
    } catch (error: unknown) {
      logger.error('發送本地通知Failed:', error);
      this.updateStats('failed', config.category || 'default');
      throw error;
    }
  }

  /**
   * Send延遲Notification
   */
  public async scheduleNotification(
    config: NotificationConfig,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const _notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: config.title,
          body: config.body,
          data: config.data || {},
          sound: config.sound,
          priority: config.priority,
          badge: config.badge,
          categoryIdentifier: config.category,
        },
        trigger,
      });

      this.updateStats('sent', config.category || 'default');
      logger.debug('延遲通知安排Success:', {
        notificationId,
        title: config.title,
      });

      return notificationId;
    } catch (error: unknown) {
      logger.error('安排延遲通知Failed:', error);
      this.updateStats('failed', config.category || 'default');
      throw error;
    }
  }

  /**
   * CancelNotification
   */
  public async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.debug('取消通知Success:', { notificationId });
    } catch (error: unknown) {
      logger.error('取消通知Failed:', error);
      throw error;
    }
  }

  /**
   * Cancel所有Notification
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.debug('取消所有通知Success');
    } catch (error: unknown) {
      logger.error('取消所有通知Failed:', error);
      throw error;
    }
  }

  /**
   * SettingsNotification徽章數量
   */
  public async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      logger.debug('Settings通知徽章數量Success:', { count });
    } catch (error: unknown) {
      logger.error('Settings通知徽章數量Failed:', error);
      throw error;
    }
  }

  /**
   * GetNotificationStatistics
   */
  public getStats(): NotificationStats {
    return { ...this.stats };
  }

  /**
   * ClearNotificationStatistics
   */
  public clearStats(): void {
    this.stats = this.getDefaultStats();
    logger.debug('清除通知統計數據');
  }

  /**
   * AddNotification監聽器
   */
  public addNotificationListener(
    type: 'received' | 'response',
    listener: (notification: unknown) => void
  ): void {
    const _key = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.notificationListeners.set(key, listener);

    if (type === 'received') {
      Notifications.addNotificationReceivedListener(listener);
    } else {
      Notifications.addNotificationResponseReceivedListener(listener);
    }

    logger.debug('添加通知監聽器:', { type, key });
  }

  /**
   * RemoveNotification監聽器
   */
  public removeNotificationListener(key: string): void {
    const _listener = this.notificationListeners.get(key);
    if (listener) {
      // 注意：Expo Notifications 沒有提供RemoveSpecific監聽器的Method
      // 這裡只Yes從我們的Record中Remove
      this.notificationListeners.delete(key);
      logger.debug('移除通知監聽器:', { key });
    }
  }

  /**
   * SettingsNotificationHandle器
   */
  private async setupNotificationHandlers(): Promise<void> {
    try {
      // SettingsNotificationHandle器
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // 監聽NotificationReceive
      Notifications.addNotificationReceivedListener(notification => {
        this.handleNotificationReceived(notification);
      });

      // 監聽NotificationResponse
      Notifications.addNotificationResponseReceivedListener(response => {
        this.handleNotificationResponse(response);
      });
    } catch (error: unknown) {
      logger.error('Settings通知Handle器Failed:', error);
      throw error;
    }
  }

  /**
   * CreateDefaultNotification頻道
   */
  private async createDefaultChannels(): Promise<void> {
    const defaultChannels: NotificationChannel[] = [
      {
        id: 'default',
        name: '默認通知',
        description: '默認通知頻道',
        importance: 'high',
        sound: true,
        vibrate: true,
      },
      {
        id: 'card_updates',
        name: '卡片更新',
        description: '卡片相關的通知',
        importance: 'high',
        sound: true,
        vibrate: true,
      },
      {
        id: 'system',
        name: '系統通知',
        description: '系統相關的通知',
        importance: 'default',
        sound: false,
        vibrate: false,
      },
    ];

    for (const channel of defaultChannels) {
      await this.createNotificationChannel(channel);
    }
  }

  /**
   * Settings實時UpdateHandle器
   */
  private setupRealtimeUpdateHandler(): void {
    realtimeUpdateService.registerHandler({
      id: 'push_notification_handler',
      type: 'notification',
      priority: 1,
      handler: async update => {
        try {
          const _notification = update.data;
          await this.sendLocalNotification({
            title: notification.title || '通知',
            body: notification.message || notification.body || '',
            data: notification.data || {},
            category: notification.category || 'default',
            sound: notification.sound !== false,
            priority: notification.priority || 'normal',
          });
        } catch (error: unknown) {
          logger.error('Handle實時通知UpdateFailed:', error);
        }
      },
    });
  }

  /**
   * HandleNotificationReceive
   */
  private handleNotificationReceived(notification: unknown): void {
    logger.debug('通知已接收:', {
      title: notification.request.content.title,
      body: notification.request.content.body,
    });

    this.updateStats(
      'delivered',
      notification.request.content.categoryIdentifier || 'default'
    );
  }

  /**
   * HandleNotificationResponse
   */
  private handleNotificationResponse(response: unknown): void {
    logger.debug('通知已響應:', {
      title: response.notification.request.content.title,
      actionIdentifier: response.actionIdentifier,
    });

    this.updateStats(
      'opened',
      response.notification.request.content.categoryIdentifier || 'default'
    );

    // HandleNotificationData
    const { data } = response.notification.request.content;
    if (data?.action) {
      this.handleNotificationAction(data.action, data);
    }
  }

  /**
   * HandleNotification動作
   */
  private handleNotificationAction(action: string, data: unknown): void {
    logger.debug('處理通知動作:', { action, data });

    switch (action) {
      case 'open_card':
        // Handle打On卡片動作
        break;
      case 'open_screen':
        // Handle打On屏幕動作
        break;
      case 'dismiss':
        // HandleIgnore動作
        break;
      default:
        logger.debug('未知的通知動作:', { action });
    }
  }

  /**
   * Update統Count據
   */
  private updateStats(
    type: 'sent' | 'delivered' | 'failed' | 'opened',
    category: string
  ): void {
    switch (type) {
      case 'sent':
        this.stats.totalSent++;
        this.stats.lastSent = new Date();
        break;
      case 'delivered':
        this.stats.totalDelivered++;
        break;
      case 'failed':
        this.stats.totalFailed++;
        break;
      case 'opened':
        this.stats.totalOpened++;
        this.stats.lastOpened = new Date();
        break;
    }

    this.stats.byType[type] = (this.stats.byType[type] || 0) + 1;
    this.stats.byChannel[category] = (this.stats.byChannel[category] || 0) + 1;
  }

  /**
   * GetDefault統Count據
   */
  private getDefaultStats(): NotificationStats {
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      totalOpened: 0,
      byType: {},
      byChannel: {},
      lastSent: null,
      lastOpened: null,
    };
  }
}

export const _pushNotificationService = PushNotificationService.getInstance();
