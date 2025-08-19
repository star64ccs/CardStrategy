import { aiEcosystem, AIEcosystemStats, AIEcosystemHealth, AIEcosystemTask } from './aiEcosystem';
import { multiAIService, AIProvider } from './multiAIService';
import { aiModelManager, AIModelType } from './aiModelManager';
import { logger } from '../utils/logger';
import { apiService } from './apiService';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// ==================== 監控接口定義 ====================

export interface AIEcosystemMetrics {
  // 性能指標
  requestsPerSecond: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;

  // 成本指標
  costPerRequest: number;
  monthlyCost: number;
  costTrend: 'increasing' | 'decreasing' | 'stable';

  // 資源使用指標
  queueLength: number;
  activeTasks: number;
  cpuUsage: number;
  memoryUsage: number;

  // 提供商指標
  providerPerformance: Record<AIProvider, {
    requests: number;
    successRate: number;
    averageResponseTime: number;
    cost: number;
    availability: number;
  }>;

  // 模型指標
  modelPerformance: Record<AIModelType, {
    requests: number;
    successRate: number;
    averageResponseTime: number;
    cost: number;
  }>;
}

export interface AIEcosystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  metadata?: Record<string, any>;
}

export interface AIEcosystemReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  metrics: AIEcosystemMetrics;
  alerts: AIEcosystemAlert[];
  recommendations: string[];
  generatedAt: Date;
}

export interface AIEcosystemDashboard {
  realTimeMetrics: AIEcosystemMetrics;
  recentAlerts: AIEcosystemAlert[];
  activeTasks: AIEcosystemTask[];
  systemHealth: AIEcosystemHealth;
  performanceTrends: {
    responseTime: { timestamp: Date; value: number }[];
    successRate: { timestamp: Date; value: number }[];
    cost: { timestamp: Date; value: number }[];
  };
}

// ==================== AI生態系統監控類 ====================

class AIEcosystemMonitor {
  private metrics: AIEcosystemMetrics;
  private alerts: AIEcosystemAlert[] = [];
  private performanceHistory: {
    timestamp: Date;
    metrics: AIEcosystemMetrics;
  }[] = [];
  private alertHandlers: ((alert: AIEcosystemAlert) => void)[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  // ==================== 初始化方法 ====================

  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('監控已經在運行中');
      return;
    }

    try {
      logger.info('🚀 啟動AI生態系統監控...');

      this.isMonitoring = true;

      // 開始定期收集指標
      this.monitoringInterval = setInterval(() => {
        this.collectMetrics();
      }, 5000); // 每5秒收集一次指標

      // 開始定期檢查警報
      setInterval(() => {
        this.checkAlerts();
      }, 10000); // 每10秒檢查一次警報

      logger.info('✅ AI生態系統監控已啟動');
    } catch (error) {
      logger.error('❌ 啟動監控失敗:', error);
      throw error;
    }
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    logger.info('🛑 停止AI生態系統監控...');

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    logger.info('✅ AI生態系統監控已停止');
  }

  // ==================== 指標收集方法 ====================

  private async collectMetrics(): Promise<void> {
    try {
      const stats = aiEcosystem.getStats();
      const health = aiEcosystem.getHealth();
      const activeTasks = aiEcosystem.getActiveTasks();
      const queuedTasks = aiEcosystem.getQueuedTasks();

      // 計算性能指標
      const requestsPerSecond = this.calculateRequestsPerSecond();
      const {averageResponseTime} = stats;
      const successRate = stats.totalRequests > 0 ?
        stats.successfulRequests / stats.totalRequests : 0;
      const errorRate = 1 - successRate;

      // 計算成本指標
      const costPerRequest = stats.totalRequests > 0 ?
        stats.totalCost / stats.totalRequests : 0;
      const {monthlyCost} = stats;
      const costTrend = this.calculateCostTrend();

      // 計算資源使用指標
      const queueLength = queuedTasks.length;
      const activeTasksCount = activeTasks.length;
      const {cpuUsage} = health.system;
      const {memoryUsage} = health.system;

      // 計算提供商指標
      const providerPerformance = this.calculateProviderPerformance(stats);

      // 計算模型指標
      const modelPerformance = this.calculateModelPerformance(stats);

      // 更新指標
      this.metrics = {
        requestsPerSecond,
        averageResponseTime,
        successRate,
        errorRate,
        costPerRequest,
        monthlyCost,
        costTrend,
        queueLength,
        activeTasks: activeTasksCount,
        cpuUsage,
        memoryUsage,
        providerPerformance,
        modelPerformance
      };

      // 保存歷史數據
      this.performanceHistory.push({
        timestamp: new Date(),
        metrics: { ...this.metrics }
      });

      // 限制歷史數據大小
      if (this.performanceHistory.length > 1000) {
        this.performanceHistory = this.performanceHistory.slice(-1000);
      }

    } catch (error) {
      logger.error('收集指標失敗:', error);
    }
  }

  private calculateRequestsPerSecond(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const recentRequests = this.performanceHistory.filter(
      entry => entry.timestamp.getTime() > oneMinuteAgo
    );

    return recentRequests.length / 60; // 每分鐘的請求數除以60秒
  }

  private calculateCostTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.performanceHistory.length < 10) {
      return 'stable';
    }

    const recent = this.performanceHistory.slice(-10);
    const costs = recent.map(entry => entry.metrics.costPerRequest);

    const firstHalf = costs.slice(0, 5);
    const secondHalf = costs.slice(5);

    const firstAvg = firstHalf.reduce((sum, cost) => sum + cost, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, cost) => sum + cost, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateProviderPerformance(stats: any): Record<AIProvider, any> {
    const providerPerformance: Record<AIProvider, any> = {} as any;

    for (const [provider, data] of Object.entries(stats.providerUsage)) {
      providerPerformance[provider as AIProvider] = {
        requests: data.requests,
        successRate: data.successRate,
        averageResponseTime: data.averageResponseTime,
        cost: data.cost,
        availability: 1.0 // 需要從健康狀態獲取
      };
    }

    return providerPerformance;
  }

  private calculateModelPerformance(stats: any): Record<AIModelType, any> {
    const modelPerformance: Record<AIModelType, any> = {} as any;

    for (const [model, data] of Object.entries(stats.modelUsage)) {
      modelPerformance[model as AIModelType] = {
        requests: data.requests,
        successRate: data.successRate,
        averageResponseTime: 0, // 需要計算
        cost: data.cost
      };
    }

    return modelPerformance;
  }

  // ==================== 警報管理方法 ====================

  private checkAlerts(): void {
    try {
      // 檢查成功率警報
      if (this.metrics.successRate < 0.9) {
        this.createAlert({
          type: 'warning',
          title: '成功率下降',
          message: `當前成功率為 ${(this.metrics.successRate * 100).toFixed(1)}%，低於90%`,
          severity: this.metrics.successRate < 0.8 ? 'high' : 'medium'
        });
      }

      // 檢查響應時間警報
      if (this.metrics.averageResponseTime > 5000) {
        this.createAlert({
          type: 'warning',
          title: '響應時間過長',
          message: `平均響應時間為 ${this.metrics.averageResponseTime.toFixed(0)}ms，超過5秒`,
          severity: this.metrics.averageResponseTime > 10000 ? 'high' : 'medium'
        });
      }

      // 檢查成本警報
      const config = aiEcosystem.getConfig();
      const costRatio = this.metrics.monthlyCost / config.monthlyBudget;
      if (costRatio > config.costAlertThreshold) {
        this.createAlert({
          type: 'warning',
          title: '成本超標',
          message: `月度成本為 $${this.metrics.monthlyCost.toFixed(2)}，已達到預算的 ${(costRatio * 100).toFixed(1)}%`,
          severity: costRatio > 0.95 ? 'critical' : 'high'
        });
      }

      // 檢查隊列長度警報
      if (this.metrics.queueLength > 50) {
        this.createAlert({
          type: 'warning',
          title: '任務隊列過長',
          message: `當前隊列中有 ${this.metrics.queueLength} 個待處理任務`,
          severity: this.metrics.queueLength > 100 ? 'high' : 'medium'
        });
      }

      // 檢查系統資源警報
      if (this.metrics.cpuUsage > 80) {
        this.createAlert({
          type: 'warning',
          title: 'CPU使用率過高',
          message: `CPU使用率為 ${this.metrics.cpuUsage.toFixed(1)}%`,
          severity: this.metrics.cpuUsage > 90 ? 'high' : 'medium'
        });
      }

      if (this.metrics.memoryUsage > 80) {
        this.createAlert({
          type: 'warning',
          title: '內存使用率過高',
          message: `內存使用率為 ${this.metrics.memoryUsage.toFixed(1)}%`,
          severity: this.metrics.memoryUsage > 90 ? 'high' : 'medium'
        });
      }

    } catch (error) {
      logger.error('檢查警報失敗:', error);
    }
  }

  createAlert(alertData: Omit<AIEcosystemAlert, 'id' | 'timestamp' | 'acknowledged'>): void {
    const alert: AIEcosystemAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false,
      ...alertData
    };

    this.alerts.unshift(alert);

    // 限制警報數量
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // 觸發警報處理器
    this.alertHandlers.forEach(handler => {
      try {
        handler(alert);
      } catch (error) {
        logger.error('警報處理器執行失敗:', error);
      }
    });

    logger.info(`🚨 新警報: ${alert.title} - ${alert.message}`);
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
      return true;
    }
    return false;
  }

  addAlertHandler(handler: (alert: AIEcosystemAlert) => void): void {
    this.alertHandlers.push(handler);
  }

  removeAlertHandler(handler: (alert: AIEcosystemAlert) => void): void {
    const index = this.alertHandlers.indexOf(handler);
    if (index > -1) {
      this.alertHandlers.splice(index, 1);
    }
  }

  // ==================== 報告生成方法 ====================

  async generateReport(
    type: 'daily' | 'weekly' | 'monthly' | 'custom',
    startDate?: Date,
    endDate?: Date
  ): Promise<AIEcosystemReport> {
    const now = new Date();
    let start: Date;
    const end: Date = endDate || now;

    switch (type) {
      case 'daily':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        start = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }

    // 過濾指定時間範圍的數據
    const periodData = this.performanceHistory.filter(
      entry => entry.timestamp >= start && entry.timestamp <= end
    );

    // 計算平均指標
    const avgMetrics = this.calculateAverageMetrics(periodData);

    // 獲取期間內的警報
    const periodAlerts = this.alerts.filter(
      alert => alert.timestamp >= start && alert.timestamp <= end
    );

    // 生成建議
    const recommendations = this.generateRecommendations(avgMetrics, periodAlerts);

    const report: AIEcosystemReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      period: { start, end },
      metrics: avgMetrics,
      alerts: periodAlerts,
      recommendations,
      generatedAt: now
    };

    return report;
  }

  private calculateAverageMetrics(data: { timestamp: Date; metrics: AIEcosystemMetrics }[]): AIEcosystemMetrics {
    if (data.length === 0) {
      return this.initializeMetrics();
    }

    const sum = data.reduce((acc, entry) => ({
      requestsPerSecond: acc.requestsPerSecond + entry.metrics.requestsPerSecond,
      averageResponseTime: acc.averageResponseTime + entry.metrics.averageResponseTime,
      successRate: acc.successRate + entry.metrics.successRate,
      errorRate: acc.errorRate + entry.metrics.errorRate,
      costPerRequest: acc.costPerRequest + entry.metrics.costPerRequest,
      monthlyCost: acc.monthlyCost + entry.metrics.monthlyCost,
      queueLength: acc.queueLength + entry.metrics.queueLength,
      activeTasks: acc.activeTasks + entry.metrics.activeTasks,
      cpuUsage: acc.cpuUsage + entry.metrics.cpuUsage,
      memoryUsage: acc.memoryUsage + entry.metrics.memoryUsage
    }), this.initializeMetrics());

    const count = data.length;
    return {
      ...sum,
      requestsPerSecond: sum.requestsPerSecond / count,
      averageResponseTime: sum.averageResponseTime / count,
      successRate: sum.successRate / count,
      errorRate: sum.errorRate / count,
      costPerRequest: sum.costPerRequest / count,
      monthlyCost: sum.monthlyCost / count,
      queueLength: Math.round(sum.queueLength / count),
      activeTasks: Math.round(sum.activeTasks / count),
      cpuUsage: sum.cpuUsage / count,
      memoryUsage: sum.memoryUsage / count,
      providerPerformance: {}, // 需要複雜計算
      modelPerformance: {} // 需要複雜計算
    };
  }

  private generateRecommendations(metrics: AIEcosystemMetrics, alerts: AIEcosystemAlert[]): string[] {
    const recommendations: string[] = [];

    // 基於成功率的建議
    if (metrics.successRate < 0.95) {
      recommendations.push('建議檢查AI提供商配置，考慮切換到更穩定的提供商');
    }

    // 基於響應時間的建議
    if (metrics.averageResponseTime > 3000) {
      recommendations.push('建議優化AI模型選擇，使用更快的模型或啟用緩存');
    }

    // 基於成本的建議
    if (metrics.costPerRequest > 0.1) {
      recommendations.push('建議啟用成本優化，使用更經濟的模型');
    }

    // 基於隊列長度的建議
    if (metrics.queueLength > 20) {
      recommendations.push('建議增加並發處理能力或優化任務優先級');
    }

    // 基於系統資源的建議
    if (metrics.cpuUsage > 70) {
      recommendations.push('建議優化系統性能或增加計算資源');
    }

    if (metrics.memoryUsage > 70) {
      recommendations.push('建議優化內存使用或增加內存容量');
    }

    // 基於警報的建議
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('存在嚴重警報，建議立即處理');
    }

    return recommendations;
  }

  // ==================== 儀表板方法 ====================

  getDashboard(): AIEcosystemDashboard {
    const health = aiEcosystem.getHealth();
    const activeTasks = aiEcosystem.getActiveTasks();

    // 獲取最近的性能趨勢
    const recentData = this.performanceHistory.slice(-20);
    const performanceTrends = {
      responseTime: recentData.map(entry => ({
        timestamp: entry.timestamp,
        value: entry.metrics.averageResponseTime
      })),
      successRate: recentData.map(entry => ({
        timestamp: entry.timestamp,
        value: entry.metrics.successRate
      })),
      cost: recentData.map(entry => ({
        timestamp: entry.timestamp,
        value: entry.metrics.costPerRequest
      }))
    };

    // 獲取最近的警報
    const recentAlerts = this.alerts
      .filter(alert => !alert.acknowledged)
      .slice(0, 10);

    return {
      realTimeMetrics: this.metrics,
      recentAlerts,
      activeTasks,
      systemHealth: health,
      performanceTrends
    };
  }

  // ==================== 工具方法 ====================

  private initializeMetrics(): AIEcosystemMetrics {
    return {
      requestsPerSecond: 0,
      averageResponseTime: 0,
      successRate: 0,
      errorRate: 0,
      costPerRequest: 0,
      monthlyCost: 0,
      costTrend: 'stable',
      queueLength: 0,
      activeTasks: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      providerPerformance: {} as any,
      modelPerformance: {} as any
    };
  }

  // ==================== 公共接口方法 ====================

  getMetrics(): AIEcosystemMetrics {
    return { ...this.metrics };
  }

  getAlerts(): AIEcosystemAlert[] {
    return [...this.alerts];
  }

  getPerformanceHistory(): { timestamp: Date; metrics: AIEcosystemMetrics }[] {
    return [...this.performanceHistory];
  }

  isMonitoring(): boolean {
    return this.isMonitoring;
  }

  async exportMetrics(format: 'json' | 'csv'): Promise<string> {
    const data = this.performanceHistory.map(entry => ({
      timestamp: entry.timestamp.toISOString(),
      ...entry.metrics
    }));

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    // CSV格式
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');

  }

  clearHistory(): void {
    this.performanceHistory = [];
    logger.info('已清除性能歷史數據');
  }

  clearAlerts(): void {
    this.alerts = [];
    logger.info('已清除所有警報');
  }
}

// ==================== 導出實例 ====================

export const aiEcosystemMonitor = new AIEcosystemMonitor();
export default aiEcosystemMonitor;
