import type {
  SearchAnalytics,
  SearchAnalyticsConfig,
  SearchAnalyticsEvent,
  SearchAnalyticsReport,
  SearchAnalyticsFilter,
  SearchAnalyticsExportOptions,
  SearchAnalyticsAlert,
  SearchInsight,
  SearchRecommendation,
} from '../types/searchAnalytics';
import {
  HourlyStats,
  DailyStats,
  MonthlyStats,
  UserBehaviorStats,
  SearchPattern,
  SessionAnalytics,
  PopularSearchStats,
  TrendingSearchStats,
  CategoryStats,
  PerformanceMetrics,
  ErrorRateStats,
  CacheMetrics,
  ConversionRates,
  RevenueImpact,
  UserSatisfactionStats,
} from '../types/searchAnalytics';

export class SearchAnalyticsService {
  private static instance: SearchAnalyticsService;
  private config: SearchAnalyticsConfig;
  private readonly events: SearchAnalyticsEvent[] = [];
  private analytics: SearchAnalytics;
  private alerts: SearchAnalyticsAlert[] = [];
  private isInitialized = false;
  private readonly eventListeners: ((event: SearchAnalyticsEvent) => void)[] =
    [];

  private constructor() {
    this.config = {
      enabled: true,
      trackingInterval: 60000, // 1分鐘
      dataRetentionDays: 90,
      privacyMode: false,
      anonymizeData: false,
      exportFormat: 'json',
      realTimeTracking: true,
      batchProcessing: false,
    };

    this.analytics = this.initializeAnalytics();
  }

  public static getInstance(): SearchAnalyticsService {
    if (!SearchAnalyticsService.instance) {
      SearchAnalyticsService.instance = new SearchAnalyticsService();
    }
    return SearchAnalyticsService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      await this.loadAnalytics();
      await this.initializeAlerts();
      this.startTracking();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('搜索分析服務初始化失敗:', error);
      return false;
    }
  }

  // 事件追蹤
  trackEvent(event: Omit<SearchAnalyticsEvent, 'timestamp'>): void {
    if (!this.config.enabled) return;

    const fullEvent: SearchAnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);
    this.processEvent(fullEvent);
    this.emitEvent(fullEvent);

    // 檢查警報
    this.checkAlerts(fullEvent);
  }

  // 獲取分析數據
  async getAnalytics(filter?: SearchAnalyticsFilter): Promise<SearchAnalytics> {
    if (!this.isInitialized) {
      throw new Error('搜索分析服務尚未初始化');
    }

    let filteredAnalytics = { ...this.analytics };

    if (filter) {
      filteredAnalytics = await this.applyFilter(filteredAnalytics, filter);
    }

    return filteredAnalytics;
  }

  // 生成報告
  async generateReport(
    title: string,
    description: string,
    period: { start: number; end: number },
    filter?: SearchAnalyticsFilter
  ): Promise<SearchAnalyticsReport> {
    const analytics = await this.getAnalytics(filter);
    const insights = await this.generateInsights(analytics);
    const recommendations = await this.generateRecommendations(analytics);

    const report: SearchAnalyticsReport = {
      id: `report_${Date.now()}`,
      title,
      description,
      period,
      analytics,
      insights,
      recommendations,
      generatedAt: Date.now(),
      version: '1.0.0',
    };

    return report;
  }

  // 導出數據
  async exportData(
    analytics: SearchAnalytics,
    options: SearchAnalyticsExportOptions
  ): Promise<string> {
    const data: unknown = analytics;

    if (options.includeInsights) {
      data.insights = await this.generateInsights(analytics);
    }

    if (options.includeRecommendations) {
      data.recommendations = await this.generateRecommendations(analytics);
    }

    switch (options.format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      case 'excel':
        return this.convertToExcel(data);
      case 'pdf':
        return this.convertToPDF(data);
      default:
        throw new Error(`不支持的導出格式: ${options.format}`);
    }
  }

  // 配置管理
  getConfig(): SearchAnalyticsConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<SearchAnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 警報管理
  async createAlert(
    alert: Omit<SearchAnalyticsAlert, 'id' | 'triggerCount'>
  ): Promise<string> {
    const newAlert: SearchAnalyticsAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      triggerCount: 0,
    };

    this.alerts.push(newAlert);
    return newAlert.id;
  }

  async updateAlert(
    alertId: string,
    updates: Partial<SearchAnalyticsAlert>
  ): Promise<void> {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) {
      throw new Error(`警報不存在: ${alertId}`);
    }

    this.alerts[index] = { ...this.alerts[index], ...updates };
  }

  async deleteAlert(alertId: string): Promise<void> {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) {
      throw new Error(`警報不存在: ${alertId}`);
    }

    this.alerts.splice(index, 1);
  }

  getAlerts(): SearchAnalyticsAlert[] {
    return [...this.alerts];
  }

  // 事件監聽
  addEventListener(listener: (event: SearchAnalyticsEvent) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: SearchAnalyticsEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // 私有方法
  private initializeAnalytics(): SearchAnalytics {
    return {
      totalSearches: 0,
      uniqueUsers: 0,
      averageSearchTime: 0,
      searchSuccessRate: 0,
      searchesByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        searches: 0,
        uniqueUsers: 0,
        averageResponseTime: 0,
        successRate: 0,
        peakHour: false,
      })),
      searchesByDay: [],
      searchesByMonth: [],
      userBehavior: {
        averageSearchesPerSession: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        returnRate: 0,
        searchDepth: 0,
        searchRefinementRate: 0,
        filterUsageRate: 0,
        sortUsageRate: 0,
      },
      searchPatterns: [],
      sessionAnalytics: {
        totalSessions: 0,
        averageSessionLength: 0,
        searchSessions: 0,
        conversionSessions: 0,
        sessionPaths: [],
        exitPages: [],
      },
      popularSearches: [],
      trendingSearches: [],
      searchCategories: [],
      performanceMetrics: {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        throughput: 0,
        errorRate: 0,
        availability: 100,
        cacheHitRate: 0,
      },
      errorRates: {
        totalErrors: 0,
        errorRate: 0,
        errorTypes: [],
        errorTrends: [],
      },
      cacheMetrics: {
        hitRate: 0,
        missRate: 0,
        evictionRate: 0,
        averageCacheSize: 0,
        cacheEfficiency: 0,
        cacheWarmupTime: 0,
      },
      conversionRates: {
        searchToView: 0,
        viewToClick: 0,
        clickToPurchase: 0,
        searchToPurchase: 0,
        overallConversion: 0,
      },
      revenueImpact: {
        totalRevenue: 0,
        searchAttributedRevenue: 0,
        averageOrderValue: 0,
        revenuePerSearch: 0,
        searchROI: 0,
      },
      userSatisfaction: {
        averageRating: 0,
        satisfactionScore: 0,
        feedbackCount: 0,
        positiveFeedbackRate: 0,
        negativeFeedbackRate: 0,
        improvementSuggestions: [],
      },
    };
  }

  private async loadAnalytics(): Promise<void> {
    // 在實際應用中，這裡應該從數據庫或存儲中加載分析數據
    // 目前使用模擬數據
    this.analytics = {
      ...this.analytics,
      totalSearches: 15420,
      uniqueUsers: 3200,
      averageSearchTime: 85,
      searchSuccessRate: 0.92,
      searchesByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        searches: Math.floor(Math.random() * 1000) + 100,
        uniqueUsers: Math.floor(Math.random() * 200) + 50,
        averageResponseTime: Math.floor(Math.random() * 50) + 50,
        successRate: 0.9 + Math.random() * 0.1,
        peakHour: i >= 9 && i <= 18,
      })),
      popularSearches: [
        {
          query: 'Pokemon Charizard',
          searches: 1250,
          uniqueUsers: 980,
          averageResults: 45,
          successRate: 0.95,
          category: 'Pokemon',
          trend: 'up',
          lastUpdated: Date.now(),
        },
        {
          query: 'Yu-Gi-Oh Blue Eyes',
          searches: 980,
          uniqueUsers: 750,
          averageResults: 38,
          successRate: 0.92,
          category: 'Yu-Gi-Oh',
          trend: 'stable',
          lastUpdated: Date.now(),
        },
      ],
      trendingSearches: [
        {
          query: 'Pokemon VMAX',
          currentSearches: 450,
          previousSearches: 280,
          growthRate: 0.61,
          category: 'Pokemon',
          trend: 'rising',
          period: 'week',
        },
      ],
      searchCategories: [
        {
          category: 'Pokemon',
          searches: 5200,
          uniqueUsers: 1800,
          averageResults: 42,
          successRate: 0.94,
          trend: 'up',
          marketShare: 0.34,
        },
        {
          category: 'Yu-Gi-Oh',
          searches: 3800,
          uniqueUsers: 1200,
          averageResults: 35,
          successRate: 0.91,
          trend: 'stable',
          marketShare: 0.25,
        },
      ],
    };
  }

  private async initializeAlerts(): Promise<void> {
    // 初始化默認警報
    this.alerts = [
      {
        id: 'alert_error_rate',
        name: '錯誤率警報',
        description: '當搜索錯誤率超過閾值時觸發',
        condition: {
          metric: 'errorRate',
          timeWindow: 300000, // 5分鐘
          aggregation: 'avg',
        },
        threshold: 0.05, // 5%
        operator: 'gt',
        enabled: true,
        notificationChannels: ['email', 'slack'],
        triggerCount: 0,
      },
      {
        id: 'alert_response_time',
        name: '響應時間警報',
        description: '當平均響應時間超過閾值時觸發',
        condition: {
          metric: 'averageResponseTime',
          timeWindow: 300000, // 5分鐘
          aggregation: 'avg',
        },
        threshold: 200, // 200ms
        operator: 'gt',
        enabled: true,
        notificationChannels: ['email'],
        triggerCount: 0,
      },
    ];
  }

  private startTracking(): void {
    if (this.config.realTimeTracking) {
      setInterval(() => {
        this.updateAnalytics();
      }, this.config.trackingInterval);
    }
  }

  private processEvent(event: SearchAnalyticsEvent): void {
    // 更新基礎統計
    this.analytics.totalSearches++;

    // 更新時間統計
    const hour = new Date(event.timestamp).getHours();
    this.analytics.searchesByHour[hour].searches++;
    this.analytics.searchesByHour[hour].averageResponseTime =
      (this.analytics.searchesByHour[hour].averageResponseTime +
        event.responseTime) /
      2;

    // 更新性能指標
    this.analytics.performanceMetrics.averageResponseTime =
      (this.analytics.performanceMetrics.averageResponseTime +
        event.responseTime) /
      2;

    // 更新錯誤統計
    if (!event.success) {
      this.analytics.errorRates.totalErrors++;
      this.analytics.errorRates.errorRate =
        this.analytics.errorRates.totalErrors / this.analytics.totalSearches;
    }

    // 更新成功率
    this.analytics.searchSuccessRate =
      (this.analytics.totalSearches - this.analytics.errorRates.totalErrors) /
      this.analytics.totalSearches;
  }

  private async updateAnalytics(): Promise<void> {
    // 更新實時統計
    this.analytics.performanceMetrics.throughput =
      this.analytics.totalSearches / (Date.now() / 1000 / 60); // 每分鐘搜索數

    // 更新可用性
    this.analytics.performanceMetrics.availability =
      (1 - this.analytics.errorRates.errorRate) * 100;
  }

  private async applyFilter(
    analytics: SearchAnalytics,
    filter: SearchAnalyticsFilter
  ): Promise<SearchAnalytics> {
    const filteredAnalytics = { ...analytics };

    if (filter.dateRange) {
      // 過濾時間範圍
      filteredAnalytics.searchesByHour =
        filteredAnalytics.searchesByHour.filter(stat => stat.searches > 0);
    }

    if (filter.categories) {
      // 過濾類別
      filteredAnalytics.searchCategories =
        filteredAnalytics.searchCategories.filter(category =>
          filter.categories.includes(category.category)
        );
    }

    if (filter.successOnly) {
      // 只顯示成功的搜索
      filteredAnalytics.searchSuccessRate = 1.0;
      filteredAnalytics.errorRates.errorRate = 0;
    }

    return filteredAnalytics;
  }

  private async generateInsights(
    analytics: SearchAnalytics
  ): Promise<SearchInsight[]> {
    const insights: SearchInsight[] = [];

    // 性能洞察
    if (analytics.performanceMetrics.averageResponseTime > 150) {
      insights.push({
        id: `insight_${Date.now()}_1`,
        type: 'warning',
        title: '搜索響應時間較高',
        description: `平均響應時間為 ${analytics.performanceMetrics.averageResponseTime}ms，建議優化搜索性能`,
        impact: 'medium',
        confidence: 0.85,
        data: {
          averageResponseTime: analytics.performanceMetrics.averageResponseTime,
        },
        timestamp: Date.now(),
      });
    }

    // 趨勢洞察
    const trendingSearches = analytics.trendingSearches.filter(
      s => s.trend === 'rising'
    );
    if (trendingSearches.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'opportunity',
        title: '發現熱門搜索趨勢',
        description: `發現 ${trendingSearches.length} 個上升趨勢的搜索詞`,
        impact: 'high',
        confidence: 0.9,
        data: { trendingSearches },
        timestamp: Date.now(),
      });
    }

    // 錯誤洞察
    if (analytics.errorRates.errorRate > 0.05) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        type: 'anomaly',
        title: '搜索錯誤率異常',
        description: `搜索錯誤率為 ${(analytics.errorRates.errorRate * 100).toFixed(1)}%，需要立即關注`,
        impact: 'critical',
        confidence: 0.95,
        data: { errorRate: analytics.errorRates.errorRate },
        timestamp: Date.now(),
      });
    }

    return insights;
  }

  private async generateRecommendations(
    analytics: SearchAnalytics
  ): Promise<SearchRecommendation[]> {
    const recommendations: SearchRecommendation[] = [];

    // 性能優化建議
    if (analytics.performanceMetrics.averageResponseTime > 150) {
      recommendations.push({
        id: `rec_${Date.now()}_1`,
        type: 'performance',
        title: '優化搜索性能',
        description: '實施搜索索引優化和緩存策略以提升響應速度',
        priority: 'high',
        effort: 'medium',
        expectedImpact: '響應時間減少 30-50%',
        implementation: '優化數據庫查詢、實施 Redis 緩存、CDN 加速',
        cost: 5000,
        timeline: '2-3 週',
      });
    }

    // 內容建議
    const lowSuccessCategories = analytics.searchCategories.filter(
      c => c.successRate < 0.8
    );
    if (lowSuccessCategories.length > 0) {
      recommendations.push({
        id: `rec_${Date.now()}_2`,
        type: 'content',
        title: '改善搜索內容',
        description: `為 ${lowSuccessCategories.length} 個類別添加更多相關內容`,
        priority: 'medium',
        effort: 'high',
        expectedImpact: '搜索成功率提升 15-25%',
        implementation: '內容審核、SEO 優化、用戶反饋收集',
        cost: 3000,
        timeline: '4-6 週',
      });
    }

    return recommendations;
  }

  private checkAlerts(event: SearchAnalyticsEvent): void {
    for (const alert of this.alerts) {
      if (!alert.enabled) continue;

      const shouldTrigger = this.evaluateAlertCondition(alert, event);
      if (shouldTrigger) {
        this.triggerAlert(alert);
      }
    }
  }

  private evaluateAlertCondition(
    alert: SearchAnalyticsAlert,
    event: SearchAnalyticsEvent
  ): boolean {
    // 簡化的警報條件評估
    switch (alert.condition.metric) {
      case 'errorRate':
        return this.analytics.errorRates.errorRate > alert.threshold;
      case 'averageResponseTime':
        return (
          this.analytics.performanceMetrics.averageResponseTime >
          alert.threshold
        );
      default:
        return false;
    }
  }

  private triggerAlert(alert: SearchAnalyticsAlert): void {
    alert.triggerCount++;
    alert.lastTriggered = Date.now();

    console.log(`警報觸發: ${alert.name} - ${alert.description}`);
    // 在實際應用中，這裡應該發送通知
  }

  private emitEvent(event: SearchAnalyticsEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('搜索分析事件監聽器錯誤:', error);
      }
    });
  }

  private convertToCSV(data: unknown): string {
    // 簡化的 CSV 轉換
    return JSON.stringify(data);
  }

  private convertToExcel(data: unknown): string {
    // 簡化的 Excel 轉換
    return JSON.stringify(data);
  }

  private convertToPDF(data: unknown): string {
    // 簡化的 PDF 轉換
    return JSON.stringify(data);
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}
