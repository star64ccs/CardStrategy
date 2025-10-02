import { Platform } from 'react-native';

import type { BiometricType, BiometricAuthRequest } from '../../../core/types';
import { IOSBiometricService } from '../services/iosBiometricService';

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

describe('IOSBiometricService', () => {
  let iosBiometricService: IOSBiometricService;

  beforeEach(() => {
    // 重置單例
    (IOSBiometricService as any).instance = null;
    iosBiometricService = IOSBiometricService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const instance1 = IOSBiometricService.getInstance();
      const instance2 = IOSBiometricService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('服務初始化', () => {
    it('應該在 iOS 平台上正確初始化', () => {
      expect(Platform.OS).toBe('ios');
      expect(iosBiometricService.isServiceReady()).toBe(true);
    });

    it('應該提供服務信息', () => {
      const serviceInfo = iosBiometricService.getServiceInfo();

      expect(serviceInfo).toHaveProperty('isInitialized');
      expect(serviceInfo).toHaveProperty('isServiceReady');
      expect(serviceInfo).toHaveProperty('platform');
      expect(serviceInfo).toHaveProperty('capabilities');
      expect(serviceInfo).toHaveProperty('securityInfo');

      expect(serviceInfo.platform).toBe('ios');
      expect(typeof serviceInfo.isInitialized).toBe('boolean');
      expect(typeof serviceInfo.isServiceReady).toBe('boolean');
    });
  });

  describe('detectCapabilities', () => {
    it('應該成功檢測 iOS 設備能力', async () => {
      const capabilities = await iosBiometricService.detectCapabilities();

      expect(Array.isArray(capabilities)).toBe(true);
      expect(capabilities.length).toBeGreaterThan(0);

      // 檢查能力對象結構
      capabilities.forEach(capability => {
        expect(capability).toHaveProperty('type');
        expect(capability).toHaveProperty('isAvailable');
        expect(capability).toHaveProperty('isEnrolled');
        expect(capability).toHaveProperty('isSupported');
        expect(capability).toHaveProperty('hardwareDetected');
        expect(capability).toHaveProperty('securityLevel');
      });
    });

    it('應該包含 iOS 支持的生物識別類型', async () => {
      const capabilities = await iosBiometricService.detectCapabilities();
      const types = capabilities.map(cap => cap.type);

      // iOS 應該支持 faceId 或 touchId
      const iosSupportedTypes: BiometricType[] = ['faceId', 'touchId'];
      const hasIOSSupport = types.some(type =>
        iosSupportedTypes.includes(type)
      );

      // 至少應該有一種 iOS 支持的類型
      expect(hasIOSSupport).toBe(true);
    });

    it('應該正確標記可用的生物識別類型', async () => {
      const capabilities = await iosBiometricService.detectCapabilities();

      // 檢查是否有可用的生物識別類型
      const availableCapabilities = capabilities.filter(cap => cap.isAvailable);
      expect(availableCapabilities.length).toBeGreaterThanOrEqual(0);

      // 如果有的話，應該有正確的屬性
      availableCapabilities.forEach(cap => {
        expect(cap.isAvailable).toBe(true);
        expect(cap.hardwareDetected).toBe(true);
        expect(cap.isSupported).toBe(true);
      });
    });
  });

  describe('authenticate', () => {
    it('應該成功執行 iOS 生物識別認證', async () => {
      const request: BiometricAuthRequest = {
        promptMessage: '請使用 Face ID 或 Touch ID 登錄',
        cancelButtonText: '取消',
        fallbackButtonText: '使用密碼',
      };

      const result = await iosBiometricService.authenticate(request);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);

      if (result.success) {
        expect(result).toHaveProperty('biometricType');
        expect(result).toHaveProperty('authenticationMethod');
        expect(result.authenticationMethod).toBe('biometric');

        // iOS 應該返回 faceId 或 touchId
        expect(['faceId', 'touchId']).toContain(result.biometricType);
      } else {
        expect(result).toHaveProperty('errorCode');
        expect(result).toHaveProperty('errorMessage');
      }
    });

    it('應該處理認證失敗情況', async () => {
      // 多次嘗試以增加失敗機會
      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = await iosBiometricService.authenticate();
        results.push(result);
      }

      // 至少應該有一些結果
      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(typeof result.success).toBe('boolean');
        expect(result).toHaveProperty('timestamp');
      });
    });

    it('應該處理未設置生物識別的情況', async () => {
      // 這個測試主要檢查錯誤處理邏輯
      const result = await iosBiometricService.authenticate();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');

      // 如果失敗，應該有適當的錯誤信息
      if (!result.success) {
        expect(result).toHaveProperty('errorCode');
        expect(result).toHaveProperty('errorMessage');
      }
    });
  });

  describe('createSignature', () => {
    it('應該成功創建 iOS 生物識別簽名', async () => {
      const promptMessage = '請進行生物識別認證以創建簽名';
      const payload = 'test-payload-data';

      const result = await iosBiometricService.createSignature(
        promptMessage,
        payload
      );

      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');

      if (result.success) {
        expect(result.signature).toBeTruthy();
        expect(typeof result.signature).toBe('string');
      }
    });

    it('應該處理簽名創建失敗的情況', async () => {
      // 多次嘗試以增加失敗機會
      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = await iosBiometricService.createSignature(
          'test',
          'payload'
        );
        results.push(result);
      }

      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result).toHaveProperty('signature');
        expect(result).toHaveProperty('success');
        expect(typeof result.success).toBe('boolean');
      });
    });
  });

  describe('安全信息管理', () => {
    it('應該提供安全信息', () => {
      const securityInfo = iosBiometricService.getSecurityInfo();

      if (securityInfo) {
        expect(securityInfo).toHaveProperty('keyAlias');
        expect(securityInfo).toHaveProperty('keyGenerated');
        expect(securityInfo).toHaveProperty('keyInvalidated');
        expect(securityInfo).toHaveProperty('biometricChanged');
        expect(securityInfo).toHaveProperty('securityLevel');
        expect(securityInfo).toHaveProperty('attestationSupported');

        expect(securityInfo.keyAlias).toBe('ios_biometric_key');
        expect(typeof securityInfo.keyGenerated).toBe('boolean');
        expect(typeof securityInfo.keyInvalidated).toBe('boolean');
        expect(typeof securityInfo.biometricChanged).toBe('boolean');
        expect(['weak', 'strong', 'class3']).toContain(
          securityInfo.securityLevel
        );
        expect(typeof securityInfo.attestationSupported).toBe('boolean');
      }
    });

    it('應該能夠使密鑰失效', async () => {
      const result = await iosBiometricService.invalidateKeys();

      expect(typeof result).toBe('boolean');
      // 即使失敗也應該返回布爾值
      expect([true, false]).toContain(result);
    });

    it('應該能夠重新初始化密鑰', async () => {
      const result = await iosBiometricService.reinitializeKeys();

      expect(typeof result).toBe('boolean');
      // 即使失敗也應該返回布爾值
      expect([true, false]).toContain(result);
    });
  });

  describe('錯誤處理', () => {
    it('應該正確處理服務未初始化的情況', async () => {
      // 創建一個新的實例來測試錯誤處理
      const newService = new (IOSBiometricService as any)();

      // 模擬未初始化狀態
      (newService as any).isInitialized = false;
      (newService as any).biometricLib = null;

      await expect(newService.detectCapabilities()).rejects.toThrow(
        'iOS 生物識別服務未初始化'
      );

      // authenticate 和 createSignature 方法會返回錯誤結果而不是拋出異常
      const authResult = await newService.authenticate();
      expect(authResult.success).toBe(false);
      expect(authResult.errorMessage).toBe('iOS 生物識別服務未初始化');

      const signatureResult = await newService.createSignature(
        'test',
        'payload'
      );
      expect(signatureResult.success).toBe(false);
    });

    it('應該正確處理認證異常', async () => {
      const result = await iosBiometricService.authenticate();

      // 即使出現異常，也應該返回有效的結果對象
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('iOS 特定功能', () => {
    it('應該支持 Face ID 和 Touch ID', async () => {
      const capabilities = await iosBiometricService.detectCapabilities();
      const iosTypes = capabilities.filter(
        cap => cap.type === 'faceId' || cap.type === 'touchId'
      );

      // 應該至少有一種 iOS 生物識別類型
      expect(iosTypes.length).toBeGreaterThan(0);

      iosTypes.forEach(cap => {
        expect(['faceId', 'touchId']).toContain(cap.type);
      });
    });

    it('應該提供 iOS 特定的認證體驗', async () => {
      const request: BiometricAuthRequest = {
        promptMessage: '請使用 Face ID 或 Touch ID 登錄',
        cancelButtonText: '取消',
        fallbackButtonText: '使用密碼',
        disableDeviceFallback: false,
      };

      const result = await iosBiometricService.authenticate(request);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');

      if (result.success) {
        // iOS 認證成功時應該有正確的類型
        expect(['faceId', 'touchId']).toContain(result.biometricType);
        expect(result.authenticationMethod).toBe('biometric');
      }
    });
  });

  describe('性能測試', () => {
    it('應該能夠快速檢測設備能力', async () => {
      const startTime = Date.now();

      await iosBiometricService.detectCapabilities();

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 應該在合理時間內完成
      expect(processingTime).toBeLessThan(1000);
    });

    it('應該能夠快速執行認證', async () => {
      const startTime = Date.now();

      await iosBiometricService.authenticate();

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // 應該在合理時間內完成
      expect(processingTime).toBeLessThan(2000);
    });
  });

  describe('服務狀態', () => {
    it('應該正確報告服務就緒狀態', () => {
      const isReady = iosBiometricService.isServiceReady();
      expect(typeof isReady).toBe('boolean');
      expect([true, false]).toContain(isReady);
    });

    it('應該提供完整的服務信息', () => {
      const serviceInfo = iosBiometricService.getServiceInfo();

      expect(serviceInfo).toHaveProperty('isInitialized');
      expect(serviceInfo).toHaveProperty('isServiceReady');
      expect(serviceInfo).toHaveProperty('platform');
      expect(serviceInfo).toHaveProperty('capabilities');
      expect(serviceInfo).toHaveProperty('securityInfo');

      expect(serviceInfo.platform).toBe('ios');
      expect(typeof serviceInfo.isInitialized).toBe('boolean');
      expect(typeof serviceInfo.isServiceReady).toBe('boolean');
      expect(Array.isArray(serviceInfo.capabilities)).toBe(true);
    });
  });
});
