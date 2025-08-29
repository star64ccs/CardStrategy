// 懶加載服務單元測試
import { LazyLoadServiceImpl } from '../services/lazyLoadService';
import { LazyLoadPriority, LazyLoadStrategy } from '../types/lazyLoading';

// 模擬 React 組件
const MockComponent: React.FC = () =>
  React.createElement('div', null, 'Mock Component');

// 模擬動態導入
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  lazy: jest.fn(importFunc => {
    return importFunc().then((module: unknown) => module.default || module);
  }),
}));

describe('LazyLoadService', () => {
  let service: LazyLoadServiceImpl;

  beforeEach(() => {
    // 重置單例
    (LazyLoadServiceImpl as any).instance = undefined;
    service = LazyLoadServiceImpl.getInstance();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('初始化', () => {
    it('應該正確初始化服務', async () => {
      await service.initialize();
      const _state = service.getState();

      expect(state.isInitialized).toBe(true);
      expect(state.activeLoads).toBe(0);
      expect(state.queuedLoads).toBe(0);
    });

    it('應該使用默認配置', async () => {
      await service.initialize();
      const _state = service.getState();

      expect(state.performanceMetrics.totalLoads).toBe(0);
      expect(state.performanceMetrics.successfulLoads).toBe(0);
      expect(state.performanceMetrics.failedLoads).toBe(0);
    });

    it('應該使用自定義配置', async () => {
      const _customConfig = {
        globalPreloadDistance: 200,
        globalTimeout: 60000,
        maxConcurrentLoads: 10,
      };

      await service.initialize(customConfig);
      const _state = service.getState();

      expect(state.isInitialized).toBe(true);
    });
  });

  describe('組件註冊和加載', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該正確註冊組件', () => {
      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.INTERSECTION_OBSERVER,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('test-component', config);

      // 驗證組件已註冊（通過嘗試加載來驗證）
      expect(() => service.loadComponent('test-component')).not.toThrow();
    });

    it('應該正確加載組件', async () => {
      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('test-component', config);

      // 模擬動態導入返回組件
      const _mockImport = jest
        .fn()
        .mockResolvedValue({ default: MockComponent });
      jest.doMock('./TestComponent', () => mockImport);

      const _component = await service.loadComponent('test-component');

      expect(component).toBeDefined();
    });

    it('應該處理組件加載錯誤', async () => {
      const _config = {
        path: './NonExistentComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('error-component', config);

      await expect(service.loadComponent('error-component')).rejects.toThrow();
    });

    it('應該支持組件緩存', async () => {
      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
        enableCache: true,
        cacheTime: 300000,
      };

      service.registerComponent('cached-component', config);

      // 模擬動態導入
      const _mockImport = jest
        .fn()
        .mockResolvedValue({ default: MockComponent });
      jest.doMock('./TestComponent', () => mockImport);

      // 第一次加載
      const _component1 = await service.loadComponent('cached-component');

      // 第二次加載應該從緩存
      const _component2 = await service.loadComponent('cached-component');

      expect(component1).toBe(component2);
    });
  });

  describe('圖片註冊和加載', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該正確註冊圖片', () => {
      const _config = {
        src: 'https://example.com/image.jpg',
        strategy: LazyLoadStrategy.INTERSECTION_OBSERVER,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerImage('test-image', config);

      expect(() => service.loadImage('test-image')).not.toThrow();
    });

    it('應該正確加載圖片', async () => {
      const _config = {
        src: 'https://picsum.photos/200/200',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerImage('test-image', config);

      const _image = await service.loadImage('test-image');

      expect(image).toBeInstanceOf(HTMLImageElement);
      expect(image.src).toBe(config.src);
    });

    it('應該處理圖片加載錯誤', async () => {
      const _config = {
        src: 'https://invalid-url.com/image.jpg',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
        timeout: 1000,
      };

      service.registerImage('error-image', config);

      await expect(service.loadImage('error-image')).rejects.toThrow();
    });

    it('應該支持圖片緩存', async () => {
      const _config = {
        src: 'https://picsum.photos/200/200',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
        enableCache: true,
        cacheTime: 300000,
      };

      service.registerImage('cached-image', config);

      // 第一次加載
      const _image1 = await service.loadImage('cached-image');

      // 第二次加載應該從緩存
      const _image2 = await service.loadImage('cached-image');

      expect(image1).toBe(image2);
    });
  });

  describe('數據註冊和加載', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該正確註冊數據', () => {
      const _config = {
        loader: async () => ({ data: 'test' }),
        strategy: LazyLoadStrategy.MANUAL,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerData('test-data', config);

      expect(() => service.loadData('test-data')).not.toThrow();
    });

    it('應該正確加載數據', async () => {
      const _testData = { id: 1, name: 'Test' };
      const _config = {
        loader: async () => testData,
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerData('test-data', config);

      const _data = await service.loadData('test-data');

      expect(data).toEqual(testData);
    });

    it('應該處理數據加載錯誤', async () => {
      const _config = {
        loader: async () => {
          throw new Error('Data loading failed');
        },
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerData('error-data', config);

      await expect(service.loadData('error-data')).rejects.toThrow(
        'Data loading failed'
      );
    });

    it('應該支持數據緩存', async () => {
      const _testData = { id: 1, name: 'Test' };
      const _config = {
        loader: async () => testData,
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
        enableCache: true,
        cacheTime: 300000,
      };

      service.registerData('cached-data', config);

      // 第一次加載
      const _data1 = await service.loadData('cached-data');

      // 第二次加載應該從緩存
      const _data2 = await service.loadData('cached-data');

      expect(data1).toBe(data2);
    });
  });

  describe('預加載功能', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該支持組件預加載', async () => {
      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.MANUAL,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('preload-component', config);

      // 模擬動態導入
      const _mockImport = jest
        .fn()
        .mockResolvedValue({ default: MockComponent });
      jest.doMock('./TestComponent', () => mockImport);

      await service.preloadComponent('preload-component');

      // 驗證預加載成功
      const _component = await service.loadComponent('preload-component');
      expect(component).toBeDefined();
    });

    it('應該支持圖片預加載', async () => {
      const _config = {
        src: 'https://picsum.photos/200/200',
        strategy: LazyLoadStrategy.MANUAL,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerImage('preload-image', config);

      await service.preloadImage('preload-image');

      // 驗證預加載成功
      const _image = await service.loadImage('preload-image');
      expect(image).toBeInstanceOf(HTMLImageElement);
    });

    it('應該支持數據預加載', async () => {
      const _testData = { id: 1, name: 'Test' };
      const _config = {
        loader: async () => testData,
        strategy: LazyLoadStrategy.MANUAL,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerData('preload-data', config);

      await service.preloadData('preload-data');

      // 驗證預加載成功
      const _data = await service.loadData('preload-data');
      expect(data).toEqual(testData);
    });
  });

  describe('緩存管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該清除特定資源緩存', async () => {
      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
        enableCache: true,
      };

      service.registerComponent('cache-test', config);

      // 模擬動態導入
      const _mockImport = jest
        .fn()
        .mockResolvedValue({ default: MockComponent });
      jest.doMock('./TestComponent', () => mockImport);

      // 加載組件
      await service.loadComponent('cache-test');

      // 清除緩存
      service.clearCache('cache-test');

      // 再次加載應該重新執行
      await service.loadComponent('cache-test');

      // 驗證加載次數
      const _metrics = service.getPerformanceMetrics();
      expect(metrics.totalLoads).toBe(2);
    });

    it('應該清除所有緩存', async () => {
      // 註冊多個資源
      const _componentConfig = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
        enableCache: true,
      };

      const _imageConfig = {
        src: 'https://picsum.photos/200/200',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
        enableCache: true,
      };

      service.registerComponent('cache-test-1', componentConfig);
      service.registerImage('cache-test-2', imageConfig);

      // 模擬動態導入
      const _mockImport = jest
        .fn()
        .mockResolvedValue({ default: MockComponent });
      jest.doMock('./TestComponent', () => mockImport);

      // 加載資源
      await service.loadComponent('cache-test-1');
      await service.loadImage('cache-test-2');

      // 清除所有緩存
      service.clearCache();

      const _state = service.getState();
      expect(state.cachedResources).toBe(0);
    });
  });

  describe('狀態管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該正確更新狀態', async () => {
      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('state-test', config);

      // 模擬動態導入
      const _mockImport = jest
        .fn()
        .mockResolvedValue({ default: MockComponent });
      jest.doMock('./TestComponent', () => mockImport);

      const _initialState = service.getState();
      expect(initialState.activeLoads).toBe(0);

      // 開始加載
      const _loadPromise = service.loadComponent('state-test');

      // 檢查加載中狀態
      const _loadingState = service.getState();
      expect(loadingState.activeLoads).toBe(1);

      // 等待加載完成
      await loadPromise;

      // 檢查完成狀態
      const _finalState = service.getState();
      expect(finalState.activeLoads).toBe(0);
      expect(finalState.performanceMetrics.successfulLoads).toBe(1);
    });

    it('應該正確暫停和恢復服務', () => {
      service.pause();
      let state = service.getState();
      expect(state.isPaused).toBe(true);

      service.resume();
      state = service.getState();
      expect(state.isPaused).toBe(false);
    });
  });

  describe('性能指標', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該正確記錄成功加載', async () => {
      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('metrics-test', config);

      // 模擬動態導入
      const _mockImport = jest
        .fn()
        .mockResolvedValue({ default: MockComponent });
      jest.doMock('./TestComponent', () => mockImport);

      await service.loadComponent('metrics-test');

      const _metrics = service.getPerformanceMetrics();
      expect(metrics.totalLoads).toBe(1);
      expect(metrics.successfulLoads).toBe(1);
      expect(metrics.failedLoads).toBe(0);
      expect(metrics.averageLoadTime).toBeGreaterThan(0);
    });

    it('應該正確記錄失敗加載', async () => {
      const _config = {
        path: './NonExistentComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('error-metrics-test', config);

      try {
        await service.loadComponent('error-metrics-test');
      } catch (error) {
        // 預期錯誤
      }

      const _metrics = service.getPerformanceMetrics();
      expect(metrics.totalLoads).toBe(1);
      expect(metrics.successfulLoads).toBe(0);
      expect(metrics.failedLoads).toBe(1);
    });

    it('應該正確記錄緩存命中', async () => {
      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
        enableCache: true,
      };

      service.registerComponent('cache-metrics-test', config);

      // 模擬動態導入
      const _mockImport = jest
        .fn()
        .mockResolvedValue({ default: MockComponent });
      jest.doMock('./TestComponent', () => mockImport);

      // 第一次加載
      await service.loadComponent('cache-metrics-test');

      // 第二次加載（應該命中緩存）
      await service.loadComponent('cache-metrics-test');

      const _metrics = service.getPerformanceMetrics();
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.cacheHitRate).toBeGreaterThan(0);
    });
  });

  describe('錯誤處理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('應該處理未註冊的資源', () => {
      expect(() => service.loadComponent('unregistered')).toThrow(
        "Component with id 'unregistered' not found"
      );
      expect(() => service.loadImage('unregistered')).toThrow(
        "Image with id 'unregistered' not found"
      );
      expect(() => service.loadData('unregistered')).toThrow(
        "Data with id 'unregistered' not found"
      );
    });

    it('應該處理加載超時', async () => {
      const _config = {
        src: 'https://slow-loading-image.com/image.jpg',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
        timeout: 100, // 很短的超時時間
      };

      service.registerImage('timeout-test', config);

      await expect(service.loadImage('timeout-test')).rejects.toThrow(
        'Image load timeout'
      );
    });

    it('應該處理取消加載', async () => {
      const _config = {
        path: './SlowComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('cancel-test', config);

      // 開始加載
      const _loadPromise = service.loadComponent('cancel-test');

      // 立即取消
      service.cancelLoad('cancel-test');

      // 應該被拒絕
      await expect(loadPromise).rejects.toThrow();
    });
  });

  describe('並發控制', () => {
    beforeEach(async () => {
      await service.initialize({
        maxConcurrentLoads: 2,
      });
    });

    it('應該限制並發加載數量', async () => {
      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      // 註冊多個組件
      for (let i = 0; i < 3; i++) {
        service.registerComponent(`concurrent-test-${i}`, config);
      }

      // 模擬動態導入
      const _mockImport = jest
        .fn()
        .mockResolvedValue({ default: MockComponent });
      jest.doMock('./TestComponent', () => mockImport);

      // 同時開始加載
      const _promises = [
        service.loadComponent('concurrent-test-0'),
        service.loadComponent('concurrent-test-1'),
        service.loadComponent('concurrent-test-2'),
      ];

      // 等待所有加載完成
      await Promise.all(promises);

      const _metrics = service.getPerformanceMetrics();
      expect(metrics.successfulLoads).toBe(3);
    });
  });
});
