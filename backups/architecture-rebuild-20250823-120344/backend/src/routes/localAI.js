const express = require('express');
const router = express.Router();
const localAIService = require('../services/localAIService');
const { authenticateToken } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

// ?¥åº·æª¢æŸ¥
router.get('/health', async (req, res) => {
  try {
    const health = await localAIService.healthCheck();
    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error('AI?¥åº·æª¢æŸ¥?¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: 'AI?å??¥åº·æª¢æŸ¥å¤±æ?',
      error: error.message,
    });
  }
});

// ?²å??¯ç”¨?ä???router.get('/providers', authenticateToken, async (req, res) => {
  try {
    const providers = localAIService.getAvailableProviders();
    res.json({
      success: true,
      data: {
        providers,
        count: providers.length,
      },
    });
  } catch (error) {
    logger.error('?²å?AI?ä??†éŒ¯èª?', error);
    res.status(500).json({
      success: false,
      message: '?²å?AI?ä??†å¤±??,
      error: error.message,
    });
  }
});

// ?šç”¨?‡æœ¬?Ÿæ?
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, taskType = 'general', options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'è«‹æ?ä¾›æ?ç¤ºæ???,
      });
    }

// eslint-disable-next-line no-unused-vars
    const result = await localAIService.generateText(prompt, taskType, options);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('AI?‡æœ¬?Ÿæ??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: 'AI?‡æœ¬?Ÿæ?å¤±æ?',
      error: error.message,
    });
  }
});

// ?¡ç??†æ?
router.post('/analyze-card', authenticateToken, async (req, res) => {
  try {
    const { cardData, analysisType = 'investment' } = req.body;

    if (!cardData) {
      return res.status(400).json({
        success: false,
        message: 'è«‹æ?ä¾›å¡?‡æ•¸??,
      });
    }

// eslint-disable-next-line no-unused-vars
    const result = await localAIService.analyzeCard(cardData, analysisType);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?¡ç??†æ??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?¡ç??†æ?å¤±æ?',
      error: error.message,
    });
  }
});

// ?¹æ ¼?æ¸¬
router.post('/predict-price', authenticateToken, async (req, res) => {
  try {
    const { cardData, timeframe = '1m' } = req.body;

    if (!cardData) {
      return res.status(400).json({
        success: false,
        message: 'è«‹æ?ä¾›å¡?‡æ•¸??,
      });
    }

// eslint-disable-next-line no-unused-vars
    const result = await localAIService.predictPrice(cardData, timeframe);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?¹æ ¼?æ¸¬?¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?¹æ ¼?æ¸¬å¤±æ?',
      error: error.message,
    });
  }
});

// å¸‚å ´?†æ?
router.post('/analyze-market', authenticateToken, async (req, res) => {
  try {
    const { marketData } = req.body;

    if (!marketData) {
      return res.status(400).json({
        success: false,
        message: 'è«‹æ?ä¾›å??´æ•¸??,
      });
    }

// eslint-disable-next-line no-unused-vars
    const result = await localAIService.analyzeMarket(marketData);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('å¸‚å ´?†æ??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: 'å¸‚å ´?†æ?å¤±æ?',
      error: error.message,
    });
  }
});

// ?¹é??†æ?
router.post('/batch-analyze', authenticateToken, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'è«‹æ?ä¾›ä»»?™æ•¸çµ?,
      });
    }

// eslint-disable-next-line no-unused-vars
    const results = [];
// eslint-disable-next-line no-unused-vars
    const errors = [];

    for (const task of tasks) {
      try {
// eslint-disable-next-line no-unused-vars
        let result;
        switch (task.type) {
          case 'card_analysis':
            result = await localAIService.analyzeCard(
              task.data,
              task.analysisType
            );
            break;
          case 'price_prediction':
            result = await localAIService.predictPrice(
              task.data,
              task.timeframe
            );
            break;
          case 'market_analysis':
            result = await localAIService.analyzeMarket(task.data);
            break;
          case 'text_generation':
            result = await localAIService.generateText(
              task.prompt,
              task.taskType,
              task.options
            );
            break;
          default:
            throw new Error(`ä¸æ”¯?ç?ä»»å?é¡å?: ${task.type}`);
        }
        results.push({
          taskId: task.id,
          type: task.type,
          success: true,
          data: result,
        });
      } catch (error) {
        errors.push({
          taskId: task.id,
          type: task.type,
          success: false,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total: tasks.length,
          successful: results.length,
          failed: errors.length,
        },
      },
    });
  } catch (error) {
    logger.error('?¹é??†æ??¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: '?¹é??†æ?å¤±æ?',
      error: error.message,
    });
  }
});

// æ¸¬è©¦ç«¯é?
router.post('/test', authenticateToken, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const testPrompt = 'è«‹ç°¡?­ä?ç´¹ä?ä¸‹å¡?‡æ?è³‡ç??ºæœ¬æ¦‚å¿µ';

// eslint-disable-next-line no-unused-vars
    const result = await localAIService.generateText(
      testPrompt,
      'text_generation',
      {
        temperature: 0.7,
        maxTokens: 100,
      }
    );

    res.json({
      success: true,
      message: 'AI?å?æ¸¬è©¦?å?',
      data: result,
    });
  } catch (error) {
    logger.error('AI?å?æ¸¬è©¦?¯èª¤:', error);
    res.status(500).json({
      success: false,
      message: 'AI?å?æ¸¬è©¦å¤±æ?',
      error: error.message,
    });
  }
});

module.exports = router;
