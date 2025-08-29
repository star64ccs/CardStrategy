import type { Notification } from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 通知服務
 * 處理通知相關功能
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
   * 初始化通知服務
   */
  async initialize(): Promise<void> {
    try {
      logger.info('初始化通知服務');
      // 這裡可以添加通知服務的初始化邏輯
      // 例如：註冊推送通知、設置通知權限等
    } catch (error) {
      logger.error('初始化通知服務失敗:', { error });
      throw error;
    }
  }

  /**
   * 獲取用戶通知
   */
  async getUserNotifications(): Promise<Notification[]> {
    try {
      const _response = await api.get<Notification[]>('/notifications');

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('獲取通知失敗');
      }
    } catch (error) {
      logger.error('獲取通知失敗:', { error });
      throw error;
    }
  }
}

// 導出單例實例
export const _notificationService = NotificationService.getInstance();
