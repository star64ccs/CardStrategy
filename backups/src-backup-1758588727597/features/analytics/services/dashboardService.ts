import type {
  AlertAction,
  AlertCondition,
  DashboardAlert,
  DashboardAnalytics,
  DashboardConfig,
  DashboardCreateRequest,
  DashboardData,
  DashboardExport,
  DashboardFilterOptions,
  DashboardLayout,
  DashboardListResponse,
  DashboardTemplate,
  DashboardTheme,
  DashboardUpdateRequest,
  DashboardWidget,
  DataMetadata,
  DataSource,
  PerformanceMetrics,
} from '../types/dashboard';

class DashboardService {
  private static instance: DashboardService;
  private isInitialized = false;
  private readonly dashboards: Map<string, DashboardConfig> = new Map();
  private readonly dashboardData: Map<string, DashboardData[]> = new Map();
  private readonly exports: Map<string, DashboardExport> = new Map();
  private readonly alerts: Map<string, DashboardAlert> = new Map();
  private readonly templates: Map<string, DashboardTemplate> = new Map();
  private readonly analytics: Map<string, DashboardAnalytics> = new Map();
  private readonly eventListeners: Map<string, Function[]> = new Map();
  private readonly refreshIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 初始化默認儀表板
      await this.initializeDefaultDashboards();

      // 初始化默認模板
      await this.initializeDefaultTemplates();

      // 初始化默認主題
      await this.initializeDefaultThemes();

      this.isInitialized = true;
      this.emitEvent('initialized', { timestamp: new Date() });
    } catch (error) {
      throw new Error(`DashboardService initialization failed: ${error}`);
    }
  }

  private async initializeDefaultDashboards(): Promise<void> {
    const defaultDashboard: DashboardConfig = {
      id: 'default-dashboard',
      name: '默認儀表板',
      description: '系統默認儀表板',
      layouts: [this.createDefaultLayout()],
      dataSources: this.createDefaultDataSources(),
      refreshInterval: 300, // 5分鐘
      autoSave: true,
      sharing: {
        isPublic: false,
        allowEdit: false,
        allowCopy: false,
        allowedUsers: [],
        allowedRoles: [],
      },
      permissions: {
        owner: 'system',
        editors: [],
        viewers: [],
        roles: [],
      },
      theme: this.createDefaultTheme(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.set(defaultDashboard.id, defaultDashboard);
  }

  private createDefaultLayout(): DashboardLayout {
    return {
      id: 'default-layout',
      name: '默認佈局',
      description: '系統默認佈局',
      gridSize: {
        columns: 12,
        rows: 8,
        cellWidth: 100,
        cellHeight: 80,
      },
      widgets: this.createDefaultWidgets(),
      theme: this.createDefaultTheme(),
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private createDefaultWidgets(): DashboardWidget[] {
    return [
      {
        id: 'widget-1',
        type: 'metric',
        title: '總用戶數',
        description: '平台總用戶數量',
        dataSource: 'user-metrics',
        config: {
          metrics: ['totalUsers'],
          format: {
            type: 'number',
            precision: 0,
          },
        },
        position: { x: 0, y: 0 },
        size: { width: 3, height: 2 },
        refreshInterval: 60,
        isVisible: true,
        isEditable: true,
      },
      {
        id: 'widget-2',
        type: 'chart',
        title: '用戶增長趨勢',
        description: '用戶數量增長趨勢圖',
        dataSource: 'user-growth',
        config: {
          chartType: 'line',
          metrics: ['newUsers', 'activeUsers'],
          colors: ['#4CAF50', '#2196F3'],
        },
        position: { x: 3, y: 0 },
        size: { width: 6, height: 3 },
        refreshInterval: 300,
        isVisible: true,
        isEditable: true,
      },
      {
        id: 'widget-3',
        type: 'table',
        title: '熱門卡片',
        description: '最受歡迎的卡片列表',
        dataSource: 'popular-cards',
        config: {
          metrics: ['cardName', 'views', 'likes'],
          sortBy: 'views',
          sortOrder: 'desc',
          limit: 10,
        },
        position: { x: 0, y: 2 },
        size: { width: 9, height: 4 },
        refreshInterval: 600,
        isVisible: true,
        isEditable: true,
      },
    ];
  }

  private createDefaultDataSources(): DataSource[] {
    return [
      {
        id: 'user-metrics',
        name: '用戶指標',
        type: 'api',
        connection: {
          url: '/api/analytics/user-metrics',
          timeout: 5000,
          retryAttempts: 3,
        },
        schema: {
          fields: [
            { name: 'totalUsers', type: 'number', required: true },
            { name: 'activeUsers', type: 'number', required: true },
            { name: 'newUsers', type: 'number', required: true },
          ],
        },
        refreshInterval: 300,
        isActive: true,
      },
      {
        id: 'user-growth',
        name: '用戶增長',
        type: 'api',
        connection: {
          url: '/api/analytics/user-growth',
          timeout: 5000,
          retryAttempts: 3,
        },
        schema: {
          fields: [
            { name: 'date', type: 'date', required: true },
            { name: 'newUsers', type: 'number', required: true },
            { name: 'activeUsers', type: 'number', required: true },
          ],
        },
        refreshInterval: 3600,
        isActive: true,
      },
      {
        id: 'popular-cards',
        name: '熱門卡片',
        type: 'api',
        connection: {
          url: '/api/analytics/popular-cards',
          timeout: 5000,
          retryAttempts: 3,
        },
        schema: {
          fields: [
            { name: 'cardName', type: 'string', required: true },
            { name: 'views', type: 'number', required: true },
            { name: 'likes', type: 'number', required: true },
          ],
        },
        refreshInterval: 1800,
        isActive: true,
      },
    ];
  }

  private createDefaultTheme(): DashboardTheme {
    return {
      primaryColor: '#2196F3',
      secondaryColor: '#FFC107',
      backgroundColor: '#FFFFFF',
      textColor: '#333333',
      borderColor: '#E0E0E0',
      chartColors: ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0'],
      fontFamily: 'Roboto, sans-serif',
      fontSize: 14,
    };
  }

  private async initializeDefaultTemplates(): Promise<void> {
    const templates: DashboardTemplate[] = [
      {
        id: 'template-1',
        name: '業務概覽',
        description: '適合業務管理者的概覽儀表板',
        category: 'business',
        thumbnail: '/templates/business-overview.png',
        config: this.createDefaultDashboard(),
        tags: ['business', 'overview', 'management'],
        rating: 4.5,
        downloadCount: 1250,
        isOfficial: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'template-2',
        name: '用戶分析',
        description: '專注於用戶行為分析的儀表板',
        category: 'analytics',
        thumbnail: '/templates/user-analytics.png',
        config: this.createDefaultDashboard(),
        tags: ['analytics', 'user', 'behavior'],
        rating: 4.8,
        downloadCount: 890,
        isOfficial: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private createDefaultDashboard(): DashboardConfig {
    return {
      id: 'template-dashboard',
      name: '模板儀表板',
      description: '模板儀表板',
      layouts: [this.createDefaultLayout()],
      dataSources: this.createDefaultDataSources(),
      refreshInterval: 300,
      autoSave: true,
      sharing: {
        isPublic: false,
        allowEdit: false,
        allowCopy: false,
        allowedUsers: [],
        allowedRoles: [],
      },
      permissions: {
        owner: 'system',
        editors: [],
        viewers: [],
        roles: [],
      },
      theme: this.createDefaultTheme(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async initializeDefaultThemes(): Promise<void> {
    // 可以添加更多預設主題
  }

  async getDashboard(dashboardId: string): Promise<DashboardConfig | null> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    return this.dashboards.get(dashboardId) || null;
  }

  async getDashboards(
    filter?: DashboardFilterOptions
  ): Promise<DashboardListResponse> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    let filteredDashboards = Array.from(this.dashboards.values());

    if (filter) {
      if (filter.search) {
        filteredDashboards = filteredDashboards.filter(
          dashboard =>
            dashboard.name
              .toLowerCase()
              .includes(filter.search.toLowerCase()) ||
            dashboard.description
              ?.toLowerCase()
              .includes(filter.search.toLowerCase())
        );
      }

      if (filter.owner) {
        filteredDashboards = filteredDashboards.filter(
          dashboard => dashboard.permissions.owner === filter.owner
        );
      }

      if (filter.isPublic !== undefined) {
        filteredDashboards = filteredDashboards.filter(
          dashboard => dashboard.sharing.isPublic === filter.isPublic
        );
      }

      if (filter.sortBy) {
        filteredDashboards.sort((a, b) => {
          let aValue: unknown, bValue: unknown;

          switch (filter.sortBy) {
            case 'name':
              aValue = a.name;
              bValue = b.name;
              break;
            case 'createdAt':
              aValue = a.createdAt;
              bValue = b.createdAt;
              break;
            case 'updatedAt':
              aValue = a.updatedAt;
              bValue = b.updatedAt;
              break;
            default:
              return 0;
          }

          if (filter.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }
    }

    return {
      success: true,
      data: filteredDashboards,
      total: filteredDashboards.length,
      page: 1,
      limit: filteredDashboards.length,
    };
  }

  async createDashboard(
    request: DashboardCreateRequest
  ): Promise<DashboardConfig> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const dashboardId = `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const dashboard: DashboardConfig = {
      id: dashboardId,
      name: request.name,
      description: request.description,
      layouts: request.layout
        ? [request.layout as DashboardLayout]
        : [this.createDefaultLayout()],
      dataSources: request.dataSources || this.createDefaultDataSources(),
      refreshInterval: 300,
      autoSave: true,
      sharing: {
        isPublic: false,
        allowEdit: false,
        allowCopy: false,
        allowedUsers: [],
        allowedRoles: [],
      },
      permissions: {
        owner: 'current-user',
        editors: [],
        viewers: [],
        roles: [],
      },
      theme: request.theme
        ? { ...this.createDefaultTheme(), ...request.theme }
        : this.createDefaultTheme(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.set(dashboardId, dashboard);
    this.emitEvent('dashboardCreated', { dashboardId, dashboard });

    return dashboard;
  }

  async updateDashboard(
    dashboardId: string,
    request: DashboardUpdateRequest
  ): Promise<DashboardConfig> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }

    const updatedDashboard: DashboardConfig = {
      ...dashboard,
      ...request,
      sharing: request.sharing
        ? { ...dashboard.sharing, ...request.sharing }
        : dashboard.sharing,
      permissions: request.permissions
        ? { ...dashboard.permissions, ...request.permissions }
        : dashboard.permissions,
      theme: request.theme
        ? { ...dashboard.theme, ...request.theme }
        : dashboard.theme,
      updatedAt: new Date(),
    };

    this.dashboards.set(dashboardId, updatedDashboard);
    this.emitEvent('dashboardUpdated', {
      dashboardId,
      dashboard: updatedDashboard,
    });

    return updatedDashboard;
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }

    this.dashboards.delete(dashboardId);
    this.dashboardData.delete(dashboardId);
    this.exports.delete(dashboardId);
    this.alerts.delete(dashboardId);
    this.analytics.delete(dashboardId);

    // 清除刷新間隔
    const refreshInterval = this.refreshIntervals.get(dashboardId);
    if (refreshInterval) {
      clearInterval(refreshInterval);
      this.refreshIntervals.delete(dashboardId);
    }

    this.emitEvent('dashboardDeleted', { dashboardId });
  }

  async getDashboardData(
    dashboardId: string,
    widgetId?: string
  ): Promise<DashboardData[]> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }

    const allData = this.dashboardData.get(dashboardId) || [];

    if (widgetId) {
      return allData.filter(data => data.widgetId === widgetId);
    }

    return allData;
  }

  async refreshDashboardData(dashboardId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }

    try {
      // 使用真實的儀表板服務
      const { realDashboardService } = await import('./realDashboardService');

      const newData = await realDashboardService.refreshDashboardData(
        dashboardId,
        dashboard
      );

      this.dashboardData.set(dashboardId, newData);
      this.emitEvent('dataRefreshed', { dashboardId, data: newData });
    } catch (error) {
      logger.error('真實數據刷新失敗，回退到模擬數據:', error);

      // 回退到模擬數據刷新
      const newData: DashboardData[] = [];

      for (const layout of dashboard.layouts) {
        for (const widget of layout.widgets) {
          const mockData = this.generateMockData(widget);
          const metadata: DataMetadata = {
            source: widget.dataSource,
            lastUpdated: new Date(),
            recordCount: Array.isArray(mockData) ? mockData.length : 1,
            processingTime: Math.random() * 100,
            cacheStatus: 'fresh',
          };

          newData.push({
            widgetId: widget.id,
            data: mockData,
            metadata,
            timestamp: new Date(),
          });
        }
      }

      this.dashboardData.set(dashboardId, newData);
      this.emitEvent('dataRefreshed', { dashboardId, data: newData });
    }
  }

  private generateMockData(widget: DashboardWidget): unknown {
    switch (widget.type) {
      case 'metric':
        return Math.floor(Math.random() * 10000);
      case 'chart':
        return Array.from({ length: 10 }, (_, i) => ({
          date: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          value: Math.floor(Math.random() * 1000),
        }));
      case 'table':
        return Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          name: `項目 ${i + 1}`,
          value: Math.floor(Math.random() * 1000),
          status: ['active', 'inactive', 'pending'][
            Math.floor(Math.random() * 3)
          ],
        }));
      default:
        return [];
    }
  }

  async exportDashboard(
    dashboardId: string,
    format: 'pdf' | 'png' | 'jpg' | 'svg' | 'html'
  ): Promise<DashboardExport> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }

    const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const dashboardExport: DashboardExport = {
      id: exportId,
      dashboardId,
      format,
      size: 'medium',
      includeData: true,
      includeCharts: true,
      includeTables: true,
      createdAt: new Date(),
      status: 'processing',
    };

    this.exports.set(exportId, dashboardExport);

    // 使用真實的導出服務
    try {
      const { realDashboardService } = await import('./realDashboardService');

      const realExport = await realDashboardService.exportDashboard(
        dashboardId,
        format
      );

      // 更新導出記錄
      const updatedExport = this.exports.get(exportId);
      if (updatedExport) {
        updatedExport.status = realExport.status;
        updatedExport.downloadUrl = realExport.downloadUrl;
        updatedExport.fileSize = realExport.fileSize;
        updatedExport.processingTime = realExport.processingTime;
        this.exports.set(exportId, updatedExport);
        this.emitEvent('exportCompleted', { exportId, export: updatedExport });
      }
    } catch (error) {
      logger.error('真實導出失敗，回退到模擬導出:', error);

      // 回退到模擬導出處理
      setTimeout(() => {
        const updatedExport = this.exports.get(exportId);
        if (updatedExport) {
          updatedExport.status = 'completed';
          updatedExport.downloadUrl = `/exports/${exportId}.${format}`;
          this.exports.set(exportId, updatedExport);
          this.emitEvent('exportCompleted', {
            exportId,
            export: updatedExport,
          });
        }
      }, 2000);
    }

    return dashboardExport;
  }

  async createAlert(
    dashboardId: string,
    condition: AlertCondition,
    action: AlertAction
  ): Promise<DashboardAlert> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard not found: ${dashboardId}`);
    }

    const alertId = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const alert: DashboardAlert = {
      id: alertId,
      dashboardId,
      condition,
      action,
      isActive: true,
      createdAt: new Date(),
    };

    this.alerts.set(alertId, alert);
    this.emitEvent('alertCreated', { alertId, alert });

    return alert;
  }

  async updateAlert(
    alertId: string,
    updates: Partial<DashboardAlert>
  ): Promise<DashboardAlert> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }

    const updatedAlert: DashboardAlert = {
      ...alert,
      ...updates,
      createdAt: alert.createdAt,
    };

    this.alerts.set(alertId, updatedAlert);
    this.emitEvent('alertUpdated', { alertId, alert: updatedAlert });

    return updatedAlert;
  }

  async deleteAlert(alertId: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert not found: ${alertId}`);
    }

    this.alerts.delete(alertId);
    this.emitEvent('alertDeleted', { alertId });
  }

  async getAlerts(dashboardId?: string): Promise<DashboardAlert[]> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const allAlerts = Array.from(this.alerts.values());

    if (dashboardId) {
      return allAlerts.filter(alert => alert.dashboardId === dashboardId);
    }

    return allAlerts;
  }

  async getTemplates(category?: string): Promise<DashboardTemplate[]> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const allTemplates = Array.from(this.templates.values());

    if (category) {
      return allTemplates.filter(template => template.category === category);
    }

    return allTemplates;
  }

  async getAnalytics(dashboardId: string): Promise<DashboardAnalytics | null> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    return this.analytics.get(dashboardId) || null;
  }

  async updateAnalytics(
    dashboardId: string,
    updates: Partial<DashboardAnalytics>
  ): Promise<DashboardAnalytics> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const currentAnalytics = this.analytics.get(dashboardId) || {
      dashboardId,
      views: 0,
      uniqueViews: 0,
      averageViewTime: 0,
      lastViewed: new Date(),
      favoriteCount: 0,
      shareCount: 0,
      exportCount: 0,
      alertCount: 0,
      performanceMetrics: {
        loadTime: 0,
        renderTime: 0,
        dataFetchTime: 0,
        memoryUsage: 0,
        errorRate: 0,
        uptime: 100,
      },
    };

    const updatedAnalytics: DashboardAnalytics = {
      ...currentAnalytics,
      ...updates,
    };

    this.analytics.set(dashboardId, updatedAnalytics);
    return updatedAnalytics;
  }

  async getPerformanceMetrics(
    dashboardId: string
  ): Promise<PerformanceMetrics | null> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    const analytics = this.analytics.get(dashboardId);
    return analytics?.performanceMetrics || null;
  }

  async addEventListener(event: string, callback: Function): Promise<void> {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  async removeEventListener(event: string, callback: Function): Promise<void> {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  async getConfig(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    return {
      defaultRefreshInterval: 300,
      maxWidgetsPerDashboard: 50,
      maxDashboardsPerUser: 100,
      supportedExportFormats: ['pdf', 'png', 'jpg', 'svg', 'html'],
      supportedChartTypes: [
        'line',
        'bar',
        'pie',
        'doughnut',
        'area',
        'scatter',
        'bubble',
        'radar',
      ],
      maxDataPoints: 10000,
      cacheTimeout: 300,
    };
  }

  async updateConfig(config: unknown): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('DashboardService not initialized');
    }

    // 更新配置邏輯
    this.emitEvent('configUpdated', { config });
  }
}

export default DashboardService;
