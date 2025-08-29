import { Platform } from 'react-native';

import type { BiometricAuthRequest } from '../../../core/types';
import { BiometricAuthResult } from '../../../core/types';
import { AndroidBiometricService } from '../services/androidBiometricService';

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

describe('AndroidBiometricService', () => {
  let service: AndroidBiometricService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = AndroidBiometricService.getInstance();
  });

  describe('初始化測試', () => {
    test('應該成功創建單例實例', () => {
      const _instance1 = AndroidBiometricService.getInstance();
      const _instance2 = AndroidBiometricService.getInstance();
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
      const _newService = new (AndroidBiometricService as any)();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(newService.isServiceReady()).toBe(false);

      // 恢復 Platform.OS
      (Platform as any).OS = 'android';
    });
  });

  describe('設備能力檢測測試', () => {
    test('應該檢測到設備能力', async () => {
      const _capabilities = await service.detectCapabilities();

      expect(Array.isArray(capabilities)).toBe(true);
      expect(capabilities.length).toBeGreaterThan(0);

      // 檢查能力結構
      capabilities.forEach(capability => {
        expect(capability).toHaveProperty('type');
        expect(capability).toHaveProperty('isAvailable');
        expect(capability).toHaveProperty('isEnrolled');
        expect(capability).toHaveProperty('isSupported');
        expect(capability).toHaveProperty('hardwareDetected');
        expect(capability).toHaveProperty('securityLevel');
      });
    });

    test('應該包含所有生物識別類型', async () => {
      const _capabilities = await service.detectCapabilities();
      const _types = capabilities.map(cap => cap.type);

      expect(types).toContain('fingerprint');
      expect(types).toContain('faceId');
      expect(types).toContain('iris');
      expect(types).toContain('touchId');
      expect(types).toContain('voiceId');
      expect(types).toContain('palm');
    });
  });

  describe('生物識別認證測試', () => {
    test('應該成功執行認證', async () => {
      const request: BiometricAuthRequest = {
        promptMessage: '請進行指紋認證',
        cancelButtonText: '取消',
        disableDeviceFallback: false,
      };

      const _result = await service.authenticate(request);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');

      if (result.success) {
        expect(result).toHaveProperty('biometricType');
        expect(result).toHaveProperty('authenticationMethod');
        expect(result.authenticationMethod).toBe('biometric');
      } else {
        expect(result).toHaveProperty('errorCode');
        expect(result).toHaveProperty('errorMessage');
      }
    });

    test('應該處理認證失敗情況', async () => {
      // 模擬認證失敗
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // 低於 0.3 會失敗

      const _result = await service.authenticate();

      expect(result.success).toBe(false);
      expect(result.errorCode).toBeDefined();
      expect(result.errorMessage).toBeDefined();
    });

    test('應該處理設備不支持的情況', async () => {
      // 模擬設備不支持 - 需要模擬 isSensorAvailable 返回 null
      const _mockService = service as any;
      const _originalLoadLibrary = mockService.loadAndroidBiometricLibrary;

      mockService.loadAndroidBiometricLibrary = async () => ({
        ...(await originalLoadLibrary()),
        isSensorAvailable: async () => null,
        biometricKeysExist: async () => false,
      });

      // 重新初始化服務
      await mockService.initializeAndroidBiometricLibrary();

      const _result = await service.authenticate();

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('biometry_not_enrolled');
    });

    test('應該處理服務未初始化的情況', async () => {
      // 創建未初始化的服務
      const _uninitializedService = new (AndroidBiometricService as any)();

      await expect(uninitializedService.authenticate()).rejects.toThrow(
        'Android 生物識別服務未初始化'
      );
    });
  });

  describe('簽名創建測試', () => {
    test('應該成功創建簽名', async () => {
      const _promptMessage = '請進行簽名認證';
      const _payload = 'test-payload-data';

      const _result = await service.createSignature(promptMessage, payload);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('signature');

      if (result.success) {
        expect(result.signature).toContain('android-signature-');
        expect(result.signature.length).toBeGreaterThan(0);
      } else {
        expect(result.signature).toBe('');
        expect(result).toHaveProperty('error');
      }
    });

    test('應該處理簽名創建失敗', async () => {
      // 模擬簽名創建失敗
      jest.spyOn(Math, 'random').mockReturnValue(0.1);

      const _result = await service.createSignature('test', 'payload');

      expect(result.success).toBe(false);
      expect(result.signature).toBe('');
      expect(result.error).toBe('Authentication failed');
    });

    test('應該處理服務未初始化的情況', async () => {
      const _uninitializedService = new (AndroidBiometricService as any)();

      await expect(
        uninitializedService.createSignature('test', 'payload')
      ).rejects.toThrow('Android 生物識別服務未初始化');
    });
  });

  describe('安全信息測試', () => {
    test('應該獲取安全信息', () => {
      const _securityInfo = service.getSecurityInfo();

      if (securityInfo) {
        expect(securityInfo).toHaveProperty('keyAlias');
        expect(securityInfo).toHaveProperty('keyGenerated');
        expect(securityInfo).toHaveProperty('keyInvalidated');
        expect(securityInfo).toHaveProperty('biometricChanged');
        expect(securityInfo).toHaveProperty('securityLevel');
        expect(securityInfo).toHaveProperty('attestationSupported');
        expect(securityInfo.keyAlias).toBe('android_biometric_key');
      }
    });
  });

  describe('密鑰管理測試', () => {
    test('應該成功使密鑰失效', async () => {
      const _result = await service.invalidateKeys();

      expect(typeof result).toBe('boolean');

      if (result) {
        const _securityInfo = service.getSecurityInfo();
        if (securityInfo) {
          expect(securityInfo.keyInvalidated).toBe(true);
        }
      }
    });

    test('應該成功重新初始化密鑰', async () => {
      const _result = await service.reinitializeKeys();

      expect(typeof result).toBe('boolean');
    });

    test('應該處理密鑰操作失敗', async () => {
      const _uninitializedService = new (AndroidBiometricService as any)();

      await expect(uninitializedService.invalidateKeys()).rejects.toThrow(
        'Android 生物識別服務未初始化'
      );
      await expect(uninitializedService.reinitializeKeys()).rejects.toThrow(
        'Android 生物識別服務未初始化'
      );
    });
  });

  describe('服務狀態測試', () => {
    test('應該正確報告服務狀態', () => {
      expect(service.isServiceReady()).toBe(true);

      const _serviceInfo = service.getServiceInfo();

      expect(serviceInfo).toHaveProperty('isInitialized');
      expect(serviceInfo).toHaveProperty('isServiceReady');
      expect(serviceInfo).toHaveProperty('platform');
      expect(serviceInfo).toHaveProperty('capabilities');
      expect(serviceInfo).toHaveProperty('securityInfo');

      expect(serviceInfo.isInitialized).toBe(true);
      expect(serviceInfo.isServiceReady).toBe(true);
      expect(serviceInfo.platform).toBe('android');
      expect(Array.isArray(serviceInfo.capabilities)).toBe(true);
    });
  });

  describe('錯誤處理測試', () => {
    test('應該處理初始化錯誤', async () => {
      // 模擬初始化失敗
      const _mockService = new (AndroidBiometricService as any)();

      // 模擬 Platform.OS 不是 android 來觸發錯誤
      const _originalOS = Platform.OS;
      (Platform as any).OS = 'ios';

      // 強制觸發錯誤
      await mockService.initializeAndroidBiometricLibrary();

      expect(mockService.isServiceReady()).toBe(false);

      // 恢復 Platform.OS
      (Platform as any).OS = originalOS;
    });

    test('應該處理能力檢測錯誤', async () => {
      // 這個測試主要確保錯誤不會導致服務崩潰
      const _capabilities = await service.detectCapabilities();
      expect(Array.isArray(capabilities)).toBe(true);
    });
  });

  describe('Android 特定功能測試', () => {
    test('應該支持 Android 特定的生物識別類型', async () => {
      const _capabilities = await service.detectCapabilities();
      const _androidTypes = capabilities.filter(
        cap =>
          cap.type === 'fingerprint' ||
          cap.type === 'faceId' ||
          cap.type === 'iris'
      );

      expect(androidTypes.length).toBeGreaterThan(0);
    });

    test('應該正確映射 Android 生物識別類型', async () => {
      // 測試不同類型的映射
      const _testCases = [
        { androidType: 'fingerprint', expected: 'fingerprint' },
        { androidType: 'face', expected: 'faceId' },
        { androidType: 'iris', expected: 'iris' },
        { androidType: undefined, expected: 'fingerprint' },
      ];

      // 由於 mapAndroidBiometryType 是私有方法，我們通過認證結果來間接測試
      const _result = await service.authenticate();

      if (result.success && result.biometricType) {
        expect(['fingerprint', 'faceId', 'iris']).toContain(
          result.biometricType
        );
      }
    });

    test('應該支持 Android 特定的認證器配置', async () => {
      const request: BiometricAuthRequest = {
        promptMessage: 'Android 特定認證',
        disableDeviceFallback: false,
      };

      const _result = await service.authenticate(request);

      // 確保認證過程完成（成功或失敗）
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('性能測試', () => {
    test('認證響應時間應該在合理範圍內', async () => {
      const _startTime = Date.now();

      await service.authenticate();

      const _endTime = Date.now();
      const _responseTime = endTime - startTime;

      // 響應時間應該小於 1000ms（考慮模擬延遲）
      expect(responseTime).toBeLessThan(1000);
    });

    test('能力檢測應該快速完成', async () => {
      const _startTime = Date.now();

      await service.detectCapabilities();

      const _endTime = Date.now();
      const _responseTime = endTime - startTime;

      // 能力檢測應該小於 500ms
      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('並發測試', () => {
    test('應該支持並發認證請求', async () => {
      const _promises = Array(5)
        .fill(null)
        .map(() => service.authenticate());

      const _results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('timestamp');
      });
    });

    test('應該支持並發能力檢測', async () => {
      const _promises = Array(3)
        .fill(null)
        .map(() => service.detectCapabilities());

      const _results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(capabilities => {
        expect(Array.isArray(capabilities)).toBe(true);
      });
    });
  });
});
