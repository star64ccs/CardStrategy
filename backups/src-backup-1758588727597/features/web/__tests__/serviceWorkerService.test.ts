import { Platform } from 'react-native';

import type { ServiceWorkerConfig } from '../services/serviceWorkerService';
import ServiceWorkerService, {
  ServiceWorkerResult,
} from '../services/serviceWorkerService';

// Mock React Native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
  },
}));

// Mock Web APIs
const mockNavigator = {
  serviceWorker: {
    register: jest.fn(),
    addEventListener: jest.fn(),
    controller: null,
  },
};

const mockRegistration = {
  scriptURL: '/sw.js',
  scope: '/',
  active: null,
  waiting: null,
  installing: null,
  addEventListener: jest.fn(),
  update: jest.fn(),
};

const mockServiceWorker = {
  state: 'installing',
  addEventListener: jest.fn(),
  postMessage: jest.fn(),
};

const mockCaches = {
  keys: jest.fn(),
  open: jest.fn(),
  delete: jest.fn(),
};

const mockCache = {
  keys: jest.fn(),
  match: jest.fn(),
  put: jest.fn(),
  add: jest.fn(),
};

const mockResponse = {
  ok: true,
  blob: jest.fn(),
};

const mockBlob = {
  size: 1024,
};

// Mock global objects
Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true,
});

Object.defineProperty(global, 'caches', {
  value: mockCaches,
  writable: true,
});

Object.defineProperty(global, 'fetch', {
  value: jest.fn(),
  writable: true,
});

describe('ServiceWorkerService', () => {
  let service: ServiceWorkerService;
  let mockConfig: ServiceWorkerConfig;

  beforeEach(() => {
    // Reset singleton instance
    (ServiceWorkerService as any).instance = undefined;
    service = ServiceWorkerService.getInstance();
    mockConfig = {
      swPath: '/sw.js',
      scope: '/',
      updateViaCache: 'all',
      cacheName: 'cardstrategy-cache',
      cacheVersion: 'v1.0.0',
      cacheStrategies: [
        {
          name: 'static-assets',
          pattern: '/static/',
          strategy: 'cache-first',
          options: {
            cacheName: 'static-cache',
            maxAge: 86400,
            maxEntries: 100,
          },
        },
        {
          name: 'api-cache',
          pattern: '/api/',
          strategy: 'network-first',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 3,
          },
        },
      ],
      offlineFallback: '/offline.html',
      backgroundSync: {
        enabled: true,
        syncName: 'cardstrategy-sync',
        maxRetryAttempts: 3,
        retryDelay: 1000,
      },
      pushNotification: {
        enabled: true,
        vapidPublicKey: 'test-public-key',
        vapidPrivateKey: 'test-private-key',
        defaultPayload: {
          title: 'CardStrategy',
          body: '新消息',
          icon: '/icon.png',
          badge: '/badge.png',
          tag: 'cardstrategy-notification',
          data: {},
        },
      },
      periodicSync: {
        enabled: false,
        syncName: 'cardstrategy-periodic',
        minInterval: 86400,
        maxInterval: 604800,
      },
      contentIndex: {
        enabled: false,
        entries: [],
      },
    };

    // Reset mocks
    jest.clearAllMocks();

    // Reset Platform.OS to web
    (Platform as any).OS = 'web';

    // Reset global navigator
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    // Setup default mock implementations
    (mockNavigator.serviceWorker.register as jest.Mock).mockResolvedValue(
      mockRegistration
    );

    (mockCaches.keys as jest.Mock).mockResolvedValue([
      'cardstrategy-cache-v1.0.0',
    ]);
    (mockCaches.open as jest.Mock).mockResolvedValue(mockCache);
    (mockCache.keys as jest.Mock).mockResolvedValue([
      new Request('https://example.com'),
    ]);
    (mockCache.match as jest.Mock).mockResolvedValue(mockResponse);
    (mockResponse.blob as jest.Mock).mockResolvedValue(mockBlob);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      clone: () => ({ ok: true }),
    });
  });

  describe('初始化測試', () => {
    test('應該成功初始化 Service Worker 服務', async () => {
      const result = await service.initialize(mockConfig);

      expect(result.success).toBe(true);
      expect(result.data).toBe('Service Worker 服務初始化成功');
      expect(service.isServiceReady()).toBe(true);
    });

    test('應該處理重複初始化', async () => {
      await service.initialize(mockConfig);
      const result = await service.initialize(mockConfig);

      expect(result.success).toBe(true);
      expect(result.data).toBe('Service Worker 服務已初始化');
    });

    test('應該處理非 Web 平台', async () => {
      const iosService = new (ServiceWorkerService as any)();
      (Platform as any).OS = 'ios';

      const result = await iosService.initialize(mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service Worker 服務僅支持 Web 平台');
      expect(result.errorCode).toBe('PLATFORM_NOT_SUPPORTED');

      // Reset Platform.OS
      (Platform as any).OS = 'web';
    });

    test('應該處理 Service Worker 不支持的情況', async () => {
      const noSwService = new (ServiceWorkerService as any)();
      const originalNavigator = global.navigator;

      Object.defineProperty(global, 'navigator', {
        value: { ...mockNavigator },
        writable: true,
      });

      // Remove serviceWorker property to simulate unsupported environment
      delete (global.navigator as any).serviceWorker;

      const result = await noSwService.initialize(mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service Worker 不支持');
      expect(result.errorCode).toBe('SERVICE_WORKER_NOT_SUPPORTED');

      // Restore navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });

    test('應該處理註冊失敗', async () => {
      (mockNavigator.serviceWorker.register as jest.Mock).mockRejectedValue(
        new Error('Registration failed')
      );

      const result = await service.initialize(mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Registration failed');
      expect(result.errorCode).toBe('INITIALIZATION_FAILED');
    });
  });

  describe('Service Worker 狀態測試', () => {
    beforeEach(async () => {
      await service.initialize(mockConfig);
    });

    test('應該獲取 Service Worker 狀態', () => {
      const status = service.getServiceWorkerStatus();

      expect(status).toEqual({
        isRegistered: true,
        isActive: false,
        isControlling: false,
        isInstalling: false,
        isWaiting: false,
        scriptURL: '/sw.js',
        scope: '/',
        state: 'redundant',
        updateTime: 0,
      });
    });

    test('應該獲取服務統計', () => {
      const stats = service.getServiceStats();

      expect(stats).toEqual({
        totalRegistrations: 1,
        totalUpdates: 0,
        totalActivations: 0,
        totalErrors: 0,
        averageUpdateTime: 0,
        cacheHitRate: 0,
        offlineUsageTime: 0,
        backgroundSyncCount: 0,
        pushNotificationCount: 0,
      });
    });

    test('應該檢查服務就緒狀態', () => {
      expect(service.isServiceReady()).toBe(true);
    });
  });

  describe('更新管理測試', () => {
    beforeEach(async () => {
      await service.initialize(mockConfig);
    });

    test('應該更新 Service Worker', async () => {
      const result = await service.updateServiceWorker();

      expect(result.success).toBe(true);
      expect(result.data).toBe('Service Worker 更新成功');
      expect(mockRegistration.update).toHaveBeenCalled();
    });

    test('應該處理更新失敗', async () => {
      (mockRegistration.update as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const result = await service.updateServiceWorker();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
      expect(result.errorCode).toBe('UPDATE_FAILED');
    });

    test('應該跳過等待', async () => {
      // Mock waiting service worker
      mockRegistration.waiting = mockServiceWorker;

      const result = await service.skipWaiting();

      expect(result.success).toBe(true);
      expect(result.data).toBe('跳過等待成功');
      expect(mockServiceWorker.postMessage).toHaveBeenCalledWith({
        type: 'SKIP_WAITING',
      });
    });

    test('應該處理沒有等待中的 Service Worker', async () => {
      mockRegistration.waiting = null;

      const result = await service.skipWaiting();

      expect(result.success).toBe(false);
      expect(result.error).toBe('沒有等待中的 Service Worker');
      expect(result.errorCode).toBe('NO_WAITING_WORKER');
    });
  });

  describe('緩存管理測試', () => {
    beforeEach(async () => {
      await service.initialize(mockConfig);
    });

    test('應該緩存單個 URL', async () => {
      const result = await service.cacheUrl('https://example.com/test');

      expect(result.success).toBe(true);
      expect(result.cachedUrls).toContain('https://example.com/test');
      expect(result.failedUrls).toHaveLength(0);
      expect(result.cacheName).toBe('cardstrategy-cache-v1.0.0');
    });

    test('應該處理緩存失敗', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        clone: () => ({ ok: false }),
      });

      const result = await service.cacheUrl('https://example.com/fail');

      expect(result.success).toBe(false);
      expect(result.cachedUrls).toHaveLength(0);
      expect(result.failedUrls).toContain('https://example.com/fail');
    });

    test('應該批量緩存 URL', async () => {
      const urls = [
        'https://example.com/test1',
        'https://example.com/test2',
        'https://example.com/test3',
      ];

      const result = await service.cacheUrls(urls);

      expect(result.success).toBe(true);
      expect(result.cachedUrls).toHaveLength(3);
      expect(result.failedUrls).toHaveLength(0);
    });

    test('應該清除緩存', async () => {
      const result = await service.clearCache();

      expect(result.success).toBe(true);
      expect(result.data).toBe('緩存清除成功');
      expect(mockCaches.keys).toHaveBeenCalled();
      expect(mockCaches.delete).toHaveBeenCalledWith(
        'cardstrategy-cache-v1.0.0'
      );
    });

    test('應該獲取緩存信息', async () => {
      const result = await service.getCacheInfo();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        cacheNames: ['cardstrategy-cache-v1.0.0'],
        totalSize: 1024,
      });
    });

    test('應該處理緩存清除失敗', async () => {
      (mockCaches.keys as jest.Mock).mockRejectedValue(
        new Error('Cache error')
      );

      const result = await service.clearCache();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cache error');
      expect(result.errorCode).toBe('CACHE_CLEAR_FAILED');
    });

    test('應該處理獲取緩存信息失敗', async () => {
      (mockCaches.keys as jest.Mock).mockRejectedValue(
        new Error('Cache info error')
      );

      const result = await service.getCacheInfo();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cache info error');
      expect(result.errorCode).toBe('CACHE_INFO_FAILED');
    });
  });

  describe('服務信息測試', () => {
    beforeEach(async () => {
      await service.initialize(mockConfig);
    });

    test('應該獲取服務信息', () => {
      const info = service.getServiceInfo();

      expect(info.success).toBe(true);
      expect(info.data).toEqual({
        isInitialized: true,
        platform: 'web',
        config: mockConfig,
        status: {
          isRegistered: true,
          isActive: false,
          isControlling: false,
          isInstalling: false,
          isWaiting: false,
          scriptURL: '/sw.js',
          scope: '/',
          state: 'redundant',
          updateTime: 0,
        },
        stats: {
          totalRegistrations: 1,
          totalUpdates: 0,
          totalActivations: 0,
          totalErrors: 0,
          averageUpdateTime: 0,
          cacheHitRate: 0,
          offlineUsageTime: 0,
          backgroundSyncCount: 0,
          pushNotificationCount: 0,
        },
      });
    });
  });

  describe('錯誤處理測試', () => {
    test('應該處理服務未初始化的情況', async () => {
      const uninitializedService = new (ServiceWorkerService as any)();

      await expect(uninitializedService.updateServiceWorker()).resolves.toEqual(
        {
          success: false,
          error: 'Service Worker 服務未初始化',
          errorCode: 'SERVICE_NOT_INITIALIZED',
        }
      );

      await expect(uninitializedService.skipWaiting()).resolves.toEqual({
        success: false,
        error: 'Service Worker 服務未初始化',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      });

      await expect(uninitializedService.clearCache()).resolves.toEqual({
        success: false,
        error: 'Service Worker 服務未初始化',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      });

      await expect(uninitializedService.getCacheInfo()).resolves.toEqual({
        success: false,
        error: 'Service Worker 服務未初始化',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      });
    });

    test('應該處理緩存 URL 時服務未初始化', async () => {
      const uninitializedService = new (ServiceWorkerService as any)();

      await expect(
        uninitializedService.cacheUrl('https://example.com')
      ).rejects.toThrow('Service Worker 服務未初始化');
      await expect(
        uninitializedService.cacheUrls(['https://example.com'])
      ).rejects.toThrow('Service Worker 服務未初始化');
    });
  });

  describe('事件處理測試', () => {
    beforeEach(async () => {
      await service.initialize(mockConfig);
    });

    test('應該處理 Service Worker 消息', () => {
      const messageHandler =
        mockNavigator.serviceWorker.addEventListener.mock.calls.find(
          call => call[0] === 'message'
        )?.[1];

      if (messageHandler) {
        messageHandler({
          data: {
            type: 'CACHE_HIT',
            data: { hitRate: 0.8 },
          },
        });

        messageHandler({
          data: {
            type: 'OFFLINE_USAGE',
            data: { duration: 5000 },
          },
        });

        messageHandler({
          data: {
            type: 'BACKGROUND_SYNC',
            data: {},
          },
        });

        messageHandler({
          data: {
            type: 'PUSH_NOTIFICATION',
            data: {},
          },
        });

        messageHandler({
          data: {
            type: 'UPDATE_TIME',
            data: { updateTime: 1000 },
          },
        });
      }

      const stats = service.getServiceStats();
      expect(stats.cacheHitRate).toBe(0.4); // (0 + 0.8) / 2
      expect(stats.offlineUsageTime).toBe(5000);
      expect(stats.backgroundSyncCount).toBe(1);
      expect(stats.pushNotificationCount).toBe(1);
      expect(stats.averageUpdateTime).toBe(500); // (0 + 1000) / 2
    });

    test('應該處理控制器變化', () => {
      const controllerChangeHandler =
        mockNavigator.serviceWorker.addEventListener.mock.calls.find(
          call => call[0] === 'controllerchange'
        )?.[1];

      if (controllerChangeHandler) {
        controllerChangeHandler();
      }

      const status = service.getServiceWorkerStatus();
      expect(status.isControlling).toBe(true);
    });

    test('應該處理 Service Worker 錯誤', () => {
      const errorHandler =
        mockNavigator.serviceWorker.addEventListener.mock.calls.find(
          call => call[0] === 'error'
        )?.[1];

      if (errorHandler) {
        errorHandler(new Error('Test error'));
      }

      const stats = service.getServiceStats();
      expect(stats.totalErrors).toBe(1);
    });
  });

  describe('緩存策略測試', () => {
    beforeEach(async () => {
      await service.initialize(mockConfig);
    });

    test('應該初始化緩存策略', async () => {
      // 測試預緩存資源
      expect(mockCache.add).toHaveBeenCalledWith('/offline.html');
    });

    test('應該清理舊版本緩存', async () => {
      const cleanupService = new (ServiceWorkerService as any)();

      (mockCaches.keys as jest.Mock).mockResolvedValue([
        'cardstrategy-cache-v0.9.0',
        'cardstrategy-cache-v1.0.0',
        'other-cache',
      ]);

      await cleanupService.initialize(mockConfig);

      expect(mockCaches.delete).toHaveBeenCalledWith(
        'cardstrategy-cache-v0.9.0'
      );
      expect(mockCaches.delete).not.toHaveBeenCalledWith(
        'cardstrategy-cache-v1.0.0'
      );
      expect(mockCaches.delete).not.toHaveBeenCalledWith('other-cache');
    });
  });

  describe('單例模式測試', () => {
    test('應該返回相同的實例', () => {
      const instance1 = ServiceWorkerService.getInstance();
      const instance2 = ServiceWorkerService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Web 平台特定功能測試', () => {
    test('應該註冊 Service Worker', async () => {
      await service.initialize(mockConfig);

      expect(mockNavigator.serviceWorker.register).toHaveBeenCalledWith(
        '/sw.js',
        {
          scope: '/',
          updateViaCache: 'all',
        }
      );
    });

    test('應該設置事件監聽器', async () => {
      await service.initialize(mockConfig);

      expect(mockNavigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
      expect(mockNavigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
        'controllerchange',
        expect.any(Function)
      );
      expect(mockNavigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });
  });

  describe('性能測試', () => {
    test('應該高效處理多次初始化', async () => {
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        await service.initialize(mockConfig);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('應該高效處理緩存操作', async () => {
      await service.initialize(mockConfig);

      const startTime = Date.now();
      await service.getCacheInfo();
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe('並發操作測試', () => {
    test('應該支持並發初始化', async () => {
      const promises = Array(5)
        .fill(null)
        .map(() => service.initialize(mockConfig));

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    test('應該支持並發緩存操作', async () => {
      await service.initialize(mockConfig);

      const promises = [
        service.getCacheInfo(),
        service.clearCache(),
        service.getCacheInfo(),
      ];

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(typeof result.success).toBe('boolean');
      });
    });
  });
});
