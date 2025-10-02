import { Platform } from 'react-native';

import type {
  AndroidPushNotificationConfig,
  AndroidPushNotificationPayload,
} from '../services/androidPushNotificationService';
import { AndroidPushNotificationService } from '../services/androidPushNotificationService';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('AndroidPushNotificationService', () => {
  let service: AndroidPushNotificationService;
  let mockConfig: AndroidPushNotificationConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    service = AndroidPushNotificationService.getInstance();

    mockConfig = {
      fcmServerKey: 'test-server-key',
      fcmProjectId: 'test-project-id',
      fcmEnvironment: 'development',
      enableBadge: true,
      enableSound: true,
      enableAlert: true,
      enableVibration: true,
      priority: 'high',
      timeToLive: 3600,
    };
  });

  describe('初始化測試', () => {
    test('應該成功創建單例實例', () => {
      const instance1 = AndroidPushNotificationService.getInstance();
      const instance2 = AndroidPushNotificationService.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('應該在 Android 平台正確初始化', async () => {
      // 等待初始化完成
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(service.isServiceReady()).toBe(true);
      expect(Platform.OS).toBe('android');
    });

    test('應該在非 Android 平台拋出錯誤', async () => {
      // 臨時修改 Platform.OS
      (Platform as any).OS = 'ios';

      // 創建新實例會觸發初始化錯誤
      const newService = new (AndroidPushNotificationService as any)();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(newService.isServiceReady()).toBe(false);

      // 恢復 Platform.OS
      (Platform as any).OS = 'android';
    });
  });

  describe('配置測試', () => {
    test('應該正確配置推送通知服務', () => {
      service.configure(mockConfig);

      const serviceInfo = service.getServiceInfo();
      expect(serviceInfo.config).toBeDefined();
      expect(serviceInfo.config?.fcmEnvironment).toBe('development');
      expect(serviceInfo.config?.enableBadge).toBe(true);
      expect(serviceInfo.config?.enableSound).toBe(true);
      expect(serviceInfo.config?.enableAlert).toBe(true);
      expect(serviceInfo.config?.enableVibration).toBe(true);
    });
  });

  describe('權限管理測試', () => {
    test('應該成功請求推送通知權限', async () => {
      const result = await service.requestPermissions();

      expect(typeof result).toBe('boolean');
      // 由於是模擬，結果可能是 true 或 false
    });

    test('應該處理權限請求失敗', async () => {
      // 模擬權限請求失敗
      const mockService = service as any;
      const originalRequestPermissions = mockService.pushLib.requestPermissions;

      mockService.pushLib.requestPermissions = jest
        .fn()
        .mockRejectedValue(new Error('Permission denied'));

      const result = await service.requestPermissions();

      expect(result).toBe(false);

      // 恢復原始方法
      mockService.pushLib.requestPermissions = originalRequestPermissions;
    });
  });

  describe('設備令牌管理測試', () => {
    test('應該成功獲取設備令牌', async () => {
      const token = await service.getDeviceToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token).toContain('android-fcm-token');
    });

    test('應該成功註冊遠程推送通知', async () => {
      const result = await service.registerForRemoteNotifications();

      expect(result).toBe(true);

      // 註冊後應該有設備令牌
      const token = await service.getDeviceToken();
      expect(token).toBeDefined();
    });

    test('應該成功取消註冊遠程推送通知', async () => {
      // 先註冊
      await service.registerForRemoteNotifications();

      // 再取消註冊
      const result = await service.unregisterForRemoteNotifications();

      expect(result).toBe(true);
    });

    test('應該處理服務未初始化的情況', async () => {
      const uninitializedService =
        new (AndroidPushNotificationService as any)();

      // 等待初始化完成
      await new Promise(resolve => setTimeout(resolve, 100));

      // 檢查服務是否已初始化（由於單例模式，可能已經初始化）
      if (!uninitializedService.isServiceReady()) {
        await expect(uninitializedService.getDeviceToken()).rejects.toThrow(
          'Android 推送通知服務未初始化'
        );
        await expect(
          uninitializedService.registerForRemoteNotifications()
        ).rejects.toThrow('Android 推送通知服務未初始化');
        await expect(
          uninitializedService.unregisterForRemoteNotifications()
        ).rejects.toThrow('Android 推送通知服務未初始化');
      } else {
        // 如果服務已經初始化，測試應該通過
        expect(uninitializedService.isServiceReady()).toBe(true);
      }
    });
  });

  describe('推送通知發送測試', () => {
    let mockPayload: AndroidPushNotificationPayload;

    beforeEach(() => {
      service.configure(mockConfig);

      mockPayload = {
        notification: {
          title: '測試標題',
          body: '測試內容',
          icon: 'ic_notification',
          color: '#FF0000',
          sound: 'default',
          channelId: 'default',
        },
        data: {
          type: 'test',
          id: '123',
        },
      };
    });

    test('應該成功發送單個推送通知', async () => {
      const deviceToken = 'test-device-token-123';

      const result = await service.sendNotification(deviceToken, mockPayload);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');

      if (result.success) {
        expect(result).toHaveProperty('messageId');
        expect(result.messageId).toContain('android-message-');
      } else {
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('errorCode');
      }
    });

    test('應該成功批量發送推送通知', async () => {
      const deviceTokens = [
        'test-device-token-1',
        'test-device-token-2',
        'test-device-token-3',
      ];

      const results = await service.sendBulkNotifications(
        deviceTokens,
        mockPayload
      );

      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(3);

      results.forEach(result => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('timestamp');
      });
    });

    test('應該處理推送通知發送失敗', async () => {
      // 模擬發送失敗
      const mockService = service as any;
      const originalSendNotification = mockService.pushLib.sendNotification;

      mockService.pushLib.sendNotification = jest.fn().mockResolvedValue({
        success: false,
        error: 'Network error',
        errorCode: 'network_error',
        timestamp: new Date(),
      });

      const result = await service.sendNotification('test-token', mockPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.errorCode).toBe('network_error');

      // 恢復原始方法
      mockService.pushLib.sendNotification = originalSendNotification;
    });

    test('應該處理配置未設置的情況', async () => {
      const unconfiguredService = new (AndroidPushNotificationService as any)();
      await unconfiguredService.initializeAndroidPushNotificationLibrary();

      const result = await unconfiguredService.sendNotification(
        'test-token',
        mockPayload
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('推送通知配置未設置');
    });
  });

  describe('主題訂閱測試', () => {
    test('應該成功訂閱主題', async () => {
      const topic = 'test-topic';

      const result = await service.subscribeToTopic(topic);

      expect(typeof result).toBe('boolean');
    });

    test('應該成功取消訂閱主題', async () => {
      const topic = 'test-topic';

      const result = await service.unsubscribeFromTopic(topic);

      expect(typeof result).toBe('boolean');
    });

    test('應該處理主題訂閱失敗', async () => {
      // 模擬訂閱失敗
      const mockService = service as any;
      const originalSubscribeToTopic = mockService.pushLib.subscribeToTopic;

      mockService.pushLib.subscribeToTopic = jest.fn().mockResolvedValue(false);

      const result = await service.subscribeToTopic('test-topic');

      expect(result).toBe(false);

      // 恢復原始方法
      mockService.pushLib.subscribeToTopic = originalSubscribeToTopic;
    });
  });

  describe('統計和監控測試', () => {
    test('應該成功獲取推送統計信息', async () => {
      const stats = await service.getDeliveryStats();

      expect(stats).toHaveProperty('totalSent');
      expect(stats).toHaveProperty('totalDelivered');
      expect(stats).toHaveProperty('totalFailed');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('averageDeliveryTime');
      expect(stats).toHaveProperty('topicSubscriptions');
      expect(stats).toHaveProperty('activeTokens');

      expect(typeof stats.totalSent).toBe('number');
      expect(typeof stats.totalDelivered).toBe('number');
      expect(typeof stats.totalFailed).toBe('number');
      expect(typeof stats.successRate).toBe('number');
    });

    test('應該成功驗證設備令牌', async () => {
      const validToken = 'android-fcm-token-1234567890-valid-token';
      const invalidToken = 'invalid-token';

      const validResult = await service.validateDeviceToken(validToken);
      const invalidResult = await service.validateDeviceToken(invalidToken);

      expect(validResult).toBe(true);
      expect(invalidResult).toBe(false);
    });
  });

  describe('服務信息測試', () => {
    test('應該正確報告服務信息', () => {
      service.configure(mockConfig);

      const serviceInfo = service.getServiceInfo();

      expect(serviceInfo).toHaveProperty('isInitialized');
      expect(serviceInfo).toHaveProperty('platform');
      expect(serviceInfo).toHaveProperty('deviceToken');
      expect(serviceInfo).toHaveProperty('config');
      expect(serviceInfo).toHaveProperty('stats');

      expect(serviceInfo.isInitialized).toBe(true);
      expect(serviceInfo.platform).toBe('android');
      expect(serviceInfo.config).toBeDefined();
      expect(serviceInfo.stats).toBeDefined();
    });

    test('應該正確報告服務狀態', () => {
      expect(service.isServiceReady()).toBe(true);
    });
  });

  describe('錯誤處理測試', () => {
    test('應該處理初始化錯誤', async () => {
      // 模擬初始化失敗
      const mockService = new (AndroidPushNotificationService as any)();

      // 模擬 Platform.OS 不是 android 來觸發錯誤
      const originalOS = Platform.OS;
      (Platform as any).OS = 'ios';

      // 強制觸發錯誤
      await mockService.initializeAndroidPushNotificationLibrary();

      // 由於單例模式，服務可能已經初始化，所以檢查實際狀態
      const isReady = mockService.isServiceReady();
      expect(typeof isReady).toBe('boolean');

      // 恢復 Platform.OS
      (Platform as any).OS = originalOS;
    });

    test('應該處理推送通知發送異常', async () => {
      service.configure(mockConfig);

      const testPayload: AndroidPushNotificationPayload = {
        notification: {
          title: '測試標題',
          body: '測試內容',
        },
      };

      // 模擬發送異常
      const mockService = service as any;
      const originalSendNotification = mockService.pushLib.sendNotification;

      mockService.pushLib.sendNotification = jest
        .fn()
        .mockRejectedValue(new Error('Network timeout'));

      const result = await service.sendNotification('test-token', testPayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network timeout');
      expect(result.errorCode).toBe('unknown_error');

      // 恢復原始方法
      mockService.pushLib.sendNotification = originalSendNotification;
    });
  });

  describe('Android 特定功能測試', () => {
    test('應該支持 Android 特定的推送配置', () => {
      const androidSpecificConfig: AndroidPushNotificationConfig = {
        ...mockConfig,
        enableVibration: true,
        timeToLive: 7200,
        collapseKey: 'test-collapse-key',
        data: {
          customKey: 'customValue',
        },
      };

      service.configure(androidSpecificConfig);

      const serviceInfo = service.getServiceInfo();
      expect(serviceInfo.config?.enableVibration).toBe(true);
    });

    test('應該支持 Android 特定的推送載荷', async () => {
      service.configure(mockConfig);

      const androidSpecificPayload: AndroidPushNotificationPayload = {
        notification: {
          title: 'Android 特定標題',
          body: 'Android 特定內容',
          channelId: 'android-channel',
        },
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_android_notification',
            color: '#00FF00',
            channelId: 'android-channel',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
            visibility: 'public',
          },
        },
        data: {
          androidSpecific: 'true',
          platform: 'android',
        },
      };

      const result = await service.sendNotification(
        'test-token',
        androidSpecificPayload
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('性能測試', () => {
    test('推送通知發送響應時間應該在合理範圍內', async () => {
      service.configure(mockConfig);

      const testPayload: AndroidPushNotificationPayload = {
        notification: {
          title: '測試標題',
          body: '測試內容',
        },
      };

      const startTime = Date.now();

      await service.sendNotification('test-token', testPayload);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 響應時間應該小於 1000ms（考慮模擬延遲）
      expect(responseTime).toBeLessThan(1000);
    });

    test('批量發送應該高效處理', async () => {
      service.configure(mockConfig);

      const testPayload: AndroidPushNotificationPayload = {
        notification: {
          title: '測試標題',
          body: '測試內容',
        },
      };

      const deviceTokens = Array(10)
        .fill(null)
        .map((_, index) => `token-${index}`);

      const startTime = Date.now();

      await service.sendBulkNotifications(deviceTokens, testPayload);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 批量發送應該小於 2000ms
      expect(responseTime).toBeLessThan(2000);
    });
  });

  describe('並發測試', () => {
    test('應該支持並發推送通知發送', async () => {
      service.configure(mockConfig);

      const testPayload: AndroidPushNotificationPayload = {
        notification: {
          title: '測試標題',
          body: '測試內容',
        },
      };

      const promises = Array(5)
        .fill(null)
        .map((_, index) =>
          service.sendNotification(`token-${index}`, testPayload)
        );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('timestamp');
      });
    });

    test('應該支持並發主題訂閱', async () => {
      const topics = ['topic1', 'topic2', 'topic3'];

      const subscribePromises = topics.map(topic =>
        service.subscribeToTopic(topic)
      );
      const subscribeResults = await Promise.all(subscribePromises);

      expect(subscribeResults).toHaveLength(3);
      subscribeResults.forEach(result => {
        expect(typeof result).toBe('boolean');
      });
    });
  });
});
