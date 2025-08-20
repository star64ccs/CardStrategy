const { logger } = require('../utils/logger');
const redisConfig = require('../../config/redis');
const { OpenAI } = require('openai');
const { Configuration, OpenAIApi } = require('openai');

/**
 * AI服務
 * 提供智能推薦、預測分析、自然語言處理等功能
 */
class AIService {
  constructor() {
    this.openai = null;
    this.config = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7
      },
      cache: {
        enabled: true,
        ttl: 3600, // 1小時
        prefix: 'ai:'
      },
      rateLimit: {
        enabled: true,
        maxRequests: 100,
        windowMs: 15 * 60 * 1000 // 15分鐘
      }
    };

    this.metrics = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      avgResponseTime: 0,
      totalResponseTime: 0
    };

    this.initOpenAI();
  }

  /**
   * 初始化OpenAI
   */
  initOpenAI() {
    if (this.config.openai.apiKey) {
      try {
        const configuration = new Configuration({
          apiKey: this.config.openai.apiKey
        });
        this.openai = new OpenAIApi(configuration);
        logger.info('OpenAI 初始化成功');
      } catch (error) {
        logger.error('OpenAI 初始化失敗:', error);
      }
    } else {
      logger.warn('OpenAI API Key 未配置，AI功能將受限');
    }
  }

  /**
   * 智能卡片推薦
   */
  async recommendCards(userId, options = {}) {
    const {
      limit = 10,
      categories = [],
      priceRange = null,
      rarity = null,
      excludeOwned = true,
      useCache = true
    } = options;

    const cacheKey = `recommend:cards:${userId}:${JSON.stringify(options)}`;

    if (useCache) {
      const cached = await this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    try {
      // 獲取用戶數據
      const userData = await this.getUserData(userId);
      const marketData = await this.getMarketData();

      // 分析用戶偏好
      const userPreferences = await this.analyzeUserPreferences(userData);

      // 生成推薦
      const recommendations = await this.generateCardRecommendations(
        userPreferences,
        marketData,
        { limit, categories, priceRange, rarity, excludeOwned }
      );

      // 緩存結果
      if (useCache) {
        await this.cacheResult(cacheKey, recommendations);
      }

      this.recordMetrics('recommendCards', true);
      return recommendations;
    } catch (error) {
      logger.error('卡片推薦失敗:', error);
      this.recordMetrics('recommendCards', false);
      throw error;
    }
  }

  /**
   * 市場趨勢預測
   */
  async predictMarketTrends(options = {}) {
    const {
      timeframe = '7d',
      categories = [],
      useCache = true
    } = options;

    const cacheKey = `predict:market:${timeframe}:${JSON.stringify(categories)}`;

    if (useCache) {
      const cached = await this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    try {
      // 獲取歷史數據
      const historicalData = await this.getHistoricalMarketData(timeframe, categories);

      // 分析趨勢
      const trends = await this.analyzeMarketTrends(historicalData);

      // 生成預測
      const predictions = await this.generateMarketPredictions(trends, timeframe);

      // 緩存結果
      if (useCache) {
        await this.cacheResult(cacheKey, predictions);
      }

      this.recordMetrics('predictMarketTrends', true);
      return predictions;
    } catch (error) {
      logger.error('市場趨勢預測失敗:', error);
      this.recordMetrics('predictMarketTrends', false);
      throw error;
    }
  }

  /**
   * 投資組合優化建議
   */
  async optimizePortfolio(userId, options = {}) {
    const {
      riskTolerance = 'medium',
      investmentGoal = 'growth',
      timeHorizon = '5y',
      useCache = true
    } = options;

    const cacheKey = `optimize:portfolio:${userId}:${JSON.stringify(options)}`;

    if (useCache) {
      const cached = await this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    try {
      // 獲取投資組合數據
      const portfolio = await this.getPortfolioData(userId);
      const marketData = await this.getMarketData();

      // 分析風險和收益
      const analysis = await this.analyzePortfolioRisk(portfolio, marketData);

      // 生成優化建議
      const recommendations = await this.generatePortfolioRecommendations(
        analysis,
        { riskTolerance, investmentGoal, timeHorizon }
      );

      // 緩存結果
      if (useCache) {
        await this.cacheResult(cacheKey, recommendations);
      }

      this.recordMetrics('optimizePortfolio', true);
      return recommendations;
    } catch (error) {
      logger.error('投資組合優化失敗:', error);
      this.recordMetrics('optimizePortfolio', false);
      throw error;
    }
  }

  /**
   * 智能搜索
   */
  async intelligentSearch(query, options = {}) {
    const {
      searchType = 'cards',
      filters = {},
      limit = 20,
      useCache = true
    } = options;

    const cacheKey = `search:${searchType}:${query}:${JSON.stringify(filters)}`;

    if (useCache) {
      const cached = await this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    try {
      // 解析查詢意圖
      const intent = await this.parseSearchIntent(query);

      // 擴展查詢
      const expandedQuery = await this.expandSearchQuery(query, intent);

      // 執行搜索
      const results = await this.executeSearch(expandedQuery, {
        searchType,
        filters,
        limit
      });

      // 智能排序
      const rankedResults = await this.rankSearchResults(results, intent);

      // 緩存結果
      if (useCache) {
        await this.cacheResult(cacheKey, rankedResults);
      }

      this.recordMetrics('intelligentSearch', true);
      return rankedResults;
    } catch (error) {
      logger.error('智能搜索失敗:', error);
      this.recordMetrics('intelligentSearch', false);
      throw error;
    }
  }

  /**
   * 自然語言處理
   */
  async processNaturalLanguage(text, options = {}) {
    const {
      task = 'analyze',
      language = 'zh',
      useCache = true
    } = options;

    const cacheKey = `nlp:${task}:${language}:${this.hashString(text)}`;

    if (useCache) {
      const cached = await this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    try {
      let result;

      switch (task) {
        case 'analyze':
          result = await this.analyzeText(text, language);
          break;
        case 'summarize':
          result = await this.summarizeText(text, language);
          break;
        case 'sentiment':
          result = await this.analyzeSentiment(text, language);
          break;
        case 'extract':
          result = await this.extractEntities(text, language);
          break;
        default:
          throw new Error(`不支持的NLP任務: ${task}`);
      }

      // 緩存結果
      if (useCache) {
        await this.cacheResult(cacheKey, result);
      }

      this.recordMetrics('processNaturalLanguage', true);
      return result;
    } catch (error) {
      logger.error('自然語言處理失敗:', error);
      this.recordMetrics('processNaturalLanguage', false);
      throw error;
    }
  }

  /**
   * 智能通知
   */
  async generateSmartNotifications(userId, options = {}) {
    const {
      notificationTypes = ['price', 'trend', 'portfolio'],
      maxNotifications = 5,
      useCache = true
    } = options;

    const cacheKey = `notifications:${userId}:${JSON.stringify(notificationTypes)}`;

    if (useCache) {
      const cached = await this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    try {
      const notifications = [];

      // 價格變動通知
      if (notificationTypes.includes('price')) {
        const priceNotifications = await this.generatePriceNotifications(userId);
        notifications.push(...priceNotifications);
      }

      // 趨勢通知
      if (notificationTypes.includes('trend')) {
        const trendNotifications = await this.generateTrendNotifications(userId);
        notifications.push(...trendNotifications);
      }

      // 投資組合通知
      if (notificationTypes.includes('portfolio')) {
        const portfolioNotifications = await this.generatePortfolioNotifications(userId);
        notifications.push(...portfolioNotifications);
      }

      // 智能排序和過濾
      const smartNotifications = await this.rankNotifications(notifications, userId);
      const finalNotifications = smartNotifications.slice(0, maxNotifications);

      // 緩存結果
      if (useCache) {
        await this.cacheResult(cacheKey, finalNotifications);
      }

      this.recordMetrics('generateSmartNotifications', true);
      return finalNotifications;
    } catch (error) {
      logger.error('智能通知生成失敗:', error);
      this.recordMetrics('generateSmartNotifications', false);
      throw error;
    }
  }

  /**
   * 聊天機器人
   */
  async chatBot(message, context = {}, options = {}) {
    const {
      model = this.config.openai.model,
      maxTokens = this.config.openai.maxTokens,
      temperature = this.config.openai.temperature,
      useCache = true
    } = options;

    const cacheKey = `chat:${this.hashString(message + JSON.stringify(context))}`;

    if (useCache) {
      const cached = await this.getCachedResult(cacheKey);
      if (cached) return cached;
    }

    try {
      if (!this.openai) {
        throw new Error('OpenAI 未初始化');
      }

      // 構建系統提示
      const systemPrompt = this.buildSystemPrompt(context);

      // 發送請求到OpenAI
      const response = await this.openai.createChatCompletion({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: maxTokens,
        temperature
      });

      const reply = response.data.choices[0].message.content;

      // 緩存結果
      if (useCache) {
        await this.cacheResult(cacheKey, { reply, context });
      }

      this.recordMetrics('chatBot', true);
      return { reply, context };
    } catch (error) {
      logger.error('聊天機器人失敗:', error);
      this.recordMetrics('chatBot', false);
      throw error;
    }
  }

  /**
   * 獲取緩存結果
   */
  async getCachedResult(key) {
    if (!this.config.cache.enabled) return null;

    try {
      const redisClient = redisConfig.getClient();
      const cached = await redisClient.get(this.config.cache.prefix + key);
      if (cached) {
        this.metrics.cacheHits++;
        return JSON.parse(cached);
      }
      this.metrics.cacheMisses++;
      return null;
    } catch (error) {
      logger.error('獲取緩存失敗:', error);
      return null;
    }
  }

  /**
   * 緩存結果
   */
  async cacheResult(key, data) {
    if (!this.config.cache.enabled) return;

    try {
      const redisClient = redisConfig.getClient();
      await redisClient.setEx(
        this.config.cache.prefix + key,
        this.config.cache.ttl,
        JSON.stringify(data)
      );
    } catch (error) {
      logger.error('緩存結果失敗:', error);
    }
  }

  /**
   * 記錄指標
   */
  recordMetrics(operation, success) {
    this.metrics.requests++;
    if (!success) {
      this.metrics.errors++;
    }
  }

  /**
   * 獲取指標
   */
  getMetrics() {
    return {
      ...this.metrics,
      errorRate: this.metrics.requests > 0 ?
        (this.metrics.errors / this.metrics.requests) * 100 : 0,
      cacheHitRate: this.metrics.requests > 0 ?
        (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 : 0
    };
  }

  /**
   * 字符串哈希
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 構建系統提示
   */
  buildSystemPrompt(context) {
    return `你是一個專業的卡片交易助手，專門幫助用戶進行卡片投資和交易決策。

你的主要功能包括：
1. 提供卡片投資建議
2. 分析市場趨勢
3. 回答關於卡片交易的問題
4. 解釋投資策略

請根據用戶的問題提供專業、準確的回答。如果涉及投資建議，請提醒用戶投資有風險。

當前上下文：${JSON.stringify(context)}`;
  }

  /**
   * 獲取用戶數據
   */
  async getUserData(userId) {
    // 這裡應該從數據庫獲取用戶數據
    // 暫時返回模擬數據
    return {
      userId,
      preferences: {
        categories: ['gaming', 'collectible'],
        priceRange: { min: 10, max: 1000 },
        riskTolerance: 'medium'
      },
      history: {
        purchases: [],
        views: [],
        searches: []
      }
    };
  }

  /**
   * 獲取市場數據
   */
  async getMarketData() {
    // 這裡應該從數據庫獲取市場數據
    // 暫時返回模擬數據
    return {
      trends: [],
      prices: [],
      volumes: []
    };
  }

  /**
   * 分析用戶偏好
   */
  async analyzeUserPreferences(userData) {
    // 分析用戶偏好邏輯
    return {
      preferredCategories: userData.preferences.categories,
      priceSensitivity: 'medium',
      riskProfile: userData.preferences.riskTolerance
    };
  }

  /**
   * 生成卡片推薦
   */
  async generateCardRecommendations(preferences, marketData, options) {
    // 生成推薦邏輯
    return [
      {
        cardId: '1',
        name: '推薦卡片1',
        reason: '符合您的偏好',
        confidence: 0.85
      }
    ];
  }

  /**
   * 獲取歷史市場數據
   */
  async getHistoricalMarketData(timeframe, categories) {
    // 獲取歷史數據邏輯
    return [];
  }

  /**
   * 分析市場趨勢
   */
  async analyzeMarketTrends(historicalData) {
    // 分析趨勢邏輯
    return {
      overallTrend: 'up',
      volatility: 'medium',
      confidence: 0.75
    };
  }

  /**
   * 生成市場預測
   */
  async generateMarketPredictions(trends, timeframe) {
    // 生成預測邏輯
    return {
      prediction: '價格可能上漲',
      confidence: trends.confidence,
      timeframe
    };
  }

  /**
   * 獲取投資組合數據
   */
  async getPortfolioData(userId) {
    // 獲取投資組合數據邏輯
    return {
      cards: [],
      totalValue: 0,
      performance: 0
    };
  }

  /**
   * 分析投資組合風險
   */
  async analyzePortfolioRisk(portfolio, marketData) {
    // 分析風險邏輯
    return {
      riskLevel: 'medium',
      diversification: 'good',
      volatility: 'low'
    };
  }

  /**
   * 生成投資組合建議
   */
  async generatePortfolioRecommendations(analysis, options) {
    // 生成建議邏輯
    return [
      {
        type: 'buy',
        cardId: '1',
        reason: '改善投資組合多樣性',
        confidence: 0.8
      }
    ];
  }

  /**
   * 解析搜索意圖
   */
  async parseSearchIntent(query) {
    // 解析意圖邏輯
    return {
      intent: 'search',
      entities: [],
      confidence: 0.9
    };
  }

  /**
   * 擴展搜索查詢
   */
  async expandSearchQuery(query, intent) {
    // 擴展查詢邏輯
    return query;
  }

  /**
   * 執行搜索
   */
  async executeSearch(query, options) {
    // 執行搜索邏輯
    return [];
  }

  /**
   * 排序搜索結果
   */
  async rankSearchResults(results, intent) {
    // 排序邏輯
    return results;
  }

  /**
   * 分析文本
   */
  async analyzeText(text, language) {
    // 文本分析邏輯
    return {
      sentiment: 'positive',
      keywords: [],
      summary: text.substring(0, 100)
    };
  }

  /**
   * 總結文本
   */
  async summarizeText(text, language) {
    // 文本總結邏輯
    return text.substring(0, 200);
  }

  /**
   * 分析情感
   */
  async analyzeSentiment(text, language) {
    // 情感分析邏輯
    return {
      sentiment: 'positive',
      confidence: 0.8
    };
  }

  /**
   * 提取實體
   */
  async extractEntities(text, language) {
    // 實體提取邏輯
    return {
      entities: [],
      types: []
    };
  }

  /**
   * 生成價格通知
   */
  async generatePriceNotifications(userId) {
    // 生成價格通知邏輯
    return [];
  }

  /**
   * 生成趨勢通知
   */
  async generateTrendNotifications(userId) {
    // 生成趨勢通知邏輯
    return [];
  }

  /**
   * 生成投資組合通知
   */
  async generatePortfolioNotifications(userId) {
    // 生成投資組合通知邏輯
    return [];
  }

  /**
   * 排序通知
   */
  async rankNotifications(notifications, userId) {
    // 排序通知邏輯
    return notifications;
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    logger.info('AI服務配置已更新:', newConfig);
  }

  /**
   * 獲取配置
   */
  getConfig() {
    return this.config;
  }

  /**
   * 健康檢查
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    try {
      // 檢查OpenAI連接
      if (this.openai) {
        health.checks.openai = 'healthy';
      } else {
        health.checks.openai = 'unavailable';
        health.status = 'degraded';
      }

      // 檢查Redis連接
      const redisClient = redisConfig.getClient();
      await redisClient.ping();
      health.checks.redis = 'healthy';

      // 檢查指標
      const metrics = this.getMetrics();
      if (metrics.errorRate > 10) {
        health.checks.metrics = 'warning';
        health.status = 'degraded';
      } else {
        health.checks.metrics = 'healthy';
      }

      return health;
    } catch (error) {
      health.status = 'unhealthy';
      health.error = error.message;
      return health;
    }
  }
}

// 創建單例實例
const aiService = new AIService();

module.exports = aiService;
