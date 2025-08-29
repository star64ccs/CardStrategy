/**
 * 服務初始化優化器測試
 */

import { serviceInitializationOptimizer } from '../../../core/config/serviceInitializationOptimizer';

// Mock 服務
const _mockService1 = {
  initialize: jest.fn().mockResolvedValue(true),
  isServiceAvailable: jest.fn().mockReturnValue(false),
};

const _mockService2 = {
  initialize: jest.fn().mockResolvedValue(true),
  isServiceAvailable: jest.fn().mockReturnValue(false),
};

const _mockService3 = {
  initialize: jest.fn().mockResolvedValue(true),
  isServiceAvailable: jest.fn().mockReturnValue(false),
};

describe('ServiceInitializationOptimizer', () => {
  beforeEach(() => {
    serviceInitializationOptimizer.reset();
    jest.clearAllMocks();
  });

  describe('服務註冊', () => {
    it('應該能夠註冊服務', () => {
      serviceInitializationOptimizer.registerService(
        'service1',
        mockService1,
        [],
        1
      );
      serviceInitializationOptimizer.registerService(
        'service2',
        mockService2,
        ['service1'],
        2
      );

      const _stats = serviceInitializationOptimizer.getStats();
      expect(stats.totalServices).toBe(2);
      expect(stats.serviceNames).toContain('service1');
      expect(stats.serviceNames).toContain('service2');
    });

    it('應該能夠設置服務依賴', () => {
      serviceInitializationOptimizer.registerService(
        'service1',
        mockService1,
        [],
        1
      );
      serviceInitializationOptimizer.registerService(
        'service2',
        mockService2,
        ['service1'],
        2
      );

      const _dependencyGraph =
        serviceInitializationOptimizer.getDependencyGraph();
      expect(dependencyGraph.get('service1')).toEqual([]);
      expect(dependencyGraph.get('service2')).toEqual(['service1']);
    });
  });

  describe('依賴驗證', () => {
    it('應該檢測循環依賴', () => {
      serviceInitializationOptimizer.registerService(
        'service1',
        mockService1,
        ['service2'],
        1
      );
      serviceInitializationOptimizer.registerService(
        'service2',
        mockService2,
        ['service1'],
        2
      );

      const _validation = serviceInitializationOptimizer.validateDependencies();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0]).toContain('循環依賴');
    });

    it('應該檢測缺失的依賴', () => {
      serviceInitializationOptimizer.registerService(
        'service1',
        mockService1,
        ['missingService'],
        1
      );

      const _validation = serviceInitializationOptimizer.validateDependencies();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0]).toContain('未註冊');
    });

    it('應該驗證有效的依賴關係', () => {
      serviceInitializationOptimizer.registerService(
        'service1',
        mockService1,
        [],
        1
      );
      serviceInitializationOptimizer.registerService(
        'service2',
        mockService2,
        ['service1'],
        2
      );

      const _validation = serviceInitializationOptimizer.validateDependencies();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('初始化順序優化', () => {
    it('應該按依賴關係排序服務', () => {
      serviceInitializationOptimizer.registerService(
        'service1',
        mockService1,
        [],
        1
      );
      serviceInitializationOptimizer.registerService(
        'service2',
        mockService2,
        ['service1'],
        2
      );
      serviceInitializationOptimizer.registerService(
        'service3',
        mockService3,
        ['service2'],
        3
      );

      const _sortedOrder =
        serviceInitializationOptimizer.optimizeInitializationOrder();
      expect(sortedOrder).toEqual(['service1', 'service2', 'service3']);
    });

    it('應該按優先級排序相同依賴層級的服務', () => {
      serviceInitializationOptimizer.registerService(
        'service1',
        mockService1,
        [],
        1
      );
      serviceInitializationOptimizer.registerService(
        'service2',
        mockService2,
        ['service1'],
        3
      );
      serviceInitializationOptimizer.registerService(
        'service3',
        mockService3,
        ['service1'],
        2
      );

      const _sortedOrder =
        serviceInitializationOptimizer.optimizeInitializationOrder();
      expect(sortedOrder[0]).toBe('service1');
      expect(sortedOrder[1]).toBe('service2'); // 優先級 3
      expect(sortedOrder[2]).toBe('service3'); // 優先級 2
    });
  });

  describe('並行初始化', () => {
    it('應該並行初始化服務', async () => {
      // 重新設置 mock 以確保返回 true
      mockService1.initialize.mockResolvedValue(true);
      mockService2.initialize.mockResolvedValue(true);
      mockService3.initialize.mockResolvedValue(true);

      serviceInitializationOptimizer.registerService(
        'service1',
        mockService1,
        [],
        1
      );
      serviceInitializationOptimizer.registerService(
        'service2',
        mockService2,
        [],
        1
      );
      serviceInitializationOptimizer.registerService(
        'service3',
        mockService3,
        [],
        1
      );

      const _result =
        await serviceInitializationOptimizer.initializeServicesInParallel(2);

      expect(result.success).toBe(true);
      expect(result.initialized).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
      expect(mockService1.initialize).toHaveBeenCalled();
      expect(mockService2.initialize).toHaveBeenCalled();
      expect(mockService3.initialize).toHaveBeenCalled();
    });

    it('應該處理初始化失敗的服務', async () => {
      const _failingService = {
        initialize: jest.fn().mockRejectedValue(new Error('初始化失敗')),
        isServiceAvailable: jest.fn().mockReturnValue(false),
      };

      // 重新設置 mock 以確保返回 true
      mockService1.initialize.mockResolvedValue(true);

      serviceInitializationOptimizer.registerService(
        'failingService',
        failingService,
        [],
        1
      );
      serviceInitializationOptimizer.registerService(
        'service1',
        mockService1,
        [],
        1
      );

      const _result =
        await serviceInitializationOptimizer.initializeServicesInParallel(2);

      expect(result.success).toBe(false);
      expect(result.initialized).toContain('service1');
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].service).toBe('failingService');
      expect(result.failed[0].error).toBe('初始化失敗');
    });

    it('應該尊重依賴關係進行初始化', async () => {
      // 重新設置 mock 以確保返回 true
      mockService1.initialize.mockResolvedValue(true);
      mockService2.initialize.mockResolvedValue(true);

      serviceInitializationOptimizer.registerService(
        'service1',
        mockService1,
        [],
        1
      );
      serviceInitializationOptimizer.registerService(
        'service2',
        mockService2,
        ['service1'],
        2
      );

      const _result =
        await serviceInitializationOptimizer.initializeServicesInParallel(2);

      expect(result.success).toBe(true);
      expect(result.initialized).toContain('service1');
      expect(result.initialized).toContain('service2');
    });
  });

  describe('服務狀態檢查', () => {
    it('應該檢查服務可用性', () => {
      const _availableService = {
        initialize: jest.fn().mockResolvedValue(true),
        isServiceAvailable: jest.fn().mockReturnValue(true),
      };

      const _unavailableService = {
        initialize: jest.fn().mockResolvedValue(true),
        isServiceAvailable: jest.fn().mockReturnValue(false),
      };

      serviceInitializationOptimizer.registerService(
        'available',
        availableService,
        [],
        1
      );
      serviceInitializationOptimizer.registerService(
        'unavailable',
        unavailableService,
        [],
        1
      );

      const _status = serviceInitializationOptimizer.getServiceStatus();
      expect(status.available).toBe(true);
      expect(status.unavailable).toBe(false);
    });
  });

  describe('性能優化', () => {
    it('應該在合理時間內完成初始化', async () => {
      const _startTime = Date.now();

      // 註冊多個服務
      for (let i = 0; i < 10; i++) {
        const _mockService = {
          initialize: jest.fn().mockResolvedValue(true),
          isServiceAvailable: jest.fn().mockReturnValue(false),
        };
        serviceInitializationOptimizer.registerService(
          `service${i}`,
          mockService,
          [],
          1
        );
      }

      const _result =
        await serviceInitializationOptimizer.initializeServicesInParallel(3);
      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.initialized).toHaveLength(10);
      expect(duration).toBeLessThan(1000); // 應該在1秒內完成
    });
  });
});
