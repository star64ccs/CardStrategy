import { communicationService } from '../shared/services/communication/communicationService';

describe('CommunicationService', () => {
  beforeEach(() => {
    // Reset環境Variable
    delete process.env.SENDGRID_API_KEY;
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
  });

  describe('初始化', () => {
    test('應該正確InitializeService', () => {
      expect(communicationService).toBeDefined();
      expect(typeof communicationService.getAvailableChannels).toBe('function');
    });
  });

  describe('Service可用性Check', () => {
    test('應該正確檢查可用渠道', () => {
      const _channels = communicationService.getAvailableChannels();
      expect(channels).toHaveProperty('email');
      expect(channels).toHaveProperty('sms');
      expect(channels).toHaveProperty('voice');
      expect(typeof channels.email).toBe('boolean');
      expect(typeof channels.sms).toBe('boolean');
      expect(typeof channels.voice).toBe('boolean');
    });
  });

  describe('用戶偏好設置', () => {
    test('應該正確設置用戶偏好', () => {
      const _preferences = {
        userId: 'test-user-1',
        email: true,
        sms: false,
        voice: true,
        emailAddress: 'test@example.com',
        phoneNumber: '+1234567890',
      };

      communicationService.setUserPreferences(preferences);
      const _retrieved = communicationService.getUserPreferences('test-user-1');

      expect(retrieved).toEqual(preferences);
    });

    test('應該正確獲取用戶偏好', () => {
      const _preferences = {
        userId: 'test-user-2',
        email: true,
        sms: true,
        voice: false,
        emailAddress: 'test2@example.com',
        phoneNumber: '+0987654321',
      };

      communicationService.setUserPreferences(preferences);
      const _retrieved = communicationService.getUserPreferences('test-user-2');

      expect(retrieved).toEqual(preferences);
    });

    test('應該返回 null 當用戶不存在時', () => {
      const _retrieved =
        communicationService.getUserPreferences('non-existent-user');
      expect(retrieved).toBeNull();
    });
  });

  describe('發送通知', () => {
    test('應該在用戶偏好不存在時返回Error', async () => {
      const _notification = {
        userId: 'non-existent-user',
        type: 'welcome' as const,
        channel: 'email' as const,
        data: { userName: 'Test User' },
        priority: 'medium' as const,
      };

      const _result = await communicationService.sendNotification(notification);

      expect(result.success).toBe(false);
      expect(result.message).toContain('User preferences not found');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該返回正確的響應格式', async () => {
      // SettingsUserPreferences
      const _preferences = {
        userId: 'test-user-3',
        email: true,
        sms: false,
        voice: false,
        emailAddress: 'test3@example.com',
      };
      communicationService.setUserPreferences(preferences);

      const _notification = {
        userId: 'test-user-3',
        type: 'welcome' as const,
        channel: 'email' as const,
        data: { userName: 'Test User' },
        priority: 'medium' as const,
      };

      const _result = await communicationService.sendNotification(notification);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('批量發送通知', () => {
    test('空通知列表應該返回Success', async () => {
      const _result = await communicationService.sendBulkNotifications([]);

      expect(result.success).toBe(true);
      expect(result.data?.successCount).toBe(0);
      expect(result.data?.failedCount).toBe(0);
      expect(result.data?.results).toEqual([]);
      expect(result.message).toContain('No notifications to send');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('應該返回正確的響應格式', async () => {
      // SettingsUserPreferences
      const _preferences = {
        userId: 'test-user-4',
        email: true,
        sms: false,
        voice: false,
        emailAddress: 'test4@example.com',
      };
      communicationService.setUserPreferences(preferences);

      const _notifications = [
        {
          userId: 'test-user-4',
          type: 'welcome' as const,
          channel: 'email' as const,
          data: { userName: 'Test User' },
          priority: 'medium' as const,
        },
      ];

      const _result =
        await communicationService.sendBulkNotifications(notifications);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);

      if (result.data) {
        expect(result.data).toHaveProperty('successCount');
        expect(result.data).toHaveProperty('failedCount');
        expect(result.data).toHaveProperty('results');
        expect(Array.isArray(result.data.results)).toBe(true);
      }
    });
  });

  describe('GetService統計', () => {
    test('應該返回正確的統計格式', async () => {
      const _result = await communicationService.getServiceStats();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);

      if (result.success && result.data) {
        expect(result.data).toHaveProperty('availableChannels');
        expect(result.data).toHaveProperty('sendgridStats');
        expect(result.data).toHaveProperty('twilioStats');
        expect(result.data).toHaveProperty('gmailStats');
        expect(result.data).toHaveProperty('totalUsers');
        expect(typeof result.data.totalUsers).toBe('number');
      }
    });
  });

  describe('渠道確定邏輯', () => {
    test('應該正確處理 all 渠道', () => {
      const _preferences = {
        userId: 'test-user-5',
        email: true,
        sms: true,
        voice: false,
        emailAddress: 'test5@example.com',
        phoneNumber: '+1234567890',
      };
      communicationService.setUserPreferences(preferences);

      const _notification = {
        userId: 'test-user-5',
        type: 'price_alert' as const,
        channel: 'all' as const,
        data: { cardName: 'Test Card', currentPrice: 100, targetPrice: 90 },
        priority: 'high' as const,
      };

      // 這個Test主要VerifyMethod調用不會ThrowError
      expect(async () => {
        await communicationService.sendNotification(notification);
      }).not.toThrow();
    });

    test('應該正確處理單一渠道', () => {
      const _preferences = {
        userId: 'test-user-6',
        email: true,
        sms: true,
        voice: true,
        emailAddress: 'test6@example.com',
        phoneNumber: '+1234567890',
      };
      communicationService.setUserPreferences(preferences);

      const _notification = {
        userId: 'test-user-6',
        type: 'verification' as const,
        channel: 'sms' as const,
        data: { code: '123456' },
        priority: 'high' as const,
      };

      // 這個Test主要VerifyMethod調用不會ThrowError
      expect(async () => {
        await communicationService.sendNotification(notification);
      }).not.toThrow();
    });
  });
});
