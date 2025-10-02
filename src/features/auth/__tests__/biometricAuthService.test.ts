import type { BiometricType, BiometricAuthRequest } from '../../../core/types';
import { BiometricAuthService } from '../services/biometricAuthService';

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
  },
}));

describe('BiometricAuthService', () => {
  let biometricAuthService: BiometricAuthService;

  beforeEach(() => {
    biometricAuthService = BiometricAuthService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const _instance1 = BiometricAuthService.getInstance();
      const _instance2 = BiometricAuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('detectBiometricCapabilities', () => {
    it('應該Success檢測生物識別能力', async () => {
      const _capabilities =
        await biometricAuthService.detectBiometricCapabilities();

      expect(Array.isArray(capabilities)).toBe(true);
      expect(capabilities.length).toBeGreaterThan(0);

      // Check能力Object結構
      capabilities.forEach(capability => {
        expect(capability).toHaveProperty('type');
        expect(capability).toHaveProperty('isAvailable');
        expect(capability).toHaveProperty('isEnrolled');
        expect(capability).toHaveProperty('isSupported');
        expect(capability).toHaveProperty('hardwareDetected');
        expect(capability).toHaveProperty('securityLevel');
      });
    });

    it('應該包含支持的生物識別類型', async () => {
      const _capabilities =
        await biometricAuthService.detectBiometricCapabilities();
      const _types = capabilities.map(cap => cap.type);

      // iOS 應該Support faceId 或 touchId
      const supportedTypes: BiometricType[] = [
        'faceId',
        'touchId',
        'fingerprint',
        'iris',
        'voiceId',
        'palm',
      ];
      types.forEach(type => {
        expect(supportedTypes).toContain(type);
      });
    });
  });

  describe('authenticate', () => {
    it('應該Success執行生物識別認證', async () => {
      const request: BiometricAuthRequest = {
        promptMessage: '請進行生物識別認證',
        cancelButtonText: '取消',
      };

      const _result = await biometricAuthService.authenticate(request);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);

      if (result.success) {
        expect(result).toHaveProperty('biometricType');
        expect(result).toHaveProperty('authenticationMethod');
        expect(result.authenticationMethod).toBe('biometric');
      } else {
        expect(result).toHaveProperty('errorCode');
        expect(result).toHaveProperty('errorMessage');
      }
    });

    it('應該Handle認證Failed情況', async () => {
      // 多次嘗試以增加Failed機會
      const _results = [];
      for (let i = 0; i < 5; i++) {
        const _result = await biometricAuthService.authenticate();
        results.push(result);
      }

      // 至少應該有一些結果
      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(typeof result.success).toBe('boolean');
      });
    });

    it('應該使用默認配置進行認證', async () => {
      const _result = await biometricAuthService.authenticate();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('createBiometricKeys', () => {
    it('應該SuccessCreate生物識別密鑰', async () => {
      const _result = await biometricAuthService.createBiometricKeys();

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });
  });

  describe('biometricKeysExist', () => {
    it('應該檢查生物識別密鑰是否存在', async () => {
      const _exists = await biometricAuthService.biometricKeysExist();

      expect(typeof exists).toBe('boolean');
    });
  });

  describe('deleteBiometricKeys', () => {
    it('應該SuccessDelete生物識別密鑰', async () => {
      const _result = await biometricAuthService.deleteBiometricKeys();

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });
  });

  describe('createBiometricSignature', () => {
    it('應該SuccessCreate生物識別簽名', async () => {
      const _payload = 'test-payload';
      const _promptMessage = '請進行生物識別認證以創建簽名';

      const _signature = await biometricAuthService.createBiometricSignature(
        payload,
        promptMessage
      );

      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    it('應該使用默認提示消息', async () => {
      const _payload = 'test-payload';

      const _signature =
        await biometricAuthService.createBiometricSignature(payload);

      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });
  });

  describe('getBiometricSettings', () => {
    it('應該SuccessGet生物識別Settings', async () => {
      const _settings = await biometricAuthService.getBiometricSettings();

      expect(settings).toHaveProperty('isEnabled');
      expect(settings).toHaveProperty('enabledTypes');
      expect(settings).toHaveProperty('fallbackToDeviceCredential');
      expect(settings).toHaveProperty('requireConfirmation');
      expect(settings).toHaveProperty('invalidateOnEnrollment');
      expect(settings).toHaveProperty('maxRetryAttempts');
      expect(settings).toHaveProperty('lockoutDuration');

      expect(typeof settings.isEnabled).toBe('boolean');
      expect(Array.isArray(settings.enabledTypes)).toBe(true);
      expect(typeof settings.fallbackToDeviceCredential).toBe('boolean');
      expect(typeof settings.requireConfirmation).toBe('boolean');
      expect(typeof settings.invalidateOnEnrollment).toBe('boolean');
      expect(typeof settings.maxRetryAttempts).toBe('number');
      expect(typeof settings.lockoutDuration).toBe('number');
    });
  });

  describe('updateBiometricSettings', () => {
    it('應該SuccessUpdate生物識別Settings', async () => {
      const _updates = {
        isEnabled: false,
        maxRetryAttempts: 5,
      };

      const _updatedSettings =
        await biometricAuthService.updateBiometricSettings(updates);

      expect(updatedSettings).toHaveProperty('isEnabled');
      expect(updatedSettings).toHaveProperty('maxRetryAttempts');
      expect(updatedSettings.maxRetryAttempts).toBe(5);
    });

    it('應該合併現有設置', async () => {
      const _currentSettings = await biometricAuthService.getBiometricSettings();
      const _updates = { maxRetryAttempts: 10 };

      const _updatedSettings =
        await biometricAuthService.updateBiometricSettings(updates);

      expect(updatedSettings.maxRetryAttempts).toBe(10);
      expect(updatedSettings.isEnabled).toBe(currentSettings.isEnabled);
      expect(updatedSettings.fallbackToDeviceCredential).toBe(
        currentSettings.fallbackToDeviceCredential
      );
    });
  });

  describe('getEnrollmentStatus', () => {
    it('應該SuccessGet註冊狀態', async () => {
      const _status = await biometricAuthService.getEnrollmentStatus();

      expect(status).toHaveProperty('hasEnrolledBiometrics');
      expect(status).toHaveProperty('enrolledTypes');
      expect(status).toHaveProperty('canEnroll');

      expect(typeof status.hasEnrolledBiometrics).toBe('boolean');
      expect(Array.isArray(status.enrolledTypes)).toBe(true);
      expect(typeof status.canEnroll).toBe('boolean');

      if (status.enrollmentDate) {
        expect(status.enrollmentDate).toBeInstanceOf(Date);
      }

      if (status.lastUsedDate) {
        expect(status.lastUsedDate).toBeInstanceOf(Date);
      }
    });
  });

  describe('getSecurityInfo', () => {
    it('應該SuccessGet安全信息', async () => {
      const _securityInfo = await biometricAuthService.getSecurityInfo();

      expect(securityInfo).toHaveProperty('keyAlias');
      expect(securityInfo).toHaveProperty('keyGenerated');
      expect(securityInfo).toHaveProperty('keyInvalidated');
      expect(securityInfo).toHaveProperty('biometricChanged');
      expect(securityInfo).toHaveProperty('securityLevel');
      expect(securityInfo).toHaveProperty('attestationSupported');

      expect(typeof securityInfo.keyAlias).toBe('string');
      expect(typeof securityInfo.keyGenerated).toBe('boolean');
      expect(typeof securityInfo.keyInvalidated).toBe('boolean');
      expect(typeof securityInfo.biometricChanged).toBe('boolean');
      expect(['weak', 'strong', 'class3']).toContain(
        securityInfo.securityLevel
      );
      expect(typeof securityInfo.attestationSupported).toBe('boolean');
    });
  });

  describe('isBiometricAvailable', () => {
    it('應該檢查生物識別是否可用', async () => {
      const _available = await biometricAuthService.isBiometricAvailable();

      expect(typeof available).toBe('boolean');
    });
  });

  describe('ErrorHandle', () => {
    it('應該HandleInitializeFailed', async () => {
      // Create新Instance來TestInitializeFailed情況
      const _service = new (BiometricAuthService as any)();

      // 模擬InitializeFailed
      service.isInitialized = false;
      service.biometricLib = null;

      try {
        await service.authenticate();
        // 如果沒有ThrowError，Check結果
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('應該正確映射Error代碼', () => {
      const _service = biometricAuthService as any;

      expect(service.mapErrorToCode({ message: 'User canceled' })).toBe(
        'user_cancel'
      );
      expect(service.mapErrorToCode({ message: 'Authentication failed' })).toBe(
        'authentication_failed'
      );
      expect(service.mapErrorToCode({ message: 'Timeout occurred' })).toBe(
        'timeout'
      );
      expect(service.mapErrorToCode({ message: 'Not available' })).toBe(
        'biometry_not_available'
      );
      expect(service.mapErrorToCode({ message: 'Unknown error' })).toBe(
        'unknown_error'
      );
    });

    it('應該正確獲取安全級別', () => {
      const _service = biometricAuthService as any;

      expect(service.getSecurityLevel('faceId')).toBe('class3');
      expect(service.getSecurityLevel('iris')).toBe('class3');
      expect(service.getSecurityLevel('fingerprint')).toBe('strong');
      expect(service.getSecurityLevel('touchId')).toBe('strong');
      expect(service.getSecurityLevel('voiceId')).toBe('weak');
      expect(service.getSecurityLevel('palm')).toBe('weak');
    });

    it('應該正確檢查類型支持', () => {
      const _service = biometricAuthService as any;

      // iOS Support的Class型
      expect(service.isTypeSupported('faceId')).toBe(true);
      expect(service.isTypeSupported('touchId')).toBe(true);
      expect(service.isTypeSupported('voiceId')).toBe(false);
    });
  });

  describe('平台特定功能', () => {
    it('應該根據平台加載不同的生物識別庫', async () => {
      // Test已經在 iOS 平台上運Row
      const _capabilities =
        await biometricAuthService.detectBiometricCapabilities();

      // iOS 應該Support faceId 或 touchId
      const _iosTypes = capabilities.filter(
        cap => cap.type === 'faceId' || cap.type === 'touchId'
      );

      expect(iosTypes.length).toBeGreaterThan(0);
    });
  });

  describe('集成測試', () => {
    it('應該完成完整的生物識別流程', async () => {
      // 1. 檢測能力
      const _capabilities =
        await biometricAuthService.detectBiometricCapabilities();
      expect(capabilities.length).toBeGreaterThan(0);

      // 2. Create密鑰
      const _keyCreated = await biometricAuthService.createBiometricKeys();
      expect(keyCreated).toBe(true);

      // 3. Check密鑰
      const _keysExist = await biometricAuthService.biometricKeysExist();
      expect(typeof keysExist).toBe('boolean');

      // 4. GetSettings
      const _settings = await biometricAuthService.getBiometricSettings();
      expect(settings).toBeDefined();

      // 5. 執RowAuthenticate
      const _authResult = await biometricAuthService.authenticate();
      expect(authResult).toBeDefined();
      expect(typeof authResult.success).toBe('boolean');

      // 6. Get安全Information
      const _securityInfo = await biometricAuthService.getSecurityInfo();
      expect(securityInfo).toBeDefined();

      // 7. Delete密鑰
      const _keyDeleted = await biometricAuthService.deleteBiometricKeys();
      expect(keyDeleted).toBe(true);
    });
  });
});
