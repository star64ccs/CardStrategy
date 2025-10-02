/**
 * DataHandleService單元Test
 * Test核心功能和性能優化
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

// 模擬Handle器
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
        error: '模擬HandleFailed',
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
    test('應該正確InitializeService', async () => {
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
          ttl: 30 * 60 * 1000, // 30Minute
          strategy: CacheStrategy.MEMORY,
        },
        queueConfig: {
          maxSize: 500,
          concurrency: 2,
          timeout: 15000,
        },
        monitoringConfig: {
          enabled: false,
          interval: 120000, // 2Minute
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
      // ParallelHandle應該比順序Handle快
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

      // 第一次Handle
      const _result1 = await service.processData(
        testData,
        'test-processor',
        config
      );
      expect(result1.success).toBe(true);

      // 第二次Handle應該使用Cache
      const _result2 = await service.processData(
        testData,
        'test-processor',
        config
      );
      expect(result2.success).toBe(true);
      expect(result2.data.processed).toEqual(testData);
    });

    test('應該HandleFailed的Handle器', async () => {
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
      expect(result.error).toBe('模擬HandleFailed');
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

      // 第一次Handle
      const _startTime1 = Date.now();
      const _result1 = await service.processData(
        testData,
        'test-processor',
        config
      );
      const _time1 = Date.now() - startTime1;

      // 第二次Handle（應該使用Cache）
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
      // CacheHandle應該更快
      expect(time2).toBeLessThan(time1);
    });

    test('應該支持不同的緩存策略', async () => {
      const _testData = { name: 'test', value: 123 };

      // TestMemoryCache
      const memoryConfig: Partial<ProcessingConfig> = {
        cacheStrategy: CacheStrategy.MEMORY,
      };
      const _memoryResult = await service.processData(
        testData,
        'test-processor',
        memoryConfig
      );
      expect(memoryResult.success).toBe(true);

      // TestDiskCache
      const diskConfig: Partial<ProcessingConfig> = {
        cacheStrategy: CacheStrategy.DISK,
      };
      const _diskResult = await service.processData(
        testData,
        'test-processor',
        diskConfig
      );
      expect(diskResult.success).toBe(true);

      // Test混合Cache
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
      // 吞吐量可能為0，因為Time太短
      expect(metrics.throughput).toBeGreaterThanOrEqual(0);
    });

    test('應該能夠GetService統計Information', async () => {
      const _testData = { name: 'test', value: 123 };
      await service.processData(testData, 'test-processor');

      const _stats = await service.getStats();

      expect(stats.processors).toBe(1);
      expect(stats.uptime).toBeGreaterThan(0);
      expect(stats.cache).toBeDefined();
      expect(stats.queue).toBeDefined();
    });

    test('應該正確計算Error率', async () => {
      const _failingProcessor = new MockProcessor(50, true);
      service.registerProcessor('failing-processor', failingProcessor);

      const _testData = { name: 'test', value: 123 };

      // Reset指標
      service['metrics'] = service['initializeMetrics']();

      // SuccessHandle
      await service.processData(testData, 'test-processor');

      // FailedHandle
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

      // ParallelHandle
      const _parallelStartTime = Date.now();
      const _parallelResults = await service.processBatch(
        testDataArray,
        'test-processor',
        { strategy: ProcessingStrategy.PARALLEL }
      );
      const _parallelTime = Date.now() - parallelStartTime;

      // 順序Handle
      const _sequentialStartTime = Date.now();
      const _sequentialResults = await service.processBatch(
        testDataArray,
        'test-processor',
        { strategy: ProcessingStrategy.SEQUENTIAL }
      );
      const _sequentialTime = Date.now() - sequentialStartTime;

      expect(parallelResults).toHaveLength(10);
      expect(sequentialResults).toHaveLength(10);
      // ParallelHandle應該更快（考慮到模擬的50ms延遲）
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
      expect(totalTime).toBeLessThan(10000); // 應該在10Second內Complete

      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.data.processed).toEqual(largeDataArray[index]);
      });
    });
  });

  describe('ErrorHandle', () => {
    test('應該HandleInitializeFailed', async () => {
      // 確保Service未Initialize
      await service.destroy();

      // 模擬InitializeFailed
      const _mockClear = jest.spyOn(service['cacheManager'], 'clear');
      mockClear.mockRejectedValueOnce(new Error('InitializeFailed'));

      const _result = await service.initialize();
      expect(result).toBe(false);

      mockClear.mockRestore();
    });

    test('應該HandleHandle器執行Error', async () => {
      const errorProcessor: DataProcessor<any, any> = {
        async process() {
          throw new Error('Handle器執行Error');
        },
      };

      service.registerProcessor('error-processor', errorProcessor);

      const _testData = { name: 'test', value: 123 };

      await expect(
        service.processData(testData, 'error-processor')
      ).rejects.toThrow('Handle器執行Error');
    });

    test('應該Handle緩存Error', async () => {
      service.registerProcessor('test-processor', new MockProcessor(50));

      // 模擬CacheError
      const _mockGet = jest.spyOn(service['cacheManager'], 'get');
      mockGet.mockRejectedValueOnce(new Error('緩存Error'));

      const _testData = { name: 'test', value: 123 };
      const config: Partial<ProcessingConfig> = {
        cacheStrategy: CacheStrategy.HYBRID,
      };

      // 應該仍然能夠HandleData，只Yes不使用Cache
      const _result = await service.processData(
        testData,
        'test-processor',
        config
      );
      expect(result.success).toBe(true);

      mockGet.mockRestore();
    });
  });

  describe('Service生命週期', () => {
    test('應該正確銷毀Service', async () => {
      service.registerProcessor('test-processor', new MockProcessor(50));

      await service.destroy();

      // 銷毀後應該無法HandleData
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
