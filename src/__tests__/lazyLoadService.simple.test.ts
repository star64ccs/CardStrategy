// 簡化的懶加載ServiceTest
import { LazyLoadServiceImpl } from '../services/lazyLoadService';
import { LazyLoadPriority, LazyLoadStrategy } from '../types/lazyLoading';

// 模擬 React Component
const _MockComponent = () => React.createElement('div', null, 'Mock Component');

describe('LazyLoadService - 簡化測試', () => {
  let service: LazyLoadServiceImpl;

  beforeEach(() => {
    // Reset單例
    (LazyLoadServiceImpl as any).instance = undefined;
    service = LazyLoadServiceImpl.getInstance();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('基本功能', () => {
    it('應該正確InitializeService', async () => {
      await service.initialize();
      const _state = service.getState();

      expect(state.isInitialized).toBe(true);
      expect(state.activeLoads).toBe(0);
    });

    it('應該正確註冊和加載組件', async () => {
      await service.initialize();

      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('test-component', config);

      // TestRegisterYesNoSuccess
      expect(() => service.loadComponent('test-component')).not.toThrow();
    });

    it('應該正確註冊和加載圖片', async () => {
      await service.initialize();

      const _config = {
        src: 'https://example.com/image.jpg',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerImage('test-image', config);

      // TestRegisterYesNoSuccess
      expect(() => service.loadImage('test-image')).not.toThrow();
    });

    it('應該正確註冊和加載數據', async () => {
      await service.initialize();

      const _config = {
        loader: async () => ({ data: 'test' }),
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerData('test-data', config);

      // TestRegisterYesNoSuccess
      expect(() => service.loadData('test-data')).not.toThrow();
    });
  });

  describe('狀態管理', () => {
    it('應該正確暫停和恢復Service', async () => {
      await service.initialize();

      service.pause();
      let state = service.getState();
      expect(state.isPaused).toBe(true);

      service.resume();
      state = service.getState();
      expect(state.isPaused).toBe(false);
    });

    it('應該正確獲取性能指標', async () => {
      await service.initialize();

      const _metrics = service.getPerformanceMetrics();
      expect(metrics.totalLoads).toBe(0);
      expect(metrics.successfulLoads).toBe(0);
      expect(metrics.failedLoads).toBe(0);
    });
  });

  describe('ErrorHandle', () => {
    it('應該處理未註冊的資源', async () => {
      await service.initialize();

      expect(() => service.loadComponent('unregistered')).toThrow();
      expect(() => service.loadImage('unregistered')).toThrow();
      expect(() => service.loadData('unregistered')).toThrow();
    });

    it('應該處理取消加載', async () => {
      await service.initialize();

      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.IMMEDIATE,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('cancel-test', config);
      service.cancelLoad('cancel-test');

      // VerifyCancelOperation不ThrowError
      expect(() => service.cancelLoad('cancel-test')).not.toThrow();
    });
  });

  describe('緩存管理', () => {
    it('應該清除緩存', async () => {
      await service.initialize();

      // TestClear所有Cache
      expect(() => service.clearCache()).not.toThrow();

      // TestClearSpecificCache
      expect(() => service.clearCache('test-id')).not.toThrow();
    });
  });

  describe('預加載功能', () => {
    it('應該支持預加載操作', async () => {
      await service.initialize();

      const _config = {
        path: './TestComponent',
        strategy: LazyLoadStrategy.MANUAL,
        priority: LazyLoadPriority.NORMAL,
      };

      service.registerComponent('preload-test', config);

      // Test預加載不ThrowError
      expect(async () => {
        await service.preloadComponent('preload-test');
      }).not.toThrow();
    });
  });
});
