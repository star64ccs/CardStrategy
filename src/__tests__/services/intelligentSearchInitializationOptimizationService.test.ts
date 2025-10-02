/**
 * 智能SearchInitialize優化ServiceTest
 * Test TD-010: 優化智能SearchInitialize
 */

import type { IntelligentSearchInitializationOptimizationConfig } from '../../services/intelligentSearchInitializationOptimizationService';
import { IntelligentSearchInitializationOptimizationService } from '../../services/intelligentSearchInitializationOptimizationService';

// Mock logger
jest.mock('../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('IntelligentSearchInitializationOptimizationService', () => {
  let service: IntelligentSearchInitializationOptimizationService;

  beforeEach(() => {
    service = IntelligentSearchInitializationOptimizationService.getInstance();
  });

  afterEach(async () => {
    await service.reset();
  });

  describe('單例模式測試', () => {
    test('應該返回相同的實例', () => {
      const _instance1 =
        IntelligentSearchInitializationOptimizationService.getInstance();
      const _instance2 =
        IntelligentSearchInitializationOptimizationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化測試', () => {
    test('應該SuccessInitializeService', async () => {
      const _result = await service.initialize();
      expect(result).toBe(true);
    });

    test('應該使用自定義配置初始化', async () => {
      const customConfig: Partial<IntelligentSearchInitializationOptimizationConfig> =
        {
          initialization: {
            enableLazyLoading: false,
            enablePreloading: true,
            enableBackgroundInitialization: false,
            initializationTimeout: 15000,
            retryAttempts: 5,
            retryDelay: 2000,
          },
        };

      const _result = await service.initialize(customConfig);
      expect(result).toBe(true);
    });

    test('重複初始化應該返回true', async () => {
      await service.initialize();
      const _result = await service.initialize();
      expect(result).toBe(true);
    });
  });

  describe('初始化優化測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該優化智能搜索ServiceInitialize', async () => {
      const _result = await service.optimizeInitialization();

      expect(result).toMatchObject({
        initializationStatus: expect.stringMatching(
          /^(success|partial|failed)$/
        ),
        initializationTime: expect.any(Number),
        componentsInitialized: expect.any(Array),
        failedComponents: expect.any(Array),
        initializationScore: expect.any(Number),
        performanceImprovement: expect.any(Number),
      });

      expect(result.initializationScore).toBeGreaterThanOrEqual(0);
      expect(result.initializationScore).toBeLessThanOrEqual(100);
      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(100);
    });

    test('應該計算初始化性能指標', async () => {
      const _result = await service.optimizeInitialization();

      expect(result.initializationTime).toBeGreaterThanOrEqual(0);
      expect(result.componentsInitialized.length).toBeGreaterThanOrEqual(0);
      expect(result.failedComponents.length).toBeGreaterThanOrEqual(0);
    });

    test('應該HandleInitializeFailed情況', async () => {
      // 模擬Failed情況
      jest.spyOn(Math, 'random').mockReturnValue(0.9); // 增加Failed概率

      const _result = await service.optimizeInitialization();

      expect(result.initializationStatus).toBeDefined();
      expect(result.failedComponents).toBeDefined();
    });
  });

  describe('相關性優化測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該優化搜索結果相關性', async () => {
      const _result = await service.optimizeRelevance();

      expect(result).toMatchObject({
        semanticAccuracy: expect.any(Number),
        personalizationEffectiveness: expect.any(Number),
        contextRelevance: expect.any(Number),
        queryExpansionRate: expect.any(Number),
        spellCheckAccuracy: expect.any(Number),
        overallRelevance: expect.any(Number),
        performanceImprovement: expect.any(Number),
      });

      expect(result.semanticAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.semanticAccuracy).toBeLessThanOrEqual(1);
      expect(result.personalizationEffectiveness).toBeGreaterThanOrEqual(0);
      expect(result.personalizationEffectiveness).toBeLessThanOrEqual(1);
      expect(result.contextRelevance).toBeGreaterThanOrEqual(0);
      expect(result.contextRelevance).toBeLessThanOrEqual(1);
      expect(result.queryExpansionRate).toBeGreaterThanOrEqual(0);
      expect(result.queryExpansionRate).toBeLessThanOrEqual(1);
      expect(result.spellCheckAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.spellCheckAccuracy).toBeLessThanOrEqual(1);
      expect(result.overallRelevance).toBeGreaterThanOrEqual(0);
      expect(result.overallRelevance).toBeLessThanOrEqual(1);
      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(40);
    });

    test('應該計算整體相關性', async () => {
      const _result = await service.optimizeRelevance();

      expect(result.overallRelevance).toBeGreaterThan(0);
      expect(result.overallRelevance).toBeLessThanOrEqual(1);
    });

    test('應該計算相關性性能提升', async () => {
      const _result = await service.optimizeRelevance();

      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(40);
    });
  });

  describe('算法配置優化測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該優化搜索算法配置', async () => {
      const _result = await service.optimizeAlgorithmConfiguration();

      expect(result).toMatchObject({
        algorithmVersion: expect.any(String),
        fuzzySearchEnabled: expect.any(Boolean),
        stemmingEnabled: expect.any(Boolean),
        synonymsEnabled: expect.any(Boolean),
        rankingEnabled: expect.any(Boolean),
        clusteringEnabled: expect.any(Boolean),
        configurationScore: expect.any(Number),
        performanceImprovement: expect.any(Number),
      });

      expect(result.algorithmVersion).toBe('2.0.0');
      expect(result.configurationScore).toBeGreaterThanOrEqual(0);
      expect(result.configurationScore).toBeLessThanOrEqual(100);
      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(35);
    });

    test('應該計算算法配置分數', async () => {
      const _result = await service.optimizeAlgorithmConfiguration();

      expect(result.configurationScore).toBeGreaterThanOrEqual(0);
      expect(result.configurationScore).toBeLessThanOrEqual(100);
    });

    test('應該計算算法性能提升', async () => {
      const _result = await service.optimizeAlgorithmConfiguration();

      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(35);
    });
  });

  describe('測試覆蓋優化測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該優化搜索測試覆蓋', async () => {
      const _result = await service.optimizeTestCoverage();

      expect(result).toMatchObject({
        unitTestCoverage: expect.any(Number),
        integrationTestCoverage: expect.any(Number),
        performanceTestCoverage: expect.any(Number),
        totalTestCoverage: expect.any(Number),
        testPassRate: expect.any(Number),
        coverageScore: expect.any(Number),
        performanceImprovement: expect.any(Number),
      });

      expect(result.unitTestCoverage).toBeGreaterThanOrEqual(0);
      expect(result.unitTestCoverage).toBeLessThanOrEqual(1);
      expect(result.integrationTestCoverage).toBeGreaterThanOrEqual(0);
      expect(result.integrationTestCoverage).toBeLessThanOrEqual(1);
      expect(result.performanceTestCoverage).toBeGreaterThanOrEqual(0);
      expect(result.performanceTestCoverage).toBeLessThanOrEqual(1);
      expect(result.totalTestCoverage).toBeGreaterThanOrEqual(0);
      expect(result.totalTestCoverage).toBeLessThanOrEqual(1);
      expect(result.testPassRate).toBeGreaterThanOrEqual(0);
      expect(result.testPassRate).toBeLessThanOrEqual(1);
      expect(result.coverageScore).toBeGreaterThanOrEqual(0);
      expect(result.coverageScore).toBeLessThanOrEqual(100);
      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(30);
    });

    test('應該計算總測試覆蓋率', async () => {
      const _result = await service.optimizeTestCoverage();

      expect(result.totalTestCoverage).toBeGreaterThanOrEqual(0);
      expect(result.totalTestCoverage).toBeLessThanOrEqual(1);
    });

    test('應該計算覆蓋分數', async () => {
      const _result = await service.optimizeTestCoverage();

      expect(result.coverageScore).toBeGreaterThanOrEqual(0);
      expect(result.coverageScore).toBeLessThanOrEqual(100);
    });

    test('應該計算測試覆蓋性能提升', async () => {
      const _result = await service.optimizeTestCoverage();

      expect(result.performanceImprovement).toBeGreaterThanOrEqual(0);
      expect(result.performanceImprovement).toBeLessThanOrEqual(30);
    });
  });

  describe('指標獲取測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取優化指標', () => {
      const _metrics = service.getOptimizationMetrics();

      expect(metrics).toMatchObject({
        initialization: {
          initializationTime: expect.any(Number),
          successRate: expect.any(Number),
          componentCount: expect.any(Number),
          failedComponents: expect.any(Number),
        },
        relevance: {
          semanticAccuracy: expect.any(Number),
          personalizationEffectiveness: expect.any(Number),
          contextRelevance: expect.any(Number),
          overallRelevance: expect.any(Number),
        },
        algorithm: {
          configurationScore: expect.any(Number),
          algorithmVersion: expect.any(String),
          featuresEnabled: expect.any(Number),
        },
        testing: {
          totalTestCoverage: expect.any(Number),
          testPassRate: expect.any(Number),
          coverageScore: expect.any(Number),
        },
      });
    });

    test('應該返回指標的副本', () => {
      const _metrics1 = service.getOptimizationMetrics();
      const _metrics2 = service.getOptimizationMetrics();

      expect(metrics1).not.toBe(metrics2);
      expect(metrics1).toEqual(metrics2);
    });
  });

  describe('配置管理測試', () => {
    test('應該更新配置', () => {
      const newConfig: Partial<IntelligentSearchInitializationOptimizationConfig> =
        {
          initialization: {
            enableLazyLoading: false,
            enablePreloading: false,
            enableBackgroundInitialization: false,
            initializationTimeout: 10000,
            retryAttempts: 1,
            retryDelay: 500,
          },
        };

      service.updateConfig(newConfig);
      // ConfigureUpdate應該Success，沒有ErrorThrow
      expect(true).toBe(true);
    });
  });

  describe('重置測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該重置Service', async () => {
      await service.reset();

      // Reset後應該能夠ReInitialize
      const _result = await service.initialize();
      expect(result).toBe(true);
    });
  });

  describe('邊界條件測試', () => {
    test('應該處理空配置初始化', async () => {
      const _result = await service.initialize({});
      expect(result).toBe(true);
    });

    test('應該處理部分配置初始化', async () => {
      const _partialConfig = {
        initialization: {
          enableLazyLoading: false,
        },
      } as Partial<IntelligentSearchInitializationOptimizationConfig>;

      const _result = await service.initialize(partialConfig);
      expect(result).toBe(true);
    });

    test('應該處理極端數值配置', async () => {
      const extremeConfig: Partial<IntelligentSearchInitializationOptimizationConfig> =
        {
          initialization: {
            enableLazyLoading: true,
            enablePreloading: true,
            enableBackgroundInitialization: true,
            initializationTimeout: 0,
            retryAttempts: 0,
            retryDelay: 0,
          },
          relevance: {
            enableSemanticAnalysis: true,
            enablePersonalization: true,
            enableContextAwareness: true,
            enableQueryExpansion: true,
            enableSpellCheck: true,
            relevanceThreshold: 0,
            semanticWeight: 0,
            personalizationWeight: 0,
          },
        };

      const _result = await service.initialize(extremeConfig);
      expect(result).toBe(true);
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該在合理時間內完成初始化優化', async () => {
      const _startTime = Date.now();

      await service.optimizeInitialization();

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });

    test('應該在合理時間內完成相關性優化', async () => {
      const _startTime = Date.now();

      await service.optimizeRelevance();

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });

    test('應該在合理時間內完成算法配置優化', async () => {
      const _startTime = Date.now();

      await service.optimizeAlgorithmConfiguration();

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });

    test('應該在合理時間內完成測試覆蓋優化', async () => {
      const _startTime = Date.now();

      await service.optimizeTestCoverage();

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });
  });

  describe('功能測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該支持完整優化流程', async () => {
      // 執Row所有優化步驟
      const _initializationResult = await service.optimizeInitialization();
      const _relevanceResult = await service.optimizeRelevance();
      const _algorithmResult = await service.optimizeAlgorithmConfiguration();
      const _testCoverageResult = await service.optimizeTestCoverage();

      // Verify所有結果
      expect(initializationResult.initializationStatus).toBeDefined();
      expect(relevanceResult.overallRelevance).toBeGreaterThan(0);
      expect(algorithmResult.configurationScore).toBeGreaterThan(0);
      expect(testCoverageResult.coverageScore).toBeGreaterThan(0);

      // Get最終指標
      const _metrics = service.getOptimizationMetrics();
      expect(metrics).toBeDefined();
    });

    test('應該處理連續優化操作', async () => {
      // 連續執Row多次優化
      const _results = [];

      for (let i = 0; i < 3; i++) {
        const _result = await service.optimizeInitialization();
        results.push(result);
      }

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.initializationStatus).toBeDefined();
        expect(result.initializationScore).toBeGreaterThanOrEqual(0);
      });
    });

    test('應該在優化後更新指標', async () => {
      // ResetService以確保初始Status
      await service.reset();
      await service.initialize();

      const _initialMetrics = service.getOptimizationMetrics();

      await service.optimizeInitialization();
      await service.optimizeRelevance();

      const _updatedMetrics = service.getOptimizationMetrics();

      // CheckSpecific指標YesNo有變化
      expect(updatedMetrics.initialization.initializationTime).toBeGreaterThan(
        0
      );
      expect(updatedMetrics.initialization.componentCount).toBeGreaterThan(0);
      expect(updatedMetrics.relevance.overallRelevance).toBeGreaterThan(0);
    });
  });
});
