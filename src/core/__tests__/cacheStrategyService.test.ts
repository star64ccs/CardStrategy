import type { CacheStrategy } from '../services/cacheStrategyService';
import {
  CacheStrategyService,
  CacheConfig,
  CacheItem,
  CacheStats,
  CachePolicy,
  CacheLayer,
} from '../services/cacheStrategyService';

describe('CacheStrategyService', () => {
  let cacheStrategyService: CacheStrategyService;

  beforeEach(() => {
    // 重置單例狀態
    (CacheStrategyService as any).instance = null;
    cacheStrategyService = CacheStrategyService.getInstance();

    // 重置初始化狀態
    (cacheStrategyService as any).isInitialized = false;
    (cacheStrategyService as any).memoryCache = new Map();
    (cacheStrategyService as any).cachePolicies = new Map();
    (cacheStrategyService as any).cacheLayers = [];
    (cacheStrategyService as any).strategies = [];
    (cacheStrategyService as any).cleanupInterval = null;
    (cacheStrategyService as any).stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
    };
  });

  afterEach(async () => {
    try {
      await cacheStrategyService.cleanup();
    } catch (error) {
      // 忽略清理錯誤
    }
  });

  describe('初始化', () => {
    it('應該成功初始化服務', async () => {
      await cacheStrategyService.initialize();

      expect(cacheStrategyService.getStatus().isInitialized).toBe(true);
      expect(cacheStrategyService.getStatus().strategies).toBeGreaterThan(0);
      expect(cacheStrategyService.getStatus().layers).toBeGreaterThan(0);
    });

    it('應該在重複初始化時發出警告', async () => {
      await cacheStrategyService.initialize();
      await cacheStrategyService.initialize();

      expect(cacheStrategyService.getStatus().isInitialized).toBe(true);
    });

    it('應該處理初始化錯誤', async () => {
      // 模擬初始化錯誤
      jest
        .spyOn(cacheStrategyService as any, 'setupDefaultPolicies')
        .mockImplementation(() => {
          throw new Error('Setup failed');
        });

      try {
        await cacheStrategyService.initialize();
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('Setup failed');
      }
    });
  });

  describe('緩存操作', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該成功設置緩存', async () => {
      const _key = 'test-key';
      const _value = { data: 'test-data' };

      await cacheStrategyService.set(key, value);

      const _cachedValue = await cacheStrategyService.get(key);
      expect(cachedValue).toEqual(value);
    });

    it('應該成功獲取緩存', async () => {
      const _key = 'test-key';
      const _value = { data: 'test-data' };

      await cacheStrategyService.set(key, value);
      const _result = await cacheStrategyService.get(key);

      expect(result).toEqual(value);
    });

    it('應該在緩存未命中時返回null', async () => {
      const _result = await cacheStrategyService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('應該成功刪除緩存', async () => {
      const _key = 'test-key';
      const _value = { data: 'test-data' };

      await cacheStrategyService.set(key, value);
      const _deleted = await cacheStrategyService.delete(key);

      expect(deleted).toBe(true);

      const _result = await cacheStrategyService.get(key);
      expect(result).toBeNull();
    });

    it('應該在未初始化時拋出錯誤', async () => {
      (cacheStrategyService as any).isInitialized = false;

      try {
        await cacheStrategyService.set('key', 'value');
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });
  });

  describe('標籤管理', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該成功設置帶標籤的緩存', async () => {
      const _key = 'test-key';
      const _value = { data: 'test-data' };
      const _tags = ['user', 'profile'];

      await cacheStrategyService.set(key, value, { tags });

      const _cachedValue = await cacheStrategyService.get(key);
      expect(cachedValue).toEqual(value);
    });

    it('應該成功根據標籤刪除緩存', async () => {
      // 設置多個帶標籤的緩存
      await cacheStrategyService.set('key1', 'value1', { tags: ['user'] });
      await cacheStrategyService.set('key2', 'value2', {
        tags: ['user', 'profile'],
      });
      await cacheStrategyService.set('key3', 'value3', { tags: ['config'] });

      const _deletedCount = await cacheStrategyService.deleteByTags(['user']);

      expect(deletedCount).toBe(2);

      expect(await cacheStrategyService.get('key1')).toBeNull();
      expect(await cacheStrategyService.get('key2')).toBeNull();
      expect(await cacheStrategyService.get('key3')).not.toBeNull();
    });
  });

  describe('緩存策略', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該成功設置帶策略的緩存', async () => {
      const _key = 'test-key';
      const _value = { data: 'test-data' };

      await cacheStrategyService.set(key, value, { policy: 'high_frequency' });

      const _cachedValue = await cacheStrategyService.get(key);
      expect(cachedValue).toEqual(value);
    });

    it('應該自動選擇最佳策略', async () => {
      const _key = 'critical-config';
      const _value = { data: 'critical-data' };

      await cacheStrategyService.set(key, value);

      const _cachedValue = await cacheStrategyService.get(key);
      expect(cachedValue).toEqual(value);
    });
  });

  describe('緩存統計', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該返回緩存統計信息', () => {
      const _stats = cacheStrategyService.getStats();

      expect(stats.totalItems).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.missRate).toBe(100);
      expect(stats.evictionCount).toBe(0);
      expect(stats.averageAccessTime).toBe(0);
      expect(stats.memoryUsage).toBe(0);
      expect(stats.efficiency).toBe(0);
    });

    it('應該在未初始化時拋出錯誤', () => {
      (cacheStrategyService as any).isInitialized = false;

      try {
        cacheStrategyService.getStats();
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });

    it('應該計算命中率', async () => {
      const _key = 'test-key';
      const _value = { data: 'test-data' };

      await cacheStrategyService.set(key, value);

      // 命中
      await cacheStrategyService.get(key);
      // 未命中
      await cacheStrategyService.get('non-existent');

      const _stats = cacheStrategyService.getStats();
      expect(stats.hitRate).toBe(50);
      expect(stats.missRate).toBe(50);
    });
  });

  describe('緩存策略管理', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該返回緩存策略', () => {
      const _strategies = cacheStrategyService.getStrategies();

      expect(Array.isArray(strategies)).toBe(true);
      expect(strategies.length).toBeGreaterThan(0);

      strategies.forEach(strategy => {
        expect(strategy.name).toBeDefined();
        expect(strategy.description).toBeDefined();
        expect(Array.isArray(strategy.layers)).toBe(true);
        expect(Array.isArray(strategy.policies)).toBe(true);
        expect(typeof strategy.adaptive).toBe('boolean');
        expect(strategy.performance).toBeDefined();
      });
    });

    it('應該返回緩存層', () => {
      const _layers = cacheStrategyService.getLayers();

      expect(Array.isArray(layers)).toBe(true);
      expect(layers.length).toBeGreaterThan(0);

      layers.forEach(layer => {
        expect(layer.name).toBeDefined();
        expect(layer.type).toMatch(/^(MEMORY|REDIS|DISK)$/);
        expect(layer.config).toBeDefined();
        expect(layer.stats).toBeDefined();
        expect(typeof layer.isActive).toBe('boolean');
      });
    });

    it('應該成功添加緩存策略', () => {
      const newStrategy: CacheStrategy = {
        name: 'Custom Strategy',
        description: 'Custom cache strategy',
        layers: [],
        policies: [],
        adaptive: true,
        performance: {
          hitRate: 0,
          averageResponseTime: 0,
          memoryEfficiency: 0,
        },
      };

      cacheStrategyService.addStrategy(newStrategy);

      const _strategies = cacheStrategyService.getStrategies();
      expect(strategies.some(s => s.name === 'Custom Strategy')).toBe(true);
    });

    it('應該在未初始化時拋出錯誤', () => {
      (cacheStrategyService as any).isInitialized = false;

      try {
        cacheStrategyService.addStrategy({} as CacheStrategy);
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });
  });

  describe('策略優化', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該成功優化緩存策略', async () => {
      const _strategies = cacheStrategyService.getStrategies();
      const _strategyName = strategies[0].name;

      await cacheStrategyService.optimizeStrategy(strategyName);

      // 驗證優化過程沒有拋出錯誤
      expect(cacheStrategyService.getStatus().isInitialized).toBe(true);
    });

    it('應該在策略不存在時拋出錯誤', async () => {
      try {
        await cacheStrategyService.optimizeStrategy('Non-existent Strategy');
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not found');
      }
    });

    it('應該在未初始化時拋出錯誤', async () => {
      (cacheStrategyService as any).isInitialized = false;

      try {
        await cacheStrategyService.optimizeStrategy('test');
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });
  });

  describe('緩存預熱', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該成功預熱緩存', async () => {
      const _keys = ['key1', 'key2', 'key3'];
      const _dataProvider = jest.fn().mockImplementation((key: string) => {
        return Promise.resolve({ data: `value-for-${key}` });
      });

      await cacheStrategyService.warmupCache(keys, dataProvider);

      expect(dataProvider).toHaveBeenCalledTimes(3);

      // 驗證緩存已預熱
      for (const key of keys) {
        const _value = await cacheStrategyService.get(key);
        expect(value).toEqual({ data: `value-for-${key}` });
      }
    });

    it('應該處理預熱錯誤', async () => {
      const _keys = ['key1', 'key2'];
      const _dataProvider = jest.fn().mockImplementation((key: string) => {
        if (key === 'key1') {
          return Promise.resolve({ data: 'value1' });
        } else {
          return Promise.reject(new Error('Provider error'));
        }
      });

      await cacheStrategyService.warmupCache(keys, dataProvider);

      // 應該成功預熱key1，跳過key2
      expect(await cacheStrategyService.get('key1')).toEqual({
        data: 'value1',
      });
      expect(await cacheStrategyService.get('key2')).toBeNull();
    });

    it('應該在未初始化時拋出錯誤', async () => {
      (cacheStrategyService as any).isInitialized = false;

      try {
        await cacheStrategyService.warmupCache(['key'], () =>
          Promise.resolve('value')
        );
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });
  });

  describe('緩存清理', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該成功清空緩存', async () => {
      await cacheStrategyService.set('key1', 'value1');
      await cacheStrategyService.set('key2', 'value2');

      await cacheStrategyService.clear();

      expect(await cacheStrategyService.get('key1')).toBeNull();
      expect(await cacheStrategyService.get('key2')).toBeNull();

      const _stats = cacheStrategyService.getStats();
      expect(stats.totalItems).toBe(0);
    });

    it('應該在未初始化時拋出錯誤', async () => {
      (cacheStrategyService as any).isInitialized = false;

      try {
        await cacheStrategyService.clear();
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });
  });

  describe('服務狀態', () => {
    it('應該返回服務狀態', () => {
      const _status = cacheStrategyService.getStatus();

      expect(status.isInitialized).toBe(false);
      expect(status.cacheSize).toBe(0);
      expect(status.strategies).toBe(0);
      expect(status.layers).toBe(0);
      expect(status.stats).toBeDefined();
    });

    it('應該在初始化後返回正確狀態', async () => {
      await cacheStrategyService.initialize();

      const _status = cacheStrategyService.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.strategies).toBeGreaterThan(0);
      expect(status.layers).toBeGreaterThan(0);
    });
  });

  describe('清理', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該成功清理服務', async () => {
      await cacheStrategyService.cleanup();

      expect(cacheStrategyService.getStatus().isInitialized).toBe(false);
    });

    it('應該清理清理間隔', async () => {
      await cacheStrategyService.cleanup();

      expect((cacheStrategyService as any).cleanupInterval).toBeNull();
    });
  });

  describe('錯誤處理', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該處理設置緩存錯誤', async () => {
      // 模擬設置緩存錯誤
      jest
        .spyOn(cacheStrategyService as any, 'ensureCapacity')
        .mockRejectedValue(new Error('Capacity error'));

      try {
        await cacheStrategyService.set('key', 'value');
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('Capacity error');
      }
    });

    it('應該處理獲取緩存錯誤', async () => {
      // 模擬獲取緩存錯誤
      const _mockMap = new Map();
      mockMap.get = jest.fn().mockImplementation(() => {
        throw new Error('Get error');
      });
      (cacheStrategyService as any).memoryCache = mockMap;

      try {
        await cacheStrategyService.get('key');
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('Get error');
      }
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該在合理時間內完成緩存操作', async () => {
      const _startTime = Date.now();

      await cacheStrategyService.set('key', 'value');
      await cacheStrategyService.get('key');

      const _executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(100); // 應該在100ms內完成
    });

    it('應該支持並發緩存操作', async () => {
      const _operations = Array.from({ length: 10 }, (_, i) =>
        cacheStrategyService.set(`key${i}`, `value${i}`)
      );

      await Promise.all(operations);

      const _getOperations = Array.from({ length: 10 }, (_, i) =>
        cacheStrategyService.get(`key${i}`)
      );

      const _results = await Promise.all(getOperations);
      expect(results.length).toBe(10);
      results.forEach((result, index) => {
        expect(result).toBe(`value${index}`);
      });
    });
  });

  describe('緩存過期', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該處理過期的緩存項目', async () => {
      const _key = 'expired-key';
      const _value = 'expired-value';

      // 設置一個短TTL的緩存
      await cacheStrategyService.set(key, value, { ttl: 1 }); // 1ms TTL

      // 等待過期
      await new Promise(resolve => setTimeout(resolve, 10));

      const _result = await cacheStrategyService.get(key);
      expect(result).toBeNull();
    });
  });

  describe('內存管理', () => {
    beforeEach(async () => {
      await cacheStrategyService.initialize();
    });

    it('應該在內存不足時清理項目', async () => {
      // 設置一個大的緩存項目
      const _largeValue = 'x'.repeat(1000000); // 1MB

      await cacheStrategyService.set('large-key', largeValue);

      // 驗證項目被設置
      const _result = await cacheStrategyService.get('large-key');
      expect(result).toBe(largeValue);
    });
  });
});
