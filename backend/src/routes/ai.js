const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const aiService = require('../services/aiService');
const { protect } = require('../middleware/auth');

/**
 * 智能卡片推薦
 */
router.post('/recommend/cards', protect, async (req, res) => {
  try {
    const { limit, categories, priceRange, rarity, excludeOwned } = req.body;
    const userId = req.user.id;

    const recommendations = await aiService.recommendCards(userId, {
      limit,
      categories,
      priceRange,
      rarity,
      excludeOwned
    });

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error('卡片推薦失敗:', error);
    res.status(500).json({
      success: false,
      error: '卡片推薦失敗',
      message: error.message
    });
  }
});

/**
 * 市場趨勢預測
 */
router.post('/predict/market', async (req, res) => {
  try {
    const { timeframe, categories } = req.body;

    const predictions = await aiService.predictMarketTrends({
      timeframe,
      categories
    });

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    logger.error('市場預測失敗:', error);
    res.status(500).json({
      success: false,
      error: '市場預測失敗',
      message: error.message
    });
  }
});

/**
 * 投資組合優化
 */
router.post('/optimize/portfolio', protect, async (req, res) => {
  try {
    const { riskTolerance, investmentGoal, timeHorizon } = req.body;
    const userId = req.user.id;

    const recommendations = await aiService.optimizePortfolio(userId, {
      riskTolerance,
      investmentGoal,
      timeHorizon
    });

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error('投資組合優化失敗:', error);
    res.status(500).json({
      success: false,
      error: '投資組合優化失敗',
      message: error.message
    });
  }
});

/**
 * 智能搜索
 */
router.post('/search/intelligent', async (req, res) => {
  try {
    const { query, searchType, filters, limit } = req.body;

    const results = await aiService.intelligentSearch(query, {
      searchType,
      filters,
      limit
    });

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('智能搜索失敗:', error);
    res.status(500).json({
      success: false,
      error: '智能搜索失敗',
      message: error.message
    });
  }
});

/**
 * 自然語言處理
 */
router.post('/nlp/process', async (req, res) => {
  try {
    const { text, task, language } = req.body;

    const result = await aiService.processNaturalLanguage(text, {
      task,
      language
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('自然語言處理失敗:', error);
    res.status(500).json({
      success: false,
      error: '自然語言處理失敗',
      message: error.message
    });
  }
});

/**
 * 智能通知
 */
router.post('/notifications/smart', protect, async (req, res) => {
  try {
    const { notificationTypes, maxNotifications } = req.body;
    const userId = req.user.id;

    const notifications = await aiService.generateSmartNotifications(userId, {
      notificationTypes,
      maxNotifications
    });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    logger.error('智能通知生成失敗:', error);
    res.status(500).json({
      success: false,
      error: '智能通知生成失敗',
      message: error.message
    });
  }
});

/**
 * 聊天機器人
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context, model, maxTokens, temperature } = req.body;

    const response = await aiService.chatBot(message, context, {
      model,
      maxTokens,
      temperature
    });

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('聊天機器人失敗:', error);
    res.status(500).json({
      success: false,
      error: '聊天機器人失敗',
      message: error.message
    });
  }
});

/**
 * 獲取AI服務指標
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = aiService.getMetrics();

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('獲取AI指標失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取AI指標失敗',
      message: error.message
    });
  }
});

/**
 * AI服務健康檢查
 */
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.healthCheck();

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('AI健康檢查失敗:', error);
    res.status(500).json({
      success: false,
      error: 'AI健康檢查失敗',
      message: error.message
    });
  }
});

/**
 * 更新AI配置
 */
router.put('/config', protect, async (req, res) => {
  try {
    const { openai, cache, rateLimit } = req.body;

    aiService.updateConfig({
      openai,
      cache,
      rateLimit
    });

    res.json({
      success: true,
      data: {
        message: 'AI配置已更新',
        config: aiService.getConfig()
      }
    });
  } catch (error) {
    logger.error('更新AI配置失敗:', error);
    res.status(500).json({
      success: false,
      error: '更新AI配置失敗',
      message: error.message
    });
  }
});

/**
 * 獲取AI配置
 */
router.get('/config', async (req, res) => {
  try {
    const config = aiService.getConfig();

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('獲取AI配置失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取AI配置失敗',
      message: error.message
    });
  }
});

/**
 * 批量AI操作
 */
router.post('/batch', async (req, res) => {
  try {
    const { operations } = req.body;

    if (!Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: '操作必須是數組'
      });
    }

    const results = [];

    for (const operation of operations) {
      try {
        const { type, params } = operation;
        let result;

        switch (type) {
          case 'recommendCards':
            result = await aiService.recommendCards(params.userId, params.options);
            break;
          case 'predictMarketTrends':
            result = await aiService.predictMarketTrends(params.options);
            break;
          case 'optimizePortfolio':
            result = await aiService.optimizePortfolio(params.userId, params.options);
            break;
          case 'intelligentSearch':
            result = await aiService.intelligentSearch(params.query, params.options);
            break;
          case 'processNaturalLanguage':
            result = await aiService.processNaturalLanguage(params.text, params.options);
            break;
          case 'chatBot':
            result = await aiService.chatBot(params.message, params.context, params.options);
            break;
          default:
            throw new Error(`不支持的AI操作類型: ${type}`);
        }

        results.push({
          operation: type,
          status: 'success',
          data: result
        });
      } catch (error) {
        results.push({
          operation: operation.type,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: operations.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'error').length
        }
      }
    });
  } catch (error) {
    logger.error('批量AI操作失敗:', error);
    res.status(500).json({
      success: false,
      error: '批量AI操作失敗',
      message: error.message
    });
  }
});

/**
 * AI模型信息
 */
router.get('/models', async (req, res) => {
  try {
    const models = [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: '快速且經濟的對話模型',
        maxTokens: 4096,
        capabilities: ['chat', 'completion', 'analysis']
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: '最先進的語言模型',
        maxTokens: 8192,
        capabilities: ['chat', 'completion', 'analysis', 'reasoning']
      },
      {
        id: 'text-davinci-003',
        name: 'Text Davinci 003',
        description: '強大的文本生成模型',
        maxTokens: 4097,
        capabilities: ['completion', 'analysis']
      }
    ];

    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    logger.error('獲取AI模型信息失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取AI模型信息失敗',
      message: error.message
    });
  }
});

/**
 * AI功能列表
 */
router.get('/features', async (req, res) => {
  try {
    const features = [
      {
        id: 'cardRecommendation',
        name: '智能卡片推薦',
        description: '基於用戶偏好和市場數據推薦卡片',
        endpoint: '/api/ai/recommend/cards',
        method: 'POST'
      },
      {
        id: 'marketPrediction',
        name: '市場趨勢預測',
        description: '預測卡片市場價格和趨勢',
        endpoint: '/api/ai/predict/market',
        method: 'POST'
      },
      {
        id: 'portfolioOptimization',
        name: '投資組合優化',
        description: '提供投資組合優化建議',
        endpoint: '/api/ai/optimize/portfolio',
        method: 'POST'
      },
      {
        id: 'intelligentSearch',
        name: '智能搜索',
        description: '理解用戶意圖的智能搜索',
        endpoint: '/api/ai/search/intelligent',
        method: 'POST'
      },
      {
        id: 'naturalLanguageProcessing',
        name: '自然語言處理',
        description: '文本分析、總結、情感分析等',
        endpoint: '/api/ai/nlp/process',
        method: 'POST'
      },
      {
        id: 'smartNotifications',
        name: '智能通知',
        description: '生成個性化的智能通知',
        endpoint: '/api/ai/notifications/smart',
        method: 'POST'
      },
      {
        id: 'chatBot',
        name: '聊天機器人',
        description: '智能對話助手',
        endpoint: '/api/ai/chat',
        method: 'POST'
      }
    ];

    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    logger.error('獲取AI功能列表失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取AI功能列表失敗',
      message: error.message
    });
  }
});

module.exports = router;
