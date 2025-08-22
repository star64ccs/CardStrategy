import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';
import { z } from 'zod';

// 監控配置
export interface MonitoringConfig {
  // 第三方監控工具配置
  thirdPartyTools: {
    prometheus: {
      enabled: boolean;
      url: string;
      scrapeInterval: number;
    };
    grafana: {
      enabled: boolean;
      url: string;
      apiKey: string;
    };
    elasticsearch: {
      enabled: boolean;
      url: string;
      index: string;
    };
    kibana: {
      enabled: boolean;
      url: string;
    };
    jaeger: {
      enabled: boolean;
      url: string;
    };
  };

  // 告警配置
  alerting: {
    enabled: boolean;
    channels: {
      email: boolean;
      slack: boolean;
      webhook: boolean;
      sms: boolean;
    };
    thresholds: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      errorRate: number;
      responseTime: number;
    };
  };

  // 日誌分析配置
  logAnalysis: {
    enabled: boolean;
    retentionDays: number;
    realTimeAnalysis: boolean;
    anomalyDetection: boolean;
  };
}

// 系統指標
export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    load: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  application: {
    responseTime: number;
    requestRate: number;
    errorRate: number;
    activeConnections: number;
  };
}

// 告警信息
export interface AlertInfo {
  alertId: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'system' | 'application' | 'security' | 'performance';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  metrics: Record<string, any>;
  actions: {
    actionId: string;
    name: string;
    description: string;
    executed: boolean;
    executedAt?: string;
  }[];
}

// 日誌分析結果
export interface LogAnalysisResult {
  analysisId: string;
  timestamp: string;
  timeRange: {
    start: string;
    end: string;
  };
  summary: {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    uniqueErrors: number;
  };
  topErrors: {
    error: string;
    count: number;
    percentage: number;
  }[];
  performanceIssues: {
    issue: string;
    impact: 'high' | 'medium' | 'low';
    occurrences: number;
    avgResponseTime: number;
  }[];
  anomalies: {
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    confidence: number;
  }[];
  recommendations: {
    category: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
  }[];
}

// 監控儀表板配置
export interface DashboardConfig {
  dashboardId: string;
  name: string;
  description: string;
  widgets: {
    widgetId: string;
    type: 'chart' | 'metric' | 'table' | 'alert';
    title: string;
    config: Record<string, any>;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[];
  refreshInterval: number;
  autoRefresh: boolean;
}

// 高級監控服務類
class AdvancedMonitoringService {
  private config: MonitoringConfig = {
    thirdPartyTools: {
      prometheus: {
        enabled: true,
        url: 'http://localhost:9090',
        scrapeInterval: 15,
      },
      grafana: {
        enabled: true,
        url: 'http://localhost:3000',
        apiKey: '',
      },
      elasticsearch: {
        enabled: true,
        url: 'http://localhost:9200',
        index: 'logs',
      },
      kibana: {
        enabled: true,
        url: 'http://localhost:5601',
      },
      jaeger: {
        enabled: true,
        url: 'http://localhost:16686',
      },
    },
    alerting: {
      enabled: true,
      channels: {
        email: true,
        slack: true,
        webhook: true,
        sms: false,
      },
      thresholds: {
        cpuUsage: 80,
        memoryUsage: 85,
        diskUsage: 90,
        errorRate: 5,
        responseTime: 1000,
      },
    },
    logAnalysis: {
      enabled: true,
      retentionDays: 30,
      realTimeAnalysis: true,
      anomalyDetection: true,
    },
  };

  // 獲取當前配置
  getConfig(): MonitoringConfig {
    return this.config;
  }

  // 更新配置
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('✅ 監控配置已更新', { config: this.config });
  }

  // 獲取系統指標
  async getSystemMetrics(
    timeRange: '1h' | '6h' | '24h' | '7d'
  ): Promise<SystemMetrics[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          `/monitoring/metrics/system?timeRange=${timeRange}`
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 獲取應用指標
  async getApplicationMetrics(
    serviceId?: string,
    timeRange: '1h' | '6h' | '24h' | '7d'
  ): Promise<
    {
      serviceId: string;
      metrics: SystemMetrics[];
    }[]
  > {
    return withErrorHandling(
      async () => {
        const params = new URLSearchParams();
        if (serviceId) params.append('serviceId', serviceId);
        params.append('timeRange', timeRange);

        const response = await apiService.get(
          `/monitoring/metrics/application?${params}`
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 獲取告警列表
  async getAlerts(
    status?: 'active' | 'acknowledged' | 'resolved',
    severity?: 'critical' | 'warning' | 'info'
  ): Promise<AlertInfo[]> {
    return withErrorHandling(
      async () => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (severity) params.append('severity', severity);

        const response = await apiService.get(`/monitoring/alerts?${params}`);
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 確認告警
  async acknowledgeAlert(
    alertId: string,
    comment?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          `/monitoring/alerts/${alertId}/acknowledge`,
          {
            comment,
          }
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 解決告警
  async resolveAlert(
    alertId: string,
    resolution?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          `/monitoring/alerts/${alertId}/resolve`,
          {
            resolution,
          }
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 執行告警動作
  async executeAlertAction(
    alertId: string,
    actionId: string
  ): Promise<{
    success: boolean;
    message: string;
    result: any;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          `/monitoring/alerts/${alertId}/actions/${actionId}/execute`
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 獲取日誌分析結果
  async getLogAnalysis(
    timeRange: '1h' | '6h' | '24h' | '7d',
    filters?: {
      level?: string;
      service?: string;
      errorType?: string;
    }
  ): Promise<LogAnalysisResult> {
    return withErrorHandling(
      async () => {
        const params = new URLSearchParams();
        params.append('timeRange', timeRange);
        if (filters?.level) params.append('level', filters.level);
        if (filters?.service) params.append('service', filters.service);
        if (filters?.errorType) params.append('errorType', filters.errorType);

        const response = await apiService.get(
          `/monitoring/logs/analysis?${params}`
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 實時日誌流
  async getRealTimeLogs(filters?: {
    level?: string;
    service?: string;
    limit?: number;
  }): Promise<{
    logs: Array<{
      timestamp: string;
      level: string;
      service: string;
      message: string;
      metadata: Record<string, any>;
    }>;
    hasMore: boolean;
  }> {
    return withErrorHandling(
      async () => {
        const params = new URLSearchParams();
        if (filters?.level) params.append('level', filters.level);
        if (filters?.service) params.append('service', filters.service);
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await apiService.get(
          `/monitoring/logs/realtime?${params}`
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 搜索日誌
  async searchLogs(
    query: string,
    timeRange: '1h' | '6h' | '24h' | '7d',
    options?: {
      level?: string;
      service?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    logs: Array<{
      timestamp: string;
      level: string;
      service: string;
      message: string;
      metadata: Record<string, any>;
    }>;
    total: number;
    hasMore: boolean;
  }> {
    return withErrorHandling(
      async () => {
        const params = new URLSearchParams();
        params.append('query', query);
        params.append('timeRange', timeRange);
        if (options?.level) params.append('level', options.level);
        if (options?.service) params.append('service', options.service);
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.offset) params.append('offset', options.offset.toString());

        const response = await apiService.get(
          `/monitoring/logs/search?${params}`
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 獲取儀表板列表
  async getDashboards(): Promise<DashboardConfig[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get('/monitoring/dashboards');
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 獲取儀表板數據
  async getDashboardData(dashboardId: string): Promise<{
    dashboard: DashboardConfig;
    data: Record<string, any>;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          `/monitoring/dashboards/${dashboardId}/data`
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 創建儀表板
  async createDashboard(
    dashboard: Omit<DashboardConfig, 'dashboardId'>
  ): Promise<{
    success: boolean;
    dashboardId: string;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          '/monitoring/dashboards',
          dashboard
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 更新儀表板
  async updateDashboard(
    dashboardId: string,
    updates: Partial<DashboardConfig>
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.put(
          `/monitoring/dashboards/${dashboardId}`,
          updates
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 刪除儀表板
  async deleteDashboard(dashboardId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.delete(
          `/monitoring/dashboards/${dashboardId}`
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 獲取第三方監控工具狀態
  async getThirdPartyToolStatus(): Promise<{
    prometheus: { status: string; lastCheck: string; metrics: number };
    grafana: { status: string; lastCheck: string; dashboards: number };
    elasticsearch: { status: string; lastCheck: string; indices: number };
    kibana: { status: string; lastCheck: string };
    jaeger: { status: string; lastCheck: string; traces: number };
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get('/monitoring/third-party/status');
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 測試告警通道
  async testAlertChannel(
    channel: 'email' | 'slack' | 'webhook' | 'sms',
    config: any
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          '/monitoring/alerts/test-channel',
          {
            channel,
            config,
          }
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 獲取監控報告
  async generateMonitoringReport(
    timeRange: '1d' | '7d' | '30d',
    options?: {
      includeMetrics?: boolean;
      includeAlerts?: boolean;
      includeLogs?: boolean;
      format?: 'json' | 'pdf' | 'csv';
    }
  ): Promise<{
    reportId: string;
    downloadUrl: string;
    summary: {
      totalAlerts: number;
      criticalAlerts: number;
      averageResponseTime: number;
      uptime: number;
      topIssues: string[];
    };
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post('/monitoring/reports/generate', {
          timeRange,
          options,
        });
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 設置監控規則
  async setMonitoringRule(rule: {
    name: string;
    description: string;
    condition: string;
    threshold: number;
    severity: 'critical' | 'warning' | 'info';
    actions: string[];
  }): Promise<{
    success: boolean;
    ruleId: string;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post('/monitoring/rules', rule);
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 獲取監控規則列表
  async getMonitoringRules(): Promise<
    Array<{
      ruleId: string;
      name: string;
      description: string;
      condition: string;
      threshold: number;
      severity: string;
      actions: string[];
      enabled: boolean;
      createdAt: string;
    }>
  > {
    return withErrorHandling(
      async () => {
        const response = await apiService.get('/monitoring/rules');
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 啟用/禁用監控規則
  async toggleMonitoringRule(
    ruleId: string,
    enabled: boolean
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.put(
          `/monitoring/rules/${ruleId}/toggle`,
          {
            enabled,
          }
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }

  // 獲取性能趨勢
  async getPerformanceTrends(timeRange: '1h' | '6h' | '24h' | '7d'): Promise<{
    responseTime: { timestamp: string; value: number }[];
    throughput: { timestamp: string; value: number }[];
    errorRate: { timestamp: string; value: number }[];
    resourceUsage: {
      cpu: { timestamp: string; value: number }[];
      memory: { timestamp: string; value: number }[];
      disk: { timestamp: string; value: number }[];
    };
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          `/monitoring/performance/trends?timeRange=${timeRange}`
        );
        return response.data;
      },
      { service: 'AdvancedMonitoringService' }
    )();
  }
}

// 創建單例實例
export { AdvancedMonitoringService };
export const advancedMonitoringService = new AdvancedMonitoringService();
