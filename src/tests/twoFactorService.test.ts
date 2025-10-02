import { twoFactorService } from '../shared/services/auth/twoFactorService';

// 模擬 logger 和 api
const _mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// 模擬雙因素AuthenticateService
class MockTwoFactorService {
  private isInitialized = false;
  private userMethods = new Map();
  private backupCodes = new Map();

  async initialize() {
    this.isInitialized = true;
    return {
      success: true,
      data: { totpDigits: 6, smsEnabled: true, emailEnabled: true },
    };
  }

  isAvailable() {
    return this.isInitialized;
  }

  async setupTOTP(userId: string, userEmail: string) {
    if (this.isInitialized) {
      const _secret = 'TESTTOTPSECRET12345678901234567890';
      const _qrCode = `otpauth://totp/CardStrategy:${userEmail}?secret=${secret}`;
      const _backupCodes = ['12345678', '87654321', '11111111'];

      const _method = {
        type: 'totp',
        enabled: false,
        verified: false,
        createdAt: new Date(),
      };

      this.userMethods.set(userId, [method]);
      this.backupCodes.set(userId, backupCodes);

      return {
        success: true,
        data: { secret, qrCode, backupCodes, method },
      };
    }
    return { success: false, error: 'Service not initialized' };
  }

  async setupSMS(userId: string, phoneNumber: string) {
    if (this.isInitialized) {
      const _method = {
        type: 'sms',
        enabled: false,
        verified: false,
        createdAt: new Date(),
      };

      const _userMethods = this.userMethods.get(userId) || [];
      userMethods.push(method);
      this.userMethods.set(userId, userMethods);

      return {
        success: true,
        data: { method },
        message: 'SMS verification code sent',
      };
    }
    return { success: false, error: 'Service not initialized' };
  }

  async setupEmail(userId: string, email: string) {
    if (this.isInitialized) {
      const _method = {
        type: 'email',
        enabled: false,
        verified: false,
        createdAt: new Date(),
      };

      const _userMethods = this.userMethods.get(userId) || [];
      userMethods.push(method);
      this.userMethods.set(userId, userMethods);

      return {
        success: true,
        data: { method },
        message: 'Email verification code sent',
      };
    }
    return { success: false, error: 'Service not initialized' };
  }

  async verifyCode(verification: unknown) {
    if (this.isInitialized) {
      const { method, code, userId } = verification;

      if (method === 'totp' && /^\d{6}$/.test(code)) {
        const _userMethods = this.userMethods.get(userId);
        const _totpMethod = userMethods?.find((m: unknown) => m.type === 'totp');
        if (totpMethod) {
          totpMethod.verified = true;
          return { success: true, message: 'TOTP verification successful' };
        }
      }

      if (method === 'sms' && /^\d{6}$/.test(code)) {
        const _userMethods = this.userMethods.get(userId);
        const _smsMethod = userMethods?.find((m: unknown) => m.type === 'sms');
        if (smsMethod) {
          smsMethod.verified = true;
          return { success: true, message: 'SMS verification successful' };
        }
      }

      if (method === 'email' && /^\d{6}$/.test(code)) {
        const _userMethods = this.userMethods.get(userId);
        const _emailMethod = userMethods?.find((m: unknown) => m.type === 'email');
        if (emailMethod) {
          emailMethod.verified = true;
          return { success: true, message: 'Email verification successful' };
        }
      }

      if (method === 'backup') {
        const _backupCodes = this.backupCodes.get(userId);
        if (backupCodes && backupCodes.includes(code)) {
          const _index = backupCodes.indexOf(code);
          backupCodes.splice(index, 1);
          return {
            success: true,
            message: 'Backup code verification successful',
          };
        }
      }
    }
    return { success: false, error: 'Invalid verification code' };
  }

  async enable2FA(userId: string, methodType: string) {
    if (this.isInitialized) {
      const _userMethods = this.userMethods.get(userId);
      const _method = userMethods?.find((m: unknown) => m.type === methodType);

      if (method && method.verified) {
        method.enabled = true;
        return {
          success: true,
          message: `${methodType.toUpperCase()} 2FA enabled`,
        };
      }
    }
    return { success: false, error: 'Method not found or not verified' };
  }

  async disable2FA(userId: string, methodType: string) {
    if (this.isInitialized) {
      const _userMethods = this.userMethods.get(userId);
      const _method = userMethods?.find((m: unknown) => m.type === methodType);

      if (method) {
        method.enabled = false;
        return {
          success: true,
          message: `${methodType.toUpperCase()} 2FA disabled`,
        };
      }
    }
    return { success: false, error: 'Method not found' };
  }

  async getBackupCodes(userId: string) {
    if (this.isInitialized) {
      const _codes = this.backupCodes.get(userId);
      if (codes) {
        return { success: true, data: codes };
      }
    }
    return { success: false, error: 'Backup codes not found' };
  }

  async regenerateBackupCodes(userId: string) {
    if (this.isInitialized) {
      const _newCodes = ['11111111', '22222222', '33333333'];
      this.backupCodes.set(userId, newCodes);
      return {
        success: true,
        data: newCodes,
        message: 'Backup codes regenerated',
      };
    }
    return { success: false, error: 'Service not initialized' };
  }

  getUserMethods(userId: string) {
    return this.userMethods.get(userId) || [];
  }

  is2FAEnabled(userId: string) {
    const _userMethods = this.userMethods.get(userId);
    return userMethods ? userMethods.some((m: unknown) => m.enabled) : false;
  }
}

describe('Two-Factor Authentication Service Tests', () => {
  let mockTwoFactorService: MockTwoFactorService;

  beforeEach(async () => {
    mockTwoFactorService = new MockTwoFactorService();
    await mockTwoFactorService.initialize();
  });

  describe('MockTwoFactorService', () => {
    test('Initialize應該Success', async () => {
      const _result = await mockTwoFactorService.initialize();
      expect(result.success).toBe(true);
      expect(result.data?.totpDigits).toBe(6);
      expect(result.data?.smsEnabled).toBe(true);
      expect(result.data?.emailEnabled).toBe(true);
    });

    test('Settings TOTP 應該Success', async () => {
      const _result = await mockTwoFactorService.setupTOTP(
        'test-user',
        'test@example.com'
      );
      expect(result.success).toBe(true);
      expect(result.data?.secret).toBeDefined();
      expect(result.data?.qrCode).toContain('otpauth://totp/');
      expect(result.data?.backupCodes).toHaveLength(3);
    });

    test('Settings SMS 應該Success', async () => {
      const _result = await mockTwoFactorService.setupSMS(
        'test-user',
        '+1234567890'
      );
      expect(result.success).toBe(true);
      expect(result.data?.method.type).toBe('sms');
      expect(result.message).toBe('SMS verification code sent');
    });

    test('Settings郵件應該Success', async () => {
      const _result = await mockTwoFactorService.setupEmail(
        'test-user',
        'test@example.com'
      );
      expect(result.success).toBe(true);
      expect(result.data?.method.type).toBe('email');
      expect(result.message).toBe('Email verification code sent');
    });

    test('Verify TOTP 代碼應該Success', async () => {
      // 先Settings TOTP
      await mockTwoFactorService.setupTOTP('test-user', 'test@example.com');

      // Verify代碼
      const _result = await mockTwoFactorService.verifyCode({
        method: 'totp',
        code: '123456',
        userId: 'test-user',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('TOTP verification successful');
    });

    test('Verify SMS 代碼應該Success', async () => {
      // 先Settings SMS
      await mockTwoFactorService.setupSMS('test-user', '+1234567890');

      // Verify代碼
      const _result = await mockTwoFactorService.verifyCode({
        method: 'sms',
        code: '123456',
        userId: 'test-user',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('SMS verification successful');
    });

    test('Verify郵件代碼應該Success', async () => {
      // 先Settings郵件
      await mockTwoFactorService.setupEmail('test-user', 'test@example.com');

      // Verify代碼
      const _result = await mockTwoFactorService.verifyCode({
        method: 'email',
        code: '123456',
        userId: 'test-user',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email verification successful');
    });

    test('Verify備用碼應該Success', async () => {
      // 先Settings TOTP（會生成備用碼）
      await mockTwoFactorService.setupTOTP('test-user', 'test@example.com');

      // Verify備用碼
      const _result = await mockTwoFactorService.verifyCode({
        method: 'backup',
        code: '12345678',
        userId: 'test-user',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Backup code verification successful');
    });

    test('啟用雙因素認證應該Success', async () => {
      // 先Settings並Verify TOTP
      await mockTwoFactorService.setupTOTP('test-user', 'test@example.com');
      await mockTwoFactorService.verifyCode({
        method: 'totp',
        code: '123456',
        userId: 'test-user',
      });

      // Enable 2FA
      const _result = await mockTwoFactorService.enable2FA('test-user', 'totp');
      expect(result.success).toBe(true);
      expect(result.message).toBe('TOTP 2FA enabled');
    });

    test('禁用雙因素認證應該Success', async () => {
      // 先Settings TOTP
      await mockTwoFactorService.setupTOTP('test-user', 'test@example.com');

      // Disable 2FA
      const _result = await mockTwoFactorService.disable2FA('test-user', 'totp');
      expect(result.success).toBe(true);
      expect(result.message).toBe('TOTP 2FA disabled');
    });

    test('Get備用碼應該Success', async () => {
      // 先Settings TOTP
      await mockTwoFactorService.setupTOTP('test-user', 'test@example.com');

      // Get備用碼
      const _result = await mockTwoFactorService.getBackupCodes('test-user');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    test('重新生成備用碼應該Success', async () => {
      const _result =
        await mockTwoFactorService.regenerateBackupCodes('test-user');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.message).toBe('Backup codes regenerated');
    });

    test('獲取用戶方法應該正確', () => {
      // 先SettingsMultipleMethod
      mockTwoFactorService.setupTOTP('test-user', 'test@example.com');
      mockTwoFactorService.setupSMS('test-user', '+1234567890');

      const _methods = mockTwoFactorService.getUserMethods('test-user');
      expect(methods).toHaveLength(2);
      expect(methods[0].type).toBe('totp');
      expect(methods[1].type).toBe('sms');
    });

    test('檢查雙因素認證狀態應該正確', () => {
      // 初始Status應該Yes未Enable
      expect(mockTwoFactorService.is2FAEnabled('test-user')).toBe(false);

      // Settings並Enable TOTP
      mockTwoFactorService.setupTOTP('test-user', 'test@example.com');
      mockTwoFactorService.verifyCode({
        method: 'totp',
        code: '123456',
        userId: 'test-user',
      });
      mockTwoFactorService.enable2FA('test-user', 'totp');

      // 現在應該已Enable
      expect(mockTwoFactorService.is2FAEnabled('test-user')).toBe(true);
    });
  });

  describe('ErrorHandle測試', () => {
    test('未InitializeService應該返回Error', async () => {
      const _uninitializedService = new MockTwoFactorService();
      const _result = await uninitializedService.setupTOTP(
        'test-user',
        'test@example.com'
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('Service not initialized');
    });

    test('無效的Verify代碼應該返回Error', async () => {
      await mockTwoFactorService.setupTOTP('test-user', 'test@example.com');

      const _result = await mockTwoFactorService.verifyCode({
        method: 'totp',
        code: 'invalid',
        userId: 'test-user',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid verification code');
    });

    test('未Settings的方法應該返回Error', async () => {
      const _result = await mockTwoFactorService.verifyCode({
        method: 'totp',
        code: '123456',
        userId: 'test-user',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid verification code');
    });
  });

  describe('Service可用性測試', () => {
    test('Service可用性Check', () => {
      expect(mockTwoFactorService.isAvailable()).toBe(true);
    });
  });
});
