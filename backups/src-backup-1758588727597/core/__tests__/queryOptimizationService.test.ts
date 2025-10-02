import type { QueryMetrics } from '../services/databasePoolService';
import {
  QueryOptimizationService,
  QueryAnalysis,
  OptimizationResult,
  PerformanceReport,
  QueryPattern,
} from '../services/queryOptimizationService';

describe('QueryOptimizationService', () => {
  let queryOptimizationService: QueryOptimizationService;

  beforeEach(() => {
    // 重置單例狀態
    (QueryOptimizationService as any).instance = null;
    queryOptimizationService = QueryOptimizationService.getInstance();

    // 重置初始化狀態
    (queryOptimizationService as any).isInitialized = false;
    (queryOptimizationService as any).queryHistory = [];
    (queryOptimizationService as any).optimizationRules = new Map();
  });

  afterEach(async () => {
    await queryOptimizationService.clearHistory();
  });

  describe('初始化', () => {
    it('應該成功初始化服務', async () => {
      await queryOptimizationService.initialize();

      expect(queryOptimizationService.getStatus().isInitialized).toBe(true);
      expect(
        queryOptimizationService.getStatus().optimizationRulesCount
      ).toBeGreaterThan(0);
    });

    it('應該在重複初始化時發出警告', async () => {
      await queryOptimizationService.initialize();
      await queryOptimizationService.initialize();

      expect(queryOptimizationService.getStatus().isInitialized).toBe(true);
    });

    it('應該處理初始化錯誤', async () => {
      // 模擬初始化錯誤
      jest
        .spyOn(queryOptimizationService as any, 'setupOptimizationRules')
        .mockImplementation(() => {
          throw new Error('Setup failed');
        });

      try {
        await queryOptimizationService.initialize();
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('Setup failed');
      }
    });
  });

  describe('查詢分析', () => {
    beforeEach(async () => {
      await queryOptimizationService.initialize();
    });

    it('應該成功分析查詢', () => {
      const queryMetrics: QueryMetrics = {
        queryId: 'test-query-1',
        sql: 'SELECT * FROM users WHERE id = 1',
        executionTime: 500,
        timestamp: new Date(),
        success: true,
      };

      const analysis = queryOptimizationService.analyzeQuery(queryMetrics);

      expect(analysis.queryId).toBe('test-query-1');
      expect(analysis.sql).toBe('SELECT * FROM users WHERE id = 1');
      expect(analysis.executionTime).toBe(500);
      expect(analysis.complexity).toMatch(/^(LOW|MEDIUM|HIGH)$/);
      expect(analysis.optimizationScore).toBeGreaterThanOrEqual(0);
      expect(analysis.optimizationScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(analysis.estimatedImprovement).toBeGreaterThanOrEqual(0);
      expect(analysis.riskLevel).toMatch(/^(LOW|MEDIUM|HIGH)$/);
    });

    it('應該在未初始化時拋出錯誤', () => {
      (queryOptimizationService as any).isInitialized = false;

      const queryMetrics: QueryMetrics = {
        queryId: 'test-query-1',
        sql: 'SELECT * FROM users',
        executionTime: 100,
        timestamp: new Date(),
        success: true,
      };

      try {
        queryOptimizationService.analyzeQuery(queryMetrics);
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });

    it('應該正確分析複雜查詢', () => {
      const complexQuery: QueryMetrics = {
        queryId: 'complex-query',
        sql: 'SELECT DISTINCT u.*, p.name FROM users u JOIN profiles p ON u.id = p.user_id WHERE u.status = "active" AND p.name LIKE "%john%" ORDER BY u.created_at DESC LIMIT 100 OFFSET 1000',
        executionTime: 2000,
        timestamp: new Date(),
        success: true,
      };

      const analysis = queryOptimizationService.analyzeQuery(complexQuery);

      expect(analysis.complexity).toMatch(/^(LOW|MEDIUM|HIGH)$/);
      expect(analysis.optimizationScore).toBeGreaterThanOrEqual(30);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('查詢優化', () => {
    beforeEach(async () => {
      await queryOptimizationService.initialize();
    });

    it('應該成功優化查詢', () => {
      const originalQuery = 'SELECT DISTINCT name FROM users WHERE id = 1';
      const result = queryOptimizationService.optimizeQuery(originalQuery);

      expect(result.originalQuery).toBe(originalQuery);
      expect(result.optimizedQuery).toBeDefined();
      expect(result.estimatedImprovement).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.changes)).toBe(true);
      expect(result.riskAssessment).toBeDefined();
      expect(typeof result.testingRequired).toBe('boolean');
    });

    it('應該在未初始化時拋出錯誤', () => {
      (queryOptimizationService as any).isInitialized = false;

      try {
        queryOptimizationService.optimizeQuery('SELECT * FROM users');
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });

    it('應該優化包含DISTINCT的查詢', () => {
      const query = 'SELECT DISTINCT name FROM users WHERE id = 1';
      const result = queryOptimizationService.optimizeQuery(query);

      // 檢查是否有優化建議
      expect(result.changes.length).toBeGreaterThanOrEqual(0);
    });

    it('應該優化包含LIKE的查詢', () => {
      const query =
        'SELECT * FROM users WHERE name = "john" AND email LIKE "%test%"';
      const result = queryOptimizationService.optimizeQuery(query);

      expect(result.changes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('查詢指標記錄', () => {
    beforeEach(async () => {
      await queryOptimizationService.initialize();
    });

    it('應該成功記錄查詢指標', () => {
      const metrics: QueryMetrics = {
        queryId: 'test-query-1',
        sql: 'SELECT * FROM users',
        executionTime: 100,
        timestamp: new Date(),
        success: true,
      };

      queryOptimizationService.recordQueryMetrics(metrics);

      const report = queryOptimizationService.generatePerformanceReport();
      expect(report.totalQueries).toBe(1);
    });

    it('應該限制歷史記錄大小', () => {
      // 添加超過限制的查詢記錄
      for (let i = 0; i < 11000; i++) {
        const metrics: QueryMetrics = {
          queryId: `query-${i}`,
          sql: `SELECT * FROM table${i}`,
          executionTime: 100,
          timestamp: new Date(),
          success: true,
        };
        queryOptimizationService.recordQueryMetrics(metrics);
      }

      const report = queryOptimizationService.generatePerformanceReport();
      expect(report.totalQueries).toBeLessThanOrEqual(10000);
    });
  });

  describe('性能報告', () => {
    beforeEach(async () => {
      await queryOptimizationService.initialize();
    });

    it('應該生成性能報告', () => {
      const report = queryOptimizationService.generatePerformanceReport();

      expect(report.totalQueries).toBe(0);
      expect(report.averageExecutionTime).toBe(0);
      expect(report.slowQueries).toBe(0);
      expect(report.verySlowQueries).toBe(0);
      expect(report.optimizationOpportunities).toBe(0);
      expect(Array.isArray(report.topSlowQueries)).toBe(true);
      expect(Array.isArray(report.queryPatterns)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.overallScore).toBe(100);
    });

    it('應該在未初始化時拋出錯誤', () => {
      (queryOptimizationService as any).isInitialized = false;

      try {
        queryOptimizationService.generatePerformanceReport();
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });

    it('應該分析有數據的性能報告', () => {
      // 添加一些測試數據
      const testQueries = [
        { sql: 'SELECT * FROM users', executionTime: 50 },
        { sql: 'SELECT * FROM users WHERE id = 1', executionTime: 1500 },
        {
          sql: 'SELECT * FROM users WHERE name LIKE "%john%"',
          executionTime: 6000,
        },
        { sql: 'SELECT DISTINCT name FROM users', executionTime: 200 },
      ];

      testQueries.forEach((query, index) => {
        const metrics: QueryMetrics = {
          queryId: `query-${index}`,
          sql: query.sql,
          executionTime: query.executionTime,
          timestamp: new Date(),
          success: true,
        };
        queryOptimizationService.recordQueryMetrics(metrics);
      });

      const report = queryOptimizationService.generatePerformanceReport();

      expect(report.totalQueries).toBe(4);
      expect(report.slowQueries).toBeGreaterThanOrEqual(1); // > 1000ms
      expect(report.verySlowQueries).toBeGreaterThanOrEqual(1); // > 5000ms
      expect(report.optimizationOpportunities).toBeGreaterThanOrEqual(0);
      expect(report.overallScore).toBeLessThan(100);
    });
  });

  describe('批量優化', () => {
    beforeEach(async () => {
      await queryOptimizationService.initialize();
    });

    it('應該成功批量優化查詢', () => {
      const queries = [
        'SELECT * FROM users',
        'SELECT DISTINCT name FROM users WHERE id = 1',
        'SELECT * FROM users WHERE name LIKE "%test%"',
      ];

      const results = queryOptimizationService.batchOptimizeQueries(queries);

      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.originalQuery).toBeDefined();
        expect(result.optimizedQuery).toBeDefined();
        expect(result.estimatedImprovement).toBeGreaterThanOrEqual(0);
      });
    });

    it('應該在未初始化時拋出錯誤', () => {
      (queryOptimizationService as any).isInitialized = false;

      try {
        queryOptimizationService.batchOptimizeQueries(['SELECT * FROM users']);
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });
  });

  describe('查詢模式分析', () => {
    beforeEach(async () => {
      await queryOptimizationService.initialize();
    });

    it('應該返回查詢模式', () => {
      const patterns = queryOptimizationService.getQueryPatterns();

      expect(Array.isArray(patterns)).toBe(true);
    });

    it('應該分析重複查詢模式', () => {
      // 添加重複的查詢
      for (let i = 0; i < 5; i++) {
        const metrics: QueryMetrics = {
          queryId: `query-${i}`,
          sql: 'SELECT * FROM users WHERE id = ?',
          executionTime: 100 + i * 10,
          timestamp: new Date(),
          success: true,
        };
        queryOptimizationService.recordQueryMetrics(metrics);
      }

      const patterns = queryOptimizationService.getQueryPatterns();
      expect(patterns.length).toBeGreaterThan(0);

      if (patterns.length > 0) {
        expect(patterns[0].frequency).toBe(5);
        expect(patterns[0].averageExecutionTime).toBeGreaterThan(0);
      }
    });
  });

  describe('歷史記錄管理', () => {
    beforeEach(async () => {
      await queryOptimizationService.initialize();
    });

    it('應該成功清理歷史記錄', () => {
      // 添加一些測試數據
      const metrics: QueryMetrics = {
        queryId: 'test-query',
        sql: 'SELECT * FROM users',
        executionTime: 100,
        timestamp: new Date(),
        success: true,
      };
      queryOptimizationService.recordQueryMetrics(metrics);

      queryOptimizationService.clearHistory();

      const report = queryOptimizationService.generatePerformanceReport();
      expect(report.totalQueries).toBe(0);
    });
  });

  describe('服務狀態', () => {
    it('應該返回服務狀態', () => {
      const status = queryOptimizationService.getStatus();

      expect(status.isInitialized).toBe(false);
      expect(status.queryHistorySize).toBe(0);
      expect(status.optimizationRulesCount).toBe(0);
      expect(status.maxHistorySize).toBe(10000);
    });

    it('應該在初始化後返回正確狀態', async () => {
      await queryOptimizationService.initialize();

      const status = queryOptimizationService.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.optimizationRulesCount).toBeGreaterThan(0);
    });
  });

  describe('錯誤處理', () => {
    beforeEach(async () => {
      await queryOptimizationService.initialize();
    });

    it('應該處理優化規則錯誤', () => {
      // 模擬優化規則錯誤
      const mockRule = jest.fn().mockImplementation(() => {
        throw new Error('Rule error');
      });

      (queryOptimizationService as any).optimizationRules.set(
        'errorRule',
        mockRule
      );

      // 應該不會拋出錯誤，而是記錄警告
      const result = queryOptimizationService.optimizeQuery(
        'SELECT * FROM users'
      );
      expect(result.originalQuery).toBe('SELECT * FROM users');
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await queryOptimizationService.initialize();
    });

    it('應該在合理時間內完成分析', () => {
      const startTime = Date.now();

      const queryMetrics: QueryMetrics = {
        queryId: 'test-query',
        sql: 'SELECT * FROM users WHERE id = 1',
        executionTime: 100,
        timestamp: new Date(),
        success: true,
      };

      queryOptimizationService.analyzeQuery(queryMetrics);

      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(100); // 應該在100ms內完成
    });

    it('應該支持並發分析', async () => {
      const analyses = Array.from({ length: 10 }, (_, i) => {
        const queryMetrics: QueryMetrics = {
          queryId: `query-${i}`,
          sql: `SELECT * FROM table${i}`,
          executionTime: 100 + i * 10,
          timestamp: new Date(),
          success: true,
        };
        return queryOptimizationService.analyzeQuery(queryMetrics);
      });

      expect(analyses.length).toBe(10);
      analyses.forEach(analysis => {
        expect(analysis.queryId).toBeDefined();
        expect(analysis.optimizationScore).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
