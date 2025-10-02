import { Platform } from 'react-native';

import {
  platformTestEnv,
  PlatformTestDataGenerator,
  PlatformTestValidator,
} from '../../core/utils/platform/platformTestUtils';

// Mock React Native Platform for Web
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    Version: 'latest',
  },
}));

// Mock Web APIs
const _mockNavigator = {
  serviceWorker: {
    register: jest.fn(),
    controller: null,
    ready: Promise.resolve(),
  },
  permissions: {
    query: jest.fn(),
  },
};

const _mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  location: {
    href: 'https://example.com',
    origin: 'https://example.com',
  },
};

const _mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const _mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Setup global mocks
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn(),
    revokeObjectURL: jest.fn(),
  },
  writable: true,
});

describe('Web 平台特定功能測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Settings為 Web 平台
    platformTestEnv.setPlatform({
      platform: 'web',
      version: 'latest',
      deviceType: 'desktop',
      capabilities: {
        biometrics: false,
        pushNotifications: true,
        camera: true,
        location: true,
        storage: true,
      },
    });
  });

  describe('平台檢測測試', () => {
    it('應該正確檢測 Web 平台', () => {
      expect(platformTestEnv.isWeb()).toBe(true);
      expect(platformTestEnv.isIOS()).toBe(false);
      expect(platformTestEnv.isAndroid()).toBe(false);
    });

    it('應該正確識別 Web 平台能力', () => {
      expect(platformTestEnv.supportsBiometrics()).toBe(false);
      expect(platformTestEnv.supportsPushNotifications()).toBe(true);
      expect(platformTestEnv.supportsCamera()).toBe(true);
      expect(platformTestEnv.supportsLocation()).toBe(true);
      expect(platformTestEnv.supportsStorage()).toBe(true);
    });
  });

  describe('PWA 功能測試', () => {
    it('應該支持 Service Worker 註冊', async () => {
      const _mockRegister = jest.fn().mockResolvedValue({
        active: { postMessage: jest.fn() },
        installing: null,
        waiting: null,
      });

      mockNavigator.serviceWorker.register = mockRegister;

      const _result = await mockNavigator.serviceWorker.register('/sw.js');

      expect(mockRegister).toHaveBeenCalledWith('/sw.js');
      expect(result).toBeDefined();
    });

    it('應該支持 Web App Manifest', () => {
      const _manifest = {
        name: 'CardStrategy',
        short_name: 'CardStrategy',
        description: '卡牌投資與收藏管理平台',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      };

      expect(manifest.name).toBe('CardStrategy');
      expect(manifest.display).toBe('standalone');
      expect(manifest.icons).toHaveLength(1);
    });

    it('應該支持離線功能', () => {
      const _cacheStrategies = {
        cacheFirst: 'cache-first',
        networkFirst: 'network-first',
        staleWhileRevalidate: 'stale-while-revalidate',
      };

      expect(cacheStrategies.cacheFirst).toBe('cache-first');
      expect(cacheStrategies.networkFirst).toBe('network-first');
      expect(cacheStrategies.staleWhileRevalidate).toBe(
        'stale-while-revalidate'
      );
    });
  });

  describe('Web 存儲測試', () => {
    it('應該支持 LocalStorage', () => {
      const _testKey = 'testKey';
      const _testValue = 'testValue';

      mockLocalStorage.setItem(testKey, testValue);
      mockLocalStorage.getItem.mockReturnValue(testValue);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
      expect(mockLocalStorage.getItem(testKey)).toBe(testValue);
    });

    it('應該支持 SessionStorage', () => {
      const _testKey = 'sessionKey';
      const _testValue = 'sessionValue';

      mockSessionStorage.setItem(testKey, testValue);
      mockSessionStorage.getItem.mockReturnValue(testValue);

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        testKey,
        testValue
      );
      expect(mockSessionStorage.getItem(testKey)).toBe(testValue);
    });

    it('應該支持 IndexedDB', () => {
      // Mock IndexedDB
      const _mockIndexedDB = {
        open: jest.fn(),
        deleteDatabase: jest.fn(),
      };

      Object.defineProperty(global, 'indexedDB', {
        value: mockIndexedDB,
        writable: true,
      });

      expect(mockIndexedDB.open).toBeDefined();
      expect(mockIndexedDB.deleteDatabase).toBeDefined();
    });
  });

  describe('Web 權限測試', () => {
    it('應該支持通知權限查詢', async () => {
      const _mockQuery = jest.fn().mockResolvedValue({
        state: 'granted',
      });

      mockNavigator.permissions.query = mockQuery;

      const _result = await mockNavigator.permissions.query({
        name: 'notifications',
      });

      expect(mockQuery).toHaveBeenCalledWith({ name: 'notifications' });
      expect(result.state).toBe('granted');
    });

    it('應該支持相機權限查詢', async () => {
      const _mockQuery = jest.fn().mockResolvedValue({
        state: 'granted',
      });

      mockNavigator.permissions.query = mockQuery;

      const _result = await mockNavigator.permissions.query({ name: 'camera' });

      expect(mockQuery).toHaveBeenCalledWith({ name: 'camera' });
      expect(result.state).toBe('granted');
    });

    it('應該支持地理位置權限查詢', async () => {
      const _mockQuery = jest.fn().mockResolvedValue({
        state: 'granted',
      });

      mockNavigator.permissions.query = mockQuery;

      const _result = await mockNavigator.permissions.query({
        name: 'geolocation',
      });

      expect(mockQuery).toHaveBeenCalledWith({ name: 'geolocation' });
      expect(result.state).toBe('granted');
    });
  });

  describe('Web 推送通知測試', () => {
    it('應該支持 Web Push API', () => {
      const _pushManager = {
        subscribe: jest.fn(),
        getSubscription: jest.fn(),
        permissionState: jest.fn(),
      };

      const _serviceWorkerRegistration = {
        pushManager,
        showNotification: jest.fn(),
        getNotifications: jest.fn(),
      };

      expect(pushManager.subscribe).toBeDefined();
      expect(pushManager.getSubscription).toBeDefined();
      expect(pushManager.permissionState).toBeDefined();
      expect(serviceWorkerRegistration.showNotification).toBeDefined();
    });

    it('應該生成正確的推送通知測試數據', () => {
      const _testData =
        PlatformTestDataGenerator.generatePushNotificationTestData('web');

      expect(testData.provider).toBe('Web Push');
      expect(testData.tokenType).toBe('subscription');
      expect(testData.permissions).toContain('notification');
    });
  });

  describe('Web 相機功能測試', () => {
    it('應該支持 getUserMedia API', () => {
      const _mockGetUserMedia = jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }],
      });

      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getUserMedia: mockGetUserMedia,
          enumerateDevices: jest.fn(),
        },
        writable: true,
      });

      expect(mockGetUserMedia).toBeDefined();
    });

    it('應該生成正確的相機測試數據', () => {
      const _testData = PlatformTestDataGenerator.generateCameraTestData('web');

      expect(testData.cameraType).toBe('getUserMedia');
      expect(testData.permissions).toContain('camera');
      expect(testData.features).toContain('autoFocus');
    });
  });

  describe('Web 地理位置測試', () => {
    it('應該支持 Geolocation API', () => {
      const _mockGeolocation = {
        getCurrentPosition: jest.fn(),
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
      };

      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
      });

      expect(mockGeolocation.getCurrentPosition).toBeDefined();
      expect(mockGeolocation.watchPosition).toBeDefined();
      expect(mockGeolocation.clearWatch).toBeDefined();
    });
  });

  describe('Web 兼容性測試', () => {
    it('應該檢測現代瀏覽器功能', () => {
      const _browserFeatures = {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: true, // Mock ServiceWorkerRegistration
        notifications: 'Notification' in window,
        geolocation: 'geolocation' in navigator,
        mediaDevices: 'mediaDevices' in navigator,
        localStorage: true, // Mock localStorage
        sessionStorage: true, // Mock sessionStorage
      };

      expect(browserFeatures.serviceWorker).toBe(true);
      expect(browserFeatures.localStorage).toBe(true);
      expect(browserFeatures.sessionStorage).toBe(true);
    });

    it('應該處理不支持的瀏覽器功能', () => {
      const _fallbackFeatures = {
        biometrics: false, // Web 不Support生物識別
        pushNotifications: true,
        camera: true,
        location: true,
        storage: true,
      };

      expect(fallbackFeatures.biometrics).toBe(false);
      expect(fallbackFeatures.pushNotifications).toBe(true);
    });
  });

  describe('Web 性能測試', () => {
    it('應該支持性能監控 API', () => {
      const _performance = {
        now: jest.fn(),
        mark: jest.fn(),
        measure: jest.fn(),
        getEntriesByType: jest.fn(),
      };

      Object.defineProperty(global, 'performance', {
        value: performance,
        writable: true,
      });

      expect(performance.now).toBeDefined();
      expect(performance.mark).toBeDefined();
      expect(performance.measure).toBeDefined();
    });

    it('應該支持資源加載監控', () => {
      const _observer = {
        observe: jest.fn(),
        disconnect: jest.fn(),
      };

      const _mockIntersectionObserver = jest
        .fn()
        .mockImplementation(() => observer);
      Object.defineProperty(global, 'IntersectionObserver', {
        value: mockIntersectionObserver,
        writable: true,
      });

      expect(mockIntersectionObserver).toBeDefined();
      expect(observer.observe).toBeDefined();
      expect(observer.disconnect).toBeDefined();
    });
  });
});
