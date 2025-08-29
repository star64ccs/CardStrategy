/**
 * 數據處理服務單元測試
 * 測試核心功能和性能優化
 */

import { HighPerformanceCacheManager } from '../services/cacheManager';
import { DataProcessingService } from '../services/dataProcessingService';
import { HighPerformanceTaskQueue } from '../services/taskQueue';
import type {
  ProcessingConfig,
  DataProcessor,
  ProcessingResult,
} from '../types/processing';
import {
  ProcessingStrategy,
  DataPriority,
  CacheStrategy,
  CompressionAlgorithm,
} from '../types/processing';

// 模擬處理器
class MockProcessor implements DataProcessor<any, any> {
  constructor(
    private delay = 100,
    private shouldFail = false
  ) {}

  async process(
    data: unknown,
    config: ProcessingConfig
  ): Promise<ProcessingResult<any>> {
    await new Promise(resolve => setTimeout(resolve, this.delay));

    if (this.shouldFail) {
      return {
        success: false,
        data: null,
        processingTime: this.delay,
        memoryUsage: 10,
        error: '模擬處理失敗',
      };
    }

    return {
      success: true,
      data: { processed: data, timestamp: Date.now() },
      processingTime: this.delay,
      memoryUsage: 10,
      cacheHit: false,
      compressionRatio: 0.8,
    };
  }
}

describe('DataProcessingService', () => {
  let service: DataProcessingService;

  beforeEach(async () => {
    service = DataProcessingService.getInstance();
    await service.destroy();
    await service.initialize();
  });

  afterEach(async () => {
    await service.destroy();
  });

  describe('初始化', () => {
    test('應該正確初始化服務', async () => {
      expect(service).toBeDefined();
      const _stats = await service.getStats();
      expect(stats.processors).toBe(0);
    });

    test('應該支持自定義配置初始化', async () => {
      const _customConfig = {
        defaultConfig: {
          strategy: ProcessingStrategy.SEQUENTIAL,
          priority: DataPriority.HIGH,
          cacheStrategy: CacheStrategy.MEMORY,
          compression: CompressionAlgorithm.LZ4,
          batchSize: 50,
          maxConcurrency: 2,
          timeout: 15000,
          retryAttempts: 5,
          retryDelay: 2000,
          enableProfiling: false,
          enableMetrics: false,
          memoryLimit: 256,
          cpuLimit: 60,
        },
        cacheConfig: {
          maxSize: 50 * 1024 * 1024, // 50MB
          ttl: 30 * 60 * 1000, // 30分鐘
          strategy: CacheStrategy.MEMORY,
        },
        queueConfig: {
          maxSize: 500,
          concurrency: 2,
          timeout: 15000,
        },
        monitoringConfig: {
          enabled: false,
          interval: 120000, // 2分鐘
          thresholds: {
            memoryUsage: 70,
            cpuUsage: 80,
            errorRate: 0.05,
          },
        },
      };

      await service.destroy();
      const _result = await service.initialize(customConfig);
      expect(result).toBe(true);
    });
  });

  describe('處理器註冊', () => {
    test('應該能夠註冊和獲取處理器', () => {
      const _processor = new MockProcessor();
      service.registerProcessor('test-processor', processor);

      const _retrievedProcessor = service.getProcessor('test-processor');
      expect(retrievedProcessor).toBe(processor);
    });

    test('應該能夠註冊多個處理器', () => {
      const _processor1 = new MockProcessor(100);
      const _processor2 = new MockProcessor(200);

      service.registerProcessor('processor1', processor1);
      service.registerProcessor('processor2', processor2);

      expect(service.getProcessor('processor1')).toBe(processor1);
      expect(service.getProcessor('processor2')).toBe(processor2);
    });
  });

  describe('數據處理', () => {
    beforeEach(() => {
      service.registerProcessor('test-processor', new MockProcessor(50));
    });

    test('應該能夠處理單個數據項目', async () => {
      const _testData = { name: 'test', value: 123 };
      const config: Partial<ProcessingConfig> = {
        strategy: ProcessingStrategy.SEQUENTIAL,
        priority: DataPriority.NORMAL,
      };

      const _result = await service.processData(
        testData,
        'test-processor',
        config
      );

      expect(result.success).toBe(true);
      expect(result.data.processed).toEqual(testData);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.memoryUsage).toBe(10);
    });

    test('應該能夠處理批量數據', async () => {
      const _testDataArray = [
        { name: 'test1', value: 1 },
        { name: 'test2', value: 2 },
        { name: 'test3', value: 3 },
      ];

      const _results = await service.processBatch(
        testDataArray,
        'test-processor'
      );

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data.processed).toEqual(testDataArray[index]);
      });
    });

    test('應該支持並行處理策略', async () => {
      const _testData = { name: 'test', value: 123 };
      const config: Partial<ProcessingConfig> = {
        strategy: ProcessingStrategy.PARALLEL,
        batchSize: 10,
      };

      const _startTime = Date.now();
      const _result = await service.processData(
        testData,
        'test-processor',
        config
      );
      const _endTime = Date.now();

      expect(result.success).toBe(true);
      // 並行處理應該比順序處理快
      expect(endTime - startTime).toBeLessThan(200);
    });

    test('應該支持流式處理策略', async () => {
      const _testData = { name: 'test', value: 123 };
      const config: Partial<ProcessingConfig> = {
        strategy: ProcessingStrategy.STREAMING,
        batchSize: 5,
      };

      const _result = await service.processData(
        testData,
        'test-processor',
        config
      );

      expect(result.success).toBe(true);
      expect(result.data.processed).toEqual(testData);
    });

    test('應該支持緩存處理策略', async () => {
      const _testData = { name: 'test', value: 123 };
      const config: Partial<ProcessingConfig> = {
        strategy: ProcessingStrategy.CACHED,
        cacheStrategy: CacheStrategy.HYBRID,
      };

      // 第一次處理
      const _result1 = await service.processData(
        testData,
        'test-processor',
        config
      );
      expect(result1.success).toBe(true);

      // 第二次處理應該使用緩存
      const _result2 = await service.processData(
        testData,
        'test-processor',
        config
      );
      expect(result2.success).toBe(true);
      expect(result2.data.processed).toEqual(testData);
    });

    test('應該處理失敗的處理器', async () => {
      const _failingProcessor = new MockProcessor(50, true);
      service.registerProcessor('failing-processor', failingProcessor);

      const _testData = { name: 'test', value: 123 };
      const config: Partial<ProcessingConfig> = {
        strategy: ProcessingStrategy.SEQUENTIAL,
      };

      const _result = await service.processData(
        testData,
        'failing-processor',
        config
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('模擬處理失敗');
    });

    test('應該處理不存在的處理器', async () => {
      const _testData = { name: 'test', value: 123 };

      await expect(
        service.processData(testData, 'non-existent-processor')
      ).rejects.toThrow('處理器不存在: non-existent-processor');
    });
  });

  describe('緩存功能', () => {
    beforeEach(() => {
      service.registerProcessor('test-processor', new MockProcessor(50));
    });

    test('應該能夠緩存處理結果', async () => {
      const _testData = { name: 'test', value: 123 };
      const config: Partial<ProcessingConfig> = {
        cacheStrategy: CacheStrategy.HYBRID,
      };

      // 第一次處理
      const _startTime1 = Date.now();
      const _result1 = await service.processData(
        testData,
        'test-processor',
        config
      );
      const _time1 = Date.now() - startTime1;

      // 第二次處理（應該使用緩存）
      const _startTime2 = Date.now();
      const _result2 = await service.processData(
        testData,
        'test-processor',
        config
      );
      const _time2 = Date.now() - startTime2;

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data.processed).toEqual(result2.data.processed);
      // 緩存處理應該更快
      expect(time2).toBeLessThan(time1);
    });

    test('應該支持不同的緩存策略', async () => {
      const _testData = { name: 'test', value: 123 };

      // 測試內存緩存
      const memoryConfig: Partial<ProcessingConfig> = {
        cacheStrategy: CacheStrategy.MEMORY,
      };
      const _memoryResult = await service.processData(
        testData,
        'test-processor',
        memoryConfig
      );
      expect(memoryResult.success).toBe(true);

      // 測試磁盤緩存
      const diskConfig: Partial<ProcessingConfig> = {
        cacheStrategy: CacheStrategy.DISK,
      };
      const _diskResult = await service.processData(
        testData,
        'test-processor',
        diskConfig
      );
      expect(diskResult.success).toBe(true);

      // 測試混合緩存
      const hybridConfig: Partial<ProcessingConfig> = {
        cacheStrategy: CacheStrategy.HYBRID,
      };
      const _hybridResult = await service.processData(
        testData,
        'test-processor',
        hybridConfig
      );
      expect(hybridResult.success).toBe(true);
    });
  });

  describe('事件監聽', () => {
    test('應該能夠添加和移除事件監聽器', () => {
      const events: unknown[] = [];
      const _listener = (event: unknown) => {
        events.push(event);
      };

      service.addEventListener(listener);
      expect(service['eventListeners']).toContain(listener);

      service.removeEventListener(listener);
      expect(service['eventListeners']).not.toContain(listener);
    });

    test('應該在處理完成時觸發事件', async () => {
      const events: unknown[] = [];
      const _listener = (event: unknown) => {
        events.push(event);
      };

      service.addEventListener(listener);
      service.registerProcessor('test-processor', new MockProcessor(50));

      const _testData = { name: 'test', value: 123 };
      await service.processData(testData, 'test-processor');

      expect(events.length).toBeGreaterThan(0);
      expect(events.some(e => e.type === 'task_completed')).toBe(true);
    });
  });

  describe('性能指標', () => {
    beforeEach(() => {
      service.registerProcessor('test-processor', new MockProcessor(50));
    });

    test('應該能夠獲取性能指標', async () => {
      const _testData = { name: 'test', value: 123 };
      await service.processData(testData, 'test-processor');

      const _metrics = await service.getMetrics();

      expect(metrics.totalTasks).toBeGreaterThan(0);
      expect(metrics.completedTasks).toBeGreaterThan(0);
      expect(metrics.averageProcessingTime).toBeGreaterThan(0);
      expect(metrics.uptime).toBeGreaterThan(0);
      // 吞吐量可能為0，因為時間太短
      expect(metrics.throughput).toBeGreaterThanOrEqual(0);
    });

    test('應該能夠獲取服務統計信息', async () => {
      const _testData = { name: 'test', value: 123 };
      await service.processData(testData, 'test-processor');

      const _stats = await service.getStats();

      expect(stats.processors).toBe(1);
      expect(stats.uptime).toBeGreaterThan(0);
      expect(stats.cache).toBeDefined();
      expect(stats.queue).toBeDefined();
    });

    test('應該正確計算錯誤率', async () => {
      const _failingProcessor = new MockProcessor(50, true);
      service.registerProcessor('failing-processor', failingProcessor);

      const _testData = { name: 'test', value: 123 };

      // 重置指標
      service['metrics'] = service['initializeMetrics']();

      // 成功處理
      await service.processData(testData, 'test-processor');

      // 失敗處理
      await service.processData(testData, 'failing-processor');

      const _metrics = await service.getMetrics();

      expect(metrics.totalTasks).toBe(2);
      expect(metrics.completedTasks).toBe(1);
      expect(metrics.failedTasks).toBe(1);
      expect(metrics.errorRate).toBe(0.5);
    });
  });

  describe('批量處理性能', () => {
    beforeEach(() => {
      service.registerProcessor('test-processor', new MockProcessor(50));
    });

    test('並行批量處理應該比順序處理快', async () => {
      const _testDataArray = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        value: `test${i}`,
      }));

      // 並行處理
      const _parallelStartTime = Date.now();
      const _parallelResults = await service.processBatch(
        testDataArray,
        'test-processor',
        { strategy: ProcessingStrategy.PARALLEL }
      );
      const _parallelTime = Date.now() - parallelStartTime;

      // 順序處理
      const _sequentialStartTime = Date.now();
      const _sequentialResults = await service.processBatch(
        testDataArray,
        'test-processor',
        { strategy: ProcessingStrategy.SEQUENTIAL }
      );
      const _sequentialTime = Date.now() - sequentialStartTime;

      expect(parallelResults).toHaveLength(10);
      expect(sequentialResults).toHaveLength(10);
      // 並行處理應該更快（考慮到模擬的50ms延遲）
      expect(parallelTime).toBeLessThan(sequentialTime);
    });

    test('應該處理大量數據', async () => {
      const _largeDataArray = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        value: `test${i}`,
      }));

      const _startTime = Date.now();
      const _results = await service.processBatch(
        largeDataArray,
        'test-processor',
        { strategy: ProcessingStrategy.PARALLEL, batchSize: 20 }
      );
      const _totalTime = Date.now() - startTime;

      expect(results).toHaveLength(100);
      expect(totalTime).toBeLessThan(10000); // 應該在10秒內完成

      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data.processed).toEqual(largeDataArray[index]);
      });
    });
  });

  describe('錯誤處理', () => {
    test('應該處理初始化失敗', async () => {
      // 確保服務未初始化
      await service.destroy();

      // 模擬初始化失敗
      const _mockClear = jest.spyOn(service['cacheManager'], 'clear');
      mockClear.mockRejectedValueOnce(new Error('初始化失敗'));

      const _result = await service.initialize();
      expect(result).toBe(false);

      mockClear.mockRestore();
    });

    test('應該處理處理器執行錯誤', async () => {
      const errorProcessor: DataProcessor<any, any> = {
        async process() {
          throw new Error('處理器執行錯誤');
        },
      };

      service.registerProcessor('error-processor', errorProcessor);

      const _testData = { name: 'test', value: 123 };

      await expect(
        service.processData(testData, 'error-processor')
      ).rejects.toThrow('處理器執行錯誤');
    });

    test('應該處理緩存錯誤', async () => {
      service.registerProcessor('test-processor', new MockProcessor(50));

      // 模擬緩存錯誤
      const _mockGet = jest.spyOn(service['cacheManager'], 'get');
      mockGet.mockRejectedValueOnce(new Error('緩存錯誤'));

      const _testData = { name: 'test', value: 123 };
      const config: Partial<ProcessingConfig> = {
        cacheStrategy: CacheStrategy.HYBRID,
      };

      // 應該仍然能夠處理數據，只是不使用緩存
      const _result = await service.processData(
        testData,
        'test-processor',
        config
      );
      expect(result.success).toBe(true);

      mockGet.mockRestore();
    });
  });

  describe('服務生命週期', () => {
    test('應該正確銷毀服務', async () => {
      service.registerProcessor('test-processor', new MockProcessor(50));

      await service.destroy();

      // 銷毀後應該無法處理數據
      const _testData = { name: 'test', value: 123 };
      await expect(
        service.processData(testData, 'test-processor')
      ).rejects.toThrow();
    });

    test('應該支持重新初始化', async () => {
      await service.destroy();
      const _result = await service.initialize();
      expect(result).toBe(true);
    });
  });
});
