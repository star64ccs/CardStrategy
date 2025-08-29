import { AIServiceManager } from '../AIServiceManager';

export interface CostReport {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  providerBreakdown: Record<
    string,
    {
      cost: number;
      tokens: number;
      requests: number;
      percentage: number;
    }
  >;
  costTrend: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  budgetStatus: {
    used: number;
    remaining: number;
    percentage: number;
    status: 'under' | 'warning' | 'over';
  };
  recommendations: string[];
  timestamp: Date;
}

export interface BudgetSummary {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  budget: number;
  used: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'warning' | 'over';
  alerts: Alert[];
  timestamp: Date;
}

export interface Alert {
  id: string;
  type: 'cost' | 'usage' | 'budget' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  resolved: boolean;
}

export interface CostOptimization {
  id: string;
  type:
    | 'provider_switch'
    | 'model_optimization'
    | 'cache_improvement'
    | 'batch_processing';
  description: string;
  potentialSavings: number;
  implementationCost: number;
  roi: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'implemented' | 'rejected';
  timestamp: Date;
}

export interface CostWorkerConfig {
  enabled: boolean;
  schedule: string; // cron expression
  monitoring: {
    checkInterval: number; // minutes
    alertThresholds: {
      dailyBudget: number;
      weeklyBudget: number;
      monthlyBudget: number;
      costSpike: number; // percentage
      usageAnomaly: number; // percentage
    };
  };
  optimization: {
    enableAutoOptimization: boolean;
    enableProviderSwitching: boolean;
    enableModelOptimization: boolean;
    enableCacheOptimization: boolean;
    minSavingsThreshold: number; // minimum savings to trigger optimization
  };
  reporting: {
    enableDailyReports: boolean;
    enableWeeklyReports: boolean;
    enableMonthlyReports: boolean;
    enableRealTimeAlerts: boolean;
  };
}

export class CostWorker {
  private readonly aiService: AIServiceManager;
  private config: CostWorkerConfig;
  private readonly isRunning = false;
  private lastCheck: Date | null = null;
  private readonly alerts: Alert[] = [];
  private readonly optimizations: CostOptimization[] = [];

  constructor(config: CostWorkerConfig) {
    this.config = config;
    this.aiService = AIServiceManager.getInstance();
  }

  /**
   * 掃描使用量和成本
   */
  public async scanUsage(): Promise<CostReport> {
    try {
      if (!this.config.enabled) {
        throw new Error('CostWorker 已停用');
      }

      const _stats = this.aiService.getStats();
      const _now = new Date();
      const _startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const _startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const _startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // 計算提供商細分
      const providerBreakdown: Record<string, any> = {};
      let totalCost = 0;
      let totalTokens = 0;
      let totalRequests = 0;

      Object.entries(stats.providerUsage).forEach(([provider, usage]) => {
        totalCost += usage.cost;
        totalTokens += usage.tokens;
        totalRequests += usage.requests;

        providerBreakdown[provider] = {
          cost: usage.cost,
          tokens: usage.tokens,
          requests: usage.requests,
          percentage:
            stats.totalCost > 0 ? (usage.cost / stats.totalCost) * 100 : 0,
        };
      });

      // 計算預算狀態
      const _budgetStatus = this.calculateBudgetStatus(totalCost);

      // 生成成本趨勢
      const _costTrend = await this.generateCostTrend();

      // 生成優化建議
      const _recommendations =
        await this.generateOptimizationRecommendations(stats);

      const report: CostReport = {
        id: `cost_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        period: 'daily',
        startDate: startOfDay,
        endDate: now,
        totalCost,
        totalTokens,
        totalRequests,
        providerBreakdown,
        costTrend,
        budgetStatus,
        recommendations,
        timestamp: now,
      };

      this.lastCheck = now;

      // 檢查是否需要警報
      await this.checkAlerts(report);

      return report;
    } catch (error) {
      console.error('掃描使用量失敗:', error);
      throw error;
    }
  }

  /**
   * 檢測過度使用
   */
  public async detectOveruse(): Promise<Alert[]> {
    try {
      const _stats = this.aiService.getStats();
      const alerts: Alert[] = [];

      // 檢查成本異常
      const _costAlerts = this.detectCostAnomalies(stats);
      alerts.push(...costAlerts);

      // 檢查使用量異常
      const _usageAlerts = this.detectUsageAnomalies(stats);
      alerts.push(...usageAlerts);

      // 檢查預算超支
      const _budgetAlerts = this.detectBudgetOverruns(stats);
      alerts.push(...budgetAlerts);

      // 檢查提供商異常
      const _providerAlerts = this.detectProviderAnomalies(stats);
      alerts.push(...providerAlerts);

      // 保存警報
      this.alerts.push(...alerts);

      return alerts;
    } catch (error) {
      console.error('檢測過度使用失敗:', error);
      throw error;
    }
  }

  /**
   * 生成預算報告
   */
  public async generateBudgetReport(): Promise<BudgetSummary> {
    try {
      const _stats = this.aiService.getStats();
      const _now = new Date();

      // 計算預算狀態
      const _budgetStatus = this.calculateBudgetStatus(stats.totalCost);

      // 獲取活躍警報
      const _activeAlerts = this.alerts.filter(alert => !alert.resolved);

      const summary: BudgetSummary = {
        id: `budget_summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        period: 'monthly',
        budget: this.config.monitoring.alertThresholds.monthlyBudget,
        used: stats.totalCost,
        remaining:
          this.config.monitoring.alertThresholds.monthlyBudget -
          stats.totalCost,
        percentage:
          (stats.totalCost /
            this.config.monitoring.alertThresholds.monthlyBudget) *
          100,
        status: budgetStatus.status,
        alerts: activeAlerts,
        timestamp: now,
      };

      return summary;
    } catch (error) {
      console.error('生成預算報告失敗:', error);
      throw error;
    }
  }

  /**
   * 生成成本優化建議
   */
  public async generateOptimizationSuggestions(): Promise<CostOptimization[]> {
    try {
      const _stats = this.aiService.getStats();
      const suggestions: CostOptimization[] = [];

      // 分析提供商成本
      const _providerOptimizations = this.analyzeProviderOptimizations(stats);
      suggestions.push(...providerOptimizations);

      // 分析模型優化
      const _modelOptimizations = this.analyzeModelOptimizations(stats);
      suggestions.push(...modelOptimizations);

      // 分析緩存優化
      const _cacheOptimizations = this.analyzeCacheOptimizations(stats);
      suggestions.push(...cacheOptimizations);

      // 分析批量處理優化
      const _batchOptimizations = this.analyzeBatchOptimizations(stats);
      suggestions.push(...batchOptimizations);

      // 按ROI排序
      suggestions.sort((a, b) => b.roi - a.roi);

      // 保存優化建議
      this.optimizations.push(...suggestions);

      return suggestions;
    } catch (error) {
      console.error('生成優化建議失敗:', error);
      throw error;
    }
  }

  /**
   * 應用成本優化
   */
  public async applyOptimization(optimizationId: string): Promise<boolean> {
    try {
      const _optimization = this.optimizations.find(
        opt => opt.id === optimizationId
      );
      if (!optimization) {
        throw new Error('優化建議不存在');
      }

      // 根據優化類型執行相應操作
      switch (optimization.type) {
        case 'provider_switch':
          await this.switchToLowerCostProvider();
          break;
        case 'model_optimization':
          await this.optimizeModelUsage();
          break;
        case 'cache_improvement':
          await this.improveCacheStrategy();
          break;
        case 'batch_processing':
          await this.enableBatchProcessing();
          break;
        default:
          throw new Error('不支持的優化類型');
      }

      // 更新優化狀態
      optimization.status = 'implemented';

      return true;
    } catch (error) {
      console.error('應用優化失敗:', error);
      return false;
    }
  }

  /**
   * 獲取成本預測
   */
  public async getCostForecast(
    period: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<{
    forecast: number;
    confidence: number;
    factors: string[];
  }> {
    try {
      const _stats = this.aiService.getStats();

      const _forecastPrompt = `基於以下使用數據預測未來${period}的成本，要求：
1. 分析歷史趨勢
2. 考慮季節性因素
3. 預測未來使用量
4. 計算預期成本
5. 提供置信度

歷史數據：
- 總請求數：${stats.totalRequests}
- 總token數：${stats.totalTokens}
- 總成本：$${stats.totalCost.toFixed(4)}
- 成功率：${(stats.successRate * 100).toFixed(2)}%

請以JSON格式返回預測結果。`;

      const _forecastResponse = await this.aiService.callAI({
        prompt: forecastPrompt,
        maxTokens: 600,
        temperature: 0.3,
        useCache: true,
      });

      try {
        const _forecast = JSON.parse(forecastResponse.content);
        return {
          forecast: forecast.cost || 0,
          confidence: forecast.confidence || 0.5,
          factors: forecast.factors || [],
        };
      } catch (error) {
        // 如果解析失敗，使用簡單預測
        const _avgDailyCost = stats.totalCost / 30; // 假設30天數據
        const _forecast =
          avgDailyCost *
          (period === 'daily' ? 1 : period === 'weekly' ? 7 : 30);

        return {
          forecast,
          confidence: 0.7,
          factors: ['基於歷史平均值預測'],
        };
      }
    } catch (error) {
      console.error('獲取成本預測失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取工作狀態
   */
  public getStatus(): {
    isRunning: boolean;
    lastCheck: Date | null;
    config: CostWorkerConfig;
  } {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      config: this.config,
    };
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<CostWorkerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 私有方法

  /**
   * 計算預算狀態
   */
  private calculateBudgetStatus(totalCost: number): {
    used: number;
    remaining: number;
    percentage: number;
    status: 'under' | 'warning' | 'over';
  } {
    const _budget = this.config.monitoring.alertThresholds.monthlyBudget;
    const _used = totalCost;
    const _remaining = budget - used;
    const _percentage = (used / budget) * 100;

    let status: 'under' | 'warning' | 'over' = 'under';
    if (percentage >= 100) {
      status = 'over';
    } else if (percentage >= 80) {
      status = 'warning';
    }

    return { used, remaining, percentage, status };
  }

  /**
   * 生成成本趨勢
   */
  private async generateCostTrend(): Promise<{
    daily: number[];
    weekly: number[];
    monthly: number[];
  }> {
    // 這裡應該從數據庫獲取歷史數據
    // 簡化實現，返回模擬數據
    return {
      daily: [10, 12, 8, 15, 11, 9, 13],
      weekly: [80, 95, 70, 110, 85, 90, 100],
      monthly: [300, 350, 280, 400, 320, 380],
    };
  }

  /**
   * 生成優化建議
   */
  private async generateOptimizationRecommendations(
    stats: unknown
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // 分析提供商使用情況
    const _providers = Object.entries(stats.providerUsage);
    const _expensiveProviders = providers.filter(
      ([_, usage]: [string, any]) => usage.cost > stats.totalCost * 0.3
    );

    if (expensiveProviders.length > 0) {
      const _providerName = expensiveProviders[0][0];
      const _providerUsage = expensiveProviders[0][1] as any;
      recommendations.push(
        `考慮切換到成本更低的提供商，當前${providerName}佔用${((providerUsage.cost / stats.totalCost) * 100).toFixed(1)}%的成本`
      );
    }

    // 分析緩存使用情況
    if (stats.totalRequests > 1000) {
      recommendations.push('啟用智能緩存以減少重複API調用');
    }

    // 分析批量處理
    if (stats.totalRequests > 500) {
      recommendations.push('考慮實施批量處理以減少API調用次數');
    }

    return recommendations;
  }

  /**
   * 檢查警報
   */
  private async checkAlerts(report: CostReport): Promise<void> {
    const alerts: Alert[] = [];

    // 檢查預算警報
    if (report.budgetStatus.percentage >= 80) {
      alerts.push({
        id: `alert_${Date.now()}_1`,
        type: 'budget',
        severity: report.budgetStatus.percentage >= 100 ? 'critical' : 'high',
        message: `預算使用率達到${report.budgetStatus.percentage.toFixed(1)}%`,
        threshold: 80,
        currentValue: report.budgetStatus.percentage,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // 檢查成本異常
    const _avgDailyCost = report.totalCost / 1; // 簡化計算
    if (avgDailyCost > this.config.monitoring.alertThresholds.dailyBudget) {
      alerts.push({
        id: `alert_${Date.now()}_2`,
        type: 'cost',
        severity: 'high',
        message: `日成本$${avgDailyCost.toFixed(2)}超過預算$${this.config.monitoring.alertThresholds.dailyBudget}`,
        threshold: this.config.monitoring.alertThresholds.dailyBudget,
        currentValue: avgDailyCost,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // 保存警報
    this.alerts.push(...alerts);

    // 發送警報通知
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }
  }

  /**
   * 檢測成本異常
   */
  private detectCostAnomalies(stats: unknown): Alert[] {
    const alerts: Alert[] = [];

    // 檢查是否有異常高的成本
    const _avgCostPerRequest = stats.totalCost / stats.totalRequests;
    if (avgCostPerRequest > 0.01) {
      // 假設正常成本每請求不超過$0.01
      alerts.push({
        id: `cost_anomaly_${Date.now()}`,
        type: 'cost',
        severity: 'medium',
        message: `平均每請求成本$${avgCostPerRequest.toFixed(4)}異常偏高`,
        threshold: 0.01,
        currentValue: avgCostPerRequest,
        timestamp: new Date(),
        resolved: false,
      });
    }

    return alerts;
  }

  /**
   * 檢測使用量異常
   */
  private detectUsageAnomalies(stats: unknown): Alert[] {
    const alerts: Alert[] = [];

    // 檢查請求量異常
    if (stats.totalRequests > 1000) {
      // 假設正常日請求量不超過1000
      alerts.push({
        id: `usage_anomaly_${Date.now()}`,
        type: 'usage',
        severity: 'medium',
        message: `日請求量${stats.totalRequests}異常偏高`,
        threshold: 1000,
        currentValue: stats.totalRequests,
        timestamp: new Date(),
        resolved: false,
      });
    }

    return alerts;
  }

  /**
   * 檢測預算超支
   */
  private detectBudgetOverruns(stats: unknown): Alert[] {
    const alerts: Alert[] = [];

    const _budget = this.config.monitoring.alertThresholds.monthlyBudget;
    const _percentage = (stats.totalCost / budget) * 100;

    if (percentage >= 100) {
      alerts.push({
        id: `budget_overrun_${Date.now()}`,
        type: 'budget',
        severity: 'critical',
        message: `月度預算已超支${(percentage - 100).toFixed(1)}%`,
        threshold: 100,
        currentValue: percentage,
        timestamp: new Date(),
        resolved: false,
      });
    }

    return alerts;
  }

  /**
   * 檢測提供商異常
   */
  private detectProviderAnomalies(stats: unknown): Alert[] {
    const alerts: Alert[] = [];

    // 檢查是否有提供商使用率異常
    Object.entries(stats.providerUsage).forEach(
      ([provider, usage]: [string, any]) => {
        const _percentage = (usage.cost / stats.totalCost) * 100;
        if (percentage > 80) {
          // 單一提供商使用率不應超過80%
          alerts.push({
            id: `provider_anomaly_${Date.now()}`,
            type: 'usage',
            severity: 'medium',
            message: `${provider}使用率${percentage.toFixed(1)}%過高，建議分散風險`,
            threshold: 80,
            currentValue: percentage,
            timestamp: new Date(),
            resolved: false,
          });
        }
      }
    );

    return alerts;
  }

  /**
   * 分析提供商優化
   */
  private analyzeProviderOptimizations(stats: unknown): CostOptimization[] {
    const optimizations: CostOptimization[] = [];

    // 找出成本最高的提供商
    const _providers = Object.entries(stats.providerUsage);
    const _expensiveProvider = providers.reduce((max, current) => {
      const _maxCost = (max[1] as any).cost;
      const _currentCost = (current[1] as any).cost;
      return currentCost > maxCost ? current : max;
    });

    const _expensiveProviderCost = (expensiveProvider[1] as any).cost;
    if (expensiveProviderCost > stats.totalCost * 0.5) {
      optimizations.push({
        id: `provider_switch_${Date.now()}`,
        type: 'provider_switch',
        description: `切換${expensiveProvider[0]}到成本更低的提供商`,
        potentialSavings: expensiveProviderCost * 0.3, // 假設可節省30%
        implementationCost: 0,
        roi: 0.3,
        priority: 'high',
        status: 'pending',
        timestamp: new Date(),
      });
    }

    return optimizations;
  }

  /**
   * 分析模型優化
   */
  private analyzeModelOptimizations(stats: unknown): CostOptimization[] {
    const optimizations: CostOptimization[] = [];

    // 檢查是否可以使用更便宜的模型
    if (stats.totalTokens > 10000) {
      optimizations.push({
        id: `model_optimization_${Date.now()}`,
        type: 'model_optimization',
        description: '使用更便宜的模型進行非關鍵任務',
        potentialSavings: stats.totalCost * 0.2, // 假設可節省20%
        implementationCost: 0,
        roi: 0.2,
        priority: 'medium',
        status: 'pending',
        timestamp: new Date(),
      });
    }

    return optimizations;
  }

  /**
   * 分析緩存優化
   */
  private analyzeCacheOptimizations(stats: unknown): CostOptimization[] {
    const optimizations: CostOptimization[] = [];

    // 檢查緩存使用情況
    if (stats.totalRequests > 500) {
      optimizations.push({
        id: `cache_improvement_${Date.now()}`,
        type: 'cache_improvement',
        description: '改進緩存策略以減少重複請求',
        potentialSavings: stats.totalCost * 0.15, // 假設可節省15%
        implementationCost: 0,
        roi: 0.15,
        priority: 'medium',
        status: 'pending',
        timestamp: new Date(),
      });
    }

    return optimizations;
  }

  /**
   * 分析批量處理優化
   */
  private analyzeBatchOptimizations(stats: unknown): CostOptimization[] {
    const optimizations: CostOptimization[] = [];

    // 檢查是否適合批量處理
    if (stats.totalRequests > 200) {
      optimizations.push({
        id: `batch_processing_${Date.now()}`,
        type: 'batch_processing',
        description: '實施批量處理以減少API調用次數',
        potentialSavings: stats.totalCost * 0.1, // 假設可節省10%
        implementationCost: 0,
        roi: 0.1,
        priority: 'low',
        status: 'pending',
        timestamp: new Date(),
      });
    }

    return optimizations;
  }

  /**
   * 切換到成本更低的提供商
   */
  private async switchToLowerCostProvider(): Promise<void> {
    // 這裡應該實現提供商切換邏輯
    console.log('切換到成本更低的提供商');
  }

  /**
   * 優化模型使用
   */
  private async optimizeModelUsage(): Promise<void> {
    // 這裡應該實現模型優化邏輯
    console.log('優化模型使用');
  }

  /**
   * 改進緩存策略
   */
  private async improveCacheStrategy(): Promise<void> {
    // 這裡應該實現緩存改進邏輯
    console.log('改進緩存策略');
  }

  /**
   * 啟用批量處理
   */
  private async enableBatchProcessing(): Promise<void> {
    // 這裡應該實現批量處理邏輯
    console.log('啟用批量處理');
  }

  /**
   * 發送警報
   */
  private async sendAlert(alert: Alert): Promise<void> {
    console.log(`🚨 成本警報: ${alert.message}`);

    // 這裡應該發送實際的警報通知
    // 例如：郵件、Slack、釘釘等
  }
}
