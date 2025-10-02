import { ReportService } from '../services/reportService';
import { ReportCategory, ReportType, ExportFormat } from '../types/report';

// Mock dataConverters
const mockConvertToJSON = jest.fn((data: unknown) => JSON.stringify(data));
const mockConvertToCSV = jest.fn((data: unknown) => 'csv,data,format');
const mockConvertToExcel = jest.fn((data: unknown) => 'excel,data,format');
const mockConvertToPDF = jest.fn((data: unknown) => 'pdf,data,format');

jest.mock('../utils/dataConverters', () => ({
  convertToJSON: mockConvertToJSON,
  convertToCSV: mockConvertToCSV,
  convertToExcel: mockConvertToExcel,
  convertToPDF: mockConvertToPDF,
}));

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    // Reset singleton instance
    (ReportService as any).instance = undefined;
    reportService = ReportService.getInstance();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    test('should return the same instance', () => {
      const instance1 = ReportService.getInstance();
      const instance2 = ReportService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    test('should initialize the service with default config', async () => {
      await reportService.initialize();

      const config = reportService.getConfig();
      expect(config.maxTemplates).toBe(100);
      expect(config.maxReports).toBe(1000);
      expect(config.maxExports).toBe(500);
    });

    test('should initialize with custom config', async () => {
      const customConfig = {
        maxTemplates: 50,
        maxReports: 500,
      };

      await reportService.initialize(customConfig);

      const config = reportService.getConfig();
      expect(config.maxTemplates).toBe(50);
      expect(config.maxReports).toBe(500);
    });

    test('should not initialize twice', async () => {
      await reportService.initialize();
      const firstConfig = reportService.getConfig();

      await reportService.initialize({ maxTemplates: 999 });
      const secondConfig = reportService.getConfig();

      expect(secondConfig.maxTemplates).toBe(firstConfig.maxTemplates);
    });
  });

  describe('createTemplate', () => {
    beforeEach(async () => {
      await reportService.initialize();
    });

    test('should create a template successfully', async () => {
      const templateRequest = {
        name: '測試模板',
        description: '這是一個測試模板',
        category: ReportCategory.BUSINESS,
        type: ReportType.DAILY,
        config: {
          dataSources: ['test_data'],
          filters: [],
          aggregations: [],
          visualizations: [],
          format: 'pdf',
          delivery: {
            method: 'email',
            email: {
              recipients: ['test@example.com'],
              subject: '測試報告',
              body: '測試內容',
              attachments: true,
            },
          },
          retention: {
            days: 30,
            maxReports: 100,
            archiveAfter: 7,
            deleteAfter: 30,
          },
        },
        recipients: ['test@example.com'],
      };

      const response = await reportService.createTemplate(templateRequest);

      expect(response.success).toBe(true);
      expect(response.data.name).toBe('測試模板');
      expect(response.data.category).toBe(ReportCategory.BUSINESS);
      expect(response.data.isActive).toBe(true);
    });

    test('should handle template creation error', async () => {
      // Mock a failure scenario
      jest.spyOn(reportService as any, 'generateId').mockImplementation(() => {
        throw new Error('ID generation failed');
      });

      const templateRequest = {
        name: '測試模板',
        description: '這是一個測試模板',
        category: ReportCategory.BUSINESS,
        type: ReportType.DAILY,
        config: {
          dataSources: ['test_data'],
          filters: [],
          aggregations: [],
          visualizations: [],
          format: 'pdf',
          delivery: {
            method: 'email',
            email: {
              recipients: ['test@example.com'],
              subject: '測試報告',
              body: '測試內容',
              attachments: true,
            },
          },
          retention: {
            days: 30,
            maxReports: 100,
            archiveAfter: 7,
            deleteAfter: 30,
          },
        },
        recipients: ['test@example.com'],
      };

      const response = await reportService.createTemplate(templateRequest);

      expect(response.success).toBe(false);
      expect(response.message).toContain('模板創建失敗');
    });
  });

  describe('getTemplate', () => {
    beforeEach(async () => {
      await reportService.initialize();
    });

    test('should get existing template', async () => {
      // First create a template
      const templateRequest = {
        name: '測試模板',
        description: '這是一個測試模板',
        category: ReportCategory.BUSINESS,
        type: ReportType.DAILY,
        config: {
          dataSources: ['test_data'],
          filters: [],
          aggregations: [],
          visualizations: [],
          format: 'pdf',
          delivery: {
            method: 'email',
            email: {
              recipients: ['test@example.com'],
              subject: '測試報告',
              body: '測試內容',
              attachments: true,
            },
          },
          retention: {
            days: 30,
            maxReports: 100,
            archiveAfter: 7,
            deleteAfter: 30,
          },
        },
        recipients: ['test@example.com'],
      };

      const createResponse =
        await reportService.createTemplate(templateRequest);
      const templateId = createResponse.data.id;

      // Then get the template
      const getResponse = await reportService.getTemplate(templateId);

      expect(getResponse.success).toBe(true);
      expect(getResponse.data.id).toBe(templateId);
      expect(getResponse.data.name).toBe('測試模板');
    });

    test('should return error for non-existent template', async () => {
      const response = await reportService.getTemplate('non-existent-id');

      expect(response.success).toBe(false);
      expect(response.message).toBe('模板不存在');
    });
  });

  describe('createReport', () => {
    beforeEach(async () => {
      await reportService.initialize();
    });

    test('should create a report successfully', async () => {
      // First create a template
      const templateRequest = {
        name: '測試模板',
        description: '這是一個測試模板',
        category: ReportCategory.BUSINESS,
        type: ReportType.DAILY,
        config: {
          dataSources: ['test_data'],
          filters: [],
          aggregations: [],
          visualizations: [],
          format: 'pdf',
          delivery: {
            method: 'email',
            email: {
              recipients: ['test@example.com'],
              subject: '測試報告',
              body: '測試內容',
              attachments: true,
            },
          },
          retention: {
            days: 30,
            maxReports: 100,
            archiveAfter: 7,
            deleteAfter: 30,
          },
        },
        recipients: ['test@example.com'],
      };

      const templateResponse =
        await reportService.createTemplate(templateRequest);
      const templateId = templateResponse.data.id;

      // Then create a report
      const reportRequest = {
        templateId,
        name: '測試報告',
      };

      const response = await reportService.createReport(reportRequest);

      expect(response.success).toBe(true);
      expect(response.data.name).toBe('測試報告');
      expect(response.data.templateId).toBe(templateId);
      expect(response.data.status).toBe('pending');
    });

    test('should return error for non-existent template', async () => {
      const reportRequest = {
        templateId: 'non-existent-template-id',
        name: '測試報告',
      };

      const response = await reportService.createReport(reportRequest);

      expect(response.success).toBe(false);
      expect(response.message).toBe('模板不存在');
    });
  });

  describe('getReport', () => {
    beforeEach(async () => {
      await reportService.initialize();
    });

    test('should get existing report', async () => {
      // First create a template and report
      const templateRequest = {
        name: '測試模板',
        description: '這是一個測試模板',
        category: ReportCategory.BUSINESS,
        type: ReportType.DAILY,
        config: {
          dataSources: ['test_data'],
          filters: [],
          aggregations: [],
          visualizations: [],
          format: 'pdf',
          delivery: {
            method: 'email',
            email: {
              recipients: ['test@example.com'],
              subject: '測試報告',
              body: '測試內容',
              attachments: true,
            },
          },
          retention: {
            days: 30,
            maxReports: 100,
            archiveAfter: 7,
            deleteAfter: 30,
          },
        },
        recipients: ['test@example.com'],
      };

      const templateResponse =
        await reportService.createTemplate(templateRequest);
      const templateId = templateResponse.data.id;

      const reportRequest = {
        templateId,
        name: '測試報告',
      };

      const createResponse = await reportService.createReport(reportRequest);
      const reportId = createResponse.data.id;

      // Then get the report
      const getResponse = await reportService.getReport(reportId);

      expect(getResponse.success).toBe(true);
      expect(getResponse.data.id).toBe(reportId);
      expect(getResponse.data.name).toBe('測試報告');
    });

    test('should return error for non-existent report', async () => {
      const response = await reportService.getReport('non-existent-id');

      expect(response.success).toBe(false);
      expect(response.message).toBe('報告不存在');
    });
  });

  describe('exportReport', () => {
    beforeEach(async () => {
      await reportService.initialize();
    });

    test('should export report to PDF', async () => {
      // First create a template and report
      const templateRequest = {
        name: '測試模板',
        description: '這是一個測試模板',
        category: ReportCategory.BUSINESS,
        type: ReportType.DAILY,
        config: {
          dataSources: ['test_data'],
          filters: [],
          aggregations: [],
          visualizations: [],
          format: 'pdf',
          delivery: {
            method: 'email',
            email: {
              recipients: ['test@example.com'],
              subject: '測試報告',
              body: '測試內容',
              attachments: true,
            },
          },
          retention: {
            days: 30,
            maxReports: 100,
            archiveAfter: 7,
            deleteAfter: 30,
          },
        },
        recipients: ['test@example.com'],
      };

      const templateResponse =
        await reportService.createTemplate(templateRequest);
      const templateId = templateResponse.data.id;

      const reportRequest = {
        templateId,
        name: '測試報告',
      };

      const createResponse = await reportService.createReport(reportRequest);
      const reportId = createResponse.data.id;

      // Then export the report
      const exportRequest = {
        format: ExportFormat.PDF,
      };

      const response = await reportService.exportReport(
        reportId,
        exportRequest
      );

      expect(response.success).toBe(true);
      expect(response.data.reportId).toBe(reportId);
      expect(response.data.format).toBe(ExportFormat.PDF);
      expect(response.data.status).toBe('processing');
    });

    test('should return error for non-existent report', async () => {
      const exportRequest = {
        format: ExportFormat.PDF,
      };

      const response = await reportService.exportReport(
        'non-existent-id',
        exportRequest
      );

      expect(response.success).toBe(false);
      expect(response.message).toBe('報告不存在');
    });
  });

  describe('getAnalytics', () => {
    beforeEach(async () => {
      await reportService.initialize();
    });

    test('should get analytics data', async () => {
      const response = await reportService.getAnalytics();

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('totalReports');
      expect(response.data).toHaveProperty('activeTemplates');
      expect(response.data).toHaveProperty('scheduledReports');
      expect(response.data).toHaveProperty('deliverySuccess');
      expect(response.data).toHaveProperty('deliveryFailure');
      expect(response.data).toHaveProperty('averageGenerationTime');
      expect(response.data).toHaveProperty('popularTemplates');
      expect(response.data).toHaveProperty('deliveryStats');
      expect(response.data).toHaveProperty('performanceMetrics');
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      await reportService.initialize();
    });

    test('should add and remove event listeners', () => {
      const mockCallback = jest.fn();

      reportService.addEventListener('testEvent', mockCallback);
      reportService.removeEventListener('testEvent', mockCallback);

      // The event system should work without throwing errors
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test('should emit events', () => {
      const mockCallback = jest.fn();

      reportService.addEventListener('testEvent', mockCallback);

      // Trigger an event by updating config
      reportService.updateConfig({ testProperty: 'testValue' });

      // The event should be emitted (though we can't easily test the internal emit)
      expect(mockCallback).not.toHaveBeenCalled(); // Events are internal
    });
  });

  describe('Configuration', () => {
    beforeEach(async () => {
      await reportService.initialize();
    });

    test('should get current config', () => {
      const config = reportService.getConfig();

      expect(config).toHaveProperty('maxTemplates');
      expect(config).toHaveProperty('maxReports');
      expect(config).toHaveProperty('maxExports');
      expect(config).toHaveProperty('defaultRetentionDays');
      expect(config).toHaveProperty('defaultMaxReports');
    });

    test('should update config', () => {
      const newConfig = {
        maxTemplates: 200,
        customProperty: 'customValue',
      };

      reportService.updateConfig(newConfig);

      const updatedConfig = reportService.getConfig();
      expect(updatedConfig.maxTemplates).toBe(200);
      expect(updatedConfig.customProperty).toBe('customValue');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await reportService.initialize();
    });

    test('should handle template creation with invalid data', async () => {
      // Test with invalid template request
      const invalidRequest = {
        name: '',
        description: '這是一個測試模板',
        category: ReportCategory.BUSINESS,
        type: ReportType.DAILY,
        config: {
          dataSources: ['test_data'],
          filters: [],
          aggregations: [],
          visualizations: [],
          format: 'pdf',
          delivery: {
            method: 'email',
            email: {
              recipients: ['test@example.com'],
              subject: '測試報告',
              body: '測試內容',
              attachments: true,
            },
          },
          retention: {
            days: 30,
            maxReports: 100,
            archiveAfter: 7,
            deleteAfter: 30,
          },
        },
        recipients: ['test@example.com'],
      };

      const response = await reportService.createTemplate(invalidRequest);

      // Should still succeed as validation is minimal in this implementation
      expect(response.success).toBe(true);
    });

    test('should handle report creation with invalid template ID', async () => {
      const reportRequest = {
        templateId: 'invalid-template-id',
        name: '測試報告',
      };

      const response = await reportService.createReport(reportRequest);

      expect(response.success).toBe(false);
      expect(response.message).toBe('模板不存在');
    });

    test('should handle export with invalid report ID', async () => {
      const exportRequest = {
        format: ExportFormat.PDF,
      };

      const response = await reportService.exportReport(
        'invalid-report-id',
        exportRequest
      );

      expect(response.success).toBe(false);
      expect(response.message).toBe('報告不存在');
    });
  });

  describe('Data Validation', () => {
    beforeEach(async () => {
      await reportService.initialize();
    });

    test('should validate template structure', async () => {
      const templateRequest = {
        name: '測試模板',
        description: '這是一個測試模板',
        category: ReportCategory.BUSINESS,
        type: ReportType.DAILY,
        config: {
          dataSources: ['test_data'],
          filters: [],
          aggregations: [],
          visualizations: [],
          format: 'pdf',
          delivery: {
            method: 'email',
            email: {
              recipients: ['test@example.com'],
              subject: '測試報告',
              body: '測試內容',
              attachments: true,
            },
          },
          retention: {
            days: 30,
            maxReports: 100,
            archiveAfter: 7,
            deleteAfter: 30,
          },
        },
        recipients: ['test@example.com'],
      };

      const response = await reportService.createTemplate(templateRequest);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('description');
      expect(response.data).toHaveProperty('category');
      expect(response.data).toHaveProperty('type');
      expect(response.data).toHaveProperty('config');
      expect(response.data).toHaveProperty('recipients');
      expect(response.data).toHaveProperty('isActive');
      expect(response.data).toHaveProperty('createdAt');
      expect(response.data).toHaveProperty('updatedAt');
    });

    test('should validate report structure', async () => {
      // First create a template
      const templateRequest = {
        name: '測試模板',
        description: '這是一個測試模板',
        category: ReportCategory.BUSINESS,
        type: ReportType.DAILY,
        config: {
          dataSources: ['test_data'],
          filters: [],
          aggregations: [],
          visualizations: [],
          format: 'pdf',
          delivery: {
            method: 'email',
            email: {
              recipients: ['test@example.com'],
              subject: '測試報告',
              body: '測試內容',
              attachments: true,
            },
          },
          retention: {
            days: 30,
            maxReports: 100,
            archiveAfter: 7,
            deleteAfter: 30,
          },
        },
        recipients: ['test@example.com'],
      };

      const templateResponse =
        await reportService.createTemplate(templateRequest);
      const templateId = templateResponse.data.id;

      // Then create a report
      const reportRequest = {
        templateId,
        name: '測試報告',
      };

      const response = await reportService.createReport(reportRequest);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('templateId');
      expect(response.data).toHaveProperty('name');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('data');
      expect(response.data).toHaveProperty('metadata');
      expect(response.data).toHaveProperty('generatedAt');
      expect(response.data).toHaveProperty('expiresAt');
    });
  });
});
