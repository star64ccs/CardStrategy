import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { logger } from '@/utils/logger';
import { navigationService } from './navigationService';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 配置通知行為
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

export interface PriceAlert {
  cardId: string;
  cardName: string;
  targetPrice: number;
  currentPrice: number;
  type: 'above' | 'below';
}

export interface NotificationSettings {
  priceAlerts: boolean;
  marketUpdates: boolean;
  investmentAdvice: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  // 初始化通知服務
  async initialize(): Promise<void> {
    try {
      // 請求權限
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('通知權限未授予');
        return;
      }

      // 獲取 Expo Push Token
      if (Device.isDevice) {
        this.expoPushToken = (await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PROJECT_ID
        })).data;

        logger.info('Expo Push Token 獲取成功', { token: this.expoPushToken });
      }

      // 設置通知監聽器
      this.setupNotificationListeners();

      // 創建通知頻道 (Android)
      if (Platform.OS === 'android') {
        await this.createNotificationChannels();
      }

      logger.info('通知服務初始化完成');
    } catch (error) {
      logger.error('通知服務初始化失敗:', { error });
    }
  }

  // 設置通知監聽器
  private setupNotificationListeners(): void {
    // 通知接收監聽器
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      logger.info('收到通知:', {
        title: notification.request.content.title,
        body: notification.request.content.body
      });
    });

    // 通知響應監聽器
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      logger.info('用戶點擊通知:', {
        actionIdentifier: response.actionIdentifier,
        data: response.notification.request.content.data
      });

      // 處理通知點擊事件
      this.handleNotificationResponse(response);
    });
  }

  // 處理通知響應
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const {data} = response.notification.request.content;

    // 使用智能導航處理通知
    if (data?.type) {
      logger.info('處理通知響應:', { type: data.type, data });
      navigationService.smartNavigate(data.type, data);
    } else if (data?.type === 'smart_notification') {
      // 處理智能通知
      logger.info('處理智能通知', { data });
      this.handleSmartNotification(data);
    }
  }

  // 導航到卡片詳情頁面
  private navigateToCardDetail(cardId: string): void {
    navigationService.navigateToCardDetail(cardId);
  }

  // 導航到市場分析頁面
  private navigateToMarketAnalysis(marketId: string): void {
    navigationService.navigateToMarketAnalysis(marketId);
  }

  // 更新通知徽章
  updateNotificationBadge(count: number): void {
    navigationService.setNotificationBadge(count);
  }

  // 處理智能通知
  private async handleSmartNotification(data: any): Promise<void> {
    try {
      // 記錄通知點擊
      if (data.notificationId) {
        const { smartNotificationService } = await import('./smartNotificationService');
        await smartNotificationService.recordNotificationClick(data.notificationId);
      }

      // 根據通知類型和數據進行相應處理
      switch (data.category) {
        case 'market':
          // 導航到市場頁面
          logger.info('導航到市場頁面', { data });
          break;
        case 'portfolio':
          // 導航到投資組合頁面
          logger.info('導航到投資組合頁面', { data });
          break;
        case 'social':
          // 導航到社交頁面
          logger.info('導航到社交頁面', { data });
          break;
        case 'system':
          // 處理系統通知
          logger.info('處理系統通知', { data });
          break;
      }
    } catch (error) {
      logger.error('處理智能通知失敗:', { error, data });
    }
  }

  // 創建通知頻道 (Android)
  private async createNotificationChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync('price-alerts', {
      name: '價格提醒',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default'
    });

    await Notifications.setNotificationChannelAsync('market-updates', {
      name: '市場更新',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#FF231F7C'
    });

    await Notifications.setNotificationChannelAsync('investment-advice', {
      name: '投資建議',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default'
    });

    await Notifications.setNotificationChannelAsync('system', {
      name: '系統通知',
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [0, 250]
    });
  }

  // 發送本地通知
  async sendLocalNotification(notification: NotificationData): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound ? 'default' : undefined,
          priority: notification.priority || 'default'
        },
        trigger: null // 立即發送
      });

      logger.info('本地通知發送成功', {
        id: notificationId,
        title: notification.title
      });

      return notificationId;
    } catch (error) {
      logger.error('本地通知發送失敗:', { error, notification });
      throw error;
    }
  }

  // 發送價格提醒通知
  async sendPriceAlert(alert: PriceAlert): Promise<string> {
    const title = '價格提醒';
    const body = `${alert.cardName} 的價格已${alert.type === 'above' ? '上漲' : '下跌'}到 ${alert.currentPrice} TWD`;

    return this.sendLocalNotification({
      title,
      body,
      data: {
        type: 'price_alert',
        cardId: alert.cardId,
        cardName: alert.cardName,
        currentPrice: alert.currentPrice,
        targetPrice: alert.targetPrice
      },
      channelId: 'price-alerts',
      sound: true,
      priority: 'high'
    });
  }

  // 發送市場更新通知
  async sendMarketUpdate(title: string, body: string, data?: Record<string, any>): Promise<string> {
    return this.sendLocalNotification({
      title,
      body,
      data: {
        type: 'market_update',
        ...data
      },
      channelId: 'market-updates',
      sound: false,
      priority: 'default'
    });
  }

  // 發送投資建議通知
  async sendInvestmentAdvice(title: string, body: string, data?: Record<string, any>): Promise<string> {
    return this.sendLocalNotification({
      title,
      body,
      data: {
        type: 'investment_advice',
        ...data
      },
      channelId: 'investment-advice',
      sound: true,
      priority: 'high'
    });
  }

  // 發送系統通知
  async sendSystemNotification(title: string, body: string, data?: Record<string, any>): Promise<string> {
    return this.sendLocalNotification({
      title,
      body,
      data: {
        type: 'system',
        ...data
      },
      channelId: 'system',
      sound: false,
      priority: 'low'
    });
  }

  // 安排延遲通知
  async scheduleNotification(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound ? 'default' : undefined,
          priority: notification.priority || 'default'
        },
        trigger
      });

      logger.info('延遲通知安排成功', {
        id: notificationId,
        title: notification.title,
        trigger
      });

      return notificationId;
    } catch (error) {
      logger.error('延遲通知安排失敗:', { error, notification, trigger });
      throw error;
    }
  }

  // 取消通知
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      logger.info('通知取消成功', { id: notificationId });
    } catch (error) {
      logger.error('通知取消失敗:', { error, id: notificationId });
      throw error;
    }
  }

  // 取消所有通知
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.info('所有通知取消成功');
    } catch (error) {
      logger.error('取消所有通知失敗:', { error });
      throw error;
    }
  }

  // 獲取待發送的通知
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      logger.info('獲取待發送通知成功', { count: notifications.length });
      return notifications;
    } catch (error) {
      logger.error('獲取待發送通知失敗:', { error });
      throw error;
    }
  }

  // 獲取通知權限狀態
  async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
    try {
      const status = await Notifications.getPermissionsAsync();
      logger.info('獲取通知權限狀態成功', { status });
      return status;
    } catch (error) {
      logger.error('獲取通知權限狀態失敗:', { error });
      throw error;
    }
  }

  // 獲取 Expo Push Token
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // 清理資源
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }

    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }

    logger.info('通知服務資源清理完成');
  }

  // 測試通知
  async testNotification(): Promise<string> {
    return this.sendLocalNotification({
      title: '測試通知',
      body: '這是一個測試通知，用於驗證通知功能是否正常工作。',
      data: { type: 'test' },
      sound: true,
      priority: 'default'
    });
  }
}

export const notificationService = new NotificationService();
