import { logger } from '@/utils/logger';
import { navigationService } from './navigationService';
import { notificationService } from './notificationService';
import { Notification, NotificationType } from '@/types';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

interface NotificationManagerConfig {
  autoUpdateBadge: boolean;
  enableSmartNavigation: boolean;
  badgeUpdateInterval: number;
  maxBadgeCount: number;
}

interface NotificationStats {
  totalCount: number;
  unreadCount: number;
  readCount: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<string, number>;
}

class NotificationManager {
  private config: NotificationManagerConfig;
  private notifications: Notification[] = [];
  private unreadCount: number = 0;
  private stats: NotificationStats | null = null;
  private badgeUpdateTimer: NodeJS.Timeout | null = null;
  private listeners: ((
    notifications: Notification[],
    stats: NotificationStats
  ) => void)[] = [];

  constructor(config: Partial<NotificationManagerConfig> = {}) {
    this.config = {
      autoUpdateBadge: true,
      enableSmartNavigation: true,
      badgeUpdateInterval: 30000, // 30秒
      maxBadgeCount: 99,
      ...config,
    };

    this.initialize();
  }

  private initialize() {
    // 啟動自動徽章更新
    if (this.config.autoUpdateBadge) {
      this.startBadgeUpdateTimer();
    }

    logger.info('通知管理器已初始化', { config: this.config });
  }

  // 添加通知
  addNotification(notification: Notification): void {
    try {
      // 檢查是否已存在
      const existingIndex = this.notifications.findIndex(
        (n) => n.id === notification.id
      );

      if (existingIndex >= 0) {
        // 更新現有通知
        this.notifications[existingIndex] = notification;
      } else {
        // 添加新通知
        this.notifications.unshift(notification);
      }

      this.updateStats();
      this.notifyListeners();

      logger.info('通知已添加', {
        notificationId: notification.id,
        type: notification.type,
      });
    } catch (error) {
      logger.error('添加通知失敗:', { error, notification });
    }
  }

  // 批量添加通知
  addNotifications(notifications: Notification[]): void {
    try {
      notifications.forEach((notification) => {
        const existingIndex = this.notifications.findIndex(
          (n) => n.id === notification.id
        );

        if (existingIndex >= 0) {
          this.notifications[existingIndex] = notification;
        } else {
          this.notifications.unshift(notification);
        }
      });

      this.updateStats();
      this.notifyListeners();

      logger.info('批量通知已添加', { count: notifications.length });
    } catch (error) {
      logger.error('批量添加通知失敗:', { error });
    }
  }

  // 標記通知為已讀
  markAsRead(notificationId: string): void {
    try {
      const notification = this.notifications.find(
        (n) => n.id === notificationId
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.updatedAt = new Date();

        this.updateStats();
        this.notifyListeners();

        logger.info('通知已標記為已讀', { notificationId });
      }
    } catch (error) {
      logger.error('標記通知為已讀失敗:', { error, notificationId });
    }
  }

  // 標記所有通知為已讀
  markAllAsRead(): void {
    try {
      let hasChanges = false;

      this.notifications.forEach((notification) => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.updatedAt = new Date();
          hasChanges = true;
        }
      });

      if (hasChanges) {
        this.updateStats();
        this.notifyListeners();

        logger.info('所有通知已標記為已讀');
      }
    } catch (error) {
      logger.error('標記所有通知為已讀失敗:', { error });
    }
  }

  // 刪除通知
  deleteNotification(notificationId: string): void {
    try {
      const index = this.notifications.findIndex(
        (n) => n.id === notificationId
      );
      if (index >= 0) {
        this.notifications.splice(index, 1);
        this.updateStats();
        this.notifyListeners();

        logger.info('通知已刪除', { notificationId });
      }
    } catch (error) {
      logger.error('刪除通知失敗:', { error, notificationId });
    }
  }

  // 清空所有通知
  clearAllNotifications(): void {
    try {
      this.notifications = [];
      this.updateStats();
      this.notifyListeners();

      logger.info('所有通知已清空');
    } catch (error) {
      logger.error('清空所有通知失敗:', { error });
    }
  }

  // 獲取通知列表
  getNotifications(filter?: {
    type?: NotificationType;
    isRead?: boolean;
    priority?: string;
    limit?: number;
  }): Notification[] {
    try {
      let filtered = [...this.notifications];

      if (filter?.type) {
        filtered = filtered.filter((n) => n.type === filter.type);
      }

      if (filter?.isRead !== undefined) {
        filtered = filtered.filter((n) => n.isRead === filter.isRead);
      }

      if (filter?.priority) {
        filtered = filtered.filter((n) => n.priority === filter.priority);
      }

      if (filter?.limit) {
        filtered = filtered.slice(0, filter.limit);
      }

      return filtered;
    } catch (error) {
      logger.error('獲取通知列表失敗:', { error, filter });
      return [];
    }
  }

  // 獲取通知統計
  getStats(): NotificationStats | null {
    return this.stats;
  }

  // 獲取未讀數量
  getUnreadCount(): number {
    return this.unreadCount;
  }

  // 處理通知點擊
  handleNotificationClick(notification: Notification): void {
    try {
      // 標記為已讀
      if (!notification.isRead) {
        this.markAsRead(notification.id);
      }

      // 智能導航
      if (this.config.enableSmartNavigation) {
        navigationService.smartNavigate(notification.type, notification.data);
      }

      logger.info('通知點擊處理完成', {
        notificationId: notification.id,
        type: notification.type,
      });
    } catch (error) {
      logger.error('處理通知點擊失敗:', { error, notification });
    }
  }

  // 更新統計信息
  private updateStats(): void {
    try {
      const totalCount = this.notifications.length;
      const unreadCount = this.notifications.filter((n) => !n.isRead).length;
      const readCount = totalCount - unreadCount;

      // 按類型統計
      const byType: Record<NotificationType, number> = {
        price_alert: 0,
        market_update: 0,
        investment_advice: 0,
        system: 0,
      };

      // 按優先級統計
      const byPriority: Record<string, number> = {
        low: 0,
        medium: 0,
        high: 0,
      };

      this.notifications.forEach((notification) => {
        byType[notification.type]++;
        byPriority[notification.priority]++;
      });

      this.stats = {
        totalCount,
        unreadCount,
        readCount,
        byType,
        byPriority,
      };

      this.unreadCount = unreadCount;

      // 更新徽章
      if (this.config.autoUpdateBadge) {
        this.updateBadge();
      }
    } catch (error) {
      logger.error('更新通知統計失敗:', { error });
    }
  }

  // 更新徽章
  private updateBadge(): void {
    try {
      const badgeCount = Math.min(this.unreadCount, this.config.maxBadgeCount);
      navigationService.setNotificationBadge(badgeCount);
    } catch (error) {
      logger.error('更新通知徽章失敗:', { error });
    }
  }

  // 啟動徽章更新定時器
  private startBadgeUpdateTimer(): void {
    if (this.badgeUpdateTimer) {
      clearInterval(this.badgeUpdateTimer);
    }

    this.badgeUpdateTimer = setInterval(() => {
      this.updateBadge();
    }, this.config.badgeUpdateInterval);
  }

  // 停止徽章更新定時器
  private stopBadgeUpdateTimer(): void {
    if (this.badgeUpdateTimer) {
      clearInterval(this.badgeUpdateTimer);
      this.badgeUpdateTimer = null;
    }
  }

  // 添加監聽器
  addListener(
    callback: (notifications: Notification[], stats: NotificationStats) => void
  ): void {
    this.listeners.push(callback);
  }

  // 移除監聽器
  removeListener(
    callback: (notifications: Notification[], stats: NotificationStats) => void
  ): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 通知監聽器
  private notifyListeners(): void {
    if (this.stats) {
      this.listeners.forEach((callback) => {
        try {
          callback(this.notifications, this.stats);
        } catch (error) {
          logger.error('通知監聽器執行失敗:', { error });
        }
      });
    }
  }

  // 設置配置
  updateConfig(newConfig: Partial<NotificationManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.config.autoUpdateBadge) {
      this.startBadgeUpdateTimer();
    } else {
      this.stopBadgeUpdateTimer();
    }

    logger.info('通知管理器配置已更新', { config: this.config });
  }

  // 清理資源
  cleanup(): void {
    this.stopBadgeUpdateTimer();
    this.listeners = [];
    logger.info('通知管理器已清理');
  }
}

// 導出單例實例
export const notificationManager = new NotificationManager();
