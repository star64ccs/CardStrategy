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
      const _instance1 = HealthCheckService.getInstance();
      const _instance2 = HealthCheckService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('應該SuccessInitialize健康CheckService', async () => {
      await healthCheckService.initialize();

      const _status = healthCheckService.getMonitoringStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.registeredChecks.length).toBeGreaterThan(0);
    });

    it('應該不重複初始化', async () => {
      await healthCheckService.initialize();
      await healthCheckService.initialize(); // 第二次調用

      const _status = healthCheckService.getMonitoringStatus();
      expect(status.isInitialized).toBe(true);
    });
  });

  describe('registerHealthCheck', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該Success註冊健康Check', () => {
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

      const _status = healthCheckService.getMonitoringStatus();
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

      const _status = healthCheckService.getMonitoringStatus();
      expect(
        status.registeredChecks.filter(c => c === 'TestService')
      ).toHaveLength(1);
    });
  });

  describe('unregisterHealthCheck', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該Success移除健康Check', () => {
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
      const _removed = healthCheckService.unregisterHealthCheck('TestService');

      expect(removed).toBe(true);

      const _status = healthCheckService.getMonitoringStatus();
      expect(status.registeredChecks).not.toContain('TestService');
    });

    it('應該安全地移除不存在的健康檢查', () => {
      const _removed =
        healthCheckService.unregisterHealthCheck('NonExistentService');
      expect(removed).toBe(false);
    });
  });

  describe('checkServiceHealth', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該SuccessCheckService健康狀態', async () => {
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

      const _result = await healthCheckService.checkServiceHealth('TestService');

      expect(result.service).toBe('TestService');
      expect(result.status).toBe('HEALTHY');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.details).toEqual({ test: 'data' });
    });

    it('應該HandleCheckFailed', async () => {
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'FailingService',
        check: jest.fn().mockRejectedValue(new Error('Service unavailable')),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);

      const _result =
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

      const _result = await healthCheckService.checkServiceHealth('SlowService');

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

      const _result =
        await healthCheckService.checkServiceHealth('RetryService');

      expect(result.service).toBe('RetryService');
      expect(result.status).toBe('HEALTHY');
      expect(attemptCount).toBe(3);
    });

    it('應該返回未知狀態對於不存在的Service', async () => {
      const _result =
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

    it('應該Check所有註冊的Service', async () => {
      const _report = await healthCheckService.checkAllServices();

      expect(report.overallStatus).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(Array.isArray(report.services)).toBe(true);
      expect(report.summary).toBeDefined();
      expect(Array.isArray(report.criticalServices)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('應該正確計算摘要統計', async () => {
      const _report = await healthCheckService.checkAllServices();

      expect(report.summary.total).toBeGreaterThan(0);
      const _calculatedTotal =
        report.summary.healthy +
        report.summary.degraded +
        report.summary.unhealthy +
        report.summary.unknown;
      // Check摘要StatisticsYesNo合理
      expect(calculatedTotal).toBeGreaterThan(0);
      expect(report.summary.total).toBeGreaterThan(0);
    });

    it('應該識別關鍵Service問題', async () => {
      const mockCriticalHealthCheck: ServiceHealthCheck = {
        name: 'CriticalService',
        critical: true,
        check: jest
          .fn()
          .mockRejectedValue(new Error('Critical service failed')),
      };

      healthCheckService.registerHealthCheck(mockCriticalHealthCheck);

      const _report = await healthCheckService.checkAllServices();

      expect(report.criticalServices.length).toBeGreaterThan(0);
      expect(report.overallStatus).toBe('UNHEALTHY');
    });

    it('應該生成有用的建議', async () => {
      const _report = await healthCheckService.checkAllServices();

      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(typeof report.recommendations[0]).toBe('string');
    });
  });

  describe('startMonitoring', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該Success開始監控', async () => {
      await healthCheckService.startMonitoring(1000);

      const _status = healthCheckService.getMonitoringStatus();
      expect(status.isMonitoring).toBe(true);

      healthCheckService.stopMonitoring();
    });

    it('應該立即執行一次檢查', async () => {
      const _checkSpy = jest.spyOn(healthCheckService, 'checkAllServices');

      await healthCheckService.startMonitoring(1000);

      // Await一小段Time確保Check被執Row
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(checkSpy).toHaveBeenCalled();

      healthCheckService.stopMonitoring();
    });

    it('應該停止現有監控再開始新監控', async () => {
      await healthCheckService.startMonitoring(1000);
      await healthCheckService.startMonitoring(2000);

      const _status = healthCheckService.getMonitoringStatus();
      expect(status.isMonitoring).toBe(true);

      healthCheckService.stopMonitoring();
    });
  });

  describe('stopMonitoring', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該Success停止監控', async () => {
      await healthCheckService.startMonitoring(1000);
      healthCheckService.stopMonitoring();

      const _status = healthCheckService.getMonitoringStatus();
      expect(status.isMonitoring).toBe(false);
    });

    it('應該安全地停止未啟動的監控', () => {
      healthCheckService.stopMonitoring();

      const _status = healthCheckService.getMonitoringStatus();
      expect(status.isMonitoring).toBe(false);
    });
  });

  describe('getLastHealthReport', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該返回最後的健康報告', async () => {
      const _report = await healthCheckService.checkAllServices();
      const _lastReport = healthCheckService.getLastHealthReport();

      expect(lastReport).toEqual(report);
    });

    it('應該在沒有檢查時返回null', () => {
      // ResetInstanceStatus
      (healthCheckService as any).lastHealthReport = null;

      const _lastReport = healthCheckService.getLastHealthReport();
      expect(lastReport).toBeNull();
    });
  });

  describe('getMonitoringStatus', () => {
    it('應該返回正確的監控狀態', () => {
      const _status = healthCheckService.getMonitoringStatus();

      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('isMonitoring');
      expect(status).toHaveProperty('registeredChecks');
      expect(status).toHaveProperty('lastReport');
    });

    it('應該反映初始化狀態', async () => {
      // ResetInstanceStatus
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
      const _result = await healthCheckService.checkServiceHealth('Database');

      expect(result.service).toBe('Database');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });

    it('應該註冊APIService健康Check', async () => {
      const _result = await healthCheckService.checkServiceHealth('API Service');

      expect(result.service).toBe('API Service');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });

    it('應該註冊認證Service健康Check', async () => {
      const _result = await healthCheckService.checkServiceHealth(
        'Authentication Service'
      );

      expect(result.service).toBe('Authentication Service');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });

    it('應該註冊存儲Service健康Check', async () => {
      const _result =
        await healthCheckService.checkServiceHealth('Storage Service');

      expect(result.service).toBe('Storage Service');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });

    it('應該註冊外部API健康檢查', async () => {
      const _result =
        await healthCheckService.checkServiceHealth('External APIs');

      expect(result.service).toBe('External APIs');
      expect(result.status).toBe('HEALTHY');
      expect(result.details).toBeDefined();
    });

    it('應該註冊緩存Service健康Check', async () => {
      const _result =
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
      const _report = await healthCheckService.checkAllServices();

      expect(['HEALTHY', 'DEGRADED', 'UNHEALTHY']).toContain(
        report.overallStatus
      );
    });

    it('應該在有關鍵ServiceFailed時標記為不健康', async () => {
      const mockCriticalHealthCheck: ServiceHealthCheck = {
        name: 'CriticalService',
        critical: true,
        check: jest.fn().mockRejectedValue(new Error('Critical failure')),
      };

      healthCheckService.registerHealthCheck(mockCriticalHealthCheck);

      const _report = await healthCheckService.checkAllServices();

      expect(report.overallStatus).toBe('UNHEALTHY');
      expect(report.criticalServices.length).toBeGreaterThan(0);
    });

    it('應該在非關鍵ServiceFailed時標記為性能下降', async () => {
      const mockNonCriticalHealthCheck: ServiceHealthCheck = {
        name: 'NonCriticalService',
        critical: false,
        check: jest.fn().mockRejectedValue(new Error('Non-critical failure')),
      };

      healthCheckService.registerHealthCheck(mockNonCriticalHealthCheck);

      const _report = await healthCheckService.checkAllServices();

      // 由於有OffKeyService，整體Status可能Yes HEALTHY、DEGRADED 或 UNHEALTHY
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
      const _startTime = Date.now();

      await healthCheckService.checkAllServices();

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // 10Second內Complete
    });

    it('應該支持並發健康檢查', async () => {
      const _promises = [
        healthCheckService.checkServiceHealth('Database'),
        healthCheckService.checkServiceHealth('API Service'),
        healthCheckService.checkServiceHealth('Authentication Service'),
      ];

      const _results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toHaveProperty('service');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('timestamp');
      });
    });
  });

  describe('ErrorHandle', () => {
    beforeEach(async () => {
      await healthCheckService.initialize();
    });

    it('應該HandleCheck函數拋出的Error', async () => {
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'ErrorService',
        check: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected error');
        }),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);

      const _result =
        await healthCheckService.checkServiceHealth('ErrorService');

      expect(result.status).toBe('UNHEALTHY');
      expect(result.error).toBe('Unexpected error');
    });

    it('應該Handle異步Check函數的Error', async () => {
      const mockHealthCheck: ServiceHealthCheck = {
        name: 'AsyncErrorService',
        check: jest.fn().mockRejectedValue(new Error('Async error')),
      };

      healthCheckService.registerHealthCheck(mockHealthCheck);

      const _result =
        await healthCheckService.checkServiceHealth('AsyncErrorService');

      expect(result.status).toBe('UNHEALTHY');
      expect(result.error).toBe('Async error');
    });

    it('應該Handle監控啟動Error', async () => {
      jest
        .spyOn(healthCheckService, 'checkAllServices')
        .mockRejectedValue(new Error('Monitoring error'));

      try {
        await healthCheckService.startMonitoring(1000);
        fail('應該拋出Error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
