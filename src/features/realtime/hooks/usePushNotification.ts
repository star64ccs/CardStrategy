/**
 * PushNotification Hook
 * 提供PushNotification功能的 React Hook
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  NotificationChannel,
  NotificationConfig,
  NotificationPermission,
  NotificationStats,
} from '../services/pushNotificationService';
import { pushNotificationService } from '../services/pushNotificationService';

export interface UsePushNotificationOptions {
  autoInitialize?: boolean;
  onNotificationReceived?: (notification: unknown) => void;
  onNotificationResponse?: (response: unknown) => void;
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export interface UsePushNotificationReturn {
  // Status
  isInitialized: boolean;
  permission: NotificationPermission | null;
  expoPushToken: string | null;
  stats: NotificationStats;

  // Method
  initialize: () => Promise<void>;
  requestPermissions: () => Promise<NotificationPermission>;
  getPermissionStatus: () => Promise<NotificationPermission>;
  getExpoPushToken: () => Promise<string | null>;
  createNotificationChannel: (channel: NotificationChannel) => Promise<void>;
  sendLocalNotification: (config: NotificationConfig) => Promise<string>;
  scheduleNotification: (
    config: NotificationConfig,
    trigger: unknown
  ) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
  getStats: () => NotificationStats;
  clearStats: () => void;
  addNotificationListener: (
    type: 'received' | 'response',
    listener: (notification: unknown) => void
  ) => void;
  removeNotificationListener: (key: string) => void;
}

/**
 * PushNotification Hook
 */
export const _usePushNotification = (
  options: UsePushNotificationOptions = {}
): UsePushNotificationReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 0,
    totalDelivered: 0,
    totalFailed: 0,
    totalOpened: 0,
    byType: {},
    byChannel: {},
    lastSent: null,
    lastOpened: null,
  });

  const _listenerKeys = useRef<string[]>([]);

  // AutoInitialize
  useEffect(() => {
    if (options.autoInitialize !== false) {
      initialize();
    }
  }, [options.autoInitialize]);

  // Update統Count據
  useEffect(() => {
    const _updateStats = () => {
      const _currentStats = pushNotificationService.getStats();
      setStats(currentStats);
    };

    // 定期Update統Count據
    const _interval = setInterval(updateStats, 5000);
    updateStats(); // 立即Update一次

    return () => clearInterval(interval);
  }, []);

  // 清理監聽器
  useEffect(() => {
    return () => {
      listenerKeys.current.forEach(key => {
        pushNotificationService.removeNotificationListener(key);
      });
    };
  }, []);

  /**
   * InitializePushNotificationService
   */
  const _initialize = useCallback(async (): Promise<void> => {
    try {
      await pushNotificationService.initialize();
      setIsInitialized(true);

      // Get權限Status
      const _permissionStatus =
        await pushNotificationService.getPermissionStatus();
      setPermission(permissionStatus);

      // GetPush令牌
      const _token = await pushNotificationService.getExpoPushToken();
      setExpoPushToken(token);

      // SettingsNotification監聽器
      if (options.onNotificationReceived) {
        const _key = `received-${Date.now()}`;
        pushNotificationService.addNotificationListener(
          'received',
          options.onNotificationReceived
        );
        listenerKeys.current.push(key);
      }

      if (options.onNotificationResponse) {
        const _key = `response-${Date.now()}`;
        pushNotificationService.addNotificationListener(
          'response',
          options.onNotificationResponse
        );
        listenerKeys.current.push(key);
      }
    } catch (error) {
      console.error('Initialize推送通知ServiceFailed:', error);
    }
  }, [options.onNotificationReceived, options.onNotificationResponse]);

  /**
   * RequestNotification權限
   */
  const _requestPermissions =
    useCallback(async (): Promise<NotificationPermission> => {
      try {
        const _permissionStatus =
          await pushNotificationService.requestPermissions();
        setPermission(permissionStatus);
        options.onPermissionChange?.(permissionStatus);
        return permissionStatus;
      } catch (error) {
        console.error('請求通知權限Failed:', error);
        throw error;
      }
    }, [options.onPermissionChange]);

  /**
   * GetNotification權限Status
   */
  const _getPermissionStatus =
    useCallback(async (): Promise<NotificationPermission> => {
      try {
        const _permissionStatus =
          await pushNotificationService.getPermissionStatus();
        setPermission(permissionStatus);
        return permissionStatus;
      } catch (error) {
        console.error('Get通知權限狀態Failed:', error);
        throw error;
      }
    }, []);

  /**
   * Get Expo Push令牌
   */
  const _getExpoPushToken = useCallback(async (): Promise<string | null> => {
    try {
      const _token = await pushNotificationService.getExpoPushToken();
      setExpoPushToken(token);
      return token;
    } catch (error) {
      console.error('Get Expo 推送令牌Failed:', error);
      throw error;
    }
  }, []);

  /**
   * CreateNotification頻道
   */
  const _createNotificationChannel = useCallback(
    async (channel: NotificationChannel): Promise<void> => {
      try {
        await pushNotificationService.createNotificationChannel(channel);
      } catch (error) {
        console.error('Create通知頻道Failed:', error);
        throw error;
      }
    },
    []
  );

  /**
   * SendLocalNotification
   */
  const _sendLocalNotification = useCallback(
    async (config: NotificationConfig): Promise<string> => {
      try {
        const _notificationId =
          await pushNotificationService.sendLocalNotification(config);
        return notificationId;
      } catch (error) {
        console.error('發送本地通知Failed:', error);
        throw error;
      }
    },
    []
  );

  /**
   * 安排延遲Notification
   */
  const _scheduleNotification = useCallback(
    async (config: NotificationConfig, trigger: unknown): Promise<string> => {
      try {
        const _notificationId =
          await pushNotificationService.scheduleNotification(config, trigger);
        return notificationId;
      } catch (error) {
        console.error('安排延遲通知Failed:', error);
        throw error;
      }
    },
    []
  );

  /**
   * CancelNotification
   */
  const _cancelNotification = useCallback(
    async (notificationId: string): Promise<void> => {
      try {
        await pushNotificationService.cancelNotification(notificationId);
      } catch (error) {
        console.error('取消通知Failed:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Cancel所有Notification
   */
  const _cancelAllNotifications = useCallback(async (): Promise<void> => {
    try {
      await pushNotificationService.cancelAllNotifications();
    } catch (error) {
      console.error('取消所有通知Failed:', error);
      throw error;
    }
  }, []);

  /**
   * SettingsNotification徽章數量
   */
  const _setBadgeCount = useCallback(async (count: number): Promise<void> => {
    try {
      await pushNotificationService.setBadgeCount(count);
    } catch (error) {
      console.error('Settings通知徽章數量Failed:', error);
      throw error;
    }
  }, []);

  /**
   * GetNotificationStatistics
   */
  const _getStats = useCallback((): NotificationStats => {
    return pushNotificationService.getStats();
  }, []);

  /**
   * ClearNotificationStatistics
   */
  const _clearStats = useCallback((): void => {
    pushNotificationService.clearStats();
  }, []);

  /**
   * AddNotification監聽器
   */
  const _addNotificationListener = useCallback(
    (
      type: 'received' | 'response',
      listener: (notification: unknown) => void
    ): string => {
      const _key = `${type}-${Date.now()}`;
      pushNotificationService.addNotificationListener(type, listener);
      listenerKeys.current.push(key);
      return key;
    },
    []
  );

  /**
   * RemoveNotification監聽器
   */
  const _removeNotificationListener = useCallback((key: string): void => {
    pushNotificationService.removeNotificationListener(key);
    listenerKeys.current = listenerKeys.current.filter(k => k !== key);
  }, []);

  return {
    // Status
    isInitialized,
    permission,
    expoPushToken,
    stats,

    // Method
    initialize,
    requestPermissions,
    getPermissionStatus,
    getExpoPushToken,
    createNotificationChannel,
    sendLocalNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,
    getStats,
    clearStats,
    addNotificationListener,
    removeNotificationListener,
  };
};

/**
 * 簡化的PushNotification Hook
 */
export const _useSimplePushNotification = (
  onNotificationReceived?: (notification: unknown) => void
) => {
  return usePushNotification({
    autoInitialize: true,
    onNotificationReceived,
  });
};

/**
 * 卡片Notification Hook
 */
export const _useCardNotification = () => {
  const _notification = usePushNotification({
    autoInitialize: true,
  });

  const _sendCardUpdateNotification = useCallback(
    async (
      cardName: string,
      action: 'created' | 'updated' | 'deleted' | 'price_changed'
    ) => {
      const _actionText = {
        created: '新增了',
        updated: '更新了',
        deleted: '刪除了',
        price_changed: '價格變更了',
      };

      await notification.sendLocalNotification({
        title: '卡片更新',
        body: `${actionText[action]}卡片：${cardName}`,
        category: 'card_updates',
        data: {
          action: 'open_card',
          cardName,
          updateAction: action,
        },
        sound: true,
        priority: 'high',
      });
    },
    [notification.sendLocalNotification]
  );

  const _sendPriceAlertNotification = useCallback(
    async (cardName: string, oldPrice: number, newPrice: number) => {
      const _change = newPrice - oldPrice;
      const _changeText = change > 0 ? '上漲' : '下跌';
      const _changePercent = Math.abs((change / oldPrice) * 100).toFixed(1);

      await notification.sendLocalNotification({
        title: '價格提醒',
        body: `${cardName} 價格${changeText} ${changePercent}%`,
        category: 'card_updates',
        data: {
          action: 'open_card',
          cardName,
          oldPrice,
          newPrice,
          change,
        },
        sound: true,
        priority: 'high',
      });
    },
    [notification.sendLocalNotification]
  );

  return {
    ...notification,
    sendCardUpdateNotification,
    sendPriceAlertNotification,
  };
};

/**
 * 系統Notification Hook
 */
export const _useSystemNotification = () => {
  const _notification = usePushNotification({
    autoInitialize: true,
  });

  const _sendSystemNotification = useCallback(
    async (title: string, message: string, data?: unknown) => {
      await notification.sendLocalNotification({
        title,
        body: message,
        category: 'system',
        data: {
          action: 'open_screen',
          ...data,
        },
        sound: false,
        priority: 'normal',
      });
    },
    [notification.sendLocalNotification]
  );

  const _sendMaintenanceNotification = useCallback(
    async (message: string, scheduledTime?: Date) => {
      await notification.sendLocalNotification({
        title: '系統維護',
        body: message,
        category: 'system',
        data: {
          action: 'open_screen',
          screen: 'maintenance',
          scheduledTime: scheduledTime?.toISOString(),
        },
        sound: true,
        priority: 'high',
      });
    },
    [notification.sendLocalNotification]
  );

  return {
    ...notification,
    sendSystemNotification,
    sendMaintenanceNotification,
  };
};
