/**
 * 真實儀表板服務實現
 * 替換模擬數據，實現實際的數據獲取功能
 */

import { logger } from '../../../core/utils/logger';
import { apiService } from '../../../services/apiService';
import type {
  DashboardConfig,
  DashboardData,
  DashboardExport,
  DashboardWidget,
  DataMetadata,
} from '../types/dashboard';

export interface RealDataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'stream';
  endpoint?: string;
  query?: string;
  connectionString?: string;
  credentials?: Record<string, any>;
  refreshInterval: number;
  lastUpdated?: Date;
  isActive: boolean;
}

export interface RealDataQuery {
  sourceId: string;
  query: string;
  parameters?: Record<string, any>;
  filters?: Record<string, any>;
  timeRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
}

export interface RealDataResponse {
  data: any[];
  metadata: {
    sourceId: string;
    queryTime: number;
    recordCount: number;
    lastUpdated: Date;
    cacheStatus: 'fresh' | 'stale' | 'expired';
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

class RealDashboardService {
  private static instance: RealDashboardService;
  private isInitialized = false;
  private dataSources: Map<string, RealDataSource> = new Map();
  private readonly refreshIntervals: Map<string, NodeJS.Timeout> = new Map();

  public static getInstance(): RealDashboardService {
    if (!RealDashboardService.instance) {
      RealDashboardService.instance = new RealDashboardService();
    }
    return RealDashboardService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('初始化真實儀表板服務');

      // 檢查儀表板服務可用性
      await this.checkDashboardServiceHealth();

      // 加載數據源配置
      await this.loadDataSources();

      this.isInitialized = true;
      logger.info('真實儀表板服務初始化完成');
    } catch (error) {
      logger.error('真實儀表板服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 刷新儀表板數據
   */
  public async refreshDashboardData(
    dashboardId: string,
    dashboard: DashboardConfig
  ): Promise<DashboardData[]> {
    try {
      logger.info('開始刷新儀表板數據', { dashboardId });

      const newData: DashboardData[] = [];

      for (const layout of dashboard.layouts) {
        for (const widget of layout.widgets) {
          try {
            const realData = await this.fetchRealData(widget);
            const metadata: DataMetadata = {
              source: widget.dataSource,
              lastUpdated: new Date(),
              recordCount: Array.isArray(realData.data)
                ? realData.data.length
                : 1,
              processingTime: realData.metadata.queryTime,
              cacheStatus: realData.metadata.cacheStatus,
            };

            newData.push({
              widgetId: widget.id,
              data: realData.data,
              metadata,
              timestamp: new Date(),
            });

            logger.debug('小部件數據刷新完成', {
              widgetId: widget.id,
              recordCount: metadata.recordCount,
              queryTime: metadata.processingTime,
            });
          } catch (error) {
            logger.error('小部件數據獲取失敗', {
              widgetId: widget.id,
              error: error.message,
            });

            // 添加錯誤數據
            newData.push({
              widgetId: widget.id,
              data: null,
              metadata: {
                source: widget.dataSource,
                lastUpdated: new Date(),
                recordCount: 0,
                processingTime: 0,
                cacheStatus: 'expired',
                error: error.message,
              },
              timestamp: new Date(),
            });
          }
        }
      }

      logger.info('儀表板數據刷新完成', {
        dashboardId,
        totalWidgets: newData.length,
        successfulWidgets: newData.filter(d => d.data !== null).length,
      });

      return newData;
    } catch (error) {
      logger.error('儀表板數據刷新失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取真實數據
   */
  private async fetchRealData(
    widget: DashboardWidget
  ): Promise<RealDataResponse> {
    try {
      const dataSource = this.dataSources.get(widget.dataSource);
      if (!dataSource) {
        throw new Error(`數據源未找到: ${widget.dataSource}`);
      }

      // 構建查詢
      const query: RealDataQuery = {
        sourceId: widget.dataSource,
        query: this.buildQuery(widget, dataSource),
        parameters: widget.parameters || {},
        filters: widget.filters || {},
        timeRange: widget.timeRange,
        limit: widget.limit || 1000,
        offset: widget.offset || 0,
      };

      // 執行查詢
      const response = await apiService.post('/dashboard/data/query', query);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('數據查詢失敗');
      }
    } catch (error) {
      logger.error('真實數據獲取失敗:', error);
      throw error;
    }
  }

  /**
   * 構建查詢語句
   */
  private buildQuery(
    widget: DashboardWidget,
    dataSource: RealDataSource
  ): string {
    switch (widget.type) {
      case 'metric':
        return this.buildMetricQuery(widget, dataSource);
      case 'chart':
        return this.buildChartQuery(widget, dataSource);
      case 'table':
        return this.buildTableQuery(widget, dataSource);
      case 'map':
        return this.buildMapQuery(widget, dataSource);
      case 'gauge':
        return this.buildGaugeQuery(widget, dataSource);
      default:
        return 'SELECT * FROM data LIMIT 100';
    }
  }

  /**
   * 構建指標查詢
   */
  private buildMetricQuery(
    widget: DashboardWidget,
    dataSource: RealDataSource
  ): string {
    const metric = widget.config?.metric || 'count';
    const table = widget.config?.table || 'data';

    switch (metric) {
      case 'count':
        return `SELECT COUNT(*) as value FROM ${table}`;
      case 'sum':
        return `SELECT SUM(${widget.config?.field || 'value'}) as value FROM ${table}`;
      case 'avg':
        return `SELECT AVG(${widget.config?.field || 'value'}) as value FROM ${table}`;
      case 'max':
        return `SELECT MAX(${widget.config?.field || 'value'}) as value FROM ${table}`;
      case 'min':
        return `SELECT MIN(${widget.config?.field || 'value'}) as value FROM ${table}`;
      default:
        return `SELECT COUNT(*) as value FROM ${table}`;
    }
  }

  /**
   * 構建圖表查詢
   */
  private buildChartQuery(
    widget: DashboardWidget,
    dataSource: RealDataSource
  ): string {
    const chartType = widget.config?.chartType || 'line';
    const table = widget.config?.table || 'data';
    const xField = widget.config?.xField || 'date';
    const yField = widget.config?.yField || 'value';
    const groupBy = widget.config?.groupBy;

    let query = `SELECT ${xField}, ${yField}`;

    if (groupBy) {
      query += `, ${groupBy}`;
    }

    query += ` FROM ${table}`;

    if (widget.timeRange) {
      query += ` WHERE ${xField} >= '${widget.timeRange.start.toISOString()}' AND ${xField} <= '${widget.timeRange.end.toISOString()}'`;
    }

    if (groupBy) {
      query += ` GROUP BY ${xField}, ${groupBy}`;
    } else {
      query += ` GROUP BY ${xField}`;
    }

    query += ` ORDER BY ${xField}`;

    if (widget.limit) {
      query += ` LIMIT ${widget.limit}`;
    }

    return query;
  }

  /**
   * 構建表格查詢
   */
  private buildTableQuery(
    widget: DashboardWidget,
    dataSource: RealDataSource
  ): string {
    const table = widget.config?.table || 'data';
    const fields = widget.config?.fields || ['*'];

    let query = `SELECT ${fields.join(', ')} FROM ${table}`;

    if (widget.filters && Object.keys(widget.filters).length > 0) {
      const conditions = Object.entries(widget.filters).map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key} = '${value}'`;
        } else {
          return `${key} = ${value}`;
        }
      });
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (widget.config?.sortBy) {
      query += ` ORDER BY ${widget.config.sortBy}`;
      if (widget.config?.sortOrder === 'desc') {
        query += ' DESC';
      }
    }

    if (widget.limit) {
      query += ` LIMIT ${widget.limit}`;
    }

    if (widget.offset) {
      query += ` OFFSET ${widget.offset}`;
    }

    return query;
  }

  /**
   * 構建地圖查詢
   */
  private buildMapQuery(
    widget: DashboardWidget,
    dataSource: RealDataSource
  ): string {
    const table = widget.config?.table || 'data';
    const latField = widget.config?.latField || 'latitude';
    const lngField = widget.config?.lngField || 'longitude';
    const valueField = widget.config?.valueField || 'value';
    const labelField = widget.config?.labelField || 'name';

    return `SELECT ${latField}, ${lngField}, ${valueField}, ${labelField} FROM ${table} WHERE ${latField} IS NOT NULL AND ${lngField} IS NOT NULL`;
  }

  /**
   * 構建儀表查詢
   */
  private buildGaugeQuery(
    widget: DashboardWidget,
    dataSource: RealDataSource
  ): string {
    const table = widget.config?.table || 'data';
    const valueField = widget.config?.valueField || 'value';
    const maxValue = widget.config?.maxValue || 100;

    return `SELECT AVG(${valueField}) as current_value, ${maxValue} as max_value FROM ${table}`;
  }

  /**
   * 導出儀表板
   */
  public async exportDashboard(
    dashboardId: string,
    format: 'pdf' | 'png' | 'jpg' | 'svg' | 'html'
  ): Promise<DashboardExport> {
    try {
      logger.info('開始真實儀表板導出', { dashboardId, format });

      const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 調用真實的導出服務
      const response = await apiService.post('/dashboard/export', {
        dashboardId,
        format,
        options: {
          includeData: true,
          includeCharts: true,
          includeTables: true,
          quality: 'high',
          resolution: format === 'pdf' ? 300 : 150,
        },
      });

      if (response.success && response.data) {
        const dashboardExport: DashboardExport = {
          id: exportId,
          dashboardId,
          format,
          size: response.data.size || 'medium',
          includeData: true,
          includeCharts: true,
          includeTables: true,
          createdAt: new Date(),
          status: 'completed',
          downloadUrl: response.data.downloadUrl,
          fileSize: response.data.fileSize,
          processingTime: response.data.processingTime,
        };

        logger.info('儀表板導出完成', {
          exportId,
          format,
          fileSize: dashboardExport.fileSize,
          processingTime: dashboardExport.processingTime,
        });

        return dashboardExport;
      } else {
        throw new Error('導出服務返回失敗');
      }
    } catch (error) {
      logger.error('真實儀表板導出失敗:', error);
      throw error;
    }
  }

  /**
   * 加載數據源配置
   */
  private async loadDataSources(): Promise<void> {
    try {
      const response = await apiService.get('/dashboard/data-sources');

      if (response.success && response.data) {
        for (const dataSource of response.data) {
          this.dataSources.set(dataSource.id, dataSource);
        }

        logger.info('數據源配置加載完成', {
          count: this.dataSources.size,
        });
      }
    } catch (error) {
      logger.warn('數據源配置加載失敗:', error);
    }
  }

  /**
   * 檢查儀表板服務健康狀態
   */
  private async checkDashboardServiceHealth(): Promise<void> {
    try {
      const response = await apiService.get('/dashboard/health');

      if (!response.success) {
        throw new Error('儀表板服務不可用');
      }

      logger.info('儀表板服務健康檢查通過');
    } catch (error) {
      logger.error('儀表板服務健康檢查失敗:', error);
      throw new Error('儀表板服務不可用，請檢查服務配置');
    }
  }

  /**
   * 獲取服務統計信息
   */
  public getServiceStats(): Record<string, any> {
    return {
      service: 'real-dashboard',
      isInitialized: this.isInitialized,
      dataSourceCount: this.dataSources.size,
      activeDataSources: Array.from(this.dataSources.values()).filter(
        ds => ds.isActive
      ).length,
      refreshIntervals: this.refreshIntervals.size,
    };
  }
}

export const realDashboardService = RealDashboardService.getInstance();
