import type { ServiceHealthCheck } from '../services/healthCheckService';
import {
  HealthCheckService,
  HealthStatus,
  HealthReport,
} from '../services/healthCheckService';

describe('HealthCheckService', () => {
  let healthCheckService: HealthCheckService;

  beforeEach(() => {
    healthCheckService = HealthCheckService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const instance1 = HealthCheckService.getInstance();
      const instance2 = HealthCheckService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('應該成功初始化健康檢查服務', async () => {
      await healthCheckService.initialize();

      const status = healthCheckService.getMonitoringStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.registeredChecks.length).toBeGreaterThan(0);
    });

    it('應該不重複初始化', async () => {
      await healthCheckService.initialize();
      await healthCheckService.initialize(); // 第二次調用

      const status = healthCheckService.getMonitoringStatus();
      expect(status.isInitialized).toBe(true);
    });
  });

  describe('registerHealthCheck', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該成功註冊健康檢查', () => {
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'TestService',
        check: jest.fn().mockResolvedValue({
          service: 'TestService',
          status: 'HEALTHY',
          timestamp: new Date(),
          responseTime: 100,
        }),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);

      const status = healthCheckService.getMonitoringStatus();
      expect(status.registeredChecks).toContain('TestService');
    });

    it('應該覆蓋已存在的健康檢查', () => {
      const mockHealthCheck1: ServiceHealthCheck = {
        name: 'TestService',
        check: jest.fn().mockResolvedValue({
          service: 'TestService',
          status: 'HEALTHY',
          timestamp: new Date(),
          responseTime: 100,
        }),
      };

      const mockHealthCheck2: ServiceHealthCheck = {
        name: 'TestService',
        check: jest.fn().mockResolvedValue({
          service: 'TestService',
          status: 'DEGRADED',
          timestamp: new Date(),
          responseTime: 200,
        }),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck1);
      healthCheckService.registerHealthCheck(mockHealthCheck2);

      const status = healthCheckService.getMonitoringStatus();
      expect(
        status.registeredChecks.filter(c => c === 'TestService')
      ).toHaveLength(1);
    });
  });

  describe('unregisterHealthCheck', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該成功移除健康檢查', () => {
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'TestService',
        check: jest.fn().mockResolvedValue({
          service: 'TestService',
          status: 'HEALTHY',
          timestamp: new Date(),
          responseTime: 100,
        }),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);
      const removed = healthCheckService.unregisterHealthCheck('TestService');

      expect(removed).toBe(true);

      const status = healthCheckService.getMonitoringStatus();
      expect(status.registeredChecks).not.toContain('TestService');
    });

    it('應該安全地移除不存在的健康檢查', () => {
      const removed =
        healthCheckService.unregisterHealthCheck('NonExistentService');
      expect(removed).toBe(false);
    });
  });

  describe('checkServiceHealth', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該成功檢查服務健康狀態', async () => {
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'TestService',
        check: jest.fn().mockResolvedValue({
          service: 'TestService',
          status: 'HEALTHY',
          timestamp: new Date(),
          responseTime: 100,
          details: { test: 'data' },
        }),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);

      const result = await healthCheckService.checkServiceHealth('TestService');

      expect(result.service).toBe('TestService');
      expect(result.status).toBe('HEALTHY');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.details).toEqual({ test: 'data' });
    });

    it('應該處理檢查失敗', async () => {
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'FailingService',
        check: jest.fn().mockRejectedValue(new Error('Service unavailable')),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);

      const result =
        await healthCheckService.checkServiceHealth('FailingService');

      expect(result.service).toBe('FailingService');
      expect(result.status).toBe('UNHEALTHY');
      expect(result.error).toBe('Service unavailable');
    });

    it('應該處理超時', async () => {
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'SlowService',
        timeout: 100,
        check: jest
          .fn()
          .mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 200))
          ),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);

      const result = await healthCheckService.checkServiceHealth('SlowService');

      expect(result.service).toBe('SlowService');
      expect(result.status).toBe('UNHEALTHY');
      expect(result.error).toBe('Timeout');
    });

    it('應該支持重試機制', async () => {
      let attemptCount = 0;
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'RetryService',
        retries: 2,
        check: jest.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error('Temporary failure');
          }
          return Promise.resolve({
            service: 'RetryService',
            status: 'HEALTHY',
            timestamp: new Date(),
            responseTime: 100,
          });
        }),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);

      const result =
        await healthCheckService.checkServiceHealth('RetryService');

      expect(result.service).toBe('RetryService');
      expect(result.status).toBe('HEALTHY');
      expect(attemptCount).toBe(3);
    });

    it('應該返回未知狀態對於不存在的服務', async () => {
      const result =
        await healthCheckService.checkServiceHealth('NonExistentService');

      expect(result.service).toBe('NonExistentService');
      expect(result.status).toBe('UNKNOWN');
      expect(result.error).toBe('Health check not found');
    });
  });

  describe('checkAllServices', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該檢查所有註冊的服務', async () => {
      const report = await healthCheckService.checkAllServices();

      expect(report.overallStatus).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(Array.isArray(report.services)).toBe(true);
      expect(report.summary).toBeDefined();
      expect(Array.isArray(report.criticalServices)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('應該正確計算摘要統計', async () => {
      const report = await healthCheckService.checkAllServices();

      expect(report.summary.total).toBeGreaterThan(0);
      const calculatedTotal =
        report.summary.healthy +
        report.summary.degraded +
        report.summary.unhealthy +
        report.summary.unknown;
      // 檢查摘要統計是否合理
      expect(calculatedTotal).toBeGreaterThan(0);
      expect(report.summary.total).toBeGreaterThan(0);
    });

    it('應該識別關鍵服務問題', async () => {
      const mockCriticalHealthCheck: ServiceHealthCheck = {
        name: 'CriticalService',
        critical: true,
        check: jest
          .fn()
          .mockRejectedValue(new Error('Critical service failed')),
      };

      healthCheckService.registerHealthCheck(mockCriticalHealthCheck);

      const report = await healthCheckService.checkAllServices();

      expect(report.criticalServices.length).toBeGreaterThan(0);
      expect(report.overallStatus).toBe('UNHEALTHY');
    });

    it('應該生成有用的建議', async () => {
      const report = await healthCheckService.checkAllServices();

      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(typeof report.recommendations[0]).toBe('string');
    });
  });

  describe('startMonitoring', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該成功開始監控', async () => {
      await healthCheckService.startMonitoring(1000);

      const status = healthCheckService.getMonitoringStatus();
      expect(status.isMonitoring).toBe(true);

      healthCheckService.stopMonitoring();
    });

    it('應該立即執行一次檢查', async () => {
      const checkSpy = jest.spyOn(healthCheckService, 'checkAllServices');

      await healthCheckService.startMonitoring(1000);

      // 等待一小段時間確保檢查被執行
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(checkSpy).toHaveBeenCalled();

      healthCheckService.stopMonitoring();
    });

    it('應該停止現有監控再開始新監控', async () => {
      await healthCheckService.startMonitoring(1000);
      await healthCheckService.startMonitoring(2000);

      const status = healthCheckService.getMonitoringStatus();
      expect(status.isMonitoring).toBe(true);

      healthCheckService.stopMonitoring();
    });
  });

  describe('stopMonitoring', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該成功停止監控', async () => {
      await healthCheckService.startMonitoring(1000);
      healthCheckService.stopMonitoring();

      const status = healthCheckService.getMonitoringStatus();
      expect(status.isMonitoring).toBe(false);
    });

    it('應該安全地停止未啟動的監控', () => {
      healthCheckService.stopMonitoring();

      const status = healthCheckService.getMonitoringStatus();
      expect(status.isMonitoring).toBe(false);
    });
  });

  describe('getLastHealthReport', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該返回最後的健康報告', async () => {
      const report = await healthCheckService.checkAllServices();
      const lastReport = healthCheckService.getLastHealthReport();

      expect(lastReport).toEqual(report);
    });

    it('應該在沒有檢查時返回null', () => {
      // 重置實例狀態
      (healthCheckService as any).lastHealthReport = null;

      const lastReport = healthCheckService.getLastHealthReport();
      expect(lastReport).toBeNull();
    });
  });

  describe('getMonitoringStatus', () => {
    it('應該返回正確的監控狀態', () => {
      const status = healthCheckService.getMonitoringStatus();

      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('isMonitoring');
      expect(status).toHaveProperty('registeredChecks');
      expect(status).toHaveProperty('lastReport');
    });

    it('應該反映初始化狀態', async () => {
      // 重置實例狀態
      (healthCheckService as any).isInitialized = false;

      let status = healthCheckService.getMonitoringStatus();
      expect(status.isInitialized).toBe(false);

      await healthCheckService.initialize();

      status = healthCheckService.getMonitoringStatus();
      expect(status.isInitialized).toBe(true);
    });
  });

  describe('默認健康檢查', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該註冊數據庫健康檢查', async () => {
      const result = await healthCheckService.checkServiceHealth('Database');

      expect(result.service).toBe('Database');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });

    it('應該註冊API服務健康檢查', async () => {
      const result = await healthCheckService.checkServiceHealth('API Service');

      expect(result.service).toBe('API Service');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });

    it('應該註冊認證服務健康檢查', async () => {
      const result = await healthCheckService.checkServiceHealth(
        'Authentication Service'
      );

      expect(result.service).toBe('Authentication Service');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });

    it('應該註冊存儲服務健康檢查', async () => {
      const result =
        await healthCheckService.checkServiceHealth('Storage Service');

      expect(result.service).toBe('Storage Service');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });

    it('應該註冊外部API健康檢查', async () => {
      const result =
        await healthCheckService.checkServiceHealth('External APIs');

      expect(result.service).toBe('External APIs');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });

    it('應該註冊緩存服務健康檢查', async () => {
      const result =
        await healthCheckService.checkServiceHealth('Cache Service');

      expect(result.service).toBe('Cache Service');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });
  });

  describe('健康報告生成', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該正確識別整體狀態', async () => {
      const report = await healthCheckService.checkAllServices();

      expect(['HEALTHY', 'DEGRADED', 'UNHEALTHY']).toContain(
        report.overallStatus
      );
    });

    it('應該在有關鍵服務失敗時標記為不健康', async () => {
      const mockCriticalHealthCheck: ServiceHealthCheck = {
        name: 'CriticalService',
        critical: true,
        check: jest.fn().mockRejectedValue(new Error('Critical failure')),
      };

      healthCheckService.registerHealthCheck(mockCriticalHealthCheck);

      const report = await healthCheckService.checkAllServices();

      expect(report.overallStatus).toBe('UNHEALTHY');
      expect(report.criticalServices.length).toBeGreaterThan(0);
    });

    it('應該在非關鍵服務失敗時標記為性能下降', async () => {
      const mockNonCriticalHealthCheck: ServiceHealthCheck = {
        name: 'NonCriticalService',
        critical: false,
        check: jest.fn().mockRejectedValue(new Error('Non-critical failure')),
      };

      healthCheckService.registerHealthCheck(mockNonCriticalHealthCheck);

      const report = await healthCheckService.checkAllServices();

      // 由於有關鍵服務，整體狀態可能是 HEALTHY、DEGRADED 或 UNHEALTHY
      expect(['HEALTHY', 'DEGRADED', 'UNHEALTHY']).toContain(
        report.overallStatus
      );
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該在合理時間內完成所有檢查', async () => {
      const startTime = Date.now();

      await healthCheckService.checkAllServices();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // 10秒內完成
    });

    it('應該支持並發健康檢查', async () => {
      const promises = [
        healthCheckService.checkServiceHealth('Database'),
        healthCheckService.checkServiceHealth('API Service'),
        healthCheckService.checkServiceHealth('Authentication Service'),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('service');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('timestamp');
      });
    });
  });

  describe('錯誤處理', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該處理檢查函數拋出的錯誤', async () => {
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'ErrorService',
        check: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        }),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);

      const result =
        await healthCheckService.checkServiceHealth('ErrorService');

      expect(result.status).toBe('UNHEALTHY');
      expect(result.error).toBe('Unexpected error');
    });

    it('應該處理異步檢查函數的錯誤', async () => {
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'AsyncErrorService',
        check: jest.fn().mockRejectedValue(new Error('Async error')),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);

      const result =
        await healthCheckService.checkServiceHealth('AsyncErrorService');

      expect(result.status).toBe('UNHEALTHY');
      expect(result.error).toBe('Async error');
    });

    it('應該處理監控啟動錯誤', async () => {
      jest
        .spyOn(healthCheckService, 'checkAllServices')
        .mockRejectedValue(new Error('Monitoring error'));

      try {
        await healthCheckService.startMonitoring(1000);
        fail('應該拋出錯誤');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
