import { Platform } from 'react-native';

import type { PWAServiceConfig } from '../services/pwaService';
import PWAService, { PWAServiceResult } from '../services/pwaService';

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
    controller: null,
  },
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    addEventListener: jest.fn(),
  },
};

const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const mockCaches = {
  keys: jest.fn(),
  open: jest.fn(),
  delete: jest.fn(),
};

const mockCache = {
  keys: jest.fn(),
  match: jest.fn(),
};

const mockResponse = {
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

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

Object.defineProperty(global, 'caches', {
  value: mockCaches,
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: {
    querySelector: jest.fn(),
    createElement: jest.fn(),
    head: {
      appendChild: jest.fn(),
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn(),
  },
  writable: true,
});

describe('PWAService', () => {
  let service: PWAService;
  let mockConfig: PWAServiceConfig;

  beforeEach(() => {
    // Reset singleton instance
    (PWAService as any).instance = undefined;
    service = PWAService.getInstance();
    mockConfig = {
      appName: 'CardStrategy PWA',
      appShortName: 'CardStrategy',
      appDescription: '卡片策略 PWA 應用',
      appVersion: '1.0.0',
      appThemeColor: '#2196F3',
      appBackgroundColor: '#FFFFFF',
      appDisplay: 'standalone',
      appOrientation: 'portrait',
      appScope: '/',
      appStartUrl: '/',
      appIcons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
      appScreenshots: [
        {
          src: '/screenshot.png',
          sizes: '1280x720',
          type: 'image/png',
        },
      ],
      appCategories: ['productivity', 'finance'],
      appLang: 'zh-TW',
      appDir: 'ltr',
      appPreferRelatedApplications: false,
      appRelatedApplications: [],
      appShortcuts: [],
      appProtocolHandlers: [],
      appFileHandlers: [],
      appShareTarget: {
        action: '/share',
        method: 'POST',
        params: {
          title: 'title',
          text: 'text',
          url: 'url',
        },
      },
      appCaptureLinks: 'new-client',
      appHandleLinks: 'preferred',
      appLaunchHandler: {
        client_mode: 'auto',
      },
      appDisplayOverride: ['standalone'],
      appEdgeSidePanel: {
        preferred_width: 400,
      },
      appNoteTaking: {
        new_note_url: '/new-note',
      },
      appWindowControlsOverlay: {
        enabled: true,
      },
      appTabStrip: {
        home_tab: {
          name: 'Home',
          icons: [],
        },
        new_tab_button: {
          enabled: true,
        },
      },
      appIsla: {
        enabled: false,
      },
      appLaunchQueue: {
        enabled: true,
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
    (mockNavigator.serviceWorker.register as jest.Mock).mockResolvedValue({
      addEventListener: jest.fn(),
    });

    (mockCaches.keys as jest.Mock).mockResolvedValue(['cache-1', 'cache-2']);
    (mockCaches.open as jest.Mock).mockResolvedValue(mockCache);
    (mockCache.keys as jest.Mock).mockResolvedValue([
      new Request('https://example.com'),
    ]);
    (mockCache.match as jest.Mock).mockResolvedValue(mockResponse);
    (mockResponse.blob as jest.Mock).mockResolvedValue(mockBlob);

    (document.querySelector as jest.Mock).mockReturnValue(null);
    (document.createElement as jest.Mock).mockReturnValue({
      rel: '',
      href: '',
      appendChild: jest.fn(),
    });
    (URL.createObjectURL as jest.Mock).mockReturnValue('blob:manifest-url');
  });

  describe('初始化測試', () => {
    test('應該成功初始化 PWA 服務', async () => {
      const result = await service.initialize(mockConfig);

      expect(result.success).toBe(true);
      expect(result.data).toBe('PWA 服務初始化成功');
      expect(service.isServiceReady()).toBe(true);
    });

    test('應該處理重複初始化', async () => {
      await service.initialize(mockConfig);
      const result = await service.initialize(mockConfig);

      expect(result.success).toBe(true);
      expect(result.data).toBe('PWA 服務已初始化');
    });

    test('應該處理非 Web 平台', async () => {
      const iosService = new (PWAService as any)();
      (Platform as any).OS = 'ios';

      const result = await iosService.initialize(mockConfig);

      expect(result.success).toBe(false);
      expect(result.error).toBe('PWA 服務僅支持 Web 平台');
      expect(result.errorCode).toBe('PLATFORM_NOT_SUPPORTED');

      // Reset Platform.OS
      (Platform as any).OS = 'web';
    });

    test('應該處理 Service Worker 不支持的情況', async () => {
      const noSwService = new (PWAService as any)();
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
      expect(result.errorCode).toBe('INITIALIZATION_FAILED');

      // Restore navigator
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });
  });

  describe('安裝管理測試', () => {
    beforeEach(async () => {
      await service.initialize(mockConfig);
    });

    test('應該獲取安裝狀態', () => {
      const status = service.getInstallStatus();

      expect(status).toEqual({
        isInstalled: false,
        canInstall: false,
      });
    });

    test('應該處理安裝 PWA', async () => {
      // Mock beforeinstallprompt event
      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn().mockResolvedValue({ outcome: 'accepted' }),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };

      // Simulate beforeinstallprompt event
      const beforeInstallHandler = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'beforeinstallprompt'
      )?.[1];

      if (beforeInstallHandler) {
        beforeInstallHandler(mockEvent);
      }

      const result = await service.installPWA();

      expect(result.success).toBe(true);
      expect(result.data).toBe('PWA 安裝成功');
    });

    test('應該處理無法安裝的情況', async () => {
      const result = await service.installPWA();

      expect(result.success).toBe(false);
      expect(result.error).toBe('無法安裝 PWA');
      expect(result.errorCode).toBe('CANNOT_INSTALL');
    });

    test('應該處理用戶取消安裝', async () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn(),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      };

      const beforeInstallHandler = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'beforeinstallprompt'
      )?.[1];

      if (beforeInstallHandler) {
        beforeInstallHandler(mockEvent);
      }

      const result = await service.installPWA();

      expect(result.success).toBe(false);
      expect(result.error).toBe('用戶取消安裝');
      expect(result.errorCode).toBe('USER_CANCELLED');
    });
  });

  describe('服務狀態測試', () => {
    beforeEach(async () => {
      await service.initialize(mockConfig);
    });

    test('應該獲取服務狀態', () => {
      const status = service.getServiceStatus();

      expect(status).toEqual({
        isServiceWorkerRegistered: true,
        isOffline: false,
        isOnline: true,
        networkType: '4g',
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
      });
    });

    test('應該獲取服務統計', () => {
      const stats = service.getServiceStats();

      expect(stats).toEqual({
        totalInstallations: 0,
        totalUninstallations: 0,
        totalUpdates: 0,
        averageInstallTime: 0,
        averageUpdateTime: 0,
        offlineUsageTime: 0,
        onlineUsageTime: 0,
        cacheHitRate: 0,
        serviceWorkerUpdates: 1,
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

    test('應該更新 PWA', async () => {
      const result = await service.updatePWA();

      expect(result.success).toBe(true);
      expect(result.data).toBe('PWA 更新成功');
    });

    test('應該處理更新失敗', async () => {
      // Mock navigator.serviceWorker.controller to throw error
      Object.defineProperty(mockNavigator.serviceWorker, 'controller', {
        get: () => ({
          postMessage: jest.fn().mockImplementation(() => {
            throw new Error('Update failed');
          }),
        }),
      });

      const result = await service.updatePWA();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
      expect(result.errorCode).toBe('UPDATE_FAILED');
    });
  });

  describe('緩存管理測試', () => {
    beforeEach(async () => {
      await service.initialize(mockConfig);
    });

    test('應該清除緩存', async () => {
      const result = await service.clearCache();

      expect(result.success).toBe(true);
      expect(result.data).toBe('緩存清除成功');
      expect(mockCaches.keys).toHaveBeenCalled();
      expect(mockCaches.delete).toHaveBeenCalledWith('cache-1');
      expect(mockCaches.delete).toHaveBeenCalledWith('cache-2');
    });

    test('應該獲取緩存信息', async () => {
      const result = await service.getCacheInfo();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        cacheNames: ['cache-1', 'cache-2'],
        totalSize: 2048, // 2 * 1024
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
        installStatus: {
          isInstalled: false,
          canInstall: false,
        },
        serviceStatus: {
          isServiceWorkerRegistered: true,
          isOffline: false,
          isOnline: true,
          networkType: '4g',
          effectiveType: '4g',
          downlink: 10,
          rtt: 50,
          saveData: false,
        },
        stats: {
          totalInstallations: 0,
          totalUninstallations: 0,
          totalUpdates: 0,
          averageInstallTime: 0,
          averageUpdateTime: 0,
          offlineUsageTime: 0,
          onlineUsageTime: 0,
          cacheHitRate: 0,
          serviceWorkerUpdates: 1,
        },
      });
    });
  });

  describe('錯誤處理測試', () => {
    test('應該處理服務未初始化的情況', async () => {
      const uninitializedService = new (PWAService as any)();

      await expect(uninitializedService.installPWA()).resolves.toEqual({
        success: false,
        error: 'PWA 服務未初始化',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      });

      await expect(uninitializedService.updatePWA()).resolves.toEqual({
        success: false,
        error: 'PWA 服務未初始化',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      });

      await expect(uninitializedService.clearCache()).resolves.toEqual({
        success: false,
        error: 'PWA 服務未初始化',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      });

      await expect(uninitializedService.getCacheInfo()).resolves.toEqual({
        success: false,
        error: 'PWA 服務未初始化',
        errorCode: 'SERVICE_NOT_INITIALIZED',
      });
    });

    test('應該處理初始化錯誤', async () => {
      (mockNavigator.serviceWorker.register as jest.Mock).mockRejectedValue(
        new Error('Registration failed')
      );

      const result = await service.initialize(mockConfig);

      expect(result.success).toBe(true); // Should still succeed as registration error is caught
    });
  });

  describe('網絡監控測試', () => {
    beforeEach(async () => {
      await service.initialize(mockConfig);
    });

    test('應該處理網絡狀態變化', () => {
      const onlineHandler = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'online'
      )?.[1];

      const offlineHandler = mockWindow.addEventListener.mock.calls.find(
        call => call[0] === 'offline'
      )?.[1];

      if (onlineHandler) {
        onlineHandler();
      }

      if (offlineHandler) {
        offlineHandler();
      }

      const status = service.getServiceStatus();
      expect(typeof status.isOnline).toBe('boolean');
      expect(typeof status.isOffline).toBe('boolean');
    });

    test('應該處理網絡信息更新', () => {
      const connectionHandler =
        mockNavigator.connection.addEventListener.mock.calls.find(
          call => call[0] === 'change'
        )?.[1];

      if (connectionHandler) {
        connectionHandler();
      }

      const status = service.getServiceStatus();
      expect(status.networkType).toBe('4g');
      expect(status.effectiveType).toBe('4g');
      expect(status.downlink).toBe(10);
      expect(status.rtt).toBe(50);
      expect(status.saveData).toBe(false);
    });
  });

  describe('單例模式測試', () => {
    test('應該返回相同的實例', () => {
      const instance1 = PWAService.getInstance();
      const instance2 = PWAService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Web 平台特定功能測試', () => {
    test('應該生成 Web App Manifest', async () => {
      await service.initialize(mockConfig);

      expect(document.createElement).toHaveBeenCalledWith('link');
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    test('應該註冊 Service Worker', async () => {
      await service.initialize(mockConfig);

      expect(mockNavigator.serviceWorker.register).toHaveBeenCalledWith(
        '/sw.js'
      );
    });

    test('應該處理 Service Worker 註冊失敗', async () => {
      (mockNavigator.serviceWorker.register as jest.Mock).mockRejectedValue(
        new Error('SW registration failed')
      );

      const result = await service.initialize(mockConfig);

      expect(result.success).toBe(true); // Should still succeed as SW registration error is caught
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
