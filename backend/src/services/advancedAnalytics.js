const { Op } = require('sequelize');
const { Card, Transaction, User, Portfolio, MarketData } = require('../models');
const { redis } = require('../config/database');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

// 分析配置
const ANALYTICS_CONFIG = {
  cacheTTL: 3600, // 1小時緩存
  maxDataPoints: 1000,
  defaultTimeframe: '30d',
  batchSize: 100,
};

// 分析類型
const ANALYSIS_TYPES = {
  TREND: 'trend',
  CORRELATION: 'correlation',
  PREDICTION: 'prediction',
  SEGMENTATION: 'segmentation',
  ANOMALY: 'anomaly',
  FORECAST: 'forecast',
};

// 報告類型
const REPORT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
};

class AdvancedAnalyticsService {
  constructor() {
    this.cache = redis;
    this.config = ANALYTICS_CONFIG;
  }

  // 獲取市場趨勢分析
  async getMarketTrends(options = {}) {
    const {
      timeframe = '30d',
      categories = [],
      limit = 50,
      useCache = true,
    } = options;

    const cacheKey = `market_trends:${timeframe}:${categories.join(',')}:${limit}`;

    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    try {
      const endDate = new Date();
      const startDate = this.getStartDate(timeframe);

      const whereClause = {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      };

      if (categories.length > 0) {
        whereClause.category = { [Op.in]: categories };
      }

      const transactions = await Transaction.findAll({
        where: whereClause,
        include: [
          { model: Card, as: 'card' },
          { model: User, as: 'buyer' },
          { model: User, as: 'seller' },
        ],
        order: [['createdAt', 'ASC']],
        limit: this.config.maxDataPoints,
      });

      const trends = this.analyzeTrends(transactions, timeframe);
      const insights = this.generateInsights(trends);

// eslint-disable-next-line no-unused-vars
      const result = {
        timeframe,
        categories,
        trends,
        insights,
        summary: this.generateSummary(trends),
        generatedAt: new Date(),
      };

      if (useCache) {
        await this.cache.setex(
          cacheKey,
          this.config.cacheTTL,
          JSON.stringify(result)
        );
      }

      return result;
    } catch (error) {
      logger.error('獲取市場趨勢分析失敗:', error);
      throw new Error('市場趨勢分析失敗');
    }
  }

  // 獲取投資組合分析
  async getPortfolioAnalysis(userId, options = {}) {
    const {
      timeframe = '30d',
      includeTransactions = true,
      includePerformance = true,
      useCache = true,
    } = options;

    const cacheKey = `portfolio_analysis:${userId}:${timeframe}`;

    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    try {
      const portfolio = await Portfolio.findOne({
        where: { userId },
        include: [
          { model: Card, as: 'cards' },
          { model: Transaction, as: 'transactions' },
        ],
      });

      if (!portfolio) {
        throw new Error('投資組合不存在');
      }

      const analysis = {
        portfolio: {
          id: portfolio.id,
          name: portfolio.name,
          totalValue: 0,
          totalCards: portfolio.cards.length,
          diversification: this.calculateDiversification(portfolio.cards),
          riskMetrics: this.calculateRiskMetrics(portfolio.cards),
        },
        performance: includePerformance
          ? await this.calculatePerformance(userId, timeframe)
          : null,
        transactions: includeTransactions
          ? await this.getTransactionHistory(userId, timeframe)
          : null,
        recommendations: await this.generatePortfolioRecommendations(portfolio),
        generatedAt: new Date(),
      };

      if (useCache) {
        await this.cache.setex(
          cacheKey,
          this.config.cacheTTL,
          JSON.stringify(analysis)
        );
      }

      return analysis;
    } catch (error) {
      logger.error('獲取投資組合分析失敗:', error);
      throw new Error('投資組合分析失敗');
    }
  }

  // 獲取用戶行為分析
  async getUserBehaviorAnalysis(userId, options = {}) {
    const {
      timeframe = '30d',
      includePatterns = true,
      includePredictions = true,
      useCache = true,
    } = options;

    const cacheKey = `user_behavior:${userId}:${timeframe}`;

    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    try {
// eslint-disable-next-line no-unused-vars
      const user = await User.findByPk(userId, {
        include: [
          { model: Transaction, as: 'buyerTransactions' },
          { model: Transaction, as: 'sellerTransactions' },
          { model: Portfolio, as: 'portfolios' },
        ],
      });

      if (!user) {
        throw new Error('用戶不存在');
      }

      const behavior = {
        user: {
          id: user.id,
          username: user.username,
          joinDate: user.createdAt,
          totalTransactions:
            user.buyerTransactions.length + user.sellerTransactions.length,
        },
        patterns: includePatterns ? this.analyzeUserPatterns(user) : null,
        predictions: includePredictions
          ? await this.predictUserBehavior(userId)
          : null,
        insights: this.generateUserInsights(user),
        generatedAt: new Date(),
      };

      if (useCache) {
        await this.cache.setex(
          cacheKey,
          this.config.cacheTTL,
          JSON.stringify(behavior)
        );
      }

      return behavior;
    } catch (error) {
      logger.error('獲取用戶行為分析失敗:', error);
      throw new Error('用戶行為分析失敗');
    }
  }

  // 生成綜合報告
  async generateComprehensiveReport(options = {}) {
    const {
      reportType = REPORT_TYPES.MONTHLY,
      startDate,
      endDate,
      includeCharts = true,
      includeRecommendations = true,
      format = 'json',
    } = options;

    try {
      const dateRange = this.getDateRange(reportType, startDate, endDate);

      const report = {
        metadata: {
          reportType,
          dateRange,
          generatedAt: new Date(),
          version: '1.0',
        },
        executive: await this.generateExecutiveSummary(dateRange),
        market: await this.generateMarketReport(dateRange),
        user: await this.generateUserReport(dateRange),
        financial: await this.generateFinancialReport(dateRange),
        technical: await this.generateTechnicalReport(dateRange),
        charts: includeCharts ? await this.generateCharts(dateRange) : null,
        recommendations: includeRecommendations
          ? await this.generateRecommendations(dateRange)
          : null,
      };

      return format === 'json' ? report : this.formatReport(report, format);
    } catch (error) {
      logger.error('生成綜合報告失敗:', error);
      throw new Error('報告生成失敗');
    }
  }

  // 獲取預測分析
  async getPredictiveAnalysis(options = {}) {
    const {
      target = 'price',
      timeframe = '7d',
      confidence = 0.8,
      useCache = true,
    } = options;

    const cacheKey = `predictive:${target}:${timeframe}:${confidence}`;

    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    try {
// eslint-disable-next-line no-unused-vars
      const predictions = await this.generatePredictions(
        target,
        timeframe,
        confidence
      );

// eslint-disable-next-line no-unused-vars
      const result = {
        target,
        timeframe,
        confidence,
        predictions,
        accuracy: await this.calculatePredictionAccuracy(target),
        factors: this.identifyKeyFactors(target),
        generatedAt: new Date(),
      };

      if (useCache) {
        await this.cache.setex(
          cacheKey,
          this.config.cacheTTL,
          JSON.stringify(result)
        );
      }

      return result;
    } catch (error) {
      logger.error('獲取預測分析失敗:', error);
      throw new Error('預測分析失敗');
    }
  }

  // 獲取異常檢測
  async getAnomalyDetection(options = {}) {
    const {
      type = 'price',
      sensitivity = 'medium',
      timeframe = '24h',
      useCache = true,
    } = options;

    const cacheKey = `anomaly:${type}:${sensitivity}:${timeframe}`;

    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    try {
      const anomalies = await this.detectAnomalies(
        type,
        sensitivity,
        timeframe
      );

// eslint-disable-next-line no-unused-vars
      const result = {
        type,
        sensitivity,
        timeframe,
        anomalies,
        totalDetected: anomalies.length,
        severity: this.calculateAnomalySeverity(anomalies),
        generatedAt: new Date(),
      };

      if (useCache) {
        await this.cache.setex(
          cacheKey,
          this.config.cacheTTL,
          JSON.stringify(result)
        );
      }

      return result;
    } catch (error) {
      logger.error('獲取異常檢測失敗:', error);
      throw new Error('異常檢測失敗');
    }
  }

  // 獲取相關性分析
  async getCorrelationAnalysis(options = {}) {
    const {
      variables = ['price', 'volume', 'demand'],
      timeframe = '30d',
      method = 'pearson',
      useCache = true,
    } = options;

    const cacheKey = `correlation:${variables.join(',')}:${timeframe}:${method}`;

    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    try {
      const correlations = await this.calculateCorrelations(
        variables,
        timeframe,
        method
      );

// eslint-disable-next-line no-unused-vars
      const result = {
        variables,
        timeframe,
        method,
        correlations,
        significant: this.identifySignificantCorrelations(correlations),
        insights: this.generateCorrelationInsights(correlations),
        generatedAt: new Date(),
      };

      if (useCache) {
        await this.cache.setex(
          cacheKey,
          this.config.cacheTTL,
          JSON.stringify(result)
        );
      }

      return result;
    } catch (error) {
      logger.error('獲取相關性分析失敗:', error);
      throw new Error('相關性分析失敗');
    }
  }

  // 獲取分段分析
  async getSegmentationAnalysis(options = {}) {
    const {
      dimension = 'user',
      criteria = ['activity', 'value', 'preference'],
      segments = 5,
      useCache = true,
    } = options;

    const cacheKey = `segmentation:${dimension}:${criteria.join(',')}:${segments}`;

    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    try {
      const segments = await this.performSegmentation(
        dimension,
        criteria,
        segments
      );

// eslint-disable-next-line no-unused-vars
      const result = {
        dimension,
        criteria,
        segments,
        characteristics: this.analyzeSegmentCharacteristics(segments),
        recommendations: this.generateSegmentRecommendations(segments),
        generatedAt: new Date(),
      };

      if (useCache) {
        await this.cache.setex(
          cacheKey,
          this.config.cacheTTL,
          JSON.stringify(result)
        );
      }

      return result;
    } catch (error) {
      logger.error('獲取分段分析失敗:', error);
      throw new Error('分段分析失敗');
    }
  }

  // 獲取分析指標
  async getAnalyticsMetrics(options = {}) {
    const {
      timeframe = '24h',
      includeTrends = true,
      useCache = true,
    } = options;

    const cacheKey = `analytics_metrics:${timeframe}`;

    if (useCache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    try {
      const metrics = {
        overview: await this.getOverviewMetrics(timeframe),
        performance: await this.getPerformanceMetrics(timeframe),
        user: await this.getUserMetrics(timeframe),
        market: await this.getMarketMetrics(timeframe),
        trends: includeTrends ? await this.getTrendMetrics(timeframe) : null,
        generatedAt: new Date(),
      };

      if (useCache) {
        await this.cache.setex(
          cacheKey,
          this.config.cacheTTL,
          JSON.stringify(metrics)
        );
      }

      return metrics;
    } catch (error) {
      logger.error('獲取分析指標失敗:', error);
      throw new Error('分析指標獲取失敗');
    }
  }

  // 清理分析緩存
  async clearAnalyticsCache(pattern = '*') {
    try {
// eslint-disable-next-line no-unused-vars
      const keys = await this.cache.keys(`analytics:${pattern}`);
      if (keys.length > 0) {
        await this.cache.del(...keys);
        logger.info(`清理了 ${keys.length} 個分析緩存鍵`);
      }
      return { cleared: keys.length };
    } catch (error) {
      logger.error('清理分析緩存失敗:', error);
      throw new Error('緩存清理失敗');
    }
  }

  // 健康檢查
  async healthCheck() {
    try {
// eslint-disable-next-line no-unused-vars
      const checks = {
        database: await this.checkDatabaseConnection(),
        cache: await this.checkCacheConnection(),
        models: await this.checkModelAvailability(),
        performance: await this.checkPerformance(),
      };

      const isHealthy = Object.values(checks).every(
        (check) => check.status === 'healthy'
      );

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        checks,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('分析服務健康檢查失敗:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  // 私有方法

  // 獲取開始日期
  getStartDate(timeframe) {
// eslint-disable-next-line no-unused-vars
    const now = new Date();
    switch (timeframe) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // 分析趨勢
  analyzeTrends(transactions, timeframe) {
    // 實現趨勢分析邏輯
    const trends = {
      price: this.analyzePriceTrends(transactions),
      volume: this.analyzeVolumeTrends(transactions),
      demand: this.analyzeDemandTrends(transactions),
    };

    return trends;
  }

  // 生成洞察
  generateInsights(trends) {
    const insights = [];

    // 價格洞察
    if (trends.price.direction === 'up' && trends.price.change > 10) {
      insights.push({
        type: 'price_surge',
        message: '價格顯著上漲，建議關注市場動態',
        severity: 'high',
        confidence: 0.85,
      });
    }

    // 交易量洞察
    if (trends.volume.change > 50) {
      insights.push({
        type: 'volume_spike',
        message: '交易量激增，可能存在市場機會',
        severity: 'medium',
        confidence: 0.75,
      });
    }

    return insights;
  }

  // 生成摘要
  generateSummary(trends) {
    return {
      overallDirection: this.calculateOverallDirection(trends),
      keyMetrics: this.extractKeyMetrics(trends),
    };
  }

  // 計算多樣化程度
  calculateDiversification(cards) {
    const categories = cards.reduce((acc, card) => {
      acc[card.category] = (acc[card.category] || 0) + 1;
      return acc;
    }, {});

    const totalCards = cards.length;
    const diversity = Object.keys(categories).length / totalCards;

    return {
      score: diversity,
      categories: Object.keys(categories),
      distribution: categories,
    };
  }

  // 計算風險指標
  calculateRiskMetrics(cards) {
// eslint-disable-next-line no-unused-vars
    const prices = cards.map((card) => card.currentPrice || 0);
    const volatility = this.calculateVolatility(prices);
    const maxDrawdown = this.calculateMaxDrawdown(prices);

    return {
      volatility,
      maxDrawdown,
      riskScore: (volatility + maxDrawdown) / 2,
      riskLevel: this.getRiskLevel(volatility + maxDrawdown),
    };
  }

  // 計算性能
  async calculatePerformance(userId, timeframe) {
    // 實現性能計算邏輯
    return {
      totalReturn: 0.15,
      annualizedReturn: 0.18,
      sharpeRatio: 1.2,
      maxDrawdown: -0.08,
    };
  }

  // 獲取交易歷史
  async getTransactionHistory(userId, timeframe) {
    const startDate = this.getStartDate(timeframe);

    return await Transaction.findAll({
      where: {
        [Op.or]: [{ buyerId: userId }, { sellerId: userId }],
        createdAt: {
          [Op.gte]: startDate,
        },
      },
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
  }

  // 生成投資組合建議
  async generatePortfolioRecommendations(portfolio) {
// eslint-disable-next-line no-unused-vars
    const recommendations = [];

    // 多樣化建議
    if (portfolio.cards.length < 5) {
      recommendations.push({
        type: 'diversification',
        message: '建議增加卡片數量以提高多樣化',
        priority: 'high',
        action: 'add_cards',
      });
    }

    // 風險管理建議
    const highValueCards = portfolio.cards.filter(
      (card) => card.currentPrice > 1000
    );
    if (highValueCards.length > portfolio.cards.length * 0.3) {
      recommendations.push({
        type: 'risk_management',
        message: '高價值卡片佔比過高，建議分散風險',
        priority: 'medium',
        action: 'rebalance',
      });
    }

    return recommendations;
  }

  // 分析用戶模式
  analyzeUserPatterns(user) {
// eslint-disable-next-line no-unused-vars
    const patterns = {
      tradingFrequency: this.calculateTradingFrequency(user),
      preferredCategories: this.identifyPreferredCategories(user),
      tradingTimes: this.analyzeTradingTimes(user),
      priceRange: this.analyzePriceRange(user),
    };

    return patterns;
  }

  // 預測用戶行為
  async predictUserBehavior(userId) {
    // 實現用戶行為預測邏輯
    return {
      nextPurchase: {
        probability: 0.75,
        timeframe: '7d',
        estimatedAmount: 500,
      },
      churnRisk: {
        probability: 0.15,
        factors: ['inactivity', 'low_engagement'],
      },
    };
  }

  // 生成用戶洞察
  generateUserInsights(user) {
    const insights = [];

    const totalSpent = user.buyerTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const totalEarned = user.sellerTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    if (totalSpent > 10000) {
      insights.push({
        type: 'high_value_user',
        message: '高價值用戶，建議提供VIP服務',
        priority: 'high',
      });
    }

    return insights;
  }

  // 生成執行摘要
  async generateExecutiveSummary(dateRange) {
    return {
      totalTransactions: await this.getTotalTransactions(dateRange),
      totalVolume: await this.getTotalVolume(dateRange),
      activeUsers: await this.getActiveUsers(dateRange),
      topPerformers: await this.getTopPerformers(dateRange),
      keyInsights: await this.getKeyInsights(dateRange),
    };
  }

  // 生成市場報告
  async generateMarketReport(dateRange) {
    return {
      trends: await this.getMarketTrends({ timeframe: '30d' }),
      topCards: await this.getTopCards(dateRange),
      marketSentiment: await this.getMarketSentiment(dateRange),
      volatility: await this.getMarketVolatility(dateRange),
    };
  }

  // 生成用戶報告
  async generateUserReport(dateRange) {
    return {
      userGrowth: await this.getUserGrowth(dateRange),
      userEngagement: await this.getUserEngagement(dateRange),
      userSegments: await this.getUserSegments(dateRange),
      retention: await this.getUserRetention(dateRange),
    };
  }

  // 生成財務報告
  async generateFinancialReport(dateRange) {
    return {
      revenue: await this.getRevenue(dateRange),
      costs: await this.getCosts(dateRange),
      profit: await this.getProfit(dateRange),
      margins: await this.getMargins(dateRange),
    };
  }

  // 生成技術報告
  async generateTechnicalReport(dateRange) {
    return {
      performance: await this.getSystemPerformance(dateRange),
      errors: await this.getSystemErrors(dateRange),
      uptime: await this.getSystemUptime(dateRange),
      scalability: await this.getScalabilityMetrics(dateRange),
    };
  }

  // 生成圖表數據
  async generateCharts(dateRange) {
    return {
      priceChart: await this.getPriceChartData(dateRange),
      volumeChart: await this.getVolumeChartData(dateRange),
      userChart: await this.getUserChartData(dateRange),
      performanceChart: await this.getPerformanceChartData(dateRange),
    };
  }

  // 生成建議
    return {
      market: await this.getMarketRecommendations(dateRange),
      user: await this.getUserRecommendations(dateRange),
      technical: await this.getTechnicalRecommendations(dateRange),
      strategic: await this.getStrategicRecommendations(dateRange),
    };
  }

  // 生成預測
  async generatePredictions(target, timeframe, confidence) {
    // 實現預測邏輯
    return {
      predictions: [
        { date: new Date(), value: 100, confidence: 0.85 },
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          value: 105,
          confidence: 0.8,
        },
      ],
      model: 'time_series',
      accuracy: 0.82,
    };
  }

  // 檢測異常
  async detectAnomalies(type, sensitivity, timeframe) {
    // 實現異常檢測邏輯
    return [
      {
        id: 1,
        type: 'price_spike',
        cardId: 123,
        value: 1500,
        expected: 1000,
        severity: 'high',
        timestamp: new Date(),
      },
    ];
  }

  // 計算相關性
  async calculateCorrelations(variables, timeframe, method) {
    // 實現相關性計算邏輯
    return {
      'price-volume': 0.75,
      'price-demand': 0.6,
      'volume-demand': 0.45,
    };
  }

  // 執行分段
  async performSegmentation(dimension, criteria, segments) {
    // 實現分段邏輯
    return [
      {
        id: 1,
        name: '高價值用戶',
        size: 100,
        characteristics: { avgSpend: 5000, frequency: 'high' },
      },
    ];
  }

  // 檢查數據庫連接
  async checkDatabaseConnection() {
    try {
      await Card.findOne();
      return { status: 'healthy', message: '數據庫連接正常' };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: '數據庫連接失敗',
        error: error.message,
      };
    }
  }

  // 檢查緩存連接
  async checkCacheConnection() {
    try {
      await this.cache.ping();
      return { status: 'healthy', message: '緩存連接正常' };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: '緩存連接失敗',
        error: error.message,
      };
    }
  }

  // 檢查模型可用性
  async checkModelAvailability() {
    try {
// eslint-disable-next-line no-unused-vars
      const models = [Card, Transaction, User, Portfolio];
// eslint-disable-next-line no-unused-vars
      for (const model of models) {
        await model.findOne();
      }
      return { status: 'healthy', message: '所有模型可用' };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: '模型檢查失敗',
        error: error.message,
      };
    }
  }

  // 檢查性能
  async checkPerformance() {
    try {
      const startTime = Date.now();
      await Card.findOne();
// eslint-disable-next-line no-unused-vars
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 1000 ? 'healthy' : 'warning',
        message: `響應時間: ${responseTime}ms`,
        responseTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: '性能檢查失敗',
        error: error.message,
      };
    }
  }

  // 輔助方法
  calculateVolatility(prices) {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) /
      returns.length;

    return Math.sqrt(variance);
  }

  calculateMaxDrawdown(prices) {
    let maxDrawdown = 0;
    let peak = prices[0];

    for (const price of prices) {
      if (price > peak) {
        peak = price;
      }
      const drawdown = (peak - price) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  getRiskLevel(riskScore) {
    if (riskScore < 0.1) return 'low';
    if (riskScore < 0.3) return 'medium';
    return 'high';
  }

    const directions = Object.values(trends).map((t) => t.direction);
    const upCount = directions.filter((d) => d === 'up').length;
    const downCount = directions.filter((d) => d === 'down').length;

    if (upCount > downCount) return 'up';
    if (downCount > upCount) return 'down';
    return 'stable';
  }

    return {
      avgPriceChange: trends.price?.change || 0,
      avgVolumeChange: trends.volume?.change || 0,
      totalTransactions: trends.volume?.total || 0,
    };
  }

  calculateTradingFrequency(user) {
    const totalTransactions =
      user.buyerTransactions.length + user.sellerTransactions.length;
    const daysSinceJoin =
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    return totalTransactions / daysSinceJoin;
  }

  identifyPreferredCategories(user) {
    const categories = {};
    const allTransactions = [
      ...user.buyerTransactions,
      ...user.sellerTransactions,
    ];

    for (const transaction of allTransactions) {
      if (transaction.card && transaction.card.category) {
        categories[transaction.card.category] =
          (categories[transaction.card.category] || 0) + 1;
      }
    }

    return Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }

  analyzeTradingTimes(user) {
    const tradingHours = user.buyerTransactions.map((t) =>
      t.createdAt.getHours()
    );
    const hourCounts = tradingHours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const peakHour = Object.entries(hourCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      peakHour: parseInt(peakHour[0]),
      peakCount: peakHour[1],
      distribution: hourCounts,
    };
  }

  analyzePriceRange(user) {
// eslint-disable-next-line no-unused-vars
    const prices = user.buyerTransactions.map((t) => t.amount);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      median: this.calculateMedian(prices),
    };
  }

  calculateMedian(values) {
    const sorted = values.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  // 其他輔助方法...
  analyzePriceTrends(transactions) {
    // 實現價格趨勢分析
    return { direction: 'up', change: 5.2, total: transactions.length };
  }

  analyzeVolumeTrends(transactions) {
    // 實現交易量趨勢分析
    return { direction: 'up', change: 12.5, total: transactions.length };
  }

  analyzeDemandTrends(transactions) {
    // 實現需求趨勢分析
    return { direction: 'stable', change: 2.1, total: transactions.length };
  }

    // 實現整體方向計算
    return 'up';
  }

    // 實現關鍵指標提取
    return { avgChange: 6.6, totalTransactions: 1000 };
  }

    // 實現建議生成
    return ['關注價格上漲趨勢', '增加交易量監控'];
  }

  // 報告生成輔助方法
  async getTotalTransactions(dateRange) {
    return await Transaction.count({
      where: {
        createdAt: {
          [Op.between]: [dateRange.start, dateRange.end],
        },
      },
    });
  }

  async getTotalVolume(dateRange) {
// eslint-disable-next-line no-unused-vars
    const result = await Transaction.sum('amount', {
      where: {
        createdAt: {
          [Op.between]: [dateRange.start, dateRange.end],
        },
      },
    });
    return result || 0;
  }

  async getActiveUsers(dateRange) {
    return await User.count({
      include: [
        {
          model: Transaction,
          where: {
            createdAt: {
              [Op.between]: [dateRange.start, dateRange.end],
            },
          },
        },
      ],
    });
  }

  async getTopPerformers(dateRange) {
    // 實現頂級表現者查詢
    return [];
  }

  async getKeyInsights(dateRange) {
    // 實現關鍵洞察生成
    return ['市場活躍度提升', '用戶參與度增加'];
  }

  // 其他報告方法...
  async getTopCards(dateRange) {
    return [];
  }
  async getMarketSentiment(dateRange) {
    return 'positive';
  }
  async getMarketVolatility(dateRange) {
    return 0.15;
  }
  async getUserGrowth(dateRange) {
    return 0.25;
  }
  async getUserEngagement(dateRange) {
    return 0.75;
  }
  async getUserSegments(dateRange) {
    return [];
  }
  async getUserRetention(dateRange) {
    return 0.85;
  }
  async getRevenue(dateRange) {
    return 50000;
  }
  async getCosts(dateRange) {
    return 30000;
  }
  async getProfit(dateRange) {
    return 20000;
  }
  async getMargins(dateRange) {
    return 0.4;
  }
  async getSystemPerformance(dateRange) {
    return { uptime: 0.99, responseTime: 150 };
  }
  async getSystemErrors(dateRange) {
    return [];
  }
  async getSystemUptime(dateRange) {
    return 0.99;
  }
  async getScalabilityMetrics(dateRange) {
    return { load: 0.6, capacity: 0.8 };
  }
  async getPriceChartData(dateRange) {
    return [];
  }
  async getVolumeChartData(dateRange) {
    return [];
  }
  async getUserChartData(dateRange) {
    return [];
  }
  async getPerformanceChartData(dateRange) {
    return [];
  }
  async getMarketRecommendations(dateRange) {
    return [];
  }
  async getUserRecommendations(dateRange) {
    return [];
  }
  async getTechnicalRecommendations(dateRange) {
    return [];
  }
  async getStrategicRecommendations(dateRange) {
    return [];
  }
  async calculatePredictionAccuracy(target) {
    return 0.82;
  }
  identifyKeyFactors(target) {
    return ['price', 'volume', 'demand'];
  }
  calculateAnomalySeverity(anomalies) {
    return 'medium';
  }
  identifySignificantCorrelations(correlations) {
    return [];
  }
  generateCorrelationInsights(correlations) {
    return [];
  }
  analyzeSegmentCharacteristics(segments) {
    return {};
  }
  generateSegmentRecommendations(segments) {
    return [];
  }
  getOverviewMetrics(timeframe) {
    return {};
  }
  getPerformanceMetrics(timeframe) {
    return {};
  }
  getUserMetrics(timeframe) {
    return {};
  }
  getMarketMetrics(timeframe) {
    return {};
  }
  getTrendMetrics(timeframe) {
    return {};
  }
  getDateRange(reportType, startDate, endDate) {
// eslint-disable-next-line no-unused-vars
    const now = new Date();
    switch (reportType) {
      case REPORT_TYPES.DAILY:
        return {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: now,
        };
      case REPORT_TYPES.WEEKLY:
        return {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now,
        };
      case REPORT_TYPES.MONTHLY:
        return {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now,
        };
      case REPORT_TYPES.QUARTERLY:
        return {
          start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          end: now,
        };
      case REPORT_TYPES.YEARLY:
        return {
          start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
          end: now,
        };
      case REPORT_TYPES.CUSTOM:
        return { start: startDate || now, end: endDate || now };
      default:
        return {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now,
        };
    }
  }
  formatReport(report, format) {
    // 實現報告格式化
    return report;
  }
}

module.exports = new AdvancedAnalyticsService();
