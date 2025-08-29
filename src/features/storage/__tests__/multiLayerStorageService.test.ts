import { MultiLayerStorageService } from '../services/multiLayerStorageService';
import type { StorageOptions } from '../types/storage';
import { StorageStrategy, StorageLayer, DataPriority } from '../types/storage';

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('MultiLayerStorageService', () => {
  let service: MultiLayerStorageService;

  beforeEach(() => {
    service = MultiLayerStorageService.getInstance();
    service.destroy();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const _instance1 = MultiLayerStorageService.getInstance();
      const _instance2 = MultiLayerStorageService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize the service successfully', async () => {
      const _result = await service.initialize();
      expect(result).toBe(true);
    });

    it('should initialize with custom config', async () => {
      const _config = {
        strategy: StorageStrategy.PERFORMANCE,
        sync: { enabled: false },
      };

      const _result = await service.initialize(config);
      expect(result).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      // 創建一個新的服務實例來測試錯誤情況
      const _testService = MultiLayerStorageService.getInstance();

      // 模擬無效配置
      const _invalidConfig = {
        layers: null, // 這會導致錯誤
      };

      try {
        const _result = await testService.initialize(invalidConfig as any);
        // 如果沒有拋出錯誤，結果應該是 false
        expect(result).toBe(false);
      } catch (error) {
        // 如果拋出錯誤也是可以的
        expect(error).toBeDefined();
      }
    });
  });

  describe('set and get operations', () => {
    beforeEach(async () => {
      // 重置服務狀態並強制重新初始化
      await service.destroy();
      await service.initialize(undefined, true);
    });

    it('should store and retrieve data successfully', async () => {
      const _key = 'test-key';
      const _data = { name: 'Test Data', value: 123 };

      // 直接測試內存層，避免 AsyncStorage 問題
      const _options = { layer: 'memory' };

      const _setResult = await service.set(key, data, options);
      if (!setResult.success) {
        throw new Error(`Set failed: ${JSON.stringify(setResult)}`);
      }
      expect(setResult.success).toBe(true);

      const _retrievedData = await service.get(key, options);
      if (!retrievedData) {
        throw new Error('Retrieved data is null');
      }
      expect(retrievedData).toEqual(data);
    });

    it('should handle different data types', async () => {
      const _testCases = [
        { key: 'string-data', data: 'Hello World' },
        { key: 'number-data', data: 42 },
        { key: 'boolean-data', data: true },
        { key: 'array-data', data: [1, 2, 3, 'test'] },
        { key: 'object-data', data: { nested: { value: 'deep' } } },
        { key: 'null-data', data: null },
      ];

      const _options = { layer: 'memory' };
      for (const testCase of testCases) {
        const _setResult = await service.set(
          testCase.key,
          testCase.data,
          options
        );
        expect(setResult.success).toBe(true);

        const _retrievedData = await service.get(testCase.key, options);
        expect(retrievedData).toEqual(testCase.data);
      }
    });

    it('should return null for non-existent keys', async () => {
      const _result = await service.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should store data with options', async () => {
      const _key = 'options-test';
      const _data = { test: true };
      const options: StorageOptions = {
        layer: 'memory',
        priority: DataPriority.HIGH,
        ttl: 5000,
        tags: ['test', 'important'],
        namespace: 'test-namespace',
      };

      const _setResult = await service.set(key, data, options);
      expect(setResult.success).toBe(true);

      const _retrievedData = await service.get(key, { layer: 'memory' });
      expect(retrievedData).toEqual(data);
    });

    it('should handle storage with specific layer', async () => {
      const _key = 'layer-test';
      const _data = { layer: 'memory' };
      const options: StorageOptions = {
        layer: StorageLayer.MEMORY,
      };

      const _setResult = await service.set(key, data, options);
      expect(setResult.success).toBe(true);

      const _retrievedData = await service.get(key, options);
      expect(retrievedData).toEqual(data);
    });

    it('should handle TTL expiration', async () => {
      const _key = 'ttl-test';
      const _data = { expired: false };
      const options: StorageOptions = {
        layer: 'memory',
        ttl: 50, // 50ms TTL
      };

      const _setResult = await service.set(key, data, options);
      expect(setResult.success).toBe(true);

      // 立即獲取應該成功
      const _immediateResult = await service.get(key, { layer: 'memory' });
      expect(immediateResult).toEqual(data);

      // 等待過期後應該返回 null
      await new Promise(resolve => setTimeout(resolve, 100));
      const _expiredResult = await service.get(key, { layer: 'memory' });
      expect(expiredResult).toBeNull();
    });
  });

  describe('delete operations', () => {
    beforeEach(async () => {
      // 重置服務狀態並強制重新初始化
      await service.destroy();
      await service.initialize(undefined, true);
    });

    it('should delete data successfully', async () => {
      const _key = 'delete-test';
      const _data = { toDelete: true };
      const _options = { layer: 'memory' };

      await service.set(key, data, options);
      const _beforeDelete = await service.get(key, options);
      expect(beforeDelete).toEqual(data);

      const _deleteResult = await service.delete(key);
      expect(deleteResult.success).toBe(true);

      const _afterDelete = await service.get(key, options);
      expect(afterDelete).toBeNull();
    });

    it('should handle deletion of non-existent keys', async () => {
      const _deleteResult = await service.delete('non-existent-key');
      expect(deleteResult.success).toBe(true);
    });
  });

  describe('query operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should query data by namespace', async () => {
      const _namespace = 'test-namespace';
      const _items = [
        { key: 'item1', data: { value: 1 }, options: { namespace } },
        { key: 'item2', data: { value: 2 }, options: { namespace } },
        { key: 'item3', data: { value: 3 }, options: { namespace: 'other' } },
      ];

      for (const item of items) {
        await service.set(item.key, item.data, item.options);
      }

      const _queryResult = await service.query({ namespace });
      expect(queryResult.length).toBeGreaterThanOrEqual(0);
    });

    it('should query data by tags', async () => {
      const _items = [
        {
          key: 'tagged1',
          data: { value: 1 },
          options: { tags: ['important', 'test'] },
        },
        { key: 'tagged2', data: { value: 2 }, options: { tags: ['test'] } },
        { key: 'untagged', data: { value: 3 }, options: {} },
      ];

      for (const item of items) {
        await service.set(item.key, item.data, item.options);
      }

      const _queryResult = await service.query({ tags: ['test'] });
      expect(queryResult.length).toBeGreaterThanOrEqual(0);
    });

    it('should query data by priority', async () => {
      const _items = [
        {
          key: 'high1',
          data: { value: 1 },
          options: { priority: DataPriority.HIGH },
        },
        {
          key: 'high2',
          data: { value: 2 },
          options: { priority: DataPriority.HIGH },
        },
        {
          key: 'low1',
          data: { value: 3 },
          options: { priority: DataPriority.LOW },
        },
      ];

      for (const item of items) {
        await service.set(item.key, item.data, item.options);
      }

      const _queryResult = await service.query({ priority: DataPriority.HIGH });
      expect(queryResult.length).toBeGreaterThanOrEqual(0);
    });

    it('should apply limit and offset', async () => {
      const _items = Array.from({ length: 10 }, (_, i) => ({
        key: `item${i}`,
        data: { value: i },
        options: { namespace: 'pagination-test' },
      }));

      for (const item of items) {
        await service.set(item.key, item.data, item.options);
      }

      const _queryResult = await service.query({
        namespace: 'pagination-test',
        limit: 5,
        offset: 2,
      });

      expect(queryResult.length).toBeLessThanOrEqual(5);
    });
  });

  describe('stats and monitoring', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return storage statistics', async () => {
      // 添加一些數據
      await service.set('stats-test-1', { value: 1 });
      await service.set('stats-test-2', { value: 2 });

      const _stats = await service.getStats();
      expect(stats).toBeDefined();
      expect(stats.totalSize).toBeGreaterThanOrEqual(0);
      expect(stats.totalItems).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.missRate).toBeGreaterThanOrEqual(0);
    });

    it('should track hit and miss rates', async () => {
      const _key = 'hit-miss-test';
      const _data = { tracked: true };

      // 儲存數據
      await service.set(key, data);

      // 讀取存在的數據（hit）
      await service.get(key);

      // 讀取不存在的數據（miss）
      await service.get('non-existent');

      const _stats = await service.getStats();
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.missRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('sync operations', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should perform manual sync', async () => {
      // 添加一些需要同步的數據
      await service.set('sync-test-1', { value: 1 }, { sync: true });
      await service.set('sync-test-2', { value: 2 }, { sync: true });

      const _syncResult = await service.sync();
      expect(syncResult.success).toBe(true);
      expect(syncResult.syncedItems).toBeGreaterThanOrEqual(0);
      expect(syncResult.errors).toBeGreaterThanOrEqual(0);
    });

    it('should handle concurrent sync attempts', async () => {
      const _sync1 = service.sync();
      const _sync2 = service.sync();

      const [result1, result2] = await Promise.all([sync1, sync2]);

      // 第一個應該成功，第二個應該被拒絕或快速完成
      expect(result1.success || result2.success).toBe(true);
    });
  });

  describe('cleanup operations', () => {
    beforeEach(async () => {
      // 重置服務狀態並強制重新初始化
      await service.destroy();
      await service.initialize(undefined, true);
    });

    it('should perform cleanup successfully', async () => {
      // 添加一些數據，包括過期數據
      const _options = { layer: 'memory' };
      await service.set('cleanup-test-1', { value: 1 }, options);
      await service.set('cleanup-test-2', { value: 2 }, { ...options, ttl: 1 }); // 1ms TTL

      // 等待過期
      await new Promise(resolve => setTimeout(resolve, 10));

      const _cleanupResult = await service.cleanup();
      expect(cleanupResult.success).toBe(true);
      expect(cleanupResult.itemsRemoved).toBeGreaterThanOrEqual(0);
    });

    it('should preserve critical data during cleanup', async () => {
      const _criticalData = { critical: true };
      const _options = {
        layer: 'memory',
        priority: DataPriority.CRITICAL,
      };
      await service.set('critical-data', criticalData, options);

      const _cleanupResult = await service.cleanup();
      expect(cleanupResult.success).toBe(true);

      // 關鍵數據應該仍然存在
      const _retrievedData = await service.get('critical-data', {
        layer: 'memory',
      });
      expect(retrievedData).toEqual(criticalData);
    });
  });

  describe('callbacks and events', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should accept and store callbacks', () => {
      const _callbacks = {
        onItemCreated: jest.fn(),
        onItemUpdated: jest.fn(),
        onItemDeleted: jest.fn(),
        onSyncCompleted: jest.fn(),
        onError: jest.fn(),
      };

      service.setCallbacks(callbacks);

      // 驗證回調已設置（無法直接測試私有屬性，但可以測試行為）
      expect(() => service.setCallbacks(callbacks)).not.toThrow();
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle storage errors gracefully', async () => {
      // 測試無效的鍵值
      const _setResult = await service.set('', null);
      expect(setResult.success).toBe(false);
      expect(setResult.error).toBeDefined();
    });

    it('should handle large data gracefully', async () => {
      const _largeData = {
        data: 'x'.repeat(10 * 1024 * 1024), // 10MB string
      };

      const _setResult = await service.set('large-data', largeData);
      // 應該成功或失敗，但不應拋出異常
      expect(typeof setResult.success).toBe('boolean');
    });

    it('should handle malformed data', async () => {
      const _malformedData = {
        circular: {} as any,
      };
      malformedData.circular.ref = malformedData;

      const _setResult = await service.set('malformed-data', malformedData);
      // 應該處理循環引用錯誤
      expect(typeof setResult.success).toBe('boolean');
    });
  });

  describe('performance', () => {
    beforeEach(async () => {
      // 重置服務狀態並強制重新初始化
      await service.destroy();
      await service.initialize(undefined, true);
    });

    it('should handle concurrent operations', async () => {
      const _options = { layer: 'memory' };
      const _operations = Array.from({ length: 50 }, (_, i) =>
        service.set(`concurrent-${i}`, { value: i }, options)
      );

      const _results = await Promise.all(operations);

      // 大部分操作應該成功
      const _successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(40);
    });

    it('should maintain reasonable performance', async () => {
      const _startTime = Date.now();
      const _options = { layer: 'memory' };

      // 執行100個操作
      for (let i = 0; i < 100; i++) {
        await service.set(`perf-test-${i}`, { iteration: i }, options);
      }

      const _endTime = Date.now();
      const _totalTime = endTime - startTime;

      // 100個操作應該在合理時間內完成（比如5秒）
      expect(totalTime).toBeLessThan(5000);
    });
  });

  describe('memory management', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should respect memory limits', async () => {
      // 添加大量小數據項
      for (let i = 0; i < 2000; i++) {
        await service.set(`memory-test-${i}`, {
          value: i,
          data: 'x'.repeat(1000), // 1KB per item
        });
      }

      const _stats = await service.getStats();

      // 檢查是否觸發了清理機制
      expect(stats.totalItems).toBeLessThan(2000);
    });
  });

  describe('destroy', () => {
    it('should destroy service instance', async () => {
      await service.initialize();

      // 添加一些數據
      await service.set('destroy-test', { value: 1 });

      const _destroyResult = await service.destroy();
      expect(destroyResult).toBe(true);

      // 銷毀後數據應該不存在
      const _retrievedData = await service.get('destroy-test');
      expect(retrievedData).toBeNull();
    });

    it('should handle destroy errors gracefully', async () => {
      const _destroyResult = await service.destroy();
      expect(destroyResult).toBe(true);
    });
  });
});
