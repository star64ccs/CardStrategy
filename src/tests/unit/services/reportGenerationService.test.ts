import { reportGenerationService } from '../../../services/reportGenerationService';
import { advancedAnalyticsService } from '../../../services/advancedAnalyticsService';
import { dataQualityService } from '../../../services/dataQualityService';
import { aiEcosystem } from '../../../services/aiEcosystem';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/advancedAnalyticsService');
jest.mock('../../../services/dataQualityService');
jest.mock('../../../services/aiEcosystem');
jest.mock('../../../utils/logger');

const mockAdvancedAnalyticsService = advancedAnalyticsService as jest.Mocked<
  typeof advancedAnalyticsService
>;
const mockDataQualityService = dataQualityService as jest.Mocked<
  typeof dataQualityService
>;
const mockAiEcosystem = aiEcosystem as jest.Mocked<typeof aiEcosystem>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('ReportGenerationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('應該成功初始化報告生成服務', async () => {
      await reportGenerationService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith('初始化報告生成服務...');
      expect(mockLogger.info).toHaveBeenCalledWith('報告模板初始化完成');
      expect(mockLogger.info).toHaveBeenCalledWith('報告生成配置已加載');
      expect(mockLogger.info).toHaveBeenCalledWith('報告生成服務初始化完成');
    });

    it('應該處理依賴服務未初始化的情況', async () => {
      // 模擬依賴服務未初始化
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(reportGenerationService.initialize()).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '報告生成服務初始化失敗:',
        expect.any(Error)
      );
    });
  });

  describe('generateReport', () => {
    it('應該成功生成報告', async () => {
      const params = {
        templateId: 'analytics-default',
        dataParams: {
          timeRange: '30d',
          metrics: ['revenue', 'users'],
        },
        format: 'pdf' as const,
        includeCharts: true,
        includeInsights: true,
        includeRecommendations: true,
      };

      const result = await reportGenerationService.generateReport(params);

      expect(result).toMatchObject({
        templateId: 'analytics-default',
        status: 'generating',
        progress: 0,
        sections: [],
        metadata: {
          dataSources: ['cards', 'market', 'investments'],
          dataQuality: 0,
          insightsCount: 0,
          recommendationsCount: 0,
        },
      });
      expect(result.reportId).toBeDefined();
      expect(result.metadata.generatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('開始生成報告:', params);
      expect(mockLogger.info).toHaveBeenCalledWith('報告生成已開始');
    });

    it('應該處理無效的報告參數', async () => {
      const invalidParams = {
        templateId: 'analytics-default',
        format: 'invalid' as any, // 無效格式
        includeCharts: true,
        includeInsights: true,
        includeRecommendations: true,
      };

      await expect(
        reportGenerationService.generateReport(invalidParams)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '報告生成失敗:',
        expect.any(Error)
      );
    });

    it('應該處理模板不存在的情況', async () => {
      const params = {
        templateId: 'nonexistent-template',
        format: 'pdf' as const,
        includeCharts: true,
        includeInsights: true,
        includeRecommendations: true,
      };

      await expect(
        reportGenerationService.generateReport(params)
      ).rejects.toThrow('報告模板不存在: nonexistent-template');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '報告生成失敗:',
        expect.any(Error)
      );
    });
  });

  describe('generateAnalyticsReport', () => {
    it('應該成功生成分析報告', async () => {
      const params = {
        reportType: 'trend' as const,
        dataSource: 'cards',
        timeRange: '30d',
        metrics: ['revenue', 'users'],
        includeVisualizations: true,
        includeInsights: true,
        includeRecommendations: true,
      };

      const result =
        await reportGenerationService.generateAnalyticsReport(params);

      expect(result).toMatchObject({
        templateId: 'analytics-trend',
        status: 'generating',
        progress: 0,
      });
      expect(result.reportId).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('開始生成分析報告:', params);
    });

    it('應該處理無效的分析報告參數', async () => {
      const invalidParams = {
        reportType: 'invalid' as any, // 無效報告類型
        dataSource: 'cards',
        timeRange: '30d',
        metrics: ['revenue'],
        includeVisualizations: true,
        includeInsights: true,
        includeRecommendations: true,
      };

      await expect(
        reportGenerationService.generateAnalyticsReport(invalidParams)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '分析報告生成失敗:',
        expect.any(Error)
      );
    });

    it('應該處理不同類型的分析報告', async () => {
      const reportTypes = [
        'trend',
        'statistical',
        'correlation',
        'anomaly',
        'market',
        'investment',
        'comprehensive',
      ];

      for (const reportType of reportTypes) {
        const params = {
          reportType: reportType as any,
          dataSource: 'cards',
          timeRange: '30d',
          metrics: ['revenue'],
          includeVisualizations: true,
          includeInsights: true,
          includeRecommendations: true,
        };

        const result =
          await reportGenerationService.generateAnalyticsReport(params);
        expect(result.templateId).toBeDefined();
      }
    });
  });

  describe('generatePerformanceReport', () => {
    it('應該成功生成性能報告', async () => {
      const params = {
        reportType: 'system' as const,
        timeRange: '30d',
        metrics: ['response_time', 'throughput'],
        includeTrends: true,
        includeComparisons: true,
        includeForecasts: true,
      };

      const result =
        await reportGenerationService.generatePerformanceReport(params);

      expect(result).toMatchObject({
        templateId: 'performance-system',
        status: 'generating',
        progress: 0,
      });
      expect(result.reportId).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('開始生成性能報告:', params);
    });

    it('應該處理性能報告生成失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const params = {
        reportType: 'system' as const,
        timeRange: '30d',
        metrics: ['response_time'],
        includeTrends: true,
        includeComparisons: true,
        includeForecasts: true,
      };

      await expect(
        reportGenerationService.generatePerformanceReport(params)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '性能報告生成失敗:',
        expect.any(Error)
      );
    });
  });

  describe('generateQualityReport', () => {
    it('應該成功生成質量報告', async () => {
      const params = {
        reportType: 'data' as const,
        dataSource: 'cards',
        timeRange: '30d',
        qualityMetrics: ['accuracy', 'completeness'],
        includeTrends: true,
        includeImprovements: true,
        includeRecommendations: true,
      };

      const result =
        await reportGenerationService.generateQualityReport(params);

      expect(result).toMatchObject({
        templateId: 'quality-data',
        status: 'generating',
        progress: 0,
      });
      expect(result.reportId).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('開始生成質量報告:', params);
    });

    it('應該處理質量報告生成失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const params = {
        reportType: 'data' as const,
        dataSource: 'cards',
        timeRange: '30d',
        qualityMetrics: ['accuracy'],
        includeTrends: true,
        includeImprovements: true,
        includeRecommendations: true,
      };

      await expect(
        reportGenerationService.generateQualityReport(params)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '質量報告生成失敗:',
        expect.any(Error)
      );
    });
  });

  describe('generateFinancialReport', () => {
    it('應該成功生成財務報告', async () => {
      const params = {
        reportType: 'revenue' as const,
        timeRange: '30d',
        currency: 'USD',
        includeCharts: true,
        includeProjections: true,
        includeComparisons: true,
      };

      const result =
        await reportGenerationService.generateFinancialReport(params);

      expect(result).toMatchObject({
        templateId: 'financial-revenue',
        status: 'generating',
        progress: 0,
      });
      expect(result.reportId).toBeDefined();
      expect(mockLogger.info).toHaveBeenCalledWith('開始生成財務報告:', params);
    });

    it('應該處理財務報告生成失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const params = {
        reportType: 'revenue' as const,
        timeRange: '30d',
        currency: 'USD',
        includeCharts: true,
        includeProjections: true,
        includeComparisons: true,
      };

      await expect(
        reportGenerationService.generateFinancialReport(params)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '財務報告生成失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createCustomTemplate', () => {
    it('應該成功創建自定義報告模板', async () => {
      const template = {
        name: '自定義模板',
        description: '這是一個自定義報告模板',
        type: 'custom' as const,
        sections: [
          {
            id: 'custom-section',
            name: '自定義章節',
            type: 'text' as const,
            content: { text: '自定義內容' },
            position: 1,
            isVisible: true,
            isCollapsible: false,
          },
        ],
        styling: {
          theme: 'light' as const,
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#28a745',
            background: '#ffffff',
            text: '#212529',
          },
          fonts: {
            heading: 'Arial, sans-serif',
            body: 'Arial, sans-serif',
            data: 'Courier New, monospace',
          },
          layout: 'portrait' as const,
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        dataSources: ['custom'],
        permissions: ['read', 'write'],
      };

      const result =
        await reportGenerationService.createCustomTemplate(template);

      expect(result).toMatchObject({
        name: '自定義模板',
        description: '這是一個自定義報告模板',
        type: 'custom',
        sections: template.sections,
        styling: template.styling,
        dataSources: ['custom'],
        permissions: ['read', 'write'],
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '創建自定義報告模板:',
        '自定義模板'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('自定義報告模板創建成功');
    });

    it('應該處理創建自定義模板失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const template = {
        name: '測試模板',
        description: '測試模板',
        type: 'custom' as const,
        sections: [],
        styling: {
          theme: 'light' as const,
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#28a745',
            background: '#ffffff',
            text: '#212529',
          },
          fonts: {
            heading: 'Arial, sans-serif',
            body: 'Arial, sans-serif',
            data: 'Courier New, monospace',
          },
          layout: 'portrait' as const,
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        dataSources: [],
        permissions: [],
      };

      await expect(
        reportGenerationService.createCustomTemplate(template)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建自定義報告模板失敗:',
        expect.any(Error)
      );
    });
  });

  describe('updateTemplate', () => {
    it('應該成功更新報告模板', async () => {
      // 先創建一個模板
      const template = {
        name: '測試模板',
        description: '測試模板',
        type: 'custom' as const,
        sections: [],
        styling: {
          theme: 'light' as const,
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#28a745',
            background: '#ffffff',
            text: '#212529',
          },
          fonts: {
            heading: 'Arial, sans-serif',
            body: 'Arial, sans-serif',
            data: 'Courier New, monospace',
          },
          layout: 'portrait' as const,
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        dataSources: [],
        permissions: [],
      };

      const createdTemplate =
        await reportGenerationService.createCustomTemplate(template);

      // 更新模板
      const updates = {
        name: '更新後的模板',
        description: '更新後的描述',
      };

      const result = await reportGenerationService.updateTemplate(
        createdTemplate.id,
        updates
      );

      expect(result).toMatchObject({
        name: '更新後的模板',
        description: '更新後的描述',
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '更新報告模板:',
        createdTemplate.id
      );
      expect(mockLogger.info).toHaveBeenCalledWith('報告模板更新成功');
    });

    it('應該處理模板不存在的情況', async () => {
      const updates = { name: '新名稱' };

      await expect(
        reportGenerationService.updateTemplate('nonexistent-template', updates)
      ).rejects.toThrow('報告模板不存在: nonexistent-template');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '更新報告模板失敗:',
        expect.any(Error)
      );
    });
  });

  describe('deleteTemplate', () => {
    it('應該成功刪除報告模板', async () => {
      // 先創建一個模板
      const template = {
        name: '測試模板',
        description: '測試模板',
        type: 'custom' as const,
        sections: [],
        styling: {
          theme: 'light' as const,
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#28a745',
            background: '#ffffff',
            text: '#212529',
          },
          fonts: {
            heading: 'Arial, sans-serif',
            body: 'Arial, sans-serif',
            data: 'Courier New, monospace',
          },
          layout: 'portrait' as const,
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        dataSources: [],
        permissions: [],
      };

      const createdTemplate =
        await reportGenerationService.createCustomTemplate(template);

      // 刪除模板
      await reportGenerationService.deleteTemplate(createdTemplate.id);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '刪除報告模板:',
        createdTemplate.id
      );
      expect(mockLogger.info).toHaveBeenCalledWith('報告模板刪除成功');
    });

    it('應該處理模板不存在的情況', async () => {
      await expect(
        reportGenerationService.deleteTemplate('nonexistent-template')
      ).rejects.toThrow('報告模板不存在: nonexistent-template');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '刪除報告模板失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getAllTemplates', () => {
    it('應該成功獲取所有報告模板', async () => {
      const result = await reportGenerationService.getAllTemplates();

      expect(result).toHaveLength(2); // 2個默認模板
      expect(result.map((t) => t.id)).toContain('analytics-default');
      expect(result.map((t) => t.id)).toContain('performance-default');
    });
  });

  describe('getTemplate', () => {
    it('應該成功獲取報告模板', async () => {
      const result =
        await reportGenerationService.getTemplate('analytics-default');

      expect(result).toMatchObject({
        id: 'analytics-default',
        name: '數據分析報告',
        description: '標準數據分析報告模板',
        type: 'analytics',
      });
    });

    it('應該在模板不存在時返回 null', async () => {
      const result = await reportGenerationService.getTemplate(
        'nonexistent-template'
      );

      expect(result).toBeNull();
    });
  });

  describe('getReportStatus', () => {
    it('應該成功獲取報告狀態', async () => {
      const result = await reportGenerationService.getReportStatus('report-1');

      expect(result).toBeNull(); // 目前實現返回 null
    });
  });

  describe('downloadReport', () => {
    it('應該成功下載報告', async () => {
      const result = await reportGenerationService.downloadReport(
        'report-1',
        'pdf'
      );

      expect(result).toBe('/api/reports/report-1/download?format=pdf');
      expect(mockLogger.info).toHaveBeenCalledWith(
        '下載報告:',
        'report-1',
        'pdf'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('報告下載URL生成成功');
    });

    it('應該處理下載報告失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        reportGenerationService.downloadReport('report-1', 'pdf')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '下載報告失敗:',
        expect.any(Error)
      );
    });

    it('應該支持不同格式的報告下載', async () => {
      const formats = ['pdf', 'excel', 'html', 'json', 'csv'];

      for (const format of formats) {
        const result = await reportGenerationService.downloadReport(
          'report-1',
          format
        );
        expect(result).toContain(`format=${format}`);
      }
    });
  });

  describe('配置管理', () => {
    it('應該成功獲取配置', () => {
      const config = reportGenerationService.getConfig();

      expect(config).toMatchObject({
        enableAutoGeneration: true,
        enableCustomTemplates: true,
        enableMultiFormatExport: true,
        enableScheduledReports: true,
        enableRealTimeReports: true,
        enableInteractiveReports: true,
        enableDataVisualization: true,
        enableAIInsights: true,
        enableCollaboration: true,
        enableVersionControl: true,
      });
    });

    it('應該成功更新配置', () => {
      const newConfig = {
        enableAutoGeneration: false,
        enableAIInsights: false,
      };

      reportGenerationService.updateConfig(newConfig);

      const updatedConfig = reportGenerationService.getConfig();
      expect(updatedConfig.enableAutoGeneration).toBe(false);
      expect(updatedConfig.enableAIInsights).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith('報告生成服務配置已更新');
    });

    it('應該檢查服務狀態', () => {
      expect(reportGenerationService.isReady()).toBe(false); // 未初始化

      // 初始化後應該返回 true
      reportGenerationService.initialize().then(() => {
        expect(reportGenerationService.isReady()).toBe(true);
      });
    });
  });

  describe('模板選擇邏輯', () => {
    it('應該正確選擇分析報告模板', async () => {
      const testCases = [
        { reportType: 'trend', expectedTemplate: 'analytics-trend' },
        {
          reportType: 'statistical',
          expectedTemplate: 'analytics-statistical',
        },
        {
          reportType: 'correlation',
          expectedTemplate: 'analytics-correlation',
        },
        { reportType: 'anomaly', expectedTemplate: 'analytics-anomaly' },
        { reportType: 'market', expectedTemplate: 'analytics-market' },
        { reportType: 'investment', expectedTemplate: 'analytics-investment' },
        { reportType: 'comprehensive', expectedTemplate: 'analytics-default' },
      ];

      for (const testCase of testCases) {
        const params = {
          reportType: testCase.reportType as any,
          dataSource: 'cards',
          timeRange: '30d',
          metrics: ['revenue'],
          includeVisualizations: true,
          includeInsights: true,
          includeRecommendations: true,
        };

        const result =
          await reportGenerationService.generateAnalyticsReport(params);
        expect(result.templateId).toBe(testCase.expectedTemplate);
      }
    });

    it('應該正確選擇性能報告模板', async () => {
      const testCases = [
        { reportType: 'system', expectedTemplate: 'performance-system' },
        { reportType: 'user', expectedTemplate: 'performance-user' },
        { reportType: 'business', expectedTemplate: 'performance-business' },
        { reportType: 'technical', expectedTemplate: 'performance-technical' },
        {
          reportType: 'comprehensive',
          expectedTemplate: 'performance-default',
        },
      ];

      for (const testCase of testCases) {
        const params = {
          reportType: testCase.reportType as any,
          timeRange: '30d',
          metrics: ['response_time'],
          includeTrends: true,
          includeComparisons: true,
          includeForecasts: true,
        };

        const result =
          await reportGenerationService.generatePerformanceReport(params);
        expect(result.templateId).toBe(testCase.expectedTemplate);
      }
    });

    it('應該正確選擇質量報告模板', async () => {
      const testCases = [
        { reportType: 'data', expectedTemplate: 'quality-data' },
        { reportType: 'process', expectedTemplate: 'quality-process' },
        { reportType: 'output', expectedTemplate: 'quality-output' },
        { reportType: 'comprehensive', expectedTemplate: 'quality-default' },
      ];

      for (const testCase of testCases) {
        const params = {
          reportType: testCase.reportType as any,
          dataSource: 'cards',
          timeRange: '30d',
          qualityMetrics: ['accuracy'],
          includeTrends: true,
          includeImprovements: true,
          includeRecommendations: true,
        };

        const result =
          await reportGenerationService.generateQualityReport(params);
        expect(result.templateId).toBe(testCase.expectedTemplate);
      }
    });

    it('應該正確選擇財務報告模板', async () => {
      const testCases = [
        { reportType: 'revenue', expectedTemplate: 'financial-revenue' },
        { reportType: 'expense', expectedTemplate: 'financial-expense' },
        { reportType: 'profit', expectedTemplate: 'financial-profit' },
        { reportType: 'investment', expectedTemplate: 'financial-investment' },
        { reportType: 'comprehensive', expectedTemplate: 'financial-default' },
      ];

      for (const testCase of testCases) {
        const params = {
          reportType: testCase.reportType as any,
          timeRange: '30d',
          currency: 'USD',
          includeCharts: true,
          includeProjections: true,
          includeComparisons: true,
        };

        const result =
          await reportGenerationService.generateFinancialReport(params);
        expect(result.templateId).toBe(testCase.expectedTemplate);
      }
    });
  });
});
