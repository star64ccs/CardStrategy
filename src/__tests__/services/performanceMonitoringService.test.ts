import type { PerformanceMetrics } from '../../services/performanceMonitoringService';
import { PerformanceMonitoringService } from '../../services/performanceMonitoringService';

// Mock console.log
const _mockConsoleLog = jest.fn();
console.log = mockConsoleLog;

describe('PerformanceMonitoringService', () => {
  let performanceMonitoringService: PerformanceMonitoringService;

  beforeEach(() => {
    // 重置單例
    (PerformanceMonitoringService as any).instance = undefined;
    performanceMonitoringService = PerformanceMonitoringService.getInstance();
    mockConsoleLog.mockClear();
  });

  describe('單例模式測試', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = PerformanceMonitoringService.getInstance();
      const _instance2 = PerformanceMonitoringService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('應該正確初始化配置', () => {
      const _config = performanceMonitoringService.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.collectionInterval).toBe(5000);
      expect(config.alertThresholds.memoryUsage).toBe(80);
      expect(config.alertThresholds.cpuUsage).toBe(70);
    });
  });

  describe('初始化測試', () => {
    it('應該正確初始化服務', async () => {
      await performanceMonitoringService.initialize();
      expect(mockConsoleLog).toHaveBeenCalledWith('性能監控服務初始化完成');
    });

    it('應該初始化歷史數據', async () => {
      await performanceMonitoringService.initialize();
      const _baselines = performanceMonitoringService.getBaselines();
      const _optimizations = performanceMonitoringService.getOptimizations();

      expect(baselines.length).toBeGreaterThan(0);
      expect(optimizations.length).toBeGreaterThan(0);
    });
  });

  describe('監控控制測試', () => {
    beforeEach(async () => {
      await performanceMonitoringService.initialize();
    });

    it('應該開始監控', async () => {
      await performanceMonitoringService.startMonitoring();
      expect(mockConsoleLog).toHaveBeenCalledWith('開始性能監控...');
    });

    it('應該停止監控', () => {
      performanceMonitoringService.stopMonitoring();
      expect(mockConsoleLog).toHaveBeenCalledWith('性能監控已停止');
    });

    it('應該避免重複啟動監控', async () => {
      await performanceMonitoringService.startMonitoring();
      await performanceMonitoringService.startMonitoring();
      expect(mockConsoleLog).toHaveBeenCalledWith('性能監控已在運行中');
    });
  });

  describe('指標收集測試', () => {
    beforeEach(async () => {
      await performanceMonitoringService.initialize();
    });

    it('應該收集完整的性能指標', async () => {
      const _metrics = await performanceMonitoringService.collectMetrics();

      expect(metrics).toHaveProperty('id');
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('cpu');
      expect(metrics).toHaveProperty('network');
      expect(metrics).toHaveProperty('app');
      expect(metrics).toHaveProperty('battery');
    });

    it('應該收集正確的內存指標', async () => {
      const _metrics = await performanceMonitoringService.collectMetrics();

      expect(metrics.memory.used).toBeGreaterThan(0);
      expect(metrics.memory.total).toBe(512);
      expect(metrics.memory.usage).toBeGreaterThan(0);
      expect(metrics.memory.usage).toBeLessThanOrEqual(100);
    });

    it('應該收集正確的CPU指標', async () => {
      const _metrics = await performanceMonitoringService.collectMetrics();

      expect(metrics.cpu.usage).toBeGreaterThan(0);
      expect(metrics.cpu.usage).toBeLessThanOrEqual(100);
      expect(metrics.cpu.cores).toBeGreaterThan(0);
    });

    it('應該收集正確的網絡指標', async () => {
      const _metrics = await performanceMonitoringService.collectMetrics();

      expect(metrics.network.requests).toBeGreaterThan(0);
      expect(metrics.network.errors).toBeGreaterThanOrEqual(0);
      expect(metrics.network.averageResponseTime).toBeGreaterThan(0);
      expect(metrics.network.bandwidth).toBeGreaterThan(0);
    });

    it('應該收集正確的應用指標', async () => {
      const _metrics = await performanceMonitoringService.collectMetrics();

      expect(metrics.app.startupTime).toBeGreaterThan(0);
      expect(metrics.app.renderTime).toBeGreaterThan(0);
      expect(metrics.app.frameRate).toBeGreaterThan(0);
      expect(metrics.app.crashes).toBeGreaterThanOrEqual(0);
    });

    it('應該收集正確的電池指標', async () => {
      const _metrics = await performanceMonitoringService.collectMetrics();

      expect(metrics.battery.level).toBeGreaterThanOrEqual(0);
      expect(metrics.battery.level).toBeLessThanOrEqual(100);
      expect(typeof metrics.battery.isCharging).toBe('boolean');
      expect(metrics.battery.temperature).toBeGreaterThan(0);
    });
  });

  describe('警報檢查測試', () => {
    beforeEach(async () => {
      await performanceMonitoringService.initialize();
      // 清理之前的警報
      (performanceMonitoringService as any).alerts = [];
    });

    it('應該在內存使用率過高時生成警報', async () => {
      // 模擬高內存使用率
      const mockMetrics: PerformanceMetrics = {
        id: 'test_metrics',
        timestamp: new Date(),
        memory: { used: 450, total: 512, usage: 87.9 },
        cpu: { usage: 20, cores: 4 },
        network: {
          requests: 5,
          errors: 0,
          averageResponseTime: 300,
          bandwidth: 500,
        },
        app: { startupTime: 2000, renderTime: 50, frameRate: 60, crashes: 0 },
        battery: { level: 80, isCharging: false, temperature: 25 },
      };

      // 手動觸發警報檢查
      await (performanceMonitoringService as any).checkAlerts(mockMetrics);

      const _alerts = performanceMonitoringService.getAlerts(false);
      const _memoryAlert = alerts.find(alert => alert.type === 'memory');

      expect(memoryAlert).toBeDefined();
      expect(memoryAlert?.message).toContain('內存使用率過高');
      expect(memoryAlert?.severity).toBe('low');
    });

    it('應該在CPU使用率過高時生成警報', async () => {
      const mockMetrics: PerformanceMetrics = {
        id: 'test_metrics',
        timestamp: new Date(),
        memory: { used: 200, total: 512, usage: 39.1 },
        cpu: { usage: 85, cores: 4 },
        network: {
          requests: 5,
          errors: 0,
          averageResponseTime: 300,
          bandwidth: 500,
        },
        app: { startupTime: 2000, renderTime: 50, frameRate: 60, crashes: 0 },
        battery: { level: 80, isCharging: false, temperature: 25 },
      };

      await (performanceMonitoringService as any).checkAlerts(mockMetrics);

      const _alerts = performanceMonitoringService.getAlerts(false);
      const _cpuAlert = alerts.find(alert => alert.type === 'cpu');

      expect(cpuAlert).toBeDefined();
      expect(cpuAlert?.message).toContain('CPU 使用率過高');
      expect(cpuAlert?.severity).toBe('medium');
    });

    it('應該在響應時間過長時生成警報', async () => {
      const mockMetrics: PerformanceMetrics = {
        id: 'test_metrics',
        timestamp: new Date(),
        memory: { used: 200, total: 512, usage: 39.1 },
        cpu: { usage: 20, cores: 4 },
        network: {
          requests: 5,
          errors: 0,
          averageResponseTime: 2500,
          bandwidth: 500,
        },
        app: { startupTime: 2000, renderTime: 50, frameRate: 60, crashes: 0 },
        battery: { level: 80, isCharging: false, temperature: 25 },
      };

      await (performanceMonitoringService as any).checkAlerts(mockMetrics);

      const _alerts = performanceMonitoringService.getAlerts(false);
      const _networkAlert = alerts.find(alert => alert.type === 'network');

      expect(networkAlert).toBeDefined();
      expect(networkAlert?.message).toContain('網絡響應時間過長');
    });

    it('應該在錯誤率過高時生成警報', async () => {
      const mockMetrics: PerformanceMetrics = {
        id: 'test_metrics',
        timestamp: new Date(),
        memory: { used: 200, total: 512, usage: 39.1 },
        cpu: { usage: 20, cores: 4 },
        network: {
          requests: 10,
          errors: 2,
          averageResponseTime: 300,
          bandwidth: 500,
        },
        app: { startupTime: 2000, renderTime: 50, frameRate: 60, crashes: 0 },
        battery: { level: 80, isCharging: false, temperature: 25 },
      };

      await (performanceMonitoringService as any).checkAlerts(mockMetrics);

      const _alerts = performanceMonitoringService.getAlerts(false);
      const _errorAlert = alerts.find(alert =>
        alert.message.includes('錯誤率過高')
      );

      expect(errorAlert).toBeDefined();
    });
  });

  describe('基準更新測試', () => {
    beforeEach(async () => {
      await performanceMonitoringService.initialize();
    });

    it('應該更新性能基準', async () => {
      // 收集一些指標
      for (let i = 0; i < 5; i++) {
        await performanceMonitoringService.collectMetrics();
      }

      await performanceMonitoringService.updateBaselines();

      const _baselines = performanceMonitoringService.getBaselines();
      expect(baselines.length).toBeGreaterThan(1); // 默認基準 + 新基準
    });

    it('應該生成正確的基準數據結構', async () => {
      // 收集指標
      await performanceMonitoringService.collectMetrics();
      await performanceMonitoringService.updateBaselines();

      const _baselines = performanceMonitoringService.getBaselines();
      const _latestBaseline = baselines[baselines.length - 1];

      expect(latestBaseline).toHaveProperty('id');
      expect(latestBaseline).toHaveProperty('name');
      expect(latestBaseline).toHaveProperty('description');
      expect(latestBaseline).toHaveProperty('metrics');
      expect(latestBaseline).toHaveProperty('createdAt');
      expect(latestBaseline).toHaveProperty('updatedAt');
    });
  });

  describe('優化建議測試', () => {
    beforeEach(async () => {
      await performanceMonitoringService.initialize();
    });

    it('應該生成內存優化建議', async () => {
      const mockMetrics: PerformanceMetrics = {
        id: 'test_metrics',
        timestamp: new Date(),
        memory: { used: 400, total: 512, usage: 78.1 },
        cpu: { usage: 60, cores: 4 },
        network: {
          requests: 5,
          errors: 0,
          averageResponseTime: 1500,
          bandwidth: 500,
        },
        app: { startupTime: 2000, renderTime: 50, frameRate: 60, crashes: 0 },
        battery: { level: 80, isCharging: false, temperature: 25 },
      };

      // 確保優化建議功能已啟用
      performanceMonitoringService.updateConfig({
        enablePerformanceOptimization: true,
      });
      await (
        performanceMonitoringService as any
      ).generateOptimizationSuggestions(mockMetrics);

      const _optimizations =
        performanceMonitoringService.getOptimizations(false);
      console.log('Generated optimizations:', optimizations.length);
      console.log(
        'Optimization types:',
        optimizations.map(opt => opt.type)
      );

      // 檢查是否有任何內存優化建議
      const _memoryOptimizations = optimizations.filter(
        opt => opt.type === 'memory'
      );
      expect(memoryOptimizations.length).toBeGreaterThan(0);

      const _memoryOptimization = memoryOptimizations[0];
      expect(memoryOptimization.priority).toBe('high');
      expect(memoryOptimization.recommendations).toContain('實現圖片懶加載');
    });

    it('應該生成CPU優化建議', async () => {
      const mockMetrics: PerformanceMetrics = {
        id: 'test_metrics',
        timestamp: new Date(),
        memory: { used: 200, total: 512, usage: 39.1 },
        cpu: { usage: 60, cores: 4 },
        network: {
          requests: 5,
          errors: 0,
          averageResponseTime: 300,
          bandwidth: 500,
        },
        app: { startupTime: 2000, renderTime: 50, frameRate: 60, crashes: 0 },
        battery: { level: 80, isCharging: false, temperature: 25 },
      };

      // 確保優化建議功能已啟用
      performanceMonitoringService.updateConfig({
        enablePerformanceOptimization: true,
      });
      await (
        performanceMonitoringService as any
      ).generateOptimizationSuggestions(mockMetrics);

      const _optimizations =
        performanceMonitoringService.getOptimizations(false);
      const _cpuOptimization = optimizations.find(
        opt => opt.type === 'cpu' && opt.title === 'CPU 使用優化'
      );

      expect(cpuOptimization).toBeDefined();
      expect(cpuOptimization?.priority).toBe('medium');
      expect(cpuOptimization?.recommendations).toContain('優化算法複雜度');
    });

    it('應該生成網絡優化建議', async () => {
      const mockMetrics: PerformanceMetrics = {
        id: 'test_metrics',
        timestamp: new Date(),
        memory: { used: 200, total: 512, usage: 39.1 },
        cpu: { usage: 20, cores: 4 },
        network: {
          requests: 5,
          errors: 0,
          averageResponseTime: 1500,
          bandwidth: 500,
        },
        app: { startupTime: 2000, renderTime: 50, frameRate: 60, crashes: 0 },
        battery: { level: 80, isCharging: false, temperature: 25 },
      };

      // 確保優化建議功能已啟用
      performanceMonitoringService.updateConfig({
        enablePerformanceOptimization: true,
      });
      await (
        performanceMonitoringService as any
      ).generateOptimizationSuggestions(mockMetrics);

      const _optimizations =
        performanceMonitoringService.getOptimizations(false);
      const _networkOptimization = optimizations.find(
        opt => opt.type === 'network' && opt.title === '網絡性能優化'
      );

      expect(networkOptimization).toBeDefined();
      expect(networkOptimization?.priority).toBe('high');
      expect(networkOptimization?.recommendations).toContain('實現請求緩存');
    });
  });

  describe('數據管理測試', () => {
    beforeEach(async () => {
      await performanceMonitoringService.initialize();
    });

    it('應該獲取最近的指標', () => {
      const _metrics = performanceMonitoringService.getMetrics(10);
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('應該獲取未解決的警報', () => {
      const _alerts = performanceMonitoringService.getAlerts(false);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('應該獲取已解決的警報', () => {
      const _alerts = performanceMonitoringService.getAlerts(true);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('應該獲取基準數據', () => {
      const _baselines = performanceMonitoringService.getBaselines();
      expect(Array.isArray(baselines)).toBe(true);
      expect(baselines.length).toBeGreaterThan(0);
    });

    it('應該獲取未實現的優化建議', () => {
      const _optimizations =
        performanceMonitoringService.getOptimizations(false);
      expect(Array.isArray(optimizations)).toBe(true);
      expect(optimizations.length).toBeGreaterThan(0);
    });
  });

  describe('警報解決測試', () => {
    beforeEach(async () => {
      await performanceMonitoringService.initialize();
    });

    it('應該解決警報', async () => {
      // 生成一個警報
      const mockMetrics: PerformanceMetrics = {
        id: 'test_metrics',
        timestamp: new Date(),
        memory: { used: 450, total: 512, usage: 87.9 },
        cpu: { usage: 20, cores: 4 },
        network: {
          requests: 5,
          errors: 0,
          averageResponseTime: 300,
          bandwidth: 500,
        },
        app: { startupTime: 2000, renderTime: 50, frameRate: 60, crashes: 0 },
        battery: { level: 80, isCharging: false, temperature: 25 },
      };

      await (performanceMonitoringService as any).checkAlerts(mockMetrics);

      const _alerts = performanceMonitoringService.getAlerts(false);
      expect(alerts.length).toBeGreaterThan(0);

      const _alertId = alerts[0].id;
      performanceMonitoringService.resolveAlert(alertId);

      const _resolvedAlerts = performanceMonitoringService.getAlerts(true);
      const _resolvedAlert = resolvedAlerts.find(alert => alert.id === alertId);

      expect(resolvedAlert).toBeDefined();
      expect(resolvedAlert?.resolved).toBe(true);
      expect(resolvedAlert?.resolvedAt).toBeDefined();
    });
  });

  describe('配置管理測試', () => {
    it('應該更新配置', () => {
      const _newConfig = {
        collectionInterval: 10000,
        alertThresholds: {
          memoryUsage: 90,
          cpuUsage: 80,
          responseTime: 3000,
          errorRate: 10,
        },
      };

      performanceMonitoringService.updateConfig(newConfig);
      expect(mockConsoleLog).toHaveBeenCalledWith('性能監控配置已更新');

      const _updatedConfig = performanceMonitoringService.getConfig();
      expect(updatedConfig.collectionInterval).toBe(10000);
      expect(updatedConfig.alertThresholds.memoryUsage).toBe(90);
    });

    it('應該獲取當前配置', () => {
      const _config = performanceMonitoringService.getConfig();
      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('collectionInterval');
      expect(config).toHaveProperty('alertThresholds');
      expect(config).toHaveProperty('retentionPeriod');
    });
  });

  describe('監聽器測試', () => {
    beforeEach(async () => {
      await performanceMonitoringService.initialize();
    });

    it('應該添加和移除監聽器', () => {
      const _mockListener = jest.fn();

      performanceMonitoringService.addListener(mockListener);
      expect(mockListener).not.toHaveBeenCalled();

      performanceMonitoringService.removeListener(mockListener);
    });

    it('應該在指標收集時通知監聽器', async () => {
      const _mockListener = jest.fn();
      performanceMonitoringService.addListener(mockListener);

      await performanceMonitoringService.collectMetrics();

      expect(mockListener).toHaveBeenCalled();
      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          timestamp: expect.any(Date),
          memory: expect.any(Object),
          cpu: expect.any(Object),
          network: expect.any(Object),
          app: expect.any(Object),
          battery: expect.any(Object),
        })
      );

      performanceMonitoringService.removeListener(mockListener);
    });
  });

  describe('邊界條件測試', () => {
    beforeEach(async () => {
      await performanceMonitoringService.initialize();
    });

    it('應該處理空指標數據', async () => {
      await performanceMonitoringService.updateBaselines();
      const _baselines = performanceMonitoringService.getBaselines();
      expect(baselines.length).toBeGreaterThan(0); // 至少應該有默認基準
    });

    it('應該處理極端性能指標', async () => {
      const extremeMetrics: PerformanceMetrics = {
        id: 'extreme_metrics',
        timestamp: new Date(),
        memory: { used: 500, total: 512, usage: 97.7 },
        cpu: { usage: 95, cores: 4 },
        network: {
          requests: 100,
          errors: 20,
          averageResponseTime: 5000,
          bandwidth: 50,
        },
        app: { startupTime: 10000, renderTime: 500, frameRate: 10, crashes: 5 },
        battery: { level: 5, isCharging: false, temperature: 45 },
      };

      await (performanceMonitoringService as any).checkAlerts(extremeMetrics);

      const _alerts = performanceMonitoringService.getAlerts(false);
      expect(alerts.length).toBeGreaterThan(0);

      // 檢查是否有嚴重警報
      const _criticalAlerts = alerts.filter(
        alert => alert.severity === 'critical'
      );
      expect(criticalAlerts.length).toBeGreaterThan(0);
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await performanceMonitoringService.initialize();
    });

    it('應該快速處理大量指標', async () => {
      const _startTime = Date.now();

      // 收集100個指標
      for (let i = 0; i < 100; i++) {
        await performanceMonitoringService.collectMetrics();
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // 應該在5秒內完成

      const _metrics = performanceMonitoringService.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('應該高效生成優化建議', async () => {
      const _startTime = Date.now();

      const mockMetrics: PerformanceMetrics = {
        id: 'test_metrics',
        timestamp: new Date(),
        memory: { used: 400, total: 512, usage: 78.1 },
        cpu: { usage: 60, cores: 4 },
        network: {
          requests: 5,
          errors: 0,
          averageResponseTime: 1500,
          bandwidth: 500,
        },
        app: { startupTime: 2000, renderTime: 50, frameRate: 60, crashes: 0 },
        battery: { level: 80, isCharging: false, temperature: 25 },
      };

      await (
        performanceMonitoringService as any
      ).generateOptimizationSuggestions(mockMetrics);

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成

      const _optimizations =
        performanceMonitoringService.getOptimizations(false);
      expect(optimizations.length).toBeGreaterThan(0);
    });
  });
});
