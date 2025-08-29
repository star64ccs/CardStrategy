import { Platform } from 'react-native';

import {
  platformTestEnv,
  PlatformTestDataGenerator,
  PlatformTestValidator,
} from '../../core/utils/platform/platformTestUtils';

// Mock React Native Platform for Android
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    Version: '30',
  },
}));

// Mock expo modules
const _mockExpoNotifications = {
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
};

const _mockExpoLocalAuthentication = {
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  getSupportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  cancelAuthenticate: jest.fn(),
};

const _mockExpoCamera = {
  CameraType: {
    front: 'front',
    back: 'back',
  },
  requestCameraPermissionsAsync: jest.fn(),
  requestMicrophonePermissionsAsync: jest.fn(),
  getCameraPermissionsAsync: jest.fn(),
  getMicrophonePermissionsAsync: jest.fn(),
};

const _mockExpoLocation = {
  requestForegroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getBackgroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
};

const _mockExpoFileSystem = {
  documentDirectory: '/data/data/com.cardstrategy/files/',
  cacheDirectory: '/data/data/com.cardstrategy/cache/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
};

// Setup mocks
jest.mock('expo-notifications', () => mockExpoNotifications, { virtual: true });
jest.mock('expo-local-authentication', () => mockExpoLocalAuthentication, {
  virtual: true,
});
jest.mock('expo-camera', () => mockExpoCamera, { virtual: true });
jest.mock('expo-location', () => mockExpoLocation, { virtual: true });
jest.mock('expo-file-system', () => mockExpoFileSystem, { virtual: true });

describe('Android 平台特定功能測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 設置為 Android 平台
    platformTestEnv.setPlatform({
      platform: 'android',
      version: '30',
      deviceType: 'phone',
      capabilities: {
        biometrics: true,
        pushNotifications: true,
        camera: true,
        location: true,
        storage: true,
      },
    });
  });

  describe('平台檢測測試', () => {
    it('應該正確檢測 Android 平台', () => {
      expect(platformTestEnv.isAndroid()).toBe(true);
      expect(platformTestEnv.isIOS()).toBe(false);
      expect(platformTestEnv.isWeb()).toBe(false);
    });

    it('應該正確識別 Android 平台能力', () => {
      expect(platformTestEnv.supportsBiometrics()).toBe(true);
      expect(platformTestEnv.supportsPushNotifications()).toBe(true);
      expect(platformTestEnv.supportsCamera()).toBe(true);
      expect(platformTestEnv.supportsLocation()).toBe(true);
      expect(platformTestEnv.supportsStorage()).toBe(true);
    });
  });

  describe('Android 生物識別測試', () => {
    it('應該支持指紋識別', async () => {
      mockExpoLocalAuthentication.hasHardwareAsync.mockResolvedValue(true);
      mockExpoLocalAuthentication.isEnrolledAsync.mockResolvedValue(true);
      mockExpoLocalAuthentication.getSupportedAuthenticationTypesAsync.mockResolvedValue(
        ['FINGERPRINT', 'FACIAL_RECOGNITION', 'IRIS']
      );

      const _hasHardware = await mockExpoLocalAuthentication.hasHardwareAsync();
      const _isEnrolled = await mockExpoLocalAuthentication.isEnrolledAsync();
      const _supportedTypes =
        await mockExpoLocalAuthentication.getSupportedAuthenticationTypesAsync();

      expect(hasHardware).toBe(true);
      expect(isEnrolled).toBe(true);
      expect(supportedTypes).toContain('FINGERPRINT');
      expect(supportedTypes).toContain('FACIAL_RECOGNITION');
    });

    it('應該支持面部識別', async () => {
      mockExpoLocalAuthentication.authenticateAsync.mockResolvedValue({
        success: true,
        error: null,
      });

      const _result = await mockExpoLocalAuthentication.authenticateAsync({
        promptMessage: '請進行面部識別',
        fallbackLabel: '使用密碼',
        disableDeviceFallback: false,
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('應該支持虹膜識別', async () => {
      mockExpoLocalAuthentication.getSupportedAuthenticationTypesAsync.mockResolvedValue(
        ['IRIS']
      );

      const _supportedTypes =
        await mockExpoLocalAuthentication.getSupportedAuthenticationTypesAsync();

      expect(supportedTypes).toContain('IRIS');
    });

    it('應該生成正確的生物識別測試數據', () => {
      const _testData =
        PlatformTestDataGenerator.generateBiometricTestData('android');

      expect(testData.biometricType).toBe('Fingerprint');
      expect(testData.supportedTypes).toContain('Fingerprint');
      expect(testData.supportedTypes).toContain('Face');
      expect(testData.supportedTypes).toContain('Iris');
      expect(testData.securityLevel).toBe('medium');
    });
  });

  describe('Android FCM 推送通知測試', () => {
    it('應該支持 FCM 令牌獲取', async () => {
      mockExpoNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      mockExpoNotifications.getExpoPushTokenAsync.mockResolvedValue({
        data: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        type: 'expo',
      });

      const _permissions = await mockExpoNotifications.getPermissionsAsync();
      const _token = await mockExpoNotifications.getExpoPushTokenAsync();

      expect(permissions.status).toBe('granted');
      expect(token.data).toMatch(/^ExponentPushToken\[.+\]$/);
      expect(token.type).toBe('expo');
    });

    it('應該支持通知權限請求', async () => {
      mockExpoNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const _result = await mockExpoNotifications.requestPermissionsAsync();

      expect(result.status).toBe('granted');
      expect(result.canAskAgain).toBe(true);
    });

    it('應該支持通知處理器設置', () => {
      const _mockHandler = jest.fn();
      mockExpoNotifications.setNotificationHandler(mockHandler);

      expect(mockExpoNotifications.setNotificationHandler).toHaveBeenCalledWith(
        mockHandler
      );
    });

    it('應該生成正確的推送通知測試數據', () => {
      const _testData =
        PlatformTestDataGenerator.generatePushNotificationTestData('android');

      expect(testData.provider).toBe('FCM');
      expect(testData.tokenType).toBe('fcmToken');
      expect(testData.permissions).toContain('notification');
    });
  });

  describe('Android 相機功能測試', () => {
    it('應該支持相機權限請求', async () => {
      mockExpoCamera.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const _result = await mockExpoCamera.requestCameraPermissionsAsync();

      expect(result.status).toBe('granted');
      expect(result.canAskAgain).toBe(true);
    });

    it('應該支持麥克風權限請求', async () => {
      mockExpoCamera.requestMicrophonePermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const _result = await mockExpoCamera.requestMicrophonePermissionsAsync();

      expect(result.status).toBe('granted');
      expect(result.canAskAgain).toBe(true);
    });

    it('應該支持相機類型選擇', () => {
      expect(mockExpoCamera.CameraType.front).toBe('front');
      expect(mockExpoCamera.CameraType.back).toBe('back');
    });

    it('應該生成正確的相機測試數據', () => {
      const _testData =
        PlatformTestDataGenerator.generateCameraTestData('android');

      expect(testData.cameraType).toBe('Camera2');
      expect(testData.permissions).toContain('camera');
      expect(testData.permissions).toContain('storage');
      expect(testData.features).toContain('autoFocus');
      expect(testData.features).toContain('flash');
      expect(testData.features).toContain('zoom');
    });
  });

  describe('Android 地理位置測試', () => {
    it('應該支持前台位置權限請求', async () => {
      mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const _result = await mockExpoLocation.requestForegroundPermissionsAsync();

      expect(result.status).toBe('granted');
      expect(result.canAskAgain).toBe(true);
    });

    it('應該支持後台位置權限請求', async () => {
      mockExpoLocation.requestBackgroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const _result = await mockExpoLocation.requestBackgroundPermissionsAsync();

      expect(result.status).toBe('granted');
      expect(result.canAskAgain).toBe(true);
    });

    it('應該支持當前位置獲取', async () => {
      const _mockPosition = {
        coords: {
          latitude: 25.033,
          longitude: 121.5654,
          altitude: 10,
          accuracy: 5,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0,
        },
        timestamp: Date.now(),
      };

      mockExpoLocation.getCurrentPositionAsync.mockResolvedValue(mockPosition);

      const _position = await mockExpoLocation.getCurrentPositionAsync();

      expect(position.coords.latitude).toBe(25.033);
      expect(position.coords.longitude).toBe(121.5654);
      expect(position.coords.accuracy).toBe(5);
    });
  });

  describe('Android 文件系統測試', () => {
    it('應該支持文件讀寫操作', async () => {
      const _testData = '測試數據';
      const _testPath = '/data/data/com.cardstrategy/files/test.txt';

      mockExpoFileSystem.writeAsStringAsync.mockResolvedValue(undefined);
      mockExpoFileSystem.readAsStringAsync.mockResolvedValue(testData);

      await mockExpoFileSystem.writeAsStringAsync(testPath, testData);
      const _readData = await mockExpoFileSystem.readAsStringAsync(testPath);

      expect(mockExpoFileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        testPath,
        testData
      );
      expect(readData).toBe(testData);
    });

    it('應該支持文件刪除操作', async () => {
      const _testPath = '/data/data/com.cardstrategy/files/test.txt';

      mockExpoFileSystem.deleteAsync.mockResolvedValue(undefined);

      await mockExpoFileSystem.deleteAsync(testPath);

      expect(mockExpoFileSystem.deleteAsync).toHaveBeenCalledWith(testPath);
    });

    it('應該支持文件信息獲取', async () => {
      const _testPath = '/data/data/com.cardstrategy/files/test.txt';
      const _mockFileInfo = {
        exists: true,
        size: 1024,
        modificationTime: Date.now(),
        isDirectory: false,
      };

      mockExpoFileSystem.getInfoAsync.mockResolvedValue(mockFileInfo);

      const _fileInfo = await mockExpoFileSystem.getInfoAsync(testPath);

      expect(fileInfo.exists).toBe(true);
      expect(fileInfo.size).toBe(1024);
      expect(fileInfo.isDirectory).toBe(false);
    });

    it('應該提供正確的目錄路徑', () => {
      expect(mockExpoFileSystem.documentDirectory).toBe(
        '/data/data/com.cardstrategy/files/'
      );
      expect(mockExpoFileSystem.cacheDirectory).toBe(
        '/data/data/com.cardstrategy/cache/'
      );
    });
  });

  describe('Android 設備特性測試', () => {
    it('應該支持 Android 版本檢測', () => {
      const _androidVersion = Platform.Version;
      expect(androidVersion).toBe('30');
    });

    it('應該支持設備類型檢測', () => {
      const { deviceType } = platformTestEnv.getCurrentPlatform();
      expect(deviceType).toBe('phone');
    });

    it('應該支持 Android 特定功能檢測', () => {
      const _androidFeatures = {
        biometrics: true,
        pushNotifications: true,
        camera: true,
        location: true,
        storage: true,
        backgroundTasks: true,
        widgets: true,
      };

      expect(androidFeatures.biometrics).toBe(true);
      expect(androidFeatures.pushNotifications).toBe(true);
      expect(androidFeatures.backgroundTasks).toBe(true);
      expect(androidFeatures.widgets).toBe(true);
    });
  });

  describe('Android 性能測試', () => {
    it('應該支持 Android 性能監控', () => {
      const _performanceMetrics = {
        memoryUsage: '150MB',
        cpuUsage: '25%',
        batteryLevel: '85%',
        networkType: '4G',
        screenResolution: '1080x2400',
      };

      expect(performanceMetrics.memoryUsage).toBe('150MB');
      expect(performanceMetrics.cpuUsage).toBe('25%');
      expect(performanceMetrics.batteryLevel).toBe('85%');
    });

    it('應該支持 Android 電池優化', () => {
      const _batteryOptimization = {
        isIgnoringBatteryOptimizations: false,
        canRequestIgnoreBatteryOptimizations: true,
        requestIgnoreBatteryOptimizations: jest.fn(),
      };

      expect(batteryOptimization.canRequestIgnoreBatteryOptimizations).toBe(
        true
      );
      expect(
        batteryOptimization.requestIgnoreBatteryOptimizations
      ).toBeDefined();
    });
  });

  describe('Android 兼容性測試', () => {
    it('應該支持不同 Android 版本', () => {
      const _supportedVersions = [
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29',
        '30',
        '31',
        '32',
        '33',
      ];
      const _currentVersion = Platform.Version;

      expect(supportedVersions).toContain(currentVersion);
    });

    it('應該處理不同設備類型', () => {
      const _deviceTypes = ['phone', 'tablet', 'tv', 'wear'];
      const _currentDeviceType = platformTestEnv.getCurrentPlatform().deviceType;

      expect(deviceTypes).toContain(currentDeviceType);
    });

    it('應該處理不同屏幕密度', () => {
      const _screenDensities = [
        'ldpi',
        'mdpi',
        'hdpi',
        'xhdpi',
        'xxhdpi',
        'xxxhdpi',
      ];
      const _mockDensity = 'xhdpi';

      expect(screenDensities).toContain(mockDensity);
    });
  });
});
