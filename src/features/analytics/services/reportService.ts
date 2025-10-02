import type {
  CreateReportRequest,
  CreateTemplateRequest,
  ExportReportRequest,
  ReportAnalytics,
  ReportAnalyticsResponse,
  ReportConfig,
  ReportData,
  ReportExport,
  ReportExportResponse,
  ReportInstance,
  ReportMetadata,
  ReportResponse,
  ReportTemplate,
  ReportTemplateResponse,
} from '../types/report';
import {
  AggregationFunction,
  DeliveryMethod,
  ExportFormat,
  ExportStatus,
  InsightType,
  ReportCategory,
  ReportStatus,
  ReportType,
  VisualizationType,
} from '../types/report';
import {
  convertToCSV,
  convertToExcel,
  convertToJSON,
  convertToPDF,
} from '../utils/dataConverters';

export class ReportService {
  private static instance: ReportService;
  private readonly templates: Map<string, ReportTemplate> = new Map();
  private readonly reports: Map<string, ReportInstance> = new Map();
  private readonly exports: Map<string, ReportExport> = new Map();
  private analytics: ReportAnalytics;
  private readonly eventListeners: Map<string, Function[]> = new Map();
  private config: unknown = {};
  private isInitialized = false;

  private constructor() {
    this.analytics = this.createDefaultAnalytics();
  }

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  public async initialize(config?: unknown): Promise<void> {
    if (this.isInitialized) return;

    this.config = {
      maxTemplates: 100,
      maxReports: 1000,
      maxExports: 500,
      defaultRetentionDays: 30,
      defaultMaxReports: 100,
      ...config,
    };

    await this.createDefaultTemplates();
    this.isInitialized = true;
    this.emitEvent('initialized', { config: this.config });
  }

  public async createTemplate(
    request: CreateTemplateRequest
  ): Promise<ReportTemplateResponse> {
    try {
      const template: ReportTemplate = {
        id: this.generateId(),
        name: request.name,
        description: request.description,
        category: request.category,
        type: request.type,
        config: request.config,
        schedule: request.schedule,
        recipients: request.recipients,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.templates.set(template.id, template);
      this.emitEvent('templateCreated', { template });

      return {
        success: true,
        data: template,
        message: '模板CreateSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: {} as ReportTemplate,
        message: `模板CreateFailed: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  public async getTemplate(
    templateId: string
  ): Promise<ReportTemplateResponse> {
    try {
      const _template = this.templates.get(templateId);
      if (!template) {
        return {
          success: false,
          data: {} as ReportTemplate,
          message: '模板不存在',
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: template,
        message: '模板GetSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: {} as ReportTemplate,
        message: `模板GetFailed: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  public async createReport(
    request: CreateReportRequest
  ): Promise<ReportResponse> {
    try {
      const _template = this.templates.get(request.templateId);
      if (!template) {
        return {
          success: false,
          data: {} as ReportInstance,
          message: '模板不存在',
          timestamp: new Date(),
        };
      }

      const report: ReportInstance = {
        id: this.generateId(),
        templateId: request.templateId,
        name: request.name,
        status: ReportStatus.PENDING,
        data: await this.generateReportData(template, request.config),
        metadata: this.createReportMetadata(template),
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      this.reports.set(report.id, report);
      this.emitEvent('reportCreated', { report });

      return {
        success: true,
        data: report,
        message: '報告CreateSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: {} as ReportInstance,
        message: `報告CreateFailed: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  public async getReport(reportId: string): Promise<ReportResponse> {
    try {
      const _report = this.reports.get(reportId);
      if (!report) {
        return {
          success: false,
          data: {} as ReportInstance,
          message: '報告不存在',
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: report,
        message: '報告GetSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: {} as ReportInstance,
        message: `報告GetFailed: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  public async exportReport(
    reportId: string,
    request: ExportReportRequest
  ): Promise<ReportExportResponse> {
    try {
      const _report = this.reports.get(reportId);
      if (!report) {
        return {
          success: false,
          data: {} as ReportExport,
          message: '報告不存在',
          timestamp: new Date(),
        };
      }

      const exportInstance: ReportExport = {
        id: this.generateId(),
        reportId,
        format: request.format,
        status: ExportStatus.PROCESSING,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      this.exports.set(exportInstance.id, exportInstance);

      setTimeout(() => {
        this.processExport(exportInstance.id, report, request);
      }, 1000);

      return {
        success: true,
        data: exportInstance,
        message: '報告導出已開始',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: {} as ReportExport,
        message: `報告導出Failed: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  public async getAnalytics(): Promise<ReportAnalyticsResponse> {
    try {
      this.updateAnalytics();

      return {
        success: true,
        data: this.analytics,
        message: '分析數據GetSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        data: {} as ReportAnalytics,
        message: `分析數據GetFailed: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  public addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  public removeEventListener(event: string, callback: Function): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      const _index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public getConfig(): unknown {
    return { ...this.config };
  }

  public updateConfig(newConfig: unknown): void {
    this.config = { ...this.config, ...newConfig };
    this.emitEvent('configUpdated', { config: this.config });
  }

  private async createDefaultTemplates(): Promise<void> {
    const defaultTemplates: CreateTemplateRequest[] = [
      {
        name: '業務概覽報告',
        description: '每日業務關鍵指標概覽',
        category: ReportCategory.BUSINESS,
        type: ReportType.DAILY,
        config: this.createDefaultConfig(),
        recipients: ['admin@example.com'],
      },
      {
        name: '財務分析報告',
        description: '月度財務數據分析',
        category: ReportCategory.FINANCIAL,
        type: ReportType.MONTHLY,
        config: this.createDefaultConfig(),
        recipients: ['finance@example.com'],
      },
      {
        name: '用戶行為報告',
        description: '用戶行為和趨勢分析',
        category: ReportCategory.USER,
        type: ReportType.WEEKLY,
        config: this.createDefaultConfig(),
        recipients: ['analytics@example.com'],
      },
    ];

    for (const templateRequest of defaultTemplates) {
      await this.createTemplate(templateRequest);
    }
  }

  private createDefaultConfig(): ReportConfig {
    return {
      dataSources: ['user_behavior', 'business_metrics', 'financial_data'],
      filters: [],
      aggregations: [
        {
          field: 'revenue',
          function: AggregationFunction.SUM,
          alias: 'total_revenue',
        },
      ],
      visualizations: [
        {
          type: VisualizationType.LINE_CHART,
          config: {
            title: '收入趨勢',
            colors: ['#4CAF50'],
            legend: true,
            tooltip: true,
            animation: true,
            responsive: true,
          },
          position: { x: 0, y: 0 },
          size: { width: 600, height: 400 },
        },
      ],
      format: ExportFormat.PDF,
      delivery: {
        method: DeliveryMethod.EMAIL,
        email: {
          recipients: ['admin@example.com'],
          subject: '業務報告',
          body: '請查收附件中的業務報告',
          attachments: true,
        },
      },
      retention: {
        days: 30,
        maxReports: 100,
        archiveAfter: 7,
        deleteAfter: 30,
      },
    };
  }

  private async generateReportData(
    template: ReportTemplate,
    customConfig?: Partial<ReportConfig>
  ): Promise<ReportData> {
    const _config = { ...template.config, ...customConfig };

    return {
      summary: {
        totalRecords: Math.floor(Math.random() * 10000) + 1000,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        keyMetrics: [
          {
            name: '總收入',
            value: Math.floor(Math.random() * 1000000) + 100000,
            unit: '元',
            change: Math.floor(Math.random() * 20) - 10,
            trend: 'up',
          },
          {
            name: '活躍用戶',
            value: Math.floor(Math.random() * 10000) + 1000,
            unit: '人',
            change: Math.floor(Math.random() * 15) - 5,
            trend: 'up',
          },
        ],
        trends: [
          {
            metric: '收入',
            values: this.generateTrendData(),
            direction: 'up',
            confidence: 0.85,
          },
        ],
        alerts: [
          {
            id: this.generateId(),
            type: 'info',
            message: '系統運行正常',
            severity: 'low',
            timestamp: new Date(),
          },
        ],
      },
      details: [
        {
          section: '詳細數據',
          data: this.generateMockData(),
          pagination: { page: 1, pageSize: 10, total: 100, totalPages: 10 },
          sorting: [],
          filtering: [],
        },
      ],
      charts: [
        {
          id: this.generateId(),
          type: 'line',
          title: '收入趨勢圖',
          data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [
              {
                label: '收入',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: '#4CAF50',
                borderColor: '#4CAF50',
              },
            ],
          },
          config: { type: 'line', options: {} },
          interactive: true,
        },
      ],
      tables: [
        {
          id: this.generateId(),
          title: '數據表格',
          columns: [
            {
              key: 'date',
              title: '日期',
              type: 'date',
              sortable: true,
              filterable: true,
            },
            {
              key: 'revenue',
              title: '收入',
              type: 'number',
              sortable: true,
              filterable: true,
            },
            {
              key: 'users',
              title: '用戶數',
              type: 'number',
              sortable: true,
              filterable: true,
            },
          ],
          data: this.generateTableData(),
          pagination: { page: 1, pageSize: 10, total: 30, totalPages: 3 },
          sorting: [],
          filtering: [],
        },
      ],
      insights: [
        {
          id: this.generateId(),
          type: InsightType.TREND,
          title: '收入增長趨勢',
          description: '過去6個月收入呈現穩定增長趨勢',
          confidence: 0.85,
          recommendations: ['繼續保持現有策略', '考慮擴大市場份額'],
          actions: ['優化產品功能', '增加營銷投入'],
        },
      ],
    };
  }

  private createReportMetadata(template: ReportTemplate): ReportMetadata {
    return {
      generatedBy: 'ReportService',
      dataSource: template.config.dataSources.join(', '),
      filters: template.config.filters.map(
        f => `${f.field} ${f.operator} ${f.value}`
      ),
      processingTime: Math.floor(Math.random() * 5000) + 1000,
      dataSize: Math.floor(Math.random() * 1000000) + 100000,
      version: '1.0.0',
    };
  }

  private async processExport(
    exportId: string,
    report: ReportInstance,
    request: ExportReportRequest
  ): Promise<void> {
    try {
      const _exportInstance = this.exports.get(exportId);
      if (!exportInstance) return;

      let exportData: string;
      switch (request.format) {
        case ExportFormat.JSON:
          exportData = convertToJSON(report);
          break;
        case ExportFormat.CSV:
          exportData = convertToCSV(report);
          break;
        case ExportFormat.EXCEL:
          exportData = convertToExcel(report);
          break;
        case ExportFormat.PDF:
          exportData = convertToPDF(report);
          break;
        default:
          exportData = convertToJSON(report);
      }

      const updatedExport: ReportExport = {
        ...exportInstance,
        status: ExportStatus.COMPLETED,
        url: `https://example.com/exports/${exportId}.${request.format}`,
        size: exportData.length,
      };

      this.exports.set(exportId, updatedExport);
      this.emitEvent('exportCompleted', { export: updatedExport });
    } catch (error) {
      const _exportInstance = this.exports.get(exportId);
      if (exportInstance) {
        const failedExport: ReportExport = {
          ...exportInstance,
          status: ExportStatus.FAILED,
        };
        this.exports.set(exportId, failedExport);
        this.emitEvent('exportFailed', { exportId, error });
      }
    }
  }

  private createDefaultAnalytics(): ReportAnalytics {
    return {
      totalReports: 0,
      activeTemplates: 0,
      scheduledReports: 0,
      deliverySuccess: 0,
      deliveryFailure: 0,
      averageGenerationTime: 0,
      popularTemplates: [],
      deliveryStats: {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        averageDeliveryTime: 0,
        deliveryMethods: [],
      },
      performanceMetrics: {
        averageGenerationTime: 0,
        averageDeliveryTime: 0,
        successRate: 0,
        errorRate: 0,
        resourceUsage: {
          cpu: 0,
          memory: 0,
          storage: 0,
          network: 0,
        },
      },
    };
  }

  private updateAnalytics(): void {
    const _reports = Array.from(this.reports.values());
    const _templates = Array.from(this.templates.values());

    this.analytics = {
      totalReports: reports.length,
      activeTemplates: templates.filter(t => t.isActive).length,
      scheduledReports: templates.filter(t => t.schedule?.isActive).length,
      deliverySuccess: reports.filter(r => r.status === ReportStatus.DELIVERED)
        .length,
      deliveryFailure: reports.filter(r => r.status === ReportStatus.FAILED)
        .length,
      averageGenerationTime: this.calculateAverageGenerationTime(reports),
      popularTemplates: this.calculatePopularTemplates(templates, reports),
      deliveryStats: this.calculateDeliveryStats(reports),
      performanceMetrics: this.calculatePerformanceMetrics(reports),
    };
  }

  private calculateAverageGenerationTime(reports: ReportInstance[]): number {
    if (reports.length === 0) return 0;
    const _totalTime = reports.reduce(
      (sum, report) => sum + report.metadata.processingTime,
      0
    );
    return totalTime / reports.length;
  }

  private calculatePopularTemplates(
    templates: ReportTemplate[],
    reports: ReportInstance[]
  ): unknown[] {
    const _templateUsage = new Map<string, number>();

    reports.forEach(report => {
      const _count = templateUsage.get(report.templateId) || 0;
      templateUsage.set(report.templateId, count + 1);
    });

    return Array.from(templateUsage.entries())
      .map(([templateId, usageCount]) => {
        const _template = templates.find(t => t.id === templateId);
        return {
          templateId,
          name: template?.name || '未知模板',
          usageCount,
          successRate: Math.random() * 0.3 + 0.7,
          averageRating: Math.random() * 2 + 3,
        };
      })
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);
  }

  private calculateDeliveryStats(reports: ReportInstance[]): unknown {
    const _totalDeliveries = reports.length;
    const _successfulDeliveries = reports.filter(
      r => r.status === ReportStatus.DELIVERED
    ).length;
    const _failedDeliveries = reports.filter(
      r => r.status === ReportStatus.FAILED
    ).length;

    return {
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      averageDeliveryTime: Math.floor(Math.random() * 5000) + 1000,
      deliveryMethods: [
        {
          method: DeliveryMethod.EMAIL,
          count: Math.floor(totalDeliveries * 0.7),
          successRate: 0.95,
          averageTime: 2000,
        },
        {
          method: DeliveryMethod.WEBHOOK,
          count: Math.floor(totalDeliveries * 0.2),
          successRate: 0.88,
          averageTime: 1500,
        },
        {
          method: DeliveryMethod.STORAGE,
          count: Math.floor(totalDeliveries * 0.1),
          successRate: 0.92,
          averageTime: 3000,
        },
      ],
    };
  }

  private calculatePerformanceMetrics(reports: ReportInstance[]): unknown {
    const _totalOperations = reports.length;
    const _successfulOperations = reports.filter(
      r => r.status !== ReportStatus.FAILED
    ).length;

    return {
      averageGenerationTime: this.calculateAverageGenerationTime(reports),
      averageDeliveryTime: Math.floor(Math.random() * 5000) + 1000,
      successRate:
        totalOperations > 0 ? successfulOperations / totalOperations : 0,
      errorRate:
        totalOperations > 0
          ? (totalOperations - successfulOperations) / totalOperations
          : 0,
      resourceUsage: {
        cpu: Math.random() * 30 + 20,
        memory: Math.random() * 40 + 30,
        storage: Math.random() * 20 + 10,
        network: Math.random() * 15 + 5,
      },
    };
  }

  private generateId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTrendData(): unknown[] {
    const _data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        value: Math.floor(Math.random() * 10000) + 5000,
      });
    }
    return data;
  }

  private generateMockData(): unknown[] {
    const _data = [];
    for (let i = 0; i < 10; i++) {
      data.push({
        id: i + 1,
        name: `項目${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 100,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      });
    }
    return data;
  }

  private generateTableData(): unknown[] {
    const _data = [];
    for (let i = 0; i < 30; i++) {
      data.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        revenue: Math.floor(Math.random() * 10000) + 5000,
        users: Math.floor(Math.random() * 1000) + 100,
      });
    }
    return data;
  }

  private emitEvent(event: string, data: unknown): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event listener error for ${event}:`, error);
        }
      });
    }
  }
}
