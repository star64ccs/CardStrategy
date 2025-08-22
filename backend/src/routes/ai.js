const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const aiService = require('../services/aiService');
const { authenticateToken: protect } = require('../middleware/auth');

/**
 * ?ºèƒ½?¡ç??¨è–¦
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
    logger.error('?¡ç??¨è–¦å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?¡ç??¨è–¦å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * å¸‚å ´è¶¨å‹¢?æ¸¬
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
    logger.error('å¸‚å ´?æ¸¬å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: 'å¸‚å ´?æ¸¬å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * ?•è?çµ„å??ªå?
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
    logger.error('?•è?çµ„å??ªå?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?•è?çµ„å??ªå?å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * ?ºèƒ½?œç´¢
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
    logger.error('?ºèƒ½?œç´¢å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?ºèƒ½?œç´¢å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * ?ªç„¶èªè??•ç?
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
    logger.error('?ªç„¶èªè??•ç?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?ªç„¶èªè??•ç?å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * ?ºèƒ½?šçŸ¥
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
    logger.error('?ºèƒ½?šçŸ¥?Ÿæ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?ºèƒ½?šçŸ¥?Ÿæ?å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * ?Šå¤©æ©Ÿå™¨äº? */
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
    logger.error('?Šå¤©æ©Ÿå™¨äººå¤±??', error);
    res.status(500).json({
      success: false,
      error: '?Šå¤©æ©Ÿå™¨äººå¤±??,
      message: error.message,
    });
  }
});

/**
 * ?²å?AI?å??‡æ?
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = aiService.getMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('?²å?AI?‡æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å?AI?‡æ?å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * AI?å??¥åº·æª¢æŸ¥
 */
router.get('/health', async (req, res) => {
  try {
    const health = await aiService.healthCheck();

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error('AI?¥åº·æª¢æŸ¥å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: 'AI?¥åº·æª¢æŸ¥å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * ?´æ–°AI?ç½®
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
        message: 'AI?ç½®å·²æ›´??,
        config: aiService.getConfig(),
      },
    });
  } catch (error) {
    logger.error('?´æ–°AI?ç½®å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?´æ–°AI?ç½®å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * ?²å?AI?ç½®
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
    logger.error('?²å?AI?ç½®å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å?AI?ç½®å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * ?¹é?AI?ä?
 */
router.post('/batch', async (req, res) => {
  try {
    const { operations } = req.body;

    if (!Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: '?ä?å¿…é??¯æ•¸çµ?,
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
            throw new Error(`ä¸æ”¯?ç?AI?ä?é¡å?: ${type}`);
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
    logger.error('?¹é?AI?ä?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?¹é?AI?ä?å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * AIæ¨¡å?ä¿¡æ¯
 */
router.get('/models', async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const models = [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'å¿«é€Ÿä?ç¶“æ??„å?è©±æ¨¡??,
        maxTokens: 4096,
        capabilities: ['chat', 'completion', 'analysis'],
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: '?€?ˆé€²ç?èªè?æ¨¡å?',
        maxTokens: 8192,
        capabilities: ['chat', 'completion', 'analysis', 'reasoning'],
      },
      {
        id: 'text-davinci-003',
        name: 'Text Davinci 003',
        description: 'å¼·å¤§?„æ??¬ç??æ¨¡??,
        maxTokens: 4097,
        capabilities: ['completion', 'analysis'],
      },
    ];

    res.json({
      success: true,
      data: models,
    });
  } catch (error) {
    logger.error('?²å?AIæ¨¡å?ä¿¡æ¯å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å?AIæ¨¡å?ä¿¡æ¯å¤±æ?',
      message: error.message,
    });
  }
});

/**
 * AI?Ÿèƒ½?—è¡¨
 */
router.get('/features', async (req, res) => {
  try {
    const features = [
      {
        id: 'cardRecommendation',
        name: '?ºèƒ½?¡ç??¨è–¦',
        description: '?ºæ–¼?¨æˆ¶?å¥½?Œå??´æ•¸?šæ¨?¦å¡??,
        endpoint: '/api/ai/recommend/cards',
        method: 'POST',
      },
      {
        id: 'marketPrediction',
        name: 'å¸‚å ´è¶¨å‹¢?æ¸¬',
        description: '?æ¸¬?¡ç?å¸‚å ´?¹æ ¼?Œè¶¨??,
        endpoint: '/api/ai/predict/market',
        method: 'POST',
      },
      {
        id: 'portfolioOptimization',
        name: '?•è?çµ„å??ªå?',
        description: '?ä??•è?çµ„å??ªå?å»ºè­°',
        endpoint: '/api/ai/optimize/portfolio',
        method: 'POST',
      },
      {
        id: 'intelligentSearch',
        name: '?ºèƒ½?œç´¢',
        description: '?†è§£?¨æˆ¶?å??„æ™º?½æ?ç´?,
        endpoint: '/api/ai/search/intelligent',
        method: 'POST',
      },
      {
        id: 'naturalLanguageProcessing',
        name: '?ªç„¶èªè??•ç?',
        description: '?‡æœ¬?†æ??ç¸½çµã€æ??Ÿå??ç?',
        endpoint: '/api/ai/nlp/process',
        method: 'POST',
      },
      {
        id: 'smartNotifications',
        name: '?ºèƒ½?šçŸ¥',
        description: '?Ÿæ??‹æ€§å??„æ™º?½é€šçŸ¥',
        endpoint: '/api/ai/notifications/smart',
        method: 'POST',
      },
      {
        id: 'chatBot',
        name: '?Šå¤©æ©Ÿå™¨äº?,
        description: '?ºèƒ½å°è©±?©æ?',
        endpoint: '/api/ai/chat',
        method: 'POST',
      },
    ];

    res.json({
      success: true,
      data: features,
    });
  } catch (error) {
    logger.error('?²å?AI?Ÿèƒ½?—è¡¨å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å?AI?Ÿèƒ½?—è¡¨å¤±æ?',
      message: error.message,
    });
  }
});

module.exports = router;
