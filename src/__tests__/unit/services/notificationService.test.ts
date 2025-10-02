/* global jest, describe, it, expect, beforeEach, afterEach */
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { notificationService } from '../../../services/notificationService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('react-native');
jest.mock('../../../utils/logger');

const _mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const _mockDevice = Device as jest.Mocked<typeof Device>;
const _mockPlatform = Platform as jest.Mocked<typeof Platform>;
const _mockLogger = logger as jest.Mocked<typeof logger>;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // SettingsDefault mock Value
    mockDevice.isDevice = true;
    mockPlatform.OS = 'ios';
    mockNotifications.getPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    mockNotifications.requestPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    mockNotifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'test-token',
    });
    mockNotifications.scheduleNotificationAsync.mockResolvedValue(
      'test-notification-id'
    );
    mockNotifications.getAllScheduledNotificationsAsync.mockResolvedValue([]);
    mockNotifications.cancelScheduledNotificationAsync.mockResolvedValue();
    mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue();
  });

  describe('initialize', () => {
    it('應該SuccessInitialize通知Service', async () => {
      await notificationService.initialize();

      expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
      expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('通知ServiceInitialize完成');
    });

    it('應該處理權限未授予的情況', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'denied',
      });
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
      });

      await notificationService.initialize();

      expect(mockLogger.warn).toHaveBeenCalledWith('通知權限未授予');
    });

    it('應該處理非設備環境', async () => {
      mockDevice.isDevice = false;

      await notificationService.initialize();

      expect(mockNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('應該在 Android 上創建通知頻道', async () => {
      mockPlatform.OS = 'android';

      await notificationService.initialize();

      expect(
        mockNotifications.setNotificationChannelAsync
      ).toHaveBeenCalledWith('price-alerts', expect.any(Object));
      expect(
        mockNotifications.setNotificationChannelAsync
      ).toHaveBeenCalledWith('market-updates', expect.any(Object));
    });

    it('應該HandleInitializeError', async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValue(
        new Error('權限Error')
      );

      await notificationService.initialize();

      expect(mockLogger.error).toHaveBeenCalledWith(
        '通知ServiceInitializeFailed:',
        expect.any(Object)
      );
    });
  });

  describe('sendLocalNotification', () => {
    const _mockNotification = {
      title: '測試通知',
      body: '這是一個測試通知',
      data: { type: 'test' },
      sound: true,
      priority: 'high' as const,
    };

    it('應該Success發送本地通知', async () => {
      const _result =
        await notificationService.sendLocalNotification(mockNotification);

      expect(result).toBe('test-notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: mockNotification.title,
          body: mockNotification.body,
          data: mockNotification.data,
          sound: 'default',
          priority: mockNotification.priority,
        },
        trigger: null,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        '本地通知發送Success',
        expect.any(Object)
      );
    });

    it('應該Handle發送Failed', async () => {
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(
        new Error('發送Failed')
      );

      await expect(
        notificationService.sendLocalNotification(mockNotification)
      ).rejects.toThrow('發送Failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '本地通知發送Failed:',
        expect.any(Object)
      );
    });
  });

  describe('sendPriceAlert', () => {
    const _mockPriceAlert = {
      cardId: 'card-123',
      cardName: '測試卡片',
      targetPrice: 100,
      currentPrice: 120,
      type: 'above' as const,
    };

    it('應該Success發送價格提醒通知', async () => {
      const _result = await notificationService.sendPriceAlert(mockPriceAlert);

      expect(result).toBe('test-notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '價格提醒',
          body: '測試卡片 的價格已上漲到 120 TWD',
          data: {
            type: 'price_alert',
            cardId: mockPriceAlert.cardId,
            cardName: mockPriceAlert.cardName,
            currentPrice: mockPriceAlert.currentPrice,
            targetPrice: mockPriceAlert.targetPrice,
          },
          channelId: 'price-alerts',
          sound: 'default',
          priority: 'high',
        },
        trigger: null,
      });
    });

    it('應該處理下跌價格提醒', async () => {
      const _alert = {
        ...mockPriceAlert,
        type: 'below' as const,
        currentPrice: 80,
      };

      await notificationService.sendPriceAlert(alert);

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            body: '測試卡片 的價格已下跌到 80 TWD',
          }),
        })
      );
    });
  });

  describe('sendMarketUpdate', () => {
    it('應該Success發送市場Update通知', async () => {
      const _result = await notificationService.sendMarketUpdate(
        '市場更新',
        '市場出現新動態',
        { marketId: 'market-123' }
      );

      expect(result).toBe('test-notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '市場更新',
          body: '市場出現新動態',
          data: {
            type: 'market_update',
            marketId: 'market-123',
          },
          channelId: 'market-updates',
          sound: undefined,
          priority: 'default',
        },
        trigger: null,
      });
    });
  });

  describe('sendInvestmentAdvice', () => {
    it('應該Success發送投資建議通知', async () => {
      const _result = await notificationService.sendInvestmentAdvice(
        '投資建議',
        '建議買入這張卡片',
        { cardId: 'card-123' }
      );

      expect(result).toBe('test-notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '投資建議',
          body: '建議買入這張卡片',
          data: {
            type: 'investment_advice',
            cardId: 'card-123',
          },
          channelId: 'investment-advice',
          sound: 'default',
          priority: 'high',
        },
        trigger: null,
      });
    });
  });

  describe('sendSystemNotification', () => {
    it('應該Success發送系統通知', async () => {
      const _result = await notificationService.sendSystemNotification(
        '系統通知',
        '系統維護通知',
        { maintenance: true }
      );

      expect(result).toBe('test-notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '系統通知',
          body: '系統維護通知',
          data: {
            type: 'system',
            maintenance: true,
          },
          channelId: 'system',
          sound: undefined,
          priority: 'low',
        },
        trigger: null,
      });
    });
  });

  describe('scheduleNotification', () => {
    const _mockNotification = {
      title: '延遲通知',
      body: '這是一個延遲通知',
      data: { type: 'delayed' },
      sound: false,
      priority: 'normal' as const,
    };

    const _mockTrigger = {
      seconds: 60,
    };

    it('應該Success安排延遲通知', async () => {
      const _result = await notificationService.scheduleNotification(
        mockNotification,
        mockTrigger
      );

      expect(result).toBe('test-notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: mockNotification.title,
          body: mockNotification.body,
          data: mockNotification.data,
          sound: undefined,
          priority: mockNotification.priority,
        },
        trigger: mockTrigger,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        '延遲通知安排Success',
        expect.any(Object)
      );
    });

    it('應該Handle安排Failed', async () => {
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(
        new Error('安排Failed')
      );

      await expect(
        notificationService.scheduleNotification(mockNotification, mockTrigger)
      ).rejects.toThrow('安排Failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '延遲通知安排Failed:',
        expect.any(Object)
      );
    });
  });

  describe('cancelNotification', () => {
    it('應該Success取消通知', async () => {
      await notificationService.cancelNotification('test-id');

      expect(
        mockNotifications.cancelScheduledNotificationAsync
      ).toHaveBeenCalledWith('test-id');
      expect(mockLogger.info).toHaveBeenCalledWith('通知取消Success', {
        id: 'test-id',
      });
    });

    it('應該Handle取消Failed', async () => {
      mockNotifications.cancelScheduledNotificationAsync.mockRejectedValue(
        new Error('取消Failed')
      );

      await expect(
        notificationService.cancelNotification('test-id')
      ).rejects.toThrow('取消Failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '通知取消Failed:',
        expect.any(Object)
      );
    });
  });

  describe('cancelAllNotifications', () => {
    it('應該Success取消所有通知', async () => {
      await notificationService.cancelAllNotifications();

      expect(
        mockNotifications.cancelAllScheduledNotificationsAsync
      ).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('所有通知取消Success');
    });

    it('應該Handle取消所有通知Failed', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockRejectedValue(
        new Error('取消Failed')
      );

      await expect(
        notificationService.cancelAllNotifications()
      ).rejects.toThrow('取消Failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '取消所有通知Failed:',
        expect.any(Object)
      );
    });
  });

  describe('getScheduledNotifications', () => {
    const _mockScheduledNotifications = [
      {
        identifier: 'notification-1',
        content: {
          title: '測試通知 1',
          body: '內容 1',
        },
        trigger: null,
      },
    ];

    it('應該SuccessGet待發送通知', async () => {
      mockNotifications.getAllScheduledNotificationsAsync.mockResolvedValue(
        mockScheduledNotifications
      );

      const _result = await notificationService.getScheduledNotifications();

      expect(result).toEqual(mockScheduledNotifications);
      expect(mockLogger.info).toHaveBeenCalledWith('Get待發送通知Success', {
        count: 1,
      });
    });

    it('應該HandleGetFailed', async () => {
      mockNotifications.getAllScheduledNotificationsAsync.mockRejectedValue(
        new Error('GetFailed')
      );

      await expect(
        notificationService.getScheduledNotifications()
      ).rejects.toThrow('GetFailed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get待發送通知Failed:',
        expect.any(Object)
      );
    });
  });

  describe('getPermissionStatus', () => {
    it('應該SuccessGet權限狀態', async () => {
      const _mockStatus = { status: 'granted' };
      mockNotifications.getPermissionsAsync.mockResolvedValue(mockStatus);

      const _result = await notificationService.getPermissionStatus();

      expect(result).toEqual(mockStatus);
      expect(mockLogger.info).toHaveBeenCalledWith('Get通知權限狀態Success', {
        status: mockStatus,
      });
    });

    it('應該HandleGet權限狀態Failed', async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValue(
        new Error('權限CheckFailed')
      );

      await expect(notificationService.getPermissionStatus()).rejects.toThrow(
        '權限CheckFailed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get通知權限狀態Failed:',
        expect.any(Object)
      );
    });
  });

  describe('getExpoPushToken', () => {
    it('應該返回 Expo Push Token', () => {
      // 先InitializeService以Settings token
      notificationService.initialize();

      const _token = notificationService.getExpoPushToken();
      expect(token).toBe('test-token');
    });

    it('應該在未初始化時返回 null', () => {
      const _token = notificationService.getExpoPushToken();
      expect(token).toBeNull();
    });
  });

  describe('testNotification', () => {
    it('應該發送測試通知', async () => {
      const _result = await notificationService.testNotification();

      expect(result).toBe('test-notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '測試通知',
          body: '這是一個測試通知，用於驗證通知功能是否正常工作。',
          data: { type: 'test' },
          sound: 'default',
          priority: 'default',
        },
        trigger: null,
      });
    });
  });

  describe('cleanup', () => {
    it('應該清理通知監聽器', () => {
      // 模擬監聽器
      const _mockListener = { remove: jest.fn() };
      (notificationService as any).notificationListener = mockListener;
      (notificationService as any).responseListener = mockListener;

      notificationService.cleanup();

      expect(mockListener.remove).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('通知Service資源清理完成');
    });
  });
});
