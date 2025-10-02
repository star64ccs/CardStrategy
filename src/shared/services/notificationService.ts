import type { Notification } from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * NotificationService
 * HandleNotification相Off功能
 */
export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * InitializeNotificationService
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initialize通知Service');
      // 這裡可以AddNotificationService的Initialize邏輯
      // 例如：RegisterPushNotification、SettingsNotification權限等
    } catch (error) {
      logger.error('Initialize通知ServiceFailed:', { error });
      throw error;
    }
  }

  /**
   * GetUserNotification
   */
  async getUserNotifications(): Promise<Notification[]> {
    try {
      const _response = await api.get<Notification[]>('/notifications');

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Get通知Failed');
      }
    } catch (error) {
      logger.error('Get通知Failed:', { error });
      throw error;
    }
  }
}

// Export單例Instance
export const _notificationService = NotificationService.getInstance();
