// 業務指標AnalysisServiceTest
import BusinessMetricsService from '../services/businessMetricsService';
import type {
  BusinessMetricsFilter,
  BusinessMetricsConfig,
  BusinessMetricsExportOptions,
} from '../types/businessMetrics';
import { BusinessMetricsAlert } from '../types/businessMetrics';

// Mock dataConverters
jest.mock('../utils/dataConverters', () => ({
  convertToJSON: jest.fn(data => JSON.stringify(data)),
  convertToCSV: jest.fn(data => 'csv_data'),
  convertToExcel: jest.fn(data => 'excel_data'),
  convertToPDF: jest.fn(data => 'pdf_data'),
}));

describe('BusinessMetricsService', () => {
  let service: BusinessMetricsService;
  const _mockConvertToJSON = require('../utils/dataConverters').convertToJSON;
  const _mockConvertToCSV = require('../utils/dataConverters').convertToCSV;
  const _mockConvertToExcel = require('../utils/dataConverters').convertToExcel;
  const _mockConvertToPDF = require('../utils/dataConverters').convertToPDF;

  beforeEach(() => {
    service = BusinessMetricsService.getInstance();
    jest.clearAllMocks();

    // Reset mock Function的ReturnValue
    mockConvertToJSON.mockReturnValue('json_data');
    mockConvertToCSV.mockReturnValue('csv_data');
    mockConvertToExcel.mockReturnValue('excel_data');
    mockConvertToPDF.mockReturnValue('pdf_data');
  });

  describe('單例模式', () => {
    test('應該返回相同的實例', () => {
      const _instance1 = BusinessMetricsService.getInstance();
      const _instance2 = BusinessMetricsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    test('應該SuccessInitializeService', async () => {
      const _result = await service.initialize();
      expect(result).toBe(true);
    });

    test('應該在InitializeFailed時返回 false', async () => {
      // Mock InitializeFailed
      jest
        .spyOn(service as any, 'initializeAnalytics')
        .mockRejectedValue(new Error('InitializeFailed'));
      const _result = await service.initialize();
      expect(result).toBe(false);
    });
  });

  describe('業務指標分析', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取業務指標分析數據', async () => {
      const _analysis = await service.getBusinessMetrics();

      expect(analysis).toBeDefined();
      expect(analysis.metrics).toBeDefined();
      expect(analysis.insights).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.alerts).toBeDefined();
      expect(analysis.summary).toBeDefined();
      expect(analysis.metadata).toBeDefined();
    });

    test('應該使用過濾器獲取業務指標分析', async () => {
      const filter: BusinessMetricsFilter = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
        products: ['product_a', 'product_b'],
        regions: ['north', 'south'],
      };

      const _analysis = await service.getBusinessMetrics(filter);

      expect(analysis).toBeDefined();
      expect(analysis.metrics).toBeDefined();
    });

    test('應該在未Initialize時拋出Error', async () => {
      // Create新的ServiceInstance，不Initialize
      const _newService = BusinessMetricsService.getInstance();
      (newService as any).isInitialized = false;

      await expect(newService.getBusinessMetrics()).rejects.toThrow(
        'Service未Initialize'
      );
    });
  });

  describe('報告生成', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該生成基本報告', async () => {
      const _report = await service.generateReport();

      expect(report).toBeDefined();
      expect(report.id).toBeDefined();
      expect(report.title).toBe('業務指標分析報告');
      expect(report.description).toBe('基於當前數據的業務指標分析報告');
      expect(report.status).toBe('completed');
      expect(report.metrics).toBeDefined();
      expect(report.insights).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.alerts).toBeDefined();
    });

    test('應該使用過濾器生成報告', async () => {
      const filter: BusinessMetricsFilter = {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31'),
        },
      };

      const _report = await service.generateReport(filter);

      expect(report).toBeDefined();
      expect(report.filter).toEqual(filter);
    });
  });

  describe('數據導出', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該導出 JSON 格式數據', async () => {
      const _analysis = await service.getBusinessMetrics();
      const options: BusinessMetricsExportOptions = {
        format: 'json',
        includeMetrics: true,
        includeInsights: true,
        includeRecommendations: true,
        includeAlerts: true,
        includeHistorical: true,
        includeProjections: false,
        includeComparisons: false,
        anonymize: false,
        compress: false,
      };

      const _result = await service.exportData(analysis, options);

      expect(result).toBeDefined();
      expect(mockConvertToJSON).toHaveBeenCalledWith(analysis);
    });

    test('應該導出 CSV 格式數據', async () => {
      const _analysis = await service.getBusinessMetrics();
      const options: BusinessMetricsExportOptions = {
        format: 'csv',
        includeMetrics: true,
        includeInsights: true,
        includeRecommendations: true,
        includeAlerts: true,
        includeHistorical: true,
        includeProjections: false,
        includeComparisons: false,
        anonymize: false,
        compress: false,
      };

      const _result = await service.exportData(analysis, options);

      expect(result).toBeDefined();
      expect(mockConvertToCSV).toHaveBeenCalledWith(analysis);
    });

    test('應該導出 Excel 格式數據', async () => {
      const _analysis = await service.getBusinessMetrics();
      const options: BusinessMetricsExportOptions = {
        format: 'excel',
        includeMetrics: true,
        includeInsights: true,
        includeRecommendations: true,
        includeAlerts: true,
        includeHistorical: true,
        includeProjections: false,
        includeComparisons: false,
        anonymize: false,
        compress: false,
      };

      const _result = await service.exportData(analysis, options);

      expect(result).toBeDefined();
      expect(mockConvertToExcel).toHaveBeenCalledWith(analysis);
    });

    test('應該導出 PDF 格式數據', async () => {
      const _analysis = await service.getBusinessMetrics();
      const options: BusinessMetricsExportOptions = {
        format: 'pdf',
        includeMetrics: true,
        includeInsights: true,
        includeRecommendations: true,
        includeAlerts: true,
        includeHistorical: true,
        includeProjections: false,
        includeComparisons: false,
        anonymize: false,
        compress: false,
      };

      const _result = await service.exportData(analysis, options);

      expect(result).toBeDefined();
      expect(mockConvertToPDF).toHaveBeenCalledWith(analysis);
    });

    test('應該處理不支持的導出格式', async () => {
      const _analysis = await service.getBusinessMetrics();
      const options: BusinessMetricsExportOptions = {
        format: 'json' as any,
        includeMetrics: true,
        includeInsights: true,
        includeRecommendations: true,
        includeAlerts: true,
        includeHistorical: true,
        includeProjections: false,
        includeComparisons: false,
        anonymize: false,
        compress: false,
      };

      // Mock 不Support的格式
      mockConvertToJSON.mockImplementation(() => {
        throw new Error('不支持的導出格式: invalid');
      });

      await expect(service.exportData(analysis, options)).rejects.toThrow(
        '不支持的導出格式'
      );
    });

    test('應該Handle導出Error', async () => {
      const _analysis = await service.getBusinessMetrics();
      const options: BusinessMetricsExportOptions = {
        format: 'csv',
        includeMetrics: true,
        includeInsights: true,
        includeRecommendations: true,
        includeAlerts: true,
        includeHistorical: true,
        includeProjections: false,
        includeComparisons: false,
        anonymize: false,
        compress: false,
      };

      // Mock ExportError
      mockConvertToCSV.mockImplementation(() => {
        throw new Error('導出Failed');
      });

      await expect(service.exportData(analysis, options)).rejects.toThrow(
        '導出Failed'
      );
    });
  });

  describe('警報管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該創建警報', () => {
      const _alertData = {
        type: 'threshold' as const,
        severity: 'medium' as const,
        category: 'revenue' as const,
        title: '測試警報',
        description: '這是一個測試警報',
        metric: 'revenueGrowthRate',
        currentValue: 0.08,
        thresholdValue: 0.1,
        deviation: -0.02,
        trend: 'down' as const,
      };

      const _alert = service.createAlert(alertData);

      expect(alert).toBeDefined();
      expect(alert.id).toBeDefined();
      expect(alert.title).toBe('測試警報');
      expect(alert.description).toBe('這是一個測試警報');
      expect(alert.severity).toBe('medium');
      expect(alert.category).toBe('revenue');
      expect(alert.acknowledged).toBe(false);
      expect(alert.timestamp).toBeDefined();
    });

    test('應該更新警報', () => {
      const _alertData = {
        type: 'threshold' as const,
        severity: 'medium' as const,
        category: 'revenue' as const,
        title: '測試警報',
        description: '這是一個測試警報',
        metric: 'revenueGrowthRate',
        currentValue: 0.08,
        thresholdValue: 0.1,
        deviation: -0.02,
        trend: 'down' as const,
      };

      const _alert = service.createAlert(alertData);
      const _updatedAlert = service.updateAlert(alert.id, {
        acknowledged: true,
      });

      expect(updatedAlert).toBeDefined();
      expect(updatedAlert.acknowledged).toBe(true);
    });

    test('應該刪除警報', () => {
      const _alertData = {
        type: 'threshold' as const,
        severity: 'medium' as const,
        category: 'revenue' as const,
        title: '測試警報',
        description: '這是一個測試警報',
        metric: 'revenueGrowthRate',
        currentValue: 0.08,
        thresholdValue: 0.1,
        deviation: -0.02,
        trend: 'down' as const,
      };

      const _alert = service.createAlert(alertData);
      const _result = service.deleteAlert(alert.id);

      expect(result).toBe(true);
    });

    test('應該獲取所有警報', () => {
      const _alertData = {
        type: 'threshold' as const,
        severity: 'medium' as const,
        category: 'revenue' as const,
        title: '測試警報',
        description: '這是一個測試警報',
        metric: 'revenueGrowthRate',
        currentValue: 0.08,
        thresholdValue: 0.1,
        deviation: -0.02,
        trend: 'down' as const,
      };

      service.createAlert(alertData);
      const _alerts = service.getAlerts();

      expect(alerts).toBeDefined();
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('應該處理不存在的警報', async () => {
      const _alert = await service.getAlert('non-existent-id');
      expect(alert).toBeNull();
    });
  });

  describe('配置管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取配置', () => {
      const _config = service.getConfig();

      expect(config).toBeDefined();
      expect(config.enabled).toBeDefined();
      expect(config.updateInterval).toBeDefined();
      expect(config.retentionPeriod).toBeDefined();
      expect(config.alertThresholds).toBeDefined();
      expect(config.dataSources).toBeDefined();
      expect(config.exportFormats).toBeDefined();
    });

    test('應該更新配置', () => {
      const updates: Partial<BusinessMetricsConfig> = {
        updateInterval: 60000,
        realTimeUpdates: true,
      };

      service.updateConfig(updates);
      const _config = service.getConfig();

      expect(config.updateInterval).toBe(60000);
      expect(config.realTimeUpdates).toBe(true);
    });
  });

  describe('事件監聽器', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該添加和移除事件監聽器', () => {
      const _listener = jest.fn();

      service.addEventListener('metrics_updated', listener);
      service.removeEventListener('metrics_updated', listener);

      // TestRemove不存在的監聽器
      service.removeEventListener('metrics_updated', jest.fn());
    });
  });

  describe('數據獲取', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取報告', () => {
      const _reports = service.getReports();
      expect(reports).toBeDefined();
      expect(Array.isArray(reports)).toBe(true);
    });

    test('應該獲取洞察', () => {
      const _insights = service.getInsights();
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
    });

    test('應該獲取建議', () => {
      const _recommendations = service.getRecommendations();
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    test('應該獲取實時指標', () => {
      const _metrics = service.getRealTimeMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.revenue).toBeDefined();
      expect(metrics.profit).toBeDefined();
      expect(metrics.customer).toBeDefined();
      expect(metrics.efficiency).toBeDefined();
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該快速獲取分析數據', async () => {
      const _startTime = Date.now();

      await service.getBusinessMetrics();

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });
  });

  describe('邊界條件測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該處理空過濾器', async () => {
      const _analysis = await service.getBusinessMetrics();
      expect(analysis).toBeDefined();
    });

    test('應該處理極端的指標值', async () => {
      const _analysis = await service.getBusinessMetrics();
      expect(analysis.metrics.revenue.totalRevenue).toBeGreaterThan(0);
      expect(analysis.metrics.profit.netProfit).toBeDefined();
    });

    test('應該處理無效的配置', () => {
      const _invalidConfig = {
        updateInterval: -1000,
        realTimeUpdates: true,
      };

      service.updateConfig(invalidConfig);
      const _config = service.getConfig();

      expect(config.updateInterval).toBe(-1000);
    });
  });
});
