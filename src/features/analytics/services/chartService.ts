// GraphTableService
import type {
  ChartConfig,
  ChartData,
  ChartInstance,
  ChartTemplate,
  ChartResponse,
  ChartListResponse,
  ChartCreateRequest,
  ChartUpdateRequest,
  ChartFilterOptions,
  ChartAnalytics,
  ChartEvent,
  ChartPlugin,
  ChartCache,
  ChartStatistics,
  ChartTheme,
} from '../types/chart';
import {
  ChartType,
  PerformanceMetrics,
  LegendConfig,
  AxesConfig,
  GridConfig,
  TooltipConfig,
  InteractionConfig,
  ExportConfig,
  AccessibilityConfig,
} from '../types/chart';

// GraphTableServiceClass
class ChartService {
  private static instance: ChartService;
  private readonly charts: Map<string, ChartInstance> = new Map();
  private readonly templates: Map<string, ChartTemplate> = new Map();
  private readonly plugins: Map<string, ChartPlugin> = new Map();
  private readonly cache: Map<string, ChartCache> = new Map();
  private readonly analytics: Map<string, ChartAnalytics> = new Map();
  private readonly eventListeners: Map<string, Function[]> = new Map();
  private config: {
    maxCharts: number;
    cacheSize: number;
    defaultTheme: ChartTheme;
    performanceMonitoring: boolean;
    autoExport: boolean;
  };

  private constructor() {
    this.config = {
      maxCharts: 100,
      cacheSize: 50,
      defaultTheme: this.createDefaultTheme(),
      performanceMonitoring: true,
      autoExport: false,
    };
    this.initializeDefaultTemplates();
  }

  // 單例模式
  public static getInstance(): ChartService {
    if (!ChartService.instance) {
      ChartService.instance = new ChartService();
    }
    return ChartService.instance;
  }

  // InitializeService
  public async initialize(): Promise<void> {
    try {
      console.log('ChartService: Initialize圖表Service');
      await this.loadTemplates();
      await this.loadPlugins();
      await this.loadCache();
      this.emitEvent('initialized', { timestamp: new Date() });
    } catch (error) {
      console.error('ChartService: InitializeFailed', error);
      throw error;
    }
  }

  // CreateGraphTable
  public async createChart(
    request: ChartCreateRequest
  ): Promise<ChartResponse> {
    try {
      const _chartId = this.generateId();
      const chart: ChartInstance = {
        id: chartId,
        config: { ...this.config.defaultTheme, ...request.config },
        data: request.data,
        status: 'idle',
        lastUpdate: new Date(),
      };

      // VerifyConfigure
      this.validateChartConfig(chart.config);
      this.validateChartData(chart.data);

      // Apply模板
      if (request.templateId) {
        const _template = this.templates.get(request.templateId);
        if (template) {
          chart.config = { ...template.config, ...chart.config };
        }
      }

      // 渲染GraphTable
      await this.renderChart(chart);

      this.charts.set(chartId, chart);
      this.emitEvent('chart_created', { chartId, config: chart.config });

      return {
        success: true,
        chart,
        message: '圖表CreateSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('ChartService: Create圖表Failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: new Date(),
      };
    }
  }

  // GetGraphTable
  public async getChart(chartId: string): Promise<ChartResponse> {
    try {
      const _chart = this.charts.get(chartId);
      if (!chart) {
        return {
          success: false,
          error: '圖表不存在',
          timestamp: new Date(),
        };
      }

      // UpdateAnalysisData
      await this.updateAnalytics(chartId, 'viewed');

      return {
        success: true,
        chart,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('ChartService: Get圖表Failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: new Date(),
      };
    }
  }

  // GetGraphTableList
  public async getCharts(
    options: ChartFilterOptions = {}
  ): Promise<ChartListResponse> {
    try {
      let charts = Array.from(this.charts.values());

      // ApplyFilter器
      if (options.type) {
        charts = charts.filter(chart => chart.config.type === options.type);
      }
      if (options.category) {
        charts = charts.filter(chart =>
          chart.config.title?.includes(options.category)
        );
      }
      if (options.author) {
        charts = charts.filter(chart =>
          chart.config.description?.includes(options.author)
        );
      }
      if (options.tags && options.tags.length > 0) {
        charts = charts.filter(chart =>
          options.tags.some(tag => chart.config.description?.includes(tag))
        );
      }
      if (options.dateRange) {
        charts = charts.filter(
          chart =>
            chart.lastUpdate >= options.dateRange.start &&
            chart.lastUpdate <= options.dateRange.end
        );
      }

      return {
        success: true,
        charts,
        total: charts.length,
        page: 1,
        limit: charts.length,
        hasMore: false,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('ChartService: Get圖表列表Failed', error);
      return {
        success: false,
        charts: [],
        total: 0,
        page: 1,
        limit: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: new Date(),
      };
    }
  }

  // UpdateGraphTable
  public async updateChart(
    chartId: string,
    request: ChartUpdateRequest
  ): Promise<ChartResponse> {
    try {
      const _chart = this.charts.get(chartId);
      if (!chart) {
        return {
          success: false,
          error: '圖表不存在',
          timestamp: new Date(),
        };
      }

      // UpdateConfigure
      if (request.config) {
        chart.config = { ...chart.config, ...request.config };
        this.validateChartConfig(chart.config);
      }

      // UpdateData
      if (request.data) {
        chart.data = request.data;
        this.validateChartData(chart.data);
      }

      // Update元Data
      if (request.metadata) {
        chart.config = { ...chart.config, ...request.metadata };
      }

      chart.lastUpdate = new Date();
      chart.status = 'idle';

      // Re渲染
      await this.renderChart(chart);

      this.emitEvent('chart_updated', { chartId, config: chart.config });

      return {
        success: true,
        chart,
        message: '圖表UpdateSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('ChartService: Update圖表Failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: new Date(),
      };
    }
  }

  // DeleteGraphTable
  public async deleteChart(chartId: string): Promise<ChartResponse> {
    try {
      const _chart = this.charts.get(chartId);
      if (!chart) {
        return {
          success: false,
          error: '圖表不存在',
          timestamp: new Date(),
        };
      }

      // 清理Resource
      if (chart.instance) {
        chart.instance.destroy?.();
      }

      this.charts.delete(chartId);
      this.analytics.delete(chartId);
      this.cache.delete(chartId);

      this.emitEvent('chart_deleted', { chartId });

      return {
        success: true,
        message: '圖表DeleteSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('ChartService: Delete圖表Failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: new Date(),
      };
    }
  }

  // ExportGraphTable
  public async exportChart(
    chartId: string,
    format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png'
  ): Promise<ChartResponse> {
    try {
      const _chart = this.charts.get(chartId);
      if (!chart) {
        return {
          success: false,
          error: '圖表不存在',
          timestamp: new Date(),
        };
      }

      // CheckExportConfigure
      if (!chart.config.export?.enabled) {
        return {
          success: false,
          error: '圖表導出功能未啟用',
          timestamp: new Date(),
        };
      }

      if (!chart.config.export.formats.includes(format)) {
        return {
          success: false,
          error: `不支持的導出格式: ${format}`,
          timestamp: new Date(),
        };
      }

      // 執RowExport
      const _exportData = await this.performExport(chart, format);

      // UpdateAnalysisData
      await this.updateAnalytics(chartId, 'exported');

      this.emitEvent('chart_exported', { chartId, format, data: exportData });

      return {
        success: true,
        message: `圖表導出Success (${format})`,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('ChartService: 導出圖表Failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: new Date(),
      };
    }
  }

  // Get模板
  public async getTemplates(): Promise<ChartTemplate[]> {
    return Array.from(this.templates.values());
  }

  // GetAnalysisData
  public async getAnalytics(chartId: string): Promise<ChartAnalytics | null> {
    return this.analytics.get(chartId) || null;
  }

  // Get統Count據
  public async getStatistics(): Promise<ChartStatistics> {
    const _charts = Array.from(this.charts.values());
    const _analytics = Array.from(this.analytics.values());
    const _templates = Array.from(this.templates.values());

    const chartsByType: Record<ChartType, number> = {} as Record<
      ChartType,
      number
    >;
    const chartsByCategory: Record<string, number> = {};

    charts.forEach(chart => {
      chartsByType[chart.config.type] =
        (chartsByType[chart.config.type] || 0) + 1;
      const _category = chart.config.title?.split(' ')[0] || '未分類';
      chartsByCategory[category] = (chartsByCategory[category] || 0) + 1;
    });

    const _totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
    const _totalExports = analytics.reduce((sum, a) => sum + a.exports, 0);
    const _averageRenderTime =
      analytics.reduce((sum, a) => sum + a.performance.renderTime, 0) /
        analytics.length || 0;

    const _popularTemplates = templates
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);

    const _recentActivity = this.getRecentEvents();

    return {
      totalCharts: charts.length,
      chartsByType,
      chartsByCategory,
      averageRenderTime,
      totalViews,
      totalExports,
      popularTemplates,
      recentActivity,
      performanceTrends: this.getPerformanceTrends(),
    };
  }

  // AddEvent監聽器
  public addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  // RemoveEvent監聽器
  public removeEventListener(event: string, callback: Function): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      const _index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // GetConfigure
  public getConfig(): unknown {
    return { ...this.config };
  }

  // UpdateConfigure
  public updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
    this.emitEvent('config_updated', { config: this.config });
  }

  // PrivateMethod

  private createDefaultTheme(): ChartTheme {
    return {
      name: 'default',
      colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      borderColor: '#E0E0E0',
      gridColor: '#F0F0F0',
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      borderRadius: 4,
      shadow: true,
      gradient: false,
    };
  }

  private initializeDefaultTemplates(): void {
    // 線Graph模板
    const lineTemplate: ChartTemplate = {
      id: 'line-chart-template',
      name: '線圖模板',
      description: '標準線圖模板，適用於趨勢分析',
      category: '趨勢分析',
      type: ChartType.LINE,
      config: {
        type: ChartType.LINE,
        title: '趨勢線圖',
        responsive: true,
        animation: true,
        animationDuration: 1000,
        legend: {
          display: true,
          position: 'top',
          align: 'center',
          labels: {
            color: '#333333',
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            padding: 10,
            usePointStyle: false,
          },
        },
        axes: {
          x: {
            display: true,
            type: 'category',
            position: 'bottom',
            gridLines: {
              display: true,
              color: '#F0F0F0',
              lineWidth: 1,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
            },
            ticks: {
              display: true,
              color: '#666666',
              fontSize: 10,
              fontFamily: 'Arial, sans-serif',
              padding: 5,
            },
          },
          y: {
            display: true,
            type: 'linear',
            position: 'left',
            gridLines: {
              display: true,
              color: '#F0F0F0',
              lineWidth: 1,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
            },
            ticks: {
              display: true,
              color: '#666666',
              fontSize: 10,
              fontFamily: 'Arial, sans-serif',
              padding: 5,
            },
          },
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: '#000000',
          borderWidth: 1,
          cornerRadius: 4,
          caretSize: 5,
          displayColors: true,
          titleFontSize: 14,
          bodyFontSize: 12,
          footerFontSize: 10,
          padding: 8,
        },
        export: {
          enabled: true,
          formats: ['png', 'jpg', 'svg', 'pdf'],
          quality: 0.9,
        },
      },
      sampleData: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            label: '銷售額',
            data: [
              { label: '1月', value: 100 },
              { label: '2月', value: 120 },
              { label: '3月', value: 90 },
              { label: '4月', value: 150 },
              { label: '5月', value: 180 },
              { label: '6月', value: 200 },
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
          },
        ],
      },
      tags: ['線圖', '趨勢', '分析'],
      rating: 4.5,
      downloads: 1250,
      author: 'CardStrategy Team',
      createdAt: new Date(),
      updatedAt: new Date(),
      isOfficial: true,
    };

    this.templates.set(lineTemplate.id, lineTemplate);
  }

  private async loadTemplates(): Promise<void> {
    // 這裡可以從Database或File系統加載模板
    console.log('ChartService: 加載模板完成');
  }

  private async loadPlugins(): Promise<void> {
    // 這裡可以加載GraphTablePlugin
    console.log('ChartService: 加載插件完成');
  }

  private async loadCache(): Promise<void> {
    // 這裡可以從Cache系統加載CacheData
    console.log('ChartService: 加載緩存完成');
  }

  private validateChartConfig(config: ChartConfig): void {
    if (!config.type) {
      throw new Error('圖表類型不能為空');
    }
    if (!Object.values(ChartType).includes(config.type)) {
      throw new Error(`不支持的圖表類型: ${config.type}`);
    }
  }

  private validateChartData(data: ChartData): void {
    if (!data.labels || data.labels.length === 0) {
      throw new Error('圖表標籤不能為空');
    }
    if (!data.datasets || data.datasets.length === 0) {
      throw new Error('圖表數據集不能為空');
    }
    data.datasets.forEach((dataset, index) => {
      if (!dataset.label) {
        throw new Error(`數據集 ${index} 的標籤不能為空`);
      }
      if (!dataset.data || dataset.data.length === 0) {
        throw new Error(`數據集 ${index} 的數據不能為空`);
      }
    });
  }

  private async renderChart(chart: ChartInstance): Promise<void> {
    try {
      chart.status = 'loading';
      const _startTime = performance.now();

      // 模擬GraphTable渲染
      await new Promise(resolve => setTimeout(resolve, 100));

      chart.status = 'rendered';
      chart.lastUpdate = new Date();

      if (this.config.performanceMonitoring) {
        const _renderTime = performance.now() - startTime;
        chart.performance = {
          renderTime,
          dataProcessingTime: renderTime * 0.3,
          memoryUsage: Math.random() * 100,
          frameRate: 60,
          lastMeasured: new Date(),
        };
      }

      this.emitEvent('chart_rendered', {
        chartId: chart.id,
        performance: chart.performance,
      });
    } catch (error) {
      chart.status = 'error';
      chart.error = error instanceof Error ? error.message : '渲染Failed';
      this.emitEvent('chart_error', { chartId: chart.id, error: chart.error });
      throw error;
    }
  }

  private async performExport(
    chart: ChartInstance,
    format: string
  ): Promise<any> {
    // 模擬Export過程
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      format,
      data: `chart_${chart.id}_${Date.now()}.${format}`,
      size: Math.random() * 1024 * 1024, // 1MB 以內
      timestamp: new Date(),
    };
  }

  private async updateAnalytics(
    chartId: string,
    action: string
  ): Promise<void> {
    let analytics = this.analytics.get(chartId);
    if (!analytics) {
      analytics = {
        id: this.generateId(),
        chartId,
        views: 0,
        interactions: 0,
        exports: 0,
        shares: 0,
        averageViewTime: 0,
        userEngagement: 0,
        performance: {
          renderTime: 0,
          dataProcessingTime: 0,
          memoryUsage: 0,
          frameRate: 60,
          lastMeasured: new Date(),
        },
        lastViewed: new Date(),
        createdAt: new Date(),
      };
    }

    switch (action) {
      case 'viewed':
        analytics.views++;
        analytics.lastViewed = new Date();
        break;
      case 'exported':
        analytics.exports++;
        break;
      case 'shared':
        analytics.shares++;
        break;
      case 'interacted':
        analytics.interactions++;
        break;
    }

    this.analytics.set(chartId, analytics);
  }

  private getRecentEvents(): ChartEvent[] {
    // 模擬最近Event
    return [
      {
        type: 'viewed',
        chartId: 'chart_1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5Minute前
        metadata: { userId: 'user_1' },
      },
      {
        type: 'exported',
        chartId: 'chart_2',
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10Minute前
        metadata: { format: 'png' },
      },
    ];
  }

  private getPerformanceTrends(): {
    date: Date;
    renderTime: number;
    views: number;
  }[] {
    // 模擬性能趨勢Data
    const _trends = [];
    for (let i = 7; i >= 0; i--) {
      trends.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        renderTime: Math.random() * 100 + 50,
        views: Math.floor(Math.random() * 100) + 10,
      });
    }
    return trends;
  }

  private generateId(): string {
    return `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitEvent(event: string, data: unknown): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`ChartService: 事件監聽器Error (${event})`, error);
        }
      });
    }
  }
}

export default ChartService;
