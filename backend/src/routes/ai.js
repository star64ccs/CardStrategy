const express = require('express');
const router = express.Router();

const { logger } = require('../utils/logger');

const aiService = require('../services/aiService');

const { authenticateToken: protect } = require('../middleware/auth');

/**
 * ?�能?��??�薦
 */
router.post('/recommend/cards', protect, async (req, res) => {
  try {
    const { limit, categories, priceRange, rarity, excludeOwned } = req.body;
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

// eslint-disable-next-line no-unused-vars
    const recommendations = await aiService.recommendCards(userId, {
      limit,
      categories,
      priceRange,
      rarity,
      excludeOwned,
    });

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('?��??�薦失�?:', error);
    res.status(500).json({
      success: false,
      error: '?��??�薦失�?',
      message: error.message,
    });
  }
});

/**
 * 市場趨勢?�測
 */
router.post('/predict/market', async (req, res) => {
  try {
    const { timeframe, categories } = req.body;

// eslint-disable-next-line no-unused-vars
    const predictions = await aiService.predictMarketTrends({
      timeframe,
      categories,
    });

    res.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    logger.error('市場?�測失�?:', error);
    res.status(500).json({
      success: false,
      error: '市場?�測失�?',
      message: error.message,
    });
  }
});

/**
 * ?��?組�??��?
 */
router.post('/optimize/portfolio', protect, async (req, res) => {
  try {
    const { riskTolerance, investmentGoal, timeHorizon } = req.body;
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

// eslint-disable-next-line no-unused-vars
    const recommendations = await aiService.optimizePortfolio(userId, {
      riskTolerance,
      investmentGoal,
      timeHorizon,
    });

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    logger.error('?��?組�??��?失�?:', error);
    res.status(500).json({
      success: false,
      error: '?��?組�??��?失�?',
      message: error.message,
    });
  }
});

/**
 * ?�能?�索
 */
router.post('/search/intelligent', async (req, res) => {
  try {
    const { query, searchType, filters, limit } = req.body;

// eslint-disable-next-line no-unused-vars
    const results = await aiService.intelligentSearch(query, {
      searchType,
      filters,
      limit,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error('?�能?�索失�?:', error);
    res.status(500).json({
      success: false,
      error: '?�能?�索失�?',
      message: error.message,
    });
  }
});

/**
 * ?�然語�??��?
 */
router.post('/nlp/process', async (req, res) => {
  try {
    const { text, task, language } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await aiService.processNaturalLanguage(text, {
      task,
      language,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?�然語�??��?失�?:', error);
    res.status(500).json({
      success: false,
      error: '?�然語�??��?失�?',
      message: error.message,
    });
  }
});

/**
 * ?�能?�知
 */
router.post('/notifications/smart', protect, async (req, res) => {
  try {
    const { notificationTypes, maxNotifications } = req.body;
// eslint-disable-next-line no-unused-vars
    const userId = req.user.id;

// eslint-disable-next-line no-unused-vars
    const notifications = await aiService.generateSmartNotifications(userId, {
      notificationTypes,
      maxNotifications,
    });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    logger.error('?�能?�知?��?失�?:', error);
    res.status(500).json({
      success: false,
      error: '?�能?�知?��?失�?',
      message: error.message,
    });
  }
});

/**
 * ?�天機器�? */
router.post('/chat', async (req, res) => {
  try {
    const { message, context, model, maxTokens, temperature } = req.body;

// eslint-disable-next-line no-unused-vars
    const response = await aiService.chatBot(message, context, {
      model,
      maxTokens,
      temperature,
    });

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    logger.error('?�天機器人失??', error);
    res.status(500).json({
      success: false,
      error: '?�天機器人失??,
      message: error.message,
    });
  }
});

/**
 * ?��?AI?��??��?
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = aiService.getMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('?��?AI?��?失�?:', error);
    res.status(500).json({
      success: false,
      error: '?��?AI?��?失�?',
      message: error.message,
    });
  }
});

/**
 * AI?��??�康Check
 */
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.healthCheck();

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error('AI?�康檢查失�?:', error);
    res.status(500).json({
      success: false,
      error: 'AI?�康檢查失�?',
      message: error.message,
    });
  }
});

/**
 * ?�新AI?�置
 */
router.put('/config', protect, async (req, res) => {
  try {
    const { openai, cache, rateLimit } = req.body;

    aiService.updateConfig({
      openai,
      cache,
      rateLimit,
    });

    res.json({
      success: true,
      data: {
        message: 'AI?�置已更??,
        config: aiService.getConfig(),
      },
    });
  } catch (error) {
    logger.error('?�新AI?�置失�?:', error);
    res.status(500).json({
      success: false,
      error: '?�新AI?�置失�?',
      message: error.message,
    });
  }
});

/**
 * ?��?AI?�置
 */
router.get('/config', async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const config = aiService.getConfig();

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error('?��?AI?�置失�?:', error);
    res.status(500).json({
      success: false,
      error: '?��?AI?�置失�?',
      message: error.message,
    });
  }
});

/**
 * ?��?AI?��?
 */
router.post('/batch', async (req, res) => {
  try {
    const { operations } = req.body;

    if (!Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: '?��?必�??�數�?,
      });
    }
// eslint-disable-next-line no-unused-vars
    const results = [];

    for (const operation of operations) {
      try {
        const { type, params } = operation;
// eslint-disable-next-line no-unused-vars
        let result;

        switch (type) {
          case 'recommendCards':
            result = await aiService.recommendCards(
              params.userId,
              params.options
            );
            break;
          case 'predictMarketTrends':
            result = await aiService.predictMarketTrends(params.options);
            break;
          case 'optimizePortfolio':
            result = await aiService.optimizePortfolio(
              params.userId,
              params.options
            );
            break;
          case 'intelligentSearch':
            result = await aiService.intelligentSearch(
              params.query,
              params.options
            );
            break;
          case 'processNaturalLanguage':
            result = await aiService.processNaturalLanguage(
              params.text,
              params.options
            );
            break;
          case 'chatBot':
            result = await aiService.chatBot(
              params.message,
              params.context,
              params.options
            );
            break;
          default:
            throw new Error(`不支?��?AI?��?類�?: ${type}`);
        }
        results.push({
          operation: type,
          status: 'success',
          data: result,
        });
      } catch (error) {
        results.push({
          operation: operation.type,
          status: 'error',
          error: error.message,
        });
      }
    }
    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: operations.length,
          successful: results.filter((r) => r.status === 'success').length,
          failed: results.filter((r) => r.status === 'error').length,
        },
      },
    });
  } catch (error) {
    logger.error('?��?AI?��?失�?:', error);
    res.status(500).json({
      success: false,
      error: '?��?AI?��?失�?',
      message: error.message,
    });
  }
});

/**
 * AI模�?Information
 */
router.get('/models', async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const models = [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: '快速�?經�??��?話模??,
        maxTokens: 4096,
        capabilities: ['chat', 'completion', 'analysis'],
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: '?�?�進�?語�?模�?',
        maxTokens: 8192,
        capabilities: ['chat', 'completion', 'analysis', 'reasoning'],
      },
      {
        id: 'text-davinci-003',
        name: 'Text Davinci 003',
        description: '強大?��??��??�模??,
        maxTokens: 4097,
        capabilities: ['completion', 'analysis'],
      },
    ];

    res.json({
      success: true,
      data: models,
    });
  } catch (error) {
    logger.error('?��?AI模�?信息失�?:', error);
    res.status(500).json({
      success: false,
      error: '?��?AI模�?信息失�?',
      message: error.message,
    });
  }
});

/**
 * AI?�能?�Table
 */
router.get('/features', async (req, res) => {
  try {
    const features = [
      {
        id: 'cardRecommendation',
        name: '?�能?��??�薦',
        description: '?�於?�戶?�好?��??�數?�推?�卡??,
        endpoint: '/api/ai/recommend/cards',
        method: 'POST',
      },
      {
        id: 'marketPrediction',
        name: '市場趨勢?�測',
        description: '?�測?��?市場?�格?�趨??,
        endpoint: '/api/ai/predict/market',
        method: 'POST',
      },
      {
        id: 'portfolioOptimization',
        name: '?��?組�??��?',
        description: '?��??��?組�??��?建議',
        endpoint: '/api/ai/optimize/portfolio',
        method: 'POST',
      },
      {
        id: 'intelligentSearch',
        name: '?�能?�索',
        description: '?�解?�戶?��??�智?��?�?,
        endpoint: '/api/ai/search/intelligent',
        method: 'POST',
      },
      {
        id: 'naturalLanguageProcessing',
        name: '?�然語�??��?',
        description: '?�本?��??�總結、�??��??��?',
        endpoint: '/api/ai/nlp/process',
        method: 'POST',
      },
      {
        id: 'smartNotifications',
        name: '?�能?�知',
        description: '?��??�性�??�智?�通知',
        endpoint: '/api/ai/notifications/smart',
        method: 'POST',
      },
      {
        id: 'chatBot',
        name: '?�天機器�?,
        description: '?�能對話?��?',
        endpoint: '/api/ai/chat',
        method: 'POST',
      },
    ];

    res.json({
      success: true,
      data: features,
    });
  } catch (error) {
    logger.error('?��?AI?�能?�表失�?:', error);
    res.status(500).json({
      success: false,
      error: '?��?AI?�能?�表失�?',
      message: error.message,
    });
  }
});

module.exports = router;