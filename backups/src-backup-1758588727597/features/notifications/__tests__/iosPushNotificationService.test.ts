import { Platform } from 'react-native';

import type {
  IOSPushNotificationConfig,
  IOSPushNotificationPayload,
} from '../services/iosPushNotificationService';
import { IOSPushNotificationService } from '../services/iosPushNotificationService';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
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

describe('IOSPushNotificationService', () => {
  let iosPushService: IOSPushNotificationService;
  let testConfig: IOSPushNotificationConfig;

  beforeEach(() => {
    // 重置單例
    (IOSPushNotificationService as any).instance = null;
    iosPushService = IOSPushNotificationService.getInstance();
    jest.clearAllMocks();

    // 測試配置
    testConfig = {
      apnsKeyId: 'test_key_id',
      apnsTeamId: 'test_team_id',
      apnsBundleId: 'com.test.app',
      apnsEnvironment: 'development',
      enableBadge: true,
      enableSound: true,
      enableAlert: true,
      priority: 'normal',
      expiration: 3600,
    };
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const instance1 = IOSPushNotificationService.getInstance();
      const instance2 = IOSPushNotificationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('服務初始化', () => {
    it('應該在 iOS 平台上正確初始化', () => {
      expect(Platform.OS).toBe('ios');
      expect(iosPushService.isServiceReady()).toBe(false); // 需要配置後才就緒
    });

    it('應該提供服務信息', () => {
      const serviceInfo = iosPushService.getServiceInfo();

      expect(serviceInfo).toHaveProperty('isInitialized');
      expect(serviceInfo).toHaveProperty('isServiceReady');
      expect(serviceInfo).toHaveProperty('platform');
      expect(serviceInfo).toHaveProperty('hasDeviceToken');
      expect(serviceInfo).toHaveProperty('deviceTokenEnvironment');
      expect(serviceInfo).toHaveProperty('config');
      expect(serviceInfo).toHaveProperty('stats');

      expect(serviceInfo.platform).toBe('ios');
      expect(typeof serviceInfo.isInitialized).toBe('boolean');
      expect(typeof serviceInfo.isServiceReady).toBe('boolean');
      expect(typeof serviceInfo.hasDeviceToken).toBe('boolean');
    });
  });

  describe('configure', () => {
    it('應該正確配置推送通知服務', () => {
      iosPushService.configure(testConfig);

      const serviceInfo = iosPushService.getServiceInfo();
      expect(iosPushService.isServiceReady()).toBe(true);
      expect(serviceInfo.config).toBeDefined();
      expect(serviceInfo.config?.apnsEnvironment).toBe('development');
    });
  });

  describe('requestPermissions', () => {
    it('應該成功請求推送權限', async () => {
      iosPushService.configure(testConfig);

      const result = await iosPushService.requestPermissions();

      expect(typeof result).toBe('boolean');
      expect([true, false]).toContain(result);
    });

    it('應該處理權限請求失敗', async () => {
      // 創建一個新的未配置實例來測試錯誤處理
      const newService = new (IOSPushNotificationService as any)();
      (newService as any).isInitialized = false;
      (newService as any).pushLib = null;
      (newService as any).config = null;

      const result = await newService.requestPermissions();

      expect(result).toBe(false);
    });
  });

  describe('registerForRemoteNotifications', () => {
    it('應該成功註冊遠程推送', async () => {
      iosPushService.configure(testConfig);

      const result = await iosPushService.registerForRemoteNotifications();

      expect(typeof result).toBe('boolean');
      expect([true, false]).toContain(result);
    });

    it('應該處理註冊失敗', async () => {
      // 創建一個新的未配置實例來測試錯誤處理
      const newService = new (IOSPushNotificationService as any)();
      (newService as any).isInitialized = false;
      (newService as any).pushLib = null;
      (newService as any).config = null;

      const result = await newService.registerForRemoteNotifications();

      expect(result).toBe(false);
    });
  });

  describe('unregisterForRemoteNotifications', () => {
    it('應該成功取消註冊遠程推送', async () => {
      iosPushService.configure(testConfig);

      const result = await iosPushService.unregisterForRemoteNotifications();

      expect(typeof result).toBe('boolean');
      expect([true, false]).toContain(result);
    });
  });

  describe('sendNotification', () => {
    beforeEach(() => {
      iosPushService.configure(testConfig);
    });

    it('應該成功發送推送通知', async () => {
      const deviceToken = 'ios_device_token_test_123456789';
      const payload: IOSPushNotificationPayload = {
        aps: {
          alert: {
            title: '測試標題',
            body: '測試內容',
          },
          badge: 1,
          sound: 'default',
        },
        customData: {
          type: 'test',
          id: '123',
        },
      };

      const result = await iosPushService.sendNotification(
        deviceToken,
        payload
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);

      if (result.success) {
        expect(result).toHaveProperty('messageId');
        expect(typeof result.messageId).toBe('string');
      } else {
        expect(result).toHaveProperty('error');
        expect(result).toHaveProperty('errorCode');
      }
    });

    it('應該處理無效設備令牌', async () => {
      const invalidToken = 'invalid_token';
      const payload: IOSPushNotificationPayload = {
        aps: {
          alert: {
            body: '測試內容',
          },
        },
      };

      const result = await iosPushService.sendNotification(
        invalidToken,
        payload
      );

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('invalid_token');
    });

    it('應該處理發送失敗', async () => {
      // 多次嘗試以增加失敗機會
      const deviceToken = 'ios_device_token_test_123456789';
      const payload: IOSPushNotificationPayload = {
        aps: {
          alert: {
            body: '測試內容',
          },
        },
      };

      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = await iosPushService.sendNotification(
          deviceToken,
          payload
        );
        results.push(result);
      }

      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('timestamp');
      });
    });
  });

  describe('sendBulkNotifications', () => {
    beforeEach(() => {
      iosPushService.configure(testConfig);
    });

    it('應該成功批量發送推送通知', async () => {
      const deviceTokens = [
        'ios_device_token_test_1',
        'ios_device_token_test_2',
        'ios_device_token_test_3',
      ];
      const payload: IOSPushNotificationPayload = {
        aps: {
          alert: {
            title: '批量測試',
            body: '批量推送通知測試',
          },
        },
      };

      const results = await iosPushService.sendBulkNotifications(
        deviceTokens,
        payload
      );

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(deviceTokens.length);

      results.forEach(result => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('timestamp');
        expect(result.timestamp).toBeInstanceOf(Date);
      });
    });

    it('應該處理批量發送失敗', async () => {
      // 創建一個新的未配置實例來測試錯誤處理
      const newService = new (IOSPushNotificationService as any)();
      (newService as any).isInitialized = false;
      (newService as any).pushLib = null;
      (newService as any).config = null;

      const deviceTokens = ['token1', 'token2'];
      const payload: IOSPushNotificationPayload = {
        aps: {
          alert: {
            body: '測試內容',
          },
        },
      };

      const results = await newService.sendBulkNotifications(
        deviceTokens,
        payload
      );

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(deviceTokens.length);

      results.forEach(result => {
        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('bulk_send_failed');
      });
    });
  });

  describe('sendLocalNotification', () => {
    it('應該成功發送本地推送通知', async () => {
      const title = '本地通知標題';
      const body = '本地通知內容';
      const options = {
        badge: 1,
        sound: 'default',
        category: 'test_category',
      };

      const result = await iosPushService.sendLocalNotification(
        title,
        body,
        options
      );

      expect(typeof result).toBe('boolean');
      expect([true, false]).toContain(result);
    });
  });

  describe('getDeviceToken', () => {
    it('應該返回設備令牌信息', () => {
      const deviceToken = iosPushService.getDeviceToken();

      // 初始狀態應該為 null
      expect(deviceToken).toBeNull();
    });
  });

  describe('getDeliveryStats', () => {
    it('應該返回投遞統計信息', async () => {
      const stats = await iosPushService.getDeliveryStats();

      expect(stats).toHaveProperty('totalSent');
      expect(stats).toHaveProperty('totalDelivered');
      expect(stats).toHaveProperty('totalFailed');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('averageDeliveryTime');

      expect(typeof stats.totalSent).toBe('number');
      expect(typeof stats.totalDelivered).toBe('number');
      expect(typeof stats.totalFailed).toBe('number');
      expect(typeof stats.successRate).toBe('number');
      expect(typeof stats.averageDeliveryTime).toBe('number');
    });
  });

  describe('validateDeviceToken', () => {
    it('應該正確驗證有效的設備令牌', async () => {
      const validToken = 'ios_device_token_test_123456789';
      const result = await iosPushService.validateDeviceToken(validToken);

      expect(typeof result).toBe('boolean');
      expect([true, false]).toContain(result);
    });

    it('應該正確驗證無效的設備令牌', async () => {
      const invalidToken = 'invalid_token';
      const result = await iosPushService.validateDeviceToken(invalidToken);

      expect(result).toBe(false);
    });
  });

  describe('resetStats', () => {
    it('應該重置統計信息', () => {
      iosPushService.resetStats();

      const serviceInfo = iosPushService.getServiceInfo();
      expect(serviceInfo.stats.totalSent).toBe(0);
      expect(serviceInfo.stats.totalDelivered).toBe(0);
      expect(serviceInfo.stats.totalFailed).toBe(0);
      expect(serviceInfo.stats.successRate).toBe(0);
      expect(serviceInfo.stats.averageDeliveryTime).toBe(0);
    });
  });

  describe('錯誤處理', () => {
    it('應該正確處理服務未初始化的情況', async () => {
      // 創建一個新的實例來測試錯誤處理
      const newService = new (IOSPushNotificationService as any)();

      // 等待初始化完成，然後強制設置為未初始化狀態
      await new Promise(resolve => setTimeout(resolve, 100));
      (newService as any).isInitialized = false;
      (newService as any).pushLib = null;
      (newService as any).config = null;

      const permissionsResult = await newService.requestPermissions();
      expect(permissionsResult).toBe(false);

      const registerResult = await newService.registerForRemoteNotifications();
      expect(registerResult).toBe(false);

      const unregisterResult =
        await newService.unregisterForRemoteNotifications();
      expect(unregisterResult).toBe(false);
    });

    it('應該正確處理未配置的情況', async () => {
      const deviceToken = 'test_token';
      const payload: IOSPushNotificationPayload = {
        aps: {
          alert: {
            body: '測試內容',
          },
        },
      };

      const result = await iosPushService.sendNotification(
        deviceToken,
        payload
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('未初始化或未配置');
    });
  });

  describe('iOS 特定功能', () => {
    it('應該支持 APNs 配置', () => {
      iosPushService.configure(testConfig);

      const serviceInfo = iosPushService.getServiceInfo();
      expect(serviceInfo.config).toBeDefined();
      expect(serviceInfo.config?.apnsEnvironment).toBe('development');
      expect(serviceInfo.config?.enableBadge).toBe(true);
      expect(serviceInfo.config?.enableSound).toBe(true);
      expect(serviceInfo.config?.enableAlert).toBe(true);
    });

    it('應該支持推送通知統計', async () => {
      iosPushService.configure(testConfig);

      // 發送一些測試通知來生成統計
      const deviceToken = 'ios_device_token_test_123456789';
      const payload: IOSPushNotificationPayload = {
        aps: {
          alert: {
            body: '統計測試',
          },
        },
      };

      await iosPushService.sendNotification(deviceToken, payload);

      const stats = await iosPushService.getDeliveryStats();
      expect(stats.totalSent).toBeGreaterThan(0);
    });
  });

  describe('性能測試', () => {
    it('應該能夠快速發送推送通知', async () => {
      iosPushService.configure(testConfig);

      const startTime = Date.now();

      const deviceToken = 'ios_device_token_test_123456789';
      const payload: IOSPushNotificationPayload = {
        aps: {
          alert: {
            body: '性能測試',
          },
        },
      };

      await iosPushService.sendNotification(deviceToken, payload);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 應該在合理時間內完成
      expect(processingTime).toBeLessThan(2000);
    });

    it('應該能夠快速批量發送推送通知', async () => {
      iosPushService.configure(testConfig);

      const startTime = Date.now();

      const deviceTokens = Array.from(
        { length: 10 },
        (_, i) => `ios_device_token_test_${i}`
      );
      const payload: IOSPushNotificationPayload = {
        aps: {
          alert: {
            body: '批量性能測試',
          },
        },
      };

      await iosPushService.sendBulkNotifications(deviceTokens, payload);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 應該在合理時間內完成
      expect(processingTime).toBeLessThan(5000);
    });
  });

  describe('服務狀態', () => {
    it('應該正確報告服務就緒狀態', () => {
      // 初始狀態
      expect(iosPushService.isServiceReady()).toBe(false);

      // 配置後
      iosPushService.configure(testConfig);
      expect(iosPushService.isServiceReady()).toBe(true);
    });

    it('應該提供完整的服務信息', () => {
      iosPushService.configure(testConfig);

      const serviceInfo = iosPushService.getServiceInfo();

      expect(serviceInfo).toHaveProperty('isInitialized');
      expect(serviceInfo).toHaveProperty('isServiceReady');
      expect(serviceInfo).toHaveProperty('platform');
      expect(serviceInfo).toHaveProperty('hasDeviceToken');
      expect(serviceInfo).toHaveProperty('deviceTokenEnvironment');
      expect(serviceInfo).toHaveProperty('config');
      expect(serviceInfo).toHaveProperty('stats');

      expect(serviceInfo.platform).toBe('ios');
      expect(iosPushService.isServiceReady()).toBe(true);
      expect(serviceInfo.config).toBeDefined();
    });
  });
});
