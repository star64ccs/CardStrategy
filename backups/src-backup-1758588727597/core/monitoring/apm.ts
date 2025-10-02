/**
 * 應用性能監控 (APM) 系統
 * 提供全面的性能指標收集和分析
 */

import { logger } from '../../utils/logger';

export interface APMConfig {
  enabled: boolean;
  samplingRate: number;
  maxMetrics: number;
  flushInterval: number;
  enableRealUserMonitoring: boolean;
  enableSyntheticMonitoring: boolean;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags: Record<string, string>;
  source: 'browser' | 'server' | 'mobile' | 'synthetic';
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
  actions: string[];
}

export interface APMStats {
  totalMetrics: number;
  activeAlerts: number;
  resolvedAlerts: number;
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  lastUpdate: number;
  metricsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
}

export interface TransactionTrace {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'success' | 'error' | 'timeout';
  tags: Record<string, string>;
  spans: Span[];
  errors: Error[];
}

export interface Span {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'database' | 'http' | 'cache' | 'external' | 'custom';
  tags: Record<string, string>;
  parentId?: string;
}

export interface Error {
  id: string;
  message: string;
  stack: string;
  timestamp: number;
  type: string;
  context: Record<string, any>;
}

class APM {
  private static instance: APM;
  private config: APMConfig;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private alerts: Map<string, PerformanceAlert> = new Map();
  private transactions: Map<string, TransactionTrace> = new Map();
  private stats: APMStats;
  private isInitialized: boolean = false;
  private startTime: number = Date.now();

  private constructor(config: APMConfig) {
    this.config = {
      samplingRate: 1.0,
      maxMetrics: 10000,
      flushInterval: 60000, // 1分鐘
      enableRealUserMonitoring: true,
      enableSyntheticMonitoring: true,
      alertThresholds: {
        responseTime: 2000, // 2秒
        errorRate: 0.05, // 5%
        memoryUsage: 0.8, // 80%
        cpuUsage: 0.8, // 80%
      },
      ...config,
    };

    this.stats = {
      totalMetrics: 0,
      activeAlerts: 0,
      resolvedAlerts: 0,
      averageResponseTime: 0,
      errorRate: 0,
      uptime: 0,
      lastUpdate: Date.now(),
      metricsByType: {},
      alertsBySeverity: {},
    };
  }

  public static getInstance(config?: APMConfig): APM {
    if (!APM.instance) {
      if (!config) {
        throw new Error(
          'APM configuration is required for first initialization'
        );
      }
      APM.instance = new APM(config);
    }
    return APM.instance;
  }

  /**
   * 初始化 APM 系統
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.isInitialized = true;
      logger.info('APM system initialized successfully', {
        enabled: this.config.enabled,
        samplingRate: this.config.samplingRate,
        rum: this.config.enableRealUserMonitoring,
        synthetic: this.config.enableSyntheticMonitoring,
      });

      // 啟動定期任務
      this.startPeriodicTasks();
    } catch (error) {
      logger.error('Failed to initialize APM system', error);
      throw error;
    }
  }

  /**
   * 記錄性能指標
   */
  public recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    tags: Record<string, string> = {},
    source: PerformanceMetric['source'] = 'browser'
  ): void {
    if (!this.config.enabled || Math.random() > this.config.samplingRate) {
      return;
    }

    try {
      const metric: PerformanceMetric = {
        id: this.generateId(),
        name,
        value,
        unit,
        timestamp: Date.now(),
        tags,
        source,
      };

      // 存儲指標
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }

      const metricList = this.metrics.get(name)!;
      metricList.push(metric);

      // 限制指標數量
      if (metricList.length > this.config.maxMetrics) {
        metricList.shift(); // 移除最舊的指標
      }

      this.stats.totalMetrics++;

      // 檢查告警閾值
      this.checkAlertThresholds(name, value);

      logger.debug('Metric recorded', { name, value, unit, tags });
    } catch (error) {
      logger.error('Failed to record metric', { name, value, error });
    }
  }

  /**
   * 開始事務追踪
   */
  public startTransaction(
    name: string,
    tags: Record<string, string> = {}
  ): string {
    const transactionId = this.generateId();

    const transaction: TransactionTrace = {
      id: transactionId,
      name,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      status: 'success',
      tags,
      spans: [],
      errors: [],
    };

    this.transactions.set(transactionId, transaction);

    logger.debug('Transaction started', { id: transactionId, name });
    return transactionId;
  }

  /**
   * 結束事務追踪
   */
  public endTransaction(
    transactionId: string,
    status: TransactionTrace['status'] = 'success'
  ): void {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      logger.warn('Transaction not found', { transactionId });
      return;
    }

    transaction.endTime = Date.now();
    transaction.duration = transaction.endTime - transaction.startTime;
    transaction.status = status;

    // 記錄事務指標
    this.recordMetric('transaction.duration', transaction.duration, 'ms', {
      name: transaction.name,
      status: transaction.status,
      ...transaction.tags,
    });

    // 記錄錯誤率
    if (status === 'error') {
      this.recordMetric('transaction.error', 1, 'count', {
        name: transaction.name,
        ...transaction.tags,
      });
    }

    logger.debug('Transaction ended', {
      id: transactionId,
      duration: transaction.duration,
      status,
    });
  }

  /**
   * 創建 Span
   */
  public startSpan(
    transactionId: string,
    name: string,
    type: Span['type'] = 'custom',
    tags: Record<string, string> = {}
  ): string {
    const spanId = this.generateId();
    const transaction = this.transactions.get(transactionId);

    if (!transaction) {
      logger.warn('Transaction not found for span', { transactionId, spanId });
      return spanId;
    }

    const span: Span = {
      id: spanId,
      name,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      type,
      tags,
    };

    transaction.spans.push(span);

    logger.debug('Span started', { transactionId, spanId, name, type });
    return spanId;
  }

  /**
   * 結束 Span
   */
  public endSpan(transactionId: string, spanId: string): void {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return;
    }

    const span = transaction.spans.find(s => s.id === spanId);
    if (!span) {
      return;
    }

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;

    // 記錄 Span 指標
    this.recordMetric(`span.${span.type}.duration`, span.duration, 'ms', {
      name: span.name,
      transaction: transaction.name,
      ...span.tags,
    });

    logger.debug('Span ended', {
      transactionId,
      spanId,
      duration: span.duration,
    });
  }

  /**
   * 記錄錯誤
   */
  public recordError(
    transactionId: string,
    error: Error,
    context: Record<string, any> = {}
  ): void {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      return;
    }

    const errorRecord: Error = {
      id: this.generateId(),
      message: error.message,
      stack: error.stack || '',
      timestamp: Date.now(),
      type: error.constructor.name,
      context,
    };

    transaction.errors.push(errorRecord);

    // 記錄錯誤指標
    this.recordMetric('error.count', 1, 'count', {
      type: errorRecord.type,
      transaction: transaction.name,
    });

    logger.error('Error recorded', {
      transactionId,
      error: errorRecord.message,
      type: errorRecord.type,
    });
  }

  /**
   * 獲取性能統計
   */
  public getStats(): APMStats {
    this.stats.uptime = Date.now() - this.startTime;
    this.stats.lastUpdate = Date.now();
    this.stats.activeAlerts = Array.from(this.alerts.values()).filter(
      a => !a.resolved
    ).length;
    this.stats.resolvedAlerts = Array.from(this.alerts.values()).filter(
      a => a.resolved
    ).length;

    // 計算平均響應時間
    const responseTimeMetrics = this.metrics.get('transaction.duration') || [];
    if (responseTimeMetrics.length > 0) {
      const total = responseTimeMetrics.reduce(
        (sum, metric) => sum + metric.value,
        0
      );
      this.stats.averageResponseTime = total / responseTimeMetrics.length;
    }

    // 計算錯誤率
    const errorMetrics = this.metrics.get('transaction.error') || [];
    const totalTransactions = this.metrics.get('transaction.duration') || [];
    if (totalTransactions.length > 0) {
      this.stats.errorRate = errorMetrics.length / totalTransactions.length;
    }

    // 統計指標類型
    this.stats.metricsByType = {};
    for (const [name, metrics] of this.metrics.entries()) {
      this.stats.metricsByType[name] = metrics.length;
    }

    // 統計告警嚴重性
    this.stats.alertsBySeverity = {};
    for (const alert of this.alerts.values()) {
      if (!this.stats.alertsBySeverity[alert.severity]) {
        this.stats.alertsBySeverity[alert.severity] = 0;
      }
      this.stats.alertsBySeverity[alert.severity]++;
    }

    return { ...this.stats };
  }

  /**
   * 獲取活躍告警
   */
  public getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * 獲取指標歷史
   */
  public getMetricHistory(
    name: string,
    startTime?: number,
    endTime?: number
  ): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || [];

    if (startTime && endTime) {
      return metrics.filter(
        metric => metric.timestamp >= startTime && metric.timestamp <= endTime
      );
    }

    return metrics;
  }

  /**
   * 健康檢查
   */
  public async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const stats = this.getStats();
      const activeAlerts = this.getActiveAlerts();

      // 檢查關鍵指標
      const criticalAlerts = activeAlerts.filter(
        alert => alert.severity === 'critical'
      );
      const healthy =
        criticalAlerts.length === 0 &&
        stats.errorRate < this.config.alertThresholds.errorRate;

      return {
        healthy,
        details: {
          initialized: this.isInitialized,
          config: {
            enabled: this.config.enabled,
            samplingRate: this.config.samplingRate,
            rum: this.config.enableRealUserMonitoring,
          },
          stats,
          activeAlerts: activeAlerts.length,
          criticalAlerts: criticalAlerts.length,
        },
      };
    } catch (error) {
      logger.error('APM health check failed', error);
      return {
        healthy: false,
        details: {
          initialized: this.isInitialized,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private checkAlertThresholds(metricName: string, value: number): void {
    const thresholds = this.config.alertThresholds;
    let shouldAlert = false;
    let severity: PerformanceAlert['severity'] = 'low';
    let message = '';

    switch (metricName) {
      case 'transaction.duration':
        if (value > thresholds.responseTime) {
          shouldAlert = true;
          severity = value > thresholds.responseTime * 2 ? 'critical' : 'high';
          message = `Response time exceeded threshold: ${value}ms > ${thresholds.responseTime}ms`;
        }
        break;
      case 'error.count':
        // 錯誤率檢查在統計更新時進行
        break;
      case 'memory.usage':
        if (value > thresholds.memoryUsage) {
          shouldAlert = true;
          severity = value > 0.95 ? 'critical' : 'high';
          message = `Memory usage exceeded threshold: ${(value * 100).toFixed(1)}% > ${(thresholds.memoryUsage * 100).toFixed(1)}%`;
        }
        break;
      case 'cpu.usage':
        if (value > thresholds.cpuUsage) {
          shouldAlert = true;
          severity = value > 0.95 ? 'critical' : 'high';
          message = `CPU usage exceeded threshold: ${(value * 100).toFixed(1)}% > ${(thresholds.cpuUsage * 100).toFixed(1)}%`;
        }
        break;
    }

    if (shouldAlert) {
      this.createAlert(metricName, value, severity, message);
    }
  }

  private createAlert(
    metric: string,
    currentValue: number,
    severity: PerformanceAlert['severity'],
    message: string
  ): void {
    const alertId = this.generateId();

    const alert: PerformanceAlert = {
      id: alertId,
      metric,
      threshold: this.getThresholdForMetric(metric),
      currentValue,
      severity,
      message,
      timestamp: Date.now(),
      resolved: false,
      actions: this.getActionsForSeverity(severity),
    };

    this.alerts.set(alertId, alert);

    logger.warn('Performance alert created', {
      id: alertId,
      metric,
      severity,
      message,
      currentValue,
    });
  }

  private getThresholdForMetric(metric: string): number {
    const thresholds = this.config.alertThresholds;

    switch (metric) {
      case 'transaction.duration':
        return thresholds.responseTime;
      case 'memory.usage':
        return thresholds.memoryUsage;
      case 'cpu.usage':
        return thresholds.cpuUsage;
      default:
        return 0;
    }
  }

  private getActionsForSeverity(
    severity: PerformanceAlert['severity']
  ): string[] {
    switch (severity) {
      case 'critical':
        return ['immediate_notification', 'auto_scale', 'circuit_breaker'];
      case 'high':
        return ['notification', 'investigation'];
      case 'medium':
        return ['monitoring'];
      case 'low':
        return ['logging'];
      default:
        return [];
    }
  }

  private generateId(): string {
    return `apm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startPeriodicTasks(): void {
    // 定期清理舊數據
    setInterval(() => {
      this.cleanupOldData();
    }, this.config.flushInterval);

    // 定期檢查告警
    setInterval(() => {
      this.checkPeriodicAlerts();
    }, 30000); // 每30秒檢查一次

    // 定期記錄系統指標
    setInterval(() => {
      this.recordSystemMetrics();
    }, 10000); // 每10秒記錄一次
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24小時前

    // 清理舊指標
    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(metric => metric.timestamp > cutoffTime);
      this.metrics.set(name, filtered);
    }

    // 清理舊事務
    for (const [id, transaction] of this.transactions.entries()) {
      if (transaction.startTime < cutoffTime) {
        this.transactions.delete(id);
      }
    }

    logger.debug('APM data cleanup completed', {
      metricsCleaned: this.stats.totalMetrics,
      transactionsCleaned: this.transactions.size,
    });
  }

  private checkPeriodicAlerts(): void {
    // 檢查錯誤率告警
    const errorMetrics = this.metrics.get('transaction.error') || [];
    const totalMetrics = this.metrics.get('transaction.duration') || [];

    if (totalMetrics.length > 0) {
      const errorRate = errorMetrics.length / totalMetrics.length;
      if (errorRate > this.config.alertThresholds.errorRate) {
        this.createAlert(
          'error.rate',
          errorRate,
          errorRate > this.config.alertThresholds.errorRate * 2
            ? 'critical'
            : 'high',
          `Error rate exceeded threshold: ${(errorRate * 100).toFixed(2)}% > ${(this.config.alertThresholds.errorRate * 100).toFixed(2)}%`
        );
      }
    }
  }

  private recordSystemMetrics(): void {
    // 模擬系統指標收集
    const memoryUsage = Math.random() * 0.8; // 模擬內存使用率
    const cpuUsage = Math.random() * 0.7; // 模擬CPU使用率

    this.recordMetric('memory.usage', memoryUsage, 'ratio');
    this.recordMetric('cpu.usage', cpuUsage, 'ratio');
    this.recordMetric('system.uptime', Date.now() - this.startTime, 'ms');
  }
}

export default APM;
