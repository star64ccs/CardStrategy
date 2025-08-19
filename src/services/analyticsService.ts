import { apiService } from './apiService';
import { logger } from '@/utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 分析配置接口
export interface AnalyticsConfig {
  cacheTTL: number;
  maxDataPoints: number;
  defaultTimeframe: string;
  batchSize: number;
  supportedTimeframes: string[];
  supportedAnalysisTypes: string[];
  supportedReportTypes: string[];
}

// 市場趨勢分析接口
export interface MarketTrends {
  timeframe: string;
  categories: string[];
  trends: {
    price: {
      direction: 'up' | 'down' | 'stable';
      change: number;
      total: number;
    };
    volume: {
      direction: 'up' | 'down' | 'stable';
      change: number;
      total: number;
    };
    demand: {
      direction: 'up' | 'down' | 'stable';
      change: number;
      total: number;
    };
  };
  insights: {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
  }[];
  summary: {
    overallDirection: 'up' | 'down' | 'stable';
    keyMetrics: {
      avgPriceChange: number;
      avgVolumeChange: number;
      totalTransactions: number;
    };
    recommendations: string[];
  };
  generatedAt: Date;
}

// 投資組合分析接口
export interface PortfolioAnalysis {
  portfolio: {
    id: string;
    name: string;
    totalValue: number;
    totalCards: number;
    diversification: {
      score: number;
      categories: string[];
      distribution: Record<string, number>;
    };
    riskMetrics: {
      volatility: number;
      maxDrawdown: number;
      riskScore: number;
      riskLevel: 'low' | 'medium' | 'high';
    };
  };
  performance: {
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
  } | null;
  transactions: {
    id: string;
    type: 'buy' | 'sell';
    amount: number;
    cardId: string;
    createdAt: Date;
  }[] | null;
  recommendations: {
    type: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    action: string;
  }[];
  generatedAt: Date;
}

// 用戶行為分析接口
export interface UserBehaviorAnalysis {
  user: {
    id: string;
    username: string;
    joinDate: Date;
    totalTransactions: number;
  };
  patterns: {
    tradingFrequency: number;
    preferredCategories: string[];
    tradingTimes: {
      peakHour: number;
      peakCount: number;
      distribution: Record<string, number>;
    };
    priceRange: {
      min: number;
      max: number;
      avg: number;
      median: number;
    };
  } | null;
  predictions: {
    nextPurchase: {
      probability: number;
      timeframe: string;
      estimatedAmount: number;
    };
    churnRisk: {
      probability: number;
      factors: string[];
    };
  } | null;
  insights: {
    type: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  generatedAt: Date;
}

// 預測分析接口
export interface PredictiveAnalysis {
  target: string;
  timeframe: string;
  confidence: number;
  predictions: {
    date: Date;
    value: number;
    confidence: number;
  }[];
  accuracy: number;
  factors: string[];
  generatedAt: Date;
}

// 異常檢測接口
export interface AnomalyDetection {
  type: string;
  sensitivity: string;
  timeframe: string;
  anomalies: {
    id: number;
    type: string;
    cardId: string;
    value: number;
    expected: number;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
  }[];
  totalDetected: number;
  severity: 'low' | 'medium' | 'high';
  generatedAt: Date;
}

// 相關性分析接口
export interface CorrelationAnalysis {
  variables: string[];
  timeframe: string;
  method: string;
  correlations: Record<string, number>;
  significant: string[];
  insights: string[];
  generatedAt: Date;
}

// 分段分析接口
export interface SegmentationAnalysis {
  dimension: string;
  criteria: string[];
  segments: {
    id: number;
    name: string;
    size: number;
    characteristics: Record<string, any>;
  }[];
  characteristics: Record<string, any>;
  recommendations: string[];
  generatedAt: Date;
}

// 分析指標接口
export interface AnalyticsMetrics {
  overview: Record<string, any>;
  performance: Record<string, any>;
  user: Record<string, any>;
  market: Record<string, any>;
  trends: Record<string, any> | null;
  generatedAt: Date;
}

// 報告模板接口
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  parameters: string[];
}

// 綜合報告接口
export interface ComprehensiveReport {
  metadata: {
    reportType: string;
    dateRange: {
      start: Date;
      end: Date;
    };
    generatedAt: Date;
    version: string;
  };
  executive: Record<string, any>;
  market: Record<string, any>;
  user: Record<string, any>;
  financial: Record<string, any>;
  technical: Record<string, any>;
  charts: Record<string, any> | null;
  recommendations: Record<string, any> | null;
}

// 分析歷史接口
export interface AnalysisHistory {
  id: number;
  type: string;
  userId: string;
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

// 導出數據接口
export interface ExportData {
  type: string;
  parameters: Record<string, any>;
  format: string;
  downloadUrl: string;
  expiresAt: Date;
}

// 分析統計接口
export interface AnalyticsStats {
  totalAnalyses: number;
  totalReports: number;
  avgProcessingTime: number;
  cacheHitRate: number;
  errorRate: number;
  topAnalysisTypes: {
    type: string;
    count: number;
  }[];
  timeframe: string;
}

// 高級分析服務類
class AnalyticsService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  // 獲取市場趨勢分析
  async getMarketTrends(options: {
    timeframe?: string;
    categories?: string[];
    limit?: number;
    useCache?: boolean;
  } = {}): Promise<MarketTrends> {
    const cacheKey = `market_trends:${JSON.stringify(options)}`;

    if (options.useCache !== false) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const params = new URLSearchParams();
      if (options.timeframe) params.append('timeframe', options.timeframe);
      if (options.categories?.length) params.append('categories', options.categories.join(','));
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.useCache === false) params.append('useCache', 'false');

      const response = await apiService.get(`/analytics/market/trends?${params}`);

      if (options.useCache !== false) {
        this.setCachedData(cacheKey, response.data, 3600); // 1小時緩存
      }

      return response.data;
    } catch (error) {
      logger.error('獲取市場趨勢分析失敗:', error);
      throw new Error('市場趨勢分析失敗');
    }
  }

  // 獲取投資組合分析
  async getPortfolioAnalysis(userId: string, options: {
    timeframe?: string;
    includeTransactions?: boolean;
    includePerformance?: boolean;
    useCache?: boolean;
  } = {}): Promise<PortfolioAnalysis> {
    const cacheKey = `portfolio_analysis:${userId}:${JSON.stringify(options)}`;

    if (options.useCache !== false) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const params = new URLSearchParams();
      if (options.timeframe) params.append('timeframe', options.timeframe);
      if (options.includeTransactions !== undefined) params.append('includeTransactions', options.includeTransactions.toString());
      if (options.includePerformance !== undefined) params.append('includePerformance', options.includePerformance.toString());
      if (options.useCache === false) params.append('useCache', 'false');

      const response = await apiService.get(`/analytics/portfolio/${userId}?${params}`);

      if (options.useCache !== false) {
        this.setCachedData(cacheKey, response.data, 1800); // 30分鐘緩存
      }

      return response.data;
    } catch (error) {
      logger.error('獲取投資組合分析失敗:', error);
      throw new Error('投資組合分析失敗');
    }
  }

  // 獲取用戶行為分析
  async getUserBehaviorAnalysis(userId: string, options: {
    timeframe?: string;
    includePatterns?: boolean;
    includePredictions?: boolean;
    useCache?: boolean;
  } = {}): Promise<UserBehaviorAnalysis> {
    const cacheKey = `user_behavior:${userId}:${JSON.stringify(options)}`;

    if (options.useCache !== false) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const params = new URLSearchParams();
      if (options.timeframe) params.append('timeframe', options.timeframe);
      if (options.includePatterns !== undefined) params.append('includePatterns', options.includePatterns.toString());
      if (options.includePredictions !== undefined) params.append('includePredictions', options.includePredictions.toString());
      if (options.useCache === false) params.append('useCache', 'false');

      const response = await apiService.get(`/analytics/user/${userId}/behavior?${params}`);

      if (options.useCache !== false) {
        this.setCachedData(cacheKey, response.data, 1800); // 30分鐘緩存
      }

      return response.data;
    } catch (error) {
      logger.error('獲取用戶行為分析失敗:', error);
      throw new Error('用戶行為分析失敗');
    }
  }

  // 生成綜合報告
  async generateComprehensiveReport(options: {
    reportType?: string;
    startDate?: Date;
    endDate?: Date;
    includeCharts?: boolean;
    includeRecommendations?: boolean;
    format?: string;
  } = {}): Promise<ComprehensiveReport> {
    try {
      const response = await apiService.post('/analytics/reports/comprehensive', {
        reportType: options.reportType || 'monthly',
        startDate: options.startDate?.toISOString(),
        endDate: options.endDate?.toISOString(),
        includeCharts: options.includeCharts !== false,
        includeRecommendations: options.includeRecommendations !== false,
        format: options.format || 'json'
      });

      return response.data;
    } catch (error) {
      logger.error('生成綜合報告失敗:', error);
      throw new Error('報告生成失敗');
    }
  }

  // 獲取預測分析
  async getPredictiveAnalysis(options: {
    target?: string;
    timeframe?: string;
    confidence?: number;
    useCache?: boolean;
  } = {}): Promise<PredictiveAnalysis> {
    const cacheKey = `predictive:${JSON.stringify(options)}`;

    if (options.useCache !== false) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const params = new URLSearchParams();
      if (options.target) params.append('target', options.target);
      if (options.timeframe) params.append('timeframe', options.timeframe);
      if (options.confidence) params.append('confidence', options.confidence.toString());
      if (options.useCache === false) params.append('useCache', 'false');

      const response = await apiService.get(`/analytics/predictive?${params}`);

      if (options.useCache !== false) {
        this.setCachedData(cacheKey, response.data, 3600); // 1小時緩存
      }

      return response.data;
    } catch (error) {
      logger.error('獲取預測分析失敗:', error);
      throw new Error('預測分析失敗');
    }
  }

  // 獲取異常檢測
  async getAnomalyDetection(options: {
    type?: string;
    sensitivity?: string;
    timeframe?: string;
    useCache?: boolean;
  } = {}): Promise<AnomalyDetection> {
    const cacheKey = `anomaly:${JSON.stringify(options)}`;

    if (options.useCache !== false) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const params = new URLSearchParams();
      if (options.type) params.append('type', options.type);
      if (options.sensitivity) params.append('sensitivity', options.sensitivity);
      if (options.timeframe) params.append('timeframe', options.timeframe);
      if (options.useCache === false) params.append('useCache', 'false');

      const response = await apiService.get(`/analytics/anomaly?${params}`);

      if (options.useCache !== false) {
        this.setCachedData(cacheKey, response.data, 1800); // 30分鐘緩存
      }

      return response.data;
    } catch (error) {
      logger.error('獲取異常檢測失敗:', error);
      throw new Error('異常檢測失敗');
    }
  }

  // 獲取相關性分析
  async getCorrelationAnalysis(options: {
    variables?: string[];
    timeframe?: string;
    method?: string;
    useCache?: boolean;
  } = {}): Promise<CorrelationAnalysis> {
    const cacheKey = `correlation:${JSON.stringify(options)}`;

    if (options.useCache !== false) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const params = new URLSearchParams();
      if (options.variables?.length) params.append('variables', options.variables.join(','));
      if (options.timeframe) params.append('timeframe', options.timeframe);
      if (options.method) params.append('method', options.method);
      if (options.useCache === false) params.append('useCache', 'false');

      const response = await apiService.get(`/analytics/correlation?${params}`);

      if (options.useCache !== false) {
        this.setCachedData(cacheKey, response.data, 3600); // 1小時緩存
      }

      return response.data;
    } catch (error) {
      logger.error('獲取相關性分析失敗:', error);
      throw new Error('相關性分析失敗');
    }
  }

  // 獲取分段分析
  async getSegmentationAnalysis(options: {
    dimension?: string;
    criteria?: string[];
    segments?: number;
    useCache?: boolean;
  } = {}): Promise<SegmentationAnalysis> {
    const cacheKey = `segmentation:${JSON.stringify(options)}`;

    if (options.useCache !== false) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const params = new URLSearchParams();
      if (options.dimension) params.append('dimension', options.dimension);
      if (options.criteria?.length) params.append('criteria', options.criteria.join(','));
      if (options.segments) params.append('segments', options.segments.toString());
      if (options.useCache === false) params.append('useCache', 'false');

      const response = await apiService.get(`/analytics/segmentation?${params}`);

      if (options.useCache !== false) {
        this.setCachedData(cacheKey, response.data, 3600); // 1小時緩存
      }

      return response.data;
    } catch (error) {
      logger.error('獲取分段分析失敗:', error);
      throw new Error('分段分析失敗');
    }
  }

  // 獲取分析指標
  async getAnalyticsMetrics(options: {
    timeframe?: string;
    includeTrends?: boolean;
    useCache?: boolean;
  } = {}): Promise<AnalyticsMetrics> {
    const cacheKey = `analytics_metrics:${JSON.stringify(options)}`;

    if (options.useCache !== false) {
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
    }

    try {
      const params = new URLSearchParams();
      if (options.timeframe) params.append('timeframe', options.timeframe);
      if (options.includeTrends !== undefined) params.append('includeTrends', options.includeTrends.toString());
      if (options.useCache === false) params.append('useCache', 'false');

      const response = await apiService.get(`/analytics/metrics?${params}`);

      if (options.useCache !== false) {
        this.setCachedData(cacheKey, response.data, 900); // 15分鐘緩存
      }

      return response.data;
    } catch (error) {
      logger.error('獲取分析指標失敗:', error);
      throw new Error('分析指標獲取失敗');
    }
  }

  // 獲取報告模板
  async getReportTemplates(): Promise<ReportTemplate[]> {
    try {
      const response = await apiService.get('/analytics/reports/templates');
      return response.data;
    } catch (error) {
      logger.error('獲取報告模板失敗:', error);
      throw new Error('報告模板獲取失敗');
    }
  }

  // 生成自定義報告
  async generateCustomReport(templateId: string, parameters: Record<string, any>, format?: string): Promise<any> {
    try {
      const response = await apiService.post('/analytics/reports/custom', {
        templateId,
        parameters,
        format: format || 'json'
      });

      return response.data;
    } catch (error) {
      logger.error('生成自定義報告失敗:', error);
      throw new Error('自定義報告生成失敗');
    }
  }

  // 獲取分析配置
  async getAnalyticsConfig(): Promise<AnalyticsConfig> {
    try {
      const response = await apiService.get('/analytics/config');
      return response.data;
    } catch (error) {
      logger.error('獲取分析配置失敗:', error);
      throw new Error('分析配置獲取失敗');
    }
  }

  // 更新分析配置
  async updateAnalyticsConfig(config: Partial<AnalyticsConfig>): Promise<AnalyticsConfig> {
    try {
      const response = await apiService.put('/analytics/config', config);
      return response.data;
    } catch (error) {
      logger.error('更新分析配置失敗:', error);
      throw new Error('分析配置更新失敗');
    }
  }

  // 獲取分析歷史
  async getAnalysisHistory(options: {
    userId?: string;
    type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AnalysisHistory[]> {
    try {
      const params = new URLSearchParams();
      if (options.userId) params.append('userId', options.userId);
      if (options.type) params.append('type', options.type);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const response = await apiService.get(`/analytics/history?${params}`);
      return response.data;
    } catch (error) {
      logger.error('獲取分析歷史失敗:', error);
      throw new Error('分析歷史獲取失敗');
    }
  }

  // 導出分析數據
  async exportAnalyticsData(type: string, parameters: Record<string, any>, format?: string): Promise<ExportData> {
    try {
      const response = await apiService.post('/analytics/export', {
        type,
        parameters,
        format: format || 'csv'
      });

      return response.data;
    } catch (error) {
      logger.error('導出分析數據失敗:', error);
      throw new Error('數據導出失敗');
    }
  }

  // 獲取分析統計
  async getAnalyticsStats(timeframe?: string): Promise<AnalyticsStats> {
    try {
      const params = new URLSearchParams();
      if (timeframe) params.append('timeframe', timeframe);

      const response = await apiService.get(`/analytics/stats?${params}`);
      return response.data;
    } catch (error) {
      logger.error('獲取分析統計失敗:', error);
      throw new Error('分析統計獲取失敗');
    }
  }

  // 清理分析緩存
  async clearAnalyticsCache(pattern?: string): Promise<{ cleared: number }> {
    try {
      const params = new URLSearchParams();
      if (pattern) params.append('pattern', pattern);

      const response = await apiService.delete(`/analytics/cache?${params}`);

      // 清理本地緩存
      this.clearLocalCache(pattern);

      return response.data;
    } catch (error) {
      logger.error('清理分析緩存失敗:', error);
      throw new Error('緩存清理失敗');
    }
  }

  // 健康檢查
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    checks: Record<string, any>;
    timestamp: Date;
  }> {
    try {
      const response = await apiService.get('/analytics/health');
      return response.data;
    } catch (error) {
      logger.error('分析服務健康檢查失敗:', error);
      throw new Error('健康檢查失敗');
    }
  }

  // 私有方法

  // 獲取緩存數據
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // 設置緩存數據
  private setCachedData(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // 清理本地緩存
  private clearLocalCache(pattern?: string): void {
    if (!pattern || pattern === '*') {
      this.cache.clear();
    } else {
      const keysToDelete = Array.from(this.cache.keys()).filter(key =>
        key.includes(pattern)
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  // 獲取緩存統計
  getCacheStats(): {
    size: number;
    keys: string[];
    memoryUsage: number;
    } {
    const keys = Array.from(this.cache.keys());
    const memoryUsage = JSON.stringify(Array.from(this.cache.entries())).length;

    return {
      size: this.cache.size,
      keys,
      memoryUsage
    };
  }

  // 預熱緩存
  async warmupCache(analyses: {
    type: string;
    parameters: Record<string, any>;
  }[]): Promise<void> {
    const promises = analyses.map(async ({ type, parameters }) => {
      try {
        switch (type) {
          case 'market_trends':
            await this.getMarketTrends(parameters);
            break;
          case 'portfolio_analysis':
            if (parameters.userId) {
              await this.getPortfolioAnalysis(parameters.userId, parameters);
            }
            break;
          case 'user_behavior':
            if (parameters.userId) {
              await this.getUserBehaviorAnalysis(parameters.userId, parameters);
            }
            break;
          case 'predictive':
            await this.getPredictiveAnalysis(parameters);
            break;
          case 'anomaly':
            await this.getAnomalyDetection(parameters);
            break;
          case 'correlation':
            await this.getCorrelationAnalysis(parameters);
            break;
          case 'segmentation':
            await this.getSegmentationAnalysis(parameters);
            break;
          case 'metrics':
            await this.getAnalyticsMetrics(parameters);
            break;
        }
      } catch (error) {
        logger.warn(`緩存預熱失敗 (${type}):`, error);
      }
    });

    await Promise.allSettled(promises);
    logger.info(`緩存預熱完成，處理了 ${analyses.length} 個分析`);
  }
}

// 創建單例實例
export const analyticsService = new AnalyticsService();
