const express = require('express');'
const router = express.Router();''
const localAIService = require('../services/localAIService');''
const { authenticateToken } = require('../middleware/auth');'
// eslint-disable-next-line no-unused-vars''
const logger = require('../utils/logger');'
// ?�康檢查''
router.get('/health', async (req, res) => {
  try {
    const health = await localAIService.healthCheck();
    res.json({
      success: true,
      data: health,
    });'
  } catch (error) {''
    logger.error('AI?�康檢查?�誤:', error);
    res.status(500).json({'
      success: false,''
      message: 'AI?��??�康檢查失�?',
      error: error.message,
    });'
  }
});''
// ?��??�用?��???router.get('/providers', authenticateToken, async (req, res) => {
  try {
    const providers = localAIService.getAvailableProviders();
    res.json({
      success: true,
      data: {
        providers,
        count: providers.length,
      },
    });'
  } catch (error) {''
    logger.error('?��?AI?��??�錯�?', error);
    res.status(500).json({'
      success: false,''
      message: '?��?AI?��??�失??,
      error: error.message,
    });
  }
});'
// ?�用?�本?��?''
router.post('/generate', authenticateToken, async (req, res) => {'
  try {''
    const { prompt, taskType = 'general', options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({'
        success: false,''
        message: '請�?供�?示�???,
      });
    }
// eslint-disable-next-line no-unused-vars
    const result = await localAIService.generateText(prompt, taskType, options);

    res.json({
      success: true,
      data: result,
    });'
  } catch (error) {''
    logger.error('AI?�本?��??�誤:', error);
    res.status(500).json({'
      success: false,''
      message: 'AI?�本?��?失�?',
      error: error.message,
    });
  }
});'
// ?��??��?''
router.post('/analyze-card', authenticateToken, async (req, res) => {'
  try {''
    const { cardData, analysisType = 'investment' } = req.body;

    if (!cardData) {
      return res.status(400).json({'
        success: false,''
        message: '請�?供卡?�數??,
      });
    }
// eslint-disable-next-line no-unused-vars
    const result = await localAIService.analyzeCard(cardData, analysisType);

    res.json({
      success: true,
      data: result,
    });'
  } catch (error) {''
    logger.error('?��??��??�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��?失�?',
      error: error.message,
    });
  }
});'
// ?�格?�測''
router.post('/predict-price', authenticateToken, async (req, res) => {'
  try {''
    const { cardData, timeframe = '1m' } = req.body;

    if (!cardData) {
      return res.status(400).json({'
        success: false,''
        message: '請�?供卡?�數??,
      });
    }
// eslint-disable-next-line no-unused-vars
    const result = await localAIService.predictPrice(cardData, timeframe);

    res.json({
      success: true,
      data: result,
    });'
  } catch (error) {''
    logger.error('?�格?�測?�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '?�格?�測失�?',
      error: error.message,
    });
  }
});'
// 市場?��?''
router.post('/analyze-market', authenticateToken, async (req, res) => {
  try {
    const { marketData } = req.body;

    if (!marketData) {
      return res.status(400).json({'
        success: false,''
        message: '請�?供�??�數??,
      });
    }
// eslint-disable-next-line no-unused-vars
    const result = await localAIService.analyzeMarket(marketData);

    res.json({
      success: true,
      data: result,
    });'
  } catch (error) {''
    logger.error('市場?��??�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '市場?��?失�?',
      error: error.message,
    });
  }
});'
// ?��??��?''
router.post('/batch-analyze', authenticateToken, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({'
        success: false,''
        message: '請�?供任?�數�?,
      });
    }
// eslint-disable-next-line no-unused-vars
    const results = [];
// eslint-disable-next-line no-unused-vars
    const errors = [];

    for (const task of tasks) {
      try {
// eslint-disable-next-line no-unused-vars
        let result;'
        switch (task.type) {''
          case 'card_analysis':
            result = await localAIService.analyzeCard(
              task.data,
              task.analysisType
            );'
            break;''
          case 'price_prediction':
            result = await localAIService.predictPrice(
              task.data,
              task.timeframe
            );'
            break;''
          case 'market_analysis':
            result = await localAIService.analyzeMarket(task.data);'
            break;''
          case 'text_generation':
            result = await localAIService.generateText(
              task.prompt,
              task.taskType,
              task.options
            );
            break;
          default:
            throw new Error(`不支?��?任�?類�?: ${task.type}`);
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
    });'
  } catch (error) {''
    logger.error('?��??��??�誤:', error);
    res.status(500).json({'
      success: false,''
      message: '?��??��?失�?',
      error: error.message,
    });
  }
});'
// 測試端�?''
router.post('/test', authenticateToken, async (req, res) => {
  try {'
// eslint-disable-next-line no-unused-vars''
    const testPrompt = '請簡?��?紹�?下卡?��?資�??�本概念';

// eslint-disable-next-line no-unused-vars
    const result = await localAIService.generateText('
      testPrompt,''
      'text_generation',
      {
        temperature: 0.7,
        maxTokens: 100,
      }
    );

    res.json({'
      success: true,''
      message: 'AI?��?測試?��?',
      data: result,
    });'
  } catch (error) {''
    logger.error('AI?��?測試?�誤:', error);
    res.status(500).json({'
      success: false,''
      message: 'AI?��?測試失�?',
      error: error.message,
    });
  }
});'
module.exports = router;''