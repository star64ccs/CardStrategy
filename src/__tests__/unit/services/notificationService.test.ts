/* global jest, describe, it, expect, beforeEach, afterEach */
import { notificationService } from '../../../services/notificationService';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('react-native');
jest.mock('../../../utils/logger');

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const mockDevice = Device as jest.Mocked<typeof Device>;
const mockPlatform = Platform as jest.Mocked<typeof Platform>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 設置默認 mock 值
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
    it('應該成功初始化通知服務', async () => {
      await notificationService.initialize();

      expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
      expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('通知服務初始化完成');
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

    it('應該處理初始化錯誤', async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValue(
        new Error('權限錯誤')
      );

      await notificationService.initialize();

      expect(mockLogger.error).toHaveBeenCalledWith(
        '通知服務初始化失敗:',
        expect.any(Object)
      );
    });
  });

  describe('sendLocalNotification', () => {
    const mockNotification = {
      title: '測試通知',
      body: '這是一個測試通知',
      data: { type: 'test' },
      sound: true,
      priority: 'high' as const,
    };

    it('應該成功發送本地通知', async () => {
      const result =
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
        '本地通知發送成功',
        expect.any(Object)
      );
    });

    it('應該處理發送失敗', async () => {
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(
        new Error('發送失敗')
      );

      await expect(
        notificationService.sendLocalNotification(mockNotification)
      ).rejects.toThrow('發送失敗');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '本地通知發送失敗:',
        expect.any(Object)
      );
    });
  });

  describe('sendPriceAlert', () => {
    const mockPriceAlert = {
      cardId: 'card-123',
      cardName: '測試卡片',
      targetPrice: 100,
      currentPrice: 120,
      type: 'above' as const,
    };

    it('應該成功發送價格提醒通知', async () => {
      const result = await notificationService.sendPriceAlert(mockPriceAlert);

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
      const alert = {
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
    it('應該成功發送市場更新通知', async () => {
      const result = await notificationService.sendMarketUpdate(
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
    it('應該成功發送投資建議通知', async () => {
      const result = await notificationService.sendInvestmentAdvice(
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
    it('應該成功發送系統通知', async () => {
      const result = await notificationService.sendSystemNotification(
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
    const mockNotification = {
      title: '延遲通知',
      body: '這是一個延遲通知',
      data: { type: 'delayed' },
      sound: false,
      priority: 'normal' as const,
    };

    const mockTrigger = {
      seconds: 60,
    };

    it('應該成功安排延遲通知', async () => {
      const result = await notificationService.scheduleNotification(
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
        '延遲通知安排成功',
        expect.any(Object)
      );
    });

    it('應該處理安排失敗', async () => {
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(
        new Error('安排失敗')
      );

      await expect(
        notificationService.scheduleNotification(mockNotification, mockTrigger)
      ).rejects.toThrow('安排失敗');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '延遲通知安排失敗:',
        expect.any(Object)
      );
    });
  });

  describe('cancelNotification', () => {
    it('應該成功取消通知', async () => {
      await notificationService.cancelNotification('test-id');

      expect(
        mockNotifications.cancelScheduledNotificationAsync
      ).toHaveBeenCalledWith('test-id');
      expect(mockLogger.info).toHaveBeenCalledWith('通知取消成功', {
        id: 'test-id',
      });
    });

    it('應該處理取消失敗', async () => {
      mockNotifications.cancelScheduledNotificationAsync.mockRejectedValue(
        new Error('取消失敗')
      );

      await expect(
        notificationService.cancelNotification('test-id')
      ).rejects.toThrow('取消失敗');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '通知取消失敗:',
        expect.any(Object)
      );
    });
  });

  describe('cancelAllNotifications', () => {
    it('應該成功取消所有通知', async () => {
      await notificationService.cancelAllNotifications();

      expect(
        mockNotifications.cancelAllScheduledNotificationsAsync
      ).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('所有通知取消成功');
    });

    it('應該處理取消所有通知失敗', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockRejectedValue(
        new Error('取消失敗')
      );

      await expect(
        notificationService.cancelAllNotifications()
      ).rejects.toThrow('取消失敗');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '取消所有通知失敗:',
        expect.any(Object)
      );
    });
  });

  describe('getScheduledNotifications', () => {
    const mockScheduledNotifications = [
      {
        identifier: 'notification-1',
        content: {
          title: '測試通知 1',
          body: '內容 1',
        },
        trigger: null,
      },
    ];

    it('應該成功獲取待發送通知', async () => {
      mockNotifications.getAllScheduledNotificationsAsync.mockResolvedValue(
        mockScheduledNotifications
      );

      const result = await notificationService.getScheduledNotifications();

      expect(result).toEqual(mockScheduledNotifications);
      expect(mockLogger.info).toHaveBeenCalledWith('獲取待發送通知成功', {
        count: 1,
      });
    });

    it('應該處理獲取失敗', async () => {
      mockNotifications.getAllScheduledNotificationsAsync.mockRejectedValue(
        new Error('獲取失敗')
      );

      await expect(
        notificationService.getScheduledNotifications()
      ).rejects.toThrow('獲取失敗');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取待發送通知失敗:',
        expect.any(Object)
      );
    });
  });

  describe('getPermissionStatus', () => {
    it('應該成功獲取權限狀態', async () => {
      const mockStatus = { status: 'granted' };
      mockNotifications.getPermissionsAsync.mockResolvedValue(mockStatus);

      const result = await notificationService.getPermissionStatus();

      expect(result).toEqual(mockStatus);
      expect(mockLogger.info).toHaveBeenCalledWith('獲取通知權限狀態成功', {
        status: mockStatus,
      });
    });

    it('應該處理獲取權限狀態失敗', async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValue(
        new Error('權限檢查失敗')
      );

      await expect(notificationService.getPermissionStatus()).rejects.toThrow(
        '權限檢查失敗'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取通知權限狀態失敗:',
        expect.any(Object)
      );
    });
  });

  describe('getExpoPushToken', () => {
    it('應該返回 Expo Push Token', () => {
      // 先初始化服務以設置 token
      notificationService.initialize();

      const token = notificationService.getExpoPushToken();
      expect(token).toBe('test-token');
    });

    it('應該在未初始化時返回 null', () => {
      const token = notificationService.getExpoPushToken();
      expect(token).toBeNull();
    });
  });

  describe('testNotification', () => {
    it('應該發送測試通知', async () => {
      const result = await notificationService.testNotification();

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
      const mockListener = { remove: jest.fn() };
      (notificationService as any).notificationListener = mockListener;
      (notificationService as any).responseListener = mockListener;

      notificationService.cleanup();

      expect(mockListener.remove).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('通知服務資源清理完成');
    });
  });
});
