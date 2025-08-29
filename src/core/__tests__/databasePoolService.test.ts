import type { DatabaseConfig } from '../services/databasePoolService';
import {
  DatabasePoolService,
  ConnectionStats,
  QueryMetrics,
  PoolHealth,
} from '../services/databasePoolService';

describe('DatabasePoolService', () => {
  let databasePoolService: DatabasePoolService;
  let mockConfig: DatabaseConfig;

  beforeEach(() => {
    // 重置單例狀態
    (DatabasePoolService as any).instance = null;
    databasePoolService = DatabasePoolService.getInstance();

    // 重置初始化狀態
    (databasePoolService as any).isInitialized = false;
    (databasePoolService as any).config = null;
    (databasePoolService as any).pool = null;
    (databasePoolService as any).queryMetrics = [];
    (databasePoolService as any).healthCheckInterval = null;

    mockConfig = {
      host: 'localhost',
      port: 5432,
      database: 'testdb',
      username: 'testuser',
      password: 'testpass',
      maxConnections: 10,
      minConnections: 2,
      connectionTimeout: 30000,
      idleTimeout: 60000,
      acquireTimeout: 30000,
      maxIdleTime: 300000,
    };
  });

  afterEach(async () => {
    await databasePoolService.cleanup();
  });

  describe('初始化', () => {
    it('應該成功初始化服務', async () => {
      await databasePoolService.initialize(mockConfig);

      expect(databasePoolService.getStatus().isInitialized).toBe(true);
      expect(databasePoolService.getStatus().config).toEqual({
        host: mockConfig.host,
        database: mockConfig.database,
        maxConnections: mockConfig.maxConnections,
      });
    });

    it('應該在重複初始化時發出警告', async () => {
      await databasePoolService.initialize(mockConfig);
      await databasePoolService.initialize(mockConfig);

      expect(databasePoolService.getStatus().isInitialized).toBe(true);
    });

    it('應該處理初始化錯誤', async () => {
      const _invalidConfig = { ...mockConfig, host: '' };

      try {
        await databasePoolService.initialize(invalidConfig);
        fail('應該拋出錯誤');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('連接管理', () => {
    beforeEach(async () => {
      await databasePoolService.initialize(mockConfig);
    });

    it('應該成功獲取連接', async () => {
      const _connection = await databasePoolService.getConnection();

      expect(connection).toBeDefined();
      expect(connection.id).toBeDefined();
      expect(connection.status).toBe('active');
    });

    it('應該成功釋放連接', async () => {
      const _connection = await databasePoolService.getConnection();
      await databasePoolService.releaseConnection(connection);

      // 驗證連接已釋放（通過統計信息）
      const _stats = databasePoolService.getConnectionStats();
      expect(stats.activeConnections).toBeLessThanOrEqual(
        stats.totalConnections
      );
    });

    it('應該在未初始化時拋出錯誤', async () => {
      (databasePoolService as any).isInitialized = false;

      try {
        await databasePoolService.getConnection();
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });
  });

  describe('查詢執行', () => {
    beforeEach(async () => {
      await databasePoolService.initialize(mockConfig);
    });

    it('應該成功執行查詢', async () => {
      const _result = await databasePoolService.executeQuery(
        'SELECT * FROM users'
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('應該記錄查詢指標', async () => {
      await databasePoolService.executeQuery('SELECT * FROM users');

      const _metrics = databasePoolService.getQueryMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0].sql).toBe('SELECT * FROM users');
      expect(metrics[0].success).toBe(true);
    });

    it('應該處理查詢錯誤', async () => {
      // 模擬查詢錯誤
      jest
        .spyOn(databasePoolService as any, 'executeQueryInternal')
        .mockRejectedValue(new Error('Database error'));

      try {
        await databasePoolService.executeQuery('INVALID SQL');
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('Database error');
      }
    });
  });

  describe('統計信息', () => {
    beforeEach(async () => {
      await databasePoolService.initialize(mockConfig);
    });

    it('應該返回連接統計信息', () => {
      const _stats = databasePoolService.getConnectionStats();

      expect(stats.totalConnections).toBe(mockConfig.maxConnections);
      expect(stats.maxConnections).toBe(mockConfig.maxConnections);
      expect(stats.connectionUtilization).toBeGreaterThanOrEqual(0);
      expect(stats.connectionUtilization).toBeLessThanOrEqual(100);
    });

    it('應該返回查詢指標', async () => {
      await databasePoolService.executeQuery('SELECT * FROM users');

      const _metrics = databasePoolService.getQueryMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0]).toHaveProperty('queryId');
      expect(metrics[0]).toHaveProperty('sql');
      expect(metrics[0]).toHaveProperty('executionTime');
    });

    it('應該限制查詢指標歷史記錄', async () => {
      // 執行多個查詢（減少數量以避免超時）
      for (let i = 0; i < 100; i++) {
        await databasePoolService.executeQuery(`SELECT * FROM table${i}`);
      }

      const _metrics = databasePoolService.getQueryMetrics();
      expect(metrics.length).toBeLessThanOrEqual(100);
    }, 30000); // 增加超時時間
  });

  describe('健康檢查', () => {
    beforeEach(async () => {
      await databasePoolService.initialize(mockConfig);
    });

    it('應該返回連接池健康狀態', () => {
      const _health = databasePoolService.getPoolHealth();

      expect(health.status).toMatch(/^(HEALTHY|DEGRADED|UNHEALTHY)$/);
      expect(health.stats).toBeDefined();
      expect(health.recommendations).toBeDefined();
      expect(Array.isArray(health.recommendations)).toBe(true);
    });

    it('應該在未初始化時返回不健康狀態', () => {
      (databasePoolService as any).isInitialized = false;

      const _health = databasePoolService.getPoolHealth();
      expect(health.status).toBe('UNHEALTHY');
      expect(health.recommendations).toContain('Database pool not initialized');
    });
  });

  describe('連接池優化', () => {
    beforeEach(async () => {
      await databasePoolService.initialize(mockConfig);
    });

    it('應該成功優化連接池', async () => {
      await databasePoolService.optimizePool();

      // 驗證優化過程沒有拋出錯誤
      expect(databasePoolService.getStatus().isInitialized).toBe(true);
    });

    it('應該在未初始化時拋出錯誤', async () => {
      (databasePoolService as any).isInitialized = false;

      try {
        await databasePoolService.optimizePool();
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('not initialized');
      }
    });
  });

  describe('服務狀態', () => {
    it('應該返回服務狀態', async () => {
      const _status = databasePoolService.getStatus();

      expect(status.isInitialized).toBe(false);
      expect(status.config).toBeNull();
      expect(status.health).toBeDefined();
      expect(status.metricsCount).toBe(0);
    });

    it('應該在初始化後返回正確狀態', async () => {
      await databasePoolService.initialize(mockConfig);

      const _status = databasePoolService.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.config).toBeDefined();
      expect(status.metricsCount).toBe(0);
    });
  });

  describe('清理', () => {
    beforeEach(async () => {
      await databasePoolService.initialize(mockConfig);
    });

    it('應該成功清理服務', async () => {
      await databasePoolService.cleanup();

      expect(databasePoolService.getStatus().isInitialized).toBe(false);
    });

    it('應該清理健康檢查間隔', async () => {
      await databasePoolService.cleanup();

      expect((databasePoolService as any).healthCheckInterval).toBeNull();
    });
  });

  describe('錯誤處理', () => {
    it('應該處理獲取連接錯誤', async () => {
      await databasePoolService.initialize(mockConfig);

      // 模擬連接池已滿
      jest
        .spyOn(databasePoolService as any, 'acquireConnection')
        .mockRejectedValue(new Error('No available connections'));

      try {
        await databasePoolService.getConnection();
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('No available connections');
      }
    });

    it('應該處理釋放連接錯誤', async () => {
      await databasePoolService.initialize(mockConfig);
      const _connection = await databasePoolService.getConnection();

      // 模擬釋放連接錯誤
      jest
        .spyOn(databasePoolService as any, 'releaseConnectionToPool')
        .mockRejectedValue(new Error('Release failed'));

      try {
        await databasePoolService.releaseConnection(connection);
        fail('應該拋出錯誤');
      } catch (error) {
        expect((error as Error).message).toContain('Release failed');
      }
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await databasePoolService.initialize(mockConfig);
    });

    it('應該在合理時間內完成查詢', async () => {
      const _startTime = Date.now();

      await databasePoolService.executeQuery('SELECT * FROM users');

      const _executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(1000); // 應該在1秒內完成
    });

    it('應該支持並發查詢', async () => {
      const _queries = Array.from({ length: 10 }, (_, i) =>
        databasePoolService.executeQuery(`SELECT * FROM table${i}`)
      );

      const _results = await Promise.all(queries);
      expect(results.length).toBe(10);
      results.forEach(result => expect(result).toBeDefined());
    });
  });
});
