/**
 * 搜索性能優化服務測試
 * 測試 TD-007: 優化搜索性能
 */

import { SearchPerformanceOptimizationService } from '../../services/searchPerformanceOptimizationService';

// Mock logger
jest.mock('../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('SearchPerformanceOptimizationService', () => {
  let searchPerformanceOptimizationService: SearchPerformanceOptimizationService;

  beforeEach(async () => {
    searchPerformanceOptimizationService =
      SearchPerformanceOptimizationService.getInstance();
    await searchPerformanceOptimizationService.reset();
  });

  describe('單例模式測試', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = SearchPerformanceOptimizationService.getInstance();
      const _instance2 = SearchPerformanceOptimizationService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('應該正確初始化配置', async () => {
      await searchPerformanceOptimizationService.initialize();
      const { config } = searchPerformanceOptimizationService as any;
      expect(config.fullTextSearch.enableFuzzySearch).toBe(true);
      expect(config.fullTextSearch.enableSpellCheck).toBe(true);
      expect(config.fullTextSearch.enableSynonyms).toBe(true);
      expect(config.intelligentSearch.enableSemanticSearch).toBe(true);
      expect(config.intelligentSearch.enablePersonalization).toBe(true);
      expect(config.ranking.enableMultiFactorRanking).toBe(true);
      expect(config.responseTime.enableCaching).toBe(true);
      expect(config.responseTime.enableCompression).toBe(true);
    });
  });

  describe('初始化測試', () => {
    it('應該正確初始化服務', async () => {
      const _result = await searchPerformanceOptimizationService.initialize();
      expect(result).toBe(true);
    });

    it('應該避免重複初始化', async () => {
      await searchPerformanceOptimizationService.initialize();
      const _result = await searchPerformanceOptimizationService.initialize();
      expect(result).toBe(true);
    });
  });

  describe('搜索優化測試', () => {
    beforeEach(async () => {
      await searchPerformanceOptimizationService.initialize();
    });

    it('應該優化簡單查詢', async () => {
      const _query = 'blue eyes white dragon';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(query);

      expect(result.originalQuery).toBe(query);
      expect(result.optimizedQuery).toBeDefined();
      expect(result.performanceImprovement).toBeGreaterThan(0);
      expect(result.searchAccuracy).toBeGreaterThan(0);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('應該處理拼寫錯誤', async () => {
      const _query = 'yu-gi-oh cards';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(query);

      expect(result.originalQuery).toBe(query);
      expect(result.optimizedQuery).toContain('yugioh');
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });

    it('應該擴展同義詞', async () => {
      const _query = 'monster cards';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(query);

      expect(result.originalQuery).toBe(query);
      expect(result.optimizedQuery).toContain('creature');
      expect(result.optimizedQuery).toContain('beast');
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });

    it('應該計算性能提升', async () => {
      const _query = 'spell cards';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(query);

      expect(result.performanceImprovement).toBeGreaterThanOrEqual(20);
      expect(result.performanceImprovement).toBeLessThanOrEqual(60);
    });

    it('應該計算搜索準確性', async () => {
      const _query = 'magic cards';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(query);

      expect(result.searchAccuracy).toBeGreaterThanOrEqual(0.7);
      expect(result.searchAccuracy).toBeLessThanOrEqual(1.0);
    });

    it('應該測量響應時間', async () => {
      const _query = 'pokemon cards';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(query);

      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.responseTime).toBeLessThan(100); // 應該很快
    });
  });

  describe('配置管理測試', () => {
    it('應該更新配置', () => {
      const _newConfig = {
        fullTextSearch: {
          enableSpellCheck: false,
        },
      };

      searchPerformanceOptimizationService.updateConfig(newConfig);

      const _currentConfig = (searchPerformanceOptimizationService as any)
        .config;
      expect(currentConfig.fullTextSearch.enableSpellCheck).toBe(false);
    });

    it('應該保持其他配置不變', () => {
      const _originalConfig = {
        ...(searchPerformanceOptimizationService as any).config,
      };

      searchPerformanceOptimizationService.updateConfig({
        fullTextSearch: { enableSynonyms: false },
      });

      const _currentConfig = (searchPerformanceOptimizationService as any)
        .config;
      expect(currentConfig.intelligentSearch.enableSemanticSearch).toBe(
        originalConfig.intelligentSearch.enableSemanticSearch
      );
      expect(currentConfig.ranking.enableMultiFactorRanking).toBe(
        originalConfig.ranking.enableMultiFactorRanking
      );
    });
  });

  describe('重置測試', () => {
    it('應該重置服務狀態', async () => {
      await searchPerformanceOptimizationService.initialize();

      // 執行一些操作
      await searchPerformanceOptimizationService.optimizeSearch('test query');

      // 重置
      await searchPerformanceOptimizationService.reset();

      // 檢查是否重置
      const { isInitialized } = searchPerformanceOptimizationService as any;
      expect(isInitialized).toBe(false);
    });
  });

  describe('邊界條件測試', () => {
    beforeEach(async () => {
      await searchPerformanceOptimizationService.initialize();
    });

    it('應該處理空查詢', async () => {
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch('');

      expect(result.originalQuery).toBe('');
      expect(result.optimizedQuery).toBeDefined();
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });

    it('應該處理短查詢', async () => {
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch('a');

      expect(result.originalQuery).toBe('a');
      expect(result.optimizedQuery).toBeDefined();
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });

    it('應該處理長查詢', async () => {
      const _longQuery =
        'very long search query with many words that should be optimized for better performance';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(longQuery);

      expect(result.originalQuery).toBe(longQuery);
      expect(result.optimizedQuery).toBeDefined();
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await searchPerformanceOptimizationService.initialize();
    });

    it('應該快速處理多個查詢', async () => {
      const _startTime = Date.now();

      const _queries = [
        'blue eyes white dragon',
        'dark magician',
        'red eyes black dragon',
        'exodia the forbidden one',
        'summoned skull',
      ];

      for (const query of queries) {
        await searchPerformanceOptimizationService.optimizeSearch(query);
      }

      const _totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(1000); // 應該在1秒內完成5個查詢
    });

    it('應該高效處理複雜查詢', async () => {
      const _startTime = Date.now();

      const _complexQuery =
        'yu-gi-oh monster spell trap card collection deck building strategy';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(complexQuery);

      const _processingTime = Date.now() - startTime;

      expect(result.originalQuery).toBe(complexQuery);
      expect(result.optimizedQuery).toBeDefined();
      expect(processingTime).toBeLessThan(200); // 應該在200ms內完成
    });
  });

  describe('功能測試', () => {
    beforeEach(async () => {
      await searchPerformanceOptimizationService.initialize();
    });

    it('應該處理特殊字符', async () => {
      const _query = 'blue-eyes white dragon (original)';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(query);

      expect(result.originalQuery).toBe(query);
      expect(result.optimizedQuery).toBeDefined();
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });

    it('應該處理數字', async () => {
      const _query = 'card number 001';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(query);

      expect(result.originalQuery).toBe(query);
      expect(result.optimizedQuery).toBeDefined();
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });

    it('應該處理混合語言', async () => {
      const _query = '青眼の白龍 blue eyes white dragon';
      const _result =
        await searchPerformanceOptimizationService.optimizeSearch(query);

      expect(result.originalQuery).toBe(query);
      expect(result.optimizedQuery).toBeDefined();
      expect(result.performanceImprovement).toBeGreaterThan(0);
    });
  });
});
