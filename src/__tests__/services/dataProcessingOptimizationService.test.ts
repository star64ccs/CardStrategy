/**
 * 數據處理優化服務測試
 * 測試 TD-006: 提升數據處理性能
 */

import { DataProcessingOptimizationService } from '../../services/dataProcessingOptimizationService';

// Mock logger
jest.mock('../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('DataProcessingOptimizationService', () => {
  let dataProcessingOptimizationService: DataProcessingOptimizationService;

  beforeEach(async () => {
    dataProcessingOptimizationService =
      DataProcessingOptimizationService.getInstance();
    await dataProcessingOptimizationService.reset();
  });

  describe('單例模式測試', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = DataProcessingOptimizationService.getInstance();
      const _instance2 = DataProcessingOptimizationService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('應該正確初始化配置', async () => {
      await dataProcessingOptimizationService.initialize();
      const { config } = dataProcessingOptimizationService as any;
      expect(config.database.enableQueryOptimization).toBe(true);
      expect(config.cache.enableMultiLevelCache).toBe(true);
      expect(config.batchProcessing.enableParallelProcessing).toBe(true);
      expect(config.realtimeSync.enableIncrementalSync).toBe(true);
    });
  });

  describe('初始化測試', () => {
    it('應該正確初始化服務', async () => {
      const _result = await dataProcessingOptimizationService.initialize();
      expect(result).toBe(true);
    });

    it('應該避免重複初始化', async () => {
      await dataProcessingOptimizationService.initialize();
      const _result = await dataProcessingOptimizationService.initialize();
      expect(result).toBe(true);
    });
  });

  describe('數據庫查詢優化測試', () => {
    beforeEach(async () => {
      await dataProcessingOptimizationService.initialize();
    });

    it('應該優化簡單查詢', async () => {
      const _query = 'SELECT * FROM cards WHERE status = "active"';
      const _result =
        await dataProcessingOptimizationService.optimizeDatabaseQuery(query);

      expect(result.originalQuery).toBe(query);
      expect(result.optimizedQuery).toContain('SELECT specific_columns');
      expect(result.executionTimeReduction).toBeGreaterThan(0);
      expect(result.optimizationScore).toBeGreaterThan(0);
    });

    it('應該提供索引建議', async () => {
      const _query =
        'SELECT * FROM cards WHERE status = "active" AND type = "monster"';
      const _result =
        await dataProcessingOptimizationService.optimizeDatabaseQuery(query);

      expect(result.indexSuggestions).toBeDefined();
      expect(Array.isArray(result.indexSuggestions)).toBe(true);
    });

    it('應該計算性能提升', async () => {
      const _query = 'SELECT * FROM cards WHERE status = "active"';
      const _result =
        await dataProcessingOptimizationService.optimizeDatabaseQuery(query);

      expect(result.executionTimeReduction).toBeGreaterThan(0);
      expect(result.memoryUsageReduction).toBeGreaterThan(0);
      expect(result.optimizationScore).toBeGreaterThan(0);
    });
  });

  describe('緩存策略優化測試', () => {
    beforeEach(async () => {
      await dataProcessingOptimizationService.initialize();
    });

    it('應該優化緩存策略', async () => {
      const _result =
        await dataProcessingOptimizationService.optimizeCacheStrategy();

      expect(result.cacheHitRatio).toBeGreaterThan(0);
      expect(result.memoryUsage).toBeGreaterThan(0);
      expect(result.optimizationSuggestions).toBeDefined();
      expect(Array.isArray(result.optimizationSuggestions)).toBe(true);
    });

    it('應該計算性能改進', async () => {
      const _result =
        await dataProcessingOptimizationService.optimizeCacheStrategy();

      expect(result.performanceImprovement).toBeDefined();
      expect(typeof result.performanceImprovement).toBe('number');
    });

    it('應該提供緩存指標', async () => {
      const _result =
        await dataProcessingOptimizationService.optimizeCacheStrategy();

      expect(result.compressionRatio).toBeGreaterThan(0);
      expect(result.evictionRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('批量數據處理優化測試', () => {
    beforeEach(async () => {
      await dataProcessingOptimizationService.initialize();
    });

    it('應該優化批量處理', async () => {
      const _testData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));
      const _processor = async (item: unknown) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { processed: item.id };
      };

      const _result =
        await dataProcessingOptimizationService.optimizeBatchProcessing(
          testData,
          processor
        );

      expect(result.totalItems).toBe(100);
      expect(result.processedItems).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);
    });

    it('應該處理錯誤情況', async () => {
      const _testData = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));
      const _processor = async (item: unknown) => {
        if (item.id % 3 === 0) {
          throw new Error(`處理失敗: ${item.id}`);
        }
        return { processed: item.id };
      };

      const _result =
        await dataProcessingOptimizationService.optimizeBatchProcessing(
          testData,
          processor
        );

      expect(result.failedItems).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.processedItems + result.failedItems).toBe(
        result.totalItems
      );
    });

    it('應該計算處理指標', async () => {
      const _testData = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));
      const _processor = async (item: unknown) => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return { processed: item.id };
      };

      const _result =
        await dataProcessingOptimizationService.optimizeBatchProcessing(
          testData,
          processor
        );

      expect(result.averageTimePerItem).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);
    });
  });

  describe('實時數據同步優化測試', () => {
    beforeEach(async () => {
      await dataProcessingOptimizationService.initialize();
    });

    it('應該優化增量同步', async () => {
      const _localData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        data: `local_${i}`,
      }));
      const _remoteData = Array.from({ length: 120 }, (_, i) => ({
        id: i,
        data: `remote_${i}`,
      }));

      const _result =
        await dataProcessingOptimizationService.optimizeRealtimeSync(
          localData,
          remoteData,
          'incremental'
        );

      expect(result.syncStatus).toBeDefined();
      expect(result.syncedItems).toBeGreaterThan(0);
      expect(result.syncTime).toBeGreaterThanOrEqual(0);
      expect(result.dataIntegrity).toBeGreaterThan(0);
    });

    it('應該優化全量同步', async () => {
      const _localData = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        data: `local_${i}`,
      }));
      const _remoteData = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        data: `remote_${i}`,
      }));

      const _result =
        await dataProcessingOptimizationService.optimizeRealtimeSync(
          localData,
          remoteData,
          'full'
        );

      expect(result.syncStatus).toBeDefined();
      expect(result.syncedItems).toBeGreaterThan(0);
      expect(result.conflicts).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics).toBeDefined();
    });

    it('應該計算同步性能指標', async () => {
      const _localData = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        data: `local_${i}`,
      }));
      const _remoteData = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        data: `remote_${i}`,
      }));

      const _result =
        await dataProcessingOptimizationService.optimizeRealtimeSync(
          localData,
          remoteData
        );

      expect(result.performanceMetrics.latency).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.throughput).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.errorRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('性能指標測試', () => {
    beforeEach(async () => {
      await dataProcessingOptimizationService.initialize();
    });

    it('應該獲取性能指標', async () => {
      // 執行一些操作來生成指標
      await dataProcessingOptimizationService.optimizeDatabaseQuery(
        'SELECT * FROM test'
      );
      await dataProcessingOptimizationService.optimizeCacheStrategy();

      const _metrics = dataProcessingOptimizationService.getPerformanceMetrics();

      expect(metrics.queryPerformance).toBeDefined();
      expect(metrics.cachePerformance).toBeDefined();
      expect(metrics.batchPerformance).toBeDefined();
      expect(metrics.syncPerformance).toBeDefined();
    });

    it('應該包含查詢性能指標', async () => {
      await dataProcessingOptimizationService.optimizeDatabaseQuery(
        'SELECT * FROM test'
      );

      const _metrics = dataProcessingOptimizationService.getPerformanceMetrics();

      expect(metrics.queryPerformance.averageQueryTime).toBeGreaterThanOrEqual(
        0
      );
      expect(metrics.queryPerformance.slowQueryCount).toBeGreaterThanOrEqual(0);
      expect(metrics.queryPerformance.cacheHitRatio).toBeGreaterThanOrEqual(0);
      expect(metrics.queryPerformance.indexUsage).toBeGreaterThanOrEqual(0);
    });

    it('應該包含緩存性能指標', async () => {
      await dataProcessingOptimizationService.optimizeCacheStrategy();

      const _metrics = dataProcessingOptimizationService.getPerformanceMetrics();

      expect(metrics.cachePerformance.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(metrics.cachePerformance.hitRatio).toBeGreaterThanOrEqual(0);
      expect(metrics.cachePerformance.evictionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.cachePerformance.compressionRatio).toBeGreaterThanOrEqual(
        0
      );
    });
  });

  describe('配置管理測試', () => {
    it('應該更新配置', () => {
      const _newConfig = {
        database: {
          batchSize: 200,
          maxBatchSize: 2000,
        },
      };

      dataProcessingOptimizationService.updateConfig(newConfig);

      const _currentConfig = (dataProcessingOptimizationService as any).config;
      expect(currentConfig.database.batchSize).toBe(200);
      expect(currentConfig.database.maxBatchSize).toBe(2000);
    });

    it('應該保持其他配置不變', () => {
      const _originalConfig = {
        ...(dataProcessingOptimizationService as any).config,
      };

      dataProcessingOptimizationService.updateConfig({
        database: { batchSize: 150 },
      });

      const _currentConfig = (dataProcessingOptimizationService as any).config;
      expect(currentConfig.cache.enableMultiLevelCache).toBe(
        originalConfig.cache.enableMultiLevelCache
      );
      expect(currentConfig.batchProcessing.enableParallelProcessing).toBe(
        originalConfig.batchProcessing.enableParallelProcessing
      );
    });
  });

  describe('重置測試', () => {
    it('應該重置服務狀態', async () => {
      await dataProcessingOptimizationService.initialize();

      // 執行一些操作
      await dataProcessingOptimizationService.optimizeDatabaseQuery(
        'SELECT * FROM test'
      );

      // 重置
      await dataProcessingOptimizationService.reset();

      // 檢查是否重置
      const { isInitialized } = dataProcessingOptimizationService as any;
      expect(isInitialized).toBe(false);
    });

    it('應該重置性能指標', async () => {
      await dataProcessingOptimizationService.initialize();

      // 執行一些操作來生成指標
      await dataProcessingOptimizationService.optimizeDatabaseQuery(
        'SELECT * FROM test'
      );

      // 重置
      await dataProcessingOptimizationService.reset();

      // 檢查指標是否重置
      const _metrics = dataProcessingOptimizationService.getPerformanceMetrics();
      expect(metrics.queryPerformance.averageQueryTime).toBe(0);
      expect(metrics.cachePerformance.hitRatio).toBe(0);
    });
  });

  describe('邊界條件測試', () => {
    beforeEach(async () => {
      await dataProcessingOptimizationService.initialize();
    });

    it('應該處理空數據批量處理', async () => {
      const _processor = async (item: unknown) => ({ processed: item.id });

      const _result =
        await dataProcessingOptimizationService.optimizeBatchProcessing(
          [],
          processor
        );

      expect(result.totalItems).toBe(0);
      expect(result.processedItems).toBe(0);
      expect(result.failedItems).toBe(0);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('應該處理空數據同步', async () => {
      const _result =
        await dataProcessingOptimizationService.optimizeRealtimeSync([], []);

      expect(result.syncedItems).toBe(0);
      expect(result.conflicts).toBe(0);
      expect(result.syncTime).toBeGreaterThanOrEqual(0);
    });

    it('應該處理空查詢優化', async () => {
      const _result =
        await dataProcessingOptimizationService.optimizeDatabaseQuery('');

      expect(result.originalQuery).toBe('');
      expect(result.optimizedQuery).toBeDefined();
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await dataProcessingOptimizationService.initialize();
    });

    it('應該快速處理大量數據', async () => {
      const _startTime = Date.now();

      const _testData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }));
      const _processor = async (item: unknown) => ({ processed: item.id });

      const _result =
        await dataProcessingOptimizationService.optimizeBatchProcessing(
          testData,
          processor
        );

      const _totalTime = Date.now() - startTime;

      expect(result.totalItems).toBe(1000);
      expect(result.processedItems).toBe(1000);
      expect(totalTime).toBeLessThan(5000); // 應該在5秒內完成
    });

    it('應該高效處理查詢優化', async () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        await dataProcessingOptimizationService.optimizeDatabaseQuery(
          `SELECT * FROM table_${i}`
        );
      }

      const _totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(2000); // 應該在2秒內完成100次查詢優化
    });
  });
});
